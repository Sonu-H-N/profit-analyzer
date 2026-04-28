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
    updateGoal()
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
<td>${item.category}</td>
<td>
<button onclick="editRow(${index})">✏</button>
<button onclick="deleteRow(${index})">❌</button>
</td>
</tr>
`

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
generateCalendar()
createMonthlyChart();
generateInsights()
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
    showNotification("⚠ Budget exceeded!")

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
function updateSummary() {

let data = JSON.parse(localStorage.getItem("financeData")) || []

let totalIncome = 0
let totalExpense = 0
let totalProfit = 0

data.forEach(item => {

totalIncome += item.income
totalExpense += item.expense
totalProfit += item.profit

})

let avgProfit = data.length ? totalProfit / data.length : 0

animateValue("totalIncome", 0, Math.round(totalIncome), 800)
animateValue("totalExpense", 0, Math.round(totalExpense), 800)
animateValue("totalProfit", 0, Math.round(totalProfit), 800)
animateValue("avgProfit", 0, Math.round(avgProfit), 800)

}
function generateInsights(){
    showNotification("💡 High spending on " + highestCategory)

let data = JSON.parse(localStorage.getItem("financeData")) || []

let categoryTotals = {}

data.forEach(item => {

if(!categoryTotals[item.category]){
categoryTotals[item.category] = 0
}

categoryTotals[item.category] += Number(item.expense)

})

let highestCategory = ""
let highestAmount = 0

for(let cat in categoryTotals){

if(categoryTotals[cat] > highestAmount){
highestAmount = categoryTotals[cat]
highestCategory = cat
}

}

let insightBox = document.getElementById("insightBox")

if(highestCategory){

insightBox.innerHTML = `
⚠ Highest spending category: <b>${highestCategory}</b><br>
💰 Amount spent: ₹${highestAmount}<br>
💡 Tip: Try reducing ${highestCategory} expenses to increase savings.
`

}

}
function exportExcel(){

let data = JSON.parse(localStorage.getItem("financeData")) || []

if(data.length === 0){
alert("No data available")
return
}

let worksheet = XLSX.utils.json_to_sheet(data)

let workbook = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(workbook, worksheet, "Finance Data")

XLSX.writeFile(workbook, "Finance_Report.xlsx")

}
function setGoal(){

let goal = document.getElementById("goalInput").value

localStorage.setItem("savingGoal", goal)

updateGoal()

}
function updateGoal(){

    if(percent >= 100){
showNotification("🎯 Goal achieved!")
}
let data = JSON.parse(localStorage.getItem("financeData")) || []

let totalProfit = 0

data.forEach(item => {

totalProfit += item.profit

})

let goal = localStorage.getItem("savingGoal")

if(!goal) return

let percent = (totalProfit / goal) * 100

percent = Math.min(percent,100)

document.getElementById("goalProgress").style.width = percent + "%"

document.getElementById("goalText").innerText =
"Progress: " + percent.toFixed(1) + "%"

}
function editRow(index){

let data = JSON.parse(localStorage.getItem("financeData")) || []

let item = data[index]

document.getElementById("income").value = item.income
document.getElementById("expense").value = item.expense
document.getElementById("category").value = item.category

deleteRow(index)

}
function generateCalendar(){

let data = JSON.parse(localStorage.getItem("financeData")) || []

let calendar = document.getElementById("calendar")

calendar.innerHTML = ""

let dailyTotals = {}

// Collect daily expenses
data.forEach(item => {

let date = item.date
let expense = Number(item.expense)

if(!dailyTotals[date]){
dailyTotals[date] = 0
}

dailyTotals[date] += expense

})

// Generate last 30 days
for(let i = 1; i <= 30; i++){

let dayBox = document.createElement("div")
dayBox.classList.add("day")

let dateKey = new Date()
dateKey.setDate(dateKey.getDate() - (30 - i))

let formatted = dateKey.toLocaleDateString()

let value = dailyTotals[formatted] || 0

dayBox.innerHTML = `
${dateKey.getDate()}<br>₹${value}
`

// Apply color levels
if(value > 3000){
dayBox.classList.add("high")
}
else if(value > 1000){
dayBox.classList.add("medium")
}
else if(value > 0){
dayBox.classList.add("low")
}

calendar.appendChild(dayBox)

}

}
generateCalendar()
toggleBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

});
// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

// Toggle + save
toggleBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        localStorage.setItem("theme", "light");
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

});