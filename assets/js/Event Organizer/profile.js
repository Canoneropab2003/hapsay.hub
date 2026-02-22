document.addEventListener('DOMContentLoaded', () => {
    /**
     * ==========================================
     * 1. ELEMENT SELECTIONS
     * ==========================================
     */
    const profileForm = document.getElementById('account-profile-form');
    
    // Avatar Elements
    const avatarImg = document.getElementById('user-avatar');
    const fileInput = document.getElementById('avatar-file-input');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const avatarClickable = document.getElementById('avatar-clickable');

    // Modal Elements (Save)
    const saveBtn = document.getElementById('profile-save-btn');
    const saveModal = document.getElementById('profile-confirm-modal');
    const cancelSave = document.getElementById('profile-modal-cancel');
    const confirmSave = document.getElementById('profile-modal-confirm');

    // Modal Elements (Discard)
    const discardBtn = document.querySelector('.btn-cancel');
    const discardModal = document.getElementById('discard-confirm-modal');
    const cancelDiscard = document.getElementById('discard-modal-cancel');
    const confirmDiscard = document.getElementById('discard-modal-confirm');

    // Toast Element
    const successToast = document.getElementById('profile-toast-alert');

    /**
     * ==========================================
     * 2. UTILITY FUNCTIONS
     * ==========================================
     */
    
    // Toggle Modal Visibility
    const toggleModal = (modal, show) => {
        if (show) {
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    };

    // Show Success Toast
    const showToast = () => {
        // Clear any existing timeouts if user saves multiple times quickly
        successToast.classList.remove('show');
        
        // Use a tiny timeout to trigger the CSS transition
        setTimeout(() => {
            successToast.classList.add('show');
        }, 10);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 3000);
    };

    /**
     * ==========================================
     * 3. AVATAR UPLOAD LOGIC
     * ==========================================
     */
    
    // Open file picker when button or image is clicked
    const openPicker = () => fileInput.click();
    changePhotoBtn.addEventListener('click', openPicker);
    avatarClickable.addEventListener('click', openPicker);

    // Handle Image Preview
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Check file size (2MB = 2097152 bytes)
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too large! Max limit is 2MB.");
                this.value = ""; // Clear selection
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                avatarImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    /**
     * ==========================================
     * 4. MODAL & FORM EVENTS
     * ==========================================
     */

    // --- SAVE FLOW ---
    saveBtn.addEventListener('click', () => toggleModal(saveModal, true));
    
    cancelSave.addEventListener('click', () => toggleModal(saveModal, false));

    confirmSave.addEventListener('click', () => {
        // Logic for actual data submission would go here
        
        // UI Feedback
        toggleModal(saveModal, false);
        showToast();
        console.log("Profile data saved.");
    });

    // --- DISCARD FLOW ---
    discardBtn.addEventListener('click', () => toggleModal(discardModal, true));

    cancelDiscard.addEventListener('click', () => toggleModal(discardModal, false));

    confirmDiscard.addEventListener('click', () => {
        // Resets text inputs to their original values
        profileForm.reset();
        
        // Close modal
        toggleModal(discardModal, false);
        console.log("Changes discarded.");
    });

    // --- BACKDROP CLOSING ---
    // Closes modals if user clicks the dark background area
    window.addEventListener('click', (e) => {
        if (e.target === saveModal) toggleModal(saveModal, false);
        if (e.target === discardModal) toggleModal(discardModal, false);
    });
});