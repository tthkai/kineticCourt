import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwx2bjB_5yNXjI-IJ4aRy-cRAxi8oyunc",
  authDomain: "kinetic-court-f04d3.firebaseapp.com",
  projectId: "kinetic-court-f04d3",
  storageBucket: "kinetic-court-f04d3.firebasestorage.app",
  messagingSenderId: "418839662981",
  appId: "1:418839662981:web:925146c400abd2e5acf4ec"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);