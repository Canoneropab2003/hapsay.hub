/**
 * Hapsay Event Management System - Create/Edit Events Logic
 */

// Global variable to track which row we are currently editing or deleting
let currentEditingRow = null;

// Function to switch between the Details Form and the Categories List
function switchTab(tabName) {
    const detailsTab = document.getElementById('tab-details');
    const categoriesTab = document.getElementById('tab-categories');
    const buttons = document.querySelectorAll('.tab-btn');

    if (tabName === 'details') {
        if (detailsTab) detailsTab.style.display = 'grid';
        if (categoriesTab) categoriesTab.style.display = 'none';
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } 
    else if (tabName === 'categories') {
        if (detailsTab) detailsTab.style.display = 'none';
        if (categoriesTab) categoriesTab.style.display = 'block';
        buttons[1].classList.add('active');
        buttons[0].classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- MODAL ELEMENT REFERENCES ---
    const categoryModal = document.getElementById('category-modal');
    const deleteModal = document.getElementById('delete-modal');
    const modalInput = document.getElementById('modal-input-name');
    const modalTitle = document.getElementById('modal-title');
    const deleteCatNameSpan = document.getElementById('delete-cat-name');

    // --- 1. OPEN MODAL: CREATE NEW ---
    const createBtn = document.querySelector('.btn-create-category');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            currentEditingRow = null; // Reset tracking
            modalTitle.innerText = "Create New Category";
            modalInput.value = "";
            categoryModal.style.display = 'flex';
            modalInput.focus();
        });
    }

    // --- 2. CATEGORY LIST ACTIONS (EDIT & DELETE) ---
    const listContainer = document.querySelector('.category-items-container');
    if (listContainer) {
        listContainer.addEventListener('click', (e) => {
            // Check for EDIT button click
            const editBtn = e.target.closest('.btn-inline-edit');
            if (editBtn) {
                currentEditingRow = editBtn.closest('.category-list-item');
                const currentName = currentEditingRow.querySelector('.category-label').innerText;
                
                modalTitle.innerText = "Edit Category";
                modalInput.value = currentName;
                categoryModal.style.display = 'flex';
                modalInput.focus();
            }

            // Check for DELETE button click
            const deleteBtn = e.target.closest('.btn-inline-delete');
            if (deleteBtn) {
                currentEditingRow = deleteBtn.closest('.category-list-item');
                const catName = currentEditingRow.querySelector('.category-label').textContent;
                
                deleteCatNameSpan.innerText = catName;
                deleteModal.style.display = 'flex';
            }
        });
    }

    // --- 3. MODAL SAVE BUTTON (Handles both Create and Edit) ---
    const btnModalSave = document.getElementById('btn-modal-save');
    if (btnModalSave) {
        btnModalSave.addEventListener('click', () => {
            const name = modalInput.value.trim();
            if (!name) {
                alert("Please enter a category name.");
                return;
            }

            if (currentEditingRow) {
                // UPDATE EXISTING: We were in Edit mode
                currentEditingRow.querySelector('.category-label').innerText = name;
            } else {
                // CREATE NEW: We were in Create mode
                addNewCategoryRow(name);
            }
            closeAllModals();
        });
    }

    // --- 4. MODAL DELETE CONFIRMATION ---
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (currentEditingRow) {
                currentEditingRow.style.transition = '0.3s';
                currentEditingRow.style.opacity = '0';
                currentEditingRow.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    currentEditingRow.remove();
                    currentEditingRow = null;
                }, 300);
            }
            closeAllModals();
        });
    }

    // --- 5. MODAL CLOSE LOGIC ---
    function closeAllModals() {
        categoryModal.style.display = 'none';
        deleteModal.style.display = 'none';
    }

    // Close on Cancel button or "X" click
    document.querySelectorAll('.close-modal, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Close when clicking on the dark background overlay
    window.addEventListener('click', (e) => {
        if (e.target === categoryModal || e.target === deleteModal) {
            closeAllModals();
        }
    });
});

/**
 * Helper to inject a new category row into the list
 */
function addNewCategoryRow(name) {
    const container = document.querySelector('.category-items-container');
    const newRow = document.createElement('div');
    newRow.className = 'category-list-item';
    
    newRow.innerHTML = `
        <span class="category-label">${name}</span>
        <div class="category-item-actions">
            <button class="btn-inline-edit"><i class='bx bxs-edit-alt'></i> Edit</button>
            <button class="btn-inline-delete"><i class='bx bx-trash'></i></button>
        </div>
    `;
    
    container.appendChild(newRow);
}