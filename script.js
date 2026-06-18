// ============================================================
//  FinPro – Personal Finance Dashboard
//  Complete clean script – all features unified
// ============================================================

'use strict';

// ─── STATE ───────────────────────────────────────────────────
let currentType   = 'expense';
let recType       = 'income';
let sortKey       = 'date';
let sortDir       = -1;
let calYear, calMonth;
let dashChartInst, catChartInst, monthlyChartInst, incExpBarInst,
    savingsRateInst, emiChartInst, taxChartInst, sipChartInst;

const _now = new Date();
calYear  = _now.getFullYear();
calMonth = _now.getMonth();

// ─── STORAGE ─────────────────────────────────────────────────
const getData     = () => JSON.parse(localStorage.getItem('fp_data'))     || [];
const getBudgets  = () => JSON.parse(localStorage.getItem('fp_budgets'))  || {};
const getGoals    = () => JSON.parse(localStorage.getItem('fp_goals'))    || [];
const getRecurring= () => JSON.parse(localStorage.getItem('fp_recurring'))|| [];
const getSettings = () => JSON.parse(localStorage.getItem('fp_settings')) || {};

const setData     = d => localStorage.setItem('fp_data',      JSON.stringify(d));
const setBudgets  = b => localStorage.setItem('fp_budgets',   JSON.stringify(b));
const setGoals    = g => localStorage.setItem('fp_goals',     JSON.stringify(g));
const setRecurring= r => localStorage.setItem('fp_recurring', JSON.stringify(r));
const setSettings = s => localStorage.setItem('fp_settings',  JSON.stringify(s));

const currency = () => getSettings().currencySymbol || '₹';
const fmt = n => {
  const sym = currency();
  const abs = Math.abs(Number(n));
  return sym + abs.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applySettings();
  setGreeting();
  populateMonthFilter();
  initSidebar();
  initTheme();
  initModalClose();
  initDateInputs();
  initKeyboardShortcuts();
  injectPrintButton();
  refreshAll();
});

// ─── REFRESH ALL ─────────────────────────────────────────────
function refreshAll() {
  updateSummaryCards();
  renderRecentList();
  updateDashChart();
  renderHistory();
  renderBudgets();
  renderGoals();
  renderAnalytics();
  generateCalendar();
  generateInsights();
  renderSummaryReport();
  renderRecurring();
  renderHealthScore();
  renderMonthComparison();
  renderStreaks();
  populateMonthFilter();
  setGreeting();
}

// ─── NAVIGATION ──────────────────────────────────────────────
function initSidebar() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.page);
      // close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('open');
    });
  });

  const menuBtn = document.getElementById('menuBtn');
  let overlay = document.getElementById('sidebarOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }
  menuBtn && menuBtn.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    overlay.classList.remove('open');
  });
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navEl = document.querySelector(`[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.altKey) {
      const map = {'1':'dashboard','2':'transactions','3':'budget','4':'goals',
                   '5':'analytics','6':'calendar','7':'reports','8':'recurring','9':'tools'};
      if (map[e.key]) { navigateTo(map[e.key]); e.preventDefault(); }
      if (e.key === 'n') { openModal('addTransactionModal'); e.preventDefault(); }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}

// ─── THEME ───────────────────────────────────────────────────
function initTheme() {
  const s = getSettings();
  if (s.theme === 'light') { document.body.classList.add('light'); updateThemeIcon(true); }

  ['themeToggle','themeToggleMobile'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      saveSetting('theme', isLight ? 'light' : 'dark');
      updateThemeIcon(isLight);
    });
  });
}

function updateThemeIcon(light) {
  const icon  = light ? 'fa-moon'  : 'fa-sun';
  const label = light ? 'Light Mode' : 'Dark Mode';
  document.querySelectorAll('#themeToggle i, #themeToggleMobile i').forEach(i => {
    i.className = `fa-solid ${icon}`;
  });
  const span = document.querySelector('#themeToggle span');
  if (span) span.textContent = label;
}

// ─── SETTINGS ────────────────────────────────────────────────
function applySettings() {
  const s = getSettings();
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
  const chk = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.checked = val; };
  set('userName',         s.userName);
  set('currencySymbol',   s.currencySymbol);
  set('defaultType',      s.defaultType);
  set('defaultCategory',  s.defaultCategory);
  chk('notifBudget',      s.notifBudget  !== undefined ? s.notifBudget  : true);
  chk('notifGoal',        s.notifGoal    !== undefined ? s.notifGoal    : true);
  chk('notifInsight',     s.notifInsight !== undefined ? s.notifInsight : true);
  chk('compactView',      s.compactView);
  if (s.compactView)  document.body.classList.add('compact');
  if (s.theme === 'light') { document.body.classList.add('light'); updateThemeIcon(true); }
}

function saveSetting(key, value) {
  const s = getSettings(); s[key] = value; setSettings(s);
}

function applyCompactView() {
  const s = getSettings();
  document.body.classList.toggle('compact', !!s.compactView);
}

function clearAllData() {
  if (!confirm('Delete ALL data? This cannot be undone.')) return;
  ['fp_data','fp_budgets','fp_goals','fp_recurring'].forEach(k => localStorage.removeItem(k));
  showNotification('🗑️ All data cleared');
  refreshAll();
}

// ─── GREETING ────────────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const s = getSettings();
  const name = s.userName ? `, ${s.userName}` : '';
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const el = document.getElementById('dashGreeting');
  if (el) el.textContent = `${g}${name}! Here's your financial overview.`;
}

// ─── MODALS ──────────────────────────────────────────────────
function initModalClose() {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
}

function openModal(id) {
  if (id === 'addTransactionModal') resetTransactionForm();
  if (id === 'addRecurringModal')   resetRecurringForm();
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function initDateInputs() {
  const today = new Date().toISOString().split('T')[0];
  ['dateInput','recDueDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });
}

// ─── TRANSACTION FORM ────────────────────────────────────────
function resetTransactionForm() {
  const s = getSettings();
  document.getElementById('editIndex').value   = '-1';
  document.getElementById('modalTitle').textContent = 'Add Transaction';
  document.getElementById('amount').value      = '';
  document.getElementById('noteInput').value   = '';
  document.getElementById('dateInput').value   = new Date().toISOString().split('T')[0];
  document.getElementById('category').value    = s.defaultCategory || 'Food';
  setType(s.defaultType || 'expense');
}

function setType(type) {
  currentType = type;
  document.getElementById('typeIncome').className  = 'type-btn' + (type==='income'  ? ' active income-active'  : '');
  document.getElementById('typeExpense').className = 'type-btn' + (type==='expense' ? ' active expense-active' : '');
}

function saveTransaction() {
  const amount   = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const note     = document.getElementById('noteInput').value.trim();
  const date     = document.getElementById('dateInput').value;
  const editIdx  = parseInt(document.getElementById('editIndex').value);

  if (!amount || amount <= 0) { showNotification('⚠️ Enter a valid amount'); return; }
  if (!date)                  { showNotification('⚠️ Select a date'); return; }

  const income  = currentType === 'income'  ? amount : 0;
  const expense = currentType === 'expense' ? amount : 0;
  const profit  = income - expense;
  const entry   = { date, income, expense, profit, category, note, type: currentType, id: Date.now() };

  const data = getData();
  if (editIdx >= 0) {
    data[editIdx] = { ...data[editIdx], ...entry, id: data[editIdx].id };
    showNotification('✏️ Transaction updated');
  } else {
    data.push(entry);
    showNotification('✅ Transaction added');
    checkBudgetAlert(category, expense);
    // Check if any goal is now achieved
    const totalProfit = data.reduce((s,d) => s + Number(d.profit), 0);
    getGoals().forEach(g => {
      if (totalProfit >= g.target && getSettings().notifGoal !== false) {
        fireConfetti();
        showNotification(`🎉 Goal "${g.name}" achieved!`);
      }
    });
  }
  setData(data);
  closeModal('addTransactionModal');
  refreshAll();
}

function editRow(index) {
  const item = getData()[index];
  if (!item) return;
  document.getElementById('editIndex').value   = index;
  document.getElementById('modalTitle').textContent = 'Edit Transaction';
  document.getElementById('amount').value      = item.income > 0 ? item.income : item.expense;
  document.getElementById('category').value    = item.category;
  document.getElementById('noteInput').value   = item.note || '';
  document.getElementById('dateInput').value   = item.date;
  setType(item.type || (item.income > 0 ? 'income' : 'expense'));
  openModal('addTransactionModal');
}

function deleteRow(index) {
  if (!confirm('Delete this transaction?')) return;
  const data = getData();
  data.splice(index, 1);
  setData(data);
  showNotification('🗑️ Transaction deleted');
  refreshAll();
}

// ─── SUMMARY CARDS ───────────────────────────────────────────
function updateSummaryCards() {
  const data = getData();
  let totalIncome = 0, totalExpense = 0, totalProfit = 0;
  data.forEach(d => {
    totalIncome  += Number(d.income);
    totalExpense += Number(d.expense);
    totalProfit  += Number(d.profit);
  });
  const avg = data.length ? totalProfit / data.length : 0;

  animateCounter('totalIncome',  totalIncome,  currency());
  animateCounter('totalExpense', totalExpense, currency());
  animateCounter('totalProfit',  totalProfit,  currency());
  animateCounter('avgProfit',    avg,          currency());

  const el = id => document.getElementById(id);
  if (el('totalEntries'))   el('totalEntries').textContent   = `${data.length} entr${data.length===1?'y':'ies'}`;
  if (el('incomeChange'))   el('incomeChange').textContent   = totalIncome  > 0 ? `↑ ${fmt(totalIncome)}`  : '--';
  if (el('expenseChange'))  el('expenseChange').textContent  = totalExpense > 0 ? `↓ ${fmt(totalExpense)}` : '--';
  if (el('profitChange'))   el('profitChange').textContent   = totalProfit >= 0 ? 'Net positive ✅' : 'Net negative ⚠️';
}

function animateCounter(id, target, prefix='') {
  const el = document.getElementById(id);
  if (!el) return;
  const dur = 700, t0 = performance.now();
  const sign = target < 0 ? '-' : '';
  const abs  = Math.abs(target);
  const step = t => {
    const p = Math.min((t - t0) / dur, 1);
    const v = abs * (1 - Math.pow(1 - p, 3));
    el.textContent = sign + prefix + Math.round(v).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = sign + prefix + abs.toLocaleString('en-IN');
  };
  requestAnimationFrame(step);
}

// ─── RECENT LIST ─────────────────────────────────────────────
const CAT_EMOJI = {Food:'🍔',Travel:'✈️',Rent:'🏠',Shopping:'🛍️',Salary:'💼',Freelance:'💻',Investment:'📈',Medical:'🏥',Entertainment:'🎮',Other:'📦'};

function renderRecentList() {
  const data = getData().slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
  const el   = document.getElementById('recentList');
  if (!el) return;
  if (!data.length) {
    el.innerHTML = '<p style="color:var(--text2);font-size:13px;padding:10px 0">No transactions yet — add one above!</p>';
    return;
  }
  el.innerHTML = data.map(item => {
    const amt = item.type==='income' ? item.income : item.expense;
    return `
    <div class="recent-item">
      <div class="recent-icon ${item.type==='income'?'inc':'exp'}">${CAT_EMOJI[item.category]||'💰'}</div>
      <div class="recent-info">
        <strong>${item.category}${item.note?' — '+item.note:''}</strong>
        <small>${formatDate(item.date)}</small>
      </div>
      <div class="recent-amount ${item.type==='income'?'inc':'exp'}">
        ${item.type==='income'?'+':'-'}${fmt(amt)}
      </div>
    </div>`;
  }).join('');
}

// ─── DASH CHART ──────────────────────────────────────────────
function updateDashChart() {
  const filter = document.getElementById('dashChartFilter');
  let data = getData();
  if (filter && filter.value !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(filter.value));
    data = data.filter(d => new Date(d.date) >= cutoff);
  }
  const grouped = {};
  data.forEach(d => {
    if (!grouped[d.date]) grouped[d.date] = {income:0, expense:0};
    grouped[d.date].income  += Number(d.income);
    grouped[d.date].expense += Number(d.expense);
  });
  const labels   = Object.keys(grouped).sort();
  const incomes  = labels.map(l => grouped[l].income);
  const expenses = labels.map(l => grouped[l].expense);

  const ctx = document.getElementById('dashChart');
  if (!ctx) return;
  if (dashChartInst) dashChartInst.destroy();
  dashChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(l => formatDate(l, true)),
      datasets: [
        {label:'Income',  data:incomes,  backgroundColor:'rgba(0,230,118,0.75)', borderRadius:5},
        {label:'Expense', data:expenses, backgroundColor:'rgba(255,82,82,0.75)',  borderRadius:5}
      ]
    },
    options: chartOpts()
  });
}

function chartOpts(extra={}) {
  const tick = getTickColor();
  const grid = getGridColor();
  return {
    responsive: true,
    plugins: { legend: { labels: { color: tick, font:{size:12} } }, ...(extra.plugins||{}) },
    scales: {
      x: { ticks:{color:tick}, grid:{color:grid} },
      y: { ticks:{color:tick}, grid:{color:grid} }
    },
    ...extra
  };
}

// ─── HISTORY TABLE ───────────────────────────────────────────
function renderHistory(dataOverride) {
  const data   = dataOverride !== undefined ? dataOverride : getData()
    .slice().sort((a,b) => sortDir * (new Date(a[sortKey]||0) > new Date(b[sortKey]||0) ? 1 : -1));
  const tbody  = document.getElementById('historyBody');
  const empty  = document.getElementById('emptyState');
  const stats  = document.getElementById('filterStats');

  if (!data.length) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (stats) stats.textContent = 'No transactions found';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (stats) stats.textContent = `Showing ${data.length} transaction${data.length!==1?'s':''}`;

  const allData = getData(); // needed for real index
  if (tbody) tbody.innerHTML = data.map(item => {
    const realIdx = allData.findIndex(d => d.id === item.id);
    return `
    <tr>
      <td>${formatDate(item.date)}</td>
      <td style="color:var(--green)">${item.income>0?fmt(item.income):'—'}</td>
      <td style="color:var(--red)">${item.expense>0?fmt(item.expense):'—'}</td>
      <td style="color:${item.profit>=0?'var(--green)':'var(--red)'};font-weight:600">
        ${item.profit>=0?'+':''}${fmt(item.profit)}
      </td>
      <td><span class="badge-cat">${CAT_EMOJI[item.category]||''} ${item.category}</span></td>
      <td style="color:var(--text2);font-size:12px">${item.note||'—'}</td>
      <td><span class="badge ${item.type==='income'?'badge-income':'badge-expense'}">${item.type}</span></td>
      <td>
        <div class="action-btns">
          <button class="edit-btn" onclick="editRow(${realIdx})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="del-btn"  onclick="deleteRow(${realIdx})" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterHistory() {
  const search   = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const type     = document.getElementById('filterType').value;
  const month    = document.getElementById('filterMonth').value;

  const data = getData().filter(item => {
    return (!search   || item.category.toLowerCase().includes(search) || (item.note||'').toLowerCase().includes(search))
        && (category==='all' || item.category===category)
        && (type==='all'     || item.type===type)
        && (month==='all'    || item.date.startsWith(month));
  });
  renderHistory(data);
}

function clearFilters() {
  ['searchInput','filterCategory','filterType','filterMonth'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = el.tagName==='SELECT' ? 'all' : '';
  });
  renderHistory();
}

function sortTable(key) {
  if (sortKey === key) sortDir *= -1; else { sortKey = key; sortDir = 1; }
  renderHistory();
}

function populateMonthFilter() {
  const sel = document.getElementById('filterMonth');
  if (!sel) return;
  while (sel.options.length > 1) sel.remove(1);
  const months = [...new Set(getData().map(d => d.date.substring(0,7)))].sort().reverse();
  months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = new Date(m+'-01').toLocaleString('default',{month:'long',year:'numeric'});
    sel.appendChild(opt);
  });
}

// ─── BUDGETS ─────────────────────────────────────────────────
function saveBudget() {
  const cat    = document.getElementById('budgetCategory').value;
  const amount = parseFloat(document.getElementById('budgetAmount').value);
  if (!amount || amount<=0) { showNotification('⚠️ Enter a valid budget'); return; }
  const b = getBudgets(); b[cat] = amount; setBudgets(b);
  document.getElementById('budgetAmount').value = '';
  closeModal('addBudgetModal');
  showNotification(`✅ Budget set for ${cat}`);
  renderBudgets();
}

function deleteBudget(cat) {
  const b = getBudgets(); delete b[cat]; setBudgets(b);
  showNotification(`🗑️ Budget removed for ${cat}`);
  renderBudgets();
}

function renderBudgets() {
  const budgets = getBudgets();
  const data    = getData();
  const list    = document.getElementById('budgetList');
  if (!list) return;

  const catSpend = {};
  data.forEach(d => { catSpend[d.category] = (catSpend[d.category]||0) + Number(d.expense); });

  if (!Object.keys(budgets).length) {
    list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-piggy-bank"></i><p>No budgets set. Click "Add Budget" to start.</p></div>`;
    ['totalBudgetAmt','totalSpentAmt','totalRemainingAmt'].forEach(id => {
      const el = document.getElementById(id); if(el) el.textContent = fmt(0);
    });
    return;
  }

  let totalBudget=0, totalSpent=0;
  list.innerHTML = Object.entries(budgets).map(([cat, budget]) => {
    const spent = catSpend[cat]||0;
    const pct   = Math.min((spent/budget)*100, 100).toFixed(1);
    const cls   = pct>=100?'over':pct>=75?'warn':'';
    totalBudget += budget; totalSpent += spent;
    return `
    <div class="budget-item">
      <div class="budget-item-header">
        <strong>${CAT_EMOJI[cat]||''} ${cat}</strong>
        <span>${fmt(spent)} / ${fmt(budget)}
          <button class="btn btn-sm btn-danger" style="margin-left:8px" onclick="deleteBudget('${cat}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </span>
      </div>
      <div class="progress-track"><div class="progress-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="budget-item-footer">
        <span>${pct}% used</span>
        <span>${spent>budget?'⚠️ Overspent by '+fmt(spent-budget):'Remaining: '+fmt(budget-spent)}</span>
      </div>
    </div>`;
  }).join('');

  const s = id => { const el=document.getElementById(id); return el; };
  if (s('totalBudgetAmt'))    s('totalBudgetAmt').textContent    = fmt(totalBudget);
  if (s('totalSpentAmt'))     s('totalSpentAmt').textContent     = fmt(totalSpent);
  if (s('totalRemainingAmt')) s('totalRemainingAmt').textContent = fmt(totalBudget-totalSpent);
}

function checkBudgetAlert(category, expenseAmount) {
  if (getSettings().notifBudget === false) return;
  const budgets = getBudgets();
  if (!budgets[category]) return;
  const spent = getData().filter(d=>d.category===category).reduce((s,d)=>s+Number(d.expense),0) + expenseAmount;
  const pct   = (spent/budgets[category])*100;
  if (pct>=100) showNotification(`🚨 ${category} budget exceeded!`);
  else if (pct>=80) showNotification(`⚠️ ${category} at ${pct.toFixed(0)}% of budget`);
}

// ─── GOALS ───────────────────────────────────────────────────
function saveGoal() {
  const name   = document.getElementById('goalName').value.trim();
  const target = parseFloat(document.getElementById('goalTarget').value);
  const date   = document.getElementById('goalDate').value;
  const icon   = document.getElementById('goalIcon').value;
  if (!name)          { showNotification('⚠️ Enter a goal name'); return; }
  if (!target||target<=0) { showNotification('⚠️ Enter a valid target'); return; }
  const goals = getGoals();
  goals.push({name, target, date, icon, id:Date.now(), created:new Date().toISOString()});
  setGoals(goals);
  closeModal('addGoalModal');
  document.getElementById('goalName').value = '';
  document.getElementById('goalTarget').value = '';
  showNotification(`🎯 Goal "${name}" created!`);
  renderGoals();
}

function deleteGoal(id) {
  setGoals(getGoals().filter(g=>g.id!==id));
  showNotification('🗑️ Goal removed');
  renderGoals();
}

function renderGoals() {
  const goals = getGoals();
  const list  = document.getElementById('goalList');
  const none  = document.getElementById('noGoals');
  if (!list) return;

  const totalProfit = getData().reduce((s,d)=>s+Number(d.profit),0);
  if (!goals.length) { list.innerHTML=''; if(none) none.style.display='block'; return; }
  if (none) none.style.display='none';

  list.innerHTML = goals.map(goal => {
    const pct      = Math.min((totalProfit/goal.target)*100, 100);
    const cls      = pct>=100?'over':pct>=70?'warn':'';
    const daysLeft = goal.date ? Math.ceil((new Date(goal.date)-new Date())/86400000) : null;
    const color    = pct>=100?'var(--green)':pct>=70?'var(--orange)':'var(--primary-light)';
    return `
    <div class="goal-card">
      <button class="del-goal" onclick="deleteGoal(${goal.id})" title="Delete"><i class="fa-solid fa-xmark"></i></button>
      <div class="goal-card-header">
        <div class="goal-emoji">${goal.icon}</div>
        <div><h4>${goal.name}</h4><small>Target: ${fmt(goal.target)}</small></div>
      </div>
      <div class="goal-amounts">
        <div><span style="color:var(--text2);font-size:12px">Saved</span><br>
          <strong style="color:${color}">${fmt(Math.max(totalProfit,0))}</strong></div>
        <div style="text-align:right"><span style="color:var(--text2);font-size:12px">Remaining</span><br>
          <strong style="color:var(--red)">${fmt(Math.max(goal.target-totalProfit,0))}</strong></div>
      </div>
      <div class="progress-track"><div class="progress-fill ${cls}" style="width:${pct.toFixed(1)}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);margin-top:6px">
        <span>${pct.toFixed(1)}% complete</span>
        ${daysLeft!==null?`<span>${daysLeft>0?daysLeft+'d left':'⚠️ Overdue'}</span>`:''}
      </div>
      ${pct>=100?'<p style="color:var(--green);font-size:13px;margin-top:8px;font-weight:600">🎉 Goal achieved!</p>':''}
    </div>`;
  }).join('');
}

// ─── ANALYTICS ───────────────────────────────────────────────
function renderAnalytics() {
  const data     = getData();
  const catTotals= {};
  const monthInc = {}, monthExp = {};

  data.forEach(d => {
    catTotals[d.category] = (catTotals[d.category]||0) + Number(d.expense);
    const m = d.date.substring(0,7);
    monthInc[m] = (monthInc[m]||0) + Number(d.income);
    monthExp[m] = (monthExp[m]||0) + Number(d.expense);
  });

  const catLabels = Object.keys(catTotals);
  const catValues = Object.values(catTotals);
  const totalExp  = catValues.reduce((a,b)=>a+b,0);
  const bLabels   = [...new Set([...Object.keys(monthInc),...Object.keys(monthExp)])].sort();
  const COLORS    = ['#6c63ff','#ff5252','#00e676','#ff9800','#00e5ff','#ffd740','#e040fb','#40c4ff','#69f0ae','#ffab40'];

  // Donut – category
  const catCtx = document.getElementById('categoryChart');
  if (catCtx) {
    if (catChartInst) catChartInst.destroy();
    catChartInst = new Chart(catCtx, {
      type:'doughnut',
      data:{labels:catLabels, datasets:[{data:catValues, backgroundColor:COLORS, borderWidth:2, borderColor:'rgba(0,0,0,0.15)'}]},
      options:{responsive:true, plugins:{legend:{position:'bottom',labels:{color:'#9198b5',padding:10,font:{size:11}}}}, cutout:'65%'}
    });
  }

  // Line – monthly profit
  const monthMap = {};
  data.forEach(d => { const m=d.date.substring(0,7); monthMap[m]=(monthMap[m]||0)+Number(d.profit); });
  const mLabels = Object.keys(monthMap).sort();
  const mCtx = document.getElementById('monthlyChart');
  if (mCtx) {
    if (monthlyChartInst) monthlyChartInst.destroy();
    monthlyChartInst = new Chart(mCtx, {
      type:'line',
      data:{labels:mLabels, datasets:[{label:'Net Profit',data:mLabels.map(k=>monthMap[k]), borderColor:'#6c63ff', backgroundColor:'rgba(108,99,255,0.12)', tension:0.4, fill:true, pointBackgroundColor:'#6c63ff', pointRadius:5}]},
      options:chartOpts({plugins:{legend:{display:false}}})
    });
  }

  // Bar – monthly income vs expense
  const bCtx = document.getElementById('incomeExpenseBar');
  if (bCtx) {
    if (incExpBarInst) incExpBarInst.destroy();
    incExpBarInst = new Chart(bCtx, {
      type:'bar',
      data:{labels:bLabels, datasets:[
        {label:'Income',  data:bLabels.map(l=>monthInc[l]||0), backgroundColor:'rgba(0,230,118,0.75)', borderRadius:5},
        {label:'Expense', data:bLabels.map(l=>monthExp[l]||0), backgroundColor:'rgba(255,82,82,0.75)',  borderRadius:5}
      ]},
      options:chartOpts()
    });
  }

  // Line – savings rate
  const srCtx = document.getElementById('savingsRateChart');
  if (srCtx) {
    if (savingsRateInst) savingsRateInst.destroy();
    savingsRateInst = new Chart(srCtx, {
      type:'line',
      data:{labels:bLabels, datasets:[{
        label:'Savings Rate %',
        data:bLabels.map(m => {
          const inc=monthInc[m]||0, exp=monthExp[m]||0;
          return inc>0?+((inc-exp)/inc*100).toFixed(1):0;
        }),
        borderColor:'#00e5ff', backgroundColor:'rgba(0,229,255,0.1)', tension:0.4, fill:true, pointRadius:4
      }]},
      options:chartOpts({plugins:{legend:{display:false}}, scales:{y:{ticks:{color:'#9198b5', callback:v=>v+'%'}}}})
    });
  }

  // Top categories table
  const topBody = document.getElementById('topCatBody');
  if (topBody) {
    const sorted = catLabels.map((l,i)=>({label:l,value:catValues[i]})).sort((a,b)=>b.value-a.value);
    const avg    = totalExp/(catLabels.length||1);
    topBody.innerHTML = sorted.map(c => `
      <tr>
        <td>${CAT_EMOJI[c.label]||''} ${c.label}</td>
        <td>${fmt(c.value)}</td>
        <td>${totalExp>0?((c.value/totalExp)*100).toFixed(1):0}%</td>
        <td class="${c.value>avg?'trend-up':'trend-down'}">${c.value>avg?'↑ Above avg':'↓ Below avg'}</td>
      </tr>`).join('');
  }
}

// ─── CALENDAR ────────────────────────────────────────────────
function changeMonth(dir) {
  calMonth += dir;
  if (calMonth>11) {calMonth=0; calYear++;}
  if (calMonth<0)  {calMonth=11; calYear--;}
  generateCalendar();
}

function generateCalendar() {
  const data      = getData();
  const dailyExp  = {};
  data.forEach(d => { dailyExp[d.date] = (dailyExp[d.date]||0)+Number(d.expense); });

  const labelEl = document.getElementById('calMonthLabel');
  if (labelEl) labelEl.textContent = new Date(calYear,calMonth).toLocaleString('default',{month:'long',year:'numeric'});

  const firstDay    = new Date(calYear,calMonth,1).getDay();
  const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
  const todayStr    = new Date().toISOString().split('T')[0];
  const body        = document.getElementById('calendarBody');
  if (!body) return;
  body.innerHTML    = '';

  for (let i=0; i<firstDay; i++) {
    const b = document.createElement('div'); b.className='cal-cell empty'; body.appendChild(b);
  }

  let monthTotal=0, monthHigh=0;
  for (let d=1; d<=daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const amt     = dailyExp[dateStr]||0;
    monthTotal += amt; if(amt>monthHigh) monthHigh=amt;
    const cls     = amt>3000?'high':amt>1000?'medium':amt>0?'low':'';
    const cell    = document.createElement('div');
    cell.className= `cal-cell ${cls} ${dateStr===todayStr?'today':''}`;
    cell.innerHTML= `<div class="cal-date">${d}</div>${amt>0?`<div class="cal-amt">${fmt(amt)}</div>`:''}`;
    body.appendChild(cell);
  }

  const calSum = document.getElementById('calSummary');
  if (calSum) calSum.innerHTML = `
    <div><span>Month total: </span><strong>${fmt(monthTotal)}</strong></div>
    <div><span>Peak day: </span><strong>${fmt(monthHigh)}</strong></div>
    <div><span>Avg/day: </span><strong>${fmt(monthTotal/daysInMonth)}</strong></div>`;
}

// ─── INSIGHTS ────────────────────────────────────────────────
function generateInsights() {
  const data = getData();
  const box  = document.getElementById('insightBox');
  if (!box) return;
  if (!data.length) {
    box.innerHTML = `<i class="fa-solid fa-lightbulb"></i><p>💡 Add transactions to get personalized insights.</p>`;
    return;
  }
  const catSpend = {};
  data.forEach(d => { catSpend[d.category]=(catSpend[d.category]||0)+Number(d.expense); });
  const top = Object.entries(catSpend).sort((a,b)=>b[1]-a[1])[0];
  const totalIncome  = data.reduce((s,d)=>s+Number(d.income),0);
  const totalExpense = data.reduce((s,d)=>s+Number(d.expense),0);
  const savingsRate  = totalIncome>0?((totalIncome-totalExpense)/totalIncome*100).toFixed(1):0;
  const tips = [];
  if (top)              tips.push(`Highest spend: <strong>${top[0]}</strong> at ${fmt(top[1])}.`);
  if (savingsRate>=20)  tips.push(`Savings rate <strong>${savingsRate}%</strong> — great job!`);
  if (savingsRate>0 && savingsRate<20) tips.push(`Savings rate <strong>${savingsRate}%</strong> — try to reach 20%.`);
  if (savingsRate<0)    tips.push(`⚠️ Spending more than earned. Review your expenses.`);
  box.innerHTML = `<i class="fa-solid fa-lightbulb"></i><p>${tips.join(' &nbsp;&bull;&nbsp; ')}</p>`;
  if (getSettings().notifInsight!==false && top)
    showNotification(`💡 Top spend: ${top[0]} (${fmt(top[1])})`);
}

// ─── HEALTH SCORE ────────────────────────────────────────────
function calcHealthScore() {
  const data    = getData();
  const budgets = getBudgets();
  const goals   = getGoals();
  if (!data.length) return {score:0, factors:[], tips:[]};

  const totalIncome  = data.reduce((s,d)=>s+Number(d.income),0);
  const totalExpense = data.reduce((s,d)=>s+Number(d.expense),0);
  const totalProfit  = data.reduce((s,d)=>s+Number(d.profit),0);
  const savingsRate  = totalIncome>0?(totalProfit/totalIncome)*100:0;
  const catSpend     = {};
  data.forEach(d => { catSpend[d.category]=(catSpend[d.category]||0)+Number(d.expense); });

  let score=0;
  const factors=[], tips=[];

  // Savings Rate (30)
  const srScore = savingsRate>=30?30:savingsRate>=20?22:savingsRate>=10?14:savingsRate>0?6:0;
  score+=srScore;
  factors.push({label:'Savings Rate',value:srScore,max:30,text:savingsRate.toFixed(1)+'%'});
  if (savingsRate<20) tips.push({text:`Savings rate ${savingsRate.toFixed(1)}%. Target 20%+ by reducing discretionary spend.`,cls:savingsRate<0?'bad':'warn'});
  else tips.push({text:`Excellent savings rate of ${savingsRate.toFixed(1)}%! Keep it up.`,cls:'good'});

  // Budget adherence (25)
  const budgetCats = Object.keys(budgets);
  let budgetScore  = budgetCats.length ? 25 : 10;
  if (budgetCats.length) {
    const over = budgetCats.filter(c=>(catSpend[c]||0)>budgets[c]).length;
    budgetScore = Math.round(25*(1-over/budgetCats.length));
    if (over) tips.push({text:`Exceeded budget in ${over} categor${over>1?'ies':'y'}. Tighten your limits.`,cls:'warn'});
    else tips.push({text:'Stayed within all budgets this period. Excellent!',cls:'good'});
  } else {
    tips.push({text:'Set category budgets to improve financial discipline and your score.',cls:'warn'});
  }
  score+=budgetScore;
  factors.push({label:'Budget Adherence',value:budgetScore,max:25,text:budgetCats.length?`${budgetCats.length-budgetCats.filter(c=>(catSpend[c]||0)>budgets[c]).length}/${budgetCats.length} OK`:'No budgets'});

  // Goal progress (20)
  let goalScore = goals.length ? 0 : 5;
  if (goals.length) {
    const avgPct = goals.reduce((s,g)=>s+Math.min(totalProfit/g.target,1),0)/goals.length;
    goalScore = Math.round(20*avgPct);
    tips.push({text:`Goals ${(avgPct*100).toFixed(0)}% complete on average. ${avgPct>=0.7?'Nearly there!':'Keep saving.'}`,cls:avgPct>=0.7?'good':'warn'});
  } else {
    tips.push({text:'No savings goals set. Create goals to stay motivated.',cls:'warn'});
  }
  score+=goalScore;
  factors.push({label:'Goal Progress',value:goalScore,max:20,text:goals.length?`${goals.length} goal${goals.length>1?'s':''}`:'No goals'});

  // Spending balance (15)
  const maxExp    = Math.max(...Object.values(catSpend),0);
  const concRatio = totalExpense>0?maxExp/totalExpense:1;
  const divScore  = Math.max(Math.round(15*(1-Math.min(concRatio-0.3,0.7)/0.7)),0);
  score+=divScore;
  factors.push({label:'Spending Balance',value:divScore,max:15,text:`${Object.keys(catSpend).length} categories`});
  if (concRatio>0.6) tips.push({text:'Over 60% of spending in one category. Diversify your budget.',cls:'warn'});

  // Data consistency (10)
  const months   = new Set(data.map(d=>d.date.substring(0,7))).size;
  const conScore = Math.min(months*2,10);
  score+=conScore;
  factors.push({label:'Data Consistency',value:conScore,max:10,text:`${months} month${months!==1?'s':''}`});
  if (months<3) tips.push({text:`Only ${months} month(s) tracked. Log consistently for 3+ months for a better score.`,cls:months<2?'bad':'warn'});
  else tips.push({text:`${months} months of data — great consistency!`,cls:'good'});

  return {score:Math.round(Math.min(score,100)), factors, tips};
}

function renderHealthScore() {
  const {score, factors, tips} = calcHealthScore();
  const color = score>=85?'#00e676':score>=70?'#ffd740':score>=50?'#ff9800':'#ff5252';
  const grade = score>=85?'Excellent 🌟':score>=70?'Good 👍':score>=50?'Fair ⚠️':'Needs Work 🔴';

  // Mini ring (dashboard)
  const arc = document.getElementById('healthArc');
  if (arc) { arc.style.strokeDashoffset=314-(314*score/100); arc.style.stroke=color; }
  const numEl = document.getElementById('healthScoreNum');
  if (numEl) numEl.textContent = score;
  const miniLabels = document.getElementById('healthMiniLabels');
  if (miniLabels) miniLabels.innerHTML = factors.slice(0,3).map(f=>`
    <div class="health-mini-label">
      <div class="dot" style="background:${f.value/f.max>0.6?'#00e676':f.value/f.max>0.3?'#ff9800':'#ff5252'}"></div>
      <span>${f.label}: <strong>${f.value}/${f.max}</strong></span>
    </div>`).join('');

  // Full page ring
  const arcL = document.getElementById('healthArcLarge');
  if (arcL) { arcL.style.strokeDashoffset=534-(534*score/100); arcL.style.stroke=color; }
  const scoreL = document.getElementById('healthScoreLarge');
  if (scoreL) scoreL.textContent = score;
  const gradeEl = document.getElementById('healthGrade');
  if (gradeEl) { gradeEl.textContent=grade; gradeEl.style.background=color+'22'; gradeEl.style.color=color; }
  const summEl = document.getElementById('healthSummaryText');
  if (summEl) summEl.textContent = score>=70?'Your finances look healthy. Keep up the great work!':score>=50?'Room for improvement. Focus on saving and budgeting.':'Your finances need attention. Start with small budgets and goals.';

  const factorEl = document.getElementById('healthFactors');
  if (factorEl) factorEl.innerHTML = factors.map(f=>{
    const pct=(f.value/f.max*100).toFixed(0);
    const fc = f.value/f.max>0.6?'#00e676':f.value/f.max>0.3?'#ff9800':'#ff5252';
    return `<div class="health-factor">
      <div class="health-factor-header">
        <span>${f.label} <small style="color:var(--text2)">(${f.text})</small></span>
        <strong>${f.value}/${f.max}</strong>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${fc}"></div></div>
    </div>`;
  }).join('');

  const tipsEl = document.getElementById('healthTips');
  if (tipsEl) tipsEl.innerHTML = tips.map(t=>`<div class="health-tip ${t.cls}">${t.text}</div>`).join('');
}

// ─── RECURRING ───────────────────────────────────────────────
function resetRecurringForm() {
  document.getElementById('recName').value    = '';
  document.getElementById('recAmount').value  = '';
  document.getElementById('recDueDate').value = new Date().toISOString().split('T')[0];
  setRecType('expense');
}

function setRecType(type) {
  recType = type;
  document.getElementById('recTypeIncome').className  = 'type-btn'+(type==='income' ?' active income-active':'');
  document.getElementById('recTypeExpense').className = 'type-btn'+(type==='expense'?' active expense-active':'');
}

function saveRecurring() {
  const name   = document.getElementById('recName').value.trim();
  const amount = parseFloat(document.getElementById('recAmount').value);
  const cat    = document.getElementById('recCategory').value;
  const freq   = document.getElementById('recFreq').value;
  const due    = document.getElementById('recDueDate').value;
  if (!name)          { showNotification('⚠️ Enter a name'); return; }
  if (!amount||amount<=0) { showNotification('⚠️ Enter a valid amount'); return; }
  if (!due)           { showNotification('⚠️ Select a due date'); return; }
  const list = getRecurring();
  list.push({id:Date.now(), name, amount, category:cat, freq, due, type:recType, active:true});
  setRecurring(list);
  closeModal('addRecurringModal');
  showNotification(`🔄 "${name}" added as recurring`);
  renderRecurring();
}

function deleteRecurring(id) {
  if (!confirm('Remove this recurring entry?')) return;
  setRecurring(getRecurring().filter(r=>r.id!==id));
  showNotification('🗑️ Recurring entry removed');
  renderRecurring();
}

function logRecurringNow(id) {
  const list = getRecurring();
  const idx  = list.findIndex(r=>r.id===id);
  if (idx<0) return;
  const rec  = list[idx];
  const income  = rec.type==='income'  ? rec.amount : 0;
  const expense = rec.type==='expense' ? rec.amount : 0;
  const data = getData();
  data.push({date:new Date().toISOString().split('T')[0], income, expense, profit:income-expense,
    category:rec.category, note:rec.name+' (recurring)', type:rec.type, id:Date.now()});
  setData(data);
  // Advance due date
  const d = new Date(rec.due);
  if (rec.freq==='weekly')  d.setDate(d.getDate()+7);
  if (rec.freq==='monthly') d.setMonth(d.getMonth()+1);
  if (rec.freq==='yearly')  d.setFullYear(d.getFullYear()+1);
  list[idx].due = d.toISOString().split('T')[0];
  setRecurring(list);
  showNotification(`✅ Logged: ${rec.name} (${fmt(rec.amount)})`);
  refreshAll();
}

function renderRecurring() {
  const list   = getRecurring();
  const el     = document.getElementById('recurringList');
  const none   = document.getElementById('noRecurring');
  const banner = document.getElementById('recurringDueBanner');
  if (!el) return;

  if (!list.length) {
    el.innerHTML=''; if(none) none.style.display='block'; if(banner) banner.style.display='none'; return;
  }
  if (none) none.style.display='none';

  const today = new Date(); today.setHours(0,0,0,0);
  const dueSoon = list.filter(r=>{ const d=new Date(r.due); d.setHours(0,0,0,0); return (d-today)/86400000<=3 && (d-today)/86400000>=0; });
  if (banner) {
    banner.style.display = dueSoon.length ? 'block' : 'none';
    if (dueSoon.length) banner.innerHTML = `⏰ <strong>${dueSoon.length} entr${dueSoon.length>1?'ies':'y'} due soon:</strong> ${dueSoon.map(r=>r.name).join(', ')}`;
  }

  el.innerHTML = list.map(rec => {
    const dueDate = new Date(rec.due); dueDate.setHours(0,0,0,0);
    const diff    = Math.round((dueDate-today)/86400000);
    const dueCls  = diff<0?'overdue':diff<=3?'soon':'';
    const dueLabel= diff<0?`Overdue ${Math.abs(diff)}d`:diff===0?'Due today!':diff<=3?`Due in ${diff}d`:`Due ${formatDate(rec.due,true)}`;
    return `
    <div class="rec-item">
      <div class="rec-icon ${rec.type==='income'?'inc':'exp'}">${CAT_EMOJI[rec.category]||'💰'}</div>
      <div class="rec-info">
        <strong>${rec.name}</strong>
        <small>${rec.category} · ${rec.freq.charAt(0).toUpperCase()+rec.freq.slice(1)}</small>
      </div>
      <div class="rec-right">
        <div class="rec-amount ${rec.type==='income'?'inc':'exp'}">${rec.type==='income'?'+':'-'}${fmt(rec.amount)}</div>
        <div class="rec-due ${dueCls}">${dueLabel}</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button class="btn btn-sm btn-outline" onclick="logRecurringNow(${rec.id})" title="Log now"><i class="fa-solid fa-check"></i> Log</button>
          <button class="btn btn-sm btn-danger"  onclick="deleteRecurring(${rec.id})"  title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ─── TOOLS ───────────────────────────────────────────────────
function calcEMI() {
  const P = parseFloat(document.getElementById('loanAmt').value);
  const r = parseFloat(document.getElementById('loanRate').value)/12/100;
  const N = parseInt(document.getElementById('loanTenure').value);
  const res = document.getElementById('emiResult');
  if (!P||!r||!N||P<=0) { if(res) res.style.display='none'; return; }

  const emi      = P*r*Math.pow(1+r,N)/(Math.pow(1+r,N)-1);
  const total    = emi*N;
  const interest = total-P;

  document.getElementById('emiAmt').textContent      = fmt(emi);
  document.getElementById('emiInterest').textContent = fmt(interest);
  document.getElementById('emiTotal').textContent    = fmt(total);
  if (res) res.style.display='flex';

  const ctx = document.getElementById('emiChart');
  if (!ctx) return;
  if (emiChartInst) emiChartInst.destroy();
  emiChartInst = new Chart(ctx, {
    type:'doughnut',
    data:{labels:['Principal','Interest'], datasets:[{data:[P,interest], backgroundColor:['#6c63ff','#ff5252'], borderWidth:0}]},
    options:{responsive:true, plugins:{legend:{labels:{color:'#9198b5'}}}, cutout:'60%'}
  });
}

function addEMIToTransactions() {
  const amt = document.getElementById('loanAmt').value;
  if (!amt) { showNotification('⚠️ Calculate EMI first'); return; }
  document.getElementById('recName').value   = 'Loan EMI';
  document.getElementById('recAmount').value = document.getElementById('emiAmt').textContent.replace(/[^\d.]/g,'') || amt;
  setRecType('expense');
  document.getElementById('recCategory').value = 'Other';
  document.getElementById('recFreq').value   = 'monthly';
  document.getElementById('recDueDate').value= new Date().toISOString().split('T')[0];
  openModal('addRecurringModal');
}

function calcTax() {
  const income     = parseFloat(document.getElementById('taxIncome').value);
  const regime     = document.getElementById('taxRegime').value;
  const deductions = parseFloat(document.getElementById('taxDeductions')?.value)||0;
  const res        = document.getElementById('taxResult');
  const deductRow  = document.getElementById('deductionRow');
  if (deductRow)   deductRow.style.display = regime==='old' ? 'block' : 'none';
  if (!income||income<=0) { if(res) res.style.display='none'; return; }

  let taxable=income, tax=0;
  if (regime==='new') {
    taxable = Math.max(income-75000,0);
    let rem  = Math.max(taxable-300000,0);
    [[300000,0.05],[300000,0.10],[300000,0.15],[300000,0.20],[Infinity,0.30]].forEach(([lim,rate])=>{
      if(rem<=0) return; const chunk=Math.min(rem,lim); tax+=chunk*rate; rem-=chunk;
    });
    if (taxable<=700000) tax=0;
  } else {
    taxable = Math.max(income-50000-deductions,0);
    let rem  = Math.max(taxable-250000,0);
    [[250000,0.05],[500000,0.20],[Infinity,0.30]].forEach(([lim,rate])=>{
      if(rem<=0) return; const chunk=Math.min(rem,lim); tax+=chunk*rate; rem-=chunk;
    });
    if (taxable<=500000) tax=0;
  }
  const total     = tax*1.04;
  const effRate   = income>0?(total/income*100).toFixed(2):0;
  const takeHome  = (income-total)/12;

  document.getElementById('taxableIncome').textContent = fmt(taxable);
  document.getElementById('taxAmt').textContent        = fmt(total);
  document.getElementById('taxRate').textContent       = effRate+'%';
  document.getElementById('taxTakeHome').textContent   = fmt(takeHome)+'/mo';
  if (res) res.style.display='flex';

  const ctx = document.getElementById('taxChart');
  if (!ctx) return;
  if (taxChartInst) taxChartInst.destroy();
  taxChartInst = new Chart(ctx, {
    type:'bar',
    data:{labels:['Take Home','Tax'], datasets:[{data:[income-total,total], backgroundColor:['#00e676','#ff5252'], borderRadius:6}]},
    options:chartOpts({plugins:{legend:{display:false}}})
  });
}

function calcSIP() {
  const P = parseFloat(document.getElementById('sipAmt').value);
  const r = parseFloat(document.getElementById('sipReturn').value)/12/100;
  const n = parseFloat(document.getElementById('sipYears').value)*12;
  const res = document.getElementById('sipResult');
  if (!P||!r||!n||P<=0) { if(res) res.style.display='none'; return; }

  const maturity = P*((Math.pow(1+r,n)-1)/r)*(1+r);
  const invested = P*n;
  const returns  = maturity-invested;
  document.getElementById('sipInvested').textContent = fmt(invested);
  document.getElementById('sipReturns').textContent  = fmt(returns);
  document.getElementById('sipMaturity').textContent = fmt(maturity);
  if (res) res.style.display='flex';

  const years  = Math.ceil(n/12);
  const labels = Array.from({length:years},(_,i)=>`Y${i+1}`);
  const ctx    = document.getElementById('sipChart');
  if (!ctx) return;
  if (sipChartInst) sipChartInst.destroy();
  sipChartInst = new Chart(ctx, {
    type:'line',
    data:{labels, datasets:[
      {label:'Portfolio Value', data:labels.map((_,i)=>Math.round(P*((Math.pow(1+r,(i+1)*12)-1)/r)*(1+r))), borderColor:'#00e5ff', backgroundColor:'rgba(0,229,255,0.1)', fill:true, tension:0.4},
      {label:'Invested',       data:labels.map((_,i)=>P*(i+1)*12), borderColor:'#6c63ff', borderDash:[5,4], tension:0, backgroundColor:'transparent'}
    ]},
    options:chartOpts()
  });
}

function calcFD() {
  const P   = parseFloat(document.getElementById('fdPrincipal').value);
  const r   = parseFloat(document.getElementById('fdRate').value)/100;
  const t   = parseFloat(document.getElementById('fdYears').value);
  const n   = parseInt(document.getElementById('fdComp').value);
  const res = document.getElementById('fdResult');
  if (!P||!r||!t||P<=0) { if(res) res.style.display='none'; return; }
  const maturity = P*Math.pow(1+r/n,n*t);
  document.getElementById('fdInterest').textContent = fmt(maturity-P);
  document.getElementById('fdMaturity').textContent = fmt(maturity);
  if (res) res.style.display='flex';
}

// ─── REPORTS ─────────────────────────────────────────────────
function renderSummaryReport() {
  const data = getData();
  const el   = document.getElementById('summaryReport');
  if (!el) return;
  const totalIncome  = data.reduce((s,d)=>s+Number(d.income),0);
  const totalExpense = data.reduce((s,d)=>s+Number(d.expense),0);
  const totalProfit  = data.reduce((s,d)=>s+Number(d.profit),0);
  const savingsRate  = totalIncome>0?((totalIncome-totalExpense)/totalIncome*100).toFixed(1):0;
  el.innerHTML = [
    ['Total Entries',   data.length],
    ['Total Income',    fmt(totalIncome)],
    ['Total Expenses',  fmt(totalExpense)],
    ['Net Profit',      fmt(totalProfit)],
    ['Savings Rate',    savingsRate+'%'],
    ['Avg per Entry',   fmt(data.length?totalProfit/data.length:0)],
    ['Categories Used', new Set(data.map(d=>d.category)).size],
    ['Date Range',      data.length?`${data[0].date} → ${data[data.length-1].date}`:'—']
  ].map(([l,v])=>`<div class="sum-item"><small>${l}</small><strong>${v}</strong></div>`).join('');
}

function renderMonthComparison() {
  const el = document.getElementById('monthComparison');
  if (!el) return;
  const months={};
  getData().forEach(d=>{
    const m=d.date.substring(0,7);
    if(!months[m]) months[m]={income:0,expense:0,profit:0};
    months[m].income +=Number(d.income);
    months[m].expense+=Number(d.expense);
    months[m].profit +=Number(d.profit);
  });
  const keys=Object.keys(months).sort().reverse().slice(0,6);
  if (!keys.length) { el.innerHTML='<p style="color:var(--text2);font-size:13px">Add transactions across multiple months to see comparisons.</p>'; return; }
  el.innerHTML=keys.map((m,i)=>{
    const curr=months[m], prev=months[keys[i+1]];
    const label=new Date(m+'-01').toLocaleString('default',{month:'short',year:'numeric'});
    let changeHtml='';
    if (prev) {
      const diff=curr.profit-prev.profit;
      const pct=prev.profit!==0?Math.abs((diff/Math.abs(prev.profit))*100).toFixed(1):'∞';
      changeHtml=`<div class="month-comp-change ${diff>=0?'up':'down'}">${diff>=0?'▲':'▼'} ${pct}% vs prev</div>`;
    }
    return `<div class="month-comp-card ${prev?curr.profit>=prev.profit?'better':'worse':''}">
      <h4>${label}</h4>
      <div class="month-comp-row"><span>Income</span><strong style="color:var(--green)">${fmt(curr.income)}</strong></div>
      <div class="month-comp-row"><span>Expense</span><strong style="color:var(--red)">${fmt(curr.expense)}</strong></div>
      <div class="month-comp-row"><span>Net</span><strong style="color:${curr.profit>=0?'var(--green)':'var(--red)'}">${fmt(curr.profit)}</strong></div>
      ${changeHtml}
    </div>`;
  }).join('');
}

function renderStreaks() {
  const el = document.getElementById('streakSection');
  if (!el) return;
  const data = getData();
  if (!data.length) { el.innerHTML='<p style="color:var(--text2);font-size:13px">No data yet. Add transactions to earn milestones.</p>'; return; }

  const totalIncome = data.reduce((s,d)=>s+Number(d.income),0);
  const totalProfit = data.reduce((s,d)=>s+Number(d.profit),0);
  const months      = new Set(data.map(d=>d.date.substring(0,7))).size;
  const savingsRate = totalIncome>0?(totalProfit/totalIncome*100):0;

  // Consecutive day streak
  const days = [...new Set(data.map(d=>d.date))].sort();
  let streak = 1, maxStreak = 1, cur = 1;
  for (let i=1;i<days.length;i++) {
    const diff=(new Date(days[i])-new Date(days[i-1]))/86400000;
    if (diff===1) { cur++; if(cur>maxStreak) maxStreak=cur; } else cur=1;
  }
  const today=new Date().toISOString().split('T')[0];
  let currentStreak=0;
  for (let i=days.length-1;i>=0;i--) {
    const diff=(new Date(today)-new Date(days[i]))/86400000;
    if (diff<=currentStreak+1) currentStreak++; else break;
  }

  const achieved = getGoals().filter(g=>totalProfit>=g.target).length;
  const badges = [
    {icon:'🔥', label:`${currentStreak}-Day Streak`,    sub:'Consecutive days tracked'},
    {icon:'📅', label:`${months} Month${months!==1?'s':''} Tracked`, sub:'Consistency milestone'},
    {icon:'💰', label:`${fmt(totalIncome)} Earned`,     sub:'Total income recorded'},
    {icon:'📝', label:`${data.length} Transactions`,    sub:'Total entries logged'},
    {icon:'💹', label:`${savingsRate.toFixed(1)}% Savings Rate`, sub:savingsRate>=20?'🌟 Above target!':'Target: 20%+'},
    {icon:'🏆', label:`${achieved} Goal${achieved!==1?'s':''} Achieved`, sub:'Savings targets completed'}
  ];
  el.innerHTML=badges.map(b=>`
    <div class="streak-badge">
      <div class="streak-icon">${b.icon}</div>
      <div class="streak-info"><strong>${b.label}</strong><small>${b.sub}</small></div>
    </div>`).join('');
}

// ─── EXPORT / IMPORT ─────────────────────────────────────────
async function downloadPDF() {
  const data = getData();
  if (!data.length) { showNotification('⚠️ No data to export'); return; }
  const {jsPDF} = window.jspdf;
  const doc     = new jsPDF();
  const cur     = currency();

  doc.setFont('helvetica','bold'); doc.setFontSize(20);
  doc.text('FinPro – Financial Report', 20, 22);
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}  |  Entries: ${data.length}`, 20, 30);

  const totalIncome  = data.reduce((s,d)=>s+Number(d.income),0);
  const totalExpense = data.reduce((s,d)=>s+Number(d.expense),0);
  const totalProfit  = data.reduce((s,d)=>s+Number(d.profit),0);

  doc.setFillColor(235,235,255); doc.rect(16,36,178,18,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text(`Income: ${cur}${totalIncome.toFixed(2)}   |   Expense: ${cur}${totalExpense.toFixed(2)}   |   Net Profit: ${cur}${totalProfit.toFixed(2)}`, 20, 48);

  let y=66;
  doc.setFont('helvetica','bold'); doc.setFontSize(9);
  ['Date','Type','Category','Income','Expense','Profit','Note'].forEach((h,i)=>{
    doc.text(h, [16,36,56,88,120,152,176][i], y);
  });
  doc.line(16,y+2,194,y+2); y+=8;
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  data.forEach(item=>{
    if(y>278) { doc.addPage(); y=20; }
    const row = [formatDate(item.date,true), item.type, item.category,
      item.income>0?`${cur}${Number(item.income).toFixed(0)}`:'—',
      item.expense>0?`${cur}${Number(item.expense).toFixed(0)}`:'—',
      `${item.profit>=0?'+':''}${cur}${Number(item.profit).toFixed(0)}`,
      (item.note||'').substring(0,18)];
    [16,36,56,88,120,152,176].forEach((x,i)=>doc.text(String(row[i]),x,y));
    y+=6;
  });
  doc.save('FinPro_Report.pdf');
  showNotification('📄 PDF downloaded!');
}

function exportExcel() {
  const data = getData();
  if (!data.length) { showNotification('⚠️ No data to export'); return; }
  const ws = XLSX.utils.json_to_sheet(data.map(d=>({
    Date:d.date, Type:d.type, Category:d.category,
    Income:d.income, Expense:d.expense, Profit:d.profit, Note:d.note||''
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Transactions');
  XLSX.writeFile(wb,'FinPro_Data.xlsx');
  showNotification('📊 Excel downloaded!');
}

function exportJSON() {
  const payload = {data:getData(),budgets:getBudgets(),goals:getGoals(),recurring:getRecurring(),exported:new Date().toISOString(),version:'2.0'};
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  a.download = 'FinPro_Backup.json'; a.click();
  showNotification('💾 Backup exported!');
}

function importJSON(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const p = JSON.parse(e.target.result);
      if (p.data)      setData(p.data);
      if (p.budgets)   setBudgets(p.budgets);
      if (p.goals)     setGoals(p.goals);
      if (p.recurring) setRecurring(p.recurring);
      showNotification('✅ Data imported!');
      refreshAll();
    } catch { showNotification('❌ Invalid JSON file'); }
  };
  reader.readAsText(file);
  event.target.value='';
}

function importCSV(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines  = e.target.result.trim().split('\n');
    const header = lines[0].toLowerCase().split(',').map(h=>h.trim().replace(/"/g,''));
    const idx    = k => header.indexOf(k);
    if (idx('date')<0||idx('amount')<0) { showNotification('❌ CSV needs "date" and "amount" columns'); return; }
    const data = getData(); let added=0;
    lines.slice(1).forEach(line=>{
      if (!line.trim()) return;
      const cols    = line.split(',').map(c=>c.trim().replace(/"/g,''));
      const amount  = parseFloat(cols[idx('amount')]);
      const type    = idx('type')>=0?cols[idx('type')].toLowerCase():'expense';
      const category= idx('category')>=0?cols[idx('category')]:'Other';
      const note    = idx('note')>=0?cols[idx('note')]:'';
      const date    = cols[idx('date')];
      if (!amount||!date) return;
      const income=type==='income'?amount:0, expense=type==='expense'?amount:0;
      data.push({date,income,expense,profit:income-expense,category,note,type,id:Date.now()+added++});
    });
    setData(data); showNotification(`✅ Imported ${added} transaction${added!==1?'s':''}`); refreshAll();
  };
  reader.readAsText(file); event.target.value='';
}

function downloadCSVTemplate() {
  const csv='date,type,amount,category,note\n2024-01-01,income,50000,Salary,January salary\n2024-01-05,expense,2000,Food,Groceries\n2024-01-10,expense,15000,Rent,Monthly rent';
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='FinPro_Template.csv'; a.click();
  showNotification('📄 CSV template downloaded');
}

// ─── CONFETTI ────────────────────────────────────────────────
function fireConfetti() {
  const colors=['#6c63ff','#00e676','#ff9800','#00e5ff','#ffd740','#ff5252'];
  for (let i=0;i<80;i++) {
    const el=document.createElement('div');
    el.className='confetti-piece';
    el.style.cssText=`left:${Math.random()*100}vw;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*0.6}s;transform:rotate(${Math.random()*360}deg);border-radius:${Math.random()>0.5?'50%':'2px'};`;
    document.body.appendChild(el);
    el.addEventListener('animationend',()=>el.remove());
  }
}

// ─── PRINT ───────────────────────────────────────────────────
function printReport() { navigateTo('reports'); setTimeout(()=>window.print(),400); }
function injectPrintButton() {
  const hdr = document.querySelector('#page-reports .page-header');
  if (!hdr || hdr.querySelector('.print-btn')) return;
  const btn = document.createElement('button');
  btn.className='btn btn-outline print-btn';
  btn.innerHTML='<i class="fa-solid fa-print"></i> Print';
  btn.onclick=printReport;
  hdr.appendChild(btn);
}

// ─── UTILITY ─────────────────────────────────────────────────
function showNotification(msg) {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 3200);
}

function formatDate(str, short=false) {
  if (!str) return '';
  const d = new Date(str.length===10?str+'T00:00:00':str);
  if (short) return d.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'2-digit'});
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}

// ─── SERVICE WORKER ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}

// ============================================================
//  POLISH PASS – Sample Data, Welcome Banner, Tag Colors,
//  Chart Dark Mode, Negative Fix, Misc UX
// ============================================================

// ─── SAMPLE DATA (first-time users) ─────────────────────────
function loadSampleData() {
  if (!confirm('Load sample data to explore the app?\nThis will add demo transactions, budgets and goals.')) return;

  const today = new Date();
  const d = (offset, mo=0) => {
    const x = new Date(today);
    x.setMonth(x.getMonth() - mo);
    x.setDate(x.getDate() - offset);
    return x.toISOString().split('T')[0];
  };

  const sample = [
    // This month
    {date:d(0),  income:55000, expense:0,     profit:55000,  category:'Salary',        note:'Monthly salary',       type:'income'},
    {date:d(1),  income:0,     expense:12000, profit:-12000, category:'Rent',           note:'House rent',           type:'expense'},
    {date:d(2),  income:0,     expense:3200,  profit:-3200,  category:'Food',           note:'Groceries',            type:'expense'},
    {date:d(3),  income:0,     expense:800,   profit:-800,   category:'Entertainment',  note:'Netflix + Spotify',    type:'expense'},
    {date:d(4),  income:0,     expense:1500,  profit:-1500,  category:'Travel',         note:'Commute & petrol',     type:'expense'},
    {date:d(5),  income:8000,  expense:0,     profit:8000,   category:'Freelance',      note:'Logo design project',  type:'income'},
    {date:d(6),  income:0,     expense:2100,  profit:-2100,  category:'Shopping',       note:'Clothes & accessories',type:'expense'},
    {date:d(8),  income:0,     expense:600,   profit:-600,   category:'Medical',        note:'Pharmacy',             type:'expense'},
    {date:d(10), income:0,     expense:1800,  profit:-1800,  category:'Food',           note:'Restaurants',          type:'expense'},
    {date:d(12), income:5000,  expense:0,     profit:5000,   category:'Investment',     note:'Dividend received',    type:'income'},
    // Last month
    {date:d(5,1),  income:55000, expense:0,     profit:55000,  category:'Salary',      note:'Monthly salary',       type:'income'},
    {date:d(6,1),  income:0,     expense:12000, profit:-12000, category:'Rent',         note:'House rent',           type:'expense'},
    {date:d(7,1),  income:0,     expense:4100,  profit:-4100,  category:'Food',         note:'Groceries + dining',   type:'expense'},
    {date:d(8,1),  income:0,     expense:2200,  profit:-2200,  category:'Shopping',     note:'Amazon order',         type:'expense'},
    {date:d(9,1),  income:0,     expense:1200,  profit:-1200,  category:'Travel',       note:'Weekend trip',         type:'expense'},
    {date:d(10,1), income:6000,  expense:0,     profit:6000,   category:'Freelance',    note:'Web dev project',      type:'income'},
    {date:d(15,1), income:0,     expense:900,   profit:-900,   category:'Entertainment',note:'Movie tickets',        type:'expense'},
    // 2 months ago
    {date:d(5,2),  income:55000, expense:0,     profit:55000,  category:'Salary',      note:'Monthly salary',       type:'income'},
    {date:d(6,2),  income:0,     expense:12000, profit:-12000, category:'Rent',         note:'House rent',           type:'expense'},
    {date:d(7,2),  income:0,     expense:3800,  profit:-3800,  category:'Food',         note:'Groceries',            type:'expense'},
    {date:d(8,2),  income:0,     expense:1600,  profit:-1600,  category:'Travel',       note:'Cab & petrol',         type:'expense'},
    {date:d(10,2), income:4500,  expense:0,     profit:4500,   category:'Freelance',    note:'Content writing',      type:'income'},
    {date:d(12,2), income:0,     expense:700,   profit:-700,   category:'Medical',      note:'Doctor visit',         type:'expense'},
  ].map((e,i) => ({...e, id: Date.now() + i}));

  setData(sample);

  setBudgets({ Food: 5000, Rent: 13000, Shopping: 3000, Entertainment: 1500, Travel: 2500, Medical: 1000 });

  setGoals([
    { id: Date.now()+1, name: 'Emergency Fund',  target: 100000, icon: '🏥', date: '', created: new Date().toISOString() },
    { id: Date.now()+2, name: 'New Laptop',       target: 80000,  icon: '💻', date: '', created: new Date().toISOString() },
    { id: Date.now()+3, name: 'Vacation to Goa',  target: 30000,  icon: '✈️', date: '', created: new Date().toISOString() },
  ]);

  setRecurring([
    { id: Date.now()+1, name: 'Netflix',   amount: 649,   category: 'Entertainment', freq: 'monthly', type: 'expense', due: d(-5),  active: true },
    { id: Date.now()+2, name: 'Salary',    amount: 55000, category: 'Salary',        freq: 'monthly', type: 'income',  due: d(-25), active: true },
    { id: Date.now()+3, name: 'Gym',       amount: 1200,  category: 'Medical',       freq: 'monthly', type: 'expense', due: d(-3),  active: true },
    { id: Date.now()+4, name: 'Amazon Prime', amount: 299, category: 'Entertainment',freq: 'yearly',  type: 'expense', due: d(-60), active: true },
  ]);

  showNotification('🎉 Sample data loaded! Explore your dashboard.');
  refreshAll();
  navigateTo('dashboard');
}

// ─── WELCOME BANNER (first visit) ────────────────────────────
function checkFirstVisit() {
  if (getData().length === 0 && !localStorage.getItem('fp_welcomed')) {
    const banner = document.createElement('div');
    banner.id = 'welcomeBanner';
    banner.innerHTML = `
      <div class="welcome-banner">
        <div class="welcome-content">
          <div class="welcome-icon">👋</div>
          <div>
            <h3>Welcome to FinPro!</h3>
            <p>Your personal finance dashboard. Add your first transaction or load sample data to get started.</p>
          </div>
        </div>
        <div class="welcome-actions">
          <button class="btn btn-primary" onclick="openModal('addTransactionModal'); dismissWelcome()">
            <i class="fa-solid fa-plus"></i> Add First Transaction
          </button>
          <button class="btn btn-outline" onclick="loadSampleData(); dismissWelcome()">
            <i class="fa-solid fa-database"></i> Load Sample Data
          </button>
          <button class="btn btn-outline" onclick="dismissWelcome()" style="padding:10px 12px">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;
    const main = document.getElementById('page-dashboard');
    if (main) main.prepend(banner);
  }
}

function dismissWelcome() {
  localStorage.setItem('fp_welcomed', '1');
  const b = document.getElementById('welcomeBanner');
  if (b) b.remove();
}

// ─── CATEGORY COLOR MAP ──────────────────────────────────────
const CAT_COLORS = {
  Food: '#ff9800', Travel: '#00e5ff', Rent: '#9c27b0',
  Shopping: '#e91e63', Salary: '#00e676', Freelance: '#69f0ae',
  Investment: '#6c63ff', Medical: '#ff5252', Entertainment: '#ffd740', Other: '#9198b5'
};

// Inject colored dot before category badges in table
function colorBadges() {
  document.querySelectorAll('.badge-cat').forEach(el => {
    const cat = el.textContent.replace(/[^\w]/g,'').trim();
    const color = CAT_COLORS[cat] || '#9198b5';
    if (!el.style.color) el.style.color = color;
    el.style.background = color + '18';
  });
}

// ─── PATCH renderHistory to call colorBadges ─────────────────
// Wrap renderHistory to apply color badges after every render
(function() {
  const _rh = renderHistory;
  renderHistory = function(d) { _rh(d); setTimeout(colorBadges, 50); };
})();

// ─── CHART DARK/LIGHT AWARE GRID COLORS ──────────────────────
function getGridColor() {
  return document.body.classList.contains('light')
    ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)';
}
function getTickColor() {
  return document.body.classList.contains('light') ? '#5a6180' : '#9198b5';
}

// ─── PROFIT/LOSS CELL COLORIZER ──────────────────────────────
// Already done inline in renderHistory but let's ensure negative shows correctly
// fmt() already handles sign via the caller; this is a safety pass.

// ─── TRANSACTION COUNT BADGE ON NAV ──────────────────────────
function updateNavBadges() {
  const count = getData().length;
  const recurDue = getRecurring().filter(r => {
    const d = new Date(r.due); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return (d - t) / 86400000 <= 3;
  }).length;

  // Add/update badge on recurring nav
  const recNav = document.querySelector('[data-page="recurring"]');
  if (recNav) {
    let badge = recNav.querySelector('.nav-badge');
    if (recurDue > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nav-badge';
        recNav.appendChild(badge);
      }
      badge.textContent = recurDue;
    } else if (badge) badge.remove();
  }
}

// ─── EXPORT: COPY TABLE TO CLIPBOARD ─────────────────────────
function copyTableToClipboard() {
  const data = getData();
  if (!data.length) { showNotification('No data to copy'); return; }
  const rows = [['Date','Type','Category','Income','Expense','Profit','Note']];
  data.forEach(d => rows.push([d.date, d.type, d.category, d.income, d.expense, d.profit, d.note||'']));
  const text = rows.map(r => r.join('\t')).join('\n');
  navigator.clipboard.writeText(text).then(() => showNotification('📋 Table copied to clipboard!'));
}

// ─── ANALYTICS: TOGGLE CHART TYPE ────────────────────────────
function toggleChartType(canvasId, newType) {
  // Placeholder — called from analytics toggles added below
  showNotification('Chart type toggled');
}

// ─── SUMMARY CARD CLICK → NAVIGATE ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.title = 'Click to view transactions';
    card.addEventListener('click', () => navigateTo('transactions'));
  });
});

// ─── FINAL INIT ADDITIONS ────────────────────────────────────
(function() {
  const _orig = refreshAll;
  refreshAll = function() {
    _orig();
    updateNavBadges();
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  checkFirstVisit();
});
