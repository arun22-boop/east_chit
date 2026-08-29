// =====================================================
// FIREBASE.JS
// PKV EAST CHIT
// FIREBASE + FIRESTORE CONFIGURATION
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyDgysQFE5J8HlcDHHhQ-1K83ECF_k-9Jvo",

    authDomain:
        "chitaccount.firebaseapp.com",

    projectId:
        "chitaccount",

    storageBucket:
        "chitaccount.firebasestorage.app",

    messagingSenderId:
        "1018588388613",

    appId:
        "1:1018588388613:web:7e4e89487056f023ca6b6c",

    measurementId:
        "G-5S6EZ1FZ3W"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(
        firebaseConfig
    );


// =====================================================
// FIRESTORE
// =====================================================

const db =
    getFirestore(
        app
    );


// =====================================================
// AUTH
// =====================================================

const auth =
    getAuth(
        app
    );


// =====================================================
// LOG
// =====================================================

console.log(
    "🔥 Firebase initialized"
);

console.log(
    "firebase.js: Project:",
    firebaseConfig.projectId
);

console.log(
    "🔥 Firestore DB:",
    db
);


// =====================================================
// EXPORT FIREBASE APP
// =====================================================

export {
    app,
    db,
    auth
};


// =====================================================
// EXPORT FIRESTORE FUNCTIONS
// =====================================================

export {
    collection,
    doc,

    addDoc,
    getDoc,
    getDocs,

    updateDoc,
    deleteDoc,
    setDoc,

    query,
    where,
    orderBy,
    limit,

    onSnapshot,

    serverTimestamp,
    Timestamp
};


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default app;


// =====================================================
// READY
// =====================================================

console.log(
    "✅ firebase.js loaded successfully"
);