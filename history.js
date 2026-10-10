const STORAGE_KEY = "frog_travel_logs";
const PAGE_SIZE = 10;
let currentPage = 1;

const tbody = document.getElementById("history-table-body");
const total = document.getElementById("history-total");
const pageInfo = document.getElementById("page-info");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");

function getLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function renderHistory() {
  const logs = getLogs()
    .map((log, index) => ({ ...log, originalIndex: index }))
    .sort((a, b) => b.date.localeCompare(a.date) || b.originalIndex - a.originalIndex);

  const pageCount = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(currentPage, 1), pageCount);
  const pageLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  tbody.replaceChildren();

  for (const log of pageLogs) {
    const tr = document.createElement("tr");
    const prefCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const actionCell = document.createElement("td");

    prefCell.textContent = log.pref;
    dateCell.textContent = log.date;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "削除";

    deleteBtn.addEventListener("click", () => {
      if (!confirm(`${log.pref}（${log.date}）の訪問履歴を削除しますか？`)) return;

      const saved = getLogs();
      saved.splice(log.originalIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

      renderHistory();
    });

    actionCell.appendChild(deleteBtn);
    tr.append(prefCell, dateCell, actionCell);
    tbody.appendChild(tr);
  }

  if (logs.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");

    td.colSpan = 3;
    td.textContent = "まだ訪問履歴がありません。";

    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  total.textContent = `全${logs.length}件`;
  pageInfo.textContent = `${currentPage} / ${pageCount} ページ`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === pageCount;
}

prevBtn.addEventListener("click", () => {
  currentPage--;
  renderHistory();
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  renderHistory();
});

renderHistory();