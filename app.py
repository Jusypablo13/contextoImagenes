"""
app.py — Contexto con Imágenes (CLIP Multilingüe + DINOv2)
==========================================================
Juego interactivo inspirado en Contexto.me construido sobre un espacio de embeddings
compartido (Imagen <-> Texto) y un espacio visual puro (Imagen <-> Imagen).

Cumple con todos los requisitos mínimos y los 3 extras:
- Requisito 1: Galería de 57 imágenes (>= 50) de un mismo tema (Gastronomía y Platillos)
  donde para ganar hay que describir detalles (ingredientes, vajilla, presentación) y
  cuyos embeddings se calculan UNA SOLA VEZ en `data/clip_image_embeddings.npy` y
  `data/dino_image_embeddings.npy`.
- Requisito 2: Al iniciar cada partida se elige al azar una imagen secreta y se guarda
  en el estado de sesión (`gr.State`) de cada jugador.
- Requisito 3: Por cada descripción, se calcula el embedding del texto, se mide la
  similitud coseno contra los 57 embeddings de imagen, se ordena de mayor a menor y
  se obtiene el lugar (#1 a #57) de la imagen secreta.
- Requisito 4: Historial de intentos ordenado por cercanía y declaración de victoria
  cuando la imagen secreta llega al lugar #1.
- Requisito 5: Interfaz gráfica en Gradio publicada con enlace público (`share=True`).
- Extra 1 (Pistas): Muestra al jugador las imágenes que SÍ corresponden mejor a su
  descripción (Top-5 de su consulta) y permite pedir pistas visuales de la secreta.
- Extra 2 (En español): Modelo multilingüe `sentence-transformers/clip-ViT-B-32-multilingual-v1`
  que proyecta descripciones en español al mismo espacio vectorial de 512 dimensiones de CLIP.
- Extra 3 (Modo inverso con DINOv2): Pestaña donde el jugador adivina subiendo o
  eligiendo fotos en lugar de escribir, comparando embeddings visuales con `facebook/dinov2-small`.
"""

import json
import random
from pathlib import Path

import gradio as gr
import numpy as np
import torch
from PIL import Image
from sentence_transformers import SentenceTransformer
from transformers import AutoImageProcessor, AutoModel

# ==============================================================================
# 1. Carga de Galería y Embeddings Precalculados (Calculados UNA SOLA VEZ)
# ==============================================================================
DATA_DIR = Path("data")
METADATA_PATH = DATA_DIR / "gallery_metadata.json"
CLIP_EMB_PATH = DATA_DIR / "clip_image_embeddings.npy"
DINO_EMB_PATH = DATA_DIR / "dino_image_embeddings.npy"

if not (METADATA_PATH.exists() and CLIP_EMB_PATH.exists() and DINO_EMB_PATH.exists()):
    raise RuntimeError(
        "No se encontraron los embeddings precalculados en 'data/'. "
        "Ejecuta primero: python build_gallery.py"
    )

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    GALLERY = json.load(f)

NUM_IMAGES = len(GALLERY)
# Matriz (N, 512) normalizada L2 con los embeddings de imagen de CLIP
CLIP_IMAGE_EMBEDDINGS = np.load(CLIP_EMB_PATH)
# Matriz (N, 384) normalizada L2 con los embeddings visuales de DINOv2
DINO_IMAGE_EMBEDDINGS = np.load(DINO_EMB_PATH)

DEVICE = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")

print(f"[Init] Cargando codificador de texto multilingüe en {DEVICE}...")
try:
    TEXT_MODEL = SentenceTransformer(
        "sentence-transformers/clip-ViT-B-32-multilingual-v1",
        device=DEVICE,
        local_files_only=True,
    )
except Exception:
    TEXT_MODEL = SentenceTransformer(
        "sentence-transformers/clip-ViT-B-32-multilingual-v1",
        device=DEVICE,
    )

print(f"[Init] Cargando modelo visual DINOv2 (facebook/dinov2-small) en {DEVICE}...")
try:
    DINO_PROCESSOR = AutoImageProcessor.from_pretrained("facebook/dinov2-small", local_files_only=True)
    DINO_MODEL = AutoModel.from_pretrained("facebook/dinov2-small", local_files_only=True).to(DEVICE)
except Exception:
    DINO_PROCESSOR = AutoImageProcessor.from_pretrained("facebook/dinov2-small")
    DINO_MODEL = AutoModel.from_pretrained("facebook/dinov2-small").to(DEVICE)
DINO_MODEL.eval()


# ==============================================================================
# 2. Funciones Matemáticas de Embeddings y Similitud Coseno
# ==============================================================================
def compute_text_ranking(description: str):
    """
    1. Calcula el embedding normalizado L2 del texto en español: t in R^512, ||t|| = 1.
    2. Como cada fila i de CLIP_IMAGE_EMBEDDINGS (v_i in R^512) ya tiene ||v_i|| = 1,
       la similitud coseno es exactamente el producto punto:
           cos(theta_i) = (v_i · t) / (||v_i|| ||t||) = v_i · t
    3. Ordena los índices de mayor a menor similitud coseno.
    """
    text_emb = TEXT_MODEL.encode(
        [description.strip()],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )[0]  # shape (512,)

    similarities = CLIP_IMAGE_EMBEDDINGS @ text_emb  # shape (N,)
    sorted_indices = np.argsort(-similarities).tolist()
    return sorted_indices, similarities


def compute_dino_image_ranking(uploaded_pil: Image.Image):
    """
    Extra 3 (Modo Inverso con DINOv2):
    1. Extrae el embedding visual (token CLS de la última capa) de la imagen subida
       usando `facebook/dinov2-small` y lo normaliza L2 (q in R^384, ||q|| = 1).
    2. Calcula la similitud coseno contra los 57 embeddings DINOv2 precalculados:
           sim_i = DINO_IMAGE_EMBEDDINGS[i] · q
    3. Ordena la galería de la más parecida a la menos parecida visualmente.
    """
    img_rgb = uploaded_pil.convert("RGB")
    with torch.no_grad():
        inputs = DINO_PROCESSOR(images=[img_rgb], return_tensors="pt").to(DEVICE)
        outputs = DINO_MODEL(**inputs)
        cls_emb = outputs.last_hidden_state[:, 0]
        cls_emb = torch.nn.functional.normalize(cls_emb, p=2, dim=-1)
        query_vec = cls_emb.cpu().numpy()[0]  # shape (384,)

    similarities = DINO_IMAGE_EMBEDDINGS @ query_vec  # shape (N,)
    sorted_indices = np.argsort(-similarities).tolist()
    return sorted_indices, similarities


# ==============================================================================
# 3. Gestión del Estado por Jugador (gr.State) y Formato Visual
# ==============================================================================
def create_new_game_state(previous_secret_idx=None):
    """Elige al azar una imagen secreta distinta de la anterior al iniciar cada partida."""
    candidates = [i for i in range(NUM_IMAGES) if i != previous_secret_idx]
    secret_idx = random.choice(candidates)
    return {
        "secret_idx": secret_idx,
        "history": [],  # Lista de dicts: {attempt, mode, query_label, rank, sim_secret, top1_title}
        "won": False,
        "hints_used": 0,
        "current_order": list(range(NUM_IMAGES)),
        "last_similarities": None,
    }


def temp_badge(rank: int) -> str:
    if rank == 1:
        return "👑 #1 ¡GANASTE!"
    if rank <= 5:
        return f"🔥 #{rank} (¡Quemando!)"
    if rank <= 15:
        return f"🌤️ #{rank} (Tibio)"
    return f"❄️ #{rank} (Frío)"


def build_gallery_items(order_indices, similarities=None, secret_idx=None, reveal_secret=False):
    """Construye la lista de tuplas (ruta_imagen, etiqueta) para gr.Gallery."""
    items = []
    for pos, idx in enumerate(order_indices, start=1):
        entry = GALLERY[idx]
        if similarities is not None:
            sim_val = float(similarities[idx])
            caption = f"#{pos} (cos={sim_val:.3f})"
        else:
            caption = f"Foto #{entry['id']}"

        if reveal_secret and idx == secret_idx:
            caption = f"👑 SECRETA • {caption} — {entry['title']}"
        items.append((entry["path"], caption))
    return items


def build_top_matches_items(order_indices, similarities, top_k=5):
    """Extra 1 (Pistas): Muestra qué imágenes SÍ correspondieron más a la descripción del jugador."""
    items = []
    for pos, idx in enumerate(order_indices[:top_k], start=1):
        entry = GALLERY[idx]
        sim_val = float(similarities[idx])
        caption = f"#{pos} para tu intento (cos={sim_val:.3f})"
        items.append((entry["path"], caption))
    return items


def format_history_table(history):
    """Ordena el historial por mejor posición alcanzada (#1 arriba)."""
    if not history:
        return []
    sorted_hist = sorted(history, key=lambda x: (x["rank"], -x["attempt"]))
    rows = []
    for item in sorted_hist:
        rows.append([
            f"#{item['attempt']}",
            item["mode"],
            item["query_label"],
            temp_badge(item["rank"]),
            f"{item['sim_secret']:.3f}",
        ])
    return rows


def build_status_banner(state, latest_entry=None, message_override=None):
    if message_override:
        return message_override

    if latest_entry is None:
        return (
            f"### 🎯 Partida activa — {NUM_IMAGES} platillos en la galería\n"
            "La computadora ya eligió **en secreto** una imagen al azar. "
            "Escribe una descripción detallada en español (o sube una foto en la pestaña **Modo Inverso DINOv2**) "
            "para ordenar la galería por similitud coseno y descubrir en qué lugar queda la secreta."
        )

    rank = latest_entry["rank"]
    sim_s = latest_entry["sim_secret"]
    best_rank = min(h["rank"] for h in state["history"])
    attempts = len(state["history"])

    if rank == 1:
        secret_info = GALLERY[state["secret_idx"]]
        return (
            f"## 🎉 ¡VICTORIA EN EL LUGAR #1! (Intento #{attempts})\n"
            f"¡Llevaste la imagen secreta al **Lugar #1** con similitud coseno **{sim_s:.3f}**!\n\n"
            f"**Imagen secreta descubierta:** *{secret_info['title']}*"
        )

    color_emoji = "🔥 **¡QUEMANDO!**" if rank <= 5 else ("🌤️ **¡TIBIO!**" if rank <= 15 else "❄️ **FRÍO**")
    return (
        f"### {color_emoji} — La imagen secreta quedó en el **Lugar #{rank}** de {NUM_IMAGES}\n"
        f"- **Tu entrada:** `{latest_entry['query_label']}`  |  **Similitud coseno con la secreta:** `{sim_s:.3f}`\n"
        f"- **Intentos:** `{attempts}`  |  **Mejor lugar alcanzado:** `#{best_rank}`\n"
        f"- 💡 *Observa abajo las **Pistas (Top 5 imágenes que sí coincidieron con tu intento)**: "
        f"solo {rank - 1} imagen(es) superaron a la secreta en este turno.*"
    )


# ==============================================================================
# 4. Callbacks de Interacción (Texto CLIP, Imagen DINOv2, Pistas y Nueva Partida)
# ==============================================================================
def on_submit_text(description: str, state: dict):
    if state is None:
        state = create_new_game_state()

    if not description or not description.strip():
        return (
            state,
            "",
            build_status_banner(state, message_override="⚠️ Escribe una descripción antes de evaluar."),
            format_history_table(state["history"]),
            build_gallery_items(state["current_order"], state["last_similarities"], state["secret_idx"], state["won"]),
            [],
            gr.update(visible=state["won"]),
        )

    sorted_indices, similarities = compute_text_ranking(description)
    secret_idx = state["secret_idx"]
    secret_rank = sorted_indices.index(secret_idx) + 1
    sim_secret = float(similarities[secret_idx])

    attempt_num = len(state["history"]) + 1
    entry = {
        "attempt": attempt_num,
        "mode": "📝 Texto (CLIP ES)",
        "query_label": description.strip(),
        "rank": secret_rank,
        "sim_secret": sim_secret,
    }
    state["history"].append(entry)
    state["current_order"] = sorted_indices
    state["last_similarities"] = similarities.tolist()

    if secret_rank == 1:
        state["won"] = True

    secret_reveal_update = (
        gr.update(
            value=GALLERY[secret_idx]["path"],
            label=f"👑 ¡GANASTE! Imagen Secreta (#1): {GALLERY[secret_idx]['title']}",
            visible=True,
        )
        if state["won"]
        else gr.update(visible=False)
    )

    return (
        state,
        "",
        build_status_banner(state, latest_entry=entry),
        format_history_table(state["history"]),
        build_gallery_items(sorted_indices, similarities, secret_idx, state["won"]),
        build_top_matches_items(sorted_indices, similarities, top_k=5),
        secret_reveal_update,
    )


def on_submit_dino_image(uploaded_img: Image.Image, state: dict):
    """Extra 3: El jugador adivina subiendo una foto y comparándola con DINOv2."""
    if state is None:
        state = create_new_game_state()

    if uploaded_img is None:
        return (
            state,
            build_status_banner(state, message_override="⚠️ Sube o selecciona una imagen para comparar con DINOv2."),
            format_history_table(state["history"]),
            build_gallery_items(state["current_order"], state["last_similarities"], state["secret_idx"], state["won"]),
            [],
            gr.update(visible=state["won"]),
        )

    sorted_indices, similarities = compute_dino_image_ranking(uploaded_img)
    secret_idx = state["secret_idx"]
    secret_rank = sorted_indices.index(secret_idx) + 1
    sim_secret = float(similarities[secret_idx])

    attempt_num = len(state["history"]) + 1
    top1_name = GALLERY[sorted_indices[0]]["filename"]
    entry = {
        "attempt": attempt_num,
        "mode": "🖼️ Foto (DINOv2)",
        "query_label": f"Imagen subida (~{top1_name})",
        "rank": secret_rank,
        "sim_secret": sim_secret,
    }
    state["history"].append(entry)
    state["current_order"] = sorted_indices
    state["last_similarities"] = similarities.tolist()

    if secret_rank == 1:
        state["won"] = True

    secret_reveal_update = (
        gr.update(
            value=GALLERY[secret_idx]["path"],
            label=f"👑 ¡GANASTE CON DINOV2! Imagen Secreta (#1): {GALLERY[secret_idx]['title']}",
            visible=True,
        )
        if state["won"]
        else gr.update(visible=False)
    )

    return (
        state,
        build_status_banner(state, latest_entry=entry),
        format_history_table(state["history"]),
        build_gallery_items(sorted_indices, similarities, secret_idx, state["won"]),
        build_top_matches_items(sorted_indices, similarities, top_k=5),
        secret_reveal_update,
    )


def on_request_hint(state: dict):
    """Da una pista progresiva o calcula una imagen vecina cercana en el espacio CLIP."""
    if state is None:
        state = create_new_game_state()

    state["hints_used"] += 1
    secret_idx = state["secret_idx"]
    secret_item = GALLERY[secret_idx]

    # Vecinos más cercanos de la imagen secreta en el espacio CLIP (Imagen <-> Imagen)
    secret_vec = CLIP_IMAGE_EMBEDDINGS[secret_idx]
    img_sims = CLIP_IMAGE_EMBEDDINGS @ secret_vec
    neighbor_indices = np.argsort(-img_sims).tolist()
    # El índice 0 es la misma imagen secreta (cos=1.0), así que el vecino #2 y #3 son pistas excelentes
    neighbor_2 = GALLERY[neighbor_indices[1]]
    neighbor_3 = GALLERY[neighbor_indices[2]]

    words = secret_item["title"].split()
    if state["hints_used"] == 1:
        hint_msg = (
            f"### 💡 Pista #1 (Vecindad en el espacio de Embeddings)\n"
            f"En el espacio vectorial de CLIP, los dos platillos más cercanos a la imagen secreta son:\n"
            f"- **{neighbor_2['title']}** (similitud `{img_sims[neighbor_indices[1]]:.3f}`)\n"
            f"- **{neighbor_3['title']}** (similitud `{img_sims[neighbor_indices[2]]:.3f}`)\n\n"
            f"*¡Describe ingredientes o características parecidas pero con otro detalle!*"
        )
    elif state["hints_used"] == 2:
        partial = " ".join(words[:3]) + " ..."
        hint_msg = (
            f"### 💡 Pista #2 (Inicio de la descripción)\n"
            f"La imagen secreta comienza con: **`{partial}`**"
        )
    else:
        hint_msg = (
            f"### 💡 Pista #3 (Descripción completa para llevarla al #1)\n"
            f"Prueba escribir detalles como: **`{secret_item['title']}`**"
        )

    return state, hint_msg


def on_give_up(state: dict):
    if state is None:
        state = create_new_game_state()
    state["won"] = True
    secret_idx = state["secret_idx"]
    secret_item = GALLERY[secret_idx]
    msg = (
        f"### 🔍 Te rendiste — La imagen secreta era:\n"
        f"**{secret_item['title']}** (Foto #{secret_item['id']}).\n"
        "Presiona **🎲 Nueva Partida (Elegir otra secreta al azar)** para volver a jugar."
    )
    return (
        state,
        msg,
        build_gallery_items(state["current_order"], state["last_similarities"], secret_idx, True),
        gr.update(
            value=secret_item["path"],
            label=f"🔍 Imagen Secreta Revelada: {secret_item['title']}",
            visible=True,
        ),
    )


def on_new_game(state: dict):
    prev_idx = state["secret_idx"] if state else None
    new_state = create_new_game_state(previous_secret_idx=prev_idx)
    return (
        new_state,
        "",
        build_status_banner(new_state),
        [],
        build_gallery_items(new_state["current_order"]),
        [],
        gr.update(value=None, visible=False),
    )


# ==============================================================================
# 5. Construcción de la Interfaz Gráfica con Gradio Blocks
# ==============================================================================
CUSTOM_CSS = """
.gradio-container { max-width: 1440px !important; }
.rank-banner {
    background: linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));
    border: 1px solid rgba(99,102,241,0.45);
    border-radius: 14px;
    padding: 16px 20px;
}
"""

with gr.Blocks(title="Contexto con Imágenes — CLIP + DINOv2") as demo:
    game_state = gr.State(create_new_game_state)

    gr.Markdown(
        f"""
        # 🍽️ Contexto con Imágenes — Espacio de Embeddings Compartido (CLIP + DINOv2)
        **Tema de la galería:** **{NUM_IMAGES} fotografías de Gastronomía y Platillos** (todos del mismo tema para que debas describir **detalles visuales**: ingredientes, colores, vajilla, corte o acompañamiento).
        1. **La computadora eligió en secreto una imagen al azar** de las {NUM_IMAGES} disponibles.
        2. **Escribe una descripción en español** (o **sube una foto** en el Modo Inverso con **DINOv2**).
        3. Calculamos la **similitud coseno** contra los embeddings precalculados, ordenamos la galería del **#1 al #{NUM_IMAGES}** y te decimos en qué lugar quedó la imagen secreta. **¡Ganas al llevarla al Lugar #1!**
        """
    )

    with gr.Row():
        # Columna Izquierda: Controles de Juego, Pistas e Historial
        with gr.Column(scale=5):
            status_md = gr.Markdown(
                value=build_status_banner(create_new_game_state()),
                elem_classes=["rank-banner"],
            )

            secret_reveal_img = gr.Image(
                label="👑 Imagen Secreta",
                visible=False,
                height=240,
                interactive=False,
            )

            with gr.Tabs():
                # Pestaña 1: Juego Principal por Texto en Español (CLIP Multilingüe)
                with gr.TabItem("📝 1. Adivinar con Texto en Español (CLIP Multilingüe)"):
                    with gr.Row():
                        text_input = gr.Textbox(
                            label="Describe los detalles visuales de la imagen secreta (en español o inglés)",
                            placeholder="Ej: 'tacos con piña y cilantro', 'tazón de sopa naranja con semillas', 'cono de helado rosa en la mano'...",
                            scale=4,
                        )
                        btn_eval_text = gr.Button("🚀 Evaluar Descripción", variant="primary", scale=1)

                    gr.Examples(
                        examples=[
                            ["tacos al pastor con piña y cilantro en tortilla"],
                            ["pizza roja con hojas de albahaca fresca y queso mozzarella"],
                            ["tazón de ramen japonés con huevo partido y palillos"],
                            ["torre de hotcakes con miel y frutos rojos"],
                            ["vaso de cristal con limonada fría hielo y hojas de menta"],
                            ["tabla de quesos con uvas nueces y carnes frías"],
                        ],
                        inputs=text_input,
                        label="Ejemplos rápidos (haz clic para probar):",
                    )

                # Pestaña 2 (Extra 3): Modo Inverso subiendo Fotos con DINOv2
                with gr.TabItem("📸 2. Modo Inverso con Fotos (Facebook DINOv2)"):
                    gr.Markdown(
                        "**Extra 3 — Modo Inverso con `facebook/dinov2-small`:** "
                        "En lugar de escribir, sube cualquier foto de comida (o arrastra una imagen de la galería) "
                        "para comparar sus **embeddings puramente visuales (CLS token de 384 dimensiones)** mediante similitud coseno."
                    )
                    dino_image_input = gr.Image(
                        type="pil",
                        label="Sube o arrastra una foto para buscar por similitud visual DINOv2",
                        height=220,
                    )
                    btn_eval_dino = gr.Button("🔍 Evaluar Foto con DINOv2", variant="primary")

                # Pestaña 3: Explicación Matemática para la Demostración con el Profesor
                with gr.TabItem("🎓 3. Explicación Teórica (Cómo funciona)"):
                    gr.Markdown(
                        r"""
                        ### 🧠 ¿Cómo se calcula el lugar de la imagen secreta y por qué funciona?

                        #### 1. Pre-cálculo de los Embeddings de la Galería (Una sola vez)
                        - Reunimos $N = 57$ imágenes del mismo dominio (*Gastronomía*).
                        - Antes de iniciar el servidor (`build_gallery.py`), pasamos cada imagen $I_i$ por el codificador visual **Vision Transformer (`clip-ViT-B-32`)**, obteniendo un vector $v_i \in \mathbb{R}^{512}$.
                        - Normalizamos cada vector con norma $L_2$ para que viva en la hiperesfera unitaria:
                          $$\hat{v}_i = \frac{v_i}{\|v_i\|_2}, \quad \|\hat{v}_i\|_2 = 1$$
                        - Guardamos la matriz $V \in \mathbb{R}^{57 \times 512}$ en disco (`data/clip_image_embeddings.npy`). Así **no recalculamos embeddings de imágenes en cada turno**.

                        #### 2. Espacio Compartido Multimodal y Multilingüe (Extra 2: Español)
                        - Cuando el jugador escribe una descripción $T$ en español, el modelo **`clip-ViT-B-32-multilingual-v1`** (entrenado mediante *Knowledge Distillation* multilingüe sobre CLIP) proyecta el texto al **mismo espacio vectorial de 512 dimensiones**:
                          $$\hat{t} = \frac{f_{\text{texto}}(T)}{\|f_{\text{texto}}(T)\|_2} \in \mathbb{R}^{512}$$
                        - Como CLIP fue entrenado con **aprendizaje contrastivo (InfoNCE)** sobre 400 millones de pares `(imagen, texto)`, las imágenes y las descripciones que comparten significado semántico quedan con un ángulo pequeño entre sus vectores.

                        #### 3. Similitud Coseno y Cálculo de la Posición (Ranking)
                        - Calculamos la **similitud coseno** entre la descripción $\hat{t}$ y las 57 imágenes de un solo golpe matricial:
                          $$s_i = \cos(\theta_i) = \frac{\hat{v}_i \cdot \hat{t}}{\|\hat{v}_i\|_2 \|\hat{t}\|_2} = \hat{v}_i \cdot \hat{t}$$
                        - Ordenamos las 57 imágenes de mayor a menor similitud ($s_{(1)} \ge s_{(2)} \ge \dots \ge s_{(57)}$) usando `np.argsort(-similarities)`.
                        - **El lugar de la imagen secreta** $i^*$ es simplemente su índice $1$-based dentro del arreglo ordenado (`sorted_indices.index(secret_idx) + 1`). Cuando ninguna otra imagen tiene mayor similitud coseno con el texto que la secreta ($s_{i^*} = \max_i s_i$), queda en el **Lugar #1** y el jugador gana.

                        #### 4. Modo Inverso con DINOv2 (Extra 3)
                        - En el modo inverso usamos **`facebook/dinov2-small`**, un Vision Transformer auto-supervisado (*self-supervised*) que produce embeddings visuales de 384 dimensiones ($\hat{d}_i \in \mathbb{R}^{384}$) sumamente sensibles a composición, textura, forma e iluminación sin depender de etiquetas de texto.
                        """
                    )

            with gr.Row():
                btn_hint = gr.Button("💡 Pedir Pista Semántica", variant="secondary")
                btn_give_up = gr.Button("🏳️ Rendirse y Revelar Secreta", variant="stop")
                btn_new_game = gr.Button("🎲 Nueva Partida (Elegir otra al azar)", variant="secondary")

            gr.Markdown("### 📊 Historial de Intentos (Ordenado por mejor posición)")
            history_table = gr.Dataframe(
                headers=["Intento", "Modo", "Descripción / Entrada", "Lugar de la Secreta", "Similitud Coseno"],
                datatype=["str", "str", "str", "str", "str"],
                interactive=False,
                wrap=True,
            )

        # Columna Derecha: Pistas Visuales (Extra 1) y Galería Completa Ordenada
        with gr.Column(scale=7):
            gr.Markdown(
                "### 🎯 Extra 1 — Pistas Visuales: ¿Qué imágenes SÍ correspondieron más a tu último intento? (Top 5)"
            )
            top_matches_gallery = gr.Gallery(
                label="Top 5 imágenes más cercanas a tu última descripción/foto",
                columns=5,
                height=190,
                object_fit="cover",
                allow_preview=True,
            )

            gr.Markdown(
                f"### 🖼️ Galería Completa ({NUM_IMAGES} imágenes ordenadas de mayor a menor similitud coseno)"
            )
            full_gallery = gr.Gallery(
                value=build_gallery_items(list(range(NUM_IMAGES))),
                label=f"Galería de {NUM_IMAGES} platillos (se reordena del #1 al #{NUM_IMAGES} en cada intento)",
                columns=5,
                height=560,
                object_fit="cover",
                allow_preview=True,
            )

    # Conexión de Eventos
    text_input.submit(
        fn=on_submit_text,
        inputs=[text_input, game_state],
        outputs=[
            game_state,
            text_input,
            status_md,
            history_table,
            full_gallery,
            top_matches_gallery,
            secret_reveal_img,
        ],
    )

    btn_eval_text.click(
        fn=on_submit_text,
        inputs=[text_input, game_state],
        outputs=[
            game_state,
            text_input,
            status_md,
            history_table,
            full_gallery,
            top_matches_gallery,
            secret_reveal_img,
        ],
    )

    btn_eval_dino.click(
        fn=on_submit_dino_image,
        inputs=[dino_image_input, game_state],
        outputs=[
            game_state,
            status_md,
            history_table,
            full_gallery,
            top_matches_gallery,
            secret_reveal_img,
        ],
    )

    btn_hint.click(
        fn=on_request_hint,
        inputs=[game_state],
        outputs=[game_state, status_md],
    )

    btn_give_up.click(
        fn=on_give_up,
        inputs=[game_state],
        outputs=[game_state, status_md, full_gallery, secret_reveal_img],
    )

    btn_new_game.click(
        fn=on_new_game,
        inputs=[game_state],
        outputs=[
            game_state,
            text_input,
            status_md,
            history_table,
            full_gallery,
            top_matches_gallery,
            secret_reveal_img,
        ],
    )


if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True,
        css=CUSTOM_CSS,
    )
