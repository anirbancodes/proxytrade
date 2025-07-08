import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  increment,
  deleteField,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhn1pgMa_mS4wqVrn8lwYiIrRZjkWANWo",
  authDomain: "qc-invest.firebaseapp.com",
  databaseURL:
    "https://qc-invest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "qc-invest",
  storageBucket: "qc-invest.appspot.com",
  messagingSenderId: "936010698151",
  appId: "1:936010698151:web:bf6e4b103133588a1bfa82",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  app,
  auth,
  db,
  setPersistence,
  browserSessionPersistence,
  doc,
  getDoc,
  updateDoc,
  onAuthStateChanged,
  increment,
  setDoc,
  arrayUnion,
  deleteField,
};
