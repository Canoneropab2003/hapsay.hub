/**
 * Hapsay - Event Planning Interactive Logic
 * Features: Live Search, Category Filtering, Smooth Scrolling
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const eventSearch = document.getElementById('eventSearch');
    const categoryDropdown = document.querySelector('.category-dropdown');
    const eventCards = document.querySelectorAll('.event-card');
    const scrollIcon = document.querySelector('.scroll-icon'); // Hero down arrow
    const backToTopBtn = document.getElementById('backToTop'); // Your footer up arrow
    const eventsSection = document.querySelector('.upcoming-events-section');
    const eventCountBadge = document.querySelector('.event-count-badge');

    // --- 1. Filter Logic ---
    const filterEvents = () => {
        const searchTerm = eventSearch ? eventSearch.value.toLowerCase() : '';
        const selectedCategory = categoryDropdown ? categoryDropdown.value.toLowerCase() : 'all';
        let visibleCount = 0;

        eventCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const categoryTag = card.querySelector('.category-tag');
            const category = categoryTag ? categoryTag.textContent.toLowerCase() : '';

            // Check if matches search text
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            
            // Check if matches category
            const matchesCategory = selectedCategory === 'all' || 
                                    selectedCategory === 'all category' || 
                                    category === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.4s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update the badge
        if (eventCountBadge) {
            eventCountBadge.textContent = `${visibleCount} event${visibleCount === 1 ? '' : 's'}`;
        }
        
        handleNoResults(visibleCount);
    };

    // --- 2. Event Listeners ---

    // Search and Category Inputs
    if (eventSearch) eventSearch.addEventListener('input', filterEvents);
    if (categoryDropdown) categoryDropdown.addEventListener('change', filterEvents);

    // Hero Scroll Down (The SVG icon in the hero section)
    if (scrollIcon && eventsSection) {
        scrollIcon.addEventListener('click', () => {
            eventsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // BACK TO TOP (The footer arrow)
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            // Method 1: Standard Window Scroll
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Method 2: Fallback for older browsers/Safari
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
    }

    // --- 3. UI Helpers ---
    const handleNoResults = (count) => {
        let noResultsMsg = document.getElementById('no-results-msg');
        const grid = document.querySelector('.events-grid');
        
        if (count === 0) {
            if (!noResultsMsg && grid) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-results-msg';
                noResultsMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; color: #666; font-weight: 500;';
                noResultsMsg.innerHTML = '<h3>No events found matching your criteria.</h3>';
                grid.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    };
});