// =====================================================
// WITNESS.JS
// WITNESS MANAGEMENT - FIREBASE
// =====================================================

import {
    getData,
    addData,
    updateData,
    deleteData
} from "./firebase-data.js";


// =====================================================
// DATA
// =====================================================

let witnesses = [];

let editId = null;


// =====================================================
// LOAD WITNESSES
// =====================================================

async function loadWitnesses() {

    try {

        witnesses = await getData("witnesses");

        if (!Array.isArray(witnesses)) {

            witnesses = [];

        }

        showWitnesses();

    }

    catch (error) {

        console.error(
            "Load Witnesses Error:",
            error
        );

        witnesses = [];

        showWitnesses();

        alert(
            "Unable to load witnesses from Firebase."
        );

    }

}


// =====================================================
// ADD / UPDATE WITNESS
// =====================================================

async function addWitness() {


    const nameElement =
        document.getElementById(
            "witnessName"
        );


    const mobileElement =
        document.getElementById(
            "witnessMobile"
        );


    const addressElement =
        document.getElementById(
            "witnessAddress"
        );


    if (!nameElement) {

        alert(
            "Witness Name field not found."
        );

        return;

    }


    const name =
        nameElement.value.trim();


    const mobile =
        mobileElement
            ? mobileElement.value.trim()
            : "";


    const address =
        addressElement
            ? addressElement.value.trim()
            : "";


    // =================================================
    // VALIDATION
    // =================================================

    if (!name) {

        alert(
            "Please enter Witness Name."
        );

        nameElement.focus();

        return;

    }


    // =================================================
    // MOBILE VALIDATION
    // =================================================

    if (mobile) {

        const cleanMobile =
            mobile.replace(
                /\D/g,
                ""
            );


        if (
            cleanMobile.length !== 10
        ) {

            alert(
                "Please enter a valid 10 digit Mobile Number."
            );

            mobileElement.focus();

            return;

        }

    }


    // =================================================
    // DUPLICATE MOBILE
    // =================================================

    if (
        mobile &&
        isDuplicateMobile(
            mobile,
            editId
        )
    ) {

        alert(
            "This Mobile Number is already registered."
        );

        return;

    }


    try {


        // =============================================
        // UPDATE
        // =============================================

        if (editId !== null) {


            await updateData(

                "witnesses",

                editId,

                {

                    name:
                        name,

                    mobile:
                        mobile,

                    address:
                        address,

                    updatedAt:
                        new Date()
                            .toISOString()

                }

            );


            alert(
                "Witness Updated Successfully."
            );

        }


        // =============================================
        // ADD
        // =============================================

        else {


            await addData(

                "witnesses",

                {

                    name:
                        name,

                    mobile:
                        mobile,

                    address:
                        address,

                    createdAt:
                        new Date()
                            .toISOString()

                }

            );


            alert(
                "Witness Saved Successfully."
            );

        }


        // =============================================
        // RESET
        // =============================================

        clearForm();


        await loadWitnesses();


    }

    catch (error) {


        console.error(
            "Witness Save Error:",
            error
        );


        alert(
            "Unable to save witness. Please check Firebase connection."
        );

    }

}


// =====================================================
// CHECK DUPLICATE MOBILE
// =====================================================

function isDuplicateMobile(
    mobile,
    currentId = null
) {


    const cleanMobile =
        mobile.replace(
            /\D/g,
            ""
        );


    return witnesses.some(
        witness => {


            const witnessMobile =
                String(
                    witness.mobile || ""
                )
                .replace(
                    /\D/g,
                    ""
                );


            const sameMobile =
                witnessMobile ===
                cleanMobile;


            const differentWitness =
                String(
                    witness.id
                ) !==
                String(
                    currentId
                );


            return (
                sameMobile &&
                differentWitness
            );

        }
    );

}


// =====================================================
// SHOW WITNESSES
// =====================================================

function showWitnesses() {


    const list =
        document.getElementById(
            "witnessList"
        );


    if (!list) {

        return;

    }


    list.innerHTML = "";


    // =================================================
    // NO DATA
    // =================================================

    if (
        !Array.isArray(witnesses) ||
        witnesses.length === 0
    ) {


        list.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted">

                    No Witnesses Found

                </td>

            </tr>

        `;


        return;

    }


    // =================================================
    // DISPLAY
    // =================================================

    witnesses.forEach(
        witness => {


            const id =
                escapeHTML(
                    witness.id
                );


            list.innerHTML += `

                <tr>


                    <td>

                        ${escapeHTML(
                            witness.name || "-"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            witness.mobile || "-"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            witness.address || "-"
                        )}

                    </td>


                    <td>


                        <button
                            type="button"
                            class="btn btn-primary btn-sm me-1"
                            onclick="editWitness('${id}')">

                            ✏ Edit

                        </button>


                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="deleteWitness('${id}')">

                            🗑 Remove

                        </button>


                    </td>


                </tr>

            `;

        }
    );

}


// =====================================================
// EDIT WITNESS
// =====================================================

function editWitness(id) {


    const witness =
        witnesses.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!witness) {

        alert(
            "Witness Not Found."
        );

        return;

    }


    const nameElement =
        document.getElementById(
            "witnessName"
        );


    const mobileElement =
        document.getElementById(
            "witnessMobile"
        );


    const addressElement =
        document.getElementById(
            "witnessAddress"
        );


    if (nameElement) {

        nameElement.value =
            witness.name || "";

    }


    if (mobileElement) {

        mobileElement.value =
            witness.mobile || "";

    }


    if (addressElement) {

        addressElement.value =
            witness.address || "";

    }


    editId =
        witness.id;


    // =================================================
    // CHANGE BUTTON
    // =================================================

    const saveButton =
        document.getElementById(
            "witnessSaveBtn"
        );


    if (saveButton) {

        saveButton.innerHTML =
            "✏ Update Witness";

        saveButton.classList.remove(
            "btn-success"
        );

        saveButton.classList.add(
            "btn-primary"
        );

    }


    // =================================================
    // SCROLL TOP
    // =================================================

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================================
// DELETE WITNESS
// =====================================================

async function deleteWitness(id) {


    const witness =
        witnesses.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!witness) {

        alert(
            "Witness Not Found."
        );

        return;

    }


    const confirmDelete =
        confirm(

            `Are you sure you want to delete "${witness.name}"?`

        );


    if (!confirmDelete) {

        return;

    }


    try {


        await deleteData(

            "witnesses",

            id

        );


        alert(
            "Witness Deleted Successfully."
        );


        // =============================================
        // IF EDITING
        // =============================================

        if (
            String(editId) ===
            String(id)
        ) {

            clearForm();

        }


        await loadWitnesses();


    }

    catch (error) {


        console.error(
            "Delete Witness Error:",
            error
        );


        alert(
            "Unable to delete witness."
        );

    }

}


// =====================================================
// CLEAR FORM
// =====================================================

function clearForm() {


    const nameElement =
        document.getElementById(
            "witnessName"
        );


    const mobileElement =
        document.getElementById(
            "witnessMobile"
        );


    const addressElement =
        document.getElementById(
            "witnessAddress"
        );


    if (nameElement) {

        nameElement.value =
            "";

    }


    if (mobileElement) {

        mobileElement.value =
            "";

    }


    if (addressElement) {

        addressElement.value =
            "";

    }


    editId =
        null;


    // =================================================
    // RESET BUTTON
    // =================================================

    const saveButton =
        document.getElementById(
            "witnessSaveBtn"
        );


    if (saveButton) {

        saveButton.innerHTML =
            "➕ Save Witness";

        saveButton.classList.remove(
            "btn-primary"
        );

        saveButton.classList.add(
            "btn-success"
        );

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

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


// =====================================================
// WINDOW FUNCTIONS
// =====================================================

window.addWitness =
    addWitness;


window.editWitness =
    editWitness;


window.deleteWitness =
    deleteWitness;


window.clearWitnessForm =
    clearForm;


window.loadWitnesses =
    loadWitnesses;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadWitnesses();

    }
);