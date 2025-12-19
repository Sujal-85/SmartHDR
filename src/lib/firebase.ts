import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDeqR_diaQK_7BZz5cPBfTx8zsEEkdCHs8",
    authDomain: "smarthdr-424fd.firebaseapp.com",
    projectId: "smarthdr-424fd",
    storageBucket: "smarthdr-424fd.firebasestorage.app",
    messagingSenderId: "718288215858",
    appId: "1:718288215858:web:1be894c94e672a172f012b",
    measurementId: "G-MB4QGGM860"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
