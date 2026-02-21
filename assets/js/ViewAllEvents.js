/**
 * HapsayHub (HH) Integrated Logic - Final Map, Date, & Image Fix
 * Features: Minute-by-Minute Status calculation, UI Sync, Instant Image Preview, Unique Toasts & Pagination
 * Added: Automatic Real-Time Status Refresh, Total Count, Search, & Status Filtering
 */

const HH_Events = {
    // --- STATE MANAGEMENT ---
    list: [],
    currentPage: 1,
    rowsPerPage: 5, 
    currentStatusFilter: 'All',
    editingId: null,
    map: null,
    marker: null,
    fp: null,

    // --- INITIALIZATION ---
    init: function() {
        this.setupSearch();
        this.setupImageUpload();
        this.render();
        this.initDatePicker();

        // --- AUTOMATIC REFRESH ---
        // Runs every 10 seconds to detect time-based status changes (Upcoming -> Active -> Archived)
        setInterval(() => {
            this.render();
        }, 5000);
    },

    // --- UNIQUE TOAST SYSTEM ---
    showToast: function(title, message, type = 'success') {
        const container = document.getElementById('hh-event-toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `hh-event-toast-item hh-${type}`;
        const icon = type === 'success' ? 'bx-check-circle' : 'bx-info-circle';

        toast.innerHTML = `
            <div class="hh-event-icon">
                <i class='bx ${icon}'></i>
            </div>
            <div class="hh-event-text">
                <b>${title}</b>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('hh-show'), 100);

        setTimeout(() => {
            toast.classList.remove('hh-show');
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    },

    // --- UPDATED: MINUTE-PERFECT STATUS CALCULATION ---
    determineStatus: function(dateRangeStr, startTime, endTime) {
        if (!dateRangeStr || !startTime || !endTime) return "Upcoming";
        
        const now = new Date().getTime();

        // 1. Parse the Dates (Handling potential ranges)
        const parts = dateRangeStr.split(" to ");
        const startDatePart = parts[0]; 
        const endDatePart = parts[1] || parts[0];

        // 2. Create helper to merge "Date String" + "Time String"
        const createFullDate = (dateStr, timeStr) => {
            // dateStr: "Feb 21, 2026", timeStr: "09:29"
            return new Date(`${dateStr} ${timeStr}`).getTime();
        };

        const eventStartFull = createFullDate(startDatePart, startTime);
        const eventEndFull = createFullDate(endDatePart, endTime);

        // 3. Logic Comparison
        if (now < eventStartFull) {
            return "Upcoming";
        } else if (now >= eventStartFull && now <= eventEndFull) {
            return "Active";
        } else {
            return "Archived";
        }
    },

    // --- PAGINATION CONTROLS ---
    changePage: function(direction) {
        const totalItems = this.getFilteredList().length;
        const totalPages = Math.ceil(totalItems / this.rowsPerPage) || 1;
        const newPage = this.currentPage + direction;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.render();
        }
    },

    goToPage: function(page) {
        this.currentPage = page;
        this.render();
    },

    updatePaginationUI: function(totalPages) {
        const pageNumbersCont = document.getElementById('eventPageNumbers');
        const prevBtn = document.getElementById('prevEventPage');
        const nextBtn = document.getElementById('nextEventPage');

        if (!pageNumbersCont) return;

        if (prevBtn) prevBtn.disabled = (this.currentPage === 1);
        if (nextBtn) nextBtn.disabled = (this.currentPage === totalPages || totalPages === 0);

        let pagesHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            pagesHTML += `<div class="page-num ${i === this.currentPage ? 'active' : ''}" onclick="HH_Events.goToPage(${i})">${i}</div>`;
        }
        pageNumbersCont.innerHTML = pagesHTML;
    },

    // --- IMAGE UPLOAD LOGIC ---
    setupImageUpload: function() {
        document.body.addEventListener('click', function(e) {
            const uploadBox = e.target.closest('#imageUploadBox');
            const fileInput = document.getElementById('eventImageInput');
            if (uploadBox && fileInput && e.target !== fileInput) {
                fileInput.click();
            }
        });

        document.body.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'eventImageInput') {
                const file = e.target.files[0];
                const uploadBox = document.getElementById('imageUploadBox');
                if (file && uploadBox) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        uploadBox.style.backgroundImage = `url('${event.target.result}')`;
                        uploadBox.style.backgroundSize = 'cover';
                        uploadBox.style.backgroundPosition = 'center';
                        const overlayBtn = uploadBox.querySelector('.btn-add-image-overlay');
                        if (overlayBtn) overlayBtn.innerHTML = "<i class='bx bx-check'></i> Image Added";
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    },

    // --- DATE PICKER LOGIC ---
    initDatePicker: function() {
        const dateInput = document.getElementById("event-dates");
        if (this.fp) this.fp.destroy();
        if (dateInput && typeof flatpickr !== 'undefined') {
            this.fp = flatpickr("#event-dates", {
                mode: "range",
                dateFormat: "M j, Y",
                minDate: "today",
                allowInput: false
            });
        }
    },

    // --- MAP & LOCATION LOGIC ---
    toggleMap: function() {
        const container = document.getElementById('map-container');
        const locInput = document.getElementById('eventLocation');
        if (!container) return;

        if (container.style.display === 'none' || container.style.display === '') {
            container.style.display = 'block';
            container.style.height = '250px';
            if (!this.map && typeof L !== 'undefined') {
                this.map = L.map('map-container').setView([9.9177, 124.1017], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
                this.map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    if (this.marker) this.marker.setLatLng(e.latlng);
                    else this.marker = L.marker(e.latlng).addTo(this.map);
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                        .then(res => res.json())
                        .then(data => {
                            if (locInput) {
                                const addr = data.address;
                                const placeName = data.name || addr.amenity || "Selected Area";
                                locInput.value = placeName;
                            }
                        });
                });
            }
            setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
        } else {
            container.style.display = 'none';
        }
    },

    // --- MODAL CONTROL ---
    openModal: function(id = null) {
        const modal = document.getElementById('eventModal');
        const form = document.getElementById('eventForm');
        if (!modal) return;
        if (form) form.reset();
        this.editingId = id;
        document.getElementById('map-container').style.display = 'none';
        setTimeout(() => this.initDatePicker(), 50);

        if (id) {
            const ev = this.list.find(e => e.id === id);
            if (ev) {
                document.getElementById('eventModalTitle').innerText = "Edit Event";
                document.getElementById('eventName').value = ev.name;
                document.getElementById('eventDescription').value = ev.description;
                document.getElementById('event-dates').value = ev.date;
                document.getElementById('eventLocation').value = ev.location;
                document.getElementById('eventCategory').value = ev.category;
                document.getElementById('startTime').value = ev.startTime || "";
                document.getElementById('endTime').value = ev.endTime || "";
                document.getElementById('eventCapacity').value = ev.capacity || "";
                document.getElementById('imageUploadBox').style.backgroundImage = `url('${ev.image}')`;
            }
        } else {
            document.getElementById('eventModalTitle').innerText = "Create New Event";
            document.getElementById('imageUploadBox').style.backgroundImage = "";
        }
        modal.style.display = 'flex';
    },

    closeModal: function() {
        document.getElementById('eventModal').style.display = 'none';
    },

    // --- CRUD OPERATIONS ---
    save: function(e) {
        if (e) e.preventDefault();

        const nameVal = document.getElementById('eventName').value.trim();
        const dateVal = document.getElementById('event-dates').value;
        const locVal = document.getElementById('eventLocation').value.trim();
        const startVal = document.getElementById('startTime').value;
        const endVal = document.getElementById('endTime').value;
        const capVal = document.getElementById('eventCapacity').value;

        if (!nameVal || !dateVal || !locVal || !capVal || !startVal || !endVal) {
            this.showToast("Missing Info", "Please fill in all required fields!", "error");
            return;
        }

        const imageUrl = document.getElementById('imageUploadBox').style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');

        const data = {
            id: this.editingId || Date.now(),
            name: nameVal,
            description: document.getElementById('eventDescription').value.trim(),
            date: dateVal,
            location: locVal,
            category: document.getElementById('eventCategory').value,
            startTime: startVal,
            endTime: endVal,
            capacity: capVal,
            image: imageUrl,
            registration: `0 / ${capVal}`,
            status: this.determineStatus(dateVal, startVal, endVal) 
        };

        if (this.editingId) {
            const index = this.list.findIndex(ev => ev.id === this.editingId);
            if (index !== -1) this.list[index] = data;
            this.showToast("Success!", "Event updated.");
        } else {
            this.list.push(data);
            this.showToast("Success!", "New event created.");
        }

        this.closeModal();
        this.render();
    },

    // --- ADVANCED FILTER LOGIC ---
    getFilteredList: function() {
        const input = document.getElementById('event-search-input');
        const term = input ? input.value.toLowerCase() : "";
        
        return this.list.filter(ev => {
            const matchesSearch = ev.name.toLowerCase().includes(term) || ev.category.toLowerCase().includes(term);
            const matchesStatus = this.currentStatusFilter === 'All' || ev.status === this.currentStatusFilter;
            return matchesSearch && matchesStatus;
        });
    },

    // --- POP BOX TOGGLE ---
    togglePopBox: function(id) {
        const box = document.getElementById(id);
        if (box) {
            box.classList.toggle('show');
            const closeBox = (e) => {
                if (!e.target.closest('.pop-box-wrapper')) {
                    box.classList.remove('show');
                    document.removeEventListener('click', closeBox);
                }
            };
            document.addEventListener('click', closeBox);
        }
    },

    // --- FILTER STATUS ACTION ---
    setStatusFilter: function(status) {
        this.currentStatusFilter = status;
        document.getElementById('event-filter-label').innerText = `Status ${status}`;
        document.getElementById('event-status-pop-box').classList.remove('show');
        this.currentPage = 1;
        this.render();
    },

    render: function() {
        const tableBody = document.getElementById('events-table-body');
        const emptyState = document.getElementById('event-empty-state');
        const footerInfo = document.getElementById('event-footer-info');
        const totalCountSpan = document.getElementById('event-total-count');

        if (!tableBody) return;

        // Update Total Count
        if (totalCountSpan) totalCountSpan.innerText = this.list.length;

        // AUTOMATIC STATUS RE-SYNC FOR ALL EVENTS BEFORE DISPLAY
        this.list.forEach(ev => {
            ev.status = this.determineStatus(ev.date, ev.startTime, ev.endTime);
        });

        const filtered = this.getFilteredList();
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / this.rowsPerPage) || 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.rowsPerPage;
        const paginatedItems = filtered.slice(startIdx, startIdx + this.rowsPerPage);

        const currentRows = tableBody.querySelectorAll('.event-data-row');
        currentRows.forEach(row => row.remove());

        if (totalItems === 0) {
            emptyState.style.display = 'block';
            if (footerInfo) footerInfo.innerText = "Showing 0 of 0 Events";
            this.updatePaginationUI(0);
            return;
        }

        emptyState.style.display = 'none';

        const rowsHTML = paginatedItems.map(ev => {
            const badgeClass = ev.status.toLowerCase(); 

            return `
            <div class="event-data-row">
                <div style="font-weight:700; color: #5a379d;">${ev.name}</div>
                <div>${ev.category}</div>
                <div>${ev.date}</div>
                <div>${ev.registration}</div>
                <div><span class="badge ${badgeClass}">${ev.status}</span></div>
                <div class="event-actions">
                    <button type="button" class="btn-action-edit" onclick="openEventModal(${ev.id})"><i class='bx bx-edit'></i></button>
                    <button type="button" class="btn-action-delete" onclick="HH_Events.delete(${ev.id})"><i class='bx bx-trash'></i></button>
                </div>
            </div>
            `;
        }).join('');

        tableBody.insertAdjacentHTML('beforeend', rowsHTML);
        if (footerInfo) {
            const showingTo = Math.min(startIdx + this.rowsPerPage, totalItems);
            footerInfo.innerText = `Showing ${startIdx + 1} to ${showingTo} of ${totalItems} Events`;
        }
        this.updatePaginationUI(totalPages);
    },

    setupSearch: function() {
        const input = document.getElementById('event-search-input');
        if (input) input.addEventListener('input', () => { this.currentPage = 1; this.render(); });
    },

delete: function(id) {
    Swal.fire({
        title: 'Delete Event?',
        text: "This action cannot be undone.",
        icon: 'warning',
        iconColor: '#ff7675', // Soft red icon
        showCancelButton: true,
        confirmButtonColor: '#d63031', // Deep red confirm
        cancelButtonColor: '#b2bec3', // Soft grey cancel
        confirmButtonText: 'Yes, Delete It',
        cancelButtonText: 'Go Back',
        background: '#ffffff',
        borderRadius: '15px', // Rounded corners
        showClass: {
            popup: 'animate__animated animate__fadeInDown' // Adds smooth entry
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp' // Adds smooth exit
        }
    }).then((result) => {
        if (result.isConfirmed) {
            this.list = this.list.filter(ev => ev.id !== id);
            
            // Trigger a nice success toast
            Swal.fire({
                title: 'Deleted!',
                text: 'The event has been removed.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                borderRadius: '15px'
            });

            this.render();
        }
    });
}
};

// --- GLOBAL EXPOSURE ---
window.openEventModal = function(id) { HH_Events.openModal(id); };
window.closeEventModal = function() { HH_Events.closeModal(); };
window.saveEventLogic = function(e) { HH_Events.save(e); };
window.changeEventPage = function(dir) { HH_Events.changePage(dir); };
window.togglePopBox = function(id) { HH_Events.togglePopBox(id); };
window.filterEventByStatus = function(status) { HH_Events.setStatusFilter(status); };

document.addEventListener('DOMContentLoaded', () => HH_Events.init());