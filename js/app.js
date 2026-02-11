async function init() {
    try {
        await initDB();

        state.transactions = await getAllTransactions();

        document.getElementById('filterPeriod').value = state.filters.period;
        document.getElementById('filterType').value = state.filters.type;
        document.getElementById('filterCategory').value = state.filters.category;

        setupEventListeners();

        updateCategoryFilter();
        renderTransactions();

        const lastVisit = getLastVisit();
        if (lastVisit) {
            console.log('Last visit:', new Date(lastVisit).toLocaleString('en-US'));
        }
        setLastVisit();

        console.log('Application initialized successfully');

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Error loading application. Please refresh the page.');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init().catch(error => {
        console.error('Fatal initialization error:', error);
        alert('Failed to initialize application. Please refresh the page.');
    });
}