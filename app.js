/**
 * Contexto Visual — Juego de Contexto con Imágenes
 *
 * 1. La computadora elige en secreto una imagen de la galería (30 imágenes).
 * 2. El jugador escribe descripciones; el motor semántico ordena las 30 imágenes
 *    por similitud con la descripción y muestra en qué lugar (#1..#30) quedó la secreta.
 * 3. Gana quien lleve la imagen secreta al lugar #1.
 */

const GALLERY_IMAGES = [
  {
    id: 1,
    title: "Cumbres Alpinas al Amanecer",
    category: "Naturaleza y Paisajes",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80",
    description: "Picos de montañas rocosas cubiertos de nieve y niebla bajo la luz dorada del amanecer.",
    tags: ["montaña", "nieve", "alpes", "cumbre", "amanecer", "roca", "frio", "naturaleza", "cielo"],
    semantic: {
      naturaleza: 1.0, agua: 0.2, cielo: 0.85, ciudad: 0.0, interior: 0.0,
      noche: 0.1, dia: 0.9, calido: 0.3, frio: 0.95, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.2, velocidad: 0.0, antiguo: 0.2,
      verde: 0.3, azul: 0.6, rojo_naranja: 0.5, montaña: 1.0
    }
  },
  {
    id: 2,
    title: "Callejón Cyberpunk de Neón",
    category: "Urbano y Futuro",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80",
    description: "Calle nocturna en Tokio iluminada por letreros de neón brillantes reflejados en el asfalto mojado por la lluvia.",
    tags: ["ciudad", "noche", "neon", "lluvia", "tokio", "japon", "luces", "cyberpunk", "calle", "futuro"],
    semantic: {
      naturaleza: 0.0, agua: 0.35, cielo: 0.1, ciudad: 1.0, interior: 0.1,
      noche: 1.0, dia: 0.0, calido: 0.4, frio: 0.5, animales: 0.0,
      comida: 0.15, tecnologia: 0.85, arte: 0.6, velocidad: 0.3, antiguo: 0.0,
      verde: 0.1, azul: 0.8, rojo_naranja: 0.8, montaña: 0.0
    }
  },
  {
    id: 3,
    title: "Tortuga Marina en el Arrecife",
    category: "Fauna y Océano",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80",
    description: "Tortuga nadando tranquilamente bajo el agua azul turquesa cerca de un arrecife de coral.",
    tags: ["tortuga", "mar", "oceano", "agua", "animal", "nadar", "arrecife", "coral", "submarino", "azul"],
    semantic: {
      naturaleza: 0.95, agua: 1.0, cielo: 0.0, ciudad: 0.0, interior: 0.0,
      noche: 0.0, dia: 0.85, calido: 0.6, frio: 0.4, animales: 1.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.1, velocidad: 0.1, antiguo: 0.1,
      verde: 0.4, azul: 1.0, rojo_naranja: 0.1, montaña: 0.0
    }
  },
  {
    id: 4,
    title: "Café Latte y Croissant",
    category: "Gastronomía",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80",
    description: "Taza de café caliente con arte latte sobre una mesa de madera acompañada de desayuno.",
    tags: ["cafe", "taza", "desayuno", "comida", "bebida", "mesa", "madera", "caliente", "cafeteria", "pan"],
    semantic: {
      naturaleza: 0.0, agua: 0.2, cielo: 0.0, ciudad: 0.3, interior: 0.9,
      noche: 0.0, dia: 0.8, calido: 0.9, frio: 0.0, animales: 0.0,
      comida: 1.0, tecnologia: 0.0, arte: 0.35, velocidad: 0.0, antiguo: 0.2,
      verde: 0.0, azul: 0.0, rojo_naranja: 0.6, montaña: 0.0
    }
  },
  {
    id: 5,
    title: "Astronauta en el Espacio Profundo",
    category: "Ciencia y Cosmos",
    url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=700&q=80",
    description: "Vista espacial de la Tierra y el cosmos desde la órbita con estrellas y tecnología aeroespacial.",
    tags: ["espacio", "astronauta", "planeta", "tierra", "estrellas", "orbita", "ciencia", "universo", "nasa", "galaxia"],
    semantic: {
      naturaleza: 0.3, agua: 0.2, cielo: 1.0, ciudad: 0.0, interior: 0.0,
      noche: 0.9, dia: 0.2, calido: 0.0, frio: 0.9, animales: 0.0,
      comida: 0.0, tecnologia: 0.95, arte: 0.2, velocidad: 0.6, antiguo: 0.0,
      verde: 0.0, azul: 0.85, rojo_naranja: 0.0, montaña: 0.0
    }
  },
  {
    id: 6,
    title: "Dunas del Desierto del Sahara",
    category: "Naturaleza y Paisajes",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=700&q=80",
    description: "Inmensas dunas de arena dorada y naranja bajo el sol ardiente del desierto.",
    tags: ["desierto", "arena", "dunas", "calor", "sol", "sahara", "seco", "dorado", "naranja", "paisaje"],
    semantic: {
      naturaleza: 0.95, agua: 0.0, cielo: 0.7, ciudad: 0.0, interior: 0.0,
      noche: 0.0, dia: 1.0, calido: 1.0, frio: 0.0, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.2, velocidad: 0.0, antiguo: 0.3,
      verde: 0.0, azul: 0.2, rojo_naranja: 0.95, montaña: 0.5
    }
  },
  {
    id: 7,
    title: "Biblioteca Clásica Antigua",
    category: "Arquitectura e Interior",
    url: "https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=700&q=80",
    description: "Salón de biblioteca histórica con miles de libros antiguos en estanterías de madera del piso al techo.",
    tags: ["biblioteca", "libros", "lectura", "madera", "antiguo", "historia", "interior", "estudio", "cultura", "silencio"],
    semantic: {
      naturaleza: 0.0, agua: 0.0, cielo: 0.0, ciudad: 0.4, interior: 1.0,
      noche: 0.2, dia: 0.6, calido: 0.8, frio: 0.0, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.75, velocidad: 0.0, antiguo: 1.0,
      verde: 0.0, azul: 0.0, rojo_naranja: 0.65, montaña: 0.0
    }
  },
  {
    id: 8,
    title: "Aurora Boreal en Islandia",
    category: "Naturaleza y Cielo",
    url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=700&q=80",
    description: "Luces verdes de la aurora boreal bailando en el cielo nocturno estrellado sobre montañas nevadas y agua.",
    tags: ["aurora", "boreal", "verde", "noche", "cielo", "islandia", "luces", "nieve", "frio", "estrellas"],
    semantic: {
      naturaleza: 1.0, agua: 0.4, cielo: 1.0, ciudad: 0.0, interior: 0.0,
      noche: 1.0, dia: 0.0, calido: 0.0, frio: 1.0, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.4, velocidad: 0.0, antiguo: 0.0,
      verde: 1.0, azul: 0.5, rojo_naranja: 0.0, montaña: 0.6
    }
  },
  {
    id: 9,
    title: "León Rey de la Sabana",
    category: "Fauna y Naturaleza",
    url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=700&q=80",
    description: "Majestuoso león africano con gran melena mirando de frente en la sabana dorada.",
    tags: ["leon", "animal", "felino", "africa", "sabana", "salvaje", "melena", "depredador", "naturaleza", "rey"],
    semantic: {
      naturaleza: 0.9, agua: 0.0, cielo: 0.2, ciudad: 0.0, interior: 0.0,
      noche: 0.0, dia: 0.9, calido: 0.85, frio: 0.0, animales: 1.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.1, velocidad: 0.4, antiguo: 0.0,
      verde: 0.2, azul: 0.0, rojo_naranja: 0.8, montaña: 0.0
    }
  },
  {
    id: 10,
    title: "Ramen Tradicional Japonés",
    category: "Gastronomía",
    url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80",
    description: "Tazón de sopa ramen caliente con fideos, huevo cocido, carne, cebollín y palillos.",
    tags: ["ramen", "sopa", "fideos", "comida", "japon", "huevo", "caliente", "cena", "restaurante", "plato"],
    semantic: {
      naturaleza: 0.0, agua: 0.3, cielo: 0.0, ciudad: 0.2, interior: 0.8,
      noche: 0.2, dia: 0.6, calido: 0.95, frio: 0.0, animales: 0.0,
      comida: 1.0, tecnologia: 0.0, arte: 0.3, velocidad: 0.0, antiguo: 0.1,
      verde: 0.3, azul: 0.0, rojo_naranja: 0.7, montaña: 0.0
    }
  },
  {
    id: 11,
    title: "Puente Golden Gate entre la Niebla",
    category: "Urbano y Arquitectura",
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=700&q=80",
    description: "El famoso puente colgante rojo de San Francisco cruzando la bahía sobre el mar y las nubes.",
    tags: ["puente", "rojo", "san francisco", "niebla", "mar", "arquitectura", "ciudad", "estructura", "ingenieria", "agua"],
    semantic: {
      naturaleza: 0.5, agua: 0.7, cielo: 0.7, ciudad: 0.8, interior: 0.0,
      noche: 0.0, dia: 0.8, calido: 0.4, frio: 0.5, animales: 0.0,
      comida: 0.0, tecnologia: 0.5, arte: 0.3, velocidad: 0.3, antiguo: 0.2,
      verde: 0.0, azul: 0.5, rojo_naranja: 0.9, montaña: 0.4
    }
  },
  {
    id: 12,
    title: "Bosque Místico con Rayos de Sol",
    category: "Naturaleza y Paisajes",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=700&q=80",
    description: "Altos árboles verdes en un bosque profundo con rayos de luz solar atravesando la neblina.",
    tags: ["bosque", "arboles", "verde", "pino", "naturaleza", "luz", "sol", "niebla", "plantas", "selva"],
    semantic: {
      naturaleza: 1.0, agua: 0.1, cielo: 0.3, ciudad: 0.0, interior: 0.0,
      noche: 0.0, dia: 0.85, calido: 0.4, frio: 0.4, animales: 0.1,
      comida: 0.0, tecnologia: 0.0, arte: 0.2, velocidad: 0.0, antiguo: 0.2,
      verde: 1.0, azul: 0.1, rojo_naranja: 0.1, montaña: 0.4
    }
  },
  {
    id: 13,
    title: "Auto Deportivo Clásico Rojo",
    category: "Velocidad y Diseño",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80",
    description: "Automóvil deportivo de lujo estacionado en una carretera asfaltada mostrando su diseño aerodinámico.",
    tags: ["auto", "coche", "carro", "deportivo", "velocidad", "motor", "carretera", "lujo", "transporte", "ruedas"],
    semantic: {
      naturaleza: 0.1, agua: 0.0, cielo: 0.3, ciudad: 0.6, interior: 0.0,
      noche: 0.2, dia: 0.8, calido: 0.5, frio: 0.2, animales: 0.0,
      comida: 0.0, tecnologia: 0.8, arte: 0.4, velocidad: 1.0, antiguo: 0.2,
      verde: 0.0, azul: 0.1, rojo_naranja: 0.6, montaña: 0.1
    }
  },
  {
    id: 14,
    title: "Gato Curioso de Ojos Verdes",
    category: "Fauna y Mascotas",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=80",
    description: "Primer plano de un gato doméstico de pelaje atigrado mirando fijamente con grandes ojos verdes.",
    tags: ["gato", "mascota", "animal", "felino", "ojos", "verde", "bigotes", "pelaje", "tierno", "casa"],
    semantic: {
      naturaleza: 0.4, agua: 0.0, cielo: 0.0, ciudad: 0.2, interior: 0.7,
      noche: 0.0, dia: 0.7, calido: 0.7, frio: 0.0, animales: 1.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.1, velocidad: 0.1, antiguo: 0.0,
      verde: 0.7, azul: 0.0, rojo_naranja: 0.3, montaña: 0.0
    }
  },
  {
    id: 15,
    title: "Concierto de Rock y Luces",
    category: "Música y Arte",
    url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=700&q=80",
    description: "Multitud con las manos arriba en un concierto en vivo iluminado por reflectores y láseres en el escenario.",
    tags: ["concierto", "musica", "fiesta", "luces", "escenario", "publico", "gente", "noche", "festival", "show"],
    semantic: {
      naturaleza: 0.0, agua: 0.0, cielo: 0.1, ciudad: 0.7, interior: 0.6,
      noche: 1.0, dia: 0.0, calido: 0.85, frio: 0.0, animales: 0.0,
      comida: 0.0, tecnologia: 0.6, arte: 0.95, velocidad: 0.5, antiguo: 0.0,
      verde: 0.1, azul: 0.4, rojo_naranja: 0.85, montaña: 0.0
    }
  },
  {
    id: 16,
    title: "Canales de Venecia al Atardecer",
    category: "Viajes y Arquitectura",
    url: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=700&q=80",
    description: "Góndolas y barcos navegando por el Gran Canal de Venecia rodeado de edificios históricos italianos.",
    tags: ["venecia", "italia", "canal", "agua", "barco", "gondola", "ciudad", "europa", "atardecer", "antiguo"],
    semantic: {
      naturaleza: 0.2, agua: 0.9, cielo: 0.6, ciudad: 0.9, interior: 0.0,
      noche: 0.2, dia: 0.8, calido: 0.8, frio: 0.1, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.7, velocidad: 0.1, antiguo: 0.85,
      verde: 0.1, azul: 0.6, rojo_naranja: 0.7, montaña: 0.0
    }
  },
  {
    id: 17,
    title: "Pizza Napolitana ReciénHorneada",
    category: "Gastronomía",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
    description: "Deliciosa pizza artesanal con queso derretido, salsa de tomate roja y hojas frescas de albahaca.",
    tags: ["pizza", "comida", "queso", "tomate", "italia", "horno", "albahaca", "cena", "restaurante", "delicioso"],
    semantic: {
      naturaleza: 0.0, agua: 0.0, cielo: 0.0, ciudad: 0.2, interior: 0.8,
      noche: 0.2, dia: 0.6, calido: 0.95, frio: 0.0, animales: 0.0,
      comida: 1.0, tecnologia: 0.0, arte: 0.2, velocidad: 0.0, antiguo: 0.1,
      verde: 0.3, azul: 0.0, rojo_naranja: 0.9, montaña: 0.0
    }
  },
  {
    id: 18,
    title: "Cascada Tropical en la Jungla",
    category: "Naturaleza y Agua",
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=700&q=80",
    description: "Gran caída de agua cristalina rodeada de vegetación verde exuberante y rocas húmedas.",
    tags: ["cascada", "agua", "rio", "selva", "jungla", "naturaleza", "verde", "rocas", "fresco", "catarata"],
    semantic: {
      naturaleza: 1.0, agua: 1.0, cielo: 0.3, ciudad: 0.0, interior: 0.0,
      noche: 0.0, dia: 0.9, calido: 0.5, frio: 0.5, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.1, velocidad: 0.4, antiguo: 0.1,
      verde: 0.95, azul: 0.7, rojo_naranja: 0.0, montaña: 0.6
    }
  },
  {
    id: 19,
    title: "Templo Japonés en Otoño",
    category: "Arquitectura y Naturaleza",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=80",
    description: "Pagoda tradicional en Kioto rodeada de hojas de arce rojas y naranjas durante el otoño.",
    tags: ["templo", "pagoda", "japon", "kioto", "otoño", "hojas", "rojo", "antiguo", "tradicion", "arquitectura"],
    semantic: {
      naturaleza: 0.75, agua: 0.1, cielo: 0.5, ciudad: 0.4, interior: 0.0,
      noche: 0.0, dia: 0.9, calido: 0.8, frio: 0.2, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.7, velocidad: 0.0, antiguo: 0.95,
      verde: 0.2, azul: 0.2, rojo_naranja: 1.0, montaña: 0.4
    }
  },
  {
    id: 20,
    title: "Robot Humanoide e Inteligencia Artificial",
    category: "Ciencia y Futuro",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80",
    description: "Robot blanco de alta tecnología mirando al frente, símbolo de inteligencia artificial y robótica.",
    tags: ["robot", "tecnologia", "futuro", "inteligencia", "artificial", "ciencia", "maquina", "androide", "innovacion", "blanco"],
    semantic: {
      naturaleza: 0.0, agua: 0.0, cielo: 0.0, ciudad: 0.3, interior: 0.8,
      noche: 0.1, dia: 0.7, calido: 0.1, frio: 0.7, animales: 0.0,
      comida: 0.0, tecnologia: 1.0, arte: 0.2, velocidad: 0.3, antiguo: 0.0,
      verde: 0.0, azul: 0.5, rojo_naranja: 0.0, montaña: 0.0
    }
  },
  {
    id: 21,
    title: "Globos Aerostáticos en Capadocia",
    category: "Viajes y Cielo",
    url: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=700&q=80",
    description: "Decenas de globos aerostáticos de colores flotando en el cielo al amanecer sobre valles rocosos.",
    tags: ["globos", "volar", "cielo", "aire", "capadocia", "amanecer", "viaje", "colores", "aventura", "nubes"],
    semantic: {
      naturaleza: 0.7, agua: 0.0, cielo: 1.0, ciudad: 0.1, interior: 0.0,
      noche: 0.0, dia: 0.9, calido: 0.85, frio: 0.2, animales: 0.0,
      comida: 0.0, tecnologia: 0.2, arte: 0.6, velocidad: 0.2, antiguo: 0.3,
      verde: 0.0, azul: 0.5, rojo_naranja: 0.9, montaña: 0.6
    }
  },
  {
    id: 22,
    title: "Medusa Bioluminiscente en la Oscuridad",
    category: "Fauna y Océano",
    url: "https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?auto=format&fit=crop&w=700&q=80",
    description: "Medusa brillante con tentáculos rosados y azules flotando en las profundidades oscuras del océano.",
    tags: ["medusa", "mar", "oceano", "agua", "animal", "brillo", "neon", "profundidad", "oscuro", "tentaculos"],
    semantic: {
      naturaleza: 0.9, agua: 1.0, cielo: 0.0, ciudad: 0.0, interior: 0.0,
      noche: 0.9, dia: 0.0, calido: 0.1, frio: 0.85, animales: 1.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.5, velocidad: 0.0, antiguo: 0.0,
      verde: 0.0, azul: 0.95, rojo_naranja: 0.6, montaña: 0.0
    }
  },
  {
    id: 23,
    title: "Estudio de Pintura y Pinceles",
    category: "Arte y Creatividad",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80",
    description: "Paleta de artista llena de pintura acrílica y al óleo de colores vibrantes con pinceles de madera.",
    tags: ["arte", "pintura", "pinceles", "colores", "artista", "creatividad", "cuadro", "lienzo", "estudio", "taller"],
    semantic: {
      naturaleza: 0.0, agua: 0.1, cielo: 0.0, ciudad: 0.1, interior: 0.9,
      noche: 0.0, dia: 0.8, calido: 0.7, frio: 0.2, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 1.0, velocidad: 0.0, antiguo: 0.2,
      verde: 0.5, azul: 0.6, rojo_naranja: 0.8, montaña: 0.0
    }
  },
  {
    id: 24,
    title: "Playa Tropical de Arena Blanca",
    category: "Naturaleza y Agua",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
    description: "Olas suaves del mar turquesa llegando a una playa paradisíaca de arena cálida bajo el sol.",
    tags: ["playa", "mar", "oceano", "arena", "olas", "vacaciones", "verano", "sol", "tropical", "agua"],
    semantic: {
      naturaleza: 1.0, agua: 1.0, cielo: 0.8, ciudad: 0.0, interior: 0.0,
      noche: 0.0, dia: 1.0, calido: 0.95, frio: 0.0, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.1, velocidad: 0.0, antiguo: 0.0,
      verde: 0.2, azul: 0.9, rojo_naranja: 0.4, montaña: 0.0
    }
  },
  {
    id: 25,
    title: "Tren Bala Cruzando la Ciudad",
    category: "Velocidad y Tecnología",
    url: "https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=700&q=80",
    description: "Tren moderno de alta velocidad sobre rieles urbanos mostrando ingeniería y movimiento rápido.",
    tags: ["tren", "velocidad", "transporte", "ciudad", "rieles", "viaje", "moderno", "estacion", "tecnologia", "movimiento"],
    semantic: {
      naturaleza: 0.0, agua: 0.0, cielo: 0.4, ciudad: 0.9, interior: 0.0,
      noche: 0.2, dia: 0.8, calido: 0.3, frio: 0.5, animales: 0.0,
      comida: 0.0, tecnologia: 0.9, arte: 0.2, velocidad: 1.0, antiguo: 0.0,
      verde: 0.0, azul: 0.6, rojo_naranja: 0.2, montaña: 0.0
    }
  },
  {
    id: 26,
    title: "Búho Real en el Bosque",
    category: "Fauna y Naturaleza",
    url: "https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=700&q=80",
    description: "Búho salvaje de plumas cafés y ojos intensos naranjas posado sobre la rama de un árbol.",
    tags: ["buho", "ave", "pajaro", "animal", "bosque", "ojos", "plumas", "noche", "salvaje", "arbol"],
    semantic: {
      naturaleza: 0.95, agua: 0.0, cielo: 0.1, ciudad: 0.0, interior: 0.0,
      noche: 0.6, dia: 0.5, calido: 0.4, frio: 0.4, animales: 1.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.1, velocidad: 0.3, antiguo: 0.1,
      verde: 0.4, azul: 0.0, rojo_naranja: 0.7, montaña: 0.2
    }
  },
  {
    id: 27,
    title: "Volcán en Erupción con Lava",
    category: "Naturaleza Extrema",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80",
    description: "Ríos de lava incandescente roja y naranja brotando del cráter de un volcán activo en la oscuridad.",
    tags: ["volcan", "lava", "fuego", "erupcion", "calor", "magma", "roca", "montaña", "humo", "peligro"],
    semantic: {
      naturaleza: 1.0, agua: 0.0, cielo: 0.4, ciudad: 0.0, interior: 0.0,
      noche: 0.8, dia: 0.2, calido: 1.0, frio: 0.0, animales: 0.0,
      comida: 0.0, tecnologia: 0.0, arte: 0.2, velocidad: 0.3, antiguo: 0.3,
      verde: 0.0, azul: 0.0, rojo_naranja: 1.0, montaña: 0.95
    }
  },
  {
    id: 28,
    title: "invernadero Botánico de Cristal",
    category: "Naturaleza y Arquitectura",
    url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=700&q=80",
    description: "Plantas verdes, helechos y flores creciendo dentro de un jardín botánico iluminado.",
    tags: ["plantas", "jardin", "verde", "hojas", "invernadero", "flores", "botanico", "naturaleza", "interior", "vida"],
    semantic: {
      naturaleza: 0.9, agua: 0.2, cielo: 0.1, ciudad: 0.2, interior: 0.75,
      noche: 0.0, dia: 0.9, calido: 0.7, frio: 0.1, animales: 0.0,
      comida: 0.1, tecnologia: 0.1, arte: 0.3, velocidad: 0.0, antiguo: 0.1,
      verde: 1.0, azul: 0.0, rojo_naranja: 0.1, montaña: 0.0
    }
  },
  {
    id: 29,
    title: "Rascacielos de Nueva York desde el Aire",
    category: "Urbano y Arquitectura",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=700&q=80",
    description: "Horizonte lleno de enormes edificios y rascacielos modernos en una metrópoli financiera.",
    tags: ["rascacielos", "ciudad", "edificios", "nueva york", "arquitectura", "metropoli", "urbano", "horizonte", "oficinas", "altura"],
    semantic: {
      naturaleza: 0.0, agua: 0.2, cielo: 0.6, ciudad: 1.0, interior: 0.0,
      noche: 0.3, dia: 0.8, calido: 0.4, frio: 0.5, animales: 0.0,
      comida: 0.0, tecnologia: 0.6, arte: 0.3, velocidad: 0.3, antiguo: 0.1,
      verde: 0.0, azul: 0.6, rojo_naranja: 0.4, montaña: 0.0
    }
  },
  {
    id: 30,
    title: "Helado Artesanal con Frutas",
    category: "Gastronomía",
    url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=80",
    description: "Cono de helado frío y dulce de colores pastel sosteniendo una bola cremosa de postre.",
    tags: ["helado", "postre", "dulce", "comida", "frio", "cono", "verano", "crema", "azucar", "delicioso"],
    semantic: {
      naturaleza: 0.0, agua: 0.1, cielo: 0.2, ciudad: 0.2, interior: 0.5,
      noche: 0.0, dia: 0.9, calido: 0.3, frio: 0.95, animales: 0.0,
      comida: 1.0, tecnologia: 0.0, arte: 0.4, velocidad: 0.0, antiguo: 0.0,
      verde: 0.2, azul: 0.3, rojo_naranja: 0.6, montaña: 0.0
    }
  }
];

/**
 * Diccionario léxico -> dimensiones semánticas (Español + Inglés)
 * Permite que cualquier descripción libre del jugador se proyecte en el espacio
 * semántico de 19 dimensiones y se combine con coincidencias directas/parciales.
 */
const LEXICON_WEIGHTS = {
  // Naturaleza y paisaje
  naturaleza: { naturaleza: 1.0, verde: 0.5 },
  natural: { naturaleza: 1.0 },
  paisaje: { naturaleza: 0.9, cielo: 0.6, montaña: 0.5 },
  aire: { naturaleza: 0.6, cielo: 0.8 },
  libre: { naturaleza: 0.7, cielo: 0.6 },
  bosque: { naturaleza: 1.0, verde: 1.0 },
  arbol: { naturaleza: 0.95, verde: 0.95 },
  arboles: { naturaleza: 0.95, verde: 0.95 },
  selva: { naturaleza: 1.0, verde: 1.0, agua: 0.4 },
  jungla: { naturaleza: 1.0, verde: 1.0, agua: 0.4 },
  planta: { naturaleza: 0.9, verde: 1.0 },
  plantas: { naturaleza: 0.9, verde: 1.0 },
  hoja: { naturaleza: 0.8, verde: 0.8 },
  hojas: { naturaleza: 0.8, verde: 0.7, rojo_naranja: 0.5 },
  flor: { naturaleza: 0.85, verde: 0.6, arte: 0.3 },
  flores: { naturaleza: 0.85, verde: 0.6 },
  jardin: { naturaleza: 0.85, verde: 0.9, interior: 0.4 },

  // Montañas / Tierra / Fuego
  montaña: { montaña: 1.0, naturaleza: 0.9 },
  montañas: { montaña: 1.0, naturaleza: 0.9 },
  pico: { montaña: 1.0, frio: 0.6 },
  cumbre: { montaña: 1.0, cielo: 0.6 },
  alpes: { montaña: 1.0, frio: 0.9, naturaleza: 0.9 },
  roca: { montaña: 0.85, naturaleza: 0.7 },
  rocas: { montaña: 0.85, naturaleza: 0.7 },
  desierto: { calido: 1.0, rojo_naranja: 0.9, naturaleza: 0.8, dia: 0.9 },
  arena: { calido: 0.9, naturaleza: 0.8, agua: 0.4 },
  dunas: { calido: 1.0, rojo_naranja: 0.9, montaña: 0.5 },
  volcan: { montaña: 0.95, calido: 1.0, rojo_naranja: 1.0, noche: 0.6 },
  lava: { calido: 1.0, rojo_naranja: 1.0 },
  fuego: { calido: 1.0, rojo_naranja: 1.0 },

  // Agua y Mar
  agua: { agua: 1.0, naturaleza: 0.6, azul: 0.6 },
  mar: { agua: 1.0, azul: 0.9, naturaleza: 0.8 },
  oceano: { agua: 1.0, azul: 0.95, naturaleza: 0.85 },
  playa: { agua: 0.9, calido: 0.85, dia: 0.9, naturaleza: 0.9 },
  cascada: { agua: 1.0, naturaleza: 0.95, verde: 0.8, montaña: 0.5 },
  rio: { agua: 0.95, naturaleza: 0.85 },
  canal: { agua: 0.9, ciudad: 0.8, antiguo: 0.7 },
  barco: { agua: 0.85, antiguo: 0.5 },
  olas: { agua: 1.0, azul: 0.8 },
  nadar: { agua: 1.0, animales: 0.6 },
  submarino: { agua: 1.0, azul: 0.95, animales: 0.7 },
  lluvia: { agua: 0.6, noche: 0.6, ciudad: 0.6, frio: 0.5 },

  // Cielo y Clima
  cielo: { cielo: 1.0, azul: 0.5 },
  nubes: { cielo: 0.9, naturaleza: 0.5 },
  niebla: { frio: 0.6, naturaleza: 0.6, cielo: 0.5 },
  sol: { dia: 1.0, calido: 0.9, cielo: 0.7 },
  amanecer: { dia: 0.8, cielo: 0.85, rojo_naranja: 0.7, calido: 0.6 },
  atardecer: { cielo: 0.85, rojo_naranja: 0.85, calido: 0.7 },
  noche: { noche: 1.0 },
  nocturno: { noche: 1.0 },
  nocturna: { noche: 1.0 },
  oscuro: { noche: 0.9 },
  oscuridad: { noche: 0.95 },
  estrellas: { noche: 0.95, cielo: 0.95 },
  aurora: { noche: 1.0, cielo: 1.0, verde: 0.95, frio: 0.9 },
  nieve: { frio: 1.0, montaña: 0.85, naturaleza: 0.8 },
  hielo: { frio: 1.0, agua: 0.5 },
  frio: { frio: 1.0 },
  helado: { frio: 0.95, comida: 0.9 },
  calor: { calido: 1.0 },
  caliente: { calido: 0.95, comida: 0.6 },

  // Ciudad y Arquitectura
  ciudad: { ciudad: 1.0 },
  urbano: { ciudad: 1.0 },
  calle: { ciudad: 0.9, noche: 0.5 },
  edificio: { ciudad: 0.95 },
  edificios: { ciudad: 0.95 },
  rascacielos: { ciudad: 1.0, tecnologia: 0.5, cielo: 0.5 },
  puente: { ciudad: 0.75, agua: 0.6, rojo_naranja: 0.6 },
  arquitectura: { ciudad: 0.75, antiguo: 0.6, arte: 0.5 },
  templo: { antiguo: 0.95, rojo_naranja: 0.7, arte: 0.6 },
  antiguo: { antiguo: 1.0 },
  historia: { antiguo: 0.95 },
  casa: { interior: 0.8 },
  interior: { interior: 1.0 },
  biblioteca: { interior: 1.0, antiguo: 0.95, calido: 0.7 },
  libros: { interior: 0.95, antiguo: 0.9, arte: 0.7 },
  madera: { interior: 0.7, calido: 0.7, antiguo: 0.5 },

  // Animales
  animal: { animales: 1.0, naturaleza: 0.7 },
  animales: { animales: 1.0, naturaleza: 0.7 },
  fauna: { animales: 1.0, naturaleza: 0.85 },
  salvaje: { animales: 0.9, naturaleza: 0.9 },
  mascota: { animales: 0.95, interior: 0.6 },
  gato: { animales: 1.0, interior: 0.6, verde: 0.5 },
  felino: { animales: 1.0 },
  leon: { animales: 1.0, calido: 0.8, naturaleza: 0.8, rojo_naranja: 0.7 },
  tortuga: { animales: 1.0, agua: 1.0, azul: 0.9 },
  medusa: { animales: 1.0, agua: 1.0, noche: 0.8, azul: 0.85 },
  buho: { animales: 1.0, naturaleza: 0.9, noche: 0.6 },
  ave: { animales: 0.95, cielo: 0.5, naturaleza: 0.8 },
  pajaro: { animales: 0.95, naturaleza: 0.8 },

  // Comida y Bebida
  comida: { comida: 1.0, calido: 0.6, interior: 0.6 },
  comer: { comida: 1.0 },
  bebida: { comida: 0.85, interior: 0.6 },
  restaurante: { comida: 0.95, interior: 0.8, ciudad: 0.4 },
  mesa: { comida: 0.8, interior: 0.85 },
  cafe: { comida: 0.95, calido: 0.85, interior: 0.85 },
  desayuno: { comida: 0.95, dia: 0.8, calido: 0.8 },
  pizza: { comida: 1.0, calido: 0.9, rojo_naranja: 0.85 },
  queso: { comida: 0.95, calido: 0.8 },
  ramen: { comida: 1.0, calido: 0.95, agua: 0.3 },
  sopa: { comida: 0.95, calido: 0.95 },
  postre: { comida: 0.95, frio: 0.7 },
  dulce: { comida: 0.9, frio: 0.6 },

  // Tecnología, Ciencia, Velocidad y Arte
  tecnologia: { tecnologia: 1.0 },
  futuro: { tecnologia: 0.95, ciudad: 0.5 },
  robot: { tecnologia: 1.0, interior: 0.6, frio: 0.5 },
  ciencia: { tecnologia: 0.9, cielo: 0.5 },
  espacio: { tecnologia: 0.9, cielo: 1.0, noche: 0.9, azul: 0.7 },
  astronauta: { tecnologia: 0.95, cielo: 0.95, noche: 0.85 },
  planeta: { cielo: 0.95, noche: 0.85, azul: 0.8 },
  neon: { noche: 0.95, ciudad: 0.85, tecnologia: 0.7, azul: 0.7, rojo_naranja: 0.7 },
  luces: { noche: 0.85, ciudad: 0.6, arte: 0.5 },
  velocidad: { velocidad: 1.0, tecnologia: 0.7 },
  rapido: { velocidad: 1.0 },
  auto: { velocidad: 0.95, tecnologia: 0.75, ciudad: 0.5 },
  coche: { velocidad: 0.95, tecnologia: 0.75 },
  carro: { velocidad: 0.95, tecnologia: 0.75 },
  tren: { velocidad: 0.95, tecnologia: 0.85, ciudad: 0.8 },
  globos: { cielo: 0.95, rojo_naranja: 0.8, calido: 0.7, dia: 0.8 },
  volar: { cielo: 0.95, velocidad: 0.4 },
  arte: { arte: 1.0 },
  pintura: { arte: 1.0, interior: 0.7, rojo_naranja: 0.6, azul: 0.5 },
  musica: { arte: 0.95, noche: 0.8, calido: 0.7 },
  concierto: { arte: 0.95, noche: 0.95, ciudad: 0.6, calido: 0.8 },

  // Colores
  verde: { verde: 1.0, naturaleza: 0.6 },
  azul: { azul: 1.0, agua: 0.5, cielo: 0.5 },
  rojo: { rojo_naranja: 1.0, calido: 0.7 },
  naranja: { rojo_naranja: 1.0, calido: 0.8 },
  dorado: { rojo_naranja: 0.85, calido: 0.85 },
  amarillo: { rojo_naranja: 0.75, calido: 0.8, dia: 0.7 },
  blanco: { frio: 0.7, dia: 0.6 }
};

// Stopwords en español para limpiar la frase del jugador
const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
  "en", "con", "por", "para", "sin", "sobre", "entre", "hacia", "hasta",
  "y", "o", "u", "e", "que", "como", "mas", "muy", "hay", "se", "ve",
  "imagen", "foto", "fotografia", "escena", "lugar", "donde", "tiene", "esta"
]);

/**
 * Normaliza texto quitando acentos y signos de puntuación
 */
function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokeniza texto quitando palabras vacías
 */
function tokenize(str) {
  const clean = normalizeText(str);
  if (!clean) return [];
  return clean.split(" ").filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

/**
 * Calcula similitud semántica entre la descripción del jugador y una imagen de la galería.
 * Combina:
 * 1. Coincidencia léxica directa y por prefijo con tags, título, categoría y descripción.
 * 2. Similitud coseno en el espacio vectorial de 19 dimensiones semánticas.
 * 3. Desempate determinista suave para que no existan empates exactos.
 */
function scoreImageAgainstPrompt(image, rawPrompt) {
  const tokens = tokenize(rawPrompt);
  const normPrompt = normalizeText(rawPrompt);

  if (tokens.length === 0) return 0;

  const normTitle = normalizeText(image.title);
  const normCategory = normalizeText(image.category);
  const normDesc = normalizeText(image.description);
  const normTags = image.tags.map(normalizeText);

  let directScore = 0;

  // Coincidencia de frase completa en título o descripción
  if (normPrompt.length >= 4 && (normTitle.includes(normPrompt) || normDesc.includes(normPrompt))) {
    directScore += 2.2;
  }

  // Vector semántico construido a partir de los tokens del jugador
  const queryVector = {};

  for (const token of tokens) {
    const stem = token.length > 4 ? token.slice(0, -1) : token;

    // 1. Coincidencia en etiquetas
    for (const tag of normTags) {
      if (tag === token) {
        directScore += 1.45;
      } else if (tag.startsWith(stem) || token.startsWith(tag)) {
        directScore += 0.95;
      }
    }

    // 2. Coincidencia en el título
    if (normTitle.includes(token) || (stem.length >= 4 && normTitle.includes(stem))) {
      directScore += 1.25;
    }

    // 3. Coincidencia en la descripción rica
    if (normDesc.includes(token) || (stem.length >= 4 && normDesc.includes(stem))) {
      directScore += 0.65;
    }

    // 4. Coincidencia en la categoría
    if (normCategory.includes(token)) {
      directScore += 0.45;
    }

    // 5. Proyección al espacio vectorial semántico (19 dimensiones)
    for (const [lexKey, weights] of Object.entries(LEXICON_WEIGHTS)) {
      if (lexKey === token || (stem.length >= 4 && (lexKey.startsWith(stem) || token.startsWith(lexKey)))) {
        const factor = lexKey === token ? 1.0 : 0.75;
        for (const [dim, val] of Object.entries(weights)) {
          queryVector[dim] = (queryVector[dim] || 0) + val * factor;
        }
      }
    }
  }

  // Además, si un token coincide con los tags de alguna imagen, heredamos parte de su vector semántico
  for (const refImg of GALLERY_IMAGES) {
    const refTags = refImg.tags.map(normalizeText);
    const hasMatch = tokens.some((t) => refTags.includes(t));
    if (hasMatch) {
      for (const [dim, val] of Object.entries(refImg.semantic)) {
        queryVector[dim] = (queryVector[dim] || 0) + val * 0.35;
      }
    }
  }

  // Producto punto normalizado (Similitud Coseno) entre queryVector e image.semantic
  let dot = 0;
  let normQ = 0;
  let normI = 0;

  const allDims = new Set([...Object.keys(queryVector), ...Object.keys(image.semantic)]);
  for (const dim of allDims) {
    const q = queryVector[dim] || 0;
    const im = image.semantic[dim] || 0;
    dot += q * im;
    normQ += q * q;
    normI += im * im;
  }

  const cosineSimilarity = normQ > 0 && normI > 0 ? dot / (Math.sqrt(normQ) * Math.sqrt(normI)) : 0;

  // Hash determinista diminuto para evitar empates exactos entre imágenes
  const tieBreaker = ((image.id * 2654435761 + normPrompt.length * 97) % 1000) * 1e-6;

  return directScore * 0.65 + cosineSimilarity * 1.85 + tieBreaker;
}

// ============================================================================
// Estado del Juego
// ============================================================================
const state = {
  secretImage: null,
  isDailyMode: true,
  guesses: [], // { prompt, secretRank, topMatchTitle, tryNumber, rankingIds }
  currentOrder: [...GALLERY_IMAGES], // Orden actual de las 30 tarjetas en la galería
  hintsUsed: 0,
  isGameOver: false,
  inspectedImage: null
};

// ============================================================================
// Selección de Imagen Secreta (Reto Diario, Enlace de Amigo o Partida Libre)
// ============================================================================
function getDailySeedIndex() {
  const now = new Date();
  const dateNumber = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return (dateNumber * 17 + 11) % GALLERY_IMAGES.length;
}

function encodeChallengeCode(imageId) {
  // Codifica el ID para compartir en ?reto=XXXX sin que sea obvio a simple vista
  const payload = `CTX-${imageId * 73 + 409}`;
  return btoa(payload).replace(/=/g, "");
}

function decodeChallengeCode(code) {
  try {
    const decoded = atob(code);
    if (!decoded.startsWith("CTX-")) return null;
    const num = parseInt(decoded.replace("CTX-", ""), 10);
    const id = (num - 409) / 73;
    const found = GALLERY_IMAGES.find((img) => img.id === id);
    return found || null;
  } catch {
    return null;
  }
}

function initGame(mode = "auto", forcedImage = null) {
  const params = new URLSearchParams(window.location.search);
  const challengeParam = params.get("reto");

  if (forcedImage) {
    state.secretImage = forcedImage;
    state.isDailyMode = false;
  } else if (mode === "auto" && challengeParam) {
    const decodedImg = decodeChallengeCode(challengeParam);
    if (decodedImg) {
      state.secretImage = decodedImg;
      state.isDailyMode = false;
      updateModeBadge("Reto de Amigo", "badge-custom");
    }
  }

  if (!state.secretImage) {
    if (mode === "random") {
      const currentId = state.secretImage?.id;
      const pool = GALLERY_IMAGES.filter((img) => img.id !== currentId);
      state.secretImage = pool[Math.floor(Math.random() * pool.length)];
      state.isDailyMode = false;
      updateModeBadge("Partida Libre", "badge-custom");
      // Limpiar query param si existía
      if (window.history.replaceState) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else {
      const idx = getDailySeedIndex();
      state.secretImage = GALLERY_IMAGES[idx];
      state.isDailyMode = true;
      updateModeBadge("Reto Diario", "badge-daily");
    }
  }

  state.guesses = [];
  state.hintsUsed = 0;
  state.isGameOver = false;
  state.currentOrder = [...GALLERY_IMAGES];

  // Reset UI
  document.getElementById("statAttempts").textContent = "0";
  document.getElementById("statBestRank").textContent = "—";
  document.getElementById("statTotalImages").textContent = String(GALLERY_IMAGES.length);
  document.getElementById("feedbackBanner").classList.add("hidden");
  document.getElementById("thermometerText").textContent = "Esperando tu 1ª descripción...";
  document.getElementById("thermometerMarker").classList.add("hidden");
  document.getElementById("galleryTitle").textContent = `Galería de Candidatas (${GALLERY_IMAGES.length})`;
  document.getElementById("gallerySubtitle").textContent =
    "Una de estas imágenes es la secreta. Al enviar una descripción, la galería se reordenará de #1 a #30 según tu texto.";

  renderHistory();
  renderGallery(false);
}

function updateModeBadge(text, className) {
  const badge = document.getElementById("modeBadge");
  badge.textContent = text;
  badge.className = `badge ${className}`;
}

// ============================================================================
// Lógica de Evaluación de Descripción
// ============================================================================
function getRankClass(rank) {
  if (rank === 1) return "rank-win";
  if (rank <= 5) return "rank-hot";
  if (rank <= 15) return "rank-warm";
  return "rank-cold";
}

function getRankLabel(rank) {
  if (rank === 1) return "🎉 ¡LUGAR #1! ¡Encontraste la imagen secreta!";
  if (rank <= 5) return `🔥 ¡Quemando! La imagen secreta quedó en el lugar #${rank}`;
  if (rank <= 15) return `🌤️ ¡Tibio! La imagen secreta quedó en el lugar #${rank}`;
  return `❄️ Frío. La imagen secreta quedó en el lugar #${rank}`;
}

function handleGuessSubmit(rawPrompt) {
  const prompt = rawPrompt.trim();
  if (!prompt) return;

  // Puntuar las 30 imágenes frente a la descripción del jugador
  const scored = GALLERY_IMAGES.map((img) => ({
    image: img,
    score: scoreImageAgainstPrompt(img, prompt)
  }));

  // Ordenar de mayor a menor similitud (#1 a #30)
  scored.sort((a, b) => b.score - a.score);

  state.currentOrder = scored.map((item) => item.image);

  // Buscar en qué posición quedó la imagen secreta (1-indexed)
  const secretIndex = state.currentOrder.findIndex((img) => img.id === state.secretImage.id);
  const secretRank = secretIndex + 1;
  const topMatch = state.currentOrder[0];

  const tryNumber = state.guesses.length + 1;
  const guessEntry = {
    prompt,
    secretRank,
    topMatchTitle: topMatch.title,
    tryNumber,
    orderSnapshot: [...state.currentOrder]
  };

  state.guesses.push(guessEntry);

  // Actualizar estadísticas
  const bestRank = Math.min(...state.guesses.map((g) => g.secretRank));
  document.getElementById("statAttempts").textContent = String(state.guesses.length);
  document.getElementById("statBestRank").textContent = `#${bestRank}`;

  // Actualizar banner de resultado y termómetro
  updateFeedbackBanner(guessEntry);
  updateThermometer(secretRank);

  // Actualizar títulos de la galería
  document.getElementById("galleryTitle").textContent = `Galería ordenada por: "${prompt}"`;
  document.getElementById("gallerySubtitle").textContent =
    secretRank === 1
      ? `¡La imagen secreta está en el puesto #1! Era "${state.secretImage.title}".`
      : `Con esta descripción, la imagen secreta quedó en el puesto #${secretRank}. Mira qué imágenes quedaron arriba (#1–#${Math.min(5, secretRank)}) para ajustar tu próxima pista.`;

  renderHistory(guessEntry);
  renderGallery(true, secretRank);

  // Si llegó al #1, ¡Victoria!
  if (secretRank === 1 && !state.isGameOver) {
    state.isGameOver = true;
    setTimeout(() => {
      openVictoryDialog(guessEntry.prompt, true);
    }, 550);
  }
}

function updateFeedbackBanner(guessEntry) {
  const banner = document.getElementById("feedbackBanner");
  const badge = document.getElementById("feedbackRankBadge");
  const headline = document.getElementById("feedbackHeadline");
  const sub = document.getElementById("feedbackSub");

  banner.classList.remove("hidden");
  const rankClass = getRankClass(guessEntry.secretRank);

  badge.className = `feedback-rank-badge ${rankClass}`;
  badge.textContent = `#${guessEntry.secretRank}`;
  headline.textContent = getRankLabel(guessEntry.secretRank);

  if (guessEntry.secretRank === 1) {
    sub.textContent = `Tu descripción colocó a "${state.secretImage.title}" directamente en el #1 de las 30 imágenes.`;
  } else {
    sub.textContent = `Tu frase se pareció más a "${guessEntry.topMatchTitle}" (#1). Solo ${
      guessEntry.secretRank - 1
    } imagen(es) superaron a la secreta.`;
  }
}

function updateThermometer(rank) {
  const marker = document.getElementById("thermometerMarker");
  const text = document.getElementById("thermometerText");
  marker.classList.remove("hidden");

  // Posición 0% = #1 (izquierda), 100% = #30 (derecha)
  const pct = ((rank - 1) / (GALLERY_IMAGES.length - 1)) * 100;
  marker.style.insetInlineStart = `${pct}%`;
  text.textContent = `Lugar #${rank} de ${GALLERY_IMAGES.length}`;
}

// ============================================================================
// Renderizado de Historial y Galería
// ============================================================================
function renderHistory(latestEntry = null) {
  const container = document.getElementById("historyList");

  if (state.guesses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Todavía no has escrito ninguna descripción.</p>
        <p class="empty-sub">Cada vez que escribas una frase, ordenaremos las 30 imágenes según qué tanto se parecen a tu texto y te diremos en qué posición cayó la <strong>imagen secreta</strong>.</p>
      </div>
    `;
    return;
  }

  // Ordenar por mejor lugar (#1 arriba), desempatando por intento más reciente
  const sortedGuesses = [...state.guesses].sort((a, b) => {
    if (a.secretRank !== b.secretRank) return a.secretRank - b.secretRank;
    return b.tryNumber - a.tryNumber;
  });

  container.innerHTML = "";

  for (const item of sortedGuesses) {
    const row = document.createElement("div");
    const rankClass = getRankClass(item.secretRank);
    const isLatest = latestEntry && item.tryNumber === latestEntry.tryNumber;
    row.className = `history-item ${isLatest ? "is-latest" : ""}`;

    // Porcentaje de cercanía para la barra interior
    const proximityPct = Math.max(8, Math.round(((GALLERY_IMAGES.length - item.secretRank + 1) / GALLERY_IMAGES.length) * 100));

    let barColor = "#64748b";
    if (item.secretRank === 1) barColor = "#10b981";
    else if (item.secretRank <= 5) barColor = "#f59e0b";
    else if (item.secretRank <= 15) barColor = "#3b82f6";

    row.innerHTML = `
      <div class="history-bar" style="inline-size: ${proximityPct}%; background: ${barColor};"></div>
      <span class="history-prompt" title="${escapeHtml(item.prompt)}">${escapeHtml(item.prompt)}</span>
      <div class="history-meta">
        <span class="history-try-num">#${item.tryNumber}</span>
        <span class="history-rank-pill ${rankClass}">Lugar #${item.secretRank}</span>
      </div>
    `;

    // Al hacer clic en un intento anterior, restaura el orden de ese intento
    row.addEventListener("click", () => {
      state.currentOrder = [...item.orderSnapshot];
      updateFeedbackBanner(item);
      updateThermometer(item.secretRank);
      document.getElementById("galleryTitle").textContent = `Galería ordenada por: "${item.prompt}"`;
      renderGallery(true, item.secretRank);
    });

    container.appendChild(row);
  }
}

function renderGallery(hasEvaluated = false, secretRank = null) {
  const grid = document.getElementById("galleryGrid");
  const showTitles = document.getElementById("toggleTitles").checked;

  grid.innerHTML = "";

  state.currentOrder.forEach((img, index) => {
    const rank = index + 1;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "gallery-card";

    const isSecretWon = state.isGameOver && img.id === state.secretImage.id;
    const isSecretRankSlot = hasEvaluated && rank === secretRank && !state.isGameOver;

    if (isSecretWon) {
      card.classList.add("is-winner-secret");
    } else if (isSecretRankSlot) {
      card.classList.add("is-secret-rank-target");
    }

    const badgeText = hasEvaluated ? `#${rank}` : `Foto ${img.id}`;
    const rankBadgeClass = hasEvaluated ? getRankClass(rank) : "";

    let extraBadge = "";
    if (isSecretWon) {
      extraBadge = `<span class="card-secret-indicator" style="background:#10b981;color:#052e16;">👑 SECRETA (#1)</span>`;
    } else if (isSecretRankSlot) {
      extraBadge = `<span class="card-secret-indicator">🎯 Puesto de la secreta</span>`;
    }

    card.innerHTML = `
      <div class="card-media">
        <img src="${img.url}" alt="${escapeHtml(img.title)}" loading="lazy" />
        <span class="card-rank-badge ${rankBadgeClass}">${badgeText}</span>
        ${extraBadge}
      </div>
      <div class="card-body ${showTitles ? "" : "hidden"}">
        <span class="card-title">${escapeHtml(img.title)}</span>
        <span class="card-category">${escapeHtml(img.category)}</span>
      </div>
    `;

    card.addEventListener("click", () => openInspectDialog(img, rank, hasEvaluated));
    grid.appendChild(card);
  });
}

// ============================================================================
// Pistas, Rendirse y Diálogos
// ============================================================================
function giveHint() {
  if (state.isGameOver) {
    showToast("La partida ya terminó. ¡Inicia una nueva partida!");
    return;
  }

  state.hintsUsed += 1;
  const sec = state.secretImage;

  let hintMessage = "";
  if (state.hintsUsed === 1) {
    hintMessage = `💡 Pista 1: La imagen secreta pertenece a la categoría "${sec.category}".`;
  } else if (state.hintsUsed === 2) {
    hintMessage = `💡 Pista 2: Dos palabras clave de la imagen secreta son "${sec.tags[0]}" y "${sec.tags[1]}".`;
  } else {
    hintMessage = `💡 Pista 3: Busca una imagen que muestre: "${sec.description.slice(0, 65)}..."`;
  }

  showToast(hintMessage, 5000);
}

function openInspectDialog(img, rank, hasEvaluated) {
  state.inspectedImage = img;
  const dialog = document.getElementById("inspectDialog");
  document.getElementById("inspectTitle").textContent = img.title;
  const imgEl = document.getElementById("inspectImg");
  imgEl.src = img.url;
  imgEl.alt = img.title;

  const badge = document.getElementById("inspectRankBadge");
  badge.textContent = hasEvaluated ? `Lugar actual: #${rank}` : `Candidata #${img.id}`;

  document.getElementById("inspectCategory").textContent = img.category;

  const tagsWrap = document.getElementById("inspectTags");
  tagsWrap.innerHTML = img.tags
    .slice(0, 6)
    .map((t) => `<span class="tag-badge">#${escapeHtml(t)}</span>`)
    .join("");

  dialog.showModal();
}

function openVictoryDialog(winningPrompt, won = true) {
  const dialog = document.getElementById("victoryDialog");
  const titleEl = document.getElementById("victoryTitle");
  const sec = state.secretImage;

  titleEl.textContent = won
    ? "🎉 ¡Llevaste la imagen secreta al #1!"
    : "🔍 Imagen secreta revelada";

  document.getElementById("victoryImg").src = sec.url;
  document.getElementById("victoryImg").alt = sec.title;
  document.getElementById("victoryImgTitle").textContent = sec.title;
  document.getElementById("victoryImgDesc").textContent = sec.description;

  document.getElementById("victoryAttempts").textContent = String(state.guesses.length);
  document.getElementById("victoryHints").textContent = String(state.hintsUsed);
  document.getElementById("victoryWinningPrompt").textContent = winningPrompt ? `"${winningPrompt}"` : "—";

  dialog.showModal();
}

// ============================================================================
// Compartir Resultado y Enlace de Reto
// ============================================================================
function buildShareSummary() {
  const emojis = state.guesses
    .map((g) => {
      if (g.secretRank === 1) return "👑";
      if (g.secretRank <= 5) return "🔥";
      if (g.secretRank <= 15) return "🌤️";
      return "❄️";
    })
    .join("");

  const code = encodeChallengeCode(state.secretImage.id);
  const url = `${window.location.origin}${window.location.pathname}?reto=${code}`;

  return [
    `🖼️ Contexto Visual — ¡Llevé la imagen secreta al #1!`,
    `🎯 Intentos: ${state.guesses.length} | 💡 Pistas: ${state.hintsUsed}`,
    `📊 Ruta: ${emojis || "👑"}`,
    `🔗 Juega este mismo reto: ${url}`
  ].join("\n");
}

function copyChallengeLink() {
  const code = encodeChallengeCode(state.secretImage.id);
  const url = `${window.location.origin}${window.location.pathname}?reto=${code}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast("🔗 ¡Enlace copiado! Compártelo para que adivinen esta misma imagen.");
  });
}

function showToast(message, duration = 3400) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// Inicialización de Eventos y Fallback de <dialog closedby="any">
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initGame("auto");

  // Formulario de descripciones
  const form = document.getElementById("guessForm");
  const input = document.getElementById("guessInput");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    handleGuessSubmit(input.value);
    input.value = "";
    input.focus();
  });

  // Chips de sugerencias rápidas
  document.getElementById("quickChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const prompt = chip.getAttribute("data-prompt");
    handleGuessSubmit(prompt);
  });

  // Botón usar descripción desde el inspector de imagen
  document.getElementById("btnUseInspectPrompt").addEventListener("click", () => {
    if (!state.inspectedImage) return;
    const samplePrompt = `${state.inspectedImage.title.toLowerCase()} ${state.inspectedImage.tags.slice(0, 3).join(" ")}`;
    document.getElementById("inspectDialog").close();
    handleGuessSubmit(samplePrompt);
  });

  // Mostrar/ocultar títulos en la galería
  document.getElementById("toggleTitles").addEventListener("change", () => {
    const lastGuess = state.guesses[state.guesses.length - 1];
    renderGallery(state.guesses.length > 0, lastGuess ? lastGuess.secretRank : null);
  });

  // Botones de cabecera
  document.getElementById("btnHelp").addEventListener("click", () => {
    document.getElementById("helpDialog").showModal();
  });

  document.getElementById("btnHint").addEventListener("click", giveHint);

  document.getElementById("btnChallengeFriend").addEventListener("click", copyChallengeLink);

  document.getElementById("btnNewGame").addEventListener("click", () => {
    initGame("random");
    showToast("🎲 ¡Nueva imagen secreta seleccionada en la galería!");
  });

  document.getElementById("btnPlayAgainModal").addEventListener("click", () => {
    document.getElementById("victoryDialog").close();
    initGame("random");
    showToast("🎲 ¡Nueva partida iniciada!");
  });

  // Rendirse y revelar la imagen secreta
  document.getElementById("btnGiveUp").addEventListener("click", () => {
    if (state.isGameOver) {
      openVictoryDialog(state.guesses[state.guesses.length - 1]?.prompt || "", true);
      return;
    }
    state.isGameOver = true;
    renderGallery(state.guesses.length > 0, 1);
    openVictoryDialog("Revelada al rendirse", false);
  });

  // Botones para compartir en el modal de victoria
  document.getElementById("btnShareResult").addEventListener("click", () => {
    const summary = buildShareSummary();
    navigator.clipboard.writeText(summary).then(() => {
      showToast("📋 ¡Resumen copiado al portapapeles!");
    });
  });

  document.getElementById("btnShareSeedLink").addEventListener("click", copyChallengeLink);

  // Cerrar modales con atributo data-close-dialog
  document.querySelectorAll("[data-close-dialog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close-dialog");
      document.getElementById(id)?.close();
    });
  });

  // Fallback para navegadores sin soporte nativo de <dialog closedby="any">
  const dialogs = document.querySelectorAll("dialog");
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    dialogs.forEach((dialog) => {
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      });
    });
  }
});
