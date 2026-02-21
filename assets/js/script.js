document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       1. SIDEBAR NAVIGATION & DYNAMIC CONTENT LOADING
       ========================================================================= */
    const menuItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    // Container references
    const containers = {
        'section-users': document.getElementById('users-container'),
        'section-events': document.getElementById('events-container'),
        'section-reports': document.getElementById('reports-container'),
        'section-logs': document.getElementById('logs-container'),
        'section-config': document.getElementById('config-container'),
        'section-settings': document.getElementById('settings-container')
    };

    // File mapping
    const fileMap = {
        'section-users': 'ManageUsers.html',
        'section-events': 'ViewAllEvents.html',
        'section-reports': 'ReportsAnalytics.html',
        'section-logs': 'AuditsLogsSecurity.html',
        'section-config': 'SystemConfiguration.html',
        'section-settings': 'PlatformSettingsBranding.html'
    };

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // STOP NAVIGATION if clicking inside a modal that is currently open
            if (document.querySelector('.modal-overlay[style*="display: flex"]')) {
                return; 
            }

            // Remove 'active' class from all items and add to clicked one
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            
            // Update Top Title Bar
            const menuText = item.querySelector('span').innerText;
            if(pageTitle) pageTitle.innerText = menuText;

            // Hide local sections (like Dashboard Overview)
            sections.forEach(section => { section.style.display = 'none'; });
            
            // Hide all external containers
            Object.values(containers).forEach(container => {
                if (container) container.style.display = 'none';
            });

            // Logic for External vs. Local Sections
            if (fileMap[targetId]) {
                loadSection(containers[targetId], fileMap[targetId]);
            } else if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) targetSection.style.display = 'block';
            }
        });
    });

    /**
     * Helper to load HTML. Using e.preventDefault() in the forms 
     * within these files is what prevents the "System Overview" jump.
     */
    function loadSection(container, filePath) {
        if (!container) return;
        
        // Only fetch if container is empty
        if (container.innerHTML.trim() === "") {
            fetch(filePath)
                .then(response => {
                    if (!response.ok) throw new Error(`Could not load ${filePath}`);
                    return response.text();
                })
                .then(data => {
                    container.innerHTML = data;
                    container.style.display = 'block';
                    
                    // Re-initialize ManageUsers logic if that was the file loaded
                    if (filePath === 'ManageUsers.html' && typeof window.renderUsers === 'function') {
                        window.updateRoleDropdown();
                        window.renderUsers();
                    }
                })
                .catch(err => {
                    console.error("Fetch error:", err);
                    container.innerHTML = `<p style="color:red; padding:20px;">Error loading content.</p>`;
                    container.style.display = 'block';
                });
        } else {
            container.style.display = 'block';
        }
    }

    /* =========================================================================
       2. GLOBAL SEARCH (Optimized for dynamic rows)
       ========================================================================= */
    const searchInput = document.querySelector('.pill-search input');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            // Targets table rows across all possible loaded sections
            const allRows = document.querySelectorAll('.list-data-row, .logs-table tr, .evt-row');

            allRows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    /* =========================================================================
       3. MODAL UTILITIES (For Overview Section)
       ========================================================================= */
    const setupModal = (modalId, openBtnId, closeBtnId) => {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);

        if (openBtn && modal) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevents conflict with sidebar click
                modal.classList.add('active');
            });
        }
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        }
    };

    setupModal('eventsModal', 'openModalBtn', 'closeModalBtn');
    setupModal('logsModal', 'openLogsModalBtn', 'closeLogsModalBtn');

    // Close modals on background click
    window.addEventListener('click', (e) => {
        const eventsModal = document.getElementById('eventsModal');
        const logsModal = document.getElementById('logsModal');
        if (e.target === eventsModal) eventsModal.classList.remove('active');
        if (e.target === logsModal) logsModal.classList.remove('active');
    });

    /* =========================================================================
       4. SYSTEM ACTIONS
       ========================================================================= */
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm('Are you sure you want to logout?')) {
                alert('Logging out...');
                // window.location.href = 'login.html'; 
            }
        });
    }

    const returnBtn = document.querySelector('.btn-return');
    if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Prevent accidental reload if a user is currently filling a form
            if (document.querySelector('.modal-overlay[style*="display: flex"]')) {
                alert("Please close the active form before returning.");
            } else {
                window.location.reload();
            }
        });
    }
});