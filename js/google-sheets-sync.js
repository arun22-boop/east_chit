
/*
 * Chit Account Manager - Google Sheets sync
 * Existing localStorage records are kept.
 */

const GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbz_4nHJGwZar_cWwXJItX22EKOl9oeGs07vmvPvsywFEce9pBjdkVAkqGVoKrSmJ6Gu/exec";

// Change these aliases if your project uses different localStorage keys.
const STORAGE_KEYS = {
  Groups: ["groups"],
  Members: ["members"],
  Installments: ["installments"],
  Collections: ["collections", "payments"],
  Commission: ["commission", "commissions"],
  Expenses: ["expenses"],
  Reports: ["reports"]
};

let syncTimer = null;
let syncInProgress = false;

function readStoredArray(possibleKeys) {
  for (const key of possibleKeys) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;

    try {
      const value = JSON.parse(raw);
      if (Array.isArray(value)) return value;
    } catch (error) {
      console.warn("Could not parse localStorage key:", key, error);
    }
  }

  return [];
}

function buildSheetsPayload() {
  const data = {};

  Object.entries(STORAGE_KEYS).forEach(([sheetName, keys]) => {
    data[sheetName] = readStoredArray(keys);
  });

  // If Reports isn't saved as an array, generate a simple summary.
  if (!data.Reports.length) {
    const total = (items, fieldNames) =>
      items.reduce((sum, item) => {
        for (const field of fieldNames) {
          const number = Number(item?.[field]);
          if (Number.isFinite(number)) return sum + number;
        }
        return sum;
      }, 0);

    const collectionsTotal = total(data.Collections,
      ["amount", "paidAmount", "collectionAmount"]);
    const commissionTotal = total(data.Commission,
      ["amount", "commission", "commissionAmount"]);
    const expenseTotal = total(data.Expenses,
      ["amount", "expenseAmount"]);

    data.Reports = [{
      generatedAt: new Date().toISOString(),
      totalGroups: data.Groups.length,
      totalMembers: data.Members.length,
      totalInstallments: data.Installments.length,
      totalCollections: collectionsTotal,
      totalCommission: commissionTotal,
      totalExpenses: expenseTotal,
      balance: collectionsTotal - expenseTotal
    }];
  }

  return {
    action: "syncAll",
    data
  };
}

async function syncAllSheets() {
  if (!navigator.onLine) {
    localStorage.setItem("chitSheetsSyncPending", "true");
    console.warn("Offline: sync will retry when online.");
    return;
  }

  if (!GOOGLE_SHEETS_WEB_APP_URL.includes("/exec")) {
    console.error("Set the Apps Script Web App URL ending in /exec.");
    return;
  }

  if (syncInProgress) {
    localStorage.setItem("chitSheetsSyncPending", "true");
    return;
  }

  syncInProgress = true;

  try {
    const payload = buildSheetsPayload();

    // no-cors sends the request, but the browser cannot read its response.
    // Verify the result in the Google Sheet after the first test.
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    localStorage.setItem("chitSheetsLastAttempt", new Date().toISOString());
    localStorage.removeItem("chitSheetsSyncPending");
    console.log("Google Sheets sync request sent. Verify the spreadsheet.");
  } catch (error) {
    localStorage.setItem("chitSheetsSyncPending", "true");
    console.error("Google Sheets sync request failed:", error);
  } finally {
    syncInProgress = false;
  }
}

function scheduleGoogleSheetsSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncAllSheets, 1200);
}

// Watch writes made by the existing app without replacing its data.
(function watchLocalStorageWrites() {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  const watchedKeys = new Set(
    Object.values(STORAGE_KEYS).flat()
  );

  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);

    if (watchedKeys.has(String(key))) {
      scheduleGoogleSheetsSync();
    }
  };

  localStorage.removeItem = function (key) {
    originalRemoveItem(key);

    if (watchedKeys.has(String(key))) {
      scheduleGoogleSheetsSync();
    }
  };
})();

// Retry after internet returns.
window.addEventListener("online", () => {
  if (localStorage.getItem("chitSheetsSyncPending") === "true") {
    syncAllSheets();
  }
});

// Keep a manual sync function available to the page.
window.syncAllSheets = syncAllSheets;
window.scheduleGoogleSheetsSync = scheduleGoogleSheetsSync;
