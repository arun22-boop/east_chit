// =====================================
// REPORTS.JS
// PKV EAST CHIT
// Firebase Firestore Version
// =====================================

import {
    getData
} from "./firebase-data.js";


// ==========================
// DATA
// ==========================

let members = [];
let groups = [];
let payments = [];
let collections = [];


// ==========================
// LOAD ALL FIREBASE DATA
// ==========================

async function loadAllData() {

    try {

        members =
            await getData("members");

        groups =
            await getData("groups");

        payments =
            await getData("payments");

        collections =
            await getData("collections");


        console.log(
            "Reports Firebase data loaded"
        );


        loadMembers();

        loadReport();


    } catch (error) {

        console.error(
            "Error loading report data:",
            error
        );

        alert(
            "Error loading Firebase report data."
        );

    }

}


// ==========================
// LOAD MEMBERS
// ==========================

function loadMembers() {

    const select =
        document.getElementById(
            "reportMember"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            All Members
        </option>

    `;


    members.forEach(member => {

        select.innerHTML += `

            <option value="${member.id}">

                ${escapeHTML(
                    member.name || ""
                )}

            </option>

        `;

    });

}


// ==========================
// LOAD REPORT
// ==========================

function loadReport() {

    const memberElement =
        document.getElementById(
            "reportMember"
        );


    const fromElement =
        document.getElementById(
            "fromDate"
        );


    const toElement =
        document.getElementById(
            "toDate"
        );


    const list =
        document.getElementById(
            "reportList"
        );


    if (!list) {
        return;
    }


    const memberId =
        memberElement
            ? memberElement.value
            : "";


    const fromDate =
        fromElement
            ? fromElement.value
            : "";


    const toDate =
        toElement
            ? toElement.value
            : "";


    list.innerHTML = "";


    let found = false;


    // ==========================
    // MEMBER LOOP
    // ==========================

    members.forEach(member => {


        // ==========================
        // MEMBER FILTER
        // ==========================

        if (

            memberId !== "" &&

            String(member.id) !==
            String(memberId)

        ) {

            return;

        }


        // ==========================
        // MEMBER PAYMENTS
        // ==========================

        const memberPayments =

            payments.filter(payment => {

                return (

                    String(
                        payment.memberId
                    ) ===
                    String(member.id)

                    &&

                    checkDate(
                        payment.date,
                        fromDate,
                        toDate
                    )

                );

            });


        // ==========================
        // MEMBER COLLECTIONS
        // ==========================

        const memberCollections =

            collections.filter(collection => {

                return (

                    String(
                        collection.memberId
                    ) ===
                    String(member.id)

                    &&

                    checkDate(
                        collection.date,
                        fromDate,
                        toDate
                    )

                );

            });


        // ==========================
        // INSTALLMENT TOTAL
        // ==========================

        let installment = 0;


        memberPayments.forEach(payment => {

            installment += Number(

                payment.currentPayment ??

                payment.amount ??

                0

            );

        });


        // ==========================
        // PAID TOTAL
        // ==========================

        let paid = 0;


        memberCollections.forEach(collection => {

            paid += Number(

                collection.paidAmount ??

                collection.amount ??

                0

            );

        });


        // ==========================
        // BALANCE
        // ==========================

        let balance =

            installment -
            paid;


        if (balance < 0) {

            balance = 0;

        }


        // ==========================
        // SKIP EMPTY MEMBER
        // ==========================

        if (

            installment === 0 &&

            paid === 0

        ) {

            return;

        }


        // ==========================
        // GROUP NAME
        // ==========================

        let groupName = "-";


        if (
            memberPayments.length > 0
        ) {

            const latestPayment =

                memberPayments[
                    memberPayments.length - 1
                ];


            if (
                latestPayment.groupId
            ) {

                const group =

                    groups.find(g => {

                        return (

                            String(g.id) ===
                            String(
                                latestPayment.groupId
                            )

                        );

                    });


                if (group) {

                    groupName =
                        group.name;

                }

            }

        }


        // ==========================
        // TABLE ROW
        // ==========================

        list.innerHTML += `

            <tr>

                <td>

                    ${escapeHTML(
                        member.name || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        groupName
                    )}

                </td>


                <td>

                    ${installment.toLocaleString(
                        "en-IN"
                    )}

                </td>


                <td>

                    ${paid.toLocaleString(
                        "en-IN"
                    )}

                </td>


                <td>

                    ${balance.toLocaleString(
                        "en-IN"
                    )}

                </td>

            </tr>

        `;


        found = true;

    });


    // ==========================
    // NO REPORT
    // ==========================

    if (!found) {

        list.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted">

                    No Report Found

                </td>

            </tr>

        `;

    }

}


// ==========================
// DATE FILTER
// ==========================

function checkDate(
    date,
    from,
    to
) {

    if (!from && !to) {

        return true;

    }


    if (!date) {

        return false;

    }


    // YYYY-MM-DD comparison
    // avoids timezone problems

    const currentDate =
        String(date);


    if (
        from &&
        currentDate < from
    ) {

        return false;

    }


    if (
        to &&
        currentDate > to
    ) {

        return false;

    }


    return true;

}


// ==========================
// DOWNLOAD PDF
// ==========================

function downloadPDF() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "jsPDF library not loaded."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF();


    doc.text(
        "PKV EAST CHIT Report",
        14,
        15
    );


    const rows = [];


    const table =
        document.querySelectorAll(
            "#reportList tr"
        );


    table.forEach(row => {

        const data = [];


        row.querySelectorAll("td")
            .forEach(cell => {

                data.push(
                    cell.innerText
                );

            });


        if (data.length) {

            rows.push(data);

        }

    });


    // ==========================
    // CHECK AUTO TABLE
    // ==========================

    if (
        typeof doc.autoTable !==
        "function"
    ) {

        alert(
            "jsPDF AutoTable library not loaded."
        );

        return;

    }


    doc.autoTable({

        startY: 25,

        head: [

            [

                "Member",

                "Group",

                "Installment",

                "Paid",

                "Pending"

            ]

        ],

        body: rows

    });


    doc.save(
        "chit-report.pdf"
    );

}


// ==========================
// DOWNLOAD EXCEL
// ==========================

function downloadExcel() {

    if (!window.XLSX) {

        alert(
            "Excel library not loaded."
        );

        return;

    }


    const data = [];


    // ==========================
    // READ TABLE
    // ==========================

    const rows =
        document.querySelectorAll(
            "#reportList tr"
        );


    rows.forEach(row => {

        const rowData = [];


        row.querySelectorAll("td")
            .forEach(cell => {

                rowData.push(
                    cell.innerText
                );

            });


        if (
            rowData.length
        ) {

            data.push(rowData);

        }

    });


    // ==========================
    // ADD HEADER
    // ==========================

    data.unshift([

        "Member",

        "Group",

        "Installment",

        "Collection Paid",

        "Pending Balance"

    ]);


    // ==========================
    // CREATE WORKSHEET
    // ==========================

    const worksheet =

        XLSX.utils.aoa_to_sheet(
            data
        );


    // ==========================
    // CREATE WORKBOOK
    // ==========================

    const workbook =

        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Chit Report"

    );


    // ==========================
    // DOWNLOAD
    // ==========================

    XLSX.writeFile(

        workbook,

        "chit-report.xlsx"

    );

}


// ==========================
// ESCAPE HTML
// ==========================

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


// ==========================
// GLOBAL FUNCTIONS
// ==========================

window.loadReport =
    loadReport;

window.downloadPDF =
    downloadPDF;

window.downloadExcel =
    downloadExcel;


// ==========================
// PAGE LOAD
// ==========================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadAllData();

    }
);
