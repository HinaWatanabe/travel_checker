const prefs = [
    "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
    "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
    "新潟県","富山県","石川県","福井県","山梨県","長野県",
    "岐阜県","静岡県","愛知県","三重県",
    "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
    "鳥取県","島根県","岡山県","広島県","山口県",
    "徳島県","香川県","愛媛県","高知県",
    "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
  ];

  const prefCodeMap = {
    "北海道": "01",
    "青森県": "02",
    "岩手県": "03",
    "宮城県": "04",
    "秋田県": "05",
    "山形県": "06",
    "福島県": "07",
    "茨城県": "08",
    "栃木県": "09",
    "群馬県": "10",
    "埼玉県": "11",
    "千葉県": "12",
    "東京都": "13",
    "神奈川県": "14",
    "新潟県": "15",
    "富山県": "16",
    "石川県": "17",
    "福井県": "18",
    "山梨県": "19",
    "長野県": "20",
    "岐阜県": "21",
    "静岡県": "22",
    "愛知県": "23",
    "三重県": "24",
    "滋賀県": "25",
    "京都府": "26",
    "大阪府": "27",
    "兵庫県": "28",
    "奈良県": "29",
    "和歌山県": "30",
    "鳥取県": "31",
    "島根県": "32",
    "岡山県": "33",
    "広島県": "34",
    "山口県": "35",
    "徳島県": "36",
    "香川県": "37",
    "愛媛県": "38",
    "高知県": "39",
    "福岡県": "40",
    "佐賀県": "41",
    "長崎県": "42",
    "熊本県": "43",
    "大分県": "44",
    "宮崎県": "45",
    "鹿児島県": "46",
    "沖縄県": "47"
  };

  const STORAGE_KEY = "frog_travel_logs";
  let editMode = false;

  document.addEventListener("DOMContentLoaded", async() => {
    const prefSelect   = document.getElementById("pref-select");
    const visitDate    = document.getElementById("visit-date");
    const addBtn       = document.getElementById("add-btn");
    const visitTbody   = document.getElementById("visit-table-body");
    const frogTbody    = document.getElementById("frog-stats-body");
    const frogRec      = document.getElementById("frog-rec");


    prefs.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      prefSelect.appendChild(opt);
    });

    function addRow(pref, date, index) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pref}</td>
        <td>${date}</td>
        <td>
          <button class="delete-btn" data-index="${index}" style="display: ${editMode ? 'inline' : 'none'};">削除</button>
        </td>
      `;
      visitTbody.appendChild(tr);
    } 

    const savedLogs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    savedLogs.forEach(({pref, date}, index) => {
      addRow(pref, date, index);
    });

    //表に都道府県と日付を追加
    addBtn.addEventListener("click", () => {
      const pref = prefSelect.value;
      const date = visitDate.value;

      if(!pref || !date) {
        alert("都道府県または日付が入力されていません");
        return;
      };

      //const tr = document.createElement("tr");
      //tr.innerHTML = `<td>${pref}</td><td>${date}</td>`;
      //visitTbody.appendChild(tr);

      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      logs.push({pref, date});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

      addRow(pref, date, logs.length - 1);

      updateFrogStats();
      updateMapColors();

      prefSelect.value = "";
      visitDate.value = "";
    });

    //編集モード
    const editBtn = document.getElementById("edit-mode");
    editBtn.addEventListener("click", () => {
      editMode = !editMode;
      editBtn.textContent = editMode ? "編集モードを終了する" : "編集";

      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.style.display = editMode ? "inline" : "none";
      })
    })

    //削除モード
    visitTbody.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const index = parseInt(e.target.dataset.index);
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
        logs.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    
        location.reload();
      }
    });

    function countVisits(logs){
      const counts = {};
      logs.forEach(({pref}) => {
        counts[pref] = (counts[pref]  || 0) +1;
      });
      return counts;
    }

    function getFrogStage(count) {
      if (count === 0) return "🥚";
      if (count === 1) return "🐣"; // おたまじゃくし代用
      return "🐸";
    }

    function updateFrogStats() {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const counts = countVisits(logs);
    
      frogTbody.innerHTML = "";
    
      prefs.forEach(pref => {
        const count = counts[pref] || 0;
        const stage = getFrogStage(count);
    
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${pref}</td>
          <td>${count} 回</td>
          <td>${stage}</td>
        `;
        frogTbody.appendChild(tr);
      });
    }

    updateFrogStats();

    const map = "./map-full.svg";
    const container = document.querySelector('#map');
  
    const res = await fetch(map);
    if (res.ok) {
      const svg = await res.text();
      container.innerHTML = svg;
  
      updateMapColors();
    }

    async function updateMapColors() {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const counts = countVisits(logs);
    
      prefs.forEach(pref => {
        const code = prefCodeMap[pref];
        const path = document.querySelector(`[data-code="${code}"]`);
        if (!path) return;
    
        if (counts[pref]) {
          path.style.fill = "#4CAF50";
        } else {
          path.style.fill = "#ccc";
        }
      });
    }
    
  });
