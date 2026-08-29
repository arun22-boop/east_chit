// =====================================
// FIREBASE-DATA.JS
// PKV EAST CHIT
// COMMON FIREBASE CRUD HELPER
// =====================================

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";


// =====================================
// GET ALL DATA
// =====================================

export async function getData(collectionName) {

    try {

        const collectionRef =
            collection(db, collectionName);

        const q =
            query(
                collectionRef,
                orderBy("createdAt", "desc")
            );

        const snapshot =
            await getDocs(q);

        const data = [];

        snapshot.forEach(docSnapshot => {

            data.push({

                id: docSnapshot.id,

                ...docSnapshot.data()

            });

        });

        return data;

    } catch (error) {

        console.error(
            `Error getting ${collectionName}:`,
            error
        );

        // ---------------------------------
        // FALLBACK
        // ---------------------------------

        try {

            const collectionRef =
                collection(db, collectionName);

            const snapshot =
                await getDocs(collectionRef);

            const data = [];

            snapshot.forEach(docSnapshot => {

                data.push({

                    id: docSnapshot.id,

                    ...docSnapshot.data()

                });

            });

            return data;

        } catch (fallbackError) {

            console.error(
                "Firebase fallback error:",
                fallbackError
            );

            throw fallbackError;

        }

    }

}


// =====================================
// GET SINGLE DATA
// =====================================

export async function getSingleData(
    collectionName,
    id
) {

    try {

        if (!id) {

            return null;

        }


        const documentRef =
            doc(
                db,
                collectionName,
                String(id)
            );


        const snapshot =
            await getDoc(documentRef);


        if (!snapshot.exists()) {

            return null;

        }


        return {

            id: snapshot.id,

            ...snapshot.data()

        };

    } catch (error) {

        console.error(
            `Error getting ${collectionName} document:`,
            error
        );

        throw error;

    }

}


// =====================================
// ADD DATA
// =====================================

export async function addData(
    collectionName,
    data
) {

    try {

        if (
            !collectionName ||
            !data
        ) {

            throw new Error(
                "Collection name and data are required"
            );

        }


        const collectionRef =
            collection(
                db,
                collectionName
            );


        const dataToSave = {

            ...data,

            createdAt:
                data.createdAt ||
                new Date().toISOString()

        };


        const documentRef =
            await addDoc(
                collectionRef,
                dataToSave
            );


        return {

            id: documentRef.id,

            ...dataToSave

        };

    } catch (error) {

        console.error(
            `Error adding data to ${collectionName}:`,
            error
        );

        throw error;

    }

}


// =====================================
// UPDATE DATA
// =====================================

export async function updateData(
    collectionName,
    id,
    data
) {

    try {

        if (
            !collectionName ||
            !id ||
            !data
        ) {

            throw new Error(
                "Collection name, ID and data are required"
            );

        }


        const documentRef =
            doc(
                db,
                collectionName,
                String(id)
            );


        await updateDoc(
            documentRef,
            {

                ...data,

                updatedAt:
                    new Date().toISOString()

            }
        );


        return {

            id: String(id),

            ...data

        };

    } catch (error) {

        console.error(
            `Error updating ${collectionName}:`,
            error
        );

        throw error;

    }

}


// =====================================
// DELETE DATA
// =====================================

export async function deleteData(
    collectionName,
    id
) {

    try {

        if (
            !collectionName ||
            !id
        ) {

            throw new Error(
                "Collection name and ID are required"
            );

        }


        const documentRef =
            doc(
                db,
                collectionName,
                String(id)
            );


        await deleteDoc(
            documentRef
        );


        return true;

    } catch (error) {

        console.error(
            `Error deleting ${collectionName}:`,
            error
        );

        throw error;

    }

}