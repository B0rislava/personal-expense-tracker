function openModal(editId = null) {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const title = document.getElementById('modalTitle');

    state.editingId = editId;

    if (editId) {
        title.textContent = 'Edit Transaction';
        const transaction = state.transactions.find(t => t.id === editId);

        document.getElementById('editId').value = editId;
        document.getElementById('transactionType').value = transaction.type;
        updateCategorySelect();
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionDescription').value = transaction.description || '';
        document.getElementById('transactionRecurring').checked = transaction.recurring || false;
    } else {
        title.textContent = 'Add Transaction';
        form.reset();
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('transactionRecurring').checked = false;
        updateCategorySelect();
    }

    modal.classList.add('active');
    document.getElementById('transactionType').focus();
}

function closeModal() {
    document.getElementById('transactionModal').classList.remove('active');
    document.getElementById('transactionForm').reset();
    state.editingId = null;
}

function openSettings() {
    document.getElementById('settingsCurrency').value = state.settings.currency;
    document.getElementById('settingsDefaultPeriod').value = state.settings.defaultPeriod;
    document.getElementById('expenseCategories').value = state.settings.expenseCategories.join('\n');
    document.getElementById('incomeCategories').value = state.settings.incomeCategories.join('\n');

    renderCategoryColors();

    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('settingsCurrency').focus();
}

function renderCategoryColors() {
    const container = document.getElementById('categoryColorList');
    const allCategories = [
        ...state.settings.expenseCategories,
        ...state.settings.incomeCategories
    ];

    container.innerHTML = allCategories.map(category => {
        const color = state.settings.categoryColors[category] || '#3b82f6';
        return `
            <div class="category-color-item">
                <span>${category}</span>
                <input type="color" value="${color}" data-category="${category}" class="category-color-picker">
                <button class="btn-icon" data-category="${category}" data-action="reset-color" aria-label="Reset color">↺</button>
            </div>
        `;
    }).join('');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}