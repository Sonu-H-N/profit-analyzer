function calculate() {

    let income = parseFloat(document.getElementById("income").value);
    let expense = parseFloat(document.getElementById("expense").value);
    let resultDiv = document.getElementById("result");

    if (isNaN(income) || isNaN(expense)) {
        resultDiv.innerHTML = "⚠️ Please enter valid numbers";
        return;
    }

    let profit = income - expense;
    let percentage = (profit / expense) * 100;
    let average = expense / 30;

    let previousExpense = localStorage.getItem("lastExpense");
    let comparison = "";

    if (previousExpense !== null) {
        let diff = expense - previousExpense;
        comparison = diff > 0 
            ? `📈 Expenses increased by ₹${diff.toFixed(2)}`
            : `📉 Expenses decreased by ₹${Math.abs(diff).toFixed(2)}`;
    }

    localStorage.setItem("lastExpense", expense);

    let status = profit >= 0 ? "✅ Profit" : "❌ Loss";

    resultDiv.innerHTML = `
        <h3>${status}</h3>
        <p>Amount: ₹${profit.toFixed(2)}</p>
        <p>Percentage: ${percentage.toFixed(2)}%</p>
        <p>Avg Daily Expense: ₹${average.toFixed(2)}</p>
        <p>${comparison}</p>
    `;
}