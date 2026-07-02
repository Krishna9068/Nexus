// Database Structure: { "2026-06-04": [ {name: "Math", status: "present"}, {name: "History", status: "absent"} ] }
let trackerData = JSON.parse(localStorage.getItem('studentTrackerData')) || {};

// Set the date input to today's date automatically on load
window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    loadDayData();
};

// Load and render classes for the chosen date
function loadDayData() {
    const selectedDate = document.getElementById('attendance-date').value;
    const listContainer = document.getElementById('day-classes-list');
    listContainer.innerHTML = "";

    if (!selectedDate) return;

    // If no classes exist for this date yet, initialize an empty array
    if (!trackerData[selectedDate]) {
        trackerData[selectedDate] = [];
    }

    // Render each class active on this day
    trackerData[selectedDate].forEach((cls, index) => {
        const div = document.createElement('div');
        div.classList.add('class-item');
        div.innerHTML = `
            <span><strong>${cls.name}</strong></span>
            <div class="btn-group">
                <button class="${cls.status === 'present' ? 'p-active' : ''}" onclick="updateStatus('${selectedDate}', ${index}, 'present')">P</button>
                <button class="${cls.status === 'absent' ? 'a-active' : ''}" onclick="updateStatus('${selectedDate}', ${index}, 'absent')">A</button>
                <button class="${cls.status === 'holiday' ? 'h-active' : ''}" onclick="updateStatus('${selectedDate}', ${index}, 'holiday')">H</button>
                <button class="delete-btn" onclick="deleteClass('${selectedDate}', ${index})">🗑️</button>
            </div>
        `;
        listContainer.appendChild(div);
    });

    calculateStats();
}

// Add a new class to the selected date
function addClass() {
    const selectedDate = document.getElementById('attendance-date').value;
    const input = document.getElementById('subject-input');
    const className = input.value.trim();

    if (!selectedDate) return alert("Please select a date first!");
    if (!className) return alert("Please enter a subject name!");

    // Default status is 'present'
    trackerData[selectedDate].push({ name: className, status: 'present' });
    input.value = "";
    
    saveAndRefresh();
}

// Update the P/A/H status of a specific class
function updateStatus(date, index, status) {
    trackerData[date][index].status = status;
    saveAndRefresh();
}

// Delete a class from a specific day
function deleteClass(date, index) {
    trackerData[date].splice(index, 1);
    saveAndRefresh();
}

// Save to LocalStorage and refresh layout
function saveAndRefresh() {
    localStorage.setItem('studentTrackerData', JSON.stringify(trackerData));
    loadDayData();
}

// Process data structures to calculate statistics
function calculateStats() {
    let globalPresent = 0;
    let globalTotal = 0;
    let subjectMetrics = {}; // Format: { "Math": {present: 2, total: 3} }

    // Loop through all saved dates in storage
    for (let date in trackerData) {
        trackerData[date].forEach(cls => {
            if (cls.status === 'holiday') return; // Ignore holidays in statistics

            // Initialize subject tracker if it's new
            if (!subjectMetrics[cls.name]) {
                subjectMetrics[cls.name] = { present: 0, total: 0 };
            }

            subjectMetrics[cls.name].total++;
            globalTotal++;

            if (cls.status === 'present') {
                subjectMetrics[cls.name].present++;
                globalPresent++;
            }
        });
    }

    // Calculate & Display Overall Percentage
    const overallPct = globalTotal === 0 ? 0 : Math.round((globalPresent / globalTotal) * 100);
    document.getElementById('overall-pct').innerText = overallPct + "%";

    // Build Individual Subject Dashboard Items
    const statsContainer = document.getElementById('subject-stats');
    statsContainer.innerHTML = "";

    for (let subName in subjectMetrics) {
        const p = subjectMetrics[subName].present;
        const t = subjectMetrics[subName].total;
        const pct = t === 0 ? 0 : Math.round((p / t) * 100);

        const row = document.createElement('div');
        row.classList.add('stat-row');
        row.innerHTML = `
            <span>${subName}</span>
            <span><strong>${pct}%</strong> (${p}/${t})</span>
        `;
        statsContainer.appendChild(row);
    }
}






/* backup */

// Function to download data as a .json file
function exportData() {
    // 1. Grab data from trackerData object (or localStorage)
    const dataStr = JSON.stringify(trackerData, null, 2); // format cleanly with 2 spaces
    
    // 2. Convert text string into a temporary downloadable file blob
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    
    // 3. Create a temporary download link element in the background
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    
    // 4. Name the backup file with today's date (e.g., attendance_backup_2026-06-14.json)
    const todayStr = new Date().toISOString().split('T')[0];
    link.download = `attendance_backup_${todayStr}.json`;
    link.href = url;
    
    // 5. Force the browser to trigger the download prompt
    link.click();
    
    // 6. Clean up memory
    URL.revokeObjectURL(url);
}

// Function to read a file uploaded by the user and restore it
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Use the native Web File Reader API to parse the uploaded file
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedJSON = JSON.parse(e.target.result);
            
            // Basic data validation checking if the JSON is an object
            if (typeof importedJSON === "object" && importedJSON !== null) {
                if (confirm("Are you sure you want to restore this file? It will overwrite your current attendance tracker data!")) {
                    
                    // Overwrite the in-memory object data state
                    trackerData = importedJSON;
                    
                    // Commit to browser storage and execute recalculations
                    saveAndRefresh();
                    alert("🎉 Attendance records restored successfully!");
                }
            } else {
                alert("Error: File formatting structure is corrupted or invalid.");
            }
        } catch (error) {
            alert("Oops! Failed to parse the file. Please upload a valid .json file generated by this app.");
        }
    };
    
    // Read the uploaded file text
    reader.readAsText(file);
    
    // Clear out input target value so users can upload the exact same file track consecutively if needed
    event.target.value = ""; 
}


/*pin board*/


// State Array Object Array Configuration Matrix State
let pinnedNotes = JSON.parse(localStorage.getItem('studentPinboardData')) || [];

// Default fallback color value assignments (Pastel Yellow Hex Code)
let selectedColorHex = "#fef08a";

// Mount lifecycle processes inside document pipeline engines
window.onload = function() {
    renderNotes();
};

function selectColor(hex, element) {
    selectedColorHex = hex;
    
    // Clear old active selection borders on choice circles
    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
    // Assign active profile styling to target choice node
    element.classList.add('active');
}

function createNote() {
    const textInput = document.getElementById('note-text');
    const message = textInput.value.trim();

    if (!message) {
        alert("Please write something inside the note space before pinning!");
        return;
    }

    // Wrap information variables inside a schema data model
    const newNote = {
        id: Date.now(), // Unique identifier timestamp tracking reference
        text: message,
        color: selectedColorHex
    };

    // Push into app operational memories lists
    pinnedNotes.push(newNote);
    textInput.value = ""; // Clear editor windows values

    saveAndRefreshPinboard();
}

function deleteNote(noteId) {
    // Retain only items whose id parameters do not target matched deletions parameters
    pinnedNotes = pinnedNotes.filter(note => note.id !== noteId);
    saveAndRefreshPinboard();
}

function saveAndRefreshPinboard() {
    localStorage.setItem('studentPinboardData', JSON.stringify(pinnedNotes));
    renderNotes();
}

function renderNotes() {
    const canvas = document.getElementById('pinboard-canvas');
    canvas.innerHTML = ""; // Wipe board before rendering fresh items

    if (pinnedNotes.length === 0) {
        canvas.innerHTML = `<p style="color: #64748b; font-style: italic; margin-top: 40px;">No notes pinned. Add reminders above!</p>`;
        return;
    }

    // Render loop processing for generating visual stickers
    pinnedNotes.forEach(note => {
        const div = document.createElement('div');
        div.classList.add('sticky-note');
        div.style.backgroundColor = note.color; // Inject custom pastel hex

        div.innerHTML = `
            <div class="note-content">${note.text}</div>
            <button class="delete-note-btn" onclick="deleteNote(${note.id})">❌ Clear</button>
        `;
        
        canvas.appendChild(div);
    });
}



/* pin board backup */

// 1. Export: Converts current pinned notes into a downloadable .json file
function exportPinboard() {
    if (pinnedNotes.length === 0) {
        alert("Your pinboard is empty. Add some notes before exporting a backup!");
        return;
    }

    const dataString = JSON.stringify(pinnedNotes, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });
    const fileUrl = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    
    downloadAnchor.download = `pinboard_backup_${today}.json`;
    downloadAnchor.href = fileUrl;
    downloadAnchor.click();
    
    URL.revokeObjectURL(fileUrl);
}

// 2. Import: Reads an uploaded backup file and overwrites the active notes list
function importPinboard(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const parsedData = JSON.parse(e.target.result);
            
            if (Array.isArray(parsedData)) {
                if (confirm("Are you sure you want to restore this file? It will replace all sticky notes currently on your screen!")) {
                    pinnedNotes = parsedData;
                    saveAndRefreshPinboard();
                    alert("🎉 Pinboard notes successfully restored!");
                }
            } else {
                alert("Error: File formatting data is invalid.");
            }
        } catch (err) {
            alert("Failed to read the backup file. Please make sure it's a valid .json file generated by this app.");
        }
    };
    
    fileReader.readAsText(file);
    event.target.value = ""; // Clear file input stream tracker
}



/* quote display */


// 1. Array list storing your 8 curated inspirational quotes and authors
const quotesDatabase = [
    { text: `"Life is what happens to you while you're busy making other plans."`, author: "— John Lennon" },
    { text: `"Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment."`, author: "— Buddha" },
    { text: `"The purpose of life is to live it, to taste it to the utmost, to reach out eagerly and without fear for newer and richer experience."`, author: "— Eleanor Roosevelt" },
    { text: `"Discipline is choosing between what you want now and what you want most."`, author: "— Abraham Lincoln" },
    { text: `"We are what we repeatedly do. Excellence, then, is not an act, but a habit."`, author: "— Aristotle" },
    { text: `"It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change."`, author: "— Charles Darwin" },
    { text: `"We cannot direct the wind, but we can adjust the sails."`, author: "— Dolly Parton" },
    { text: `"Be alone, that is the secret of invention; Be alone—that is when ideas are born."`, author: "— Nikola Tesla" }
];

let currentQuoteIndex = 0;

// 2. Function to cycle texts and smoothly push modifications to the UI view screen
function rotateQuote() {
    // Advance tracking matrix index counter pointer
    currentQuoteIndex = (currentQuoteIndex + 1) % quotesDatabase.length;
    
    const quoteTextField = document.getElementById('quote-text');
    const quoteAuthorField = document.getElementById('quote-author');
    const cardElement = document.getElementById('rotating-quote-card');

    if (quoteTextField && quoteAuthorField && cardElement) {
        // Add a quick, subtle fade out effect reset trigger
        cardElement.style.opacity = 0;
        
        setTimeout(() => {
            // Update textual elements with new index references
            quoteTextField.innerHTML = quotesDatabase[currentQuoteIndex].text;
            quoteAuthorField.innerHTML = quotesDatabase[currentQuoteIndex].author;
            
            // Fade card back into clear focus
            cardElement.style.opacity = 1;
        }, 200); // 200ms delay to allow text change to happen invisibly while transparent
    }
}

// 3. Mount interval engine initialization process loop onto window load pipeline
// Ensure opacity transition timing style rules live on target reference element definitions
document.addEventListener("DOMContentLoaded", () => {
    const cardElement = document.getElementById('rotating-quote-card');
    if (cardElement) {
        cardElement.style.transition = "opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
    }
    
    // Fire interval engine routine continuously every 3000ms (3 seconds)
    setInterval(rotateQuote, 8000);
});