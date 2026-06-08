// Gunakan Firebase versi terbaru (v10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Kunci asli dari Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyAiazWqJXKYT_GG8r6e9WVEmlxMkLmEzC8",
  databaseURL: "https://biocycleaquaponik-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Menyalakan mesin Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);