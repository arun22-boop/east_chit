// =====================================================
// FIREBASE CONFIGURATION
// PKV EAST CHIT
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyDgysQFE5J8HlcDHHhQ-1K83ECF_k-9Jvo",

    authDomain: "chitaccount.firebaseapp.com",

    projectId: "chitaccount",

    storageBucket: "chitaccount.firebasestorage.app",

    messagingSenderId: "1018588388613",

    appId: "1:1018588388613:web:7e4e89487056f023ca6b6c",

    measurementId: "G-5S6EZ1FZ3W"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


// =====================================================
// INITIALIZE FIRESTORE
// =====================================================

const db =
    getFirestore(app);


console.log(
    "✅ Firebase initialized successfully"
);

console.log(
    "✅ Firestore connected:",
    firebaseConfig.projectId
);


// =====================================================
// EXPORT
// =====================================================

export {
    app,
    db
};