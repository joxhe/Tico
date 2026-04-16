import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAar3HvBweN4dmzORLC-e1xL2CxJyN7X5k",
  authDomain: "tico-app-b914b.firebaseapp.com",
  projectId: "tico-app-b914b",
  storageBucket: "tico-app-b914b.firebasestorage.app",
  messagingSenderId: "814571930909",
  appId: "1:814571930909:web:4cb38b922e2f6072738df4"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)