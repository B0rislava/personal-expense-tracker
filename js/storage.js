let db;
const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('transactions')) {
                const store = db.createObjectStore('transactions', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

async function addTransaction(transaction) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.add(transaction);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateTransaction(id, transaction) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.put({ ...transaction, id });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function deleteTransaction(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getAllTransactions() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['transactions'], 'readonly');
        const store = tx.objectStore('transactions');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function clearAllTransactions() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function getSettings() {
    const defaults = {
        currency: '$',
        defaultPeriod: 'month',
        theme: 'light',
        expenseCategories: ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Other'],
        incomeCategories: ['Salary', 'Bonus', 'Freelance', 'Investments', 'Other'],
        categoryColors: {}
    };

    const saved = localStorage.getItem('settings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
}

function saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

const CURRENCY_RATES = {
    '$': 1.00,
    '€': 0.92,
    '£': 0.79,
    '¥': 149.50,
};

function convertCurrency(amount, fromCurrency, toCurrency) {
    const usdAmount = amount / CURRENCY_RATES[fromCurrency];
    return usdAmount * CURRENCY_RATES[toCurrency];
}

async function convertAllTransactionsCurrency(oldCurrency, newCurrency) {
    if (oldCurrency === newCurrency) return;

    const transactions = await getAllTransactions();

    for (const transaction of transactions) {
        const convertedAmount = convertCurrency(transaction.amount, oldCurrency, newCurrency);
        await updateTransaction(transaction.id, {
            ...transaction,
            amount: Math.round(convertedAmount * 100) / 100
        });
    }
}

function getSessionFilters() {
    const saved = sessionStorage.getItem('filters');
    return saved ? JSON.parse(saved) : { period: 'month', type: 'all', category: 'all' };
}

function saveSessionFilters(filters) {
    sessionStorage.setItem('filters', JSON.stringify(filters));
}

function setLastVisit() {
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    document.cookie = `lastVisit=${new Date().toISOString()}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
}

function getLastVisit() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'lastVisit') {
            return value;
        }
    }
    return null;
}

async function processRecurringTransactions() {
    const transactions = await getAllTransactions();
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    const recurring = transactions.filter(t => t.recurring);

    for (const template of recurring) {
        const transactionMonth = template.date.substring(0, 7);

        if (transactionMonth !== currentMonth) {
            const day = template.date.substring(8, 10);
            const newDate = `${currentMonth}-${day}`;

            const exists = transactions.some(t =>
                t.category === template.category &&
                t.amount === template.amount &&
                t.date === newDate &&
                t.type === template.type
            );

            if (!exists && new Date(newDate) <= now) {
                await addTransaction({
                    type: template.type,
                    amount: template.amount,
                    category: template.category,
                    date: newDate,
                    description: template.description,
                    recurring: false
                });
            }
        }
    }
}