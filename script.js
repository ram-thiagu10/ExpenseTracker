// Data Storage Keys
const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    CATEGORIES: 'categories',
    ITEM_CATEGORY_MAP: 'itemCategoryMap'
};

// Chart instances
let overviewChart = null;
let monthlyPieChart = null;
let monthlyBarChart = null;
let categoryDetailChart = null;

// Store current category modal state
let currentCategoryModal = { category: null, month: null, year: null };

// Category icons mapping
const categoryIcons = {
    'Protein': 'fa-drumstick-bite',
    'Vegetables': 'fa-carrot',
    'Fruits': 'fa-apple-alt',
    'Grains': 'fa-bread-slice',
    'Dairy': 'fa-cheese',
    'Snacks': 'fa-cookie',
    'Beverages': 'fa-glass',
    'Other': 'fa-ellipsis-h'
};

// Initialize default data if not exists
function initializeDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        const defaultCategories = [
            { id: 1, name: 'Protein' },
            { id: 2, name: 'Vegetables' },
            { id: 3, name: 'Fruits' },
            { id: 4, name: 'Grains' },
            { id: 5, name: 'Dairy' },
            { id: 6, name: 'Snacks' },
            { id: 7, name: 'Beverages' },
            { id: 8, name: 'Other' }
        ];
        saveCategories(defaultCategories);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ITEM_CATEGORY_MAP)) {
        const defaultItemMap = {
            'chicken': 'Protein',
            'egg': 'Protein',
            'fish': 'Protein',
            'beef': 'Protein',
            'pork': 'Protein',
            'turkey': 'Protein',
            'tofu': 'Protein',
            'broccoli': 'Vegetables',
            'carrot': 'Vegetables',
            'spinach': 'Vegetables',
            'tomato': 'Vegetables',
            'onion': 'Vegetables',
            'potato': 'Vegetables',
            'apple': 'Fruits',
            'banana': 'Fruits',
            'orange': 'Fruits',
            'grape': 'Fruits',
            'rice': 'Grains',
            'bread': 'Grains',
            'pasta': 'Grains',
            'wheat': 'Grains',
            'milk': 'Dairy',
            'cheese': 'Dairy',
            'yogurt': 'Dairy',
            'butter': 'Dairy'
        };
        saveItemCategoryMap(defaultItemMap);
    }

    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
        saveExpenses([]);
    }
}

// ==================== CORE DATA FUNCTIONS ====================

function getExpenses() {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
}

function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

function getCategories() {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
}

function saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

function getItemCategoryMap() {
    const data = localStorage.getItem(STORAGE_KEYS.ITEM_CATEGORY_MAP);
    return data ? JSON.parse(data) : {};
}

function saveItemCategoryMap(map) {
    localStorage.setItem(STORAGE_KEYS.ITEM_CATEGORY_MAP, JSON.stringify(map));
}

// ==================== EXPENSE FUNCTIONS ====================

function addExpense(date, amount, item) {
    const category = autoAssignCategory(item);
    const expenses = getExpenses();
    const newExpense = {
        id: Date.now(),
        date: date,
        amount: parseFloat(amount),
        item: item,
        category: category
    };
    expenses.push(newExpense);
    saveExpenses(expenses);
    return newExpense;
}

function getMonthlyExpenses(month, year) {
    const expenses = getExpenses();
    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });
}

function getCategorySummary(expenses) {
    const summary = {};
    expenses.forEach(expense => {
        if (!summary[expense.category]) {
            summary[expense.category] = {
                total: 0,
                count: 0,
                items: []
            };
        }
        summary[expense.category].total += expense.amount;
        summary[expense.category].count += 1;
        summary[expense.category].items.push(expense);
    });
    return summary;
}

function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return false;
    }
    const expenses = getExpenses();
    const filtered = expenses.filter(exp => exp.id !== id);
    saveExpenses(filtered);
    renderExpensesList(); // Refresh the list
    renderOverviewChart(); // Update overview chart
    
    // Refresh category modal if it's open
    const categoryModal = document.getElementById('categoryModal');
    if (categoryModal && categoryModal.classList.contains('show') && currentCategoryModal.category) {
        showCategoryDetails(currentCategoryModal.category, currentCategoryModal.month, currentCategoryModal.year);
    }
    
    // Refresh expense list modal if it's open
    const expenseListModal = document.getElementById('expenseListModal');
    if (expenseListModal && expenseListModal.classList.contains('show')) {
        renderExpensesList();
    }
    
    // Refresh monthly report modal if it's open
    const monthlyReportModal = document.getElementById('monthlyReportModal');
    if (monthlyReportModal && monthlyReportModal.classList.contains('show')) {
        const monthInput = document.getElementById('reportMonth').value;
        if (monthInput) {
            const [year, month] = monthInput.split('-').map(Number);
            renderMonthlyReport(month - 1, year);
        }
    }
    
    alert('Expense deleted successfully!');
    return true;
}

function editExpense(id, date, amount, item) {
    const category = autoAssignCategory(item);
    const expenses = getExpenses();
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
        expense.date = date;
        expense.amount = parseFloat(amount);
        expense.item = item;
        expense.category = category;
        saveExpenses(expenses);
        renderExpensesList(); // Refresh the list
        renderOverviewChart(); // Update overview chart
        
        // Refresh category modal if it's open
        const categoryModal = document.getElementById('categoryModal');
        if (categoryModal && categoryModal.classList.contains('show') && currentCategoryModal.category) {
            showCategoryDetails(currentCategoryModal.category, currentCategoryModal.month, currentCategoryModal.year);
        }
        
        // Refresh expense list modal if it's open
        const expenseListModal = document.getElementById('expenseListModal');
        if (expenseListModal && expenseListModal.classList.contains('show')) {
            renderExpensesList();
        }
        
        // Refresh monthly report modal if it's open
        const monthlyReportModal = document.getElementById('monthlyReportModal');
        if (monthlyReportModal && monthlyReportModal.classList.contains('show')) {
            const monthInput = document.getElementById('reportMonth').value;
            if (monthInput) {
                const [year, month] = monthInput.split('-').map(Number);
                renderMonthlyReport(month - 1, year);
            }
        }
        
        return true;
    }
    return false;
}

function openEditExpenseModal(id) {
    const expenses = getExpenses();
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    document.getElementById('editExpenseId').value = id;
    document.getElementById('editExpenseDate').value = expense.date;
    document.getElementById('editExpenseAmount').value = expense.amount;
    
    // Populate item dropdown
    const itemSelect = document.getElementById('editExpenseItem');
    const itemMap = getItemCategoryMap();
    const items = Object.keys(itemMap).sort();
    
    itemSelect.innerHTML = '<option value="">Select an item</option>';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
        if (item === expense.item) {
            option.selected = true;
        }
        itemSelect.appendChild(option);
    });
    
    // Set category
    document.getElementById('editExpenseCategory').value = expense.category;
    
    showModal('editExpenseModal');
}

function autoAssignCategory(item) {
    const itemMap = getItemCategoryMap();
    return itemMap[item.toLowerCase()] || 'Other';
}

// ==================== CATEGORY MANAGEMENT ====================

function addCategory(name) {
    if (!name || name.trim() === '') return false;
    const categories = getCategories();
    const newCategory = {
        id: Date.now(),
        name: name.trim()
    };
    categories.push(newCategory);
    saveCategories(categories);
    renderCategories();
    updateCategoryDropdowns();
    return true;
}

function editCategory(id, name) {
    if (!name || name.trim() === '') return false;
    const categories = getCategories();
    const category = categories.find(cat => cat.id === id);
    if (category) {
        const oldName = category.name;
        category.name = name.trim();
        saveCategories(categories);
        
        // Update item category map if category name changed
        const itemMap = getItemCategoryMap();
        for (let item in itemMap) {
            if (itemMap[item] === oldName) {
                itemMap[item] = name.trim();
            }
        }
        saveItemCategoryMap(itemMap);
        
        renderCategories();
        renderItems();
        updateCategoryDropdowns();
        updateItemDropdown();
        return true;
    }
    return false;
}

function deleteCategory(id) {
    const categories = getCategories();
    const category = categories.find(cat => cat.id === id);
    if (!category) return false;
    
    // Check if category is used in expenses
    const expenses = getExpenses();
    const hasExpenses = expenses.some(exp => exp.category === category.name);
    
    if (hasExpenses) {
        if (!confirm(`Category "${category.name}" is used in expenses. Delete anyway? Items will be moved to "Other" category.`)) {
            return false;
        }
        
        // Move expenses to "Other" category
        expenses.forEach(exp => {
            if (exp.category === category.name) {
                exp.category = 'Other';
            }
        });
        saveExpenses(expenses);
        
        // Update item map
        const itemMap = getItemCategoryMap();
        for (let item in itemMap) {
            if (itemMap[item] === category.name) {
                itemMap[item] = 'Other';
            }
        }
        saveItemCategoryMap(itemMap);
    }
    
    // Remove category
    const filtered = categories.filter(cat => cat.id !== id);
    saveCategories(filtered);
    // Refresh modals if they're open
    const categoryModal = document.getElementById('categoryManagementModal');
    if (categoryModal && categoryModal.classList.contains('show')) {
        renderCategories();
    }
    const mappingModal = document.getElementById('itemMappingModal');
    if (mappingModal && mappingModal.classList.contains('show')) {
        renderItems();
    }
    updateCategoryDropdowns();
    updateItemDropdown();
    return true;
}

function addItem(item, category) {
    if (!item || item.trim() === '' || !category) return false;
    const itemMap = getItemCategoryMap();
    itemMap[item.trim().toLowerCase()] = category;
    saveItemCategoryMap(itemMap);
    updateItemDropdown();
    renderItems();
    return true;
}

function updateItemCategory(item, category) {
    const itemMap = getItemCategoryMap();
    itemMap[item.toLowerCase()] = category;
    saveItemCategoryMap(itemMap);
    renderItems();
    updateItemDropdown(); // Update expense form dropdown
}

function removeItem(item) {
    const itemMap = getItemCategoryMap();
    delete itemMap[item.toLowerCase()];
    saveItemCategoryMap(itemMap);
    updateItemDropdown();
    // Refresh items list in modal if it's open
    const mappingModal = document.getElementById('itemMappingModal');
    if (mappingModal && mappingModal.classList.contains('show')) {
        renderItems();
    }
}

// ==================== UI FUNCTIONS ====================

function updateItemDropdown() {
    const itemSelect = document.getElementById('expenseItem');
    const itemMap = getItemCategoryMap();
    const items = Object.keys(itemMap).sort();
    
    itemSelect.innerHTML = '<option value="">Select an item</option>';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
        itemSelect.appendChild(option);
    });
}

function updateCategoryDropdowns() {
    const categories = getCategories();
    const newItemCategorySelect = document.getElementById('newItemCategory');
    
    newItemCategorySelect.innerHTML = '<option value="">Select category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        newItemCategorySelect.appendChild(option);
    });
}

function renderCategories() {
    const categoriesList = document.getElementById('categoriesList');
    const categories = getCategories();
    
    if (categories.length === 0) {
        categoriesList.innerHTML = '<div class="no-data">No categories yet. Add one to get started!</div>';
        return;
    }
    
    categoriesList.innerHTML = categories.map(cat => {
        const icon = categoryIcons[cat.name] || 'fa-tag';
        return `
        <div class="category-item">
            <span><i class="fas ${icon}"></i> ${cat.name}</span>
            <div>
                <button class="btn btn-edit" onclick="openEditCategoryModal(${cat.id}, '${cat.name}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger" onclick="deleteCategory(${cat.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

function renderExpensesList() {
    const expensesList = document.getElementById('expensesList');
    const monthInput = document.getElementById('expenseListMonth').value;
    
    let expenses = getExpenses();
    
    // Filter by month if selected
    if (monthInput) {
        const [year, month] = monthInput.split('-').map(Number);
        expenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === month - 1 && expenseDate.getFullYear() === year;
        });
    }
    
    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<div class="no-data">No expenses found. Add some expenses to get started!</div>';
        return;
    }
    
    expensesList.innerHTML = expenses.map(expense => {
        const date = new Date(expense.date);
        const icon = categoryIcons[expense.category] || 'fa-tag';
        return `
            <div class="expense-list-item">
                <div class="expense-list-item-info">
                    <div class="expense-list-item-date">
                        <i class="fas fa-calendar-alt"></i> ${date.toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}
                    </div>
                    <div class="expense-list-item-name">
                        <i class="fas fa-shopping-bag"></i> ${expense.item.charAt(0).toUpperCase() + expense.item.slice(1)}
                    </div>
                    <div class="expense-list-item-category">
                        <i class="fas ${icon}"></i> ${expense.category}
                    </div>
                </div>
                <div class="expense-list-item-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-list-item-actions">
                    <button class="btn btn-edit" onclick="openEditExpenseModal(${expense.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderItems() {
    const itemsList = document.getElementById('itemsList');
    const itemMap = getItemCategoryMap();
    const categories = getCategories();
    const categoryNames = categories.map(cat => cat.name);
    
    if (Object.keys(itemMap).length === 0) {
        itemsList.innerHTML = '<div class="no-data">No items yet. Add one to get started!</div>';
        return;
    }
    
    itemsList.innerHTML = Object.keys(itemMap).sort().map(item => {
        const currentCategory = itemMap[item];
        const categoryIcon = categoryIcons[currentCategory] || 'fa-tag';
        return `
            <div class="item-item">
                <span><i class="fas ${categoryIcon}"></i> ${item.charAt(0).toUpperCase() + item.slice(1)}</span>
                <div>
                    <select onchange="updateItemCategory('${item}', this.value)" class="item-category-select">
                        ${categoryNames.map(cat => 
                            `<option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${cat}</option>`
                        ).join('')}
                    </select>
                    <button class="btn btn-danger" onclick="removeItem('${item}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Chart color palette - Dark theme with yellow accents
const chartColors = [
    '#ffc107', '#ff9800', '#ffd54f', '#ffa726', '#ffb74d',
    '#ffcc02', '#ffeb3b', '#fff176', '#ffca28', '#ffd740',
    '#ffc400', '#ffab00', '#ff6f00', '#ff8f00', '#ffa000'
];

function renderMonthlyReport(month, year) {
    const reportSummary = document.getElementById('reportSummary');
    const expenses = getMonthlyExpenses(month, year);
    const summary = getCategorySummary(expenses);
    
    if (Object.keys(summary).length === 0) {
        reportSummary.innerHTML = '<div class="no-data">No expenses found for this month.</div>';
        // Clear charts
        if (monthlyPieChart) monthlyPieChart.destroy();
        if (monthlyBarChart) monthlyBarChart.destroy();
        monthlyPieChart = null;
        monthlyBarChart = null;
        return;
    }
    
    // Render category cards with icons
    const categories = Object.keys(summary).sort();
    reportSummary.innerHTML = categories.map((category, index) => {
        const data = summary[category];
        const icon = categoryIcons[category] || 'fa-tag';
        return `
            <div class="category-card" onclick="showCategoryDetails('${category}', ${month}, ${year})">
                <h3><i class="fas ${icon}"></i> ${category}</h3>
                <div class="amount">₹${data.total.toFixed(2)}</div>
                <div class="count">${data.count} ${data.count === 1 ? 'expense' : 'expenses'}</div>
            </div>
        `;
    }).join('');
    
    // Render Pie Chart
    renderMonthlyPieChart(summary);
    
    // Render Bar Chart
    renderMonthlyBarChart(summary);
}

function renderMonthlyPieChart(summary) {
    const ctx = document.getElementById('monthlyPieChart');
    if (!ctx) return;
    
    const categories = Object.keys(summary).sort();
    const data = categories.map(cat => summary[cat].total);
    const colors = categories.map((_, i) => chartColors[i % chartColors.length]);
    
    if (monthlyPieChart) {
        monthlyPieChart.destroy();
    }
    
    monthlyPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#1a1a1a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        color: '#e0e0e0'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderMonthlyBarChart(summary) {
    const ctx = document.getElementById('monthlyBarChart');
    if (!ctx) return;
    
    const categories = Object.keys(summary).sort();
    const data = categories.map(cat => summary[cat].total);
    const colors = categories.map((_, i) => chartColors[i % chartColors.length]);
    
    if (monthlyBarChart) {
        monthlyBarChart.destroy();
    }
    
    monthlyBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Amount (₹)',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c + 'dd'),
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `₹${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(0);
                        },
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function showCategoryDetails(category, month, year) {
    // Store current modal state
    currentCategoryModal = { category, month, year };
    
    const expenses = getMonthlyExpenses(month, year);
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    
    if (categoryExpenses.length === 0) {
        alert('No expenses found in this category for this month.');
        return;
    }
    
    // Group by item
    const itemSummary = {};
    categoryExpenses.forEach(exp => {
        if (!itemSummary[exp.item]) {
            itemSummary[exp.item] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }
        itemSummary[exp.item].total += exp.amount;
        itemSummary[exp.item].count += 1;
        itemSummary[exp.item].expenses.push(exp);
    });
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('categoryModal');
    const icon = categoryIcons[category] || 'fa-tag';
    
    modalTitle.innerHTML = `<i class="fas ${icon}"></i> ${category} - ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    
    // Render chart for category details
    renderCategoryDetailChart(itemSummary);
    
    modalBody.innerHTML = Object.keys(itemSummary).sort().map(item => {
        const data = itemSummary[item];
        const itemExpenses = data.expenses.map(exp => `
            <div class="expense-item">
                <div class="item-info">
                    <div class="item-name">${item.charAt(0).toUpperCase() + item.slice(1)}</div>
                    <div class="item-date">${new Date(exp.date).toLocaleDateString()}</div>
                </div>
                <div class="item-amount">₹${exp.amount.toFixed(2)}</div>
                <div class="expense-item-actions" style="display: flex; gap: 8px; margin-left: 10px;">
                    <button class="btn btn-edit" onclick="openEditExpenseModal(${exp.id}); hideModal('categoryModal');" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteExpense(${exp.id})" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        return `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffc107; margin-bottom: 10px;">
                    ${item.charAt(0).toUpperCase() + item.slice(1)} 
                    <span style="color: #ff9800; font-size: 0.9em;">(${data.count} ${data.count === 1 ? 'entry' : 'entries'})</span>
                </h4>
                <div style="margin-bottom: 10px; font-weight: bold; color: #e0e0e0;">
                    Total: ₹${data.total.toFixed(2)}
                </div>
                ${itemExpenses}
            </div>
        `;
    }).join('');
    
    modal.classList.add('show');
}

function renderCategoryDetailChart(itemSummary) {
    const ctx = document.getElementById('categoryDetailChart');
    if (!ctx) return;
    
    const items = Object.keys(itemSummary).sort();
    const data = items.map(item => itemSummary[item].total);
    const colors = items.map((_, i) => chartColors[i % chartColors.length]);
    
    if (categoryDetailChart) {
        categoryDetailChart.destroy();
    }
    
    categoryDetailChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: items.map(item => item.charAt(0).toUpperCase() + item.slice(1)),
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#1a1a1a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderOverviewChart() {
    const ctx = document.getElementById('overviewChart');
    if (!ctx) return;
    
    const expenses = getExpenses();
    if (expenses.length === 0) {
        if (overviewChart) {
            overviewChart.destroy();
            overviewChart = null;
        }
        return;
    }
    
    // Get last 6 months of data
    const today = new Date();
    const monthsData = [];
    const monthLabels = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthExpenses = getMonthlyExpenses(date.getMonth(), date.getFullYear());
        const summary = getCategorySummary(monthExpenses);
        const total = Object.values(summary).reduce((sum, cat) => sum + cat.total, 0);
        
        monthsData.push(total);
        monthLabels.push(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    
    if (overviewChart) {
        overviewChart.destroy();
    }
    
    overviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Total Expenses (₹)',
                data: monthsData,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#ffc107',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        color: '#e0e0e0'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `₹${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(0);
                        },
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#e0e0e0'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function openEditCategoryModal(id, name) {
    document.getElementById('editCategoryId').value = id;
    document.getElementById('editCategoryName').value = name;
    showModal('editCategoryModal');
}

// ==================== EVENT LISTENERS ====================

function initializeApp() {
    initializeDefaultData();
    
    // Set today's date as default
    const today = new Date();
    document.getElementById('expenseDate').valueAsDate = today;
    
    // Set current month as default for report
    const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('reportMonth').value = currentMonth;
    
    updateItemDropdown();
    updateCategoryDropdowns();
    renderOverviewChart(); // Render overview chart on load
    
    // Open Category Management Modal
    document.getElementById('openCategoryManagementBtn').addEventListener('click', () => {
        renderCategories();
        showModal('categoryManagementModal');
    });
    
    // Open Item Mapping Modal
    document.getElementById('openItemMappingBtn').addEventListener('click', () => {
        updateCategoryDropdowns(); // Refresh category dropdown
        renderItems();
        showModal('itemMappingModal');
    });
    
    // Open Expense List Modal
    document.getElementById('openExpenseListBtn').addEventListener('click', () => {
        renderExpensesList(); // Render expenses when modal opens
        showModal('expenseListModal');
    });
    
    // Open Monthly Report Modal
    document.getElementById('openMonthlyReportBtn').addEventListener('click', () => {
        // Set current month as default
        const today = new Date();
        const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
        document.getElementById('reportMonth').value = currentMonth;
        // Generate report for current month
        const [year, month] = currentMonth.split('-').map(Number);
        renderMonthlyReport(month - 1, year);
        showModal('monthlyReportModal');
    });
    
    // Close Expense List Modal
    document.getElementById('closeExpenseListModalBtn').addEventListener('click', () => {
        hideModal('expenseListModal');
    });
    
    // Close Monthly Report Modal
    document.getElementById('closeMonthlyReportModalBtn').addEventListener('click', () => {
        hideModal('monthlyReportModal');
    });
    
    // Close Category Management Modal
    document.getElementById('closeCategoryModalBtn').addEventListener('click', () => {
        hideModal('categoryManagementModal');
    });
    
    // Close Item Mapping Modal
    document.getElementById('closeMappingModalBtn').addEventListener('click', () => {
        hideModal('itemMappingModal');
    });
    
    // Save Categories (confirmation)
    document.getElementById('saveCategoriesBtn').addEventListener('click', () => {
        alert('All category changes have been saved!');
        updateCategoryDropdowns();
        updateItemDropdown();
        hideModal('categoryManagementModal');
    });
    
    // Save Mappings (confirmation)
    document.getElementById('saveMappingsBtn').addEventListener('click', () => {
        alert('All mapping changes have been saved!');
        updateItemDropdown();
        hideModal('itemMappingModal');
    });
    
    // Load Expenses button
    document.getElementById('loadExpensesBtn').addEventListener('click', () => {
        renderExpensesList();
    });
    
    // Auto-load expenses when month filter changes in modal
    document.getElementById('expenseListMonth').addEventListener('change', () => {
        renderExpensesList();
    });
    
    // Edit Expense form submission
    document.getElementById('editExpenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('editExpenseId').value);
        const date = document.getElementById('editExpenseDate').value;
        const amount = document.getElementById('editExpenseAmount').value;
        const item = document.getElementById('editExpenseItem').value;
        
        if (!date || !amount || !item) {
            alert('Please fill in all fields.');
            return;
        }
        
        if (editExpense(id, date, amount, item)) {
            hideModal('editExpenseModal');
            alert('Expense updated successfully!');
        } else {
            alert('Failed to update expense.');
        }
    });
    
    // Cancel Edit Expense button
    document.getElementById('cancelEditExpenseBtn').addEventListener('click', () => {
        hideModal('editExpenseModal');
    });
    
    // Item selection in edit expense form - auto assign category
    document.getElementById('editExpenseItem').addEventListener('change', (e) => {
        const item = e.target.value;
        if (item) {
            const category = autoAssignCategory(item);
            document.getElementById('editExpenseCategory').value = category;
        } else {
            document.getElementById('editExpenseCategory').value = '';
        }
    });
    
    // Expense form submission
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('expenseDate').value;
        const amount = document.getElementById('expenseAmount').value;
        const item = document.getElementById('expenseItem').value;
        
        if (!date || !amount || !item) {
            alert('Please fill in all fields.');
            return;
        }
        
        addExpense(date, amount, item);
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        document.getElementById('expenseCategory').value = '';
        renderOverviewChart(); // Update overview chart
        // Refresh expense list modal if it's open
        const expenseListModal = document.getElementById('expenseListModal');
        if (expenseListModal && expenseListModal.classList.contains('show')) {
            renderExpensesList();
        }
        // Refresh monthly report modal if it's open
        const monthlyReportModal = document.getElementById('monthlyReportModal');
        if (monthlyReportModal && monthlyReportModal.classList.contains('show')) {
            const monthInput = document.getElementById('reportMonth').value;
            if (monthInput) {
                const [year, month] = monthInput.split('-').map(Number);
                renderMonthlyReport(month - 1, year);
            }
        }
        alert('Expense added successfully!');
    });
    
    // Item selection - auto assign category
    document.getElementById('expenseItem').addEventListener('change', (e) => {
        const item = e.target.value;
        if (item) {
            const category = autoAssignCategory(item);
            document.getElementById('expenseCategory').value = category;
        } else {
            document.getElementById('expenseCategory').value = '';
        }
    });
    
    // Generate report button
    document.getElementById('generateReport').addEventListener('click', () => {
        const monthInput = document.getElementById('reportMonth').value;
        if (!monthInput) {
            alert('Please select a month.');
            return;
        }
        const [year, month] = monthInput.split('-').map(Number);
        renderMonthlyReport(month - 1, year); // month is 0-indexed in JS
    });
    
    // Add category button
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        const name = document.getElementById('newCategoryName').value;
        if (addCategory(name)) {
            document.getElementById('newCategoryName').value = '';
            renderCategories(); // Refresh the list
            updateCategoryDropdowns(); // Update dropdowns
            alert('Category added successfully!');
        } else {
            alert('Please enter a category name.');
        }
    });
    
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', () => {
        const item = document.getElementById('newItemName').value;
        const category = document.getElementById('newItemCategory').value;
        if (addItem(item, category)) {
            document.getElementById('newItemName').value = '';
            document.getElementById('newItemCategory').value = '';
            renderItems(); // Refresh the list
            updateItemDropdown(); // Update expense form dropdown
            alert('Item added successfully!');
        } else {
            alert('Please enter an item name and select a category.');
        }
    });
    
    // Save category edit button
    document.getElementById('saveCategoryBtn').addEventListener('click', () => {
        const id = parseInt(document.getElementById('editCategoryId').value);
        const name = document.getElementById('editCategoryName').value;
        if (editCategory(id, name)) {
            // Refresh categories in category management modal if it's open
            const categoryModal = document.getElementById('categoryManagementModal');
            if (categoryModal.classList.contains('show')) {
                renderCategories();
            }
            hideModal('editCategoryModal');
            alert('Category updated successfully!');
        } else {
            alert('Please enter a category name.');
        }
    });
    
    // Close modals when clicking X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Make functions available globally for onclick handlers
window.deleteCategory = deleteCategory;
window.updateItemCategory = updateItemCategory;
window.removeItem = removeItem;
window.showCategoryDetails = showCategoryDetails;
window.openEditCategoryModal = openEditCategoryModal;
window.deleteExpense = deleteExpense;
window.openEditExpenseModal = openEditExpenseModal;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

