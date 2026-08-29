// =====================================================
// BACKUP LOCALSTORAGE DATA TO FIREBASE
// =====================================================

export async function backupLocalStorageToFirebase() {

    const collections = [
        "members",
        "witnesses",
        "groups",
        "installments",
        "collections",
        "commissions",
        "expenses"
    ];

    const results = {};

    for (const collectionName of collections) {

        try {

            const localData =
                JSON.parse(
                    localStorage.getItem(collectionName)
                ) || [];

            let count = 0;

            for (const item of localData) {

                const data = {
                    ...item
                };

                // Remove localStorage ID
                // Firebase will create its own ID
                delete data.id;

                await addDoc(
                    collection(db, collectionName),
                    data
                );

                count++;

            }

            results[collectionName] = count;

            console.log(
                `✅ ${collectionName}: ${count} records backed up`
            );

        } catch (error) {

            console.error(
                `❌ Backup failed: ${collectionName}`,
                error
            );

            results[collectionName] = 0;

        }

    }

    return results;
}