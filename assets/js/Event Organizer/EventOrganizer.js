document.addEventListener('DOMContentLoaded', () => {

    /* ==================================================================
       1. CORE NAVIGATION & VIEW SWITCHING
       ================================================================== */
    
    // Select all sidebar items and any action cards on the dashboard
    const navTriggers = document.querySelectorAll('.sidebar-nav ul li, .action-card');
    const contentSections = document.querySelectorAll('.content-section');
    const sidebarItems = document.querySelectorAll('.sidebar-nav ul li');

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            // Get the target ID from the clicked element (e.g., "attendees-view")
            const targetId = this.getAttribute('data-target');

            // If it doesn't have a data-target, let it act like a normal link
            if (!targetId) return;

            e.preventDefault();

            // --- A. Handle Sidebar Active Styling ---
            // Remove 'active' class from all sidebar items
            sidebarItems.forEach(nav => nav.classList.remove('active'));
            
            // If the clicked item is a sidebar item, make it active
            // (If an action card was clicked, find the corresponding sidebar item and make IT active)
            const matchingSidebar = document.querySelector(`.sidebar-nav ul li[data-target="${targetId}"]`);
            if (matchingSidebar) {
                matchingSidebar.classList.add('active');
            }

            // --- B. Handle Content Switching ---
            // Hide all content sections
            contentSections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

            // Show the target content section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                // Small timeout to allow CSS animations (like fade-in) to trigger
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
            e.stopPropagation(); 
            qrModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    // Close Modal logic 
    closeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                qrModal.classList.remove('active');
                document.body.style.overflow = 'auto'; 
            });
        }
    });

    // Close Modal when clicking outside the modal box
    window.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            qrModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

});