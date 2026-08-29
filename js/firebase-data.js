// =====================================================
// FIREBASE-DATA.JS
// PKV EAST CHIT
// Firestore CRUD Helper
// =====================================================

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// GET ALL DATA
// =====================================================

export async function getData(collectionName) {

    try {

        console.log(
            `🔥 Reading Firestore collection: ${collectionName}`
        );

        const snapshot =
            await getDocs(
                collection(
                    db,
                    collectionName
                )
            );

        const data =
            snapshot.docs.map(
                doc => ({

                    id:
                        doc.id,

                    ...doc.data()

                })
            );

        console.log(
            `✅ ${collectionName}: ${data.length} documents`
        );

        return data;

    }

    catch (error) {

        console.error(
            `❌ Firebase getData error [${collectionName}]:`,
            error
        );

        return [];

    }

}


// =====================================================
// GET SINGLE DOCUMENT
// =====================================================

export async function getSingleData(
    collectionName,
    id
) {

    try {

        const docRef =
            doc(
                db,
                collectionName,
                id
            );

        const snapshot =
            await getDoc(
                docRef
            );

        if (!snapshot.exists()) {

            return null;

        }

        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };

    }
    catch (error) {

        console.error(
            `❌ Error reading ${collectionName}/${id}:`,
            error
        );

        throw error;

    }

}


// =====================================================
// ADD DATA
// =====================================================

export async function addData(
    collectionName,
    data
) {

    try {

        const collectionRef =
            collection(
                db,
                collectionName
            );

        const docRef =
            await addDoc(
                collectionRef,
                {

                    ...data,

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()

                }
            );

        console.log(
            `✅ Added ${collectionName}:`,
            docRef.id
        );

        return {

            id:
                docRef.id,

            ...data

        };

    }
    catch (error) {

        console.error(
            `❌ Firestore addData error [${collectionName}]`,
            error
        );

        throw error;

    }

}


// =====================================================
// UPDATE DATA
// =====================================================

export async function updateData(
    collectionName,
    id,
    data
) {

    try {

        if (!id) {

            throw new Error(
                "Document ID is required."
            );

        }

        const docRef =
            doc(
                db,
                collectionName,
                id
            );

        await updateDoc(
            docRef,
            {

                ...data,

                updatedAt:
                    new Date().toISOString()

            }
        );

        console.log(
            `✅ Updated ${collectionName}/${id}`
        );

        return true;

    }
    catch (error) {

        console.error(
            `❌ Firestore updateData error [${collectionName}/${id}]`,
            error
        );

        throw error;

    }

}


// =====================================================
// DELETE DATA
// =====================================================

export async function deleteData(
    collectionName,
    id
) {

    try {

        if (!id) {

            throw new Error(
                "Document ID is required."
            );

        }

        const docRef =
            doc(
                db,
                collectionName,
                id
            );

        await deleteDoc(
            docRef
        );

        console.log(
            `🗑 Deleted ${collectionName}/${id}`
        );

        return true;

    }
    catch (error) {

        console.error(
            `❌ Firestore deleteData error [${collectionName}/${id}]`,
            error
        );

        throw error;

    }

}


// =====================================================
// REALTIME LISTENER
// =====================================================

export function listenData(
    collectionName,
    callback
) {

    const collectionRef =
        collection(
            db,
            collectionName
        );

    const unsubscribe =
        onSnapshot(

            collectionRef,

            snapshot => {

                const data = [];

                snapshot.forEach(
                    docSnapshot => {

                        data.push({

                            id:
                                docSnapshot.id,

                            ...docSnapshot.data()

                        });

                    }
                );

                callback(
                    data
                );

            },

            error => {

                console.error(
                    `❌ Realtime listener error [${collectionName}]`,
                    error
                );

            }

        );

    return unsubscribe;

}


// =====================================================
// EXPORT
// =====================================================

console.log(
    "✅ firebase-data.js loaded"
);