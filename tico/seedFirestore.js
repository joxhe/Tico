import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAar3HvBweN4dmzORLC-e1xL2CxJyN7X5k",   // ← pega tu apiKey real aquí
  authDomain: "tico-app-b914b.firebaseapp.com",
  projectId: "tico-app-b914b",
  storageBucket: "tico-app-b914b.appspot.com",
  messagingSenderId: "814571930909",
  appId: "1:814571930909:web:4cb38b922e2f6072738df4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const lugaresConFoto = [
  {
    nombre: "Malecón del Río Sinú",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Malec%C3%B3n_del_R%C3%ADo_Sin%C3%BA%2C_Monter%C3%ADa.jpg/1280px-Malec%C3%B3n_del_R%C3%ADo_Sin%C3%BA%2C_Monter%C3%ADa.jpg"
  },
  {
    nombre: "Catedral San Jerónimo",
    foto: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Catedral_San_Jer%C3%B3nimo_de_Monter%C3%ADa_en_la_celebraci%C3%B3n_de_los_240_a%C3%B1os_de_la_ciudad._.jpg"
  },
  {
    nombre: "Cocina de la Abuela",
    foto: "https://images.unsplash.com/photo-1600585154340-be6161a56a9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // plato típico colombiano (mote de queso estilo)
  },
  {
    nombre: "Parque Simón Bolívar",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Parque_Sim%C3%B3n_Bol%C3%ADvar_Monter%C3%ADa.jpg/1280px-Parque_Sim%C3%B3n_Bol%C3%ADvar_Monter%C3%ADa.jpg"  // si no carga, cámbiala por una de Unsplash "parque tropical Colombia"
  },
  {
    nombre: "Reserva Natural Paramillo",
    foto: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Paramillo_National_Natural_Park.jpg/1280px-Paramillo_National_Natural_Park.jpg"
  }
];

async function actualizarFotos() {
  try {
    const snapshot = await getDocs(collection(db, "lugares"));
    
    let actualizados = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const lugarConFoto = lugaresConFoto.find(l => l.nombre === data.nombre);

      if (lugarConFoto) {
        await updateDoc(doc(db, "lugares", docSnap.id), {
          foto: lugarConFoto.foto
        });
        console.log(`✅ Foto actualizada: ${data.nombre}`);
        actualizados++;
      } else {
        console.log(`⚠️ No se encontró foto para: ${data.nombre}`);
      }
    }

    console.log(`🎉 Proceso terminado! ${actualizados} documentos actualizados con foto.`);
  } catch (error) {
    console.error("❌ Error al actualizar fotos:", error);
  }
}

actualizarFotos();