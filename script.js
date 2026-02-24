const toggleBtn = document.getElementById("themeToggle");

toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
};

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

        let status = profit >= 0 ? "Profit" : "Loss";

        resultDiv.className = "result " + (profit >= 0 ? "profit" : "loss");

        resultDiv.innerHTML = `
            <h3>${status}</h3>
            <p>Amount: ₹${profit.toFixed(2)}</p>
            <p>Percentage: ${percentage.toFixed(2)}%</p>
            <p>Avg Daily Expense: ₹${average.toFixed(2)}</p>
        `;

    }, 800);
}