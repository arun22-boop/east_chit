// =====================================================
// INSTALLMENTS.JS
// PKV EAST CHIT
// FIREBASE / FIRESTORE VERSION
//
// MEMBER-WISE PAYMENT MANAGEMENT
//
// Firestore Collections:
//   members
//   payments
//   collections
//
// Uses:
//   firebase-data.js
//
// Features:
//   Load Members
//   Load Payments
//   Load Collections
//   Old Balance
//   Current Payment
//   Total Amount
//   Add Payment
//   Edit Payment
//   Delete Payment
//   Search/Display Payment History
// =====================================================

import {
    getData,
    addData,
    updateData,
    deleteData
} from "./firebase-data.js";


// =====================================================
// GLOBAL DATA
// =====================================================

let members = [];

let payments = [];

let collections = [];

let editId = null;


// =====================================================
// SAFE NUMBER
// =====================================================

function num(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "string") {

        value = value
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .trim();

    }

    const result = Number(value);

    return Number.isFinite(result)
        ? result
        : 0;

}


// =====================================================
// MONEY FORMAT
// =====================================================

function money(value) {

    return (
        "₹" +
        num(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );

}


// =====================================================
// GET ELEMENT
// =====================================================

function getElement(id) {

    return document.getElementById(id);

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


// =====================================================
// GET MEMBER
// =====================================================

function getMember(memberId) {

    return members.find(function (member) {

        return (

            String(member.id) ===
            String(memberId)

        ) || (

            String(member.memberId) ===
            String(memberId)

        );

    }) || null;

}


// =====================================================
// LOAD MEMBERS
// =====================================================

async function loadMembersFromFirebase() {

    try {

        console.log(
            "🔥 Loading members..."
        );

        const data =
            await getData("members");

        members =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "👥 Members:",
            members.length
        );

        loadMembers();

    }
    catch (error) {

        console.error(
            "❌ Members Load Error:",
            error
        );

        members = [];

        loadMembers();

    }

}


// =====================================================
// LOAD PAYMENTS
// =====================================================

async function loadPaymentsFromFirebase() {

    try {

        console.log(
            "🔥 Loading payments..."
        );

        const data =
            await getData("payments");

        payments =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "💰 Payments:",
            payments.length
        );

        showPayments();

    }
    catch (error) {

        console.error(
            "❌ Payments Load Error:",
            error
        );

        payments = [];

        showPayments();

    }

}


// =====================================================
// LOAD COLLECTIONS
// =====================================================

async function loadCollectionsFromFirebase() {

    try {

        console.log(
            "🔥 Loading collections..."
        );

        const data =
            await getData("collections");

        collections =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "💵 Collections:",
            collections.length
        );

    }
    catch (error) {

        console.error(
            "❌ Collections Load Error:",
            error
        );

        collections = [];

    }

}


// =====================================================
// LOAD ALL FIREBASE DATA
// =====================================================

async function loadFirebaseData() {

    console.log("");

    console.log(
        "======================================"
    );

    console.log(
        "🔥 INSTALLMENTS FIRESTORE LOAD"
    );

    console.log(
        "======================================"
    );

    try {

        const results =
            await Promise.all([

                getData("members"),

                getData("payments"),

                getData("collections")

            ]);


        members =
            Array.isArray(results[0])
                ? results[0]
                : [];


        payments =
            Array.isArray(results[1])
                ? results[1]
                : [];


        collections =
            Array.isArray(results[2])
                ? results[2]
                : [];


        console.log(
            "👥 Members:",
            members.length
        );

        console.log(
            "💰 Payments:",
            payments.length
        );

        console.log(
            "💵 Collections:",
            collections.length
        );


        loadMembers();

        showPayments();


        console.log(
            "======================================"
        );

    }
    catch (error) {

        console.error(
            "❌ Firebase Load Error:",
            error
        );

    }

}


// =====================================================
// LOAD MEMBERS INTO SELECT
// =====================================================

function loadMembers() {

    const select =
        getElement(
            "memberSelect"
        );

    if (!select) {

        console.warn(
            "⚠️ memberSelect element not found."
        );

        return;

    }


    select.innerHTML = `

        <option value="">
            Select Member
        </option>

    `;


    members.forEach(function (member) {

        const memberId =
            member.id ??
            member.memberId ??
            "";

        const memberName =
            member.name ??
            member.memberName ??
            member.fullName ??
            "Unknown Member";


        if (!memberId) {
            return;
        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            memberId;


        option.textContent =
            memberName;


        select.appendChild(
            option
        );

    });

}


// =====================================================
// CALCULATE OLD BALANCE
//
// Old Balance =
// Previous Payments - Collections
// =====================================================

function loadOldBalance() {

    const memberSelect =
        getElement(
            "memberSelect"
        );

    const oldBalanceBox =
        getElement(
            "oldBalance"
        );


    if (
        !memberSelect ||
        !oldBalanceBox
    ) {

        return;

    }


    const memberId =
        memberSelect.value;


    if (!memberId) {

        oldBalanceBox.value =
            "0";

        calculateTotal();

        return;

    }


    // =================================================
    // PREVIOUS PAYMENTS
    // =================================================

    let paymentTotal = 0;


    payments.forEach(
        function (payment) {

            if (
                String(
                    payment.memberId
                ) !==
                String(memberId)
            ) {

                return;

            }


            paymentTotal +=
                num(
                    payment.currentPayment ??
                    payment.paymentAmount ??
                    payment.amount ??
                    payment.paidAmount ??
                    0
                );

        }
    );


    // =================================================
    // COLLECTIONS
    // =================================================

    let collectionTotal = 0;


    collections.forEach(
        function (collection) {

            if (
                String(
                    collection.memberId
                ) !==
                String(memberId)
            ) {

                return;

            }


            collectionTotal +=
                num(
                    collection.paidAmount ??
                    collection.collectionAmount ??
                    collection.collectedAmount ??
                    collection.amount ??
                    0
                );

        }
    );


    // =================================================
    // BALANCE
    // =================================================

    let balance =
        paymentTotal -
        collectionTotal;


    if (balance < 0) {

        balance = 0;

    }


    oldBalanceBox.value =
        balance;


    calculateTotal();

}


// =====================================================
// CALCULATE TOTAL
//
// Old Balance
// +
// Current Payment
// =
// Total
// =====================================================

function calculateTotal() {

    const oldBalanceElement =
        getElement(
            "oldBalance"
        );

    const paymentElement =
        getElement(
            "paymentAmount"
        );

    const totalElement =
        getElement(
            "totalAmount"
        );


    if (
        !oldBalanceElement ||
        !paymentElement
    ) {

        return;

    }


    const oldBalance =
        num(
            oldBalanceElement.value
        );


    const currentPayment =
        num(
            paymentElement.value
        );


    const total =
        oldBalance +
        currentPayment;


    if (totalElement) {

        totalElement.value =
            total;

    }

}


// =====================================================
// ADD / UPDATE PAYMENT
// =====================================================

async function addPayment() {

    const memberElement =
        getElement(
            "memberSelect"
        );

    const oldBalanceElement =
        getElement(
            "oldBalance"
        );

    const paymentElement =
        getElement(
            "paymentAmount"
        );

    const totalElement =
        getElement(
            "totalAmount"
        );

    const dateElement =
        getElement(
            "paymentDate"
        );


    if (
        !memberElement ||
        !oldBalanceElement ||
        !paymentElement ||
        !totalElement ||
        !dateElement
    ) {

        alert(
            "❌ Payment form fields not found."
        );

        return;

    }


    const memberId =
        memberElement.value;


    const oldBalance =
        num(
            oldBalanceElement.value
        );


    const currentPayment =
        num(
            paymentElement.value
        );


    const totalAmount =
        num(
            totalElement.value
        );


    const date =
        dateElement.value;


    // =================================================
    // VALIDATION
    // =================================================

    if (!memberId) {

        alert(
            "Please select a Member."
        );

        return;

    }


    if (currentPayment <= 0) {

        alert(
            "Please enter Payment Amount."
        );

        return;

    }


    if (!date) {

        alert(
            "Please select Payment Date."
        );

        return;

    }


    const member =
        getMember(
            memberId
        );


    const memberName =
        member
            ? (
                member.name ??
                member.memberName ??
                member.fullName ??
                ""
            )
            : "";


    // =================================================
    // SAVE BUTTON
    // =================================================

    const saveButton =
        getElement(
            "savePaymentBtn"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML =
            "⏳ Saving...";

    }


    try {

        // =================================================
        // PAYMENT DATA
        // =================================================

        const paymentData = {

            memberId:
                memberId,

            memberName:
                memberName,

            oldBalance:
                oldBalance,

            currentPayment:
                currentPayment,

            paymentAmount:
                currentPayment,

            totalAmount:
                totalAmount,

            amount:
                currentPayment,

            date:
                date,

            updatedAt:
                new Date().toISOString()

        };


        // =================================================
        // UPDATE
        // =================================================

        if (editId) {

            console.log(
                "🔥 Updating payment:",
                editId
            );


            await updateData(
                "payments",
                editId,
                paymentData
            );


            alert(
                "✅ Payment Updated Successfully"
            );

        }


        // =================================================
        // ADD
        // =================================================

        else {

            console.log(
                "🔥 Adding payment..."
            );


            const newPayment = {

                ...paymentData,

                createdAt:
                    new Date().toISOString()

            };


            const result =
                await addData(
                    "payments",
                    newPayment
                );


            console.log(
                "✅ Payment saved:",
                result
            );


            alert(
                "✅ Payment Saved Successfully"
            );

        }


        // =================================================
        // RESET
        // =================================================

        editId = null;


        await loadFirebaseData();


        clearForm();

    }
    catch (error) {

        console.error(
            "❌ PAYMENT SAVE FAILED:",
            error
        );


        alert(
            "❌ Payment Save Failed:\n\n" +
            error.message
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                "💾 Save Payment";

        }

    }

}


// =====================================================
// CLEAR FORM
// =====================================================

function clearForm() {

    const memberSelect =
        getElement(
            "memberSelect"
        );

    const oldBalance =
        getElement(
            "oldBalance"
        );

    const paymentAmount =
        getElement(
            "paymentAmount"
        );

    const totalAmount =
        getElement(
            "totalAmount"
        );

    const paymentDate =
        getElement(
            "paymentDate"
        );


    if (memberSelect) {

        memberSelect.value =
            "";

    }


    if (oldBalance) {

        oldBalance.value =
            "0";

    }


    if (paymentAmount) {

        paymentAmount.value =
            "";

    }


    if (totalAmount) {

        totalAmount.value =
            "0";

    }


    if (paymentDate) {

        paymentDate.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    editId =
        null;


    const saveButton =
        getElement(
            "savePaymentBtn"
        );


    if (saveButton) {

        saveButton.innerHTML =
            "💾 Save Payment";

    }

}


// =====================================================
// SHOW PAYMENT HISTORY
// =====================================================

function showPayments() {

    const list =
        getElement(
            "paymentList"
        );


    if (!list) {

        console.warn(
            "⚠️ paymentList element not found."
        );

        return;

    }


    list.innerHTML =
        "";


    if (
        payments.length === 0
    ) {

        list.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="text-center py-4">

                    No Payments Found

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // SORT
    // =================================================

    const sortedPayments =
        [...payments].sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.date ??
                        a.paymentDate ??
                        0
                    ).getTime();


                const dateB =
                    new Date(
                        b.date ??
                        b.paymentDate ??
                        0
                    ).getTime();


                return dateB - dateA;

            }
        );


    sortedPayments.forEach(
        function (payment) {

            const member =
                getMember(
                    payment.memberId
                );


            const memberName =
                payment.memberName ??
                (
                    member
                        ? (
                            member.name ??
                            member.memberName ??
                            member.fullName ??
                            "-"
                        )
                        : "-"
                );


            const oldBalance =
                num(
                    payment.oldBalance
                );


            const currentPayment =
                num(
                    payment.currentPayment ??
                    payment.paymentAmount ??
                    payment.amount ??
                    0
                );


            const totalAmount =
                num(
                    payment.totalAmount ??
                    (
                        oldBalance +
                        currentPayment
                    )
                );


            const paymentDate =
                payment.date ??
                payment.paymentDate ??
                "-";


            const id =
                payment.id ??
                payment.docId ??
                payment.documentId ??
                "";


            if (!id) {

                return;

            }


            list.innerHTML += `

                <tr>

                    <td>
                        ${escapeHtml(
                            memberName
                        )}
                    </td>

                    <td>
                        ${money(
                            oldBalance
                        )}
                    </td>

                    <td>
                        ${money(
                            currentPayment
                        )}
                    </td>

                    <td>
                        ${money(
                            totalAmount
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            paymentDate
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-primary btn-sm me-1"
                            onclick="editPayment('${id}')">

                            ✏ Edit

                        </button>


                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="deletePayment('${id}')">

                            🗑 Delete

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// EDIT PAYMENT
// =====================================================

function editPayment(id) {

    const payment =
        payments.find(
            function (item) {

                const paymentId =
                    item.id ??
                    item.docId ??
                    item.documentId ??
                    "";

                return (
                    String(paymentId) ===
                    String(id)
                );

            }
        );


    if (!payment) {

        alert(
            "❌ Payment not found."
        );

        return;

    }


    const memberSelect =
        getElement(
            "memberSelect"
        );

    const oldBalance =
        getElement(
            "oldBalance"
        );

    const paymentAmount =
        getElement(
            "paymentAmount"
        );

    const totalAmount =
        getElement(
            "totalAmount"
        );

    const paymentDate =
        getElement(
            "paymentDate"
        );


    if (memberSelect) {

        memberSelect.value =
            payment.memberId ??
            "";

    }


    if (oldBalance) {

        oldBalance.value =
            num(
                payment.oldBalance
            );

    }


    if (paymentAmount) {

        paymentAmount.value =
            num(
                payment.currentPayment ??
                payment.paymentAmount ??
                payment.amount ??
                0
            );

    }


    if (totalAmount) {

        totalAmount.value =
            num(
                payment.totalAmount ??
                (
                    num(
                        payment.oldBalance
                    ) +
                    num(
                        payment.currentPayment ??
                        payment.paymentAmount ??
                        payment.amount
                    )
                )
            );

    }


    if (paymentDate) {

        paymentDate.value =
            payment.date ??
            payment.paymentDate ??
            "";

    }


    editId =
        payment.id ??
        payment.docId ??
        payment.documentId ??
        "";


    const saveButton =
        getElement(
            "savePaymentBtn"
        );


    if (saveButton) {

        saveButton.innerHTML =
            "✏ Update Payment";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================================
// DELETE PAYMENT
//
// IMPORTANT:
// No direct `doc()` required.
//
// firebase-data.js handles Firestore document
// reference internally.
// =====================================================

async function deletePayment(id) {

    if (!id) {

        alert(
            "❌ Payment ID not found."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete this Payment?"
        );


    if (!confirmed) {

        return;

    }


    try {

        console.log(
            "🔥 Deleting payment:",
            id
        );


        await deleteData(
            "payments",
            id
        );


        alert(
            "✅ Payment Deleted Successfully"
        );


        // =================================================
        // RELOAD
        // =================================================

        await loadFirebaseData();


        // =================================================
        // REFRESH OLD BALANCE
        // =================================================

        loadOldBalance();

    }
    catch (error) {

        console.error(
            "❌ Payment Delete Error:",
            error
        );


        alert(
            "❌ Payment Delete Failed:\n\n" +
            error.message
        );

    }

}


// =====================================================
// REFRESH
// =====================================================

async function refreshPayments() {

    await loadFirebaseData();

}


// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEvents() {

    // =================================================
    // MEMBER CHANGE
    // =================================================

    const memberSelect =
        getElement(
            "memberSelect"
        );


    if (memberSelect) {

        memberSelect.addEventListener(
            "change",
            function () {

                loadOldBalance();

            }
        );

    }


    // =================================================
    // PAYMENT INPUT
    // =================================================

    const paymentAmount =
        getElement(
            "paymentAmount"
        );


    if (paymentAmount) {

        paymentAmount.addEventListener(
            "input",
            function () {

                calculateTotal();

            }
        );

    }


    // =================================================
    // SAVE BUTTON
    // =================================================

    const saveButton =
        getElement(
            "savePaymentBtn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                addPayment();

            }
        );

    }

}


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.loadMembers =
    loadMembers;

window.loadOldBalance =
    loadOldBalance;

window.calculateTotal =
    calculateTotal;

window.addPayment =
    addPayment;

window.clearForm =
    clearForm;

window.showPayments =
    showPayments;

window.editPayment =
    editPayment;

window.deletePayment =
    deletePayment;

window.refreshPayments =
    refreshPayments;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            "🔥 INSTALLMENTS.JS FIRESTORE VERSION"
        );

        console.log(
            "======================================"
        );


        // =================================================
        // TODAY
        // =================================================

        const paymentDate =
            getElement(
                "paymentDate"
            );


        if (paymentDate) {

            paymentDate.value =
                new Date()
                    .toISOString()
                    .split("T")[0];

        }


        // =================================================
        // LOAD FIREBASE
        // =================================================

        await loadFirebaseData();


        console.log(
            "✅ Installments page ready"
        );


        console.log(
            "======================================"
        );

    }
);


// =====================================================
// DEBUG
// =====================================================

console.log(
    "✅ installments.js loaded successfully"
);