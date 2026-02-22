/**
 * 1. STATE MANAGEMENT
 */
let users = [];
let roles = ["Admin", "Event Organizer", "Viewer", "Volunteer", "Event Staff / Scan"];
let currentFilter = 'All';

// Pagination State
let currentPage = 1;
const rowsPerPage = 10;

// Temporary storage for deletion logic
let userIdToDelete = null;

/**
 * 2. INITIALIZATION
 */
function initManageUsers() {
    updateRoleDropdown();
    renderUsers();
    setupPasswordToggle();
}

/**
 * NICER POP-UP (TOAST) LOGIC
 */
function showToast(message, type = 'error') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;
    
    const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
    const iconColor = type === 'success' ? '#10b981' : '#ef4444';

    toast.innerHTML = `
        <i class='bx ${icon}' style="color: ${iconColor}"></i>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastSlideIn 0.3s ease-in reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 3. THE SAVE LOGIC (WITH DUPLICATE CHECKING & NICER POPUPS)
 */
function saveUserLogic(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('input-error'));

    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const loginIDEl = document.getElementById('userLoginID');
    const passwordEl = document.getElementById('userPassword');
    const roleEl = document.getElementById('userRole');

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const loginID = loginIDEl.value.trim();
    const password = passwordEl.value;
    const role = roleEl.value;
    const grantAccess = document.getElementById('grantAccess').checked;

    if (!name || !email || !loginID || !password || !role) {
        showToast("Please fill in all login credentials.");
        return;
    }

    const id = document.getElementById('editUserId').value;
    
    const duplicate = users.find(user => {
        if (id && user.id === parseInt(id)) return false;
        return user.name.toLowerCase() === name.toLowerCase() || 
               user.email.toLowerCase() === email.toLowerCase() || 
               user.loginID.toLowerCase() === loginID.toLowerCase();
    });

    if (duplicate) {
        if (duplicate.name.toLowerCase() === name.toLowerCase()) {
            nameEl.classList.add('input-error');
            showToast("This Name is already registered.");
        } else if (duplicate.email.toLowerCase() === email.toLowerCase()) {
            emailEl.classList.add('input-error');
            showToast("This Email Address is already in use.");
        } else {
            loginIDEl.classList.add('input-error');
            showToast("This Username/Login ID is already taken.");
        }
        return; 
    }

    const userData = {
        id: id ? parseInt(id) : Date.now(),
        name, email, loginID, password, role,
        canLogin: grantAccess,
        status: id ? (users.find(u => u.id === parseInt(id)).status) : "Active"
    };

    if (id) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index !== -1) users[index] = userData;
        showToast("User updated successfully!", "success");
    } else {
        users.push(userData);
        showToast("User created successfully!", "success");
    }

    closeUserModal();
    renderUsers();
}

/**
 * 4. CUSTOM DELETE MODAL LOGIC (NICER POPUP)
 */
function openDeleteModal(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    userIdToDelete = id;
    const modal = document.getElementById('deleteConfirmModal');
    const msg = document.getElementById('deleteModalMsg');
    
    if (msg) {
        msg.innerHTML = `Are you sure you want to permanently delete user <b style="color:#333;">${user.name}</b>? This action cannot be undone.`;
    }
    
    if (modal) modal.style.display = 'flex';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'none';
    userIdToDelete = null;
}

function confirmDeleteUser() {
    if (userIdToDelete !== null) {
        const index = users.findIndex(u => u.id === userIdToDelete);
        if (index !== -1) {
            users.splice(index, 1);
            showToast("User deleted successfully.", "success");
            renderUsers();
        }
    }
    closeDeleteModal();
}

function saveRoleLogic(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const roleInput = document.getElementById('newRoleName');
    const roleName = roleInput.value.trim();

    if (!roleName) {
        showToast("Please enter a role name.");
        return;
    }

    if (!roles.some(r => r.toLowerCase() === roleName.toLowerCase())) {
        roles.push(roleName);
        updateRoleDropdown(); 
        closeRoleModal();
        showToast("New role created successfully!", "success");
    } else {
        showToast("This role already exists.");
        roleInput.classList.add('input-error');
    }
}

/**
 * 5. TABLE RENDERING (With Pagination & Action Buttons)
 */
function renderUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || "";
    
    const filteredUsers = users.filter(user => {
        const matchesStatus = (currentFilter === 'All' || user.status === currentFilter);
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                              user.loginID.toLowerCase().includes(searchTerm) ||
                              user.role.toLowerCase().includes(searchTerm) ||
                              user.email.toLowerCase().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const totalUsers = filteredUsers.length;
    // UPDATED: Removed the "|| 1" so totalPages can be 0 when no users exist
    const totalPages = Math.ceil(totalUsers / rowsPerPage); 
    
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (totalPages === 0) currentPage = 1;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    if (usersToShow.length === 0) {
        tableBody.innerHTML = `
            <div id="empty-state-placeholder" style="padding: 60px 20px; text-align: center; color: #9b69e4; grid-column: 1 / -1;">
                <i class='bx bx-user-x' style="font-size: 50px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p style="font-weight: 600;">No users found.</p>
            </div>`;
    } else {
        tableBody.innerHTML = usersToShow.map(user => `
            <div class="list-data-row">
                <div class="user-bold" title="${user.name}">${user.name}</div>
                <div class="user-email" title="${user.email}">
                    ${user.email}<br>
                    <small style="color:#9b69e4; font-weight:600;">ID: ${user.loginID}</small>
                </div>
                <div>${user.role}</div>
                <div>
                    <span class="badge ${user.status.toLowerCase()}">${user.status}</span>
                    ${!user.canLogin ? '<br><small style="color:red;">No Login Access</small>' : ''}
                </div>
                <div class="user-actions">
                    <button type="button" class="btn-edit-user" onclick="editUser(${user.id})" title="Edit">
                        <i class='bx bx-edit'></i>
                    </button>
                    <button type="button" class="${user.status === 'Active' ? 'btn-suspend-user' : 'btn-approve-user'}" 
                            onclick="toggleUserStatus(${user.id})" title="${user.status === 'Active' ? 'Suspend' : 'Approve'}">
                        <i class='bx bx-power-off'></i>
                    </button>
                    <button type="button" class="btn-delete-user" onclick="openDeleteModal(${user.id})" title="Delete User">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updatePaginationUI(totalPages, totalUsers, startIndex, usersToShow.length);
}

function updatePaginationUI(totalPages, totalUsers, startIndex, countOnPage) {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const totalCountEl = document.getElementById('total-count');
    const footerCountEl = document.getElementById('footer-count');

    if (totalCountEl) totalCountEl.innerText = users.length;
    
    if (pageNumbersContainer) {
        pageNumbersContainer.innerHTML = '';
        // UPDATED: If totalPages is 0, this loop will not run, hiding Number 1
        for (let i = 1; i <= totalPages; i++) {
            const pageSpan = document.createElement('span');
            pageSpan.innerText = i;
            pageSpan.className = `page-num ${i === currentPage ? 'active' : ''}`;
            pageSpan.onclick = () => { currentPage = i; renderUsers(); };
            pageNumbersContainer.appendChild(pageSpan);
        }
    }

    // UPDATED: Buttons stay disabled if no data is present
    if (prevBtn) prevBtn.disabled = currentPage === 1 || totalUsers === 0;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalUsers === 0;

    if (footerCountEl) {
        if (totalUsers === 0) {
            footerCountEl.innerText = `Showing 0 to 0 of 0 Users`;
        } else {
            const startDisplay = startIndex + 1;
            const endDisplay = startIndex + countOnPage;
            footerCountEl.innerText = `Showing ${startDisplay} to ${endDisplay} of ${totalUsers} Users`;
        }
    }
}

function changePage(direction) {
    currentPage += direction;
    renderUsers();
}

/**
 * 6. PREMIUM EXPORT LOGIC
 */
async function exportData(format) {
    if (users.length === 0) {
        showToast("No user data available to export.");
        return;
    }

    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Generating...`;

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        if (format === 'csv') {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Name,Email,LoginID,Role,Status,Login Access\n";

            users.forEach(user => {
                const row = [
                    `"${user.name}"`,
                    `"${user.email}"`,
                    `"${user.loginID}"`,
                    `"${user.role}"`,
                    `"${user.status}"`,
                    user.canLogin ? "Granted" : "Denied"
                ].join(",");
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Users_Export_${new Date().toLocaleDateString().replace(/\//g,'-')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast("CSV File downloaded successfully!", "success");
        } 
        else if (format === 'pdf') {
            showToast("Opening Print Dialog...", "success");
            window.print();
        }
    } catch (err) {
        showToast("Export failed. Please try again.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * 7. DROPDOWNS & MODALS
 */
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePw');
    const passwordInput = document.getElementById('userPassword');
    
    if (toggleBtn && passwordInput) {
        toggleBtn.onclick = function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('bx-show');
            this.classList.toggle('bx-hide');
        };
    }
}

function updateRoleDropdown() {
    const roleSelect = document.getElementById('userRole');
    if (roleSelect) {
        roleSelect.innerHTML = '<option value="">Select Dashboard Role</option>' + 
            roles.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

function openAddModal() {
    const form = document.getElementById('userForm');
    if (form) form.reset();
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.getElementById('editUserId').value = "";
    document.getElementById('modalTitle').innerText = "Add New User";
    document.getElementById('userPassword').setAttribute('type', 'password');
    document.getElementById('userModal').style.display = 'flex';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.getElementById('modalTitle').innerText = "Edit User Credentials";
        document.getElementById('editUserId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userLoginID').value = user.loginID;
        document.getElementById('userPassword').value = user.password;
        document.getElementById('userRole').value = user.role;
        document.getElementById('grantAccess').checked = user.canLogin;
        document.getElementById('userModal').style.display = 'flex';
    }
}

function closeUserModal() { document.getElementById('userModal').style.display = 'none'; }
function openRoleModal() { document.getElementById('roleModal').style.display = 'flex'; }
function closeRoleModal() { document.getElementById('roleModal').style.display = 'none'; }

function toggleUserStatus(id) {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        const newStatus = users[index].status === 'Active' ? 'Suspended' : 'Active';
        users[index].status = newStatus;
        showToast(`User status changed to ${newStatus}`, "success");
        renderUsers();
    }
}

function selectStatus(status) {
    currentFilter = status;
    currentPage = 1; 
    const statusBtn = document.getElementById('status-filter-btn');
    const filterLabel = document.getElementById('current-filter-label');
    
    if (statusBtn) statusBtn.innerHTML = `${status} <i class='bx bx-chevron-down'></i>`;
    if (filterLabel) filterLabel.innerHTML = `${status} <i class='bx bx-chevron-down'></i>`;
    
    renderUsers();
    const box = document.getElementById('status-pop-box');
    if (box) box.classList.remove('show');
}

function togglePopBox(id) {
    const box = document.getElementById(id);
    if (box) box.classList.toggle('show');
}

/**
 * 8. GLOBAL LISTENERS
 */
window.addEventListener('click', (e) => {
    if (!e.target.closest('.pop-box-wrapper')) {
        document.querySelectorAll('.pop-box-content').forEach(box => box.classList.remove('show'));
    }
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'user-search') {
        currentPage = 1; 
        renderUsers();
    }
});

window.onload = initManageUsers;