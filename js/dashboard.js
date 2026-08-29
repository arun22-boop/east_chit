// =====================================================
// DASHBOARD.JS
// PKV EAST CHIT
// FIREBASE REALTIME DASHBOARD
// =====================================================

import {
    listenData
} from "./firebase-data.js";


// =====================================================
// GLOBAL DATA
// =====================================================

let members = [];

let groups = [];

let payments = [];

let installments = [];

let collections = [];

let commissions = [];

let expenses = [];


// =====================================================
// REALTIME UNSUBSCRIBE FUNCTIONS
// =====================================================

const listeners = [];


// =====================================================
// NUMBER HELPER
// =====================================================

function numberValue(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(value) {

    return (
        "₹ " +
        numberValue(value)
            .toLocaleString("en-IN")
    );

}


// =====================================================
// DISPLAY VALUE
// =====================================================

function displayValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {

        console.warn(
            "Dashboard element not found:",
            elementId
        );

        return;

    }

    element.innerText =
        value;

}


// =====================================================
// DISPLAY MONEY
// =====================================================

function displayMoney(
    elementId,
    value
) {

    displayValue(
        elementId,
        formatMoney(value)
    );

}


// =====================================================
// GET PAYMENT AMOUNT
// =====================================================

function getPaymentAmount(item) {

    if (
        item.currentPayment !== undefined &&
        item.currentPayment !== null &&
        item.currentPayment !== ""
    ) {

        return numberValue(
            item.currentPayment
        );

    }

    return numberValue(

        item.paidAmount ??

        item.amount ??

        item.paymentAmount ??

        item.installmentAmount ??

        0

    );

}


// =====================================================
// GET COLLECTION AMOUNT
// =====================================================

function getCollectionAmount(item) {

    return numberValue(

        item.paidAmount ??

        item.collectionAmount ??

        item.amount ??

        0

    );

}


// =====================================================
// GET COMMISSION AMOUNT
// =====================================================

function getCommissionAmount(item) {

    return numberValue(

        item.commissionAmount ??

        item.amount ??

        item.value ??

        0

    );

}


// =====================================================
// GET EXPENSE AMOUNT
// =====================================================

function getExpenseAmount(item) {

    return numberValue(

        item.expenseAmount ??

        item.amount ??

        item.value ??

        0

    );

}


// =====================================================
// GET ALL PAYMENT RECORDS
// =====================================================

function getAllPaymentRecords() {

    const allRecords =
        [];

    payments.forEach(
        item => {

            allRecords.push(
                item
            );

        }
    );


    installments.forEach(
        item => {

            const exists =
                allRecords.some(
                    record =>
                        String(record.id) ===
                        String(item.id)
                );


            if (!exists) {

                allRecords.push(
                    item
                );

            }

        }
    );


    return allRecords;

}


// =====================================================
// CALCULATE TOTAL INSTALLMENT
// =====================================================

function calculateTotalInstallment() {

    let total =
        0;


    const allPayments =
        getAllPaymentRecords();


    allPayments.forEach(
        item => {

            total +=
                getPaymentAmount(
                    item
                );

        }
    );


    return total;

}


// =====================================================
// CALCULATE TOTAL COLLECTION
// =====================================================

function calculateTotalCollection() {

    let total =
        0;


    collections.forEach(
        item => {

            total +=
                getCollectionAmount(
                    item
                );

        }
    );


    return total;

}


// =====================================================
// CALCULATE TOTAL COMMISSION
// =====================================================

function calculateTotalCommission() {

    let total =
        0;


    commissions.forEach(
        item => {

            total +=
                getCommissionAmount(
                    item
                );

        }
    );


    return total;

}


// =====================================================
// CALCULATE TOTAL EXPENSE
// =====================================================

function calculateTotalExpense() {

    let total =
        0;


    expenses.forEach(
        item => {

            total +=
                getExpenseAmount(
                    item
                );

        }
    );


    return total;

}


// =====================================================
// UPDATE DASHBOARD
// =====================================================

function updateDashboard() {

    console.log(
        "🔄 Updating Dashboard..."
    );


    // -----------------------------------------------
    // TOTAL GROUPS
    // -----------------------------------------------

    displayValue(
        "groups",
        groups.length
    );


    // -----------------------------------------------
    // TOTAL MEMBERS
    // -----------------------------------------------

    displayValue(
        "members",
        members.length
    );


    // -----------------------------------------------
    // TOTALS
    // -----------------------------------------------

    const totalInstallment =
        calculateTotalInstallment();


    const totalCollection =
        calculateTotalCollection();


    const totalCommission =
        calculateTotalCommission();


    const totalExpense =
        calculateTotalExpense();


    // -----------------------------------------------
    // PENDING AMOUNT
    //
    // Total Installment - Total Collection
    // -----------------------------------------------

    const pendingAmount =
        Math.max(
            totalInstallment -
            totalCollection,
            0
        );


    // -----------------------------------------------
    // CASH IN HAND
    //
    // Collection + Commission - Expense - Pending Amount
    // -----------------------------------------------

    const cashInHand =
        totalCollection +
        totalCommission -
        pendingAmount -
        totalExpense;


    // -----------------------------------------------
    // FINAL TOTAL
    //
    // Cash In Hand + Pending Amount
    // -----------------------------------------------

    const finalTotal =
        cashInHand +
        pendingAmount;


    // -----------------------------------------------
    // DISPLAY EXISTING HTML IDs
    // -----------------------------------------------

    displayMoney(
        "commission",
        totalCommission
    );


    displayMoney(
        "expense",
        totalExpense
    );


    displayMoney(
        "collection",
        totalCollection
    );


    displayMoney(
        "pending",
        pendingAmount
    );


    displayMoney(
        "cash",
        cashInHand
    );


    displayMoney(
        "finalTotal",
        finalTotal
    );


    console.log(
        "======================================"
    );

    console.log(
        "👥 Total Members:",
        members.length
    );

    console.log(
        "📁 Total Groups:",
        groups.length
    );

    console.log(
        "💳 Total Installment:",
        totalInstallment
    );

    console.log(
        "💰 Total Collection:",
        totalCollection
    );

    console.log(
        "💵 Total Commission:",
        totalCommission
    );

    console.log(
        "💸 Total Expense:",
        totalExpense
    );

    console.log(
        "📜 Pending Amount:",
        pendingAmount
    );

    console.log(
        "🏦 Cash In Hand:",
        cashInHand
    );

    console.log(
        "🏆 FINAL TOTAL:",
        finalTotal
    );

    console.log(
        "======================================"
    );

}


// =====================================================
// START REALTIME LISTENERS
// =====================================================

function startRealtimeDashboard() {

    console.log(
        "======================================"
    );

    console.log(
        "🔥 STARTING FIREBASE REALTIME DASHBOARD"
    );

    console.log(
        "======================================"
    );


    // MEMBERS

    listeners.push(

        listenData(

            "members",

            data => {

                members =
                    data;

                console.log(
                    "🔄 Members updated:",
                    members.length
                );

                updateDashboard();

            }

        )

    );


    // GROUPS

    listeners.push(

        listenData(

            "groups",

            data => {

                groups =
                    data;

                console.log(
                    "🔄 Groups updated:",
                    groups.length
                );

                updateDashboard();

            }

        )

    );


    // PAYMENTS

    listeners.push(

        listenData(

            "payments",

            data => {

                payments =
                    data;

                console.log(
                    "🔄 Payments updated:",
                    payments.length
                );

                updateDashboard();

            }

        )

    );


    // INSTALLMENTS

    listeners.push(

        listenData(

            "installments",

            data => {

                installments =
                    data;

                console.log(
                    "🔄 Installments updated:",
                    installments.length
                );

                updateDashboard();

            }

        )

    );


    // COLLECTIONS

    listeners.push(

        listenData(

            "collections",

            data => {

                collections =
                    data;

                console.log(
                    "🔄 Collections updated:",
                    collections.length
                );

                updateDashboard();

            }

        )

    );


    // COMMISSIONS

    listeners.push(

        listenData(

            "commissions",

            data => {

                commissions =
                    data;

                console.log(
                    "🔄 Commissions updated:",
                    commissions.length
                );

                updateDashboard();

            }

        )

    );


    // EXPENSES

    listeners.push(

        listenData(

            "expenses",

            data => {

                expenses =
                    data;

                console.log(
                    "🔄 Expenses updated:",
                    expenses.length
                );

                updateDashboard();

            }

        )

    );


}


// =====================================================
// STOP REALTIME LISTENERS
// =====================================================

function stopRealtimeDashboard() {

    listeners.forEach(
        unsubscribe => {

            if (
                typeof unsubscribe ===
                "function"
            ) {

                unsubscribe();

            }

        }
    );


    listeners.length =
        0;


    console.log(
        "🛑 Realtime listeners stopped"
    );

}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        startRealtimeDashboard();

    }

);


// =====================================================
// PAGE CLOSE
// =====================================================

window.addEventListener(

    "beforeunload",

    function () {

        stopRealtimeDashboard();

    }

);


// =====================================================
// LOG
// =====================================================

console.log(
    "🔥 dashboard.js loaded"
);