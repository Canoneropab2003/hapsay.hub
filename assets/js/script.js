document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       1. SIDEBAR NAVIGATION & DYNAMIC CONTENT LOADING
       ========================================================================= */
    const menuItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    // Define containers for external HTML content
    const usersContainer = document.getElementById('users-container');
    const eventsContainer = document.getElementById('events-container');
    const reportsContainer = document.getElementById('reports-container');
    const logsContainer = document.getElementById('logs-container');
    const configContainer = document.getElementById('config-container');
    const settingsContainer = document.getElementById('settings-container'); // Added for Platform Settings

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove 'active' class from all sidebar items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add 'active' class to the currently clicked item
            item.classList.add('active');

            // Get target section ID from the data-target attribute
            const targetId = item.getAttribute('data-target');
            
            // Update the Top Title Bar text
            const menuText = item.querySelector('span').innerText;
            if(pageTitle) pageTitle.innerText = menuText;

            // Reset visibility for standard local sections (like System Overview)
            sections.forEach(section => { section.style.display = 'none'; });
            
            // Hide all external containers by default to ensure clean switching
            if (usersContainer) usersContainer.style.display = 'none';
            if (eventsContainer) eventsContainer.style.display = 'none';
            if (reportsContainer) reportsContainer.style.display = 'none';
            if (logsContainer) logsContainer.style.display = 'none';
            if (configContainer) configContainer.style.display = 'none';
            if (settingsContainer) settingsContainer.style.display = 'none';

            // --- Handle Logic for External vs. Local Sections ---
            if (targetId === 'section-users') {
                loadSection(usersContainer, 'ManageUsers.html');
            } 
            else if (targetId === 'section-events') {
                loadSection(eventsContainer, 'ViewAllEvents.html');
            } 
            else if (targetId === 'section-reports') {
                loadSection(reportsContainer, 'ReportsAnalytics.html'); 
            } 
            else if (targetId === 'section-logs') {
                loadSection(logsContainer, 'AuditsLogsSecurity.html');
            }
            else if (targetId === 'section-config') {
                loadSection(configContainer, 'SystemConfiguration.html');
            }
            // Logic for Platform Settings & Branding
            else if (targetId === 'section-settings') {
                loadSection(settingsContainer, 'PlatformSettingsBranding.html');
            }
            // Logic for static sections (like System Overview)
            else if (targetId) {
                const targetSection = document.getElementById(targetId);
                if (targetSection) targetSection.style.display = 'block';
            }
        });
    });

    /**
     * Helper function to load external HTML content
     * Fetches the file only if the container is empty to save bandwidth
     */
    function loadSection(container, filePath) {
        if (container) {
            if (container.innerHTML.trim() === "") {
                fetch(filePath)
                    .then(response => {
                        if (!response.ok) throw new Error(`Cannot GET /${filePath}`);
                        return response.text();
                    })
                    .then(data => {
                        container.innerHTML = data;
                        container.style.display = 'block';
                    })
                    .catch(err => {
                        console.error(`Error loading ${filePath}:`, err);
                        container.innerHTML = `<p style="color:red; padding:20px;">Error: ${filePath} could not be loaded. Please check if the file exists.</p>`;
                        container.style.display = 'block';
                    });
            } else {
                container.style.display = 'block';
            }
        }
    }

    /* =========================================================================
       2. GLOBAL SEARCH FUNCTIONALITY
       ========================================================================= */
    const searchInput = document.querySelector('.pill-search input');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            // Selects rows from various tables and lists across the dashboard
            const allRows = document.querySelectorAll('.logs-table tbody tr, .events-inner-box .evt-row, .list-data-row, .audit-table tbody tr');

            allRows.forEach(row => {
                const rowText = row.innerText.toLowerCase();
                if (rowText.includes(searchTerm)) {
                    row.style.display = ''; // Show matches
                } else {
                    row.style.display = 'none'; // Hide non-matches
                }
            });
        });
    }

    /* =========================================================================
       3. MODAL LOGIC (Popups)
       ========================================================================= */
    
    // Recent Events Modal
    const eventsModal = document.getElementById('eventsModal');
    const openEventsBtn = document.getElementById('openModalBtn');
    const closeEventsBtn = document.getElementById('closeModalBtn');

    if (openEventsBtn && eventsModal) {
        openEventsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            eventsModal.classList.add('active');
        });
    }

    if (closeEventsBtn && eventsModal) {
        closeEventsBtn.addEventListener('click', () => {
            eventsModal.classList.remove('active');
        });
    }

    // Security Logs Modal
    const logsModal = document.getElementById('logsModal');
    const openLogsBtn = document.getElementById('openLogsModalBtn');
    const closeLogsBtn = document.getElementById('closeLogsModalBtn');

    if (openLogsBtn && logsModal) {
        openLogsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logsModal.classList.add('active');
        });
    }

    if (closeLogsBtn && logsModal) {
        closeLogsBtn.addEventListener('click', () => {
            logsModal.classList.remove('active');
        });
    }

    // Close modals when clicking outside the content box
    window.addEventListener('click', (e) => {
        if (e.target === eventsModal) eventsModal.classList.remove('active');
        if (e.target === logsModal) logsModal.classList.remove('active');
    });

    /* =========================================================================
       4. SYSTEM BUTTONS (Logout & Return)
       ========================================================================= */
    
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm('Are you sure you want to logout?')) {
                alert('Logging out...');
                // window.location.href = 'login.html'; // Uncomment to redirect
            }
        });
    }

    const returnBtn = document.querySelector('.btn-return');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
});