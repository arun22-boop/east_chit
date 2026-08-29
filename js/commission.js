// =====================================
// COMMISSIONS.JS
// PKV EAST CHIT
// FIREBASE VERSION
// =====================================

import { db } from "../firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// FIREBASE COLLECTIONS
// =====================================

const groupsRef =
    collection(db, "groups");

const commissionsRef =
    collection(db, "commissions");


// =====================================
// DATA
// =====================================

let groups = [];

let commissions = [];


// =====================================
// LOAD GROUPS FROM FIREBASE
// =====================================

async function loadGroups() {

    const select =
        document.getElementById(
            "commissionGroup"
        );

    if (!select) {
        return;
    }


    try {

        const snapshot =
            await getDocs(groupsRef);


        groups =
            snapshot.docs.map(item => ({

                id: item.id,

                ...item.data()

            }));


        select.innerHTML = `

            <option value="">
                Select Group
            </option>

        `;


        groups.forEach(group => {

            select.innerHTML += `

                <option value="${group.id}">

                    ${escapeHTML(
                        group.name || "-"
                    )}

                </option>

            `;

        });


    } catch (error) {

        console.error(
            "Error loading groups:",
            error
        );


        alert(
            "Unable to load Groups from Firebase."
        );

    }

}


// =====================================
// LOAD COMMISSIONS FROM FIREBASE
// =====================================

async function loadCommissions() {

    try {

        const snapshot =
            await getDocs(
                commissionsRef
            );


        commissions =
            snapshot.docs.map(item => ({

                id: item.id,

                ...item.data()

            }));


        showCommission();


    } catch (error) {

        console.error(
            "Error loading commissions:",
            error
        );


        alert(
            "Unable to load Commission data."
        );

    }

}


// =====================================
// ADD COMMISSION
// =====================================

async function addCommission() {

    const groupId =
        document.getElementById(
            "commissionGroup"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "commissionAmount"
            ).value
        ) || 0;


    const date =
        document.getElementById(
            "commissionDate"
        ).value;


    // =================================
    // VALIDATION
    // =================================

    if (
        !groupId ||
        amount <= 0 ||
        !date
    ) {

        alert(
            "Please select Group, enter Commission Amount and Date."
        );

        return;

    }


    // =================================
    // FIND GROUP
    // =================================

    const selectedGroup =
        groups.find(
            group =>
                String(group.id) ===
                String(groupId)
        );


    if (!selectedGroup) {

        alert(
            "Selected Group not found."
        );

        return;

    }


    // =================================
    // CREATE DATA
    // =================================

    const commission = {

        groupId:
            selectedGroup.id,

        group:
            selectedGroup.name || "",

        amount:
            amount,

        date:
            date,

        createdAt:
            new Date().toISOString()

    };


    // =================================
    // SAVE TO FIREBASE
    // =================================

    try {

        const docRef =
            await addDoc(
                commissionsRef,
                commission
            );


        // Add Firebase ID locally
        commissions.push({

            id:
                docRef.id,

            ...commission

        });


        alert(
            "Commission Saved Successfully"
        );


        clearForm();


        showCommission();


    } catch (error) {

        console.error(
            "Error saving commission:",
            error
        );


        alert(
            "Commission Save Failed."
        );

    }

}


// =====================================
// SHOW COMMISSION
// =====================================

function showCommission() {

    const list =
        document.getElementById(
            "commissionList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    // =================================
    // NO DATA
    // =================================

    if (
        commissions.length === 0
    ) {

        list.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted">

                    No Commission Found

                </td>

            </tr>

        `;

        return;

    }


    // =================================
    // DISPLAY DATA
    // =================================

    commissions.forEach(
        commission => {


            let groupName =
                commission.group ||
                "Group Not Selected";


            // =================================
            // GET CURRENT GROUP NAME
            // =================================

            if (
                commission.groupId
            ) {

                const group =
                    groups.find(
                        g =>
                            String(g.id) ===
                            String(
                                commission.groupId
                            )
                    );


                if (group) {

                    groupName =
                        group.name;

                }

            }


            const amount =
                Number(
                    commission.amount || 0
                );


            list.innerHTML += `

                <tr>

                    <td>

                        ${escapeHTML(
                            groupName
                        )}

                    </td>


                    <td>

                        ₹${amount.toLocaleString(
                            "en-IN"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            commission.date ||
                            "-"
                        )}

                    </td>


                    <td>

                        <button

                            onclick="
                                deleteCommission(
                                    '${commission.id}'
                                )
                            "

                            class="btn btn-danger btn-sm">

                            🗑 Delete

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================
// DELETE COMMISSION
// =====================================

async function deleteCommission(id) {

    if (
        !confirm(
            "Delete this Commission?"
        )
    ) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "commissions",
                String(id)
            )

        );


        commissions =
            commissions.filter(
                commission =>
                    String(
                        commission.id
                    ) !==
                    String(id)
            );


        showCommission();


        alert(
            "Commission Deleted Successfully"
        );


    } catch (error) {

        console.error(
            "Error deleting commission:",
            error
        );


        alert(
            "Commission Delete Failed."
        );

    }

}


// =====================================
// CLEAR FORM
// =====================================

function clearForm() {

    const group =
        document.getElementById(
            "commissionGroup"
        );


    const amount =
        document.getElementById(
            "commissionAmount"
        );


    const date =
        document.getElementById(
            "commissionDate"
        );


    if (group) {

        group.value = "";

    }


    if (amount) {

        amount.value = "";

    }


    if (date) {

        date.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================

window.addCommission =
    addCommission;


window.deleteCommission =
    deleteCommission;


window.clearForm =
    clearForm;


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Default date

        const date =
            document.getElementById(
                "commissionDate"
            );


        if (
            date &&
            !date.value
        ) {

            date.value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }


        // Load Firebase data

        await loadGroups();

        await loadCommissions();

    }
);