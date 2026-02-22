/**
 * HapsayHub (HH) Unique Logic
 * Handles: Tab Switching, Event CRUD, Category Management, Syncing Dropdowns,
 * Empty States, POI Map Picker, Image Upload, Search, and Confirmation Modals.
 */

const HH_Core = {
    currentAction: null,
    targetRow: null,
    letEditingRow: null, // Tracking for editing events
    editingCategoryElement: null, // Tracking for editing categories

    // 1. UNIQUE TOAST NOTIFICATION
    showToast: function(msg, color) {
        const toast = document.getElementById("hh-toast");
        if (!toast) return;
        toast.innerText = msg;
        toast.style.backgroundColor = color;
        toast.classList.add("hh-show");
        setTimeout(() => toast.classList.remove("hh-show"), 3000);
    },

    // 2. UNIQUE DYNAMIC POP-UP BOX (Confirmation)
    openPopUp: function(action, row = null) {
        this.currentAction = action;
        this.targetRow = row;
        
        const modal = document.getElementById("hh-confirm-modal");
        const title = document.getElementById("hh-modal-title");
        const text = document.getElementById("hh-modal-text");
        const icon = document.getElementById("hh-modal-icon");
        const confirmBtn = document.getElementById("hh-modal-btn-yes");

        if (action === 'save') {
            title.innerText = "Save Event?";
            text.innerText = "Are you ready to publish this event to the hub?";
            icon.innerHTML = "💾";
            confirmBtn.innerText = "Save Now";
            confirmBtn.style.background = "#83d0cb";
        } else {
            title.innerText = "Delete Item?";
            text.innerText = "This action is permanent and cannot be undone. Proceed?";
            icon.innerHTML = "🗑️";
            confirmBtn.innerText = "Yes, Delete";
            confirmBtn.style.background = "#e57373";
        }
        modal.style.display = "flex";
    },

    closePopUp: function() {
        const modal = document.getElementById("hh-confirm-modal");
        if (modal) modal.style.display = "none";
    }
};

/**
 * TAB NAVIGATION LOGIC
 */
function switchTab(tabName) {
    const tabs = ['details', 'categories', 'all-events'];
    const buttons = document.querySelectorAll('.tab-btn');

    tabs.forEach((tab, index) => {
        const contentSection = document.getElementById(`tab-${tab}`);
        if (contentSection) {
            if (tab === tabName) {
                contentSection.style.display = (tab === 'details') ? 'grid' : 'block';
                if (buttons[index]) buttons[index].classList.add('active');
            } else {
                contentSection.style.display = 'none';
                if (buttons[index]) buttons[index].classList.remove('active');
            }
        }
    });
}

/**
 * SYNC CATEGORIES TO DROPDOWN
 */
function updateCategoryDropdown() {
    const dropdown = document.getElementById('event-category');
    const categoryLabels = document.querySelectorAll('#category-items-list .category-label');
    
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">All Category</option>';

    categoryLabels.forEach(label => {
        const name = label.innerText;
        const option = document.createElement('option');
        option.value = name.toLowerCase().replace(/\s+/g, '-');
        option.textContent = name;
        dropdown.appendChild(option);
    });
}

/**
 * PERSISTENCE LOGIC FOR CATEGORIES
 */
function saveCategoriesToStorage() {
    const labels = document.querySelectorAll('#category-items-list .category-label');
    const categoryNames = Array.from(labels).map(label => label.innerText);
    localStorage.setItem('hh_categories', JSON.stringify(categoryNames));
}

function loadCategoriesFromStorage() {
    const catList = document.getElementById('category-items-list');
    const saved = localStorage.getItem('hh_categories');
    if (!saved || !catList) return;

    const categoryNames = JSON.parse(saved);
    catList.innerHTML = ''; // Clear existing
    categoryNames.forEach(name => {
        const newItem = document.createElement('div');
        newItem.className = 'category-list-item';
        newItem.innerHTML = `
            <span class="category-label">${name}</span>
            <div class="category-item-actions">
                <button class="btn-inline-edit"><i class='bx bxs-edit-alt'></i> Edit</button>
                <button class="btn-inline-delete"><i class='bx bx-trash'></i></button>
            </div>`;
        catList.appendChild(newItem);
    });
}

/**
 * CHECK EMPTY STATE FOR CATEGORIES
 */
function checkEmptyState() {
    const list = document.getElementById('category-items-list');
    const emptyMsg = document.getElementById('category-empty-state');
    if (!list || !emptyMsg) return;

    const items = list.querySelectorAll('.category-list-item');
    emptyMsg.style.display = (items.length === 0) ? 'flex' : 'none';
}

/**
 * CHECK EMPTY STATE FOR EVENTS TABLE
 */
function checkEventsEmptyState() {
    const tbody = document.getElementById('events-list-body');
    const emptyMsg = document.getElementById('events-empty-state');
    const table = document.getElementById('events-main-table');
    
    if (!tbody || !emptyMsg || !table) return;

    if (tbody.children.length === 0) {
        emptyMsg.style.display = 'flex';
        table.style.display = 'none';
    } else {
        emptyMsg.style.display = 'none';
        table.style.display = 'table';
    }
}

/**
 * CENTRALIZED RENDER FUNCTION
 * Used to prevent duplication by ensuring table always matches the Bridge data exactly
 */
function renderOrganizerTable() {
    const eventsTableBody = document.getElementById('events-list-body');
    if (!eventsTableBody || typeof HH_Bridge === 'undefined') return;

    eventsTableBody.innerHTML = '';
    const currentEvents = HH_Bridge.getAllEvents();
    currentEvents.forEach(ev => addNewEventRow(ev));
    checkEventsEmptyState();
}

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const eventNameInput = document.getElementById('event-name');
    const eventDescInput = document.getElementById('event-desc');
    const eventDateInput = document.getElementById('event-dates');
    const eventLocInput = document.getElementById('event-location');
    const eventCatSelect = document.getElementById('event-category');
    
    // NEW REFERENCES FOR UPDATED FIELDS
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const capacityInput = document.getElementById('eventCapacity');
    
    const eventPreviewImg = document.getElementById('image-preview');
    const imageInput = document.getElementById('event-image-input');
    const uploadBox = document.getElementById('imageUploadBox');
    const mapBtn = document.getElementById('map-picker-btn');
    const mapContainer = document.getElementById('map-container');
    const eventsTableBody = document.getElementById('events-list-body');
    const eventSearchInput = document.getElementById('event-search-input');
    
    let map, marker, fp;

    // INITIAL UI SYNC
    loadCategoriesFromStorage(); // Load saved categories first
    updateCategoryDropdown();
    checkEmptyState();
    renderOrganizerTable();

    // --- SYNC LISTENER ---
    window.addEventListener('storage', () => renderOrganizerTable());

    // 1. DATE PICKER INITIALIZATION
    if (typeof flatpickr !== 'undefined') {
        fp = flatpickr("#event-dates", {
            mode: "range",
            dateFormat: "M j, Y",
            minDate: "today"
        });
    }

    // 2. IMAGE UPLOAD LOGIC
    if (uploadBox && imageInput) {
        uploadBox.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    HH_Core.showToast("⚠️ Please select an image file", "#e57373");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    eventPreviewImg.src = e.target.result;
                    HH_Core.showToast("📸 Image ready", "#83d0cb");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. POI MAP PICKER LOGIC
    if (mapBtn) {
        mapBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mapContainer.style.display === 'none' || mapContainer.style.display === '') {
                mapContainer.style.display = 'block';
                if (!map) {
                    map = L.map('map-container').setView([9.9177, 124.1017], 15);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    map.on('click', (e) => {
                        if (marker) marker.setLatLng(e.latlng); else marker = L.marker(e.latlng).addTo(map);
                        eventLocInput.value = "Locating place name...";
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18`)
                            .then(res => res.json()).then(data => {
                                const addr = data.address;
                                eventLocInput.value = addr.amenity || addr.school || addr.church || addr.port || addr.building || data.display_name;
                            });
                    });
                }
                setTimeout(() => map.invalidateSize(), 200);
            } else { mapContainer.style.display = 'none'; }
        });
    }

    // 4. TIPS MODAL LOGIC
    const learnMoreTrigger = document.getElementById('learn-more-tips');
    const tipsModal = document.getElementById('hh-tips-modal');
    const tipsCloseBtn = document.getElementById('hh-tips-close');

    if (learnMoreTrigger) {
        learnMoreTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            tipsModal.style.display = 'flex';
        });
    }
    if (tipsCloseBtn) {
        tipsCloseBtn.addEventListener('click', () => tipsModal.style.display = 'none');
    }

    // 5. CATEGORY TAB INTERACTION
    const createCatTrigger = document.getElementById('hh-create-cat-trigger');
    const catModal = document.getElementById('hh-category-modal');
    const catSaveBtn = document.getElementById('hh-cat-save');
    const catCancelBtn = document.getElementById('hh-cat-cancel');
    const catNameInput = document.getElementById('new-cat-name');
    const catList = document.getElementById('category-items-list');

    if (createCatTrigger) {
        createCatTrigger.addEventListener('click', () => {
            HH_Core.editingCategoryElement = null;
            document.getElementById('cat-modal-title').innerText = "New Category";
            catNameInput.value = "";
            catModal.style.display = 'flex';
        });
    }

    if (catSaveBtn) {
        catSaveBtn.addEventListener('click', () => {
            const name = catNameInput.value.trim();
            if (!name) {
                HH_Core.showToast("⚠️ Category name is required", "#e57373");
                return;
            }

            if (HH_Core.editingCategoryElement) {
                HH_Core.editingCategoryElement.innerText = name;
                HH_Core.showToast("✅ Category Updated", "#83d0cb");
            } else {
                const newItem = document.createElement('div');
                newItem.className = 'category-list-item';
                newItem.innerHTML = `
                    <span class="category-label">${name}</span>
                    <div class="category-item-actions">
                        <button class="btn-inline-edit"><i class='bx bxs-edit-alt'></i> Edit</button>
                        <button class="btn-inline-delete"><i class='bx bx-trash'></i></button>
                    </div>`;
                catList.appendChild(newItem);
                catList.scrollTop = catList.scrollHeight;
                HH_Core.showToast("🚀 Category Added", "#83d0cb");
            }
            saveCategoriesToStorage(); // Save to localStorage
            updateCategoryDropdown();
            checkEmptyState();
            catModal.style.display = 'none';
        });
    }

    if (catCancelBtn) {
        catCancelBtn.addEventListener('click', () => catModal.style.display = 'none');
    }

    if (catList) {
        catList.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-inline-edit');
            const deleteBtn = e.target.closest('.btn-inline-delete');

            if (editBtn) {
                const itemRow = editBtn.closest('.category-list-item');
                HH_Core.editingCategoryElement = itemRow.querySelector('.category-label');
                document.getElementById('cat-modal-title').innerText = "Edit Category";
                catNameInput.value = HH_Core.editingCategoryElement.innerText;
                catModal.style.display = 'flex';
            }
            if (deleteBtn) {
                HH_Core.openPopUp('delete', deleteBtn.closest('.category-list-item'));
            }
        });
    }

    // 6. EVENT SAVE/DELETE TRIGGER
    document.getElementById('hh-save-trigger').addEventListener('click', () => {
        if (!eventNameInput.value.trim() || !eventDateInput.value.trim()) {
            HH_Core.showToast("⚠️ Name and Dates are required!", "#e57373");
            return;
        }
        HH_Core.openPopUp('save');
    });

    document.getElementById('hh-delete-trigger').addEventListener('click', () => {
        HH_Core.openPopUp('delete');
    });

    // 7. GLOBAL CONFIRMATION MODAL ACTION
    document.getElementById('hh-modal-btn-yes').addEventListener('click', () => {
        const action = HH_Core.currentAction;
        
        if (action === 'save') {
            const data = {
                id: HH_Core.letEditingRow ? parseInt(HH_Core.letEditingRow.getAttribute('data-id')) : Date.now(),
                name: eventNameInput.value.trim(),
                description: eventDescInput.value.trim(),
                date: eventDateInput.value.trim(),
                location: eventLocInput.value.trim(),
                category: eventCatSelect.options[eventCatSelect.selectedIndex].text,
                image: eventPreviewImg.src, // Fixed: Sync key name with Superadmin
                status: HH_Core.letEditingRow ? HH_Core.letEditingRow.getAttribute('data-status') : "Pending", 
                startTime: startTimeInput.value || "08:00",
                endTime: endTimeInput.value || "17:00",
                capacity: capacityInput.value || 100,
                registration: HH_Core.letEditingRow ? HH_Core.letEditingRow.getAttribute('data-registration') : "0 / 100"
            };

            if (typeof HH_Bridge !== 'undefined') {
                HH_Bridge.saveToHub(data);
                renderOrganizerTable(); 
            }

            HH_Core.showToast("🚀 Sent for Approval!", "#83d0cb");
            HH_Core.letEditingRow = null;
            resetEventForm();
            switchTab('all-events');

        } else if (action === 'delete') {
            if (HH_Core.targetRow) {
                const row = HH_Core.targetRow;
                const isCategory = row.classList.contains('category-list-item');
                const eventId = row.getAttribute('data-id');

                if (!isCategory && eventId && typeof HH_Bridge !== 'undefined') {
                    HH_Bridge.deleteFromHub(parseInt(eventId));
                    renderOrganizerTable(); 
                } else if (isCategory) {
                    row.remove();
                    saveCategoriesToStorage(); // Update storage after delete
                    updateCategoryDropdown();
                    checkEmptyState();
                }
                
                HH_Core.showToast("🗑️ Item Deleted", "#e57373");
                HH_Core.targetRow = null;
            } else {
                resetEventForm();
                HH_Core.showToast("🧹 Form Cleared", "#666");
            }
        }
        HH_Core.closePopUp();
    });

    document.getElementById('hh-modal-btn-no').addEventListener('click', () => HH_Core.closePopUp());

    // 8. TABLE ACTIONS
    if (eventsTableBody) {
        eventsTableBody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-icon-edit');
            const deleteBtn = e.target.closest('.btn-icon-delete');

            if (editBtn) {
                const row = editBtn.closest('tr');
                HH_Core.letEditingRow = row;
                
                // Get all saved data from the bridge to populate full details
                const eventId = row.getAttribute('data-id');
                const fullData = typeof HH_Bridge !== 'undefined' ? HH_Bridge.getAllEvents().find(ev => ev.id == eventId) : null;

                eventNameInput.value = row.querySelector('.event-info-cell span').innerText;
                eventDateInput.value = row.cells[1].innerText;
                eventLocInput.value = row.getAttribute('data-location') || ""; 
                eventPreviewImg.src = row.querySelector('.table-thumb').src;
                
                // Populate the NEW fields if data exists
                if (fullData) {
                    eventDescInput.value = fullData.description || "";
                    startTimeInput.value = fullData.startTime || "";
                    endTimeInput.value = fullData.endTime || "";
                    capacityInput.value = fullData.capacity || "";
                    // Set category select
                    for (let i = 0; i < eventCatSelect.options.length; i++) {
                        if (eventCatSelect.options[i].text === fullData.category) {
                            eventCatSelect.selectedIndex = i;
                            break;
                        }
                    }
                }

                switchTab('details');
                HH_Core.showToast("📝 Editing Mode", "#a389f4");
            }
            if (deleteBtn) {
                HH_Core.openPopUp('delete', deleteBtn.closest('tr'));
            }
        });
    }

    // 9. REAL-TIME SEARCH
    if (eventSearchInput && eventsTableBody) {
        eventSearchInput.addEventListener('input', function() {
            const filterTerm = this.value.toLowerCase();
            const rows = eventsTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const rowText = row.innerText.toLowerCase();
                row.style.display = rowText.includes(filterTerm) ? '' : 'none';
            });
        });
    }

    function resetEventForm() {
        if (eventNameInput) eventNameInput.value = ""; 
        if (eventDescInput) eventDescInput.value = ""; 
        if (eventLocInput) eventLocInput.value = ""; 
        if (startTimeInput) startTimeInput.value = "";
        if (endTimeInput) endTimeInput.value = "";
        if (capacityInput) capacityInput.value = "";
        if (eventCatSelect) eventCatSelect.selectedIndex = 0; 
        if (eventPreviewImg) eventPreviewImg.src = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";
        if (imageInput) imageInput.value = ""; 
        if (fp) { fp.clear(); if (eventDateInput) eventDateInput.value = ""; }
        if (mapContainer) mapContainer.style.display = 'none';
        if (marker && map) { map.removeLayer(marker); marker = null; }
    }
});

function addNewEventRow(data) {
    const eventsTableBody = document.getElementById('events-list-body');
    const tr = document.createElement('tr');
    tr.setAttribute('data-location', data.location);
    tr.setAttribute('data-id', data.id);
    tr.setAttribute('data-status', data.status);
    tr.setAttribute('data-registration', data.registration);
    
    const badgeClass = data.status.toLowerCase();
    tr.innerHTML = `
        <td><div class="event-info-cell"><img src="${data.image || data.img}" class="table-thumb"><span>${data.name}</span></div></td>
        <td>${data.date}</td>
        <td><span class="badge badge-edu">${data.category}</span></td> <td class="table-actions">
            <button class="btn-icon-edit"><i class='bx bxs-edit-alt'></i></button>
            <button class="btn-icon-delete"><i class='bx bx-trash'></i></button>
        </td>`;
    eventsTableBody.appendChild(tr);
}

function updateEventRow(row, data) {
    row.setAttribute('data-location', data.location);
    row.setAttribute('data-status', data.status);
    row.setAttribute('data-registration', data.registration);
    
    row.querySelector('.event-info-cell span').innerText = data.name;
    row.querySelector('img').src = data.image || data.img;
    row.cells[1].innerText = data.date;
    row.cells[2].innerHTML = `<span class="badge badge-edu">${data.category}</span>`; // Corrected: Updates with real category
    const badge = row.querySelector('.badge');
    // Note: If you want to keep the status badge separate, you would need another column. 
    // Currently, this updates the badge in cell index 2 with the category name.
}