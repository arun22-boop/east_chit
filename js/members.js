// =====================================================
// MEMBERS.JS
// MEMBER MANAGEMENT - FIREBASE
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

let members = [];
let witnesses = [];

let selectedWitness = [];
let editId = null;


// =====================================================
// LOAD MEMBERS
// =====================================================

async function loadMembers() {

    try {

        members = await getData("members");

        if (!Array.isArray(members)) {
            members = [];
        }

        showMembers();

    }

    catch (error) {

        console.error(
            "Load Members Error:",
            error
        );

        members = [];

        showMembers();

        alert(
            "Unable to load members from Firebase."
        );

    }

}


// =====================================================
// LOAD WITNESSES
// =====================================================

async function loadWitness() {

    try {

        witnesses = await getData("witnesses");

        if (!Array.isArray(witnesses)) {
            witnesses = [];
        }

    }

    catch (error) {

        console.error(
            "Load Witness Error:",
            error
        );

        witnesses = [];

    }


    // =================================================
    // DEFAULT WITNESSES
    // =================================================

    if (witnesses.length === 0) {

        witnesses = [

            {
                name: "Witness 1",
                mobile: ""
            },

            {
                name: "Witness 2",
                mobile: ""
            }

        ];

    }


    const select =
        document.getElementById(
            "witnessSelect"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select Witness
        </option>

    `;


    witnesses.forEach(
        witness => {

            const name =
                String(
                    witness.name || ""
                ).trim();


            if (!name) {
                return;
            }


            select.innerHTML += `

                <option value="${escapeHTML(name)}">

                    ${escapeHTML(name)}

                </option>

            `;

        }
    );

}


// =====================================================
// ADD WITNESS
// =====================================================

function addWitness() {

    const select =
        document.getElementById(
            "witnessSelect"
        );


    if (!select) {

        alert(
            "Witness field not found."
        );

        return;

    }


    const value =
        select.value.trim();


    if (!value) {

        alert(
            "Please Select Witness"
        );

        return;

    }


    // =================================================
    // AVOID DUPLICATE WITNESS
    // =================================================

    if (
        !selectedWitness.includes(value)
    ) {

        selectedWitness.push(value);

    }
    else {

        alert(
            "This witness is already selected."
        );

    }


    showWitness();

}


// =====================================================
// SHOW SELECTED WITNESS
// =====================================================

function showWitness() {

    const list =
        document.getElementById(
            "witnessList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (
        selectedWitness.length === 0
    ) {

        return;

    }


    selectedWitness.forEach(
        (witness, index) => {

            list.innerHTML += `

                <li
                    class="list-group-item d-flex justify-content-between align-items-center">

                    <span>
                        ${escapeHTML(witness)}
                    </span>

                    <button
                        type="button"
                        onclick="removeWitness(${index})"
                        class="btn btn-danger btn-sm">

                        🗑 Remove

                    </button>

                </li>

            `;

        }
    );

}


// =====================================================
// REMOVE WITNESS
// =====================================================

function removeWitness(index) {

    if (
        index < 0 ||
        index >= selectedWitness.length
    ) {

        return;

    }


    selectedWitness.splice(
        index,
        1
    );


    showWitness();

}


// =====================================================
// GET FORM DATA
// =====================================================

function getFormData() {

    const nameElement =
        document.getElementById(
            "memberName"
        );


    const mobileElement =
        document.getElementById(
            "mobile"
        );


    const addressElement =
        document.getElementById(
            "address"
        );


    const joinDateElement =
        document.getElementById(
            "joinDate"
        );


    return {

        name:
            nameElement
                ? nameElement.value.trim()
                : "",

        mobile:
            mobileElement
                ? mobileElement.value.trim()
                : "",

        address:
            addressElement
                ? addressElement.value.trim()
                : "",

        joinDate:
            joinDateElement
                ? joinDateElement.value
                : ""

    };

}


// =====================================================
// VALIDATE MEMBER
// =====================================================

function validateMember(
    name,
    mobile
) {


    if (!name) {

        alert(
            "Please enter Member Name."
        );

        return false;

    }


    if (!mobile) {

        alert(
            "Please enter Mobile Number."
        );

        return false;

    }


    // =================================================
    // MOBILE VALIDATION
    // =================================================

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

        return false;

    }


    return true;

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


    return members.some(
        member => {

            const memberMobile =
                String(
                    member.mobile || ""
                )
                .replace(
                    /\D/g,
                    ""
                );


            const sameMobile =
                memberMobile ===
                cleanMobile;


            const differentMember =
                String(member.id) !==
                String(currentId);


            return (
                sameMobile &&
                differentMember
            );

        }
    );

}


// =====================================================
// ADD / UPDATE MEMBER
// =====================================================

async function addMember() {

    const form =
        getFormData();


    const name =
        form.name;


    const mobile =
        form.mobile;


    const address =
        form.address;


    const joinDate =
        form.joinDate;


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !validateMember(
            name,
            mobile
        )
    ) {

        return;

    }


    // =================================================
    // DUPLICATE MOBILE
    // =================================================

    if (
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
        // UPDATE MEMBER
        // =============================================

        if (editId !== null) {

            await updateData(

                "members",

                editId,

                {

                    name:
                        name,

                    mobile:
                        mobile,

                    address:
                        address,

                    joinDate:
                        joinDate,

                    witness:
                        [...selectedWitness],

                    updatedAt:
                        new Date()
                            .toISOString()

                }

            );


            alert(
                "Member Updated Successfully"
            );

        }


        // =============================================
        // ADD MEMBER
        // =============================================

        else {

            await addData(

                "members",

                {

                    name:
                        name,

                    mobile:
                        mobile,

                    address:
                        address,

                    joinDate:
                        joinDate,

                    witness:
                        [...selectedWitness],

                    createdAt:
                        new Date()
                            .toISOString()

                }

            );


            alert(
                "Member Saved Successfully"
            );

        }


        // =============================================
        // RESET
        // =============================================

        clearForm();


        await loadMembers();

    }

    catch (error) {

        console.error(
            "Member Save Error:",
            error
        );


        alert(
            "Unable to save member. Please check Firebase connection."
        );

    }

}


// =====================================================
// SHOW MEMBERS
// =====================================================

function showMembers() {

    const list =
        document.getElementById(
            "memberList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    // =================================================
    // NO MEMBERS
    // =================================================

    if (
        !Array.isArray(members) ||
        members.length === 0
    ) {

        list.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted">

                    No Members Found

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // DISPLAY MEMBERS
    // =================================================

    members.forEach(
        member => {

            let witnessText = "-";


            if (
                Array.isArray(
                    member.witness
                ) &&
                member.witness.length > 0
            ) {

                witnessText =
                    member.witness
                        .map(
                            witness =>
                                escapeHTML(
                                    witness
                                )
                        )
                        .join("<br>");

            }


            const memberId =
                escapeHTML(
                    member.id
                );


            list.innerHTML += `

                <tr>

                    <td>

                        ${escapeHTML(
                            member.name || "-"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            member.mobile || "-"
                        )}

                    </td>


                    <td>

                        ${witnessText}

                    </td>


                    <td>

                        <button
                            type="button"
                            onclick="editMember('${memberId}')"
                            class="btn btn-primary btn-sm me-1">

                            ✏ Edit

                        </button>


                        <button
                            type="button"
                            onclick="deleteMember('${memberId}')"
                            class="btn btn-danger btn-sm">

                            🗑 Remove

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// EDIT MEMBER
// =====================================================

function editMember(id) {

    const member =
        members.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!member) {

        alert(
            "Member Not Found"
        );

        return;

    }


    const nameElement =
        document.getElementById(
            "memberName"
        );


    const mobileElement =
        document.getElementById(
            "mobile"
        );


    const addressElement =
        document.getElementById(
            "address"
        );


    const joinDateElement =
        document.getElementById(
            "joinDate"
        );


    if (nameElement) {

        nameElement.value =
            member.name || "";

    }


    if (mobileElement) {

        mobileElement.value =
            member.mobile || "";

    }


    if (addressElement) {

        addressElement.value =
            member.address || "";

    }


    if (joinDateElement) {

        joinDateElement.value =
            member.joinDate || "";

    }


    // =================================================
    // LOAD WITNESSES
    // =================================================

    selectedWitness =
        Array.isArray(
            member.witness
        )
            ? [
                ...member.witness
            ]
            : [];


    showWitness();


    // =================================================
    // SET EDIT ID
    // =================================================

    editId =
        member.id;


    // =================================================
    // CHANGE BUTTON
    // =================================================

    const saveButton =
        document.getElementById(
            "saveBtn"
        );


    if (saveButton) {

        saveButton.innerHTML =
            "✏ Update Member";

    }


    // =================================================
    // SCROLL TO FORM
    // =================================================

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================================
// DELETE MEMBER
// =====================================================

async function deleteMember(id) {

    const member =
        members.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!member) {

        alert(
            "Member Not Found"
        );

        return;

    }


    const confirmDelete =
        confirm(

            `Are you sure you want to delete "${member.name}"?`

        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteData(

            "members",

            id

        );


        alert(
            "Member Deleted Successfully"
        );


        // =============================================
        // IF CURRENTLY EDITING THIS MEMBER
        // =============================================

        if (
            String(editId) ===
            String(id)
        ) {

            clearForm();

        }


        await loadMembers();

    }

    catch (error) {

        console.error(
            "Delete Member Error:",
            error
        );


        alert(
            "Unable to delete member. Please try again."
        );

    }

}


// =====================================================
// CLEAR FORM
// =====================================================

function clearForm() {

    const nameElement =
        document.getElementById(
            "memberName"
        );


    const mobileElement =
        document.getElementById(
            "mobile"
        );


    const addressElement =
        document.getElementById(
            "address"
        );


    const joinDateElement =
        document.getElementById(
            "joinDate"
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


    if (joinDateElement) {

        joinDateElement.value =
            "";

    }


    selectedWitness =
        [];


    editId =
        null;


    showWitness();


    // =================================================
    // RESET BUTTON
    // =================================================

    const saveButton =
        document.getElementById(
            "saveBtn"
        );


    if (saveButton) {

        saveButton.innerHTML =
            "➕ Add Member";

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
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.addWitness =
    addWitness;


window.removeWitness =
    removeWitness;


window.addMember =
    addMember;


window.editMember =
    editMember;


window.deleteMember =
    deleteMember;


window.clearForm =
    clearForm;


window.loadMembers =
    loadMembers;


window.loadWitness =
    loadWitness;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            await loadWitness();

            await loadMembers();

            showWitness();

        }

        catch (error) {

            console.error(
                "Members Page Load Error:",
                error
            );

        }

    }
);