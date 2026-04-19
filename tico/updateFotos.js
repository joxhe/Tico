/**
 * updateFotos.js
 * Busca la foto de cada lugar en Firestore que no tenga foto
 * usando Google Places API (Text Search) y actualiza el documento.
 *
 * Uso:
 *   node updateFotos.js
 *
 * Requiere en .env:
 *   VITE_GOOGLE_MAPS_KEY=tu_api_key
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { config } from 'dotenv'

config({ path: '.env' })

const firebaseConfig = {
  apiKey: "AIzaSyAar3HvBweN4dmzORLC-e1xL2CxJyN7X5k",
  authDomain: "tico-app-b914b.firebaseapp.com",
  projectId: "tico-app-b914b",
  storageBucket: "tico-app-b914b.firebasestorage.app",
  messagingSenderId: "814571930909",
  appId: "1:814571930909:web:4cb38b922e2f6072738df4"
}

const MAPS_KEY = process.env.VITE_GOOGLE_MAPS_KEY

if (!MAPS_KEY) {
  console.error('❌ No se encontró VITE_GOOGLE_MAPS_KEY en el archivo .env')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// Pausa entre peticiones para no saturar la API
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/**
 * Busca el place_id de un lugar por nombre usando Text Search,
 * luego obtiene la foto con Place Details.
 * Devuelve una URL de foto o null si no encuentra nada.
 */
async function obtenerFotoDesdeGooglePlaces(nombre) {
  // 1. Text Search para encontrar el lugar
  const searchUrl =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(nombre + ' Montería Colombia')}` +
    `&key=${MAPS_KEY}`

  const searchRes  = await fetch(searchUrl)
  const searchData = await searchRes.json()

  if (searchData.status !== 'OK' || !searchData.results?.length) {
    return null
  }

  const placeId = searchData.results[0].place_id

  // 2. Place Details para obtener la referencia de foto
  const detailUrl =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}` +
    `&fields=photos` +
    `&key=${MAPS_KEY}`

  const detailRes  = await fetch(detailUrl)
  const detailData = await detailRes.json()

  if (detailData.status !== 'OK' || !detailData.result?.photos?.length) {
    return null
  }

  const photoRef = detailData.result.photos[0].photo_reference

  // 3. Construir URL permanente de la foto (maxwidth 800)
  const fotoUrl =
    `https://maps.googleapis.com/maps/api/place/photo` +
    `?maxwidth=800` +
    `&photo_reference=${photoRef}` +
    `&key=${MAPS_KEY}`

  return fotoUrl
}

async function main() {
  console.log('🔍 Obteniendo lugares desde Firestore...\n')

  const snap   = await getDocs(collection(db, 'lugares'))
  const todos  = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sinFoto = todos.filter(l => !l.foto)

  console.log(`📋 Total lugares: ${todos.length}`)
  console.log(`📷 Sin foto:      ${sinFoto.length}\n`)

  if (sinFoto.length === 0) {
    console.log('✅ Todos los lugares ya tienen foto. Nada que hacer.')
    process.exit(0)
  }

  let actualizados = 0
  let fallidos     = 0

  for (const lugar of sinFoto) {
    process.stdout.write(`🔎 Buscando foto para "${lugar.nombre}"... `)

    const fotoUrl = await obtenerFotoDesdeGooglePlaces(lugar.nombre)

    if (fotoUrl) {
      await updateDoc(doc(db, 'lugares', lugar.id), { foto: fotoUrl })
      console.log('✅ guardada')
      actualizados++
    } else {
      console.log('⚠️  no encontrada')
      fallidos++
    }

    // Esperar 500ms entre peticiones para respetar los límites de la API
    await sleep(500)
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Actualizados: ${actualizados}
⚠️  Sin foto:    ${fallidos}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `)

  process.exit(0)
}

main().catch(e => {
  console.error('❌ Error inesperado:', e)
  process.exit(1)
})