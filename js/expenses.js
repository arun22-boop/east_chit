// =====================================================
// EXPENSES.JS
// PKV EAST CHIT
// FIREBASE FIRESTORE VERSION
// =====================================================


// =====================================================
// FIREBASE DATA FUNCTIONS
// =====================================================

import {

    getData,
    addData,
    deleteData

} from "./firebase-data.js";


// =====================================================
// GLOBAL DATA
// =====================================================

let expenses = [];


// =====================================================
// DOM ELEMENTS
// =====================================================

const categoryInput =
    document.getElementById(
        "category"
    );


const expenseAmountInput =
    document.getElementById(
        "expenseAmount"
    );


const expenseDateInput =
    document.getElementById(
        "expenseDate"
    );


const expenseNoteInput =
    document.getElementById(
        "expenseNote"
    );


const expenseList =
    document.getElementById(
        "expenseList"
    );


// =====================================================
// LOAD EXPENSES
// =====================================================

async function loadExpenses() {

    try {

        showLoading();


        expenses =
            await getData(
                "expenses"
            );


        // =============================================
        // SORT NEWEST FIRST
        // =============================================

        expenses.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date || 0
                    );


                const dateB =
                    new Date(
                        b.date || 0
                    );


                return dateB - dateA;

            }
        );


        console.log(
            "Expenses Loaded:",
            expenses
        );


        showExpenses();


    }
    catch (error) {

        console.error(
            "Error loading expenses:",
            error
        );


        if (expenseList) {

            expenseList.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="text-center text-danger"
                    >

                        ❌ Unable to load expenses

                    </td>

                </tr>

            `;

        }


        showError(
            "Unable to load expenses from Firebase."
        );

    }

}


// =====================================================
// ADD EXPENSE
// =====================================================

async function addExpense() {

    try {

        // =============================================
        // GET VALUES
        // =============================================

        const category =
            categoryInput
                ? categoryInput.value.trim()
                : "";


        const amount =
            expenseAmountInput
                ? Number(
                    expenseAmountInput.value
                ) || 0
                : 0;


        const date =
            expenseDateInput
                ? expenseDateInput.value
                : "";


        const note =
            expenseNoteInput
                ? expenseNoteInput.value.trim()
                : "";


        // =============================================
        // VALIDATION
        // =============================================

        if (!category) {

            showError(
                "Please enter expense category."
            );

            return;

        }


        if (amount <= 0) {

            showError(
                "Please enter a valid expense amount."
            );

            return;

        }


        if (!date) {

            showError(
                "Please select expense date."
            );

            return;

        }


        // =============================================
        // CREATE DATA
        // =============================================

        const expenseData = {

            category:
                category,

            amount:
                amount,

            date:
                date,

            note:
                note,

            createdAt:
                new Date().toISOString()

        };


        // =============================================
        // SAVE TO FIREBASE
        // =============================================

        const newExpense =
            await addData(
                "expenses",
                expenseData
            );


        console.log(
            "Expense Saved:",
            newExpense
        );


        // =============================================
        // ADD LOCAL DATA
        // =============================================

        if (newExpense) {

            expenses.push(
                newExpense
            );

        }
        else {

            // Reload if firebase function
            // does not return document

            await loadExpenses();

        }


        // =============================================
        // SORT
        // =============================================

        expenses.sort(
            (a, b) => {

                return new Date(
                    b.date || 0
                ) - new Date(
                    a.date || 0
                );

            }
        );


        // =============================================
        // UPDATE PAGE
        // =============================================

        showExpenses();


        clearExpenseForm();


        showSuccess(
            "Expense saved successfully."
        );


    }
    catch (error) {

        console.error(
            "Error saving expense:",
            error
        );


        showError(
            "Failed to save expense."
        );

    }

}


// =====================================================
// SHOW EXPENSES
// =====================================================

function showExpenses() {

    if (!expenseList) {

        return;

    }


    expenseList.innerHTML = "";


    // =============================================
    // NO EXPENSE
    // =============================================

    if (
        !expenses ||
        expenses.length === 0
    ) {

        expenseList.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="
                        text-center
                        text-muted
                        py-4
                    "
                >

                    No Expense Found

                </td>

            </tr>

        `;


        return;

    }


    // =============================================
    // DISPLAY EXPENSES
    // =============================================

    expenses.forEach(
        (expense, index) => {

            const amount =
                Number(
                    expense.amount || 0
                );


            expenseList.innerHTML += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>


                    <td>

                        ${escapeHTML(
                            expense.category ||
                            "-"
                        )}

                    </td>


                    <td>

                        ₹${amount.toLocaleString(
                            "en-IN",
                            {

                                minimumFractionDigits: 2,

                                maximumFractionDigits: 2

                            }
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            expense.date ||
                            "-"
                        )}

                    </td>


                    <td>

                        <button

                            type="button"

                            onclick="
                                deleteExpense(
                                    '${expense.id}'
                                )
                            "

                            class="
                                btn
                                btn-danger
                                btn-sm
                            "

                        >

                            🗑️ Delete

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// DELETE EXPENSE
// =====================================================

async function deleteExpense(id) {

    try {

        const confirmDelete =
            confirm(
                "Are you sure you want to delete this expense?"
            );


        if (!confirmDelete) {

            return;

        }


        // =============================================
        // DELETE FIREBASE
        // =============================================

        await deleteData(
            "expenses",
            id
        );


        // =============================================
        // REMOVE LOCAL DATA
        // =============================================

        expenses =
            expenses.filter(
                expense =>

                    String(
                        expense.id
                    ) !==

                    String(
                        id
                    )

            );


        // =============================================
        // REFRESH TABLE
        // =============================================

        showExpenses();


        showSuccess(
            "Expense deleted successfully."
        );


    }
    catch (error) {

        console.error(
            "Error deleting expense:",
            error
        );


        showError(
            "Failed to delete expense."
        );

    }

}


// =====================================================
// CLEAR EXPENSE FORM
// =====================================================

function clearExpenseForm() {

    if (categoryInput) {

        categoryInput.value = "";

    }


    if (expenseAmountInput) {

        expenseAmountInput.value = "";

    }


    if (expenseNoteInput) {

        expenseNoteInput.value = "";

    }


    // Keep today's date

    if (expenseDateInput) {

        expenseDateInput.value =
            getTodayDate();

    }

}


// =====================================================
// GET TODAY DATE
// =====================================================

function getTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    if (!expenseList) {

        return;

    }


    expenseList.innerHTML = `

        <tr>

            <td
                colspan="5"
                class="
                    text-center
                    text-muted
                    py-4
                "
            >

                ⏳ Loading Expenses...

            </td>

        </tr>

    `;

}


// =====================================================
// SHOW SUCCESS MESSAGE
// =====================================================

function showSuccess(message) {

    let messageBox =
        document.getElementById(
            "expenseSuccess"
        );


    if (!messageBox) {

        alert(
            message
        );

        return;

    }


    messageBox.textContent =
        message;


    messageBox.classList.remove(
        "d-none"
    );


    messageBox.classList.add(
        "show"
    );


    setTimeout(
        () => {

            messageBox.classList.add(
                "d-none"
            );

        },
        4000
    );

}


// =====================================================
// SHOW ERROR MESSAGE
// =====================================================

function showError(message) {

    let messageBox =
        document.getElementById(
            "expenseError"
        );


    if (!messageBox) {

        alert(
            message
        );

        return;

    }


    messageBox.textContent =
        message;


    messageBox.classList.remove(
        "d-none"
    );


    setTimeout(
        () => {

            messageBox.classList.add(
                "d-none"
            );

        },
        5000
    );

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


    return String(
        value
    )

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
// EXPOSE FUNCTIONS TO HTML
// =====================================================

window.addExpense =
    addExpense;


window.deleteExpense =
    deleteExpense;


window.showExpenses =
    showExpenses;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // =============================================
        // DEFAULT DATE
        // =============================================

        if (
            expenseDateInput &&
            !expenseDateInput.value
        ) {

            expenseDateInput.value =
                getTodayDate();

        }


        // =============================================
        // LOAD EXPENSES
        // =============================================

        await loadExpenses();

    }
);