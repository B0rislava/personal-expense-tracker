const state = {
    transactions: [],
    filters: getSessionFilters(),
    settings: getSettings(),
    editingId: null
};

function updateStats() {
    const filtered = getFilteredTransactions();

    const income = filtered
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;
    const currency = state.settings.currency;

    document.getElementById('balance').textContent = `${currency}${balance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `${currency}${income.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `${currency}${expense.toFixed(2)}`;
}

function getFilteredTransactions() {
    let filtered = [...state.transactions];

    if (state.filters.type !== 'all') {
        filtered = filtered.filter(t => t.type === state.filters.type);
    }

    if (state.filters.category !== 'all') {
        filtered = filtered.filter(t => t.category === state.filters.category);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (state.filters.period === 'today') {
        filtered = filtered.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= today;
        });
    } else if (state.filters.period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
    } else if (state.filters.period === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(t => new Date(t.date) >= monthStart);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTransactions() {
    const container = document.getElementById('transactionsList');
    const filtered = getFilteredTransactions();

    container.setAttribute('aria-busy', 'true');

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                <p>No transactions for the selected filter.</p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(t => {
            const categoryColor = state.settings.categoryColors[t.category] || '';
            const colorStyle = categoryColor ? `border-left-color: ${categoryColor};` : '';

            return `
                <article class="transaction ${t.type}" data-id="${t.id}" tabindex="0" style="${colorStyle}">
                    <div class="transaction-icon" aria-hidden="true">
                        ${t.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-category">
                            ${t.category}
                            ${t.recurring ? '<span class="recurring-badge"> Recurring</span>' : ''}
                        </div>
                        ${t.description ? `<div class="transaction-description">${t.description}</div>` : ''}
                        <time class="transaction-date" datetime="${t.date}">
                            ${new Date(t.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}
                        </time>
                    </div>
                    <div class="transaction-amount">
                        ${t.type === 'income' ? '+' : '-'}${state.settings.currency}${t.amount.toFixed(2)}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-icon edit" data-id="${t.id}" aria-label="Edit transaction ${t.category}">
                            ✎
                        </button>
                        <button class="btn-icon delete" data-id="${t.id}" aria-label="Delete transaction ${t.category}">
                            ×
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    container.setAttribute('aria-busy', 'false');

    document.getElementById('transactionCount').textContent =
        `${filtered.length} ${filtered.length === 1 ? 'transaction' : 'transactions'}`;

    updateStats();
    renderChart();
}

function updateCategoryFilter() {
    const select = document.getElementById('filterCategory');
    const currentValue = select.value;

    const categories = new Set();
    state.transactions.forEach(t => categories.add(t.category));

    select.innerHTML = '<option value="all">All</option>' +
        Array.from(categories).sort().map(c =>
            `<option value="${c}">${c}</option>`
        ).join('');

    select.value = categories.has(currentValue) ? currentValue : 'all';
}

function updateCategorySelect() {
    const type = document.getElementById('transactionType').value;
    const select = document.getElementById('transactionCategory');
    const categories = type === 'expense'
        ? state.settings.expenseCategories
        : state.settings.incomeCategories;

    select.innerHTML = categories.map(c =>
        `<option value="${c}">${c}</option>`
    ).join('');
}