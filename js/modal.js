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
    } else {
        title.textContent = 'Add Transaction';
        form.reset();
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
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

    document.getElementById('settingsModal').classList.add('active');
    document.getElementById('settingsCurrency').focus();
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}