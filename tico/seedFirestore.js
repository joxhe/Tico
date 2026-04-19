import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAar3HvBweN4dmzORLC-e1xL2CxJyN7X5k",
  authDomain: "tico-app-b914b.firebaseapp.com",
  projectId: "tico-app-b914b",
  storageBucket: "tico-app-b914b.firebasestorage.app",
  messagingSenderId: "814571930909",
  appId: "1:814571930909:web:4cb38b922e2f6072738df4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const lugares = [

  // 🌿 NATURALEZA
  {
    nombre: "Ronda del Sinú",
    categoria: "naturaleza",
    descripcion: "Zona verde y recreativa a orillas del río Sinú, perfecta para descansar, hacer deporte y conectar con la naturaleza en pleno corazón de la ciudad.",
    lat: 8.75703276037546, lng: -75.88735491835867,
    calificacion: 4.6, distancia: "1.5 km",
    horario: "Abierto todo el día", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Río Sinú",
    categoria: "naturaleza",
    descripcion: "El río Sinú es la arteria natural de Montería. Sus riberas son escenario de vida cotidiana, pesca artesanal y paisajes inigualables al amanecer y al atardecer.",
    lat: 8.720671879376194, lng: -75.94538615120415,
    calificacion: 4.8, distancia: "0.5 km",
    horario: "Abierto todo el día", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },

  // 🏛️ CULTURA
  {
    nombre: "Museo Zenú de Arte Contemporáneo",
    categoria: "cultura",
    descripcion: "Espacio dedicado al arte contemporáneo con raíces en la cultura Zenú. Exhibe obras de artistas cordobeses y del Caribe colombiano en un edificio de diseño único.",
    lat: 8.755963744514933, lng: -75.88864619026093,
    calificacion: 4.5, distancia: "1.4 km",
    horario: "Mar-Dom 9:00 AM – 5:00 PM", precio: "$5.000 COP",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Iglesia de San Carlos Borromeo",
    categoria: "cultura",
    descripcion: "Iglesia colonial ubicada en el corazón del municipio de San Carlos, Córdoba. Referente espiritual e histórico de la región con arquitectura religiosa tradicional.",
    lat: 8.7963656680769, lng: -75.69896390375142,
    calificacion: 4.6, distancia: "45 km",
    horario: "8:00 AM – 6:00 PM", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Parque Principal de San Carlos",
    categoria: "cultura",
    descripcion: "Corazón del municipio de San Carlos, Córdoba. Un parque tranquilo rodeado de la arquitectura típica del pueblo, ideal para descansar y conocer la vida local.",
    lat: 8.796428115820254, lng: -75.69955689701823,
    calificacion: 4.4, distancia: "45 km",
    horario: "Abierto todo el día", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },

  // 🛍️ TURISMO
  {
    nombre: "Alamedas Centro Comercial",
    categoria: "turismo",
    descripcion: "El centro comercial más grande de Montería, con tiendas, restaurantes, cine y entretenimiento para toda la familia.",
    lat: 8.763318659540218, lng: -75.87356268047876,
    calificacion: 4.4, distancia: "2.1 km",
    horario: "10:00 AM – 9:00 PM", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Centro Comercial Buenavista Montería",
    categoria: "turismo",
    descripcion: "Moderno centro comercial con amplia oferta de marcas nacionales e internacionales, zona de comidas y entretenimiento familiar.",
    lat: 8.779018232135924, lng: -75.86151176142431,
    calificacion: 4.3, distancia: "3.5 km",
    horario: "10:00 AM – 9:00 PM", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Centro Comercial Nuestro Montería",
    categoria: "turismo",
    descripcion: "Centro comercial céntrico con tiendas de ropa, accesorios y una variada zona gastronómica. Popular entre los monteríanos para el día a día.",
    lat: 8.743285562075807, lng: -75.86797611538857,
    calificacion: 4.2, distancia: "1.0 km",
    horario: "9:00 AM – 8:00 PM", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },

  // 🍽️ GASTRONOMÍA
  {
    nombre: "Córdova Restaurante",
    categoria: "gastronomia",
    descripcion: "Restaurante insignia de la cocina cordobesa, con platos tradicionales como mote de queso, cabeza de gato y suero costeño en un ambiente acogedor.",
    lat: 8.776442381399374, lng: -75.84742462095146,
    calificacion: 4.7, distancia: "1.3 km",
    horario: "Todos los días 12:00 PM – 10:00 PM", precio: "Desde $25.000",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Brasa Caribe",
    categoria: "gastronomia",
    descripcion: "Especialistas en carnes a la brasa y asados al estilo caribeño. Ambiente relajado, porciones generosas y sabores que representan lo mejor de la costa.",
    lat: 8.755665667506877, lng: -75.86910296327898,
    calificacion: 4.6, distancia: "1.8 km",
    horario: "Mar-Dom 12:00 PM – 11:00 PM", precio: "Desde $30.000",
    foto: null, vrDisponible: false
  },
  {
    nombre: "Occa",
    categoria: "gastronomia",
    descripcion: "Propuesta gastronómica moderna con fusión de ingredientes locales y técnicas contemporáneas. Ideal para una experiencia culinaria diferente en Montería.",
    lat: 8.773728957181556, lng: -75.86657516142434,
    calificacion: 4.8, distancia: "1.6 km",
    horario: "Mar-Sab 12:00 PM – 11:00 PM", precio: "Desde $40.000",
    foto: null, vrDisponible: false
  },

  // 🌿 NATURALEZA - SAN CARLOS
  {
    nombre: "Cerro Colosiná - San Carlos",
    categoria: "naturaleza",
    descripcion: "Cerro emblemático del municipio de San Carlos, Córdoba. Ofrece una vista panorámica inigualable del paisaje cordobés y es punto de referencia natural para locales y visitantes.",
    lat: 8.797494252928422, lng: -75.69611388667089,
    calificacion: 4.5, distancia: "46 km",
    horario: "Abierto todo el día", precio: "Entrada libre",
    foto: null, vrDisponible: false
  },

];

async function seed() {
  console.log(`🚀 Agregando ${lugares.length} lugares nuevos...\n`);
  for (const lugar of lugares) {
    await addDoc(collection(db, "lugares"), lugar);
    console.log(`✅ Subido: ${lugar.nombre} (${lugar.categoria})`);
  }
  console.log(`\n🎉 ¡Listo! ${lugares.length} lugares agregados a Firestore.`);
}

seed();