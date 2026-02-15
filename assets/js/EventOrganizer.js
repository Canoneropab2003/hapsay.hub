document.addEventListener('DOMContentLoaded', () => {

    /* ==================================================================
       1. CORE NAVIGATION & VIEW SWITCHING
       ================================================================== */
    
    // Select sidebar items AND the dashboard quick action cards
    const navTriggers = document.querySelectorAll('.sidebar-nav ul li, .action-card');
    const contentSections = document.querySelectorAll('.content-section');
    const sidebarItems = document.querySelectorAll('.sidebar-nav ul li');

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            // Get the target ID (e.g., "dashboard-view" or "create-edit-view")
            const targetId = this.getAttribute('data-target');

            // If no target is defined, let the default behavior happen (for normal links)
            if (!targetId) return;

            e.preventDefault();

            // --- A. Handle Sidebar Active Styling ---
            sidebarItems.forEach(nav => nav.classList.remove('active'));
            
            // Find the sidebar item that matches this target and highlight it
            const matchingSidebar = document.querySelector(`.sidebar-nav li[data-target="${targetId}"]`);
            if (matchingSidebar) {
                matchingSidebar.classList.add('active');
            }

            // --- B. Handle Content Switching ---
            contentSections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                // Small timeout to ensure the browser registers the display change 
                // so the CSS "fadeInUp" animation triggers correctly.
                setTimeout(() => {
                    targetSection.classList.add('active');
                }, 10);
            }
        });
    });


    /* ==================================================================
       2. QR MODAL LOGIC (POPUP)
       ================================================================== */
    
    const qrModal = document.getElementById('qrInfoModal');
    const openBtn = document.getElementById('triggerQrModal'); 
    const closeButtons = [
        document.getElementById('closeQrModalBtn'),
        document.getElementById('closeQrModalBtnBottom')
    ];

    // Open Modal logic
    if (openBtn && qrModal) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); // Prevents the click from bubbling up
            qrModal.classList.add('active');
            // Prevent scrolling on the body while modal is open
            document.body.style.overflow = 'hidden';
        });
    }

    // Close Modal logic (for all close buttons)
    closeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                qrModal.classList.remove('active');
                document.body.style.overflow = 'auto'; // Restore scrolling
            });
        }
    });

    // Close Modal when clicking the dark background overlay
    window.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

});