// =====================================================
// COLLECTION.JS
// PKV EAST CHIT
// FIREBASE FIRESTORE VERSION
// =====================================================


// =====================================================
// FIREBASE IMPORTS
// =====================================================

import {

    db

} from "./firebase.js";


import {

    collection,

    getDocs,

    addDoc,

    updateDoc,

    deleteDoc,

    doc,

    serverTimestamp

} from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let members = [];

let groups = [];

let payments = [];

let collectionsData = [];

let editId = null;


// =====================================================
// DOM ELEMENTS
// =====================================================

const memberSelect =
    document.getElementById(
        "memberSelect"
    );


const installmentAmount =
    document.getElementById(
        "installmentAmount"
    );


const collectionAmount =
    document.getElementById(
        "collectionAmount"
    );


const remainingAmount =
    document.getElementById(
        "remainingAmount"
    );


const paymentMode =
    document.getElementById(
        "paymentMode"
    );


const collectionDate =
    document.getElementById(
        "collectionDate"
    );


const remarks =
    document.getElementById(
        "remarks"
    );


const installmentInfo =
    document.getElementById(
        "installmentInfo"
    );


const remainingInfo =
    document.getElementById(
        "remainingInfo"
    );


const collectionList =
    document.getElementById(
        "collectionList"
    );


const saveCollectionBtn =
    document.getElementById(
        "saveCollectionBtn"
    );


const updateCollectionBtn =
    document.getElementById(
        "updateCollectionBtn"
    );


const cancelCollectionBtn =
    document.getElementById(
        "cancelCollectionBtn"
    );


const clearCollectionBtn =
    document.getElementById(
        "clearCollectionBtn"
    );


const collectionError =
    document.getElementById(
        "collectionError"
    );


const collectionSuccess =
    document.getElementById(
        "collectionSuccess"
    );


// =====================================================
// GET FIELD HELPER
// =====================================================

function getField(
    object,
    fieldNames,
    defaultValue = null
) {

    if (!object) {

        return defaultValue;

    }


    for (

        const field of fieldNames

    ) {

        if (

            object[field] !== undefined &&
            object[field] !== null &&
            object[field] !== ""

        ) {

            return object[field];

        }

    }


    return defaultValue;

}


// =====================================================
// GET PAYMENT MEMBER ID
// =====================================================

function getPaymentMemberId(
    payment
) {

    return getField(

        payment,

        [

            "memberId",
            "memberID",
            "member_id",
            "member"

        ]

    );

}


// =====================================================
// GET PAYMENT GROUP ID
// =====================================================

function getPaymentGroupId(
    payment
) {

    return getField(

        payment,

        [

            "groupId",
            "groupID",
            "group_id",
            "group"

        ]

    );

}


// =====================================================
// GET PAYMENT AMOUNT
// =====================================================

function getPaymentAmount(
    payment
) {

    const amount =

        getField(

            payment,

            [

                "currentPayment",
                "installmentAmount",
                "installment",
                "amount",
                "paidAmount",
                "paymentAmount"

            ],

            0

        );


    return Number(amount) || 0;

}


// =====================================================
// SORT PAYMENTS
// =====================================================

function sortPaymentsByDate(
    paymentList
) {

    return [

        ...paymentList

    ].sort(

        (a, b) => {

            const dateA =

                new Date(

                    a.date ||
                    a.paymentDate ||
                    a.createdAt?.toDate?.() ||
                    0

                );


            const dateB =

                new Date(

                    b.date ||
                    b.paymentDate ||
                    b.createdAt?.toDate?.() ||
                    0

                );


            return dateA - dateB;

        }

    );

}


// =====================================================
// LOAD ALL DATA
// =====================================================

async function loadData() {

    try {

        showLoading();


        await Promise.all([

            loadMembersData(),

            loadGroupsData(),

            loadPaymentsData(),

            loadCollectionsData()

        ]);


        loadMembersDropdown();


        showCollections();


        updateSummary();


        console.log(
            "================================="
        );

        console.log(
            "COLLECTION PAGE LOADED"
        );

        console.log(
            "Members:",
            members
        );

        console.log(
            "Groups:",
            groups
        );

        console.log(
            "Payments:",
            payments
        );

        console.log(
            "Collections:",
            collectionsData
        );

        console.log(
            "================================="
        );

    }

    catch (error) {

        console.error(
            "Collection Load Error:",
            error
        );


        showError(
            "Error loading Firestore data."
        );

    }

}


// =====================================================
// LOAD MEMBERS
// =====================================================

async function loadMembersData() {

    const snapshot =

        await getDocs(

            collection(
                db,
                "members"
            )

        );


    members =

        snapshot.docs.map(

            document => ({

                id:
                    document.id,

                ...document.data()

            })

        );


    console.log(
        "Members Loaded:",
        members.length
    );

}


// =====================================================
// LOAD GROUPS
// =====================================================

async function loadGroupsData() {

    const snapshot =

        await getDocs(

            collection(
                db,
                "groups"
            )

        );


    groups =

        snapshot.docs.map(

            document => ({

                id:
                    document.id,

                ...document.data()

            })

        );


    console.log(
        "Groups Loaded:",
        groups.length
    );

}


// =====================================================
// LOAD PAYMENTS
// =====================================================

async function loadPaymentsData() {

    const snapshot =

        await getDocs(

            collection(
                db,
                "payments"
            )

        );


    payments =

        snapshot.docs.map(

            document => ({

                id:
                    document.id,

                ...document.data()

            })

        );


    console.log(
        "Payments Loaded:",
        payments.length
    );


    console.table(
        payments
    );

}


// =====================================================
// LOAD COLLECTIONS
// =====================================================

async function loadCollectionsData() {

    const snapshot =

        await getDocs(

            collection(
                db,
                "collections"
            )

        );


    collectionsData =

        snapshot.docs.map(

            document => ({

                id:
                    document.id,

                ...document.data()

            })

        );


    collectionsData.sort(

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
        "Collections Loaded:",
        collectionsData.length
    );

}


// =====================================================
// LOAD MEMBERS DROPDOWN
// =====================================================

function loadMembersDropdown() {

    if (!memberSelect) {

        return;

    }


    memberSelect.innerHTML = `

        <option value="">

            Select Member

        </option>

    `;


    members.forEach(

        member => {

            const option =

                document.createElement(
                    "option"
                );


            option.value =
                member.id;


            const memberName =

                member.name ||
                member.memberName ||
                "Unknown";


            const mobile =

                member.mobile ||
                member.phone ||
                member.mobileNumber ||
                "";


            option.textContent =
                `${memberName} - ${mobile}`;


            memberSelect.appendChild(
                option
            );

        }

    );

}


// =====================================================
// GET MEMBER PAYMENTS
// =====================================================

function getMemberPayments(
    memberId
) {

    const result =

        payments.filter(

            payment => {

                const paymentMemberId =

                    getPaymentMemberId(
                        payment
                    );


                return (

                    String(
                        paymentMemberId
                    ) ===

                    String(
                        memberId
                    )

                );

            }

        );


    console.log(
        "Selected Member:",
        memberId
    );

    console.log(
        "Member Payments Found:",
        result
    );


    return sortPaymentsByDate(
        result
    );

}


// =====================================================
// GET TOTAL INSTALLMENT
// =====================================================

function getTotalInstallment(
    memberId
) {

    const memberPayments =

        getMemberPayments(
            memberId
        );


    let total = 0;


    memberPayments.forEach(

        payment => {

            total +=

                getPaymentAmount(
                    payment
                );

        }

    );


    return total;

}


// =====================================================
// GET TOTAL COLLECTION
// =====================================================

function getTotalCollection(
    memberId,
    excludeCollectionId = null
) {

    let total = 0;


    collectionsData.forEach(

        collectionItem => {

            if (

                excludeCollectionId &&
                String(
                    collectionItem.id
                ) ===
                String(
                    excludeCollectionId
                )

            ) {

                return;

            }


            if (

                String(
                    collectionItem.memberId
                ) ===

                String(
                    memberId
                )

            ) {

                total +=

                    Number(

                        collectionItem.collectionAmount

                    ) || 0;

            }

        }

    );


    return total;

}


// =====================================================
// GET MEMBER GROUP ID
// =====================================================

function getMemberGroupId(
    memberId
) {

    const memberPayments =

        getMemberPayments(
            memberId
        );


    if (

        memberPayments.length === 0

    ) {

        console.warn(
            "No payment found for member:",
            memberId
        );


        return null;

    }


    // Latest payment first try

    const latestPayment =

        memberPayments[
            memberPayments.length - 1
        ];


    let groupId =

        getPaymentGroupId(
            latestPayment
        );


    // If latest payment has no group,
    // search other payments

    if (!groupId) {

        for (

            let i =
                memberPayments.length - 1;

            i >= 0;

            i--

        ) {

            const foundGroupId =

                getPaymentGroupId(
                    memberPayments[i]
                );


            if (foundGroupId) {

                groupId =
                    foundGroupId;

                break;

            }

        }

    }


    console.log(
        "Detected Group ID:",
        groupId
    );


    return groupId;

}


// =====================================================
// GET GROUP NAME
// =====================================================

function getGroupName(
    groupId
) {

    const group =

        groups.find(

            groupItem =>

                String(
                    groupItem.id
                ) ===

                String(
                    groupId
                )

        );


    if (!group) {

        return null;

    }


    return (

        group.name ||
        group.groupName ||
        group.title ||
        "Unknown Group"

    );

}


// =====================================================
// LOAD MEMBER DETAILS
// =====================================================

function loadMemberDetails() {

    if (!memberSelect) {

        return;

    }


    const memberId =
        memberSelect.value;


    // =========================================
    // RESET
    // =========================================

    if (!memberId) {

        installmentAmount.value =
            "0.00";


        collectionAmount.value =
            "";


        remainingAmount.value =
            "0.00";


        installmentInfo.textContent =
            "Select member to load installment";


        updateRemainingInfo(
            0
        );


        return;

    }


    // =========================================
    // PAYMENTS
    // =========================================

    const memberPayments =

        getMemberPayments(
            memberId
        );


    if (

        memberPayments.length === 0

    ) {

        installmentAmount.value =
            "0.00";


        remainingAmount.value =
            "0.00";


        installmentInfo.textContent =
            "No installment found for this member";


        updateRemainingInfo(
            0
        );


        return;

    }


    // =========================================
    // TOTAL INSTALLMENT
    // =========================================

    const totalInstallment =

        getTotalInstallment(
            memberId
        );


    // =========================================
    // ALREADY COLLECTED
    // =========================================

    const alreadyCollected =

        getTotalCollection(

            memberId,

            editId

        );


    // =========================================
    // PENDING
    // =========================================

    const pendingAmount =

        Math.max(

            totalInstallment -
            alreadyCollected,

            0

        );


    // =========================================
    // DISPLAY
    // =========================================

    installmentAmount.value =

        pendingAmount.toFixed(
            2
        );


    remainingAmount.value =

        pendingAmount.toFixed(
            2
        );


    // =========================================
    // GROUP
    // =========================================

    const groupId =

        getMemberGroupId(
            memberId
        );


    const groupName =

        getGroupName(
            groupId
        );


    if (groupName) {

        installmentInfo.textContent =

            `Group: ${groupName} | ` +
            `Installment Total: ₹${totalInstallment.toFixed(2)} | ` +
            `Collected: ₹${alreadyCollected.toFixed(2)}`;

    }

    else {

        installmentInfo.textContent =

            `Installment records: ${memberPayments.length} | ` +
            `Pending: ₹${pendingAmount.toFixed(2)}`;

    }


    updateRemainingInfo(
        pendingAmount
    );

}


// =====================================================
// CALCULATE REMAINING
// =====================================================

function calculateRemaining() {

    const pendingAmount =

        Number(
            installmentAmount.value
        ) || 0;


    const amount =

        Number(
            collectionAmount.value
        ) || 0;


    let remaining =

        pendingAmount -
        amount;


    if (remaining < 0) {

        remaining = 0;

    }


    remainingAmount.value =

        remaining.toFixed(
            2
        );


    updateRemainingInfo(
        remaining
    );

}


// =====================================================
// UPDATE REMAINING STATUS
// =====================================================

function updateRemainingInfo(
    remaining
) {

    if (

        !remainingInfo ||
        !remainingAmount

    ) {

        return;

    }


    remainingAmount.classList.remove(
        "paid",
        "pending"
    );


    if (

        Number(remaining) <= 0

    ) {

        remainingInfo.textContent =

            "✅ Fully Paid";


        remainingAmount.classList.add(
            "paid"
        );

    }

    else {

        remainingInfo.textContent =

            `⚠️ ₹${Number(
                remaining
            ).toLocaleString(
                "en-IN",
                {

                    minimumFractionDigits: 2,

                    maximumFractionDigits: 2

                }
            )} Pending`;


        remainingAmount.classList.add(
            "pending"
        );

    }

}


// =====================================================
// SAVE COLLECTION
// =====================================================

async function saveCollection() {

    try {

        hideMessages();


        const memberId =
            memberSelect.value;


        const amount =

            Number(
                collectionAmount.value
            ) || 0;


        const pendingAmount =

            Number(
                installmentAmount.value
            ) || 0;


        const remaining =

            Number(
                remainingAmount.value
            ) || 0;


        const mode =
            paymentMode.value;


        const date =
            collectionDate.value;


        const remark =
            remarks.value.trim();


        // =========================================
        // VALIDATION
        // =========================================

        if (!memberId) {

            showError(
                "Please select a member."
            );

            return;

        }


        if (amount <= 0) {

            showError(
                "Please enter collection amount."
            );

            return;

        }


        if (!date) {

            showError(
                "Please select collection date."
            );

            return;

        }


        if (

            amount >
            pendingAmount

        ) {

            showError(
                "Collection amount cannot exceed pending amount."
            );

            return;

        }


        // =========================================
        // GET GROUP
        // =========================================

        const groupId =

            getMemberGroupId(
                memberId
            );


        // IMPORTANT:
        // Collection can still be saved even if
        // group document is missing.
        // Only payment is required.

        const memberPayments =

            getMemberPayments(
                memberId
            );


        if (

            memberPayments.length === 0

        ) {

            showError(
                "No installment record found for this member."
            );

            return;

        }


        // =========================================
        // SAVE
        // =========================================

        await addDoc(

            collection(
                db,
                "collections"
            ),

            {

                memberId:
                    memberId,

                groupId:
                    groupId || "",

                installmentAmount:
                    pendingAmount,

                collectionAmount:
                    amount,

                remainingAmount:
                    remaining,

                paymentMode:
                    mode,

                date:
                    date,

                remarks:
                    remark,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );


        showSuccess(
            "Collection saved successfully."
        );


        await loadCollectionsData();


        showCollections();


        updateSummary();


        clearForm();

    }

    catch (error) {

        console.error(
            "Save Error:",
            error
        );


        showError(
            "Error saving collection."
        );

    }

}


// =====================================================
// UPDATE COLLECTION
// =====================================================

async function updateCollection() {

    try {

        hideMessages();


        if (!editId) {

            showError(
                "No collection selected."
            );

            return;

        }


        const memberId =
            memberSelect.value;


        const amount =

            Number(
                collectionAmount.value
            ) || 0;


        const pendingAmount =

            Number(
                installmentAmount.value
            ) || 0;


        const remaining =

            Number(
                remainingAmount.value
            ) || 0;


        const mode =
            paymentMode.value;


        const date =
            collectionDate.value;


        const remark =
            remarks.value.trim();


        if (!memberId) {

            showError(
                "Please select a member."
            );

            return;

        }


        if (amount <= 0) {

            showError(
                "Please enter collection amount."
            );

            return;

        }


        if (

            amount >
            pendingAmount

        ) {

            showError(
                "Collection amount cannot exceed pending amount."
            );

            return;

        }


        const groupId =

            getMemberGroupId(
                memberId
            );


        await updateDoc(

            doc(
                db,
                "collections",
                editId
            ),

            {

                memberId:
                    memberId,

                groupId:
                    groupId || "",

                installmentAmount:
                    pendingAmount,

                collectionAmount:
                    amount,

                remainingAmount:
                    remaining,

                paymentMode:
                    mode,

                date:
                    date,

                remarks:
                    remark,

                updatedAt:
                    serverTimestamp()

            }

        );


        showSuccess(
            "Collection updated successfully."
        );


        await loadCollectionsData();


        showCollections();


        updateSummary();


        resetEditMode();


        clearForm();

    }

    catch (error) {

        console.error(
            "Update Error:",
            error
        );


        showError(
            "Error updating collection."
        );

    }

}


// =====================================================
// SHOW COLLECTION HISTORY
// =====================================================

function showCollections() {

    if (!collectionList) {

        return;

    }


    collectionList.innerHTML =
        "";


    if (

        collectionsData.length === 0

    ) {

        collectionList.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-message"
                >

                    No Collection Found

                </td>

            </tr>

        `;


        return;

    }


    collectionsData.forEach(

        (
            item,
            index
        ) => {


            const member =

                members.find(

                    m =>

                        String(
                            m.id
                        ) ===

                        String(
                            item.memberId
                        )

                );


            const memberName =

                member

                    ? (

                        member.name ||
                        member.memberName ||
                        "-"

                    )

                    : "-";


            const groupName =

                getGroupName(
                    item.groupId
                ) || "-";


            const installment =

                Number(
                    item.installmentAmount
                ) || 0;


            const collected =

                Number(
                    item.collectionAmount
                ) || 0;


            const remaining =

                Number(
                    item.remainingAmount
                ) || 0;


            let modeClass =
                "mode-other";


            if (

                item.paymentMode ===
                "Cash"

            ) {

                modeClass =
                    "mode-cash";

            }

            else if (

                item.paymentMode ===
                "UPI"

            ) {

                modeClass =
                    "mode-upi";

            }

            else if (

                item.paymentMode ===
                "Bank"

            ) {

                modeClass =
                    "mode-bank";

            }


            collectionList.innerHTML += `

                <tr>

                    <td>

                        ${index + 1}

                    </td>


                    <td>

                        ${memberName}

                    </td>


                    <td>

                        ${groupName}

                    </td>


                    <td>

                        ₹${installment.toFixed(2)}

                    </td>


                    <td>

                        ₹${collected.toFixed(2)}

                    </td>


                    <td>

                        ₹${remaining.toFixed(2)}

                    </td>


                    <td>

                        <span
                            class="
                                mode-badge
                                ${modeClass}
                            "
                        >

                            ${item.paymentMode || "Other"}

                        </span>

                    </td>


                    <td>

                        ${item.date || "-"}

                    </td>


                    <td>

                        ${item.remarks || "-"}

                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="
                                    btn
                                    btn-warning
                                "

                                onclick="
                                    window.editCollection(
                                        '${item.id}'
                                    )
                                "

                            >

                                ✏ Edit

                            </button>


                            <button
                                class="
                                    btn
                                    btn-danger
                                "

                                onclick="
                                    window.deleteCollection(
                                        '${item.id}'
                                    )
                                "

                            >

                                🗑 Delete

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }

    );

}


// =====================================================
// EDIT COLLECTION
// =====================================================

function editCollection(
    id
) {

    const item =

        collectionsData.find(

            collectionItem =>

                String(
                    collectionItem.id
                ) ===

                String(
                    id
                )

        );


    if (!item) {

        showError(
            "Collection not found."
        );

        return;

    }


    editId =
        item.id;


    memberSelect.value =
        item.memberId;


    installmentAmount.value =

        Number(
            item.installmentAmount
        ).toFixed(2);


    collectionAmount.value =

        Number(
            item.collectionAmount
        ).toFixed(2);


    remainingAmount.value =

        Number(
            item.remainingAmount
        ).toFixed(2);


    paymentMode.value =
        item.paymentMode ||
        "Cash";


    collectionDate.value =
        item.date ||
        getTodayDate();


    remarks.value =
        item.remarks ||
        "";


    updateRemainingInfo(

        Number(
            item.remainingAmount
        ) || 0

    );


    saveCollectionBtn.style.display =
        "none";


    updateCollectionBtn.style.display =
        "inline-flex";


    cancelCollectionBtn.style.display =
        "inline-flex";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    showSuccess(
        "Edit mode enabled."
    );

}


// =====================================================
// DELETE COLLECTION
// =====================================================

async function deleteCollection(
    id
) {

    try {

        if (

            !confirm(
                "Delete this collection?"
            )

        ) {

            return;

        }


        await deleteDoc(

            doc(

                db,

                "collections",

                id

            )

        );


        await loadCollectionsData();


        showCollections();


        updateSummary();


        showSuccess(
            "Collection deleted successfully."
        );


        if (

            memberSelect.value

        ) {

            loadMemberDetails();

        }

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Error deleting collection."
        );

    }

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    let total = 0;

    let todayTotal = 0;

    let cashTotal = 0;

    let onlineTotal = 0;


    const today =
        getTodayDate();


    collectionsData.forEach(

        item => {

            const amount =

                Number(
                    item.collectionAmount
                ) || 0;


            total += amount;


            if (

                item.date ===
                today

            ) {

                todayTotal += amount;

            }


            if (

                item.paymentMode ===
                "Cash"

            ) {

                cashTotal += amount;

            }


            if (

                item.paymentMode ===
                "UPI" ||

                item.paymentMode ===
                "Bank"

            ) {

                onlineTotal += amount;

            }

        }

    );


    setMoney(
        "totalCollections",
        total
    );


    setMoney(
        "todayCollection",
        todayTotal
    );


    setMoney(
        "cashCollection",
        cashTotal
    );


    setMoney(
        "onlineCollection",
        onlineTotal
    );

}


// =====================================================
// SET MONEY
// =====================================================

function setMoney(
    id,
    amount
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =

        `₹${Number(
            amount
        ).toLocaleString(
            "en-IN",
            {

                minimumFractionDigits: 2,

                maximumFractionDigits: 2

            }
        )}`;

}


// =====================================================
// CLEAR FORM
// =====================================================

function clearForm() {

    memberSelect.value =
        "";


    installmentAmount.value =
        "0.00";


    collectionAmount.value =
        "";


    remainingAmount.value =
        "0.00";


    paymentMode.value =
        "Cash";


    remarks.value =
        "";


    collectionDate.value =
        getTodayDate();


    installmentInfo.textContent =

        "Select member to load installment";


    updateRemainingInfo(
        0
    );

}


// =====================================================
// RESET EDIT MODE
// =====================================================

function resetEditMode() {

    editId =
        null;


    saveCollectionBtn.style.display =
        "inline-flex";


    updateCollectionBtn.style.display =
        "none";


    cancelCollectionBtn.style.display =
        "none";

}


// =====================================================
// CANCEL EDIT
// =====================================================

function cancelEdit() {

    clearForm();


    resetEditMode();


    hideMessages();

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
// SHOW ERROR
// =====================================================

function showError(
    message
) {

    if (!collectionError) {

        alert(
            message
        );

        return;

    }


    collectionError.textContent =
        message;


    collectionError.style.display =
        "block";


    if (collectionSuccess) {

        collectionSuccess.style.display =
            "none";

    }

}


// =====================================================
// SHOW SUCCESS
// =====================================================

function showSuccess(
    message
) {

    if (!collectionSuccess) {

        return;

    }


    collectionSuccess.textContent =
        message;


    collectionSuccess.style.display =
        "block";


    if (collectionError) {

        collectionError.style.display =
            "none";

    }


    setTimeout(

        () => {

            collectionSuccess.style.display =
                "none";

        },

        4000

    );

}


// =====================================================
// HIDE MESSAGES
// =====================================================

function hideMessages() {

    if (collectionError) {

        collectionError.style.display =
            "none";

    }


    if (collectionSuccess) {

        collectionSuccess.style.display =
            "none";

    }

}


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    if (!collectionList) {

        return;

    }


    collectionList.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="empty-message"
            >

                Loading Collections...

            </td>

        </tr>

    `;

}


// =====================================================
// EVENT LISTENERS
// =====================================================

if (memberSelect) {

    memberSelect.addEventListener(

        "change",

        function () {

            collectionAmount.value =
                "";


            loadMemberDetails();

        }

    );

}


if (collectionAmount) {

    collectionAmount.addEventListener(

        "input",

        calculateRemaining

    );

}


if (saveCollectionBtn) {

    saveCollectionBtn.addEventListener(

        "click",

        saveCollection

    );

}


if (updateCollectionBtn) {

    updateCollectionBtn.addEventListener(

        "click",

        updateCollection

    );

}


if (cancelCollectionBtn) {

    cancelCollectionBtn.addEventListener(

        "click",

        cancelEdit

    );

}


if (clearCollectionBtn) {

    clearCollectionBtn.addEventListener(

        "click",

        function () {

            clearForm();

            resetEditMode();

            hideMessages();

        }

    );

}


// =====================================================
// EXPOSE FUNCTIONS
// =====================================================

window.editCollection =
    editCollection;


window.deleteCollection =
    deleteCollection;


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(

    "DOMContentLoaded",

    async function () {

        if (

            collectionDate &&
            !collectionDate.value

        ) {

            collectionDate.value =
                getTodayDate();

        }


        await loadData();

    }

);