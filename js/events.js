function setupEventListeners() {

    document.getElementById('addTransactionBtn').addEventListener('click', () => openModal());
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettings);

    document.getElementById('transactionType').addEventListener('change', updateCategorySelect);

    document.getElementById('transactionForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const transaction = {
            type: document.getElementById('transactionType').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            category: document.getElementById('transactionCategory').value,
            date: document.getElementById('transactionDate').value,
            description: document.getElementById('transactionDescription').value
        };

        try {
            if (state.editingId) {
                await updateTransaction(state.editingId, transaction);
            } else {
                await addTransaction(transaction);
            }

            state.transactions = await getAllTransactions();
            updateCategoryFilter();
            renderTransactions();
            closeModal();
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction');
        }
    });

    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const newSettings = {
            currency: document.getElementById('settingsCurrency').value,
            defaultPeriod: document.getElementById('settingsDefaultPeriod').value,
            expenseCategories: document.getElementById('expenseCategories').value
                .split('\n')
                .map(c => c.trim())
                .filter(c => c),
            incomeCategories: document.getElementById('incomeCategories').value
                .split('\n')
                .map(c => c.trim())
                .filter(c => c)
        };

        state.settings = newSettings;
        saveSettings(newSettings);

        renderTransactions();
        closeSettings();
    });

    document.getElementById('transactionsList').addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit');
        const deleteBtn = e.target.closest('.delete');

        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            openModal(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (confirm('Are you sure you want to delete this transaction?')) {
                try {
                    await deleteTransaction(id);
                    state.transactions = await getAllTransactions();
                    updateCategoryFilter();
                    renderTransactions();
                } catch (error) {
                    console.error('Error deleting transaction:', error);
                    alert('Error deleting transaction');
                }
            }
        }
    });

    document.getElementById('filterForm').addEventListener('change', () => {
        state.filters = {
            period: document.getElementById('filterPeriod').value,
            type: document.getElementById('filterType').value,
            category: document.getElementById('filterCategory').value
        };

        saveSessionFilters(state.filters);
        renderTransactions();
    });

    document.getElementById('exportBtn').addEventListener('click', async () => {
        const data = await getAllTransactions();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!Array.isArray(data)) {
                alert('Invalid data format. Expected an array of transactions.');
                e.target.value = '';
                return;
            }

            await clearAllTransactions();

            for (const item of data) {
                if ('id' in item) {
                    delete item.id;
                }
                await addTransaction(item);
            }

            state.transactions = await getAllTransactions();
            updateCategoryFilter();
            renderTransactions();

            alert(`Successfully imported ${data.length} transactions`);
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data. Please ensure the file is a valid JSON.');
        }

        e.target.value = '';
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('transactionModal').classList.contains('active')) {
                closeModal();
            } else if (document.getElementById('settingsModal').classList.contains('active')) {
                closeSettings();
            }
        }
    });
}