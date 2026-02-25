const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
};

let chart; // global chart variable

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

    }, 800);
}

function createChart(income, expense, profit) {

    const ctx = document.getElementById("profitChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Expense", "Profit"],
            datasets: [{
                label: "Financial Overview",
                data: [income, expense, profit],
                backgroundColor: [
                    "#4CAF50",
                    "#FF9800",
                    "#2196F3"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}