/**
 * HapsayHub (HH) Attendee Management Logic
 * Features: Pagination (8 per page), Dynamic Table, Event Filtering, Real-time Search, CSV Export, and Custom Modals
 */
const HH_AttendeeManager = {
    // --- NEW: Pagination Variables ---
    currentPage: 1,
    itemsPerPage: 8,

    init: function() {
        console.log("HH_AttendeeManager: Initializing Attendee View...");
        
        this.populateEventDropdown();
        this.renderAttendees();
        this.setupEventListeners();

        window.addEventListener('storage', (e) => {
            if (e.key === 'hh_attendees') {
                this.populateEventDropdown();
                // Reset to page 1 on new data to ensure the user sees the latest changes
                this.currentPage = 1; 
                this.renderAttendees();
            }
        });
    },

    getAttendees: function() {
        return JSON.parse(localStorage.getItem('hh_attendees') || '[]');
    },

    setupEventListeners: function() {
        const searchInput = document.getElementById('attendeeSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                // Always jump back to page 1 when typing a new search
                this.currentPage = 1; 
                this.renderAttendees();
            });
        }
    },

    populateEventDropdown: function() {
        const dropdown = document.getElementById('eventFilterDropdown');
        if (!dropdown) return;

        const attendees = this.getAttendees();
        const uniqueEvents = [...new Set(attendees.map(a => a.eventName))];
        const currentValue = dropdown.value;
        
        let optionsHTML = `<option value="all">All HapsayHub Events</option>`;
        uniqueEvents.forEach(eventName => {
            optionsHTML += `<option value="${eventName}">${eventName}</option>`;
        });

        dropdown.innerHTML = optionsHTML;
        
        if (uniqueEvents.includes(currentValue) || currentValue === 'all') {
            dropdown.value = currentValue;
        }
    },

    // Bridge function updated to reset pagination
    handleDropdownChange: function() {
        this.currentPage = 1;
        this.renderAttendees();
    },

    getFilteredAttendees: function() {
        let attendees = this.getAttendees();
        
        const filterDropdown = document.getElementById('eventFilterDropdown');
        const selectedEvent = filterDropdown ? filterDropdown.value : 'all';
        if (selectedEvent !== 'all') {
            attendees = attendees.filter(a => a.eventName === selectedEvent);
        }

        const searchInput = document.getElementById('attendeeSearch');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            attendees = attendees.filter(a => 
                (a.fname + " " + a.lname).toLowerCase().includes(searchTerm) || 
                a.email.toLowerCase().includes(searchTerm) || 
                a.ticketID.toLowerCase().includes(searchTerm)
            );
        }

        return attendees;
    },

    // --- RENDERING LOGIC (Now with Pagination) ---
    renderAttendees: function() {
        const tbody = document.getElementById('attendeeTableBody');
        const tableContainer = tbody ? tbody.closest('.content-section > div:last-child') : null; // Find the wrapper div
        if (!tbody) return;

        const allFilteredAttendees = this.getFilteredAttendees();
        
        // 1. Pagination Math
        const totalItems = allFilteredAttendees.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
        
        // Failsafe: if they delete the last item on page 2, it drops them back to page 1
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        // Slice the array to get ONLY the 8 items for the current page
        const attendeesToShow = allFilteredAttendees.slice(startIndex, endIndex);

        tbody.innerHTML = ''; 

        // 2. Handle Empty State
        if (attendeesToShow.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 40px 25px; text-align: center; color: #64748b; font-weight: 500;">
                        No attendees found matching your criteria.
                    </td>
                </tr>
            `;
            this.renderPaginationControls(tableContainer, totalPages);
            return;
        }

        // 3. Render Rows
        attendeesToShow.forEach(att => {
            let badgeStyle = "background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;"; 
            if (att.ticketType === "VIP") {
                badgeStyle = "background: #fef2f2; color: #f87171; border: 1px solid #fee2e2;";
            } else if (att.ticketType === "Student") {
                badgeStyle = "background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe;";
            }

            const rowHTML = `
                <tr style="border-bottom: 1px solid #f8fafc; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 20px 25px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #4f46e5; font-size: 0.85rem;">
                        ${att.ticketID}
                    </td>
                    <td style="padding: 20px 25px;">
                        <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">${att.fname} ${att.lname}</div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${att.email}</div>
                    </td>
                    <td style="padding: 20px 25px; font-size: 0.9rem; font-weight: 500; color: #334155;">
                        ${att.eventName}
                    </td>
                    <td style="padding: 20px 25px;">
                        <span style="${badgeStyle} padding: 5px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase;">
                            ${att.ticketType || 'GENERAL'} PASS
                        </span>
                    </td>
                    <td style="padding: 20px 25px;">
                        <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; color: #10b981;">
                            <i class='bx bxs-check-circle'></i> ${att.status || 'Registered'}
                        </div>
                    </td>
                    <td style="padding: 20px 25px;">
                        <button onclick="HH_AttendeeManager.removeAttendee('${att.ticketID}')" title="Remove Attendee" style="background: #fef2f2; border: none; padding: 10px; border-radius: 10px; cursor: pointer; color: #ef4444; display: flex; align-items: center; justify-content: center; transition: 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                            <i class='bx bx-trash' style="font-size: 1.2rem;"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', rowHTML);
        });

        // 4. Render Pagination Buttons Below Table
        this.renderPaginationControls(tableContainer, totalPages);
    },

    // --- NEW: BUILD PAGINATION BUTTONS ---
    renderPaginationControls: function(container, totalPages) {
        if (!container) return;

        // Remove old pagination if it exists
        const oldNav = document.getElementById('hh-pagination-nav');
        if (oldNav) oldNav.remove();

        // Don't show buttons if there's only 1 page
        if (totalPages <= 1) return;

        let buttonsHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === this.currentPage ? 'background: #0f172a; color: white;' : 'background: #f1f5f9; color: #64748b;';
            buttonsHTML += `<button onclick="HH_AttendeeManager.changePage(${i})" style="border:none; border-radius:8px; padding:8px 14px; font-weight:700; cursor:pointer; transition:0.2s; ${isActive}">${i}</button>`;
        }

        const navHTML = `
            <div id="hh-pagination-nav" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-top: 1px solid #f1f5f9; background: white; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">Page ${this.currentPage} of ${totalPages}</span>
                <div style="display: flex; gap: 8px;">
                    <button onclick="HH_AttendeeManager.changePage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''} style="border:none; border-radius:8px; padding:8px 14px; background: #f8fafc; color: ${this.currentPage === 1 ? '#cbd5e1' : '#0f172a'}; font-weight:700; cursor:${this.currentPage === 1 ? 'not-allowed' : 'pointer'};"><i class='bx bx-chevron-left'></i> Prev</button>
                    ${buttonsHTML}
                    <button onclick="HH_AttendeeManager.changePage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''} style="border:none; border-radius:8px; padding:8px 14px; background: #f8fafc; color: ${this.currentPage === totalPages ? '#cbd5e1' : '#0f172a'}; font-weight:700; cursor:${this.currentPage === totalPages ? 'not-allowed' : 'pointer'};">Next <i class='bx bx-chevron-right'></i></button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', navHTML);
    },

    // --- NEW: HANDLE PAGE CLICK ---
    changePage: function(newPage) {
        this.currentPage = newPage;
        this.renderAttendees();
    },

    // --- MODAL & DELETE LOGIC (Unchanged) ---
    removeAttendee: function(ticketID) {
        const existingModal = document.getElementById('custom-delete-modal');
        if (existingModal) existingModal.remove();

        const modalHTML = `
            <div id="custom-delete-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.6); z-index:11000; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(5px); padding: 20px;">
                <div style="background:white; width:100%; max-width:400px; border-radius:24px; padding:35px 30px; text-align:center; animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2); font-family: 'Inter', sans-serif;">
                    <div style="width:70px; height:70px; background:#fef2f2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 20px; box-shadow: 0 0 0 8px #fff5f5;">
                        <i class='bx bx-trash' style="color:#ef4444; font-size: 32px;"></i>
                    </div>
                    <h3 style="font-size:1.4rem; font-weight:800; color:#1e293b; margin-bottom:10px; margin-top: 0;">Remove Attendee?</h3>
                    <p style="color:#64748b; font-size:0.95rem; line-height:1.5; margin-bottom:25px;">
                        Are you sure you want to remove the attendee with Ticket ID <br><b style="color: #0f172a; font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 8px;">${ticketID}</b>?<br><br>This action cannot be undone.
                    </p>
                    <div style="display:flex; gap:12px;">
                        <button onclick="document.getElementById('custom-delete-modal').remove()" style="flex:1; padding:14px; border-radius:14px; border:none; background:#f8fafc; color:#475569; font-weight:700; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#f8fafc'">Cancel</button>
                        <button onclick="HH_AttendeeManager.executeDelete('${ticketID}')" style="flex:1; padding:14px; border-radius:14px; border:none; background:#ef4444; color:white; font-weight:700; cursor:pointer; transition:0.2s; box-shadow:0 4px 12px rgba(239,68,68,0.2);" onmouseover="this.style.background='#dc2626'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#ef4444'; this.style.transform='translateY(0)'">Yes, Remove</button>
                    </div>
                </div>
            </div>
            <style>@keyframes modalPop { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }</style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    executeDelete: function(ticketID) {
        let attendees = this.getAttendees();
        attendees = attendees.filter(att => att.ticketID !== ticketID);
        localStorage.setItem('hh_attendees', JSON.stringify(attendees));
        const modal = document.getElementById('custom-delete-modal');
        if (modal) modal.remove();
        this.renderAttendees();
        this.populateEventDropdown();
    },

    // --- ACTION: CSV EXPORT LOGIC (Unchanged) ---
    exportToCSV: function() {
        const attendees = this.getFilteredAttendees();
        if (attendees.length === 0) {
            alert("No data to export!");
            return;
        }
        const headers = ["Ticket ID", "First Name", "Last Name", "Email", "Phone", "Organization", "Event Name", "Ticket Type", "Status", "Date Registered"];
        const csvRows = [
            headers.join(','),
            ...attendees.map(att => [
                `"${att.ticketID || ''}"`, `"${att.fname || ''}"`, `"${att.lname || ''}"`, `"${att.email || ''}"`, `"${att.phone || ''}"`, `"${att.org || ''}"`, `"${att.eventName || ''}"`, `"${att.ticketType || ''}"`, `"${att.status || ''}"`, `"${att.dateRegistered ? new Date(att.dateRegistered).toLocaleString() : ''}"`
            ].join(','))
        ];
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `HapsayHub_Attendees_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// --- BRIDGE FOR HTML INLINE EVENTS ---
if (typeof HH_Display !== 'undefined') {
    HH_Display.filterAttendeesByEvent = function() {
        HH_AttendeeManager.handleDropdownChange();
    };
} else {
    window.HH_Display = {
        filterAttendeesByEvent: function() {
            HH_AttendeeManager.handleDropdownChange();
        }
    };
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => HH_AttendeeManager.init());