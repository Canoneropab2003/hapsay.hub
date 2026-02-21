/**
 * About Us | Hapsay Logic
 * Handles navigation and subtle parallax background effects
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. NAVIGATION ---
    const backBtn = document.querySelector('nav a');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add a fade-out effect before leaving (optional)
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                window.location.href = "visitor.html"; // Adjust to your actual home filename
            }, 400);
        });
    }

    // --- 2. DYNAMIC NEBULA PARALLAX ---
    // This makes the background move slightly with the mouse for a premium feel
    const bgContainer = document.querySelector('.bg-container');
    const nebulas = document.querySelectorAll('.nebula');

    if (bgContainer) {
        window.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Calculate movement offset
            const moveX = (clientX - centerX) / 50;
            const moveY = (clientY - centerY) / 50;

            nebulas.forEach((nebula, index) => {
                // Each nebula layer moves at a slightly different speed
                const speed = (index + 1) * 0.5;
                nebula.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
            });
        });
    }

    // --- 3. REVEAL ANIMATIONS ---
    // Ensures the fade-in-up classes trigger correctly if not handled by CSS alone
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => {
        // Initial state before intersection
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
    });

    // --- 4. LOGO GLOW PULSE ---
    const logo = document.querySelector('.logo-glow img');
    if (logo) {
        // Add a gentle floating animation
        logo.animate([
            { transform: 'translateY(0px)' },
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(0px)' }
        ], {
            duration: 4000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }
});