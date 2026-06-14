// Local Storage operational array caching logic keys structure
let academicEvents = JSON.parse(localStorage.getItem('nexusCalendarEvents')) || [];

window.onload = function() {
    renderAcademicEvents();
};

function addAcademicEvent() {
    const titleInput = document.getElementById('event-title');
    const dateInput = document.getElementById('event-date');
    const typeSelect = document.getElementById('event-type');

    const title = titleInput.value.trim();
    const dateValue = dateInput.value;
    const typeValue = typeSelect.value;

    if (!title || !dateValue) {
        alert("Please provide both an event title description and selection target date!");
        return;
    }

    // Build data element packaging module
    const newEvent = {
        id: Date.now(),
        title: title,
        date: dateValue,
        type: typeValue
    };

    academicEvents.push(newEvent);
    
    // Sort array chronologically so closest items rise to topmost nodes
    academicEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save and wipe strings
    localStorage.setItem('nexusCalendarEvents', JSON.stringify(academicEvents));
    titleInput.value = "";
    dateInput.value = "";

    renderAcademicEvents();
}

function removeAcademicEvent(eventId) {
    academicEvents = academicEvents.filter(evt => evt.id !== eventId);
    localStorage.setItem('nexusCalendarEvents', JSON.stringify(academicEvents));
    renderAcademicEvents();
}

function renderAcademicEvents() {
    const outputContainer = document.getElementById('events-display-list');
    if (!outputContainer) return;

    outputContainer.innerHTML = "";

    if (academicEvents.length === 0) {
        outputContainer.innerHTML = `<p style="color: #64748b; font-style: italic; text-align: center; margin-top: 20px;">No academic deadlines logged yet. Enjoy the free time!</p>`;
        return;
    }

    academicEvents.forEach(evt => {
        const itemRow = document.createElement('div');
        itemRow.classList.add('event-item-card');

        // Formulate friendly local date string readability profile values
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const cleanDateDisplay = new Date(evt.date).toLocaleDateString('en-US', options);

        itemRow.innerHTML = `
            <div class="event-details-left">
                <div class="event-main-line">
                    <span class="event-badge type-${evt.type}">${evt.type}</span>
                    <span class="event-card-title">${evt.title}</span>
                </div>
                <span class="event-card-date">📅 ${cleanDateDisplay}</span>
            </div>
            <button class="event-delete-btn" onclick="removeAcademicEvent(${evt.id})" title="Delete Tracker">🗑️</button>
        `;

        outputContainer.appendChild(itemRow);
    });
}