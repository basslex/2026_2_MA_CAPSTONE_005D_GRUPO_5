
/* =====================================================
   ESSENZIA - CATÁLOGO DE PERFUMES
   Archivo: frontend/js/data/perfumes.js

   10 perfumes de diseñador
   10 perfumes árabes
   10 perfumes de nicho

   Precios referenciales en pesos chilenos (CLP).
   Notas olfativas resumidas para el prototipo.
===================================================== */

export const perfumes = [

    // =================================================
    // 1. PERFUMES DE DISEÑADOR (10)
    // =================================================

    {
        id: 1,
        nombre: "Sauvage Eau de Parfum",
        marca: "Dior",
        categoria: "disenador",
        genero: "hombre",
        familia: "aromatica",
        ocasion: ["diario", "noche"],
        clima: ["templado", "frio"],
        precio: 119990,
        notas: {
            salida: ["Bergamota"],
            corazon: ["Lavanda", "Especias"],
            fondo: ["Vainilla", "Pachulí"]
        },
        shade: "#dce3e8",
        liquid: "#344c68",
        imagen: "img/perfumes/dior-sauvage.jpg"
    },

    {
        id: 2,
        nombre: "Bleu de Chanel Eau de Parfum",
        marca: "Chanel",
        categoria: "disenador",
        genero: "hombre",
        familia: "amaderada",
        ocasion: ["diario", "formal"],
        clima: ["templado", "frio"],
        precio: 159990,
        notas: {
            salida: ["Pomelo", "Limón"],
            corazon: ["Jengibre", "Nuez moscada"],
            fondo: ["Sándalo", "Cedro", "Incienso"]
        },
        shade: "#dce3eb",
        liquid: "#24384e",
        imagen: "img/perfumes/bleu-chanel.jpg"
    },

    {
        id: 3,
        nombre: "Y Eau de Parfum",
        marca: "Yves Saint Laurent",
        categoria: "disenador",
        genero: "hombre",
        familia: "aromatica",
        ocasion: ["diario", "noche"],
        clima: ["templado", "frio"],
        precio: 129990,
        notas: {
            salida: ["Manzana", "Bergamota", "Jengibre"],
            corazon: ["Salvia", "Geranio"],
            fondo: ["Haba tonka", "Cedro", "Ámbar"]
        },
        shade: "#d9e3ec",
        liquid: "#416e91",
        imagen: "img/perfumes/ysl-y.jpg"
    },

    {
        id: 4,
        nombre: "Le Male Le Parfum",
        marca: "Jean Paul Gaultier",
        categoria: "disenador",
        genero: "hombre",
        familia: "aromatica",
        ocasion: ["noche", "formal"],
        clima: ["frio", "templado"],
        precio: 129990,
        notas: {
            salida: ["Cardamomo"],
            corazon: ["Lavanda", "Iris"],
            fondo: ["Vainilla", "Notas amaderadas"]
        },
        shade: "#dfe3ec",
        liquid: "#344565",
        imagen: "img/perfumes/jpg-le-male.jpg"
    },

    {
        id: 5,
        nombre: "Eros Eau de Toilette",
        marca: "Versace",
        categoria: "disenador",
        genero: "hombre",
        familia: "aromatica",
        ocasion: ["noche"],
        clima: ["templado", "frio"],
        precio: 89990,
        notas: {
            salida: ["Menta", "Limón", "Manzana"],
            corazon: ["Geranio", "Haba tonka"],
            fondo: ["Vainilla", "Cedro", "Vetiver"]
        },
        shade: "#d6e8e5",
        liquid: "#368b82",
        imagen: "img/perfumes/versace-eros.jpg"
    },

    {
        id: 6,
        nombre: "Acqua di Giò Profondo",
        marca: "Giorgio Armani",
        categoria: "disenador",
        genero: "hombre",
        familia: "acuatica",
        ocasion: ["diario"],
        clima: ["calido", "templado"],
        precio: 129990,
        notas: {
            salida: ["Mandarina verde", "Bergamota"],
            corazon: ["Notas marinas", "Lavanda", "Romero"],
            fondo: ["Almizcle", "Pachulí"]
        },
        shade: "#dce8ed",
        liquid: "#426c87",
        imagen: "img/perfumes/armani-profondo.jpg"
    },

    {
        id: 7,
        nombre: "La Vie Est Belle Eau de Parfum",
        marca: "Lancôme",
        categoria: "disenador",
        genero: "mujer",
        familia: "gourmand",
        ocasion: ["formal", "noche"],
        clima: ["templado", "frio"],
        precio: 119990,
        notas: {
            salida: ["Pera", "Grosella negra"],
            corazon: ["Iris", "Jazmín", "Flor de azahar"],
            fondo: ["Praliné", "Vainilla", "Pachulí"]
        },
        shade: "#f1e1db",
        liquid: "#d4a38b",
        imagen: "img/perfumes/lancome-la-vie.jpg"
    },

    {
        id: 8,
        nombre: "Libre Eau de Parfum",
        marca: "Yves Saint Laurent",
        categoria: "disenador",
        genero: "mujer",
        familia: "floral",
        ocasion: ["formal", "noche"],
        clima: ["templado", "frio"],
        precio: 139990,
        notas: {
            salida: ["Mandarina", "Lavanda"],
            corazon: ["Flor de azahar", "Jazmín"],
            fondo: ["Vainilla", "Almizcle"]
        },
        shade: "#f1e5d8",
        liquid: "#d4a65d",
        imagen: "img/perfumes/ysl-libre.jpg"
    },

    {
        id: 9,
        nombre: "Good Girl Eau de Parfum",
        marca: "Carolina Herrera",
        categoria: "disenador",
        genero: "mujer",
        familia: "floral",
        ocasion: ["noche", "formal"],
        clima: ["templado", "frio"],
        precio: 119990,
        notas: {
            salida: ["Almendra", "Café"],
            corazon: ["Jazmín", "Tuberosa"],
            fondo: ["Haba tonka", "Cacao", "Vainilla"]
        },
        shade: "#e0dfe9",
        liquid: "#42415f",
        imagen: "img/perfumes/ch-good-girl.jpg"
    },

    {
        id: 10,
        nombre: "Light Blue Eau de Toilette",
        marca: "Dolce & Gabbana",
        categoria: "disenador",
        genero: "mujer",
        familia: "citrica",
        ocasion: ["diario"],
        clima: ["calido", "templado"],
        precio: 89990,
        notas: {
            salida: ["Limón", "Manzana"],
            corazon: ["Bambú", "Jazmín"],
            fondo: ["Cedro", "Almizcle"]
        },
        shade: "#e3edf0",
        liquid: "#a5d5de",
        imagen: "img/perfumes/light-blue.jpg"
    },

    // =================================================
    // 2. PERFUMES ÁRABES (10)
    // =================================================

    {
        id: 11,
        nombre: "Khamrah",
        marca: "Lattafa",
        categoria: "arabe",
        genero: "unisex",
        familia: "gourmand",
        ocasion: ["noche", "formal"],
        clima: ["frio"],
        precio: 49990,
        notas: {
            salida: ["Canela", "Nuez moscada", "Bergamota"],
            corazon: ["Dátiles", "Praliné", "Tuberosa"],
            fondo: ["Vainilla", "Haba tonka", "Ámbar"]
        },
        shade: "#ead6b9",
        liquid: "#a96b35",
        imagen: "img/perfumes/lattafa-khamrah.jpg"
    },

    {
        id: 12,
        nombre: "Asad",
        marca: "Lattafa",
        categoria: "arabe",
        genero: "hombre",
        familia: "aromatica",
        ocasion: ["noche", "formal"],
        clima: ["frio"],
        precio: 39990,
        notas: {
            salida: ["Pimienta negra", "Piña", "Tabaco"],
            corazon: ["Café", "Pachulí", "Iris"],
            fondo: ["Vainilla", "Ámbar", "Maderas"]
        },
        shade: "#e2d9ce",
        liquid: "#544337",
        imagen: "img/perfumes/lattafa-asad.jpg"
    },

    {
        id: 13,
        nombre: "Yara",
        marca: "Lattafa",
        categoria: "arabe",
        genero: "mujer",
        familia: "gourmand",
        ocasion: ["diario"],
        clima: ["templado"],
        precio: 34990,
        notas: {
            salida: ["Orquídea", "Heliotropo"],
            corazon: ["Frutas tropicales", "Acordes gourmand"],
            fondo: ["Vainilla", "Almizcle", "Sándalo"]
        },
        shade: "#f2dce6",
        liquid: "#e8a7c1",
        imagen: "img/perfumes/lattafa-yara.jpg"
    },

    {
        id: 14,
        nombre: "9PM",
        marca: "Afnan",
        categoria: "arabe",
        genero: "hombre",
        familia: "gourmand",
        ocasion: ["noche"],
        clima: ["frio", "templado"],
        precio: 49990,
        notas: {
            salida: ["Manzana", "Canela", "Bergamota"],
            corazon: ["Lavanda", "Flor de azahar"],
            fondo: ["Vainilla", "Haba tonka", "Ámbar"]
        },
        shade: "#e0dce9",
        liquid: "#65558b",
        imagen: "img/perfumes/afnan-9pm.jpg"
    },

    {
        id: 15,
        nombre: "Club de Nuit Intense Man",
        marca: "Armaf",
        categoria: "arabe",
        genero: "hombre",
        familia: "amaderada",
        ocasion: ["diario", "formal"],
        clima: ["templado", "frio"],
        precio: 54990,
        notas: {
            salida: ["Limón", "Piña", "Bergamota"],
            corazon: ["Abedul", "Jazmín", "Rosa"],
            fondo: ["Almizcle", "Ámbar gris", "Pachulí"]
        },
        shade: "#dfe2e2",
        liquid: "#484d4e",
        imagen: "img/perfumes/armaf-club-nuit.jpg"
    },

    {
        id: 16,
        nombre: "Turathi Blue",
        marca: "Afnan",
        categoria: "arabe",
        genero: "hombre",
        familia: "citrica",
        ocasion: ["diario"],
        clima: ["calido", "templado"],
        precio: 54990,
        notas: {
            salida: ["Cítricos"],
            corazon: ["Ámbar", "Maderas"],
            fondo: ["Almizcle", "Especias", "Pachulí"]
        },
        shade: "#d8e6ed",
        liquid: "#527b9e",
        imagen: "img/perfumes/turathi-blue.jpg"
    },

    {
        id: 17,
        nombre: "Bade'e Al Oud Oud for Glory",
        marca: "Lattafa",
        categoria: "arabe",
        genero: "unisex",
        familia: "amaderada",
        ocasion: ["noche", "formal"],
        clima: ["frio"],
        precio: 49990,
        notas: {
            salida: ["Azafrán", "Lavanda", "Nuez moscada"],
            corazon: ["Madera de oud", "Pachulí"],
            fondo: ["Oud", "Almizcle", "Pachulí"]
        },
        shade: "#e3d9c9",
        liquid: "#685039",
        imagen: "img/perfumes/lattafa-oud-glory.jpg"
    },

    {
        id: 18,
        nombre: "Jean Lowe Immortal",
        marca: "Maison Alhambra",
        categoria: "arabe",
        genero: "hombre",
        familia: "citrica",
        ocasion: ["diario", "formal"],
        clima: ["calido", "templado"],
        precio: 44990,
        notas: {
            salida: ["Pomelo", "Jengibre", "Bergamota"],
            corazon: ["Romero", "Salvia", "Notas acuáticas"],
            fondo: ["Ámbar", "Ambroxan", "Ládano"]
        },
        shade: "#e4e6d8",
        liquid: "#a6a06d",
        imagen: "img/perfumes/jean-lowe-immortal.jpg"
    },

    {
        id: 19,
        nombre: "Amber Oud Gold Edition",
        marca: "Al Haramain",
        categoria: "arabe",
        genero: "unisex",
        familia: "gourmand",
        ocasion: ["formal", "noche"],
        clima: ["templado", "frio"],
        precio: 89990,
        notas: {
            salida: ["Bergamota", "Notas verdes"],
            corazon: ["Melón", "Piña", "Notas dulces"],
            fondo: ["Vainilla", "Almizcle", "Notas amaderadas"]
        },
        shade: "#eee1c8",
        liquid: "#c8a35a",
        imagen: "img/perfumes/amber-oud-gold.jpg"
    },

    {
        id: 20,
        nombre: "Hawas for Him",
        marca: "Rasasi",
        categoria: "arabe",
        genero: "hombre",
        familia: "acuatica",
        ocasion: ["diario"],
        clima: ["calido", "templado"],
        precio: 69990,
        notas: {
            salida: ["Manzana", "Bergamota", "Limón"],
            corazon: ["Notas acuáticas", "Ciruela"],
            fondo: ["Ámbar gris", "Almizcle", "Pachulí"]
        },
        shade: "#e2dded",
        liquid: "#9b85c5",
        imagen: "img/perfumes/rasasi-hawas.jpg"
    },

    // =================================================
    // 3. PERFUMES DE NICHO (10)
    // =================================================

    {
        id: 21,
        nombre: "Layton",
        marca: "Parfums de Marly",
        categoria: "nicho",
        genero: "unisex",
        familia: "amaderada",
        ocasion: ["formal", "noche"],
        clima: ["frio", "templado"],
        precio: 329990,
        notas: {
            salida: ["Manzana", "Lavanda", "Bergamota"],
            corazon: ["Violeta", "Geranio"],
            fondo: ["Vainilla", "Sándalo", "Pachulí"]
        },
        shade: "#dbe2ec",
        liquid: "#425b83",
        imagen: "img/perfumes/pdm-layton.jpg"
    },

    {
        id: 22,
        nombre: "Delina",
        marca: "Parfums de Marly",
        categoria: "nicho",
        genero: "mujer",
        familia: "floral",
        ocasion: ["diario", "formal"],
        clima: ["templado"],
        precio: 359990,
        notas: {
            salida: ["Lichi", "Ruibarbo", "Bergamota"],
            corazon: ["Rosa", "Peonía"],
            fondo: ["Almizcle", "Vainilla", "Maderas"]
        },
        shade: "#f2e0e5",
        liquid: "#d99aa9",
        imagen: "img/perfumes/pdm-delina.jpg"
    },

    {
        id: 23,
        nombre: "Aventus",
        marca: "Creed",
        categoria: "nicho",
        genero: "hombre",
        familia: "amaderada",
        ocasion: ["diario", "formal"],
        clima: ["templado", "calido"],
        precio: 399990,
        notas: {
            salida: ["Bergamota", "Piña", "Manzana"],
            corazon: ["Abedul", "Jazmín", "Pachulí"],
            fondo: ["Musgo de roble", "Almizcle", "Ámbar gris"]
        },
        shade: "#e1e5e1",
        liquid: "#8d9b88",
        imagen: "img/perfumes/creed-aventus.jpg"
    },

    {
        id: 24,
        nombre: "Baccarat Rouge 540 Eau de Parfum",
        marca: "Maison Francis Kurkdjian",
        categoria: "nicho",
        genero: "unisex",
        familia: "floral",
        ocasion: ["formal", "noche"],
        clima: ["templado", "frio"],
        precio: 429990,
        notas: {
            salida: ["Azafrán", "Jazmín"],
            corazon: ["Amberwood", "Ámbar gris"],
            fondo: ["Resina de abeto", "Cedro"]
        },
        shade: "#f1e0d9",
        liquid: "#c97965",
        imagen: "img/perfumes/baccarat-rouge.jpg"
    },

    {
        id: 25,
        nombre: "Naxos",
        marca: "Xerjoff",
        categoria: "nicho",
        genero: "unisex",
        familia: "gourmand",
        ocasion: ["formal", "noche"],
        clima: ["templado", "frio"],
        precio: 299990,
        notas: {
            salida: ["Limón", "Bergamota", "Lavanda"],
            corazon: ["Miel", "Canela", "Jazmín"],
            fondo: ["Tabaco", "Vainilla", "Haba tonka"]
        },
        shade: "#eee3c9",
        liquid: "#c5a268",
        imagen: "img/perfumes/xerjoff-naxos.jpg"
    },

    {
        id: 26,
        nombre: "Oud for Greatness",
        marca: "Initio",
        categoria: "nicho",
        genero: "unisex",
        familia: "amaderada",
        ocasion: ["noche", "formal"],
        clima: ["frio"],
        precio: 389990,
        notas: {
            salida: ["Azafrán", "Nuez moscada", "Lavanda"],
            corazon: ["Madera de oud"],
            fondo: ["Pachulí", "Almizcle"]
        },
        shade: "#e1d9d4",
        liquid: "#57473f",
        imagen: "img/perfumes/initio-oud-greatness.jpg"
    },

    {
        id: 27,
        nombre: "Bal d'Afrique",
        marca: "Byredo",
        categoria: "nicho",
        genero: "unisex",
        familia: "citrica",
        ocasion: ["diario", "formal"],
        clima: ["calido", "templado"],
        precio: 259990,
        notas: {
            salida: ["Bergamota", "Limón", "Caléndula"],
            corazon: ["Violeta", "Ciclamen"],
            fondo: ["Vetiver", "Cedro", "Almizcle"]
        },
        shade: "#f0e8d5",
        liquid: "#d6bc82",
        imagen: "img/perfumes/byredo-bal-afrique.jpg"
    },

    {
        id: 28,
        nombre: "Santal 33",
        marca: "Le Labo",
        categoria: "nicho",
        genero: "unisex",
        familia: "amaderada",
        ocasion: ["diario", "formal"],
        clima: ["templado", "frio"],
        precio: 289990,
        notas: {
            salida: ["Cardamomo", "Violeta"],
            corazon: ["Sándalo", "Cedro", "Papiro"],
            fondo: ["Cuero", "Ámbar", "Almizcle"]
        },
        shade: "#e9e2d5",
        liquid: "#b6a184",
        imagen: "img/perfumes/le-labo-santal33.jpg"
    },

    {
        id: 29,
        nombre: "Philosykos Eau de Parfum",
        marca: "Diptyque",
        categoria: "nicho",
        genero: "unisex",
        familia: "amaderada",
        ocasion: ["diario"],
        clima: ["calido", "templado"],
        precio: 239990,
        notas: {
            salida: ["Hojas de higuera", "Notas verdes"],
            corazon: ["Higo", "Madera de higuera"],
            fondo: ["Notas amaderadas", "Pimienta negra"]
        },
        shade: "#e2e9d8",
        liquid: "#8fa27a",
        imagen: "img/perfumes/diptyque-philosykos.jpg"
    },

    {
        id: 30,
        nombre: "Reflection Man",
        marca: "Amouage",
        categoria: "nicho",
        genero: "hombre",
        familia: "floral",
        ocasion: ["formal", "diario"],
        clima: ["templado"],
        precio: 349990,
        notas: {
            salida: ["Romero", "Pimienta rosa", "Petitgrain"],
            corazon: ["Jazmín", "Neroli", "Iris"],
            fondo: ["Sándalo", "Cedro", "Vetiver"]
        },
        shade: "#e8e8e2",
        liquid: "#b8b5a4",
        imagen: "img/perfumes/amouage-reflection.jpg"
    }

];
