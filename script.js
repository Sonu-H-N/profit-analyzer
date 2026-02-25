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
    createMonthlyChart();
    let data = JSON.parse(localStorage.getItem("financeData")) || [];

    let entry = {
        date: new Date().toLocaleDateString(),
        income,
        expense,
        profit
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