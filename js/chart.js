function renderChart() {
    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    const filtered = getFilteredTransactions().filter(t => t.type === 'expense');

    const categoryTotals = {};
    filtered.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categories = Object.keys(categoryTotals);
    if (categories.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
        document.getElementById('chartLegend').innerHTML = '';
        return;
    }

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const defaultColors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16',
        '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
        '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
    ];

    const colors = categories.map((category, i) =>
        state.settings.categoryColors[category] || defaultColors[i % defaultColors.length]
    );

    canvas.width = 300;
    canvas.height = 300;

    let currentAngle = -Math.PI / 2;
    categories.forEach((category, i) => {
        const slice = (categoryTotals[category] / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.fillStyle = colors[i];
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(
            canvas.width / 2,
            canvas.height / 2,
            Math.min(canvas.width, canvas.height) / 2 - 10,
            currentAngle,
            currentAngle + slice
        );
        ctx.closePath();
        ctx.fill();

        currentAngle += slice;
    });

    const legend = document.getElementById('chartLegend');
    legend.innerHTML = categories.map((category, i) => {
        const percentage = ((categoryTotals[category] / total) * 100).toFixed(1);
        return `
            <div class="legend-item" role="listitem">
                <span class="legend-color" style="background: ${colors[i]}" aria-hidden="true"></span>
                <span>${category}: ${percentage}%</span>
            </div>
        `;
    }).join('');
}