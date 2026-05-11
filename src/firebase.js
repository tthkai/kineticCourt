// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwx2bjB_5yNXjI-IJ4aRy-cRAxi8oyunc",
  authDomain: "kinetic-court-f04d3.firebaseapp.com",
  projectId: "kinetic-court-f04d3",
  storageBucket: "kinetic-court-f04d3.firebasestorage.app",
  messagingSenderId: "418839662981",
  appId: "1:418839662981:web:925146c400abd2e5acf4ec"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo và export các dịch vụ (Chỉ khai báo 1 lần duy nhất)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // Bắt buộc phải có cho tính năng Login Google