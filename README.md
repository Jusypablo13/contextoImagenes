# 🍽️ Contexto Visual con Embeddings Multimodales

Juego interactivo de deducción semántica inspirado en **Contexto.me**. La aplicación selecciona en secreto una imagen de una galería temática gastronómica y el usuario debe ingresar descripciones textuales en español (o imágenes de referencia) para que, mediante similitud de representaciones vectoriales (*embeddings*), logre posicionar la imagen secreta en el **Lugar #1**.

---

## 🎯 Propósito del Proyecto

El objetivo principal es demostrar la aplicación práctica del **aprendizaje contrastivo y multimodal** (*Vision-Language Models*):
- Proyectar conceptos visuales y textos en un **mismo espacio vectorial latente**.
- Evaluar la cercanía semántica entre lo que el usuario describe y lo que cada imagen contiene mediante **similitud coseno**.
- Ofrecer una experiencia lúdica donde el usuario aprende a refinar descripciones detalladas para guiar la búsqueda de la imagen objetivo.

---

## ⚙️ ¿Cómo Funciona?

1. **Pre-cálculo de Embeddings (Offline):**  
   Las imágenes de la galería temática se procesan una sola vez a través de modelos de visión para extraer sus representaciones vectoriales y normalizarlas ($L_2$). Los vectores resultantes se almacenan localmente en matrices NumPy (`.npy`).
2. **Selección Secreta:**  
   Al iniciar una partida, se selecciona aleatoriamente una imagen de la galería como el objetivo secreto.
3. **Inferencia en Cada Intento:**  
   - El usuario ingresa una frase descriptiva en español (ej. *"tacos al pastor con piña"*).
   - El texto se convierte en un vector de características mediante un modelo multilingüe alineado.
4. **Cálculo de Similitud y Ranking:**  
   - Se calcula la **similitud coseno** (producto punto entre vectores normalizados) entre la descripción del usuario y cada una de las imágenes de la galería.
   - Se ordenan todas las imágenes de mayor a menor similitud.
   - La posición obtenida por la imagen secreta en ese ordenamiento indica qué tan cerca estuvo la descripción.
5. **Condición de Victoria:**  
   Cuando la descripción del usuario hace que la imagen secreta obtenga la mayor similitud de toda la galería (**Posición #1**), se revela la imagen y se concluye la partida.

---

## 🛠️ Stack Tecnológico

| Capa / Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Modelos Multimodales** | `clip-ViT-B-32-multilingual-v1` (Sentence Transformers) | Generación de embeddings de texto en español alineados al espacio visual de CLIP. |
| **Modelos de Visión** | `openai/clip-vit-base-patch32` & `facebook/dinov2-small` | Extracción de embeddings visuales y soporte para búsqueda por similitud visual pura. |
| **Deep Learning & Álgebra** | `PyTorch`, `Transformers`, `NumPy` | Inferencia de modelos, manipulación de matrices y cálculo de similitud coseno. |
| **Backend & Servidor** | `Python 3.10+` | Lógica del juego, precálculo de vectores y servicio de endpoints. |
| **Interfaz Interactiva** | `Gradio` / `HTML5`, `CSS3 (Vanilla)`, `JavaScript` | Interfaz gráfica amigable para el jugador con historial de intentos, pistas visuales y tablero de posiciones. |

---

## 🚀 Instalación y Uso

### 1. Clonar el repositorio y configurar el entorno virtual
```bash
python3 -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Generar galería y calcular embeddings (una sola vez)
```bash
python build_gallery.py
```

### 3. Ejecutar la aplicación
```bash
python app.py
```
Abre en tu navegador la dirección indicada en la terminal (por defecto [http://localhost:7860](http://localhost:7860)).

---

## 🌐 Demo en Línea
Puedes probar la aplicación directamente sin instalar nada a través del siguiente enlace público:
- **Enlace público (Gradio Live):** [https://18fead8c636c438252.gradio.live/](https://18fead8c636c438252.gradio.live/)

