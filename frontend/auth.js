const API_BASE = 'http://localhost:5000/api';

// Auth state
let authToken = localStorage.getItem('authToken');
let currentUsername = localStorage.getItem('currentUsername');
let isAdmin = localStorage.getItem('isAdmin') === 'true';

// Initialize auth UI
function initializeAuth() {
    if (authToken) {
        showMainApp();
    } else {
        showAuthPage();
    }
}

// Show auth page
function showAuthPage() {
    document.getElementById('authPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('adminPage').classList.add('hidden');
}

// Show main app
function showMainApp() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('adminPage').classList.add('hidden');
    document.getElementById('currentUser').textContent = currentUsername;
    
    // Show admin button if user is admin
    if (isAdmin) {
        document.getElementById('adminPanelBtn').classList.remove('hidden');
    } else {
        document.getElementById('adminPanelBtn').classList.add('hidden');
    }
}

// Show admin page
function showAdminPage() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('adminPage').classList.remove('hidden');
    loadAdminData();
}

// Toggle between login and register forms
document.getElementById('toggleRegisterBtn').addEventListener('click', () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('authError').classList.add('hidden');
});

document.getElementById('toggleLoginBtn').addEventListener('click', () => {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('authError').classList.add('hidden');
});

// Login
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showAuthError('Username and password required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUsername = data.username;
            isAdmin = data.is_admin;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUsername', currentUsername);
            localStorage.setItem('isAdmin', isAdmin);
            
            showMainApp();
        } else {
            showAuthError(data.error || 'Login failed');
        }
    } catch (error) {
        showAuthError('Error connecting to server');
        console.error(error);
    }
});

// Register
document.getElementById('registerBtn').addEventListener('click', async () => {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    
    if (!username || !password) {
        showAuthError('Username and password required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAuthError('');
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('loginUsername').value = username;
            document.getElementById('loginPassword').value = '';
        } else {
            showAuthError(data.error || 'Registration failed');
        }
    } catch (error) {
        showAuthError('Error connecting to server');
        console.error(error);
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
    } catch (error) {
        console.error(error);
    }
    
    authToken = null;
    currentUsername = null;
    isAdmin = false;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('isAdmin');
    
    // Clear form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    
    showAuthPage();
});

// Admin panel
document.getElementById('adminPanelBtn').addEventListener('click', showAdminPage);
document.getElementById('backToJournalBtn').addEventListener('click', showMainApp);

// Load admin data
async function loadAdminData() {
    try {
        const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            document.getElementById('totalUsers').textContent = statsData.stats.total_users;
            document.getElementById('totalEntries').textContent = statsData.stats.total_entries;
            document.getElementById('totalAdmins').textContent = statsData.stats.total_admins;
        }
        
        const usersResponse = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const usersData = await usersResponse.json();
        
        if (usersData.success) {
            displayUserTable(usersData.users);
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Display user table
function displayUserTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(user => {
        const createdDate = new Date(user.created_at).toLocaleDateString();
        return `
            <tr class="border-b border-slate-600/30 hover:bg-slate-700/20 transition">
                <td class="px-4 py-3 font-semibold">${user.username}</td>
                <td class="px-4 py-3">${user.email || '-'}</td>
                <td class="px-4 py-3">${user.entry_count}</td>
                <td class="px-4 py-3">
                    <span class="${user.is_admin ? 'text-purple-400' : 'text-slate-500'} font-semibold">
                        ${user.is_admin ? '✓ Admin' : '—'}
                    </span>
                </td>
                <td class="px-4 py-3 text-slate-400">${createdDate}</td>
                <td class="px-4 py-3 space-x-2">
                    ${user.username !== currentUsername ? `
                        ${!user.is_admin ? `
                            <button onclick="makeUserAdmin('${user.username}')" class="px-3 py-1 bg-purple-600/50 hover:bg-purple-600 text-purple-200 text-xs rounded transition">
                                Make Admin
                            </button>
                        ` : `
                            <button onclick="removeUserAdmin('${user.username}')" class="px-3 py-1 bg-slate-600/50 hover:bg-slate-600 text-slate-200 text-xs rounded transition">
                                Remove Admin
                            </button>
                        `}
                        <button onclick="deleteUser('${user.username}')" class="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-red-200 text-xs rounded transition">
                            Delete
                        </button>
                    ` : `<span class="text-slate-500 text-xs">—</span>`}
                </td>
            </tr>
        `;
    }).join('');
}

// Admin actions
async function makeUserAdmin(username) {
    try {
        const response = await fetch(`${API_BASE}/admin/users/${username}/make-admin`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            loadAdminData();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error updating user');
    }
}

async function removeUserAdmin(username) {
    try {
        const response = await fetch(`${API_BASE}/admin/users/${username}/remove-admin`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            loadAdminData();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error updating user');
    }
}

async function deleteUser(username) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/users/${username}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            loadAdminData();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error deleting user');
    }
}

// Helper function
function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
    }
}

// Initialize
initializeAuth();
