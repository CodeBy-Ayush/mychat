import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCGCAHbb969YqALZdslBo5OHoitQJeoq3s",
    authDomain: "traveling-in-india.firebaseapp.com",
    databaseURL: "https://traveling-in-india-default-rtdb.firebaseio.com",
    projectId: "traveling-in-india",
    storageBucket: "traveling-in-india.firebasestorage.app",
    messagingSenderId: "858476339913",
    appId: "1:858476339913:web:1c8a065ebc19f56c19e318"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);