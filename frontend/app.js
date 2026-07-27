// ==========================================
// CONFIGURATION
// ==========================================
// TODO: Paste your new API Gateway Invoke URL here (no trailing slash)
const API_BASE_URL = "https://sgna790529.execute-api.ap-south-1.amazonaws.com/Prod";

// TODO: Paste your Cognito Domain URL and Client ID here
const COGNITO_DOMAIN = "https://educloud-app-865343245907.auth.ap-south-1.amazoncognito.com";
const CLIENT_ID = "5o9j46qs7qdl5avcg38jc1h08";

// The URL where Cognito should send the user back after login
const REDIRECT_URI = window.location.origin + window.location.pathname;

// ==========================================
// DOM ELEMENTS
// ==========================================
const loginOverlay = document.getElementById('login-overlay');
const appContainer = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const form = document.getElementById('add-student-form');
const submitBtnText = document.querySelector('.btn-text');
const submitLoader = document.getElementById('submit-loader');
const tableBody = document.getElementById('students-table-body');
const dashboardTableBody = document.getElementById('dashboard-students-table-body');
const dashboardAttendanceTableBody = document.getElementById('dashboard-attendance-table-body');
const attendanceTableBody = document.getElementById('attendance-table-body');
const refreshBtn = document.getElementById('refresh-btn');
const refreshAttendanceBtn = document.getElementById('refresh-attendance-btn');
const attendanceDateInput = document.getElementById('attendance-date');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('search-input');

let allStudents = []; // Stores all fetched students for filtering

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================
let authToken = null;
const COGNITO_REGION = "ap-south-1";

// Auth Form Elements
const tabSignin = document.getElementById('tab-signin');
const tabSignup = document.getElementById('tab-signup');
const formSignin = document.getElementById('form-signin');
const formSignup = document.getElementById('form-signup');
const formConfirm = document.getElementById('form-confirm');
const signinError = document.getElementById('signin-error');
const signupError = document.getElementById('signup-error');
const confirmError = document.getElementById('confirm-error');
const hostedUiFallback = document.getElementById('hosted-ui-fallback');

let pendingUnconfirmedEmail = '';

// Helper for Direct Cognito IDP API Calls
async function cognitoRequest(targetAction, payload) {
    try {
        const response = await fetch(`https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': `AWSCognitoIdentityProviderService.${targetAction}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return { ok: response.ok, data };
    } catch (err) {
        return { ok: false, data: { message: err.message || "Network connection error" } };
    }
}

// Auth Tab Switching
const activeTabClasses = ['bg-surface-container-highest', 'text-on-surface', 'shadow-sm'];
const inactiveTabClasses = ['text-on-surface-variant', 'hover:text-on-surface'];

if (tabSignin && tabSignup) {
    tabSignin.addEventListener('click', () => {
        tabSignin.classList.add(...activeTabClasses);
        tabSignin.classList.remove(...inactiveTabClasses);
        tabSignup.classList.add(...inactiveTabClasses);
        tabSignup.classList.remove(...activeTabClasses);
        
        formSignin.style.display = 'block';
        formSignup.style.display = 'none';
        formConfirm.style.display = 'none';
        hideAuthErrors();
    });

    tabSignup.addEventListener('click', () => {
        tabSignup.classList.add(...activeTabClasses);
        tabSignup.classList.remove(...inactiveTabClasses);
        tabSignin.classList.add(...inactiveTabClasses);
        tabSignin.classList.remove(...activeTabClasses);
        
        formSignup.style.display = 'block';
        formSignin.style.display = 'none';
        formConfirm.style.display = 'none';
        hideAuthErrors();
    });
}

function hideAuthErrors() {
    if (signinError) signinError.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (confirmError) confirmError.style.display = 'none';
}

function showAuthError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
}

// Native Sign In Handler
if (formSignin) {
    formSignin.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthErrors();

        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const loader = document.getElementById('signin-loader');
        const submitBtnText = document.querySelector('#btn-submit-signin span:first-child');

        if (loader) loader.style.display = 'inline-block';
        if (submitBtnText) submitBtnText.style.display = 'none';

        const res = await cognitoRequest('InitiateAuth', {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        });

        if (loader) loader.style.display = 'none';
        if (submitBtnText) submitBtnText.style.display = 'inline';

        if (res.ok && res.data.AuthenticationResult) {
            const idToken = res.data.AuthenticationResult.IdToken;
            localStorage.setItem('auth_token', idToken);
            authToken = idToken;
            showToast("Signed in successfully!", "success");
            checkAuth();
        } else {
            const errMsg = res.data.__type ? res.data.message || "Invalid email or password" : "Login failed";
            if (res.data.__type === "UserNotConfirmedException") {
                pendingUnconfirmedEmail = email;
                formSignin.style.display = 'none';
                formConfirm.style.display = 'block';
                showAuthError(confirmError, "Please enter the confirmation code sent to your email.");
            } else {
                showAuthError(signinError, errMsg);
            }
        }
    });
}

// Native Sign Up Handler
if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthErrors();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const loader = document.getElementById('signup-loader');
        const submitBtnText = document.querySelector('#btn-submit-signup span:first-child');

        if (loader) loader.style.display = 'inline-block';
        if (submitBtnText) submitBtnText.style.display = 'none';

        const res = await cognitoRequest('SignUp', {
            ClientId: CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [{ Name: 'email', Value: email }]
        });

        if (loader) loader.style.display = 'none';
        if (submitBtnText) submitBtnText.style.display = 'inline';

        if (res.ok) {
            pendingUnconfirmedEmail = email;
            formSignup.style.display = 'none';
            formConfirm.style.display = 'block';
            showToast("Account created! Check your email for the code.", "success");
        } else {
            const errMsg = res.data.message || "Sign up failed. Ensure password meets requirements.";
            showAuthError(signupError, errMsg);
        }
    });
}

// Confirm Verification Code Handler
if (formConfirm) {
    formConfirm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthErrors();

        const code = document.getElementById('confirm-code').value.trim();
        const loader = document.getElementById('confirm-loader');
        const submitBtnText = document.querySelector('#btn-submit-confirm span:first-child');

        if (loader) loader.style.display = 'inline-block';
        if (submitBtnText) submitBtnText.style.display = 'none';

        const res = await cognitoRequest('ConfirmSignUp', {
            ClientId: CLIENT_ID,
            Username: pendingUnconfirmedEmail,
            ConfirmationCode: code
        });

        if (loader) loader.style.display = 'none';
        if (submitBtnText) submitBtnText.style.display = 'inline';

        if (res.ok) {
            showToast("Email verified! You can now sign in.", "success");
            if (tabSignin) tabSignin.click();
            formConfirm.style.display = 'none';
        } else {
            const errMsg = res.data.message || "Invalid verification code.";
            showAuthError(confirmError, errMsg);
        }
    });
}

// Hosted UI Fallback Handler
if (hostedUiFallback) {
    hostedUiFallback.addEventListener('click', (e) => {
        e.preventDefault();
        login();
    });
}

function checkAuth() {
    // 1. Check if we just came back from the login page (token is in the URL hash)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    if (params.has('id_token')) {
        localStorage.setItem('auth_token', params.get('id_token'));
        window.history.replaceState(null, null, ' ');
    }

    // 2. Load token from local storage
    authToken = localStorage.getItem('auth_token');

    if (authToken) {
        // We are logged in! Hide login screen, show app
        loginOverlay.style.display = 'none';
        appContainer.style.display = 'flex';
        fetchStudents(); // Load data
    } else {
        // We are NOT logged in. Show login screen, hide app
        loginOverlay.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

function login() {
    // Redirect to the AWS Hosted UI
    const loginUrl = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=email+openid&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = loginUrl;
}

function logout() {
    localStorage.removeItem('auth_token');
    authToken = null;
    checkAuth();
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', checkAuth);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
refreshBtn.addEventListener('click', fetchStudents);
form.addEventListener('submit', handleAddStudent);
searchInput.addEventListener('input', handleSearch);

// Sidebar navigation — switch between pages
const navDashboard = document.getElementById('nav-dashboard');
const navAdd = document.getElementById('nav-add');
const navAttendance = document.getElementById('nav-attendance');
const navStudents = document.getElementById('nav-students');
const pageDashboard = document.getElementById('page-dashboard');
const pageAdd = document.getElementById('page-add');
const pageAttendance = document.getElementById('page-attendance');
const pageManage = document.getElementById('page-manage');

function showPage(page) {
    // Hide all pages
    pageDashboard.style.display = 'none';
    pageAdd.style.display = 'none';
    pageAttendance.style.display = 'none';
    pageManage.style.display = 'none';
    
    // Reset Nav Items
    const activeNavClasses = ['bg-surface-container-highest/80', 'text-on-surface', 'font-semibold', 'translate-x-1'];
    const inactiveNavClasses = ['text-on-surface-variant', 'hover:bg-surface-variant/50', 'hover:text-on-surface'];
    
    [navDashboard, navAdd, navAttendance, navStudents].forEach(nav => {
        nav.classList.remove(...activeNavClasses);
        nav.classList.add(...inactiveNavClasses);
        nav.querySelector('.nav-indicator')?.classList.add('hidden');
        nav.querySelector('.material-symbols-outlined')?.classList.replace('text-primary', 'group-hover:text-primary');
    });

    if (page === 'dashboard') {
        pageDashboard.style.display = 'flex'; // It's a flex container in Tailwind
        navDashboard.classList.remove(...inactiveNavClasses);
        navDashboard.classList.add(...activeNavClasses);
        navDashboard.querySelector('.nav-indicator')?.classList.remove('hidden');
        navDashboard.querySelector('.material-symbols-outlined')?.classList.replace('group-hover:text-primary', 'text-primary');
        fetchStudents(); // Refresh data when opening this page
    } else if (page === 'add') {
        pageAdd.style.display = 'flex';
        navAdd.classList.remove(...inactiveNavClasses);
        navAdd.classList.add(...activeNavClasses);
        navAdd.querySelector('.nav-indicator')?.classList.remove('hidden');
        navAdd.querySelector('.material-symbols-outlined')?.classList.replace('group-hover:text-primary', 'text-primary');
    } else if (page === 'attendance') {
        pageAttendance.style.display = 'flex';
        navAttendance.classList.remove(...inactiveNavClasses);
        navAttendance.classList.add(...activeNavClasses);
        navAttendance.querySelector('.nav-indicator')?.classList.remove('hidden');
        navAttendance.querySelector('.material-symbols-outlined')?.classList.replace('group-hover:text-primary', 'text-primary');
        fetchStudents();
    } else {
        pageManage.style.display = 'flex';
        navStudents.classList.remove(...inactiveNavClasses);
        navStudents.classList.add(...activeNavClasses);
        navStudents.querySelector('.nav-indicator')?.classList.remove('hidden');
        navStudents.querySelector('.material-symbols-outlined')?.classList.replace('group-hover:text-primary', 'text-primary');
        fetchStudents(); // Refresh data when opening this page
    }
}

navDashboard.addEventListener('click', (e) => { e.preventDefault(); showPage('dashboard'); });
navAdd.addEventListener('click', (e) => { e.preventDefault(); showPage('add'); });
navAttendance.addEventListener('click', (e) => { e.preventDefault(); showPage('attendance'); });
navStudents.addEventListener('click', (e) => { e.preventDefault(); showPage('manage'); });
if (refreshAttendanceBtn) refreshAttendanceBtn.addEventListener('click', fetchStudents);

// Initialize Date Picker
if (attendanceDateInput) {
    const today = new Date().toISOString().split('T')[0];
    attendanceDateInput.value = today;
    attendanceDateInput.addEventListener('change', () => {
        if (allStudents.length > 0) {
            renderStudents(allStudents);
        }
    });
}

// ==========================================
// API FUNCTIONS
// ==========================================

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': authToken
    };
}

/**
 * Fetch all students from the API and render them in the table
 */
async function fetchStudents() {
    setTableLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            headers: getHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            logout(); // Token expired or invalid
            return;
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        allStudents = data.students || data.data || [];
        renderStudents(allStudents);
        searchInput.value = ''; // Clear search on refresh

    } catch (error) {
        console.error("Failed to fetch students:", error);
        showToast("Failed to connect to API.", "error");
        setTableError();
    }
}

/**
 * Handle the form submission to add a new student
 */
async function handleAddStudent(e) {
    e.preventDefault();

    const studentData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        age: parseInt(document.getElementById('age').value),
        course: document.getElementById('course').value
    };

    setFormLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(studentData)
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        if (!response.ok) throw new Error("Failed to create student");

        showToast("Student added successfully!", "success");
        form.reset();
        fetchStudents();

    } catch (error) {
        console.error("Add error:", error);
        showToast("Error adding student. Check console.", "error");
    } finally {
        setFormLoading(false);
    }
}

/**
 * Delete a student by ID
 */
async function deleteStudent(studentId) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }
        if (!response.ok) throw new Error("Failed to delete student");

        showToast("Student removed", "success");
        fetchStudents();

    } catch (error) {
        console.error("Delete error:", error);
        showToast("Error deleting student.", "error");
    }
}

/**
 * Filter students in real-time as admin types in the search box
 */
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        renderStudents(allStudents);
        return;
    }
    const filtered = allStudents.filter(s =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.course.toLowerCase().includes(query)
    );
    renderStudents(filtered);
}

// ==========================================
// UI HELPERS
// ==========================================

// Modal elements
const studentModal = document.getElementById('student-modal');
const modalClose = document.getElementById('modal-close');
const modalView = document.getElementById('modal-view');
const modalEdit = document.getElementById('modal-edit');
const modalTitle = document.getElementById('modal-title');
const editModeBtn = document.getElementById('edit-mode-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const editForm = document.getElementById('edit-student-form');

// Modal event listeners
modalClose.addEventListener('click', closeModal);
editModeBtn.addEventListener('click', switchToEditMode);
cancelEditBtn.addEventListener('click', switchToViewMode);
editForm.addEventListener('submit', handleUpdateStudent);
studentModal.addEventListener('click', (e) => {
    if (e.target === studentModal) closeModal();
});

let currentStudent = null; // Stores the student being viewed

function closeModal() {
    studentModal.style.display = 'none';
    switchToViewMode();
}

function switchToEditMode() {
    modalTitle.textContent = 'Edit Student';
    modalView.style.display = 'none';
    modalEdit.style.display = 'block';
    // Pre-fill form with current student data
    document.getElementById('edit-student-id').value = currentStudent.student_id;
    document.getElementById('edit-first-name').value = currentStudent.first_name;
    document.getElementById('edit-last-name').value = currentStudent.last_name;
    document.getElementById('edit-email').value = currentStudent.email;
    document.getElementById('edit-age').value = currentStudent.age;
    document.getElementById('edit-course').value = currentStudent.course;
}

function switchToViewMode() {
    modalTitle.textContent = 'Student Details';
    modalView.style.display = 'block';
    modalEdit.style.display = 'none';
}

/**
 * View a single student's details in a popup
 */
async function viewStudent(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch student');

        const data = await response.json();
        currentStudent = data.student;

        // Fill in the detail view
        document.getElementById('detail-id').textContent = currentStudent.student_id;
        document.getElementById('detail-name').textContent = `${currentStudent.first_name} ${currentStudent.last_name}`;
        document.getElementById('detail-email').textContent = currentStudent.email;
        document.getElementById('detail-age').textContent = currentStudent.age;
        document.getElementById('detail-course').textContent = currentStudent.course;

        // Show the modal in view mode
        switchToViewMode();
        studentModal.style.display = 'flex';

    } catch (error) {
        console.error('View error:', error);
        showToast('Failed to load student details.', 'error');
    }
}

/**
 * Handle the edit form submission to update a student
 */
async function handleUpdateStudent(e) {
    e.preventDefault();

    const studentId = document.getElementById('edit-student-id').value;
    const updateData = {
        first_name: document.getElementById('edit-first-name').value,
        last_name: document.getElementById('edit-last-name').value,
        email: document.getElementById('edit-email').value,
        age: parseInt(document.getElementById('edit-age').value),
        course: document.getElementById('edit-course').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Failed to update student');

        showToast('Student updated successfully!', 'success');
        closeModal();
        fetchStudents(); // Refresh the table

    } catch (error) {
        console.error('Update error:', error);
        showToast('Failed to update student.', 'error');
    }
}

function renderStudents(students) {
    tableBody.innerHTML = '';
    if (dashboardTableBody) dashboardTableBody.innerHTML = '';
    if (dashboardAttendanceTableBody) dashboardAttendanceTableBody.innerHTML = '';
    if (attendanceTableBody) attendanceTableBody.innerHTML = '';

    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No students found. Add one above!</td></tr>`;
        if (dashboardTableBody) dashboardTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-on-surface-variant">No students found.</td></tr>`;
        if (dashboardAttendanceTableBody) dashboardAttendanceTableBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-on-surface-variant">No students found.</td></tr>`;
        if (attendanceTableBody) attendanceTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-on-surface-variant">No students found.</td></tr>`;
        return;
    }

    students.forEach(student => {
        // Render for Manage Students Table
        const trManage = document.createElement('tr');
        trManage.innerHTML = `
            <td class="py-3 px-4 text-on-surface font-semibold">${student.first_name} ${student.last_name}</td>
            <td class="py-3 px-4 text-on-surface-variant">${student.course}</td>
            <td class="py-3 px-4 text-on-surface-variant">${student.email}</td>
            <td class="py-3 px-4 text-on-surface-variant">${student.age}</td>
            <td class="py-3 px-4">
                <div class="action-btns">
                    <button class="btn-view" onclick="viewStudent('${student.student_id}')">View</button>
                    <button class="btn-danger" onclick="deleteStudent('${student.student_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(trManage);

        // Render for Dashboard Read-Only Table
        if (dashboardTableBody) {
            const trDashboard = document.createElement('tr');
            trDashboard.innerHTML = `
                <td class="py-3 px-4 text-on-surface font-semibold">${student.first_name} ${student.last_name}</td>
                <td class="py-3 px-4 text-on-surface-variant">${student.course}</td>
                <td class="py-3 px-4 text-on-surface-variant">${student.email}</td>
                <td class="py-3 px-4 text-on-surface-variant">${student.age}</td>
            `;
            dashboardTableBody.appendChild(trDashboard);
        }

        // Render for Dashboard Attendance Overview
        if (dashboardAttendanceTableBody) {
            const trOverview = document.createElement('tr');
            const todayStr = new Date().toISOString().split('T')[0];
            const records = student.attendance_records || {};
            const todayStatus = records[todayStr] || null;

            let statusBadge = '<span class="px-2 py-1 rounded bg-surface-container text-on-surface-variant text-xs">Not Marked</span>';
            if (todayStatus === 'present') {
                statusBadge = '<span class="px-2 py-1 rounded bg-[#22c55e]/20 text-[#22c55e] text-xs font-semibold">Present</span>';
            } else if (todayStatus === 'absent') {
                statusBadge = '<span class="px-2 py-1 rounded bg-[#ef4444]/20 text-[#ef4444] text-xs font-semibold">Absent</span>';
            }

            trOverview.innerHTML = `
                <td class="py-3 px-4 text-on-surface font-semibold">${student.first_name} ${student.last_name}</td>
                <td class="py-3 px-4 text-on-surface-variant">${student.course}</td>
                <td class="py-3 px-4 text-center">${statusBadge}</td>
            `;
            dashboardAttendanceTableBody.appendChild(trOverview);
        }

        // Render for Attendance Table
        if (attendanceTableBody) {
            const trAttendance = document.createElement('tr');
            
            // Get current selected date
            const selectedDate = attendanceDateInput ? attendanceDateInput.value : new Date().toISOString().split('T')[0];
            
            // Extract status for that specific date
            const records = student.attendance_records || {};
            const currentStatus = records[selectedDate] || null;

            // Determine status display
            let statusHTML = '<span class="text-on-surface-variant opacity-50">Not marked</span>';
            let btnClass = 'bg-surface-container border-white/10 text-on-surface-variant hover:border-primary/50 hover:text-primary';
            let btnIcon = 'check_box_outline_blank';
            
            if (currentStatus === 'present') {
                statusHTML = '<span class="text-[#22c55e] font-semibold flex items-center justify-center gap-1"><span class="material-symbols-outlined text-sm">check_circle</span> Present</span>';
                btnClass = 'bg-[#22c55e]/20 border-[#22c55e]/50 text-[#22c55e] hover:bg-[#22c55e]/30';
                btnIcon = 'check_box';
            } else if (currentStatus === 'absent') {
                statusHTML = '<span class="text-[#ef4444] font-semibold flex items-center justify-center gap-1"><span class="material-symbols-outlined text-sm">cancel</span> Absent</span>';
                btnClass = 'bg-[#ef4444]/20 border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444]/30';
                btnIcon = 'disabled_by_default';
            }

            trAttendance.innerHTML = `
                <td class="py-3 px-4 text-on-surface font-semibold">${student.first_name} ${student.last_name}</td>
                <td class="py-3 px-4 text-on-surface-variant">${student.course}</td>
                <td class="py-3 px-4 text-center">${statusHTML}</td>
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="markAttendance('${student.student_id}', 'present')" class="w-8 h-8 rounded flex items-center justify-center border transition-colors ${currentStatus === 'present' ? btnClass : 'bg-surface-container border-white/10 text-on-surface-variant hover:border-[#22c55e]/50 hover:text-[#22c55e]'}">
                            <span class="material-symbols-outlined text-xl">${currentStatus === 'present' ? 'check_box' : 'check_box_outline_blank'}</span>
                        </button>
                        <button onclick="markAttendance('${student.student_id}', 'absent')" class="w-8 h-8 rounded flex items-center justify-center border transition-colors ${currentStatus === 'absent' ? btnClass : 'bg-surface-container border-white/10 text-on-surface-variant hover:border-[#ef4444]/50 hover:text-[#ef4444]'}">
                            <span class="material-symbols-outlined text-xl">${currentStatus === 'absent' ? 'disabled_by_default' : 'indeterminate_check_box'}</span>
                        </button>
                    </div>
                </td>
            `;
            attendanceTableBody.appendChild(trAttendance);
        }
    });
}

function setFormLoading(isLoading) {
    if (isLoading) {
        submitBtnText.style.display = 'none';
        submitLoader.style.display = 'block';
        form.querySelector('button[type="submit"]').disabled = true;
    } else {
        submitBtnText.style.display = 'block';
        submitLoader.style.display = 'none';
        form.querySelector('button[type="submit"]').disabled = false;
    }
}

function setTableLoading(isLoading) {
    if (isLoading) {
        refreshBtn.classList.add('pulse');
        if (refreshAttendanceBtn) refreshAttendanceBtn.classList.add('pulse');
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Loading students...</td></tr>`;
        if (dashboardTableBody) dashboardTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-on-surface-variant">Loading students...</td></tr>`;
        if (dashboardAttendanceTableBody) dashboardAttendanceTableBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-on-surface-variant">Loading records...</td></tr>`;
        if (attendanceTableBody) attendanceTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-on-surface-variant">Loading students...</td></tr>`;
    } else {
        refreshBtn.classList.remove('pulse');
        if (refreshAttendanceBtn) refreshAttendanceBtn.classList.remove('pulse');
    }
}

function setTableError() {
    refreshBtn.classList.remove('pulse');
    if (refreshAttendanceBtn) refreshAttendanceBtn.classList.remove('pulse');
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Failed to load data. Is your API URL correct?</td></tr>`;
    if (dashboardTableBody) dashboardTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-error">Failed to load data.</td></tr>`;
    if (dashboardAttendanceTableBody) dashboardAttendanceTableBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-error">Failed to load data.</td></tr>`;
    if (attendanceTableBody) attendanceTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-error">Failed to load data.</td></tr>`;
}

/**
 * Handle marking attendance
 */
async function markAttendance(studentId, status) {
    // Find the student locally
    const student = allStudents.find(s => s.student_id === studentId);
    if (!student) return;

    // Get current date from picker
    const selectedDate = attendanceDateInput ? attendanceDateInput.value : new Date().toISOString().split('T')[0];
    if (!selectedDate) {
        showToast("Please select a date first.", "error");
        return;
    }

    // Initialize records if missing
    if (!student.attendance_records) {
        student.attendance_records = {};
    }

    // Save previous state for rollback on error
    const prevStatus = student.attendance_records[selectedDate];
    
    // Optimistic UI update
    student.attendance_records[selectedDate] = status;
    renderStudents(allStudents);

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ attendance_records: student.attendance_records })
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok) throw new Error("Failed to update attendance");
        
        showToast(`Marked ${student.first_name} as ${status} on ${selectedDate}`, "success");
    } catch (error) {
        console.error("Attendance update error:", error);
        // Rollback
        if (prevStatus) {
            student.attendance_records[selectedDate] = prevStatus;
        } else {
            delete student.attendance_records[selectedDate];
        }
        renderStudents(allStudents);
        showToast("Error updating attendance.", "error");
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}
