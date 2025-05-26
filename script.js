window.onload = function () {
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("date");

  dateInput.value = today;        // Set default to today
  dateInput.max = today;          // Disable future dates

  loadEntries();
  updateMoodChart();
  setTimeframe('week'); // initialize with week selected

};


function saveEntry() {
  const title = document.getElementById("title").value;
  const mood = document.getElementById("mood").value;
  const date = document.getElementById("date").value;
  const note = document.getElementById("note").value;
  const sleep = document.getElementById("sleep").value;

  if (!mood || !note) {
    alert("Please select a mood and write a note.");
    return;
  }

  const entry = {
    id: Date.now(),
    title,
    mood,
    date,
    note,
    sleep
  };

  let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  entries.unshift(entry);
  localStorage.setItem("moodEntries", JSON.stringify(entries));

  loadEntries();

  // Clear fields
  document.getElementById("title").value = "";
  document.getElementById("mood").value = "";
  document.getElementById("note").value = "";
  document.getElementById("sleep").value = 0;
  document.getElementById("date").valueAsDate = new Date();
}

function loadEntries() {
  const entriesDiv = document.getElementById("entries");
  entriesDiv.innerHTML = "";

  const entries = JSON.parse(localStorage.getItem("moodEntries")) || [];

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
    <div class="delete-icon" onclick="confirmDelete(${entry.id})">🗑️</div>
    <strong>${entry.title || "Untitled"} - ${entry.mood}</strong><br>
    <small>${entry.date} | Sleep: ${entry.sleep}h</small>
    <p>${entry.note}</p>
    `
    ;
    entriesDiv.appendChild(div);
  });
}

function confirmDelete(id) {
  const confirmResult = confirm("Are you sure you want to delete this entry?");
  if (confirmResult) {
    deleteEntry(id);
  }
}

function deleteEntry(id) {
  let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
  entries = entries.filter(entry => entry.id !== id);
  localStorage.setItem("moodEntries", JSON.stringify(entries));
  loadEntries();
}
function updateMoodChart(timeframe = 'week') {
  const entries = JSON.parse(localStorage.getItem("moodEntries")) || [];

  const now = new Date();
  let filtered = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    if (timeframe === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return entryDate >= oneWeekAgo && entryDate <= now;
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return entryDate >= oneMonthAgo && entryDate <= now;
    }
    return false;
  });

  const moodCounts = {};
  filtered.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  const labels = Object.keys(moodCounts);
  const data = Object.values(moodCounts);

  if (window.moodChartInstance) {
    window.moodChartInstance.destroy(); // clear old chart
  }

  const ctx = document.getElementById('moodChart').getContext('2d');
  window.moodChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Mood Frequency (${timeframe})`,
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1
        }
      }
    }
  });
}
function setTimeframe(timeframe) {
  document.getElementById("weekBtn").classList.remove("active");
  document.getElementById("monthBtn").classList.remove("active");
  document.getElementById(`${timeframe}Btn`).classList.add("active");

  updateMoodChart(timeframe);
}



