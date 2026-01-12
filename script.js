/* ==========================================
   FIREBASE CONFIGURATION & INITIALIZATION
   ========================================== */

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "it-asset-system-2091b.firebaseapp.com",
    projectId: "it-asset-system-2091b",
    storageBucket: "it-asset-system-2091b.firebasestorage.app",
    messagingSenderId: "788162777362",
    appId: "1:788162777362:web:29481f4c345dae382063cb",
    measurementId: "G-VNHV6QEDWP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ==========================================
   GLOBAL STATE
   ========================================== */

let currentUser = null;
let currentUserData = null;
let allAssets = [];
let allCategories = [];
let allLocations = [];
let allUsers = [];
let currentGlobalCampus = '';

function currentUserHasAccess(campus) {
    if (!campus) return true; // Global assets
    if (currentUserData.role === 'Admin') return true;
    if (!currentUserData.allowedCampuses || currentUserData.allowedCampuses.length === 0) return false;
    return currentUserData.allowedCampuses.includes(campus);
}

function handleGlobalCampusChange() {
    currentGlobalCampus = document.getElementById('globalCampusFilter').value;
    updateDashboard();
    loadAssets(); // re-display with filter
    loadLocations();
    loadCategories();
}

/* ==========================================
   DATABASE INITIALIZATION
   ========================================== */

async function initializeDatabase() {
    try {
        console.log('Checking if database needs initialization...');

        const catSnapshot = await db.collection('categories').limit(1).get();
        if (!catSnapshot.empty) {
            console.log('Database already initialized - skipping setup');
            hideSetupPage();
            return;
        }

        console.log('Initializing database with default data...');

        const categories = [
            { name: 'Computers', description: 'Laptops, desktops, servers', active: true, createdAt: new Date() },
            { name: 'Networking', description: 'Routers, switches, modems', active: true, createdAt: new Date() },
            { name: 'Peripherals', description: 'Mice, keyboards, monitors', active: true, createdAt: new Date() },
            { name: 'Printers', description: 'Printers and copiers', active: true, createdAt: new Date() },
            { name: 'Phones', description: 'Mobile phones and tablets', active: true, createdAt: new Date() },
            { name: 'Storage', description: 'Hard drives and storage devices', active: true, createdAt: new Date() },
            { name: 'Software Licenses', description: 'Software and licenses', active: true, createdAt: new Date() },
            { name: 'Other', description: 'Miscellaneous IT assets', active: true, createdAt: new Date() }
        ];

        for (const cat of categories) {
            try {
                await db.collection('categories').add(cat);
            } catch (e) {
                console.log('Category already exists, skipping:', cat.name);
            }
        }

        const locations = [
            { building: 'Main Office', floor: 'GF', room: 'Server Room', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: 'GF', room: 'Reception', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: '1F', room: 'IT Department', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: '1F', room: 'Conference Room A', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: '1F', room: 'Conference Room B', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: '2F', room: 'Admin Office', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: '2F', room: 'Finance Department', active: true, createdAt: new Date() },
            { building: 'Main Office', floor: '3F', room: 'Sales Department', active: true, createdAt: new Date() }
        ];

        for (const loc of locations) {
            try {
                await db.collection('locations').add(loc);
            } catch (e) {
                console.log('Location already exists, skipping:', loc.room);
            }
        }

        const sampleAssets = [
            { name: 'Dell Latitude 5520', category: 'Computers', brand: 'Dell', model: 'Latitude 5520', condition: 'In Use', quantity: 15, location: 'Main Office-1F-IT Department', assignedTo: 'John Smith', notes: 'Assigned to team members', active: true, createdAt: new Date() },
            { name: 'MacBook Pro 14"', category: 'Computers', brand: 'Apple', model: 'MacBook Pro', condition: 'In Use', quantity: 5, location: 'Main Office-1F-IT Department', assignedTo: 'Design Team', notes: 'For design work', active: true, createdAt: new Date() },
            { name: 'Cisco Catalyst 9300', category: 'Networking', brand: 'Cisco', model: 'C9300-48T', condition: 'In Use', quantity: 2, location: 'Main Office-GF-Server Room', assignedTo: 'Network Team', notes: 'Core switches', active: true, createdAt: new Date() },
            { name: 'HP LaserJet Pro M404n', category: 'Printers', brand: 'HP', model: 'M404n', condition: 'In Use', quantity: 3, location: 'Main Office-1F-IT Department', assignedTo: '', notes: 'Network printers', active: true, createdAt: new Date() },
            { name: 'Dell U2720Q Monitor', category: 'Peripherals', brand: 'Dell', model: 'U2720Q', condition: 'In Use', quantity: 20, location: 'Main Office-1F-IT Department', assignedTo: '', notes: '27 inch 4K monitors', active: true, createdAt: new Date() },
            { name: 'iPhone 14 Pro', category: 'Phones', brand: 'Apple', model: 'iPhone 14 Pro', condition: 'Stock', quantity: 8, location: 'Main Office-1F-IT Department', assignedTo: '', notes: 'For executives', active: true, createdAt: new Date() },
            { name: 'Samsung 870 EVO SSD', category: 'Storage', brand: 'Samsung', model: '870 EVO 1TB', condition: 'Stock', quantity: 12, location: 'Main Office-GF-Server Room', assignedTo: '', notes: 'Backup storage', active: true, createdAt: new Date() },
            { name: 'Microsoft Office 365', category: 'Software Licenses', brand: 'Microsoft', model: '365 Pro', condition: 'In Use', quantity: 50, location: 'Main Office-1F-IT Department', assignedTo: '', notes: 'Active licenses', active: true, createdAt: new Date() },
            { name: 'Logitech MX Master 3S', category: 'Peripherals', brand: 'Logitech', model: 'MX Master 3S', condition: 'In Use', quantity: 25, location: 'Main Office-1F-IT Department', assignedTo: '', notes: 'Wireless mice', active: true, createdAt: new Date() },
            { name: 'HP DeskJet 4155e', category: 'Printers', brand: 'HP', model: 'DeskJet 4155e', condition: 'Broken', quantity: 1, location: 'Main Office-2F-Admin Office', assignedTo: '', notes: 'Needs repair', active: true, createdAt: new Date() }
        ];

        for (const asset of sampleAssets) {
            try {
                await db.collection('assets').add(asset);
            } catch (e) {
                console.log('Asset already exists, skipping:', asset.name);
            }
        }

        hideSetupPage();
    } catch (error) {
        console.error('Database initialization error:', error.message);
        hideSetupPage();
    }
}

function hideSetupPage() {
    document.getElementById('setupPage').classList.remove('active');
    showAuthPage();
}


/* ==========================================
   THEME SYSTEM
   ========================================== */

function initializeTheme() {
    // Get saved preferences from localStorage, or use defaults
    const savedScheme = localStorage.getItem('colorScheme') || 'light';
    const savedTheme = localStorage.getItem('colorTheme') || 'teal';
    
    // Apply the saved theme
    document.documentElement.setAttribute('data-color-scheme', savedScheme);
    document.documentElement.setAttribute('data-color-theme', savedTheme);
    
    // Update button states when settings page loads
    updateThemeButtonStates(savedScheme, savedTheme);
}

function setColorScheme(scheme) {
    document.documentElement.setAttribute('data-color-scheme', scheme);
    localStorage.setItem('colorScheme', scheme);
    updateThemeButtonStates(scheme, null);
    showToast('Switched to ' + scheme + ' mode', 'success');
}

function setColorTheme(theme) {
    document.documentElement.setAttribute('data-color-theme', theme);
    localStorage.setItem('colorTheme', theme);
    updateThemeButtonStates(null, theme);
    showToast('Applied ' + theme + ' theme', 'success');
}

function updateThemeButtonStates(scheme, theme) {
    // Update mode buttons (light/dark)
    if (scheme) {
        document.querySelectorAll('.theme-mode-btn').forEach(btn => {
            if (btn.dataset.mode === scheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Update color theme buttons
    if (theme) {
        document.querySelectorAll('.color-theme-btn').forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}



/* ==========================================
   DOM READY & EVENT LISTENERS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('showSignupLink').addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });
    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });
    window.onclick = (event) => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            if (event.target === modal) closeModal(modal.id);
        });
    };

    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    initializeDatabase();
    initializeTheme(); // Load saved theme preferences
});

/* ==========================================
   AUTH STATE LISTENER
   ========================================== */

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                currentUserData = userDoc.data();
                showMainApp();
                updateUserDisplay();
                updateNavigation();
                await loadAllData();
            } else {
                await auth.signOut();
                showAuthPage();
            }
        } catch (err) {
            console.error('Error loading user doc:', err);
            await auth.signOut();
            showAuthPage();
        }
    } else {
        currentUser = null;
        currentUserData = null;
        showAuthPage();
    }
});

/* ==========================================
   AUTH FUNCTIONS
   ========================================== */

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginError');
    errorBox.classList.remove('active');
    errorBox.textContent = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.add('active');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const errorBox = document.getElementById('signupError');
    errorBox.classList.remove('active');
    errorBox.textContent = '';

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const userData = {
            email,
            name,
            role: 'IT Staff',
            active: true,
            permissions: {},
            createdAt: new Date()
        };
        await db.collection('users').doc(result.user.uid).set(userData);
        document.getElementById('signupForm').reset();
        showToast('Account created! Please login with your credentials.', 'success');
        setTimeout(() => showLogin(), 1000);
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.add('active');
        showToast('Signup error: ' + error.message, 'error');
    }
}

function handleLogout() {
    auth.signOut();
}

/* ==========================================
   PAGE NAVIGATION
   ========================================== */

function showAuthPage() {
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('setupPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('signupPage').classList.remove('active');
}

function showMainApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('signupPage').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
}

function showLogin() {
    document.getElementById('signupPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
}

function showSignup() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('signupPage').classList.add('active');
}

function showPage(pageName) {
    document.querySelectorAll('.dashboard').forEach(el => el.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        assets: 'Asset Inventory',
        categories: 'Asset Categories',
        locations: 'Location Hierarchy',
        reports: 'Reports & Export',
        users: 'User Management',
        permissions: 'Role Permissions',
        settings: 'System Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName];

    if (currentUserData.role !== 'Admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Update Global Filter Options based on permissions
    const filterSelect = document.getElementById('globalCampusFilter');
    Array.from(filterSelect.options).forEach(opt => {
        if (opt.value === '') return;
        if (!currentUserHasAccess(opt.value)) {
            opt.style.display = 'none';
        } else {
            opt.style.display = 'block';
        }
    });

    // Set default filter if restricted
    if (currentUserData.role !== 'Admin' && currentUserData.allowedCampuses && currentUserData.allowedCampuses.length > 0) {
        // If current selection is invalid, switch to first allowed
        if (!currentUserHasAccess(currentGlobalCampus)) {
            currentGlobalCampus = currentUserData.allowedCampuses[0];
            filterSelect.value = currentGlobalCampus;
            handleGlobalCampusChange();
        }
    }
    if (event) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        event.target.classList.add('active');
    }

    if (pageName === 'users') loadUsers();
    if (pageName === 'permissions') loadPermissionsPage();
}

/* ==========================================
   USER DISPLAY & NAVIGATION
   ========================================== */

function updateUserDisplay() {
    const userName = currentUserData.name || currentUser.email.split('@')[0];
    const initials = userName
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);

    document.getElementById('userEmail').textContent = userName;
    document.getElementById('userRole').textContent = `[${currentUserData.role}]`;
    document.getElementById('userAvatar').textContent = initials;
    document.getElementById('yourRole').textContent = currentUserData.role;
    document.getElementById('yourEmail').textContent = currentUser.email;
}

function updateNavigation() {
    const isAdmin = currentUserData.role === 'Admin';
    const isIT = currentUserData.role === 'IT Staff';

    document.getElementById('usersNav').style.display = isAdmin ? 'flex' : 'none';
    document.getElementById('permissionsNav').style.display = isAdmin ? 'flex' : 'none';
    document.getElementById('addAssetBtn').style.display = (isAdmin || isIT) ? 'block' : 'none';
    document.getElementById('addCategoryBtn').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('addLocationBtn').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('addUserBtn').style.display = isAdmin ? 'block' : 'none';

    document.getElementById('actionsHeader').style.display = (isAdmin || isIT) ? 'table-cell' : 'none';
    document.getElementById('catActionsHeader').style.display = isAdmin ? 'table-cell' : 'none';
    document.getElementById('locActionsHeader').style.display = isAdmin ? 'table-cell' : 'none';
    document.getElementById('userActionsHeader').style.display = isAdmin ? 'table-cell' : 'none';
}

/* ==========================================
   DATA LOADING FUNCTIONS
   ========================================== */

async function loadAllData() {
    await loadAssets();
    await loadCategories();
    await loadLocations();
    updateDashboard();
    populateCategoryFilter();
}

async function loadAssets() {
    try {
        const snapshot = await db.collection('assets').where('active', '==', true).get();
        allAssets = [];
        snapshot.forEach(doc => allAssets.push({ id: doc.id, ...doc.data() }));
        displayAssets(allAssets);
    } catch (error) {
        console.error('Error loading assets:', error);
    }
}

async function loadCategories() {
    try {
        const snapshot = await db.collection('categories').where('active', '==', true).get();
        allCategories = [];
        snapshot.forEach(doc => allCategories.push({ id: doc.id, ...doc.data() }));
        displayCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadLocations() {
    try {
        const snapshot = await db.collection('locations').where('active', '==', true).get();
        allLocations = [];
        snapshot.forEach(doc => allLocations.push({ id: doc.id, ...doc.data() }));
        displayLocations();
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

async function loadUsers() {
    try {
        const snapshot = await db.collection('users').where('active', '==', true).get();
        allUsers = [];
        snapshot.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

/* ==========================================
   DISPLAY FUNCTIONS
   ========================================== */

function displayAssets(assets) {
    // Filter by Global Campus and Permissions
    assets = assets.filter(a =>
        (currentUserHasAccess(a.campus) || currentUserHasAccess(a.locationDetails?.campus)) &&
        (currentGlobalCampus === '' || a.campus === currentGlobalCampus || a.locationDetails?.campus === currentGlobalCampus)
    );

    const tbody = document.getElementById('assetRows');
    if (assets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No assets found</td></tr>';
        return;
    }
    tbody.innerHTML = assets.map((asset, index) => `
        <tr data-aos="fade-up" data-aos-delay="${index * 50}">
            <td><strong class="text-truncate" title="${asset.name}">${asset.name}</strong></td>
            <td>${asset.category}</td>
            <td>${asset.brand || '-'}</td>
            <td><span class="badge ${asset.condition.toLowerCase().replace(' ', '-')}">${asset.condition}</span></td>
            <td>${asset.quantity}</td>
            <td>${asset.location || '-'}</td>
            <td>${asset.assignedTo || '-'}</td>
            ${(currentUserData.role === 'Admin' || currentUserData.role === 'IT Staff') ? `
            <td class="action-buttons">
                <button class="btn btn-secondary btn-small" onclick="editAsset('${asset.id}')">Edit</button>
                <button class="btn btn-secondary btn-small" onclick="deactivateAsset('${asset.id}')">Delete</button>
            </td>
            ` : ''}
        </tr>
    `).join('');
}

function displayCategories() {
    const tbody = document.getElementById('categoryRows');
    if (allCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No categories found</td></tr>';
        return;
    }
    tbody.innerHTML = allCategories.map((cat, index) => `
        <tr data-aos="fade-up" data-aos-delay="${index * 50}">
            <td><strong>${cat.name}</strong></td>
            <td>${cat.description || '-'}</td>
            <td><span class="badge active">Active</span></td>
            ${currentUserData.role === 'Admin' ? `
            <td class="action-buttons">
                <button class="btn btn-secondary btn-small" onclick="editCategory('${cat.id}')">Edit</button>
                <button class="btn btn-secondary btn-small" onclick="deactivateCategory('${cat.id}')">Delete</button>
            </td>
            ` : ''}
        </tr>
    `).join('');
}

function displayLocations() {
    // Filter by Global Campus and Permissions
    const filteredLocations = allLocations.filter(l =>
        currentUserHasAccess(l.campus) &&
        (currentGlobalCampus === '' || l.campus === currentGlobalCampus)
    );

    const tbody = document.getElementById('locationRows');
    if (filteredLocations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No locations found</td></tr>';
        return;
    }
    tbody.innerHTML = filteredLocations.map((loc, index) => {
        const assetCount = allAssets.filter(a => a.location === `${loc.building}-${loc.floor}-${loc.room}` || a.location === `${loc.campus}-${loc.building}-${loc.floor}-${loc.room}`).length;
        return `
            <tr data-aos="fade-up" data-aos-delay="${index * 50}">
                <td><span class="badge info">${loc.campus || 'KB'}</span></td>
                <td>${loc.building}</td>
                <td>${loc.floor}</td>
                <td>${loc.room}</td>
                <td>${assetCount}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editLocation('${loc.id}')">Edit</button>
                    ${currentUserData.role === 'Admin' ? `<button class="btn btn-secondary btn-sm" onclick="deactivateLocation('${loc.id}')" style="margin-left: 5px; color: var(--color-red-500); border-color: var(--color-red-500);">Delete</button>` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function displayUsers() {
    const tbody = document.getElementById('userRows');
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
        return;
    }
    tbody.innerHTML = allUsers.map((user, index) => `
        <tr data-aos="fade-up" data-aos-delay="${index * 50}">
            <td>${user.email}</td>
            <td>${user.name}</td>
            <td><span class="badge admin">${user.role}</span></td>
            <td>${user.allowedCampuses ? user.allowedCampuses.join(', ') : 'All'}</td>
            <td><span class="badge active">Active</span></td>
            ${currentUserData.role === 'Admin' ? `
            <td class="action-buttons">
                <button class="btn btn-primary btn-sm" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="deactivateUser('${user.id}')" style="color: var(--color-red-500); border-color: var(--color-red-500);">Deactivate</button>
            </td>
            ` : ''}
        </tr>
    `).join('');
}

/* ==========================================
   FILTER & SEARCH
   ========================================== */

function populateCategoryFilter() {
    const filterSelect = document.getElementById('categoryFilter');
    const assetSelect = document.getElementById('assetCategory');
    filterSelect.innerHTML = '<option value="">All Categories</option>';
    assetSelect.innerHTML = '';
    allCategories.forEach(cat => {
        filterSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        assetSelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });
}

function updateDashboard() {
    const totalAssets = allAssets.filter(a =>
        (currentUserHasAccess(a.campus) || currentUserHasAccess(a.locationDetails?.campus)) &&
        (currentGlobalCampus === '' || a.campus === currentGlobalCampus || a.locationDetails?.campus === currentGlobalCampus)
    ).reduce((sum, a) => sum + a.quantity, 0);

    const inUse = allAssets.filter(a =>
        ((currentUserHasAccess(a.campus) || currentUserHasAccess(a.locationDetails?.campus)) &&
            (currentGlobalCampus === '' || a.campus === currentGlobalCampus || a.locationDetails?.campus === currentGlobalCampus)) &&
        a.condition === 'In Use'
    ).reduce((sum, a) => sum + a.quantity, 0);

    const broken = allAssets.filter(a =>
        ((currentUserHasAccess(a.campus) || currentUserHasAccess(a.locationDetails?.campus)) &&
            (currentGlobalCampus === '' || a.campus === currentGlobalCampus || a.locationDetails?.campus === currentGlobalCampus)) &&
        (a.condition === 'Broken' || a.condition === 'Old')
    ).reduce((sum, a) => sum + a.quantity, 0);

    const stock = allAssets.filter(a =>
        ((currentUserHasAccess(a.campus) || currentUserHasAccess(a.locationDetails?.campus)) &&
            (currentGlobalCampus === '' || a.campus === currentGlobalCampus || a.locationDetails?.campus === currentGlobalCampus)) &&
        a.condition === 'Stock'
    ).reduce((sum, a) => sum + a.quantity, 0);

    document.getElementById('totalAssets').textContent = totalAssets;
    document.getElementById('inUseCount').textContent = inUse;
    document.getElementById('brokenCount').textContent = broken;
    document.getElementById('stockCount').textContent = stock;
}

function filterAssets() {
    const search = document.getElementById('searchAssets').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const condition = document.getElementById('conditionFilter').value;

    const filtered = allAssets.filter(a =>
        (a.name.toLowerCase().includes(search) || a.brand.toLowerCase().includes(search)) &&
        (category === '' || a.category === category) &&
        (condition === '' || a.condition === condition)
    );

    displayAssets(filtered);
}

/* ==========================================
   CRUD OPERATIONS - ASSETS
   ========================================== */

async function handleAssetSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('assetId').value;
    const campus = document.getElementById('assetCampus').value;
    const building = document.getElementById('assetBuilding').value;
    const floor = document.getElementById('assetFloor').value;
    const room = document.getElementById('assetRoom').value;

    const asset = {
        name: document.getElementById('assetName').value,
        category: document.getElementById('assetCategory').value,
        brand: document.getElementById('assetBrand').value,
        model: document.getElementById('assetModel').value,
        condition: document.getElementById('assetCondition').value,
        quantity: parseInt(document.getElementById('assetQuantity').value),
        campus: campus,
        location: `${campus}-${building}-${floor}-${room}`, // For legacy display compat
        locationDetails: { campus, building, floor, room }, // Structured data
        assignedTo: document.getElementById('assetAssignee').value,
        notes: document.getElementById('assetNotes').value,
        active: true
    };

    try {
        if (id) {
            await db.collection('assets').doc(id).update(asset);
            showToast('Asset updated successfully!', 'success');
        } else {
            asset.createdBy = currentUser.uid;
            asset.createdAt = new Date();
            await db.collection('assets').add(asset);
            showToast('Asset added successfully!', 'success');
        }
        closeModal('addAssetModal');
        document.getElementById('addAssetForm').reset();
        document.getElementById('assetId').value = '';
        await loadAssets();
        updateDashboard();
    } catch (error) {
        showToast('Error saving asset: ' + error.message, 'error');
    }
}

function openAddAssetModal() {
    document.getElementById('addAssetForm').reset();
    document.getElementById('assetId').value = '';

    // Reset Cascading Selects
    document.getElementById('assetBuilding').innerHTML = '<option value="">Select Building</option>';
    document.getElementById('assetFloor').innerHTML = '<option value="">Select Floor</option>';
    document.getElementById('assetRoom').innerHTML = '<option value="">Select Room</option>';

    document.querySelector('#addAssetModal .modal-header span').textContent = 'Add New Asset';
    document.querySelector('#addAssetModal button[type="submit"]').textContent = 'Add Asset';
    document.getElementById('addAssetModal').classList.add('active');
}

/* ==========================================
   CASCADING LOCATION SELECTS
   ========================================== */

function getUniqueValues(data, field) {
    return [...new Set(data.map(item => item[field]).filter(Boolean))];
}

function updateAssetBuildings() {
    const campus = document.getElementById('assetCampus').value;
    const buildingSelect = document.getElementById('assetBuilding');
    buildingSelect.innerHTML = '<option value="">Select Building</option>';

    if (!campus) return;

    const buildings = getUniqueValues(allLocations.filter(l => l.campus === campus || (!l.campus && campus === 'KB')), 'building');
    buildings.forEach(b => {
        const option = document.createElement('option');
        option.value = b;
        option.textContent = b;
        buildingSelect.appendChild(option);
    });
    updateAssetFloors();
}

function updateAssetFloors() {
    const campus = document.getElementById('assetCampus').value;
    const building = document.getElementById('assetBuilding').value;
    const floorSelect = document.getElementById('assetFloor');
    floorSelect.innerHTML = '<option value="">Select Floor</option>';

    if (!campus || !building) return;

    const floors = getUniqueValues(allLocations.filter(l => (l.campus === campus || (!l.campus && campus === 'KB')) && l.building === building), 'floor');
    floors.forEach(f => {
        const option = document.createElement('option');
        option.value = f;
        option.textContent = f;
        floorSelect.appendChild(option);
    });
    updateAssetRooms();
}

function updateAssetRooms() {
    const campus = document.getElementById('assetCampus').value;
    const building = document.getElementById('assetBuilding').value;
    const floor = document.getElementById('assetFloor').value;
    const roomSelect = document.getElementById('assetRoom');
    roomSelect.innerHTML = '<option value="">Select Room</option>';

    if (!campus || !building || !floor) return;

    const rooms = getUniqueValues(allLocations.filter(l => (l.campus === campus || (!l.campus && campus === 'KB')) && l.building === building && l.floor === floor), 'room');
    rooms.forEach(r => {
        const option = document.createElement('option');
        option.value = r;
        option.textContent = r;
        roomSelect.appendChild(option);
    });
}

function editAsset(id) {
    const asset = allAssets.find(a => a.id === id);
    if (!asset) return;

    document.getElementById('assetId').value = id;
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetCategory').value = asset.category;
    document.getElementById('assetBrand').value = asset.brand || '';
    document.getElementById('assetModel').value = asset.model || '';
    document.getElementById('assetCondition').value = asset.condition;
    document.getElementById('assetQuantity').value = asset.quantity;
    document.getElementById('assetAssignee').value = asset.assignedTo || '';
    document.getElementById('assetNotes').value = asset.notes || '';

    // Handle Location Breakdown
    if (asset.locationDetails) {
        document.getElementById('assetCampus').value = asset.locationDetails.campus;
        updateAssetBuildings();
        document.getElementById('assetBuilding').value = asset.locationDetails.building;
        updateAssetFloors();
        document.getElementById('assetFloor').value = asset.locationDetails.floor;
        updateAssetRooms();
        document.getElementById('assetRoom').value = asset.locationDetails.room;
    } else if (asset.location) {
        // Fallback for legacy data (Format: [Campus-]Building-Floor-Room)
        // This is tricky as legacy might not have campus. Assume KB if 3 parts?
        const parts = asset.location.split('-');
        if (parts.length >= 3) {
            // Heuristic: If 4 parts, first is campus. If 3 parts, assume KB.
            // Actually, simplest is to just start fresh or try to map.
            // Let's rely on manual update for legacy items for now, or just default to KB if missing.
            // For now, I will NOT try to auto-parse legacy because it's prone to error.
            // User will have to re-select.
        }
    }

    document.querySelector('#addAssetModal .modal-header span').textContent = 'Edit Asset';
    document.querySelector('#addAssetModal button[type="submit"]').textContent = 'Update Asset';
    document.getElementById('addAssetModal').classList.add('active');
}

async function deactivateAsset(id) {
    if (confirm('Deactivate this asset?')) {
        try {
            await db.collection('assets').doc(id).update({ active: false });
            await loadAssets();
            updateDashboard();
            showToast('Asset deleted successfully!', 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}



/* ==========================================
   CRUD OPERATIONS - CATEGORIES
   ========================================== */

async function handleCategorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('categoryId').value;
    const category = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDesc').value,
        active: true
    };

    try {
        if (id) {
            await db.collection('categories').doc(id).update(category);
            showToast('Category updated successfully!', 'success');
        } else {
            category.createdAt = new Date();
            await db.collection('categories').add(category);
            showToast('Category added successfully!', 'success');
        }
        closeModal('addCategoryModal');
        document.getElementById('addCategoryForm').reset();
        document.getElementById('categoryId').value = '';
        await loadCategories();
        populateCategoryFilter();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function openAddCategoryModal() {
    document.getElementById('addCategoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.querySelector('#addCategoryModal .modal-header span').textContent = 'Add Category';
    document.querySelector('#addCategoryModal button[type="submit"]').textContent = 'Add Category';
    document.getElementById('addCategoryModal').classList.add('active');
}

function editCategory(id) {
    const cat = allCategories.find(c => c.id === id);
    if (!cat) return;

    document.getElementById('categoryId').value = id;
    document.getElementById('categoryName').value = cat.name;
    document.getElementById('categoryDesc').value = cat.description || '';

    document.querySelector('#addCategoryModal .modal-header span').textContent = 'Edit Category';
    document.querySelector('#addCategoryModal button[type="submit"]').textContent = 'Update Category';
    document.getElementById('addCategoryModal').classList.add('active');
}

async function deactivateCategory(id) {
    if (confirm('Deactivate this category?')) {
        try {
            await db.collection('categories').doc(id).update({ active: false });
            await loadCategories();
            populateCategoryFilter();
            showToast('Category deleted successfully!', 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}



/* ==========================================
   CRUD OPERATIONS - LOCATIONS
   ========================================== */

async function handleLocationSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('locationId').value;
    const location = {
        campus: document.getElementById('locationCampus').value,
        building: document.getElementById('locationBuilding').value,
        floor: document.getElementById('locationFloor').value,
        room: document.getElementById('locationRoom').value,
        active: true
    };

    try {
        if (id) {
            await db.collection('locations').doc(id).update(location);
            showToast('Location updated successfully!', 'success');
        } else {
            location.createdAt = new Date();
            await db.collection('locations').add(location);
            showToast('Location added successfully!', 'success');
        }
        closeModal('addLocationModal');
        document.getElementById('addLocationForm').reset();
        document.getElementById('locationId').value = '';
        await loadLocations();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function openAddLocationModal() {
    document.getElementById('addLocationForm').reset();
    document.getElementById('locationId').value = '';
    document.querySelector('#addLocationModal .modal-header span').textContent = 'Add Location';
    document.querySelector('#addLocationModal button[type="submit"]').textContent = 'Add Location';
    document.getElementById('addLocationModal').classList.add('active');
}

function editLocation(id) {
    const loc = allLocations.find(l => l.id === id);
    if (!loc) return;

    document.getElementById('locationId').value = id;
    document.getElementById('locationCampus').value = loc.campus || 'KB';
    document.getElementById('locationBuilding').value = loc.building;
    document.getElementById('locationFloor').value = loc.floor;
    document.getElementById('locationRoom').value = loc.room;

    document.querySelector('#addLocationModal .modal-header span').textContent = 'Edit Location';
    document.querySelector('#addLocationModal button[type="submit"]').textContent = 'Update Location';
    document.getElementById('addLocationModal').classList.add('active');
}

async function deactivateLocation(id) {
    if (confirm('Deactivate this location?')) {
        try {
            await db.collection('locations').doc(id).update({ active: false });
            await loadLocations();
            showToast('Location deleted successfully!', 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}



/* ==========================================
   CRUD OPERATIONS - USERS
   ========================================== */

async function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const email = document.getElementById('newUserEmail').value;
    const name = document.getElementById('newUserName').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    const checkboxes = document.getElementsByName('campusAccess');
    const selectedCampuses = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);

    try {
        if (id) {
            // Update User
            const updateData = {
                name,
                role,
                allowedCampuses: selectedCampuses
            };
            // Note: Password update requires Admin SDK or re-auth, skipping for MVP edit
            // Only update email if strictly necessary, but Auth email sync is complex

            await db.collection('users').doc(id).update(updateData);
            showToast('User updated successfully!', 'success');
        } else {
            // Create New User
            const result = await auth.createUserWithEmailAndPassword(email, password);
            const userData = {
                email,
                name,
                role,
                allowedCampuses: selectedCampuses,
                active: true,
                permissions: {},
                createdAt: new Date(),
                createdBy: currentUser.uid
            };
            await db.collection('users').doc(result.user.uid).set(userData);
            showToast(`User ${name} created successfully!`, 'success');
        }

        closeModal('addUserModal');
        document.getElementById('addUserForm').reset();
        await loadUsers();
    } catch (error) {
        showToast('Error saving user: ' + error.message, 'error');
    }
}

async function deactivateUser(id) {
    if (confirm('Deactivate this user?')) {
        try {
            await db.collection('users').doc(id).update({ active: false });
            await loadUsers();
            showToast('User deactivated successfully!', 'success');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
}

function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userId').value = id;
    document.getElementById('newUserEmail').value = user.email;
    document.getElementById('newUserEmail').disabled = true; // Email cannot be changed easily
    document.getElementById('newUserName').value = user.name;
    document.getElementById('newUserRole').value = user.role;

    // Password is optional/hidden for edit
    document.getElementById('newUserPassword').removeAttribute('required');
    document.getElementById('newUserPassword').closest('.form-group').style.display = 'none'; // Hide password for edit

    // Set Campuses
    const checkboxes = document.getElementsByName('campusAccess');
    checkboxes.forEach(cb => {
        cb.checked = user.allowedCampuses && user.allowedCampuses.includes(cb.value);
    });

    document.querySelector('#addUserModal .modal-header span').textContent = 'Edit User';
    document.querySelector('#addUserModal button[type="submit"]').textContent = 'Update User';
    document.getElementById('addUserModal').classList.add('active');
}

function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('newUserEmail').disabled = false;
    document.getElementById('newUserPassword').setAttribute('required', 'true');
    document.getElementById('newUserPassword').closest('.form-group').style.display = 'block';

    document.querySelector('#addUserModal .modal-header span').textContent = 'Add User';
    document.querySelector('#addUserModal button[type="submit"]').textContent = 'Add User';
    document.getElementById('addUserModal').classList.add('active');
}

/* ==========================================
   PERMISSIONS MANAGEMENT
   ========================================== */

async function loadPermissionsPage() {
    const permissionsContent = document.getElementById('permissionsContent');
    try {
        const snapshot = await db.collection('users').where('active', '==', true).get();
        let html = '<div class="permission-grid">';

        snapshot.forEach(doc => {
            const user = doc.data();
            const isAdmin = user.role === 'Admin';

            html += `
                <div class="permission-card">
                    <h4>${user.email}</h4>
                    <div style="margin-bottom: var(--space-12); padding: var(--space-8); background: var(--color-white); border-radius: var(--radius-base);">
                        <strong>Role: ${user.role}</strong>
                    </div>
                    <div style="margin-top: var(--space-8);">
                        <label class="select-all-label" style="cursor: pointer;">
                            <input type="radio" name="role_${doc.id}" onchange="changeUserRole('${doc.id}', 'Admin', event)" ${isAdmin ? 'checked' : ''}>
                            <span>Admin - All Access</span>
                        </label>
                        <label class="select-all-label" style="cursor: pointer; margin-top: var(--space-8);">
                            <input type="radio" name="role_${doc.id}" onchange="changeUserRole('${doc.id}', 'IT Staff', event)" ${user.role === 'IT Staff' ? 'checked' : ''}>
                            <span>IT Staff - Edit/View</span>
                        </label>
                        <label class="select-all-label" style="cursor: pointer; margin-top: var(--space-8);">
                            <input type="radio" name="role_${doc.id}" onchange="changeUserRole('${doc.id}', 'Viewer', event)" ${user.role === 'Viewer' ? 'checked' : ''}>
                            <span>Viewer - Read Only</span>
                        </label>
                    </div>
                    <div style="margin-top: var(--space-12); padding-top: var(--space-12); border-top: 1px solid var(--color-gray-300);">
                        <h5 style="font-size: 12px; font-weight: 600; margin-bottom: var(--space-8); text-transform: uppercase;">Permissions:</h5>
                        <div class="permission-item">
                            <input type="checkbox" ${isAdmin || user.role !== 'Viewer' ? 'checked' : ''} disabled>
                            <label>View Assets</label>
                        </div>
                        <div class="permission-item">
                            <input type="checkbox" ${isAdmin || user.role === 'IT Staff' ? 'checked' : ''} disabled>
                            <label>Add/Edit Assets</label>
                        </div>
                        <div class="permission-item">
                            <input type="checkbox" ${isAdmin ? 'checked' : ''} disabled>
                            <label>Delete/Deactivate</label>
                        </div>
                        <div class="permission-item">
                            <input type="checkbox" ${isAdmin ? 'checked' : ''} disabled>
                            <label>Manage Users</label>
                        </div>
                        <div class="permission-item">
                            <input type="checkbox" ${isAdmin ? 'checked' : ''} disabled>
                            <label>Manage Categories</label>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        permissionsContent.innerHTML = html;
    } catch (error) {
        permissionsContent.innerHTML = 'Error loading permissions: ' + error.message;
    }
}

async function changeUserRole(userId, newRole, event) {
    event.preventDefault();
    try {
        await db.collection('users').doc(userId).update({ role: newRole });
        showToast(`User role updated to ${newRole}`, 'info');
        await loadPermissionsPage();
    } catch (error) {
        showToast('Error updating role: ' + error.message, 'error');
    }
}

/* ==========================================
   EXPORT FUNCTIONS
   ========================================== */

function exportAllAssets() {
    let csv = 'Asset Name,Category,Brand,Model,Condition,Quantity,Location,Assigned To\n';
    allAssets.forEach(a => {
        csv += `"${a.name}","${a.category}","${a.brand || ''}","${a.model || ''}","${a.condition}",${a.quantity},"${a.location || ''}","${a.assignedTo || ''}"\n`;
    });
    downloadCSV(csv, 'assets.csv');
}

function exportBrokenAssets() {
    const broken = allAssets.filter(a => a.condition === 'Broken');
    let csv = 'Asset Name,Brand,Location,Notes\n';
    broken.forEach(a => {
        csv += `"${a.name}","${a.brand || ''}","${a.location || ''}","${a.notes || ''}"\n`;
    });
    downloadCSV(csv, 'broken-assets.csv');
}

function exportByFloor() {
    let csv = 'Building,Floor,Room,Total Assets\n';
    allLocations.forEach(loc => {
        const count = allAssets.filter(a => a.location === `${loc.building}-${loc.floor}-${loc.room}`).length;
        csv += `"${loc.building}","${loc.floor}","${loc.room}",${count}\n`;
    });
    downloadCSV(csv, 'assets-by-floor.csv');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

/* ==========================================
   MODAL FUNCTIONS
   ========================================== */

function openAddAssetModal() {
    document.getElementById('addAssetModal').classList.add('active');
}

function openAddCategoryModal() {
    document.getElementById('addCategoryModal').classList.add('active');
}

function openAddLocationModal() {
    document.getElementById('addLocationModal').classList.add('active');
}

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

/* ==========================================
   TOAST NOTIFICATION SYSTEM
   ========================================== */

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
        success: 'âœ“',
        error: 'âœ•',
        info: 'â„¹'
    };

    toast.innerHTML = `
        <div class="toast-icon">${iconMap[type]}</div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


