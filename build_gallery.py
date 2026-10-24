"""
build_gallery.py
----------------
1. Reúne una galería de al menos 50 imágenes de un mismo tema ("Gastronomía y Platillos"),
   donde cada imagen tiene detalles visuales particulares (ingredientes, vajilla,
   colores, presentación, acompañamiento) para que el jugador deba describir detalles
   específicos y no solo el objeto general.
2. Calcula UNA SOLA VEZ los embeddings de todas las imágenes y los guarda en disco:
   - Embeddings multimodales (CLIP base `clip-ViT-B-32` alineado con `clip-ViT-B-32-multilingual-v1` en español)
   - Embeddings puramente visuales con `facebook/dinov2-small` para el Modo Inverso.
"""

import json
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

import numpy as np
import requests
import torch
from PIL import Image
from sentence_transformers import SentenceTransformer
from transformers import AutoImageProcessor, AutoModel

GALLERY_DIR = Path("gallery_images")
DATA_DIR = Path("data")
GALLERY_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# 60 candidatas del mismo tema (Gastronomía, Platillos y Bebidas) para asegurar >= 52 imágenes válidas
CANDIDATE_DISHES = [
    ("tacos_pastor_pina.jpg", "Tacos al pastor con piña, cilantro y cebolla en tortilla de maíz", "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=640&q=80"),
    ("tacos_crujientes_limon.jpg", "Tacos dorados crujientes con rodajas de limón verde y salsa roja", "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=640&q=80"),
    ("guacamole_totopos.jpg", "Tazón de guacamole verde con aguacate, jitomate y totopos de maíz", "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=640&q=80"),
    ("nachos_queso_jalapeno.jpg", "Nachos cubiertos de queso amarillo derretido, rodajas de jalapeño y crema", "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=640&q=80"),
    ("burrito_partido_mitad.jpg", "Burrito grande envuelto en tortilla de harina partido a la mitad con arroz y frijoles", "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=640&q=80"),
    ("quesadillas_salsa_verde.jpg", "Quesadillas doradas con queso derretido y guacamole en plato rústico", "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=640&q=80"),
    ("pizza_margarita_albahaca.jpg", "Pizza napolitana con salsa de tomate roja, mozzarella blanca y hojas de albahaca fresca", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640&q=80"),
    ("pizza_pepperoni_rebanada.jpg", "Pizza de pepperoni dorada con bordes crujientes sobre tabla de madera", "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=640&q=80"),
    ("hamburguesa_doble_papas.jpg", "Hamburguesa con queso cheddar, lechuga, jitomate y papas fritas a un lado", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&q=80"),
    ("hamburguesa_gourmet_tocino.jpg", "Hamburguesa alta en pan brioche brillante sobre tabla oscura con tocino", "https://images.unsplash.com/photo-1550547660-d9450f859349?w=640&q=80"),
    ("ramen_huevo_palillos.jpg", "Tazón de ramen japonés con huevo cocido partido, fideos, carne y palillos", "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=640&q=80"),
    ("sushi_nigiri_salmon.jpg", "Bandeja de sushi nigiri y rollos maki con salmón naranja brillante", "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=640&q=80"),
    ("sushi_rollos_ajonjoli.jpg", "Rollos de sushi cortados con aguacate, semillas de ajonjolí y salsa de soya", "https://images.unsplash.com/photo-1553621042-f6e147245754?w=640&q=80"),
    ("espagueti_salsa_tomate.jpg", "Plato blanco de espagueti italiano con salsa roja de tomate y hojas de albahaca", "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=640&q=80"),
    ("pasta_fettuccine_camarones.jpg", "Pasta italiana en plato hondo con camarones, perejil y salsa cremosa", "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=640&q=80"),
    ("lasana_horneada_queso.jpg", "Porción cuadrada de lasaña horneada con capas de pasta, carne y queso gratinado", "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=640&q=80"),
    ("paella_mariscos_camarones.jpg", "Paella española de arroz amarillo en sartén con camarones y mejillones", "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=640&q=80"),
    ("filete_res_romero.jpg", "Corte de carne de res asada a la parrilla en rebanadas con ramita de romero", "https://images.unsplash.com/photo-1544025162-d76694265947?w=640&q=80"),
    ("costillas_bbq_parrilla.jpg", "Costillas de cerdo bañadas en salsa barbacoa brillante a la parrilla", "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=640&q=80"),
    ("pollo_asado_limon.jpg", "Pollo rostizado dorado entero en charola con rodajas de limón y hierbas", "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=640&q=80"),
    ("alitas_picantes_ajonjoli.jpg", "Alitas de pollo glaseadas con salsa picante roja y semillas de ajonjolí blanco", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=640&q=80"),
    ("salmon_parrilla_esparragos.jpg", "Filete de salmón rosado a la plancha con espárragos verdes y limón", "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=640&q=80"),
    ("camarones_ajillo_sarten.jpg", "Camarones salteados con ajo, perejil y limón en sartén oscuro", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=640&q=80"),
    ("ensalada_cesar_aguacate.jpg", "Ensalada fresca con hojas verdes, jitomates cherry, aguacate y aderezo", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80"),
    ("ensalada_griega_feta.jpg", "Ensalada mediterránea con cubos de queso feta blanco, aceitunas negras y pepino", "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640&q=80"),
    ("sopa_calabaza_crema.jpg", "Sopa crema de calabaza color naranja en tazón con semillas y pan tostado", "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=640&q=80"),
    ("pan_aguacate_huevo_pochado.jpg", "Tostada de pan con aguacate machacado y huevo pochado encima", "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=640&q=80"),
    ("hotcakes_miel_frutos_rojos.jpg", "Torre de hotcakes esponjosos bañados en miel de maple con moras y fresas", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=640&q=80"),
    ("waffles_fresas_crema.jpg", "Waffles belgas crujientes con fresas rojas rebanadas y azúcar glass", "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=640&q=80"),
    ("croissant_cafe_mesa.jpg", "Croissants dorados de mantequilla junto a una taza de café en mesa de madera", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=640&q=80"),
    ("taza_cafe_latte_corazon.jpg", "Taza de café caliente vista desde arriba con figura de corazón en la espuma de leche", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=640&q=80"),
    ("te_matcha_verde.jpg", "Taza de té matcha verde brillante espumoso preparado al estilo japonés", "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=640&q=80"),
    ("smoothie_bowl_frutas_coco.jpg", "Tazón de smoothie morado de açaí decorado con rebanadas de plátano, fresas y semillas", "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=640&q=80"),
    ("cono_helado_fresa.jpg", "Cono de galleta barquillo sosteniendo una bola de helado rosa en la mano", "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=640&q=80"),
    ("bolas_helado_chocolate.jpg", "Bolas de helado de chocolate oscuro con chispas y salsa de cacao en tazón", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=640&q=80"),
    ("pastel_chocolate_cereza.jpg", "Rebanada de pastel de chocolate oscuro de varias capas con glaseado cremoso", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&q=80"),
    ("cheesecake_frutos_rojos.jpg", "Rebanada de pay de queso blanco cheesecake cubierto con mermelada y frambuesas rojas", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=640&q=80"),
    ("donas_glaseado_rosa_chispas.jpg", "Donas redondas con glaseado rosa y azul cubiertas de chispas de colores", "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=640&q=80"),
    ("macarons_franceses_pastel.jpg", "Macarons franceses de colores pastel apilados con relleno dulce", "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=640&q=80"),
    ("churros_azucar_chocolate.jpg", "Churros crujientes espolvoreados con azúcar y canela junto a taza de chocolate espeso", "https://images.unsplash.com/photo-1624371414361-e670edf4898d?w=640&q=80"),
    ("galletas_chispas_chocolate.jpg", "Galletas horneadas con chispas de chocolate apiladas sobre superficie rústica", "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=640&q=80"),
    ("cupcakes_betun_colores.jpg", "Cupcakes decorados con alto betún de crema batida rosa y chispas dulces", "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=640&q=80"),
    ("tabla_quesos_uvas_vino.jpg", "Tabla de charcutería con quesos variados, uvas, carnes frías, nueces y galletas", "https://images.unsplash.com/photo-1541529086526-db283c563270?w=640&q=80"),
    ("papas_fritas_catsup.jpg", "Papas a la francesa doradas y crujientes con un recipiente de salsa cátsup roja", "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=640&q=80"),
    ("hotdog_mostaza_salchicha.jpg", "Hot dog perro caliente en pan alargado con salchicha y línea de mostaza amarilla", "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=640&q=80"),
    ("sandwich_club_triple.jpg", "Sándwich club partido en triángulos con jamón, queso, lechuga y jitomate", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=640&q=80"),
    ("poke_bowl_atun_aguacate.jpg", "Poke bowl hawaiano con cubos de atún fresco, aguacate, edamames, arroz y ajonjolí", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=640&q=80"),
    ("curry_indio_arroz_naan.jpg", "Curry especiado en salsa naranja con arroz blanco basmati y pan naan", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=640&q=80"),
    ("dumplings_vaporera_bambu.jpg", "Dumplings orientales blancos al vapor servidos dentro de canasta de bambú con salsa", "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=640&q=80"),
    ("pad_thai_camaron_cacahuate.jpg", "Fideos salteados Pad Thai en plato con camarones, limón verde y cacahuate picado", "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=640&q=80"),
    ("limonada_menta_hielo.jpg", "Vaso de cristal con limonada fría, cubos de hielo, rodajas de limón y hojas de menta", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=640&q=80"),
    ("malteada_fresa_crema_batida.jpg", "Malteada rosa en vaso alto con crema batida, popote y jarabe dulce", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=640&q=80"),
    ("coctel_naranja_copa.jpg", "Cóctel refrescante color naranja con hielo y rodaja de cítrico en copa de vidrio", "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=640&q=80"),
    ("canasta_frutas_fresas_uvas.jpg", "Plato colorido de frutas frescas cortadas con fresas, kiwi verde, arándanos y naranja", "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=640&q=80"),
    ("huevos_estrellados_tocino.jpg", "Desayuno de huevos estrellados con yema amarilla, tiras de tocino crujiente y pan", "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=640&q=80"),
    ("tiramisu_cacao_italiano.jpg", "Postre tiramisú italiano espolvoreado con cacao en polvo oscuro y capas de crema", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=640&q=80"),
    ("brochetas_carne_verduras.jpg", "Brochetas asadas a la parrilla con trozos de carne, pimientos de colores y cebolla", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=640&q=80"),
    ("avena_frutas_semillas.jpg", "Tazón de avena caliente con rodajas de plátano, arándanos azules y semillas de chía", "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=640&q=80"),
]


def download_single_image(item):
    filename, title, url = item
    filepath = GALLERY_DIR / filename
    if filepath.exists() and filepath.stat().st_size > 1000:
        return {"filename": filename, "path": str(filepath), "title": title, "url": url}

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content)).convert("RGB")
        img.thumbnail((512, 512), Image.Resampling.LANCZOS)
        img.save(filepath, format="JPEG", quality=85)
        return {"filename": filename, "path": str(filepath), "title": title, "url": url}
    except Exception as e:
        print(f"   [Aviso] Omitiendo {filename}: {e}")
        return None


def main():
    print(f"1. Descargando / verificando imágenes temáticas en '{GALLERY_DIR}/'...")
    with ThreadPoolExecutor(max_workers=8) as pool:
        raw_results = list(pool.map(download_single_image, CANDIDATE_DISHES))

    results = []
    for idx, r in enumerate([x for x in raw_results if x is not None], start=1):
        r["id"] = idx
        results.append(r)

    print(f"   -> {len(results)} imágenes válidas listas (requisito mínimo: >= 50).")
    assert len(results) >= 50, f"Se requieren al menos 50 imágenes, solo se obtuvieron {len(results)}"

    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"2. Usando dispositivo de aceleración: {device}")

    pil_images = [Image.open(r["path"]).convert("RGB") for r in results]

    print("3. Calculando embeddings de imagen con CLIP (clip-ViT-B-32)...")
    img_clip_model = SentenceTransformer("clip-ViT-B-32", device=device)
    clip_image_embeddings = img_clip_model.encode(
        pil_images,
        batch_size=16,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True,
    )
    print(f"   -> Matriz CLIP de imágenes: shape={clip_image_embeddings.shape} (L2 normalizada)")

    print("4. Calculando embeddings de imagen con DINOv2 (facebook/dinov2-small) para el Modo Inverso...")
    dino_processor = AutoImageProcessor.from_pretrained("facebook/dinov2-small")
    dino_model = AutoModel.from_pretrained("facebook/dinov2-small").to(device)
    dino_model.eval()

    dino_vecs = []
    batch_size = 16
    with torch.no_grad():
        for i in range(0, len(pil_images), batch_size):
            batch_imgs = pil_images[i : i + batch_size]
            inputs = dino_processor(images=batch_imgs, return_tensors="pt").to(device)
            outputs = dino_model(**inputs)
            cls_emb = outputs.last_hidden_state[:, 0]
            cls_emb = torch.nn.functional.normalize(cls_emb, p=2, dim=-1)
            dino_vecs.append(cls_emb.cpu().numpy())

    dino_image_embeddings = np.vstack(dino_vecs)
    print(f"   -> Matriz DINOv2 de imágenes: shape={dino_image_embeddings.shape} (L2 normalizada)")

    print("5. Verificando modelo de texto multilingüe en español (sentence-transformers/clip-ViT-B-32-multilingual-v1)...")
    text_model = SentenceTransformer("sentence-transformers/clip-ViT-B-32-multilingual-v1", device=device)
    test_vec = text_model.encode(["tacos al pastor con piña"], convert_to_numpy=True, normalize_embeddings=True)
    sims = (clip_image_embeddings @ test_vec.T).squeeze()
    top_idx = int(np.argmax(sims))
    print(f"   -> Prueba en español 'tacos al pastor con piña' -> #1 en la galería: {results[top_idx]['title']} (cos={sims[top_idx]:.3f})")

    metadata_path = DATA_DIR / "gallery_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    np.save(DATA_DIR / "clip_image_embeddings.npy", clip_image_embeddings)
    np.save(DATA_DIR / "dino_image_embeddings.npy", dino_image_embeddings)
    print("6. ¡Embeddings y galería guardados exitosamente en 'data/' y 'gallery_images/'!")


if __name__ == "__main__":
    main()
