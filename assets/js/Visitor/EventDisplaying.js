/**
 * HapsayHub (HH) Public Display Logic
 * Features: Dynamic Grid, Search, Auto-Status, and Multi-Step Registration Modals
 */
const HH_Display = {
    // --- INITIALIZATION ---
    init: function() {
        console.log("HH_Display: Initializing Public Grid...");
        
        // 1. Initial build of UI and Grid
        this.updateCategoryDropdown(); 
        this.renderEvents();
        
        // 2. Attach Listeners
        this.setupEventListeners();

        // 3. Sync across tabs
        window.addEventListener('storage', () => {
            console.log("HH_Display: Syncing data changes...");
            this.updateCategoryDropdown();
            this.renderEvents();
        });

        // 4. AUTOMATIC REAL-TIME REFRESH
        setInterval(() => {
            if (!document.getElementById('event-modal-overlay') && !document.getElementById('registration-form-overlay') && !document.getElementById('success-modal-overlay')) {
                this.renderEvents();
            }
        }, 10000); 
    },

    // --- HELPER: FORMAT TIME TO AM/PM ---
    formatTimeAMPM: function(time24) {
        if (!time24) return "00:00 AM";
        let [hours, minutes] = time24.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    },

    // --- AUTOMATIC STATUS CALCULATION ---
    calculateCurrentStatus: function(dateRangeStr, startTime, endTime) {
        if (!dateRangeStr || !startTime || !endTime) return "Upcoming";
        
        const now = new Date().getTime();
        const parts = dateRangeStr.split(" to ");
        const startDatePart = parts[0]; 
        const endDatePart = parts[1] || parts[0];

        const createFullDate = (dateStr, timeStr) => {
            return new Date(`${dateStr} ${timeStr}`).getTime();
        };

        const eventStartFull = createFullDate(startDatePart, startTime);
        const eventEndFull = createFullDate(endDatePart, endTime);

        if (now < eventStartFull) return "Upcoming";
        if (now >= eventStartFull && now <= eventEndFull) return "Active";
        return "Archived";
    },

    // --- DYNAMIC CATEGORY DROPDOWN ---
    updateCategoryDropdown: function() {
        const dropdown = document.querySelector('.category-dropdown');
        if (!dropdown || typeof HH_Bridge === 'undefined') return;

        const allEvents = HH_Bridge.getAllEvents();
        
        const categories = [...new Set(allEvents
            .filter(ev => ev.status !== "Pending")
            .map(ev => ev.category)
            .filter(cat => cat)
        )];

        const currentValue = dropdown.value;
        let dropdownHTML = `<option value="all">All Category</option>`;
        categories.forEach(cat => {
            dropdownHTML += `<option value="${cat.toLowerCase()}">${cat}</option>`;
        });

        dropdown.innerHTML = dropdownHTML;
        dropdown.value = currentValue;
    },

    // --- EVENT LISTENERS ---
    setupEventListeners: function() {
        const searchInput = document.getElementById('eventSearch');
        const categorySelect = document.querySelector('.category-dropdown');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderEvents());
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.renderEvents());
        }

        // Close modals when clicking outside
        window.onclick = (event) => {
            const detailOverlay = document.getElementById('event-modal-overlay');
            const formOverlay = document.getElementById('registration-form-overlay');
            const successOverlay = document.getElementById('success-modal-overlay');
            if (event.target == detailOverlay) this.closeModal();
            if (event.target == formOverlay) this.closeRegistrationForm();
            if (event.target == successOverlay) this.closeSuccessModal();
        };
    },

    // --- RENDERING LOGIC ---
    renderEvents: function() {
        const grid = document.querySelector('.events-grid');
        const countBadge = document.querySelector('.event-count-badge');
        
        if (!grid || typeof HH_Bridge === 'undefined') return;

        let allEvents = HH_Bridge.getAllEvents();
        
        allEvents.forEach(ev => {
            if (ev.status !== "Pending") {
                ev.status = this.calculateCurrentStatus(ev.date, ev.startTime, ev.endTime);
            }
        });

        let filtered = allEvents.filter(ev => ev.status !== "Pending");

        const searchTerm = document.getElementById('eventSearch')?.value.toLowerCase() || "";
        if (searchTerm) {
            filtered = filtered.filter(ev => 
                ev.name.toLowerCase().includes(searchTerm) || 
                ev.description?.toLowerCase().includes(searchTerm) ||
                ev.location.toLowerCase().includes(searchTerm)
            );
        }

        const selectedCat = document.querySelector('.category-dropdown')?.value || "all";
        if (selectedCat !== 'all') {
            filtered = filtered.filter(ev => 
                ev.category?.toLowerCase() === selectedCat.toLowerCase()
            );
        }

        if (countBadge) {
            countBadge.innerText = `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`;
        }

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align: center; color: white; padding: 50px;">
                    <p style="font-size: 1.2rem; opacity: 0.8;">No events match your current selection.</p>
                </div>`;
            return;
        }

        filtered.forEach(event => {
            grid.insertAdjacentHTML('beforeend', this.createCardHTML(event));
        });
    },

    // --- MODAL 1: EVENT DETAILS Pop-up ---
    openRegistrationModal: function(eventId) {
        const ev = HH_Bridge.getAllEvents().find(e => e.id == eventId);
        if (!ev) return;

        const startTimeFormatted = this.formatTimeAMPM(ev.startTime);
        const endTimeFormatted = this.formatTimeAMPM(ev.endTime);
        const displayCapacity = ev.capacity || '100';

        const modalHTML = `
            <div id="event-modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(8px);">
                <div style="background:#f4f4f4; width:95%; max-width:1100px; border-radius:24px; position:relative; overflow:hidden; display:flex; flex-direction:column; max-height:90vh; animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    
                    <div style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${ev.image || ev.img}'); background-size:cover; background-position:center; height:180px; padding:25px; display:flex; align-items:flex-end; position:relative;">
                         <button onclick="HH_Display.closeModal()" style="position:absolute; top:20px; right:20px; background:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.1); color: #333;">&times;</button>
                         <div style="color:white; display:flex; align-items:center; gap:10px; cursor:pointer; font-weight:600;" onclick="HH_Display.closeModal()">
                            <i class='bx bx-home-alt' style="font-size: 1.4rem;"></i> Back to Home
                         </div>
                    </div>

                    <div style="display:flex; gap:25px; padding:30px; background:#e0e7ff; overflow-y:auto;">
                        
                        <div style="background:white; flex:2; padding:35px; border-radius:18px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                                <span style="background:#ececec; padding:6px 18px; border-radius:20px; font-size:0.85rem; font-weight:500;">${ev.category || 'General'}</span>
                                <span style="background:#10b981; color:white; padding:6px 18px; border-radius:20px; font-size:0.8rem; font-weight:600;">Open for registration</span>
                            </div>

                            <h2 style="font-size:1.8rem; margin-bottom:25px; line-height:1.3; color:#111; font-weight: 800;">${ev.name}</h2>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                                <div style="background:#f3f4f6; padding:15px; border-radius:12px; display:flex; align-items:center; gap:12px; border: 1px solid #e5e7eb;">
                                    <i class='bx bx-calendar' style="font-size:1.6rem; color:#4f46e5;"></i>
                                    <div style="font-size:0.9rem;"><strong>Date</strong><br>${ev.date}</div>
                                </div>
                                <div style="background:#f3f4f6; padding:15px; border-radius:12px; display:flex; align-items:center; gap:12px; border: 1px solid #e5e7eb;">
                                    <i class='bx bx-time-five' style="font-size:1.6rem; color:#4f46e5;"></i>
                                    <div style="font-size:0.9rem;"><strong>Time</strong><br>${startTimeFormatted} - ${endTimeFormatted}</div>
                                </div>
                            </div>

                            <div style="background:#f3f4f6; padding:15px; border-radius:12px; margin-bottom:25px; display:flex; align-items:center; gap:12px; border: 1px solid #e5e7eb;">
                                <i class='bx bx-map-pin' style="font-size:1.6rem; color:#4f46e5;"></i>
                                <div style="font-size:0.9rem;"><strong>Venue</strong><br>${ev.location}</div>
                            </div>

                            <h4 style="margin-bottom:10px; color:#374151; display: flex; align-items: center; gap: 8px;">
                                <i class='bx bx-info-circle' style="font-size: 1.2rem; color: #4f46e5;"></i> About this Event
                            </h4>
                            <p style="color:#6b7280; line-height:1.6; font-size:0.95rem;">${ev.description || 'No description provided.'}</p>
                        </div>

                        <div style="background:white; flex:1; padding:25px; border-radius:18px; text-align:center; height: fit-content; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                            <h4 style="margin-bottom:8px; color:#111; font-weight: 800;">Registration</h4>
                            <p style="color:#10b981; font-weight:700; font-size:0.9rem; margin-bottom:20px;">👥 0 / ${displayCapacity} slots left</p>
                            
                            <div style="text-align:left; background:#f9fafb; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                                <div><strong style="font-size:0.85rem;">General Admission</strong><br><small style="color:#9ca3af;">Available</small></div>
                                <span style="font-weight:700; color: #111;">Free</span>
                            </div>
                            <div style="text-align:left; background:#f9fafb; padding:12px; border-radius:12px; margin-bottom:10px; border:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                                <div><strong style="font-size:0.85rem;">VIP Access</strong><br><small style="color:#9ca3af;">Available</small></div>
                                <span style="font-weight:700; color: #111;">P50</span>
                            </div>

                            <button onclick="HH_Display.openRegistrationForm(${ev.id})" style="width:100%; background:#10b981; color:white; border:none; padding:16px; border-radius:12px; font-weight:700; margin-top:15px; cursor:pointer; transition:0.2s;">Register now</button>
                            <p style="font-size:0.65rem; color:#9ca3af; margin-top:10px;">Registration closes on ${ev.date.split(' to ')[0]}</p>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes modalPop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden'; 
    },

    // --- MODAL 2: ATTENDEE FILL-UP FORM ---
    openRegistrationForm: function(eventId) {
        const ev = HH_Bridge.getAllEvents().find(e => e.id == eventId);
        if (!ev) return;

        this.closeModal();

        const formHTML = `
    <div id="registration-form-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(12px); padding: 20px;">
        <form id="att-reg-form" onsubmit="event.preventDefault(); HH_Display.submitAttendeeRegistration(${ev.id});" style="background:white; width:100%; max-width:500px; border-radius:30px; position:relative; animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-family: 'Inter', sans-serif; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            
            <div style="padding: 30px 35px 20px; border-bottom: 1px solid #f0f0f0; background: white;">
                <button type="button" onclick="HH_Display.closeRegistrationForm()" style="position:absolute; top:25px; right:25px; background:#f5f5f5; border:none; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#666; transition: 0.2s;">
                    <i class='bx bx-x' style="font-size: 24px;"></i>
                </button>
                <h2 style="font-size:1.5rem; font-weight:800; margin:0; color:#111; line-height:1.2;">Register for ${ev.name}</h2>
                <p style="color:#666; font-size:0.9rem; margin: 8px 0 0;">Secure your spot in just a few steps.</p>
            </div>

            <div style="padding: 25px 35px; overflow-y: auto; flex-grow: 1; scrollbar-width: thin; scrollbar-color: #10b981 #f0f0f0;">
                <div style="display:flex; flex-direction:column; gap:20px;">
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:8px; color:#444;">First Name *</label>
                            <input type="text" id="att-fname" placeholder="Juan" required style="width:100%; padding:14px; border-radius:12px; border:1.5px solid #eee; background:#fafafa; transition: 0.3s; outline: none;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:8px; color:#444;">Last Name *</label>
                            <input type="text" id="att-lname" placeholder="Dela Cruz" required style="width:100%; padding:14px; border-radius:12px; border:1.5px solid #eee; background:#fafafa; transition: 0.3s; outline: none;">
                        </div>
                    </div>

                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:8px; color:#444;">Email Address *</label>
                        <input type="email" id="att-email" placeholder="juan@example.com" required style="width:100%; padding:14px; border-radius:12px; border:1.5px solid #eee; background:#fafafa; outline: none;">
                    </div>

                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:8px; color:#444;">Phone Number *</label>
                        <input type="tel" id="att-phone" placeholder="0912 345 6789" required style="width:100%; padding:14px; border-radius:12px; border:1.5px solid #eee; background:#fafafa; outline: none;">
                    </div>

                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:8px; color:#444;">Organization (Optional)</label>
                        <input type="text" id="att-org" placeholder="School or Company name" style="width:100%; padding:14px; border-radius:12px; border:1.5px solid #eee; background:#fafafa; outline: none;">
                    </div>

                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; margin-bottom:12px; color:#444;">Select Ticket Type *</label>
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <label class="ticket-radio">
                                <input type="radio" name="ticket-type" value="General" checked style="display:none;">
                                <div class="ticket-box">
                                    <span class="radio-circle"></span>
                                    <span>General Admission</span>
                                </div>
                            </label>
                            <label class="ticket-radio">
                                <input type="radio" name="ticket-type" value="VIP" style="display:none;">
                                <div class="ticket-box">
                                    <span class="radio-circle"></span>
                                    <span>VIP Pass</span>
                                </div>
                            </label>
                            <label class="ticket-radio">
                                <input type="radio" name="ticket-type" value="Student" style="display:none;">
                                <div class="ticket-box">
                                    <span class="radio-circle"></span>
                                    <span>Student Access</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div style="display:flex; align-items:flex-start; gap:12px; font-size:0.8rem; color:#666; line-height:1.5; background:#f9f9f9; padding:15px; border-radius:15px;">
                        <input type="checkbox" id="att-consent" required style="margin-top:4px; accent-color:#10b981; width:18px; height:18px;">
                        <label for="att-consent">I agree to the <b>Terms & Conditions</b> and consent to receive event updates via email.</label>
                    </div>
                </div>
            </div>

            <div style="padding: 20px 35px 35px; background: white; border-top: 1px solid #f0f0f0;">
                <button type="submit" style="width:100%; background:#10b981; color:white; border:none; padding:18px; border-radius:18px; font-weight:800; font-size:1.1rem; cursor:pointer; transition:0.3s; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);">
                    Complete Registration
                </button>
            </div>
        </form>
    </div>

    <style>
        @keyframes modalPop { 
            from { transform: scale(0.9) translateY(30px); opacity: 0; } 
            to { transform: scale(1) translateY(0); opacity: 1; } 
        }

        /* Added Animation Styles */
        @keyframes textPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .loading-text-pulse { animation: textPulse 1.5s infinite; }
        
        #registration-form-overlay input:focus {
            border-color: #10b981 !important;
            background: white !important;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .ticket-radio input:checked + .ticket-box {
            border-color: #10b981 !important;
            background: #f0fdf4 !important;
        }

        .ticket-radio input:checked + .ticket-box .radio-circle {
            border-color: #10b981 !important;
            background: #10b981 !important;
            box-shadow: inset 0 0 0 3px white;
        }

        .ticket-box {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f9f9f9;
            border: 2px solid #eee;
            border-radius: 15px;
            font-weight: 600;
            color: #333;
            transition: 0.2s;
            cursor: pointer;
        }

        .radio-circle {
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 50%;
            display: inline-block;
            transition: 0.2s;
        }

        div::-webkit-scrollbar { width: 6px; }
        div::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        div::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        div::-webkit-scrollbar-thumb:hover { background: #10b981; }
    </style>
`;

        document.body.insertAdjacentHTML('beforeend', formHTML);
    },

    // --- HANDLER FOR FINAL SUBMISSION ---
    submitAttendeeRegistration: function(eventId) {
        const ev = HH_Bridge.getAllEvents().find(e => e.id == eventId);
        const fname = document.getElementById('att-fname').value.trim();
        const lname = document.getElementById('att-lname').value.trim();
        const email = document.getElementById('att-email').value.trim();
        const phone = document.getElementById('att-phone').value.trim();
        const org = document.getElementById('att-org').value.trim();
        const ticketType = document.querySelector('input[name="ticket-type"]:checked').value;

        // Generate Unique Ticket ID
        const ticketID = "HH-" + Math.random().toString(36).substr(2, 8).toUpperCase();

        // 1. Processing UI State with Animation
        const btn = document.querySelector('#registration-form-overlay button[type="submit"]');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; gap: 10px;"><i class='bx bx-loader-alt bx-spin' style='font-size:1.4rem'></i><span class="loading-text-pulse">Sending Confirmation...</span></span>`;
        btn.style.background = "#9ca3af";

        // 2. Prepare Attendee Data Object
        const newAttendee = {
            ticketID: ticketID,
            eventId: eventId,
            eventName: ev.name,
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            org: org,
            ticketType: ticketType,
            status: 'Registered',
            dateRegistered: new Date().toISOString()
        };

        // 3. AUTOMATIC RECORDING (Save to Local Storage)
        // This ensures the dashboard sees the update immediately
        const currentAttendees = JSON.parse(localStorage.getItem('hh_attendees') || '[]');
        currentAttendees.push(newAttendee);
        localStorage.setItem('hh_attendees', JSON.stringify(currentAttendees));

        // 4. Prepare Data for PHP Email
        const formData = new FormData();
        formData.append('fname', fname);
        formData.append('email', email);
        formData.append('ticketType', ticketType);
        formData.append('eventName', ev.name);
        formData.append('phone', phone);
        formData.append('org', org);
        formData.append('ticketID', ticketID);

        // 5. Connect to Backend API for Email
        fetch('backend/api/send_email.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                this.closeRegistrationForm();
                this.showSuccessModal(fname, ev.name, email);
                this.renderEvents();
            } else {
                alert("Email Error: " + data.message);
                resetBtn();
            }
        })
        .catch(error => {
            console.error('Connection Error:', error);
            resetBtn();
        });

        function resetBtn() {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            btn.style.background = "#10b981";
        }
    },

    // --- MODAL 3: SUCCESS NOTIFICATION ---
    showSuccessModal: function(attendeeName, eventName, email) {
        const successHTML = `
            <div id="success-modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:11000; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(10px); padding: 20px;">
                <div style="background:white; width:100%; max-width:450px; border-radius:30px; padding:45px 35px; text-align:center; animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                    <div style="width:80px; height:80px; background:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 25px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);">
                        <i class='bx bx-check' style="color:white; font-size: 50px;"></i>
                    </div>
                    <h2 style="font-size:1.6rem; font-weight:800; color:#111; margin-bottom:12px;">Registration Successful!</h2>
                    <p style="color:#666; line-height:1.6; margin-bottom:30px;">
                        Thank you, <b>${attendeeName}</b>! You have successfully registered for <b>${eventName}</b>. 
                        A confirmation has been sent to <b>${email}</b>.
                    </p>
                    <button onclick="HH_Display.closeSuccessModal()" style="width:100%; background:#111; color:white; border:none; padding:18px; border-radius:18px; font-weight:700; font-size:1rem; cursor:pointer; transition:0.3s;">
                        Awesome, see you there!
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', successHTML);
        document.body.style.overflow = 'hidden';
    },

    closeModal: function() {
        const modal = document.getElementById('event-modal-overlay');
        if (modal) modal.remove();
        document.body.style.overflow = 'auto';
    },

    closeRegistrationForm: function() {
        const form = document.getElementById('registration-form-overlay');
        if (form) form.remove();
        document.body.style.overflow = 'auto';
    },

    closeSuccessModal: function() {
        const modal = document.getElementById('success-modal-overlay');
        if (modal) modal.remove();
        document.body.style.overflow = 'auto';
    },

    // --- CARD HTML TEMPLATE ---
    createCardHTML: function(ev) {
        const eventImg = ev.image || ev.img || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600";
        const canRegister = ev.status === "Upcoming";
        const startTimeAMPM = this.formatTimeAMPM(ev.startTime);

        let footerAction = "";
        let statusBadgeColor = "rgba(0,0,0,0.7)";

        if (ev.status === "Upcoming") {
            statusBadgeColor = "#2ecc71";
            footerAction = `<a href="javascript:void(0)" onclick="HH_Display.openRegistrationModal(${ev.id})" class="register-link" aria-label="Register for ${ev.name}">
                                Register now <span class="arrow-circle" aria-hidden="true">→</span>
                            </a>`;
        } else if (ev.status === "Active") {
            statusBadgeColor = "#f1c40f";
            footerAction = `<span style="color: #f1c40f; font-weight: 700; display: flex; align-items: center; gap: 5px;">
                                <i class='bx bxs-circle bx-flashing' style="font-size: 0.6rem; color: #ef4444;"></i> Happening Now
                            </span>`;
        } else {
            statusBadgeColor = "#95a5a6";
            footerAction = `<span style="color: #ff7675; font-weight: 600;">Registration Closed</span>`;
        }

        return `
            <article class="event-card" style="opacity: ${ev.status === 'Archived' ? '0.7' : '1'}; transition: all 0.5s ease;">
                <div class="card-image-wrapper">
                    <img src="${eventImg}" alt="${ev.name}" onerror="this.src='https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600'">
                    <span class="category-tag">${ev.category || 'Event'}</span>
                    <div style="position: absolute; top: 12px; right: 12px; background: ${statusBadgeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                        ${ev.status}
                    </div>
                </div>
                <div class="card-content">
                    <h3>${ev.name}</h3>
                    <div class="card-meta">
                        <span><i class='bx bx-map'></i> ${ev.location}</span>
                        <span><i class='bx bx-calendar'></i> ${ev.date}</span>
                        <span><i class='bx bx-time-five'></i> ${startTimeAMPM}</span>
                    </div>
                    <div class="card-footer">
                        <span class="price" style="font-weight: 800; color: #5a379d;">${ev.price || 'Free'}</span>
                        ${footerAction}
                    </div>
                </div>
            </article>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => HH_Display.init());