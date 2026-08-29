// =====================================================
// GROUPS.JS
// PKV EAST CHIT
// FIREBASE / FIRESTORE VERSION
//
// FEATURES
// -----------------------------------------------------
// ✅ Add Group
// ✅ Edit Group
// ✅ Delete Group
// ✅ Complete Group
// ✅ Automatic End Date
// ✅ Automatic Duration
// ✅ Automatic Current Month
// ✅ Automatic Chit Number
// ✅ Automatic Status
// ✅ Firestore Save
// ✅ Firestore Update
// ✅ Firestore Delete
// ✅ Firestore Load
// ✅ Auto Refresh
// ✅ Search
// ✅ HTML IDs matched with groups.html
// =====================================================

import {
    getData,
    addData,
    updateData,
    deleteData
} from "./firebase-data.js";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let groups = [];

let editId = null;

let isSaving = false;


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "======================================"
        );

        console.log(
            "🔥 GROUPS.JS INITIALIZED"
        );

        console.log(
            "======================================"
        );

        setupEvents();

        setDefaultStartDate();

        updateEndDate();

        updatePreview();

        await loadGroups();

    }
);


// =====================================================
// SAFE NUMBER
// =====================================================

function number(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }

    if (
        typeof value === "string"
    ) {

        value =
            value
                .replace(/₹/g, "")
                .replace(/,/g, "")
                .trim();

    }

    const result =
        Number(value);

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
        number(value).toLocaleString(
            "en-IN",
            {
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
// GET VALUE
// =====================================================

function getValue(id) {

    const element =
        getElement(id);

    if (!element) {

        return "";

    }

    return element.value;

}


// =====================================================
// SET VALUE
// =====================================================

function setValue(
    id,
    value
) {

    const element =
        getElement(id);

    if (element) {

        element.value =
            value ?? "";

    }

}


// =====================================================
// TODAY STRING
// =====================================================

function getTodayString() {

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

    return (
        `${year}-${month}-${day}`
    );

}


// =====================================================
// DEFAULT START DATE
// =====================================================

function setDefaultStartDate() {

    const startDate =
        getElement(
            "startDate"
        );

    if (
        startDate &&
        !startDate.value
    ) {

        startDate.value =
            getTodayString();

    }

}


// =====================================================
// CALCULATE END DATE
//
// Example:
//
// Start = 2026-08-01
// Duration = 20
//
// End = 2028-03-01
//
// 20 months total
// =====================================================

function calculateEndDateValue(
    startValue,
    durationValue
) {

    if (
        !startValue ||
        durationValue <= 0
    ) {

        return "";

    }

    const date =
        new Date(
            startValue +
            "T00:00:00"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }

    date.setMonth(
        date.getMonth() +
        durationValue -
        1
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}`
    );

}


// =====================================================
// UPDATE END DATE
// =====================================================

function updateEndDate() {

    const startDate =
        getElement(
            "startDate"
        );

    const duration =
        getElement(
            "duration"
        );

    const endDate =
        getElement(
            "endDate"
        );

    if (
        !startDate ||
        !duration ||
        !endDate
    ) {

        return;

    }

    const startValue =
        startDate.value;

    const durationValue =
        number(
            duration.value
        );

    if (
        !startValue ||
        durationValue <= 0
    ) {

        endDate.value =
            "";

        return;

    }

    endDate.value =
        calculateEndDateValue(
            startValue,
            durationValue
        );

}


// =====================================================
// AUTO DURATION
//
// If Member Count = 20
// Duration automatically = 20
//
// Only fills automatically when
// duration is empty.
// =====================================================

function autoSetDuration() {

    const members =
        getElement(
            "members"
        );

    const duration =
        getElement(
            "duration"
        );

    if (
        !members ||
        !duration
    ) {

        return;

    }

    const memberCount =
        number(
            members.value
        );

    if (
        memberCount > 0 &&
        (
            !duration.value ||
            number(duration.value) <= 0
        )
    ) {

        duration.value =
            memberCount;

    }

}


// =====================================================
// CURRENT MONTH
// =====================================================

function calculateCurrentMonth(
    startValue,
    durationValue
) {

    if (
        !startValue ||
        durationValue <= 0
    ) {

        return 1;

    }

    const start =
        new Date(
            startValue +
            "T00:00:00"
        );

    const today =
        new Date();

    if (
        Number.isNaN(
            start.getTime()
        )
    ) {

        return 1;

    }

    start.setHours(
        0,
        0,
        0,
        0
    );

    today.setHours(
        0,
        0,
        0,
        0
    );

    let monthNumber =
        1;

    if (
        today >= start
    ) {

        monthNumber =
            (
                (
                    today.getFullYear() -
                    start.getFullYear()
                ) * 12
            )
            +
            (
                today.getMonth() -
                start.getMonth()
            )
            +
            1;

    }

    if (
        monthNumber < 1
    ) {

        monthNumber = 1;

    }

    if (
        monthNumber >
        durationValue
    ) {

        monthNumber =
            durationValue;

    }

    return monthNumber;

}


// =====================================================
// CHIT NUMBER
// =====================================================

function getChitNumber(
    monthNumber
) {

    return (
        "CHIT-" +
        String(
            monthNumber
        ).padStart(
            3,
            "0"
        )
    );

}


// =====================================================
// UPDATE PREVIEW
// =====================================================

function updatePreview() {

    updateEndDate();

    const startDate =
        getElement(
            "startDate"
        );

    const duration =
        getElement(
            "duration"
        );

    const currentMonthText =
        getElement(
            "currentMonthText"
        );

    const chitNoText =
        getElement(
            "chitNoText"
        );

    if (
        !startDate ||
        !duration
    ) {

        return;

    }

    const startValue =
        startDate.value;

    const durationValue =
        number(
            duration.value
        );

    const monthNumber =
        calculateCurrentMonth(
            startValue,
            durationValue
        );

    if (currentMonthText) {

        currentMonthText.innerText =
            monthNumber;

    }

    if (chitNoText) {

        chitNoText.innerText =
            getChitNumber(
                monthNumber
            );

    }

}


// =====================================================
// GET GROUP STATUS
// =====================================================

function getGroupStatus(group) {

    if (!group) {

        return "Active";

    }

    const savedStatus =
        String(
            group.status ??
            ""
        )
            .trim()
            .toLowerCase();

    if (
        savedStatus ===
        "completed"
    ) {

        return "Completed";

    }

    if (
        savedStatus ===
        "closed"
    ) {

        return "Completed";

    }

    if (
        savedStatus ===
        "expired"
    ) {

        return "Completed";

    }

    const endDate =
        group.endDate ??
        "";

    if (!endDate) {

        return "Active";

    }

    const end =
        new Date(
            endDate +
            "T00:00:00"
        );

    if (
        Number.isNaN(
            end.getTime()
        )
    ) {

        return "Active";

    }

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    end.setHours(
        0,
        0,
        0,
        0
    );

    if (
        end < today
    ) {

        return "Completed";

    }

    return "Active";

}


// =====================================================
// FORM DATA
// =====================================================

function getFormData() {

    const groupName =
        getValue(
            "groupName"
        ).trim();

    const amount =
        number(
            getValue(
                "amount"
            )
        );

    const members =
        number(
            getValue(
                "members"
            )
        );

    const duration =
        number(
            getValue(
                "duration"
            )
        );

    const startDate =
        getValue(
            "startDate"
        );

    let endDate =
        getValue(
            "endDate"
        );

    // Recalculate automatically
    if (
        startDate &&
        duration > 0
    ) {

        endDate =
            calculateEndDateValue(
                startDate,
                duration
            );

    }

    const currentMonth =
        calculateCurrentMonth(
            startDate,
            duration
        );

    const chitNo =
        getChitNumber(
            currentMonth
        );

    return {

        groupName,

        name:
            groupName,

        amount,

        chitAmount:
            amount,

        members,

        memberCount:
            members,

        duration,

        startDate,

        endDate,

        currentMonth,

        chitNo,

        status:
            "Active",

        updatedAt:
            new Date().toISOString()

    };

}


// =====================================================
// VALIDATE FORM
// =====================================================

function validateForm(data) {

    if (
        !data.groupName
    ) {

        alert(
            "Please enter Group Name."
        );

        return false;

    }

    if (
        data.amount <= 0
    ) {

        alert(
            "Please enter Chit Amount."
        );

        return false;

    }

    if (
        data.members <= 0
    ) {

        alert(
            "Please enter Member Count."
        );

        return false;

    }

    if (
        data.duration <= 0
    ) {

        alert(
            "Please enter Group Duration."
        );

        return false;

    }

    if (
        !data.startDate
    ) {

        alert(
            "Please select Start Date."
        );

        return false;

    }

    if (
        !data.endDate
    ) {

        alert(
            "Unable to calculate End Date."
        );

        return false;

    }

    return true;

}


// =====================================================
// SAVE GROUP
// =====================================================

async function saveGroup() {

    if (isSaving) {

        console.warn(
            "Save already in progress..."
        );

        return;

    }

    isSaving = true;

    const button =
        getElement(
            "saveGroupBtn"
        );

    try {

        const data =
            getFormData();

        console.log(
            "📦 Group form data:",
            data
        );

        if (
            !validateForm(data)
        ) {

            return;

        }

        const status =
            getGroupStatus(
                data
            );

        data.status =
            status;

        // =============================================
        // UPDATE
        // =============================================

        if (editId) {

            await updateData(
                "groups",
                editId,
                data
            );

            alert(
                "✅ Group Updated Successfully"
            );

        }

        // =============================================
        // ADD
        // =============================================

        else {

            data.createdAt =
                new Date().toISOString();

            await addData(
                "groups",
                data
            );

            alert(
                "✅ Group Added Successfully"
            );

        }

        editId = null;

        clearForm();

        await loadGroups();

    }
    catch (error) {

        console.error(
            "❌ Save Group Error:",
            error
        );

        alert(
            "Unable to save group.\n\n" +
            (
                error?.message ??
                error
            )
        );

    }
    finally {

        isSaving = false;

        if (button) {

            button.disabled =
                false;

        }

    }

}


// =====================================================
// EDIT GROUP
// =====================================================

function editGroup(id) {

    const group =
        groups.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!group) {

        alert(
            "Group not found."
        );

        return;

    }

    editId =
        group.id;

    // =============================================
    // FORM VALUES
    // =============================================

    setValue(
        "groupName",
        group.groupName ??
        group.name ??
        ""
    );

    setValue(
        "amount",
        group.amount ??
        group.chitAmount ??
        0
    );

    setValue(
        "members",
        group.members ??
        group.memberCount ??
        0
    );

    setValue(
        "duration",
        group.duration ??
        (
            group.members ??
            group.memberCount ??
            0
        )
    );

    setValue(
        "startDate",
        group.startDate ??
        ""
    );

    // =============================================
    // RECALCULATE END DATE
    // =============================================

    updateEndDate();

    updatePreview();

    // =============================================
    // FORM TITLE
    // =============================================

    const formTitle =
        getElement(
            "formTitle"
        );

    if (formTitle) {

        formTitle.innerHTML =
            "✏️ Edit Group";

    }

    // =============================================
    // SAVE BUTTON
    // =============================================

    const saveButton =
        getElement(
            "saveGroupBtn"
        );

    if (saveButton) {

        saveButton.innerHTML =
            "✏️ Update Group";

    }

    // =============================================
    // CANCEL BUTTON
    // =============================================

    const cancelButton =
        getElement(
            "cancelEditBtn"
        );

    if (cancelButton) {

        cancelButton.style.display =
            "block";

    }

    // =============================================
    // SCROLL TOP
    // =============================================

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================================
// DELETE GROUP
// =====================================================

async function deleteGroup(id) {

    const group =
        groups.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!group) {

        alert(
            "Group not found."
        );

        return;

    }

    const groupName =
        group.groupName ??
        group.name ??
        "this group";

    const confirmed =
        confirm(
            `Delete "${groupName}"?\n\nThis action cannot be undone.`
        );

    if (!confirmed) {

        return;

    }

    try {

        await deleteData(
            "groups",
            id
        );

        groups =
            groups.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

        renderGroups();

        alert(
            "🗑 Group Deleted Successfully"
        );

    }
    catch (error) {

        console.error(
            "❌ Delete Group Error:",
            error
        );

        alert(
            "Unable to delete group.\n\n" +
            (
                error?.message ??
                error
            )
        );

    }

}


// =====================================================
// COMPLETE GROUP
// =====================================================

async function completeGroup(id) {

    const group =
        groups.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!group) {

        alert(
            "Group not found."
        );

        return;

    }

    if (
        getGroupStatus(group) ===
        "Completed"
    ) {

        alert(
            "This group is already completed."
        );

        return;

    }

    const confirmed =
        confirm(
            "Mark this group as Completed?"
        );

    if (!confirmed) {

        return;

    }

    try {

        await updateData(
            "groups",
            id,
            {

                status:
                    "Completed",

                completedAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()

            }
        );

        group.status =
            "Completed";

        group.completedAt =
            new Date().toISOString();

        renderGroups();

        alert(
            "✅ Group Completed Successfully"
        );

    }
    catch (error) {

        console.error(
            "❌ Complete Group Error:",
            error
        );

        alert(
            "Unable to complete group.\n\n" +
            (
                error?.message ??
                error
            )
        );

    }

}


// =====================================================
// AUTO COMPLETE EXPIRED GROUPS
// =====================================================

async function updateExpiredGroups() {

    if (
        !Array.isArray(groups)
    ) {

        return;

    }

    for (
        const group of groups
    ) {

        const status =
            getGroupStatus(
                group
            );

        const savedStatus =
            String(
                group.status ??
                "Active"
            )
                .trim()
                .toLowerCase();

        if (
            status === "Completed" &&
            savedStatus !== "completed"
        ) {

            try {

                await updateData(
                    "groups",
                    group.id,
                    {

                        status:
                            "Completed",

                        completedAt:
                            new Date().toISOString(),

                        updatedAt:
                            new Date().toISOString()

                    }
                );

                group.status =
                    "Completed";

            }
            catch (error) {

                console.error(
                    "❌ Auto complete failed:",
                    group.id,
                    error
                );

            }

        }

    }

}


// =====================================================
// LOAD GROUPS FROM FIRESTORE
// =====================================================

async function loadGroups() {

    const statusBox =
        getElement(
            "firebaseStatus"
        );

    try {

        if (statusBox) {

            statusBox.className =
                "alert alert-info firebase-status";

            statusBox.innerHTML =
                "🔥 Loading Groups from Firestore...";

        }

        console.log(
            "🔥 Loading groups from Firestore..."
        );

        const data =
            await getData(
                "groups"
            );

        groups =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "📦 Groups loaded:",
            groups.length
        );

        // Auto complete expired
        await updateExpiredGroups();

        renderGroups();

        if (statusBox) {

            statusBox.className =
                "alert alert-success firebase-status";

            statusBox.innerHTML =
                `🔥 Firestore Connected • ${groups.length} Groups Loaded`;

        }

    }
    catch (error) {

        console.error(
            "❌ Groups Load Error:",
            error
        );

        groups = [];

        renderGroups();

        if (statusBox) {

            statusBox.className =
                "alert alert-danger firebase-status";

            statusBox.innerHTML =
                "❌ Firestore Error: " +
                (
                    error?.message ??
                    error
                );

        }

    }

}


// =====================================================
// SEARCH GROUPS
// =====================================================

function searchGroups() {

    const searchElement =
        getElement(
            "groupSearch"
        );

    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";

    if (!search) {

        renderGroups();

        return;

    }

    const filtered =
        groups.filter(
            group => {

                const name =
                    String(
                        group.groupName ??
                        group.name ??
                        ""
                    )
                        .toLowerCase();

                const status =
                    String(
                        getGroupStatus(
                            group
                        )
                    )
                        .toLowerCase();

                const chitNo =
                    String(
                        group.chitNo ??
                        ""
                    )
                        .toLowerCase();

                return (
                    name.includes(search) ||
                    status.includes(search) ||
                    chitNo.includes(search)
                );

            }
        );

    renderGroups(
        filtered
    );

}


// =====================================================
// RENDER GROUPS
// =====================================================

function renderGroups(
    data = groups
) {

    const tableBody =
        getElement(
            "groupList"
        );

    if (!tableBody) {

        console.warn(
            "⚠️ groupList element not found."
        );

        return;

    }

    tableBody.innerHTML =
        "";

    // =============================================
    // NO DATA
    // =============================================

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center py-4 text-muted"
                >

                    📭 No Groups Found

                </td>

            </tr>

        `;

        return;

    }


    // =============================================
    // SORT
    // =============================================

    const sorted =
        [...data].sort(
            (
                a,
                b
            ) => {

                const aDate =
                    String(
                        a.startDate ??
                        ""
                    );

                const bDate =
                    String(
                        b.startDate ??
                        ""
                    );

                return (
                    bDate.localeCompare(
                        aDate
                    )
                );

            }
        );


    // =============================================
    // RENDER
    // =============================================

    sorted.forEach(
        group => {

            const status =
                getGroupStatus(
                    group
                );

            const groupName =
                group.groupName ??
                group.name ??
                "-";

            const amount =
                number(
                    group.amount ??
                    group.chitAmount ??
                    0
                );

            const memberCount =
                number(
                    group.members ??
                    group.memberCount ??
                    0
                );

            const duration =
                number(
                    group.duration ??
                    memberCount
                );

            const startDate =
                group.startDate ??
                "-";

            const endDate =
                group.endDate ??
                calculateEndDateValue(
                    startDate,
                    duration
                ) ??
                "-";

            const currentMonth =
                calculateCurrentMonth(
                    startDate,
                    duration
                );

            const chitNo =
                group.chitNo ??
                getChitNumber(
                    currentMonth
                );


            // =========================================
            // STATUS BADGE
            // =========================================

            const statusBadge =
                status === "Completed"

                    ? `

                        <span
                            class="badge bg-success"
                        >

                            ✅ Completed

                        </span>

                    `

                    : `

                        <span
                            class="badge bg-primary"
                        >

                            🟢 Active

                        </span>

                    `;


            // =========================================
            // ACTION BUTTONS
            // =========================================

            const completeButton =
                status !== "Completed"

                    ? `

                        <button
                            type="button"
                            class="btn btn-success btn-sm me-1"
                            onclick="completeGroup('${group.id}')"
                        >

                            ✓ Complete

                        </button>

                    `

                    : "";


            tableBody.innerHTML += `

                <tr>

                    <!-- GROUP NAME -->

                    <td>

                        <strong>

                            ${escapeHtml(
                                groupName
                            )}

                        </strong>

                    </td>


                    <!-- AMOUNT -->

                    <td>

                        ${money(
                            amount
                        )}

                    </td>


                    <!-- MEMBERS -->

                    <td>

                        ${memberCount}

                    </td>


                    <!-- DURATION -->

                    <td>

                        ${duration} Months

                    </td>


                    <!-- START DATE -->

                    <td>

                        ${startDate}

                    </td>


                    <!-- END DATE -->

                    <td>

                        ${endDate}

                    </td>


                    <!-- CHIT NO -->

                    <td>

                        <span
                            class="badge bg-dark"
                        >

                            ${chitNo}

                        </span>

                    </td>


                    <!-- CURRENT MONTH -->

                    <td>

                        <strong>

                            Month ${currentMonth}

                        </strong>

                    </td>


                    <!-- STATUS -->

                    <td>

                        ${statusBadge}

                    </td>


                    <!-- ACTION -->

                    <td>

                        <button
                            type="button"
                            class="btn btn-primary btn-sm me-1"
                            onclick="editGroup('${group.id}')"
                        >

                            ✏️ Edit

                        </button>


                        ${completeButton}


                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="deleteGroup('${group.id}')"
                        >

                            🗑 Delete

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(
        value ?? ""
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
// CLEAR FORM
// =====================================================

function clearForm() {

    editId =
        null;

    setValue(
        "groupName",
        ""
    );

    setValue(
        "amount",
        ""
    );

    setValue(
        "members",
        ""
    );

    setValue(
        "duration",
        ""
    );

    setValue(
        "startDate",
        getTodayString()
    );

    setValue(
        "endDate",
        ""
    );


    const formTitle =
        getElement(
            "formTitle"
        );

    if (formTitle) {

        formTitle.innerHTML =
            "➕ Add New Group";

    }


    const saveButton =
        getElement(
            "saveGroupBtn"
        );

    if (saveButton) {

        saveButton.innerHTML =
            "💾 Save Group";

    }


    const cancelButton =
        getElement(
            "cancelEditBtn"
        );

    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    const currentMonthText =
        getElement(
            "currentMonthText"
        );

    const chitNoText =
        getElement(
            "chitNoText"
        );

    if (currentMonthText) {

        currentMonthText.innerText =
            "1";

    }

    if (chitNoText) {

        chitNoText.innerText =
            "CHIT-001";

    }

}


// =====================================================
// SETUP EVENTS
// =====================================================

function setupEvents() {

    // =============================================
    // SAVE
    // =============================================

    const saveButton =
        getElement(
            "saveGroupBtn"
        );

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveGroup
        );

    }


    // =============================================
    // CANCEL EDIT
    // =============================================

    const cancelButton =
        getElement(
            "cancelEditBtn"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            clearForm
        );

    }


    // =============================================
    // MEMBER COUNT
    // =============================================

    const members =
        getElement(
            "members"
        );

    if (members) {

        members.addEventListener(
            "input",
            function () {

                autoSetDuration();

                updatePreview();

            }
        );

    }


    // =============================================
    // DURATION
    // =============================================

    const duration =
        getElement(
            "duration"
        );

    if (duration) {

        duration.addEventListener(
            "input",
            function () {

                updateEndDate();

                updatePreview();

            }
        );

    }


    // =============================================
    // START DATE
    // =============================================

    const startDate =
        getElement(
            "startDate"
        );

    if (startDate) {

        startDate.addEventListener(
            "change",
            function () {

                updateEndDate();

                updatePreview();

            }
        );

    }


    // =============================================
    // AMOUNT
    // =============================================

    const amount =
        getElement(
            "amount"
        );

    if (amount) {

        amount.addEventListener(
            "input",
            updatePreview
        );

    }


    // =============================================
    // OPTIONAL SEARCH
    // =============================================

    const search =
        getElement(
            "groupSearch"
        );

    if (search) {

        search.addEventListener(
            "input",
            searchGroups
        );

    }

}


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.loadGroups =
    loadGroups;

window.saveGroup =
    saveGroup;

window.editGroup =
    editGroup;

window.deleteGroup =
    deleteGroup;

window.completeGroup =
    completeGroup;

window.searchGroups =
    searchGroups;

window.clearGroupForm =
    clearForm;

window.updateEndDate =
    updateEndDate;

window.updatePreview =
    updatePreview;

window.calculateCurrentMonth =
    calculateCurrentMonth;


// =====================================================
// AUTO REFRESH
// Every 30 seconds
// =====================================================

setInterval(
    async function () {

        try {

            console.log(
                "🔄 Auto refreshing groups..."
            );

            await loadGroups();

        }
        catch (error) {

            console.error(
                "❌ Automatic refresh failed:",
                error
            );

        }

    },
    30000
);


// =====================================================
// FINAL LOG
// =====================================================

console.log(
    "✅ groups.js loaded successfully"
);