import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCkQWCsfrvOpFmeTepFR7fYT8UauQl1j70",
  authDomain: "ticoo-71755.firebaseapp.com",
  projectId: "ticoo-71755",
  storageBucket: "ticoo-71755.firebasestorage.app",
  messagingSenderId: "59741601356",
  appId: "1:59741601356:web:6668e9fb1c913c32843ee9",
  measurementId: "G-232DVJXL2N"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)