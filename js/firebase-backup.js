import { db } from "../firebase-config.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// COLLECTIONS
// =====================================================

const backupCollections = [

    "members",
    "witnesses",
    "groups",
    "installments",
    "collections",
    "commissions",
    "expenses"

];


// =====================================================
// GET LOCAL STORAGE
// =====================================================

function getLocalData(key) {

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || [];

    } catch (error) {

        console.error(
            "LocalStorage error:",
            key,
            error
        );

        return [];

    }

}


// =====================================================
// LOAD COUNTS
// =====================================================

function loadCounts() {

    backupCollections.forEach(key => {

        const data =
            getLocalData(key);

        const element =
            document.getElementById(
                key + "Count"
            );

        if (element) {

            element.innerText =
                data.length;

        }

    });

}


// =====================================================
// STATUS
// =====================================================

function showStatus(
    message,
    type = "secondary"
) {

    const status =
        document.getElementById(
            "backupStatus"
        );

    if (!status) return;

    status.className =
        `alert alert-${type}`;

    status.innerText =
        message;

}


// =====================================================
// BACKUP ONE COLLECTION
// =====================================================

async function backupCollection(
    collectionName
) {

    const data =
        getLocalData(
            collectionName
        );

    if (data.length === 0) {

        return 0;

    }


    let count = 0;


    for (const item of data) {

        // Remove localStorage ID
        // because Firebase creates
        // its own document ID.

        const firebaseData = {
            ...item
        };


        delete firebaseData.id;


        await addDoc(

            collection(
                db,
                collectionName
            ),

            firebaseData

        );


        count++;

    }


    return count;

}


// =====================================================
// BACKUP ALL DATA
// =====================================================

async function backupAllData() {

    const button =
        document.getElementById(
            "backupBtn"
        );


    if (!button) return;


    const confirmBackup =
        confirm(

            "Backup all LocalStorage data to Firebase?"

        );


    if (!confirmBackup) {

        return;

    }


    button.disabled = true;

    button.innerText =
        "⏳ Backing up...";


    try {

        let total = 0;


        for (
            const collectionName
            of backupCollections
        ) {

            showStatus(

                `⏳ Backing up ${collectionName}...`,

                "warning"

            );


            const count =
                await backupCollection(
                    collectionName
                );


            total += count;

        }


        showStatus(

            `✅ Backup completed successfully! ${total} records uploaded.`,

            "success"

        );


        button.innerText =
            "✅ Backup Completed";


    } catch (error) {

        console.error(
            "Firebase Backup Error:",
            error
        );


        showStatus(

            "❌ Backup failed: " +
            error.message,

            "danger"

        );


        button.innerText =
            "🔥 Backup All Data to Firebase";

    }


    button.disabled = false;

}


// =====================================================
// MAKE FUNCTION AVAILABLE TO HTML
// =====================================================

window.backupAllData =
    backupAllData;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCounts();

    }
);