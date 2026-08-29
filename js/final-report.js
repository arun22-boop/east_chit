// =====================================================
// FINAL REPORT - PKV EAST CHIT
// FIREBASE / FIRESTORE VERSION
// =====================================================

// =====================================================
// FIREBASE IMPORTS
// =====================================================

import {
    getData
} from "./firebase-data.js";


// =====================================================
// GLOBAL DATA
// =====================================================

let members = [];
let groups = [];
let collections = [];
let commissions = [];
let expenses = [];
let payments = [];
let installments = [];


// =====================================================
// NUMBER HELPER
// =====================================================

function numberValue(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(value) {

    return "₹ " +
        numberValue(value).toLocaleString("en-IN");

}


// =====================================================
// DATE NORMALIZE
// =====================================================

function normalizeDate(value) {

    if (!value) {
        return "";
    }


    // Firebase Timestamp
    if (
        typeof value === "object" &&
        value.seconds
    ) {

        const date = new Date(
            value.seconds * 1000
        );

        return date
            .toISOString()
            .split("T")[0];

    }


    // JavaScript Date
    if (value instanceof Date) {

        return value
            .toISOString()
            .split("T")[0];

    }


    // String date
    return String(value)
        .substring(0, 10);

}


// =====================================================
// DATE IN RANGE
// =====================================================

function dateInRange(
    date,
    fromDate = "",
    toDate = ""
) {

    const normalized = normalizeDate(date);

    if (!normalized) {
        return false;
    }


    if (
        fromDate &&
        normalized < fromDate
    ) {
        return false;
    }


    if (
        toDate &&
        normalized > toDate
    ) {
        return false;
    }


    return true;

}


// =====================================================
// MEMBER NAME
// =====================================================

function getMemberName(memberId) {

    if (
        memberId === undefined ||
        memberId === null ||
        memberId === ""
    ) {
        return "-";
    }


    const member = members.find(
        member =>
            String(member.id) ===
            String(memberId)
    );


    if (!member) {

        return "-";

    }


    return (
        member.name ||
        member.memberName ||
        member.fullName ||
        "-"
    );

}


// =====================================================
// GROUP NAME
// =====================================================

function getGroupName(groupId) {

    if (
        groupId === undefined ||
        groupId === null ||
        groupId === ""
    ) {
        return "-";
    }


    const group = groups.find(
        group =>
            String(group.id) ===
            String(groupId)
    );


    if (!group) {

        return "-";

    }


    return (
        group.name ||
        group.groupName ||
        group.title ||
        "-"
    );

}


// =====================================================
// COLLECTION DATE
// =====================================================

function getCollectionDate(item) {

    return normalizeDate(

        item.date ||

        item.collectionDate ||

        item.paymentDate ||

        item.createdAt ||

        item.timestamp

    );

}


// =====================================================
// COLLECTION AMOUNT
// =====================================================

function getCollectionAmount(item) {

    return numberValue(

        item.paidAmount ??

        item.amount ??

        item.collectionAmount ??

        item.currentPayment ??

        0

    );

}


// =====================================================
// COMMISSION DATE
// =====================================================

function getCommissionDate(item) {

    return normalizeDate(

        item.date ||

        item.commissionDate ||

        item.createdAt ||

        item.timestamp

    );

}


// =====================================================
// COMMISSION AMOUNT
// =====================================================

function getCommissionAmount(item) {

    return numberValue(

        item.amount ??

        item.commissionAmount ??

        item.value ??

        item.commission ??

        0

    );

}


// =====================================================
// EXPENSE DATE
// =====================================================

function getExpenseDate(item) {

    return normalizeDate(

        item.date ||

        item.expenseDate ||

        item.createdAt ||

        item.timestamp

    );

}


// =====================================================
// EXPENSE AMOUNT
// =====================================================

function getExpenseAmount(item) {

    return numberValue(

        item.amount ??

        item.expenseAmount ??

        item.value ??

        item.expense ??

        0

    );

}


// =====================================================
// PAYMENT DATE
// =====================================================

function getPaymentDate(item) {

    return normalizeDate(

        item.date ||

        item.paymentDate ||

        item.installmentDate ||

        item.createdAt ||

        item.timestamp

    );

}


// =====================================================
// PAYMENT AMOUNT
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
// LOAD ALL DATA FROM FIREBASE
// =====================================================

async function loadAllData() {

    try {

        console.log(
            "🔥 Loading Final Report data from Firestore..."
        );


        members =
            await getData("members");


        groups =
            await getData("groups");


        collections =
            await getData("collections");


        commissions =
            await getData("commissions");


        expenses =
            await getData("expenses");


        payments =
            await getData("payments");


        // Optional collection
        try {

            installments =
                await getData("installments");

        }

        catch (error) {

            console.warn(
                "Installments collection not found:",
                error
            );

            installments = [];

        }


        console.log(
            "📊 Final Report Firebase Data:",
            {
                members: members.length,
                groups: groups.length,
                collections: collections.length,
                commissions: commissions.length,
                expenses: expenses.length,
                payments: payments.length,
                installments: installments.length
            }
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Error loading Final Report:",
            error
        );


        return false;

    }

}


// =====================================================
// GET ALL PAYMENT RECORDS
// =====================================================

function getAllPaymentRecords() {

    const allRecords = [];


    payments.forEach(
        item => {

            allRecords.push(item);

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

                allRecords.push(item);

            }

        }
    );


    return allRecords;

}


// =====================================================
// CALCULATE COLLECTION
// =====================================================

function calculateCollection(
    fromDate = "",
    toDate = ""
) {

    let total = 0;


    collections.forEach(
        item => {

            const date =
                getCollectionDate(item);


            if (
                !dateInRange(
                    date,
                    fromDate,
                    toDate
                )
            ) {
                return;
            }


            total +=
                getCollectionAmount(item);

        }
    );


    return total;

}


// =====================================================
// CALCULATE COMMISSION
// =====================================================

function calculateCommission(
    fromDate = "",
    toDate = ""
) {

    let total = 0;


    commissions.forEach(
        item => {

            const date =
                getCommissionDate(item);


            if (
                !dateInRange(
                    date,
                    fromDate,
                    toDate
                )
            ) {
                return;
            }


            total +=
                getCommissionAmount(item);

        }
    );


    return total;

}


// =====================================================
// CALCULATE EXPENSE
// =====================================================

function calculateExpense(
    fromDate = "",
    toDate = ""
) {

    let total = 0;


    expenses.forEach(
        item => {

            const date =
                getExpenseDate(item);


            if (
                !dateInRange(
                    date,
                    fromDate,
                    toDate
                )
            ) {
                return;
            }


            total +=
                getExpenseAmount(item);

        }
    );


    return total;

}


// =====================================================
// CALCULATE INSTALLMENT
// =====================================================

function calculateInstallment(
    fromDate = "",
    toDate = ""
) {

    let total = 0;


    const allPayments =
        getAllPaymentRecords();


    allPayments.forEach(
        item => {

            const date =
                getPaymentDate(item);


            if (
                !dateInRange(
                    date,
                    fromDate,
                    toDate
                )
            ) {
                return;
            }


            total +=
                getPaymentAmount(item);

        }
    );


    return total;

}


// =====================================================
// CALCULATE PENDING
// =====================================================

function calculatePending(
    fromDate = "",
    toDate = ""
) {

    const installment =
        calculateInstallment(
            fromDate,
            toDate
        );


    const collection =
        calculateCollection(
            fromDate,
            toDate
        );


    return Math.max(
        installment - collection,
        0
    );

}


// =====================================================
// DISPLAY MONEY
// =====================================================

function displayMoney(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.innerText =
        formatMoney(value);

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary(
    fromDate = "",
    toDate = ""
) {

    const totalInstallment =
        calculateInstallment(
            fromDate,
            toDate
        );


    const totalCollection =
        calculateCollection(
            fromDate,
            toDate
        );


    const totalCommission =
        calculateCommission(
            fromDate,
            toDate
        );


    const totalExpense =
        calculateExpense(
            fromDate,
            toDate
        );


    const pending =
        calculatePending(
            fromDate,
            toDate
        );


    // CASH IN HAND

    const cashInHand =
    totalCollection +
    totalCommission -
    totalExpense;


    // FINAL TOTAL

    const finalTotal =
        cashInHand +
        pending;


    displayMoney(
        "installment",
        totalInstallment
    );


    displayMoney(
        "collection",
        totalCollection
    );


    displayMoney(
        "commission",
        totalCommission
    );


    displayMoney(
        "expense",
        totalExpense
    );


    displayMoney(
        "pending",
        pending
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
        "💰 Financial Summary:",
        {
            totalInstallment,
            totalCollection,
            totalCommission,
            totalExpense,
            pending,
            cashInHand,
            finalTotal
        }
    );

}


// =====================================================
// LOAD FINAL REPORT
// =====================================================

async function loadFinalReport() {

    const reportList =
        document.getElementById(
            "finalReportList"
        );


    if (!reportList) {

        console.error(
            "finalReportList not found"
        );

        return;

    }


    reportList.innerHTML = `

        <tr>

            <td
                colspan="5"
                class="text-center"
            >

                🔥 Loading Firebase Report...

            </td>

        </tr>

    `;


    // LOAD FIREBASE DATA

    await loadAllData();


    const fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";


    const toDate =
        document.getElementById(
            "toDate"
        )?.value || "";


    const reportType =
        document.getElementById(
            "reportType"
        )?.value || "all";


    const reportRows = [];


    // =================================================
    // COLLECTION
    // =================================================

    if (
        reportType === "all" ||
        reportType === "collection"
    ) {

        collections.forEach(
            item => {

                const date =
                    getCollectionDate(item);


                if (
                    !dateInRange(
                        date,
                        fromDate,
                        toDate
                    )
                ) {
                    return;
                }


                reportRows.push({

                    date: date,

                    type: "Collection",

                    member:
                        getMemberName(
                            item.memberId
                        ),

                    group:
                        getGroupName(
                            item.groupId
                        ),

                    amount:
                        getCollectionAmount(
                            item
                        )

                });

            }
        );

    }


    // =================================================
    // INSTALLMENT
    // =================================================

    if (
        reportType === "all" ||
        reportType === "installment"
    ) {

        const allPayments =
            getAllPaymentRecords();


        allPayments.forEach(
            item => {

                const date =
                    getPaymentDate(item);


                if (
                    !dateInRange(
                        date,
                        fromDate,
                        toDate
                    )
                ) {
                    return;
                }


                reportRows.push({

                    date: date,

                    type: "Installment",

                    member:
                        getMemberName(
                            item.memberId
                        ),

                    group:
                        getGroupName(
                            item.groupId
                        ),

                    amount:
                        getPaymentAmount(
                            item
                        )

                });

            }
        );

    }


    // =================================================
    // COMMISSION
    // =================================================

    if (
        reportType === "all" ||
        reportType === "commission"
    ) {

        commissions.forEach(
            item => {

                const date =
                    getCommissionDate(item);


                if (
                    !dateInRange(
                        date,
                        fromDate,
                        toDate
                    )
                ) {
                    return;
                }


                reportRows.push({

                    date: date,

                    type: "Commission",

                    member: "-",

                    group:
                        getGroupName(
                            item.groupId
                        ),

                    amount:
                        getCommissionAmount(
                            item
                        )

                });

            }
        );

    }


    // =================================================
    // EXPENSE
    // =================================================

    if (
        reportType === "all" ||
        reportType === "expense"
    ) {

        expenses.forEach(
            item => {

                const date =
                    getExpenseDate(item);


                if (
                    !dateInRange(
                        date,
                        fromDate,
                        toDate
                    )
                ) {
                    return;
                }


                reportRows.push({

                    date: date,

                    type: "Expense",

                    member: "-",

                    group: "-",

                    amount:
                        getExpenseAmount(
                            item
                        )

                });

            }
        );

    }


    // =================================================
    // PENDING
    // =================================================

    if (
        reportType === "pending"
    ) {

        const pending =
            calculatePending(
                fromDate,
                toDate
            );


        if (pending > 0) {

            reportRows.push({

                date:

                    toDate ||

                    fromDate ||

                    new Date()
                        .toISOString()
                        .split("T")[0],

                type:
                    "Pending Amount",

                member:
                    "-",

                group:
                    "-",

                amount:
                    pending

            });

        }

    }


    // =================================================
    // SORT BY DATE
    // =================================================

    reportRows.sort(
        (a, b) =>
            String(b.date).localeCompare(
                String(a.date)
            )
    );


    // =================================================
    // CLEAR TABLE
    // =================================================

    reportList.innerHTML = "";


    // =================================================
    // NO DATA
    // =================================================

    if (
        reportRows.length === 0
    ) {

        reportList.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted"
                >

                    ❌ No Report Found

                </td>

            </tr>

        `;


        document.getElementById(
            "reportTotal"
        ).innerText = "₹ 0";


        updateSummary(
            fromDate,
            toDate
        );


        return;

    }


    // =================================================
    // DISPLAY REPORT
    // =================================================

    let reportTotal = 0;


    reportRows.forEach(
        row => {

            reportTotal +=
                numberValue(
                    row.amount
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${row.date}
                </td>

                <td>
                    ${row.type}
                </td>

                <td>
                    ${row.member}
                </td>

                <td>
                    ${row.group}
                </td>

                <td>
                    ${formatMoney(row.amount)}
                </td>

            `;


            reportList.appendChild(
                tr
            );

        }
    );


    // =================================================
    // REPORT TOTAL
    // =================================================

    const totalElement =
        document.getElementById(
            "reportTotal"
        );


    if (totalElement) {

        totalElement.innerText =
            formatMoney(
                reportTotal
            );

    }


    // =================================================
    // UPDATE SUMMARY
    // =================================================

    updateSummary(
        fromDate,
        toDate
    );

}


// =====================================================
// DOWNLOAD PDF
// =====================================================

function downloadFinalPDF() {

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        alert(
            "PDF library not loaded"
        );

        return;

    }


    const jsPDF =
        window.jspdf.jsPDF;


    const doc =
        new jsPDF();


    doc.setFontSize(18);

    doc.text(
        "PKV EAST CHIT",
        14,
        20
    );


    doc.setFontSize(12);

    doc.text(
        "Final Financial Report",
        14,
        30
    );


    const rows = [];


    document
        .querySelectorAll(
            "#finalReportList tr"
        )
        .forEach(
            row => {

                const cells =
                    row.querySelectorAll(
                        "td"
                    );


                if (
                    cells.length === 5
                ) {

                    rows.push([

                        cells[0].innerText,

                        cells[1].innerText,

                        cells[2].innerText,

                        cells[3].innerText,

                        cells[4].innerText

                    ]);

                }

            }
        );


    if (
        typeof doc.autoTable !==
        "function"
    ) {

        alert(
            "AutoTable library not loaded"
        );

        return;

    }


    doc.autoTable({

        startY: 40,

        head: [[

            "Date",
            "Type",
            "Member",
            "Group",
            "Amount"

        ]],

        body: rows,

        theme: "grid",

        styles: {

            fontSize: 8,

            cellPadding: 2

        }

    });


    doc.save(
        "PKV-EAST-CHIT-Final-Report.pdf"
    );

}


// =====================================================
// PRINT REPORT
// =====================================================

function printFinalReport() {

    window.print();

}


// =====================================================
// DOWNLOAD CSV
// =====================================================

function downloadCSV() {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {

        alert(
            "Report table not found"
        );

        return;

    }


    const csv = [];


    table
        .querySelectorAll("tr")
        .forEach(
            row => {

                const rowData = [];


                row
                    .querySelectorAll(
                        "th, td"
                    )
                    .forEach(
                        column => {

                            const text =
                                column.innerText
                                    .replace(
                                        /"/g,
                                        '""'
                                    )
                                    .replace(
                                        /\n/g,
                                        " "
                                    )
                                    .trim();


                            rowData.push(
                                `"${text}"`
                            );

                        }
                    );


                csv.push(
                    rowData.join(",")
                );

            }
        );


    csv.push("");


    csv.push(
        `"Financial Summary"`
    );


    csv.push(
        `"Total Installment","${document.getElementById("installment")?.innerText || ""}"`
    );


    csv.push(
        `"Total Collection","${document.getElementById("collection")?.innerText || ""}"`
    );


    csv.push(
        `"Total Commission","${document.getElementById("commission")?.innerText || ""}"`
    );


    csv.push(
        `"Total Expense","${document.getElementById("expense")?.innerText || ""}"`
    );


    csv.push(
        `"Pending","${document.getElementById("pending")?.innerText || ""}"`
    );


    csv.push(
        `"Cash In Hand","${document.getElementById("cash")?.innerText || ""}"`
    );


    csv.push(
        `"Final Total","${document.getElementById("finalTotal")?.innerText || ""}"`
    );


    const blob =
        new Blob(
            [csv.join("\n")],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "PKV-EAST-CHIT-Final-Report.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// =====================================================
// REFRESH REPORT
// =====================================================

async function refreshFinalReport() {

    await loadFinalReport();

}


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.loadFinalReport =
    loadFinalReport;


window.downloadFinalPDF =
    downloadFinalPDF;


window.printFinalReport =
    printFinalReport;


window.downloadCSV =
    downloadCSV;


window.refreshFinalReport =
    refreshFinalReport;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "📊 Final Report page loaded"
        );


        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        const from =
            document.getElementById(
                "fromDate"
            );


        const to =
            document.getElementById(
                "toDate"
            );


        // REMOVE THESE TWO LINES IF YOU WANT
        // ALL FIREBASE DATA BY DEFAULT

        /*
        if (from && !from.value) {
            from.value = today;
        }

        if (to && !to.value) {
            to.value = today;
        }
        */


        // DATE CHANGE

        if (from) {

            from.addEventListener(
                "change",
                loadFinalReport
            );

        }


        if (to) {

            to.addEventListener(
                "change",
                loadFinalReport
            );

        }


        // REPORT TYPE

        const reportType =
            document.getElementById(
                "reportType"
            );


        if (reportType) {

            reportType.addEventListener(
                "change",
                loadFinalReport
            );

        }


        // FIRST LOAD

        await loadFinalReport();


        console.log(
            "✅ Final Report Ready"
        );

    }
);