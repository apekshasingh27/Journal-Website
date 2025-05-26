document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("moodForm");
  const entriesList = document.getElementById("entriesList");
  const showGraphBtn = document.getElementById("showGraphBtn");
  const chartContainer = document.getElementById("chartContainer");
  const closeGraphBtn = document.getElementById("closeGraph");
  let moodChart;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("entryTitle").value;
    const mood = document.getElementById("moodSelect").value;
    const date = document.getElementById("entryDate").value;
    const text = document.getElementById("entryText").value;
    const sleep = document.getElementById("sleepHours").value;

    const entry = { title, mood, date, text, sleep };

    saveEntry(entry);
    form.reset();
  });

  function saveEntry(entry) {
    let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    entries.push(entry);
    localStorage.setItem("moodEntries", JSON.stringify(entries));
    displayEntries();
  }

   function displayEntries() {
    let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    entriesList.innerHTML = "";
    // Reverse for recent first, but preserve original indexes for editing
    entries.slice().reverse().forEach((entry, index) => {
      const div = document.createElement("div");
      div.className = "entry";
      div.innerHTML = `<strong>${entry.title}</strong> - ${entry.mood}<br>${entry.date} | Sleep: ${entry.sleep}h<br>${entry.text}`;
      div.style.cursor = "pointer";

      // Add click event to show modal with this entry's data
      div.addEventListener("click", () => {
        // Since reversed, adjust index to get actual in original array
        const realIndex = entries.length - 1 - index;
        showEntryModal(entries[realIndex], realIndex);
      });

      entriesList.appendChild(div);
    });
  }

  displayEntries();

  showGraphBtn.addEventListener("click", () => {
  let data = JSON.parse(localStorage.getItem("moodEntries")) || [];

  // 🔥 Sort by date (ascending)
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = data.map((e) => e.date);
  const moods = data.map((e) => moodToNumber(e.mood));

  if (moodChart) moodChart.destroy();

  moodChart = new Chart(document.getElementById("moodChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Mood Level",
          data: moods,
          borderColor: "#4CAF50",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Date"
          }
        },
        y: {
          title: {
            display: true,
            text: "Mood Level (1–5)"
          },
          ticks: {
            stepSize: 1,
            min: 1,
            max: 5
          }
        }
      }
    }
  });

  chartContainer.style.display = "block";
  chartContainer.scrollIntoView({ behavior: "smooth" });

});

  

  closeGraphBtn.addEventListener("click", () => {
    chartContainer.style.display = "none";
  });

  function moodToNumber(mood) {
    const moodMap = {
      Happy: 5,
      Calm: 4,
      Bored: 3,
      Anxious: 2,
      Sad: 1,
    };
    return moodMap[mood] || 0;
  }

const modal = document.getElementById("entryModal");
const modalDate = document.getElementById("modal-date");
const modalText = document.getElementById("modal-text");
const editBtn = document.getElementById("editBtn");
let currentEditIndex = null;  // Track which entry is being edited
// Assume this gets called on a click from some mood entry
function showEntryModal(entry, index) {
    modalDate.textContent = entry.date;
    modalText.innerHTML = `<strong>Title:</strong> ${entry.title}<br>
                           <strong>Mood:</strong> ${entry.mood}<br>
                           <strong>Sleep Hours:</strong> ${entry.sleep}h<br>
                           <p>${entry.text}</p>`;
    modal.style.display = "block";
    currentEditIndex = index;
  }

  // Close modal X button
  document.querySelector(".closebtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Click outside modal to close
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  // Edit button functionality - load entry back to form
  editBtn.addEventListener("click", () => {
    if (currentEditIndex === null) return;

    let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    let entry = entries[currentEditIndex];

    // Fill form inputs with the entry data
    document.getElementById("entryTitle").value = entry.title;
    document.getElementById("moodSelect").value = entry.mood;
    document.getElementById("entryDate").value = entry.date;
    document.getElementById("entryText").value = entry.text;
    document.getElementById("sleepHours").value = entry.sleep;

    // Hide modal
    modal.style.display = "none";

    // Change form submit to update instead of add
    form.removeEventListener("submit", formSubmitHandler); // Remove old listener if any
    form.addEventListener("submit", updateSubmitHandler);
  });


  const deleteBtn = document.getElementById("deleteBtn");

deleteBtn.addEventListener("click", () => {
  if (currentEditIndex === null) return;

  let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];

  // Confirm before deleting — don’t be savage without warning
  if (confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
    entries.splice(currentEditIndex, 1); // Remove the entry at current index
    localStorage.setItem("moodEntries", JSON.stringify(entries));
    displayEntries();
    modal.style.display = "none";
    currentEditIndex = null;

    // Reset form if it was in edit mode
    form.reset();
    form.removeEventListener("submit", updateSubmitHandler);
    form.addEventListener("submit", formSubmitHandler);
  }
});

  // Original form submit handler
  function formSubmitHandler(e) {
    e.preventDefault();
    const newEntry = getFormData();
    saveEntry(newEntry);
    form.reset();
  }

  // New form submit handler for updating
  function updateSubmitHandler(e) {
    e.preventDefault();
    if (currentEditIndex === null) return;

    let entries = JSON.parse(localStorage.getItem("moodEntries")) || [];
    entries[currentEditIndex] = getFormData();
    localStorage.setItem("moodEntries", JSON.stringify(entries));
    displayEntries();
    form.reset();

    // Reset submit back to original add handler
    form.removeEventListener("submit", updateSubmitHandler);
    form.addEventListener("submit", formSubmitHandler);
    currentEditIndex = null;
  }

  // Helper to get form data
  function getFormData() {
    return {
      title: document.getElementById("entryTitle").value,
      mood: document.getElementById("moodSelect").value,
      date: document.getElementById("entryDate").value,
      text: document.getElementById("entryText").value,
      sleep: document.getElementById("sleepHours").value,
    };
  }

  // Setup initial form listener
  form.addEventListener("submit", formSubmitHandler);

  // Finally, display entries initially
  displayEntries();
});
