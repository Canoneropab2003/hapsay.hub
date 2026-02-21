/**
 * HapsayHub Pricing Logic
 * Handles micro-interactions and high-end page transitions
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MODERN PAGE ENTRANCE ---
    // Stagger the cards so they pop in one by one
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 150 * (index + 1)); // Staggered delay
    });

    // --- 2. BACK TO HOME TRANSITION ---
    const homeBtn = document.querySelector('.back-link');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Create modern top-loading line
            const loader = document.createElement('div');
            Object.assign(loader.style, {
                position: 'fixed',
                top: '0', left: '0', height: '3px', width: '0%',
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                zIndex: '10000', boxShadow: '0 0 10px #a855f7',
                transition: 'width 0.6s cubic-bezier(0.1, 0.7, 1.0, 0.1)'
            });
            document.body.appendChild(loader);

            // Animate exit
            requestAnimationFrame(() => {
                loader.style.width = '100%';
                document.querySelector('.container').style.transition = 'all 0.6s ease';
                document.querySelector('.container').style.opacity = '0';
                document.querySelector('.container').style.transform = 'scale(0.98)';
            });

            setTimeout(() => {
                window.location.href = "visitor.html";
            }, 600);
        });
    }

    // --- 3. PRICING BUTTON FEEDBACK ---
    const pricingButtons = document.querySelectorAll('.btn');
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const planName = this.closest('.card').querySelector('h2').innerText;
            
            // Modern "Ripple" or "Pulse" effect
            this.innerHTML = '<span class="loading-spinner"></span> Processing...';
            this.style.backgroundColor = '#4338ca'; // Darker indigo
            this.disabled = true;

            // Simulated "Success" redirection or modal
            setTimeout(() => {
                alert(`Redirecting to ${planName} plan setup...`);
                this.innerHTML = 'Try this';
                this.disabled = false;
                this.style.backgroundColor = ''; // Reverts to CSS default
            }, 1000);
        });
    });

    // --- 4. CARD HOVER DEPTH ---
    // Adding extra parallax-lite feel to the popular card
    const popularCard = document.querySelector('.card.popular');
    if (popularCard) {
        popularCard.addEventListener('mousemove', (e) => {
            const rect = popularCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            popularCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        popularCard.addEventListener('mouseleave', () => {
            popularCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.05)';
        });
    }
});