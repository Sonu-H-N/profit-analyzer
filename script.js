const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
};

let chart;

function calculate() {

    let income = parseFloat(document.getElementById("income").value);
    let expense = parseFloat(document.getElementById("expense").value);
    let resultDiv = document.getElementById("result");
    let loader = document.getElementById("loader");

    if (isNaN(income) || isNaN(expense)) {
        resultDiv.innerHTML = "⚠️ Enter valid numbers";
        return;
    }

    loader.style.display = "block";
    resultDiv.innerHTML = "";

    setTimeout(() => {

        loader.style.display = "none";

        let profit = income - expense;
        let percentage = (profit / expense) * 100;
        let average = expense / 30;

        resultDiv.className = "result " + (profit >= 0 ? "profit" : "loss");

        resultDiv.innerHTML = `
            <h3>${profit >= 0 ? "Profit ✅" : "Loss ❌"}</h3>
            <p>Amount: ₹${profit.toFixed(2)}</p>
            <p>Percentage: ${percentage.toFixed(2)}%</p>
            <p>Avg Daily Expense: ₹${average.toFixed(2)}</p>
        `;

        createChart(income, expense, profit);
        saveHistory(income, expense, profit);

    }, 800);
}

function createChart(income, expense, profit) {

    const ctx = document.getElementById("profitChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Expense", "Profit"],
            datasets: [{
                data: [income, expense, profit],
                backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
            }]
        },
        options: {
            plugins: { legend: { display: false } }
        }
    });
}
let monthlyChart;

function createMonthlyChart() {

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    let labels = [];
    let profits = [];

    data.forEach(item => {
        labels.push(item.date);
        profits.push(item.profit);
    });

    const ctx = document.getElementById("monthlyChart");

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Profit Trend",
                data: profits,
                borderColor: "#00e5ff",
                backgroundColor: "rgba(0,229,255,0.2)",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true
        }
    });
}

/* ================= HISTORY ================= */

function saveHistory(income, expense, profit) {
    updateSummary();
    createMonthlyChart();
    createCategoryChart();
    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    let category = document.getElementById("category").value;

let entry = {
    date: new Date().toLocaleDateString(),
    income,
    expense,
    profit,
    category
};

    data.push(entry);

    localStorage.setItem("financeData", JSON.stringify(data));

    loadHistory();
}

function loadHistory() {

    let tableBody = document.querySelector("#historyTable tbody");
    tableBody.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    data.forEach((item, index) => {

        let row = `
            <tr>
                <td>${item.date}</td>
                <td>₹${item.income}</td>
                <td>₹${item.expense}</td>
                <td>₹${item.profit}</td>
                <td><button onclick="deleteRow(${index})">X</button></td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });
}

function deleteRow(index) {

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    data.splice(index, 1);

    localStorage.setItem("financeData", JSON.stringify(data));

    loadHistory();
}

loadHistory();
createMonthlyChart();
function updateSummary() {

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    let totalIncome = 0;
    let totalExpense = 0;
    let totalProfit = 0;

    data.forEach(item => {
        totalIncome += item.income;
        totalExpense += item.expense;
        totalProfit += item.profit;
    });

    let avgProfit = data.length ? totalProfit / data.length : 0;

    document.getElementById("totalIncome").innerText = "₹" + totalIncome.toFixed(2);
    document.getElementById("totalExpense").innerText = "₹" + totalExpense.toFixed(2);
    document.getElementById("totalProfit").innerText = "₹" + totalProfit.toFixed(2);
    document.getElementById("avgProfit").innerText = "₹" + avgProfit.toFixed(2);
}
updateSummary();
async function downloadPDF() {

    const { jsPDF } = window.jspdf;

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    if (data.length === 0) {
        alert("No data available");
        return;
    }

    let doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Finance Report", 20, 20);

    doc.setFontSize(12);

    let y = 40;

    data.forEach((item, index) => {

        doc.text(
            `${index + 1}. Date: ${item.date} | Income: ₹${item.income} | Expense: ₹${item.expense} | Profit: ₹${item.profit}`,
            20,
            y
        );

        y += 10;

        if (y > 280) {
            doc.addPage();
            y = 20;
        }

    });

    doc.save("Finance_Report.pdf");
}
let categoryChart;

function createCategoryChart() {

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    let categoryTotals = {};

    data.forEach(item => {

        if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = 0;
        }

        categoryTotals[item.category] += Number(item.expense);

    });

    let labels = Object.keys(categoryTotals);
    let values = Object.values(categoryTotals);

    const ctx = document.getElementById("categoryChart");

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#ff6384",
                    "#36a2eb",
                    "#ffce56",
                    "#4caf50",
                    "#9c27b0"
                ]
            }]
        }
    });
}
createCategoryChart();
function checkBudget(expense) {

    let budget = parseFloat(document.getElementById("budget").value);
    let alertBox = document.getElementById("budgetAlert");

    if (isNaN(budget)) {
        alertBox.innerHTML = "";
        return;
    }

    localStorage.setItem("monthlyBudget", budget);

    if (expense > budget) {

        alertBox.className = "alert-box alert-danger";
        alertBox.innerHTML = "⚠️ Budget exceeded! Control your spending.";

    } else {

        alertBox.className = "alert-box alert-safe";
        alertBox.innerHTML = "✅ You are within budget.";

    }
}
let savedBudget = localStorage.getItem("monthlyBudget");

if (savedBudget) {
    document.getElementById("budget").value = savedBudget;
}
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}function filterHistory() {

    let searchText = document.getElementById("searchInput").value.toLowerCase();
    let category = document.getElementById("filterCategory").value;

    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    let tableBody = document.querySelector("#historyTable tbody");

    tableBody.innerHTML = "";

    data.forEach((item, index) => {

        let matchesSearch = item.category.toLowerCase().includes(searchText);
        let matchesCategory = category === "all" || item.category === category;

        if (matchesSearch && matchesCategory) {

            let row = `
            <tr>
                <td>${item.date}</td>
                <td>₹${item.income}</td>
                <td>₹${item.expense}</td>
                <td>₹${item.profit}</td>
                <td>${item.category}</td>
                <td><button onclick="deleteRow(${index})">X</button></td>
            </tr>
            `;

            tableBody.innerHTML += row;

        }

    });

}