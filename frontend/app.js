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
const refreshBtn = document.getElementById('refresh-btn');
const toast = document.getElementById('toast');
const searchInput = document.getElementById('search-input');

let allStudents = []; // Stores all fetched students for filtering

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================
let authToken = null;

function checkAuth() {
    // 1. Check if we just came back from the login page (token is in the URL hash)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    if (params.has('id_token')) {
        // Save the token to local storage and clear the URL so it looks clean
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
loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
refreshBtn.addEventListener('click', fetchStudents);
form.addEventListener('submit', handleAddStudent);
searchInput.addEventListener('input', handleSearch);

// Sidebar navigation — switch between pages
const navDashboard = document.getElementById('nav-dashboard');
const navStudents = document.getElementById('nav-students');
const pageDashboard = document.getElementById('page-dashboard');
const pageManage = document.getElementById('page-manage');

function showPage(page) {
    // Hide all pages
    pageDashboard.style.display = 'none';
    pageManage.style.display = 'none';
    // Remove active from all nav items
    navDashboard.parentElement.classList.remove('active');
    navStudents.parentElement.classList.remove('active');

    if (page === 'dashboard') {
        pageDashboard.style.display = 'block';
        navDashboard.parentElement.classList.add('active');
    } else {
        pageManage.style.display = 'block';
        navStudents.parentElement.classList.add('active');
        fetchStudents(); // Refresh data when opening this page
    }
}

navDashboard.addEventListener('click', (e) => { e.preventDefault(); showPage('dashboard'); });
navStudents.addEventListener('click', (e) => { e.preventDefault(); showPage('manage'); });

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
        document.getElementById('detail-enrollment').textContent = currentStudent.enrollment_date || '—';
        document.getElementById('detail-created').textContent = currentStudent.created_at || '—';
        document.getElementById('detail-updated').textContent = currentStudent.updated_at || '—';

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

    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No students found. Add one above!</td></tr>`;
        return;
    }

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${student.first_name} ${student.last_name}</strong></td>
            <td>${student.course}</td>
            <td>${student.email}</td>
            <td>${student.age}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewStudent('${student.student_id}')">View</button>
                    <button class="btn-danger" onclick="deleteStudent('${student.student_id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
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
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Loading students...</td></tr>`;
    } else {
        refreshBtn.classList.remove('pulse');
    }
}

function setTableError() {
    refreshBtn.classList.remove('pulse');
    tableBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color: #ef4444;">Failed to load data. Is your API URL correct?</td></tr>`;
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}
