/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LANDING PAGE HELPERS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function goToAuth(tab) {
    if (tab !== 'login' || !isAdminLoginMode) clearAdminLoginMode();
    document.getElementById('view-landing').classList.add('hidden');
    const authWrap = document.getElementById('view-auth');
    authWrap.classList.remove('hidden');
    // Reset animation
    authWrap.classList.remove('page-fade');
    void authWrap.offsetWidth;
    authWrap.classList.add('page-fade');
    switchAuthTab(tab || 'login');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function goToLanding() {
    clearAdminLoginMode();
    document.getElementById('view-auth').classList.add('hidden');
    document.getElementById('view-main').classList.add('hidden');
    const landing = document.getElementById('view-landing');
    landing.classList.remove('hidden');
    landing.classList.remove('page-fade');
    void landing.offsetWidth;
    landing.classList.add('page-fade');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (typeof history.replaceState === 'function') {
        history.replaceState(null, '', location.pathname + location.search);
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    // If auth or main is showing, go back to landing first
    if (!document.getElementById('view-landing').classList.contains('hidden')) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        goToLanding();
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   APP STATE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const USER_STORE_KEY = 'deepsense_users';
const DEFAULT_ADMIN_EMAIL = 'admin@deepsense.health';
const DEFAULT_ADMIN_PASSWORD = 'Admin@2025';

let currentRole = 'Patient';
let currentPage = 'dashboard';
let currentUserName = '';
let isAdminLoginMode = false;
let micOn = true,
    camOn = true;

function seedDefaultAdmin() {
    const users = loadUserRecords();
    if (users.some(u => u.email === DEFAULT_ADMIN_EMAIL)) return;
    users.push({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        fullName: 'Platform Administrator',
        role: 'Admin',
        medicalLicense: null,
    });
    saveUserRecords(users);
}

seedDefaultAdmin();

function goToAdminLogin() {
    isAdminLoginMode = true;
    goToAuth('login');
    const banner = document.getElementById('admin-login-banner');
    const loginName = document.getElementById('login-name');
    const submitBtn = document.getElementById('login-submit-btn');
    const emailEl = document.getElementById('login-email');
    if (banner) banner.classList.remove('hidden');
    if (loginName) loginName.closest('.field')?.classList.add('hidden');
    if (submitBtn) submitBtn.textContent = 'Sign in to admin';
    if (emailEl) {
        emailEl.value = DEFAULT_ADMIN_EMAIL;
        emailEl.focus();
    }
    const passEl = document.getElementById('login-pass');
    if (passEl) passEl.value = '';
}

function clearAdminLoginMode() {
    isAdminLoginMode = false;
    const banner = document.getElementById('admin-login-banner');
    const loginName = document.getElementById('login-name');
    const submitBtn = document.getElementById('login-submit-btn');
    if (banner) banner.classList.add('hidden');
    if (loginName) loginName.closest('.field')?.classList.remove('hidden');
    if (submitBtn) submitBtn.textContent = 'Sign in';
}

const navIcons = {
    dashboard: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>',
    analysis: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M20 20l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 11h6M11 8v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    patients: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    appointments: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    teleconsult: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>',
    reports: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="17" x2="13" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    myreports: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>',
    users: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.5"/></svg>',
    clinics: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9v.01M9 12v.01M9 15v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    analytics: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    system: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    audit: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
};

function renderTopbar(title, subtitle, actionsHtml = '') {
    const sub = subtitle ? `<p class="topbar-sub">${subtitle}</p>` : '';
    return `<div class="topbar">
      <div class="topbar-left">
        <h1>${title}</h1>${sub}
      </div>
      <div class="topbar-actions">${actionsHtml}</div>
    </div>`;
}

function getPlatformStats() {
    const users = loadUserRecords();
    const dentists = users.filter(u => u.role === 'Dentist').length;
    const patients = users.filter(u => u.role === 'Patient').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    return {
        totalUsers: users.length,
        dentists,
        patients,
        admins,
        analyses: 12480,
        clinics: Math.max(dentists, 1) * 3,
        appointmentsToday: 142,
        uptime: '99.97%',
    };
}

function loadUserRecords() {
    try {
        const raw = localStorage.getItem(USER_STORE_KEY);
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveUserRecords(users) {
    localStorage.setItem(USER_STORE_KEY, JSON.stringify(users));
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs[0].classList.toggle('active', tab === 'login');
    tabs[1].classList.toggle('active', tab === 'signup');
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
    const fragment = tab === 'signup' ? 'signup' : 'login';
    if (typeof history.replaceState === 'function') {
        const base = `${location.pathname}${location.search}`;
        history.replaceState(null, '', `${base}#${fragment}`);
    } else {
        location.hash = fragment;
    }
}

function syncAuthTabFromHash() {
    // Only act if auth view is visible (not on initial landing load)
    if (document.getElementById('view-auth').classList.contains('hidden')) return;
    const h = (location.hash || '').replace(/^#\/?/, '').toLowerCase().split(/[&?]/)[0];
    if (h === 'signup') switchAuthTab('signup');
    else switchAuthTab('login');
}

function getSignupSelectedRole() {
    const d = document.getElementById('signup-role-dentist-btn');
    return d && d.classList.contains('active') ? 'Dentist' : 'Patient';
}

function selectSignupRole(role) {
    const dentistBtn = document.getElementById('signup-role-dentist-btn');
    const patientBtn = document.getElementById('signup-role-patient-btn');
    const licenseWrap = document.getElementById('signup-license-wrap');
    const licenseInput = document.getElementById('signup-license');
    if (dentistBtn) dentistBtn.classList.toggle('active', role === 'Dentist');
    if (patientBtn) patientBtn.classList.toggle('active', role === 'Patient');
    if (licenseWrap) licenseWrap.classList.toggle('hidden', role !== 'Dentist');
    if (role !== 'Dentist' && licenseInput) licenseInput.value = '';
}

function doLogin() {
    const isSignup = !document.getElementById('signup-form').classList.contains('hidden');
    const nameInput = document.getElementById(isSignup ? 'signup-name' : 'login-name');
    const emailInput = document.getElementById(isSignup ? 'signup-email' : 'login-email');
    const passInput = document.getElementById(isSignup ? 'signup-pass' : 'login-pass');
    let fullName = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (isSignup && !fullName) {
        showNotif('Please enter your full name.');
        if (nameInput) nameInput.focus();
        return;
    }
    if (!email) {
        showNotif('Please enter your email address.');
        if (emailInput) emailInput.focus();
        return;
    }
    if (!isValidEmail(email)) {
        showNotif('Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
    }
    if (!password) {
        showNotif('Please enter your password.');
        if (passInput) passInput.focus();
        return;
    }

    const emailLower = email.toLowerCase();

    if (isSignup) {
        const signupRole = getSignupSelectedRole();
        const licenseInput = document.getElementById('signup-license');
        const medicalLicense =
            signupRole === 'Dentist' && licenseInput ? licenseInput.value.trim() : '';
        if (signupRole === 'Dentist' && !medicalLicense) {
            showNotif('Please enter your medical license number.');
            if (licenseInput) licenseInput.focus();
            return;
        }
        const users = loadUserRecords();
        if (users.some(u => u.email === emailLower)) {
            showNotif('This email is already registered. Try logging in instead.');
            return;
        }
        users.push({
            email: emailLower,
            password,
            fullName,
            role: signupRole,
            medicalLicense: signupRole === 'Dentist' ? medicalLicense : null,
        });
        saveUserRecords(users);
        showNotif('Account created successfully! Please login to continue.', 4000);
        const signupNameEl = document.getElementById('signup-name');
        const signupLicenseEl = document.getElementById('signup-license');
        const signupPassEl = document.getElementById('signup-pass');
        if (signupNameEl) signupNameEl.value = '';
        if (signupLicenseEl) signupLicenseEl.value = '';
        if (signupPassEl) signupPassEl.value = '';
        const signupEmailEl = document.getElementById('signup-email');
        if (signupEmailEl) signupEmailEl.value = '';
        const loginEmailEl = document.getElementById('login-email');
        if (loginEmailEl) loginEmailEl.value = email;
        switchAuthTab('login');
        const loginPassEl = document.getElementById('login-pass');
        if (loginPassEl) {
            loginPassEl.value = '';
            loginPassEl.focus();
        }
        return;
    }

    const users = loadUserRecords();
    const idx = users.findIndex(u => u.email === emailLower && u.password === password);
    if (idx === -1) {
        showNotif('Invalid email or password.');
        return;
    }
    if (isAdminLoginMode && users[idx].role !== 'Admin') {
        showNotif('This account does not have administrator access.');
        return;
    }
    if (fullName) {
        users[idx].fullName = fullName;
        saveUserRecords(users);
    }
    fullName = users[idx].fullName || email;
    let sessionRole = users[idx].role;
    if (sessionRole !== 'Dentist' && sessionRole !== 'Admin') sessionRole = 'Patient';
    const roleLabel = sessionRole === 'Admin' ? 'Administrator' : sessionRole;
    showNotif(`Signed in as ${roleLabel}. Loading dashboard...`);
    clearAdminLoginMode();

    currentRole = sessionRole;
    currentUserName = fullName;
    setTimeout(() => {
        document.getElementById('view-auth').classList.add('hidden');
        document.getElementById('view-main').classList.remove('hidden');
        if (typeof history.replaceState === 'function') {
            const base = `${location.pathname}${location.search}`;
            history.replaceState(null, '', base);
        } else {
            location.hash = '';
        }
        setupDashboard();
        navigate('dashboard');
    }, 600);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getInitialsFromName(fullName) {
    return fullName
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('') || 'NA';
}

function openForgotPassword() {
    const loginEmail = document.getElementById('login-email');
    const prefillEmail = loginEmail ? loginEmail.value.trim() : '';
    showModal(`<h3>Reset password</h3>
    <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:1rem">Enter your account email and we will send you a reset link.</p>
    <div class="field"><label>Email address</label><input type="email" id="reset-email" placeholder="you@example.com" value="${prefillEmail}" onkeydown="if(event.key==='Enter')sendPasswordResetLink()"/></div>
    <div style="display:flex;gap:8px;margin-top:1rem">
      <button class="btn-sm btn-blue-sm" style="flex:1" onclick="sendPasswordResetLink()">Send reset link</button>
      <button class="btn-sm" style="flex:1" onclick="closeModal()">Cancel</button>
    </div>`);
}

function sendPasswordResetLink() {
    const emailInput = document.getElementById('reset-email');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) {
        showNotif('Please enter your email address.');
        if (emailInput) emailInput.focus();
        return;
    }
    if (!isValidEmail(email)) {
        showNotif('Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
    }
    closeModal();
    showNotif(`Password reset link sent to ${email}`, 3500);
}

function logout() {
    document.getElementById('view-main').classList.add('hidden');
    goToLanding();
}

function showNotif(msg, dur = 2500) {
    const n = document.getElementById('notif');
    n.textContent = msg;
    n.classList.remove('hidden');
    setTimeout(() => n.classList.add('hidden'), dur);
}

function showModal(html) {
    document.getElementById('modal-inner').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
});

window.addEventListener('hashchange', syncAuthTabFromHash);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAuthTabFromHash);
} else {
    syncAuthTabFromHash();
}

const navConfigs = {
    Dentist: [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { id: 'analysis', icon: 'analysis', label: 'AI Analysis' },
        { id: 'patients', icon: 'patients', label: 'Patients' },
        { id: 'appointments', icon: 'appointments', label: 'Appointments' },
        { id: 'teleconsult', icon: 'teleconsult', label: 'Telehealth' },
        { id: 'reports', icon: 'reports', label: 'Reports' },
    ],
    Patient: [
        { id: 'dashboard', icon: 'dashboard', label: 'Home' },
        { id: 'myreports', icon: 'myreports', label: 'My Reports' },
        { id: 'appointments', icon: 'appointments', label: 'Appointments' },
        { id: 'teleconsult', icon: 'teleconsult', label: 'Video Call' },
    ],
    Admin: [
        { id: 'dashboard', icon: 'dashboard', label: 'Overview' },
        { id: 'admin-users', icon: 'users', label: 'Users' },
        { id: 'admin-clinics', icon: 'clinics', label: 'Clinics' },
        { id: 'admin-analytics', icon: 'analytics', label: 'Analytics' },
        { id: 'admin-audit', icon: 'audit', label: 'Audit log' },
        { id: 'admin-system', icon: 'system', label: 'System' },
    ],
};

function setupDashboard() {
    const nav = document.getElementById('sidebar-nav');
    const sidebar = document.getElementById('app-sidebar');
    const mainLayout = document.getElementById('view-main');
    const items = navConfigs[currentRole] || navConfigs.Dentist;
    const isAdmin = currentRole === 'Admin';

    if (sidebar) sidebar.classList.toggle('sidebar-admin', isAdmin);
    if (mainLayout) mainLayout.classList.toggle('layout-admin', isAdmin);

    const brand = document.getElementById('sidebar-brand');
    if (brand) brand.textContent = isAdmin ? 'DeepSense Admin' : 'DeepSense';

    const sectionLabel = document.getElementById('sidebar-section-label');
    if (sectionLabel) sectionLabel.textContent = isAdmin ? 'Administration' : 'Menu';

    nav.innerHTML = items
        .map(
            i => `
    <div class="nav-item ${i.id === 'dashboard' ? 'active' : ''}" onclick="navigate('${i.id}')" id="nav-${i.id}">
      ${navIcons[i.icon] || navIcons.dashboard}
      <span>${i.label}</span>
    </div>`
        )
        .join('');

    const initials = getInitialsFromName(currentUserName);
    const avatar = document.getElementById('sidebar-avatar');
    if (avatar) {
        avatar.textContent = initials;
        avatar.classList.toggle('avatar-admin', isAdmin);
    }
    document.getElementById('sidebar-name').textContent = currentUserName;
    document.getElementById('sidebar-role').textContent = isAdmin ? 'Administrator' : currentRole;
}

function navigate(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const nav = document.getElementById(`nav-${page}`);
    if (nav) nav.classList.add('active');
    const content = document.getElementById('main-content');
    content.classList.remove('page-fade');
    void content.offsetWidth;
    content.classList.add('page-fade');

    const renders = {
        dashboard: renderDashboard,
        analysis: renderAnalysis,
        patients: renderPatients,
        appointments: renderAppointments,
        teleconsult: renderTeleconsult,
        reports: renderReports,
        myreports: renderMyReports,
        'admin-users': renderAdminUsers,
        'admin-clinics': renderAdminClinics,
        'admin-analytics': renderAdminAnalytics,
        'admin-audit': renderAdminAudit,
        'admin-system': renderAdminSystem,
    };
    (renders[page] || renderDashboard)();
}

function statCardPro(label, value, sub, trend, accent, iconSvg) {
    const trendHtml = trend
        ? `<span class="stat-trend ${trend.startsWith('+') ? 'up' : trend.startsWith('-') ? 'down' : ''}">${trend}</span>`
        : '';
    return `<div class="stat-card stat-card-${accent || 'blue'}">
      <div class="stat-card-header">
        <div class="stat-card-icon-wrap">${iconSvg}</div>
        <div class="stat-card-label">${label}</div>
      </div>
      <div class="stat-card-value">${value}</div>
      <div class="stat-card-footer">${sub || ''}${trendHtml}</div>
    </div>`;
}

const dashStatIcons = {
    patients: '<svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M20 20l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    accuracy: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.5"/></svg>',
    report: '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.5"/></svg>',
    visit: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>',
};

function renderDashFinding(severity, title, meta, confidence) {
    const map = {
        high: { color: '#e24b4a', badge: 'badge-red' },
        medium: { color: '#ef9f27', badge: 'badge-amber' },
        low: { color: '#639922', badge: 'badge-green' },
    };
    const s = map[severity] || map.medium;
    return `<div class="dash-finding">
      <div class="dash-finding-indicator" style="background:${s.color}"></div>
      <div class="dash-finding-body">
        <div class="dash-finding-title">${title}</div>
        <div class="dash-finding-meta">${meta}</div>
      </div>
      <span class="badge ${s.badge}">${confidence}</span>
    </div>`;
}

function renderQuickActions(actions) {
    return `<div class="quick-actions">${actions
        .map(
            ([icon, label, desc, page]) => `
      <button type="button" class="quick-action-btn" onclick="navigate('${page}')">
        <span class="quick-action-icon">${icon}</span>
        <span class="quick-action-text">
          <span class="quick-action-label">${label}</span>
          <span class="quick-action-desc">${desc}</span>
        </span>
        <svg class="quick-action-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`
        )
        .join('')}</div>`;
}

function getGreetingName() {
    return (currentUserName || '').trim().split(/\s+/)[0] || 'there';
}

function renderDentistDashboard() {
    const greet = getGreetingName();
    return `
    <div class="dash-welcome dash-welcome-dentist">
      <div class="dash-welcome-text">
        <p class="dash-welcome-label">Good morning</p>
        <h2 class="dash-welcome-title">Dr. ${greet}</h2>
        <p class="dash-welcome-sub">You have <strong>7 appointments</strong> today and <strong>18 AI analyses</strong> completed.</p>
      </div>
      <div class="dash-welcome-actions">
        <button class="btn-sm btn-blue-sm" onclick="navigate('analysis')">New analysis</button>
        <button class="btn-sm" onclick="navigate('appointments')">View calendar</button>
      </div>
    </div>
    ${renderTopbar('Clinic overview', 'Real-time snapshot of your practice', '<span class="badge badge-blue"><span class="live-dot"></span> AI Active</span>')}
    <div class="grid-4">
      ${statCardPro('Total patients', '124', 'Registered in your clinic', '+3 this week', 'blue', dashStatIcons.patients)}
      ${statCardPro('Analyses today', '18', 'DeepSense AI engine', '+5 vs yesterday', 'teal', dashStatIcons.scan)}
      ${statCardPro('Appointments', '7', 'Scheduled for today', '2 telehealth', 'purple', dashStatIcons.calendar)}
      ${statCardPro('Avg. confidence', '94%', 'AI diagnostic accuracy', 'Last 30 days', 'green', dashStatIcons.accuracy)}
    </div>
    ${renderQuickActions([
        [dashStatIcons.scan, 'Run AI analysis', 'Upload and analyse a radiograph', 'analysis'],
        [dashStatIcons.patients, 'Patient records', 'Search and manage patients', 'patients'],
        [dashStatIcons.calendar, 'Appointments', 'Schedule and send reminders', 'appointments'],
        [dashStatIcons.video, 'Telehealth', 'Start a video consultation', 'teleconsult'],
    ])}
    <div class="grid-2 dash-main-grid">
      <div class="card">
        <div class="card-header-row"><h3>Today's schedule</h3><button class="btn-sm" onclick="navigate('appointments')">Full calendar</button></div>
        <div class="dash-schedule">
          ${[
              ['09:00', 'Fatima Noor', 'FN', 'Checkup', 'badge-blue', 'Join', 'teleconsult'],
              ['10:30', 'Ibrahim Qureshi', 'IQ', 'X-ray', 'badge-amber', 'Analyse', 'analysis'],
              ['14:00', 'Amina Siddiqui', 'AS', 'Follow-up', 'badge-green', 'Join', 'teleconsult'],
          ]
              .map(
                  ([time, name, initials, type, badge, action, page]) => `
          <div class="dash-schedule-row">
            <span class="dash-schedule-time">${time}</span>
            <div class="avatar dash-schedule-avatar">${initials}</div>
            <div class="dash-schedule-info"><span class="dash-schedule-name">${name}</span><span class="badge ${badge}">${type}</span></div>
            <button class="btn-sm btn-blue-sm" onclick="navigate('${page}')">${action}</button>
          </div>`
              )
              .join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header-row"><h3>Recent AI findings</h3><button class="btn-sm" onclick="navigate('reports')">All reports</button></div>
        ${renderDashFinding('high', 'Caries â€” Tooth #14', 'Ibrahim Qureshi Â· Today, 10:42 AM', '92%')}
        ${renderDashFinding('medium', 'Early bone loss â€” lower molar', 'Fatima Noor Â· Today, 09:15 AM', '87%')}
        ${renderDashFinding('low', 'No abnormalities detected', 'Amina Siddiqui Â· Yesterday', '96%')}
        <div class="dash-mini-chart">
          <div class="dash-mini-chart-label">Analyses this week</div>
          <div class="bar-chart" style="height:56px">${[8, 12, 10, 15, 14, 18, 18].map(h => `<div class="bar" style="height:${h * 4}%;background:var(--blue)"></div>`).join('')}</div>
          <div class="bar-labels">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<span class="bar-label">${d}</span>`).join('')}</div>
        </div>
      </div>
    </div>`;
}

function renderPatientDashboard() {
    const greet = getGreetingName();
    return `
    <div class="dash-welcome dash-welcome-patient">
      <div class="dash-welcome-text">
        <p class="dash-welcome-label">Welcome back</p>
        <h2 class="dash-welcome-title">${greet}</h2>
        <p class="dash-welcome-sub">Your next appointment is <strong>May 5 at 10:00 AM</strong> with Dr. Yusuf Karim.</p>
      </div>
      <div class="health-score-card">
        <div class="health-score-ring">Good</div>
        <p class="health-score-label">Oral health score</p>
        <p class="health-score-sub">Based on your latest AI report</p>
      </div>
    </div>
    ${renderTopbar('My health', 'Your records, reports, and upcoming care', '<button class="btn-sm btn-blue-sm" onclick="navigate(\'appointments\')">Book appointment</button>')}
    <div class="grid-4">
      ${statCardPro('Last visit', 'Apr 12', 'Routine checkup', '', 'blue', dashStatIcons.visit)}
      ${statCardPro('Next visit', 'May 5', 'Video consultation', '10:00 AM', 'teal', dashStatIcons.calendar)}
      ${statCardPro('Reports', '4', 'Available to download', '1 new', 'purple', dashStatIcons.report)}
      ${statCardPro('Dentist', 'Dr. Karim', 'Your primary provider', 'Active', 'green', dashStatIcons.patients)}
    </div>
    ${renderQuickActions([
        [dashStatIcons.calendar, 'Book appointment', 'Choose a time that works for you', 'appointments'],
        [dashStatIcons.report, 'My reports', 'View diagnosis history', 'myreports'],
        [dashStatIcons.video, 'Video call', 'Join your consultation', 'teleconsult'],
    ])}
    <div class="grid-2 dash-main-grid">
      <div class="card dash-report-card">
        <div class="card-header-row"><h3>Latest clinical report</h3><span class="badge badge-amber">Needs review</span></div>
        ${renderDashFinding('medium', 'Mild caries â€” tooth #14', 'Reviewed by Dr. Yusuf Karim Â· Apr 12, 2025', 'Moderate')}
        <p class="dash-report-note">Your dentist recommends a follow-up within 2 weeks for monitoring and treatment planning.</p>
        <div class="dash-report-actions">
          <button class="btn-sm btn-blue-sm" onclick="navigate('myreports')">View full report</button>
          <button class="btn-sm" onclick="showNotif('PDF downloaded')">Download PDF</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header-row"><h3>Upcoming care</h3><button class="btn-sm" onclick="navigate('appointments')">Manage</button></div>
        <div class="dash-timeline">
          <div class="dash-timeline-item">
            <div class="dash-timeline-icon dash-timeline-icon-video">${dashStatIcons.video}</div>
            <div class="dash-timeline-body">
              <span class="dash-timeline-title">Video consultation</span>
              <span class="dash-timeline-meta">May 5, 2025 Â· 10:00 AM Â· Dr. Yusuf Karim</span>
            </div>
            <button class="btn-sm btn-blue-sm" onclick="navigate('teleconsult')">Join</button>
          </div>
          <div class="dash-timeline-item">
            <div class="dash-timeline-icon dash-timeline-icon-clinic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M9 8h1v4M14 8h1v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>
            <div class="dash-timeline-body">
              <span class="dash-timeline-title">Follow-up X-ray</span>
              <span class="dash-timeline-meta">May 15, 2025 Â· In clinic Â· SmileCare Dental</span>
            </div>
            <span class="badge badge-blue">Scheduled</span>
          </div>
        </div>
        <div class="dash-care-tip"><strong>Tip:</strong> Join your video call 5 minutes early and have your latest report ready.</div>
      </div>
    </div>`;
}

function renderDashboard() {
    const c = document.getElementById('main-content');
    if (currentRole === 'Admin') {
        renderAdminDashboard();
        return;
    }
    if (currentRole === 'Dentist') {
        c.innerHTML = renderDentistDashboard();
    } else {
        c.innerHTML = renderPatientDashboard();
    }
}

function renderAnalysis() {
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>AI Analysis â€” DeepSense</h1><div class="topbar-actions"><span class="badge badge-blue">AI Engine v3.2</span></div></div>
    <div class="grid-2">
      <div>
        <div class="card" style="margin-bottom:1rem">
          <h3>Upload radiograph</h3>
          <div class="upload-zone" onclick="simulateUpload()" id="upload-zone">
            <span class="icon">ðŸ¦·</span>
            <p><strong>Click to upload</strong> or drag & drop</p>
            <p style="font-size:11px;margin-top:4px">DICOM, PNG, JPEG Â· Max 20MB</p>
          </div>
          <div id="upload-progress" class="hidden upload-progress"></div>
        </div>
        <div class="card" id="ai-result-card" class="hidden">
          <h3>Analysis result</h3>
          <div class="xray-container" id="xray-view">
            <div class="xray-img">
              <svg width="200" height="150" viewBox="0 0 200 150">
                <rect width="200" height="150" fill="#111"/>
                <ellipse cx="100" cy="75" rx="80" ry="60" fill="#222"/>
                <rect x="30" y="55" width="18" height="35" rx="4" fill="#444"/>
                <rect x="52" y="45" width="22" height="45" rx="5" fill="#555"/>
                <rect x="78" y="43" width="22" height="47" rx="5" fill="#555"/>
                <rect x="104" y="43" width="22" height="47" rx="5" fill="#555"/>
                <rect x="130" y="45" width="22" height="45" rx="5" fill="#444"/>
                <rect x="156" y="55" width="18" height="35" rx="4" fill="#333"/>
                <rect x="78" y="43" width="22" height="47" rx="5" fill="#e24b4a" fill-opacity=".3"/>
                <rect x="82" y="50" width="10" height="8" rx="2" fill="#e24b4a" fill-opacity=".7"/>
                <rect x="104" y="70" width="22" height="20" rx="3" fill="#ef9f27" fill-opacity=".3"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="card" id="findings-card">
        <h3>AI findings</h3>
        <div style="color:var(--color-text-secondary);font-size:13px;padding:1rem 0;text-align:center" id="findings-placeholder">Upload an image to see AI analysis</div>
        <div id="findings-content" class="hidden">
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;font-weight:500">Caries â€” Tooth #14</span><span class="badge badge-red">92%</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:92%;background:#e24b4a"></div></div>
          </div>
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;font-weight:500">Bone loss â€” Lower left</span><span class="badge badge-amber">78%</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:78%;background:#ef9f27"></div></div>
          </div>
          <div style="margin-bottom:1.5rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;font-weight:500">Overall health score</span><span class="badge badge-green">Good</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:68%;background:#639922"></div></div>
          </div>
          <div style="background:var(--color-background-secondary);border-radius:8px;padding:.75rem;margin-bottom:1rem;font-size:12px;color:var(--color-text-secondary)">
            <strong style="color:var(--color-text-primary);display:block;margin-bottom:4px">AI recommendation</strong>
            Immediate treatment advised for tooth #14. Schedule follow-up within 2 weeks for bone loss monitoring.
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn-sm btn-blue-sm" style="flex:1" onclick="showModal(reportModal())">Generate PDF report</button>
            <button class="btn-sm" style="flex:1" onclick="showNotif('Saved to patient record')">Save to patient</button>
          </div>
        </div>
      </div>
    </div>`;
}

function simulateUpload() {
    const zone = document.getElementById('upload-zone');
    const prog = document.getElementById('upload-progress');
    if (!zone || !prog) return;
    zone.innerHTML = '<p style="font-size:13px;color:var(--color-text-secondary)">Processing radiograph...</p>';
    prog.classList.remove('hidden');
    prog.innerHTML =
        `<div class="upload-file-row"><span>xray_patient_042.jpg</span><div style="flex:1;margin:0 8px"><div class="prog-bar"><div class="prog-fill" id="up-prog" style="width:0%;background:var(--blue)"></div></div></div><span id="up-pct">0%</span></div>`;
    let pct = 0;
    const iv = setInterval(() => {
        pct += 8;
        if (pct > 100) pct = 100;
        const el = document.getElementById('up-prog');
        const pt = document.getElementById('up-pct');
        if (el) el.style.width = pct + '%';
        if (pt) pt.textContent = pct + '%';
        if (pct >= 100) {
            clearInterval(iv);
            showNotif('Analysis complete â€” 2 findings detected');
            const fc = document.getElementById('findings-placeholder');
            const fct = document.getElementById('findings-content');
            if (fc) fc.classList.add('hidden');
            if (fct) fct.classList.remove('hidden');
        }
    }, 120);
}

function reportModal() {
    return `<h3>Generate PDF report</h3>
    <div class="field"><label>Patient name</label><input type="text" value="Ibrahim Qureshi"/></div>
    <div class="field"><label>Include sections</label>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px;font-size:13px">
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" checked/> AI findings summary</label>
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" checked/> Annotated radiograph</label>
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" checked/> Treatment recommendations</label>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:1rem">
      <button class="btn-sm btn-blue-sm" style="flex:1" onclick="closeModal();showNotif('PDF report generated & downloaded')">Download PDF</button>
      <button class="btn-sm" style="flex:1" onclick="closeModal()">Cancel</button>
    </div>`;
}

function renderPatients() {
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>Patients</h1><div class="topbar-actions"><button class="btn-sm btn-blue-sm" onclick="showModal(addPatientModal())">Add patient</button></div></div>
    <div class="card">
      <div style="display:flex;gap:8px;margin-bottom:1rem">
        <input type="text" placeholder="Search patients..." style="flex:1;height:34px;padding:0 10px;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);font-size:13px;background:var(--color-background-primary);color:var(--color-text-primary)"/>
        <button class="btn-sm">Filter</button>
      </div>
      <table class="tbl">
        <thead><tr><th>Name</th><th>Age</th><th>Last visit</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${[
            ['Fatima Noor','32','Apr 12, 2025','Active'],
            ['Ibrahim Qureshi','45','Mar 28, 2025','Pending'],
            ['Amina Siddiqui','28','Apr 20, 2025','Active'],
            ['Bilal Haddad','52','Feb 14, 2025','Inactive'],
            ['Maryam Tariq','39','Apr 25, 2025','Active']
          ].map(([n,a,d,s]) => `
          <tr>
            <td style="display:flex;align-items:center;gap:8px;padding-top:10px">
              <div class="avatar" style="width:24px;height:24px;font-size:10px">${n.split(' ').map(x=>x[0]).join('')}</div>${n}
            </td>
            <td>${a}</td><td>${d}</td>
            <td><span class="badge ${s==='Active'?'badge-green':s==='Pending'?'badge-amber':'badge-red'}">${s}</span></td>
            <td style="display:flex;gap:4px">
              <button class="btn-sm" onclick="navigate('analysis')">Analyze</button>
              <button class="btn-sm" onclick="showNotif('Opening patient history...')">History</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="card" style="margin-top:1rem">
      <h3>Patient timeline â€” Fatima Noor</h3>
      ${[
        ['Apr 12','AI analysis: mild caries detected','badge-amber'],
        ['Mar 1','Checkup: no issues','badge-green'],
        ['Jan 15','X-ray analysis complete','badge-blue'],
        ['Dec 2024','Initial consultation','badge-blue']
      ].map(([d,t,b])=>`
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div><div style="font-size:13px;font-weight:500">${t}</div><div style="font-size:11px;color:var(--color-text-secondary)">${d}</div></div>
          <span class="badge ${b}" style="margin-left:auto">${b.replace('badge-','')}</span>
        </div>`).join('')}
    </div>`;
}

function addPatientModal() {
    return `<h3>Add new patient</h3>
    <div class="field"><label>Full name</label><input type="text" placeholder="Patient name"/></div>
    <div class="field"><label>Date of birth</label><input type="date"/></div>
    <div class="field"><label>Email</label><input type="email" placeholder="patient@email.com"/></div>
    <div style="display:flex;gap:8px;margin-top:1rem">
      <button class="btn-sm btn-blue-sm" style="flex:1" onclick="closeModal();showNotif('Patient added successfully')">Add patient</button>
      <button class="btn-sm" style="flex:1" onclick="closeModal()">Cancel</button>
    </div>`;
}

function renderAppointments() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const apts = [3, 8, 14, 17, 22, 25];
    let sel = 17;
    const isPatient = currentRole === 'Patient';
    const upcomingCard = isPatient
        ? ''
        : `
      <div class="card">
        <h3>Upcoming appointments</h3>
        <table class="tbl">
          <thead><tr><th>Date</th><th>Patient</th><th>Type</th><th></th></tr></thead>
          <tbody>
            <tr><td>May 3</td><td>Fatima Noor</td><td><span class="badge badge-blue">Checkup</span></td><td><button class="btn-sm" onclick="showNotif('Reminder sent')">Remind</button></td></tr>
            <tr><td>May 8</td><td>Ibrahim Qureshi</td><td><span class="badge badge-amber">Analysis</span></td><td><button class="btn-sm" onclick="showNotif('Reminder sent')">Remind</button></td></tr>
            <tr><td>May 14</td><td>Amina Siddiqui</td><td><span class="badge badge-green">Follow-up</span></td><td><button class="btn-sm" onclick="showNotif('Reminder sent')">Remind</button></td></tr>
          </tbody>
        </table>
        <div style="margin-top:1rem;background:var(--color-background-secondary);border-radius:8px;padding:.75rem">
          <div style="font-size:12px;font-weight:500;margin-bottom:4px">Dentist availability</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:12px;color:var(--color-text-secondary)">Available for bookings</span>
            <label style="cursor:pointer;display:flex;align-items:center;gap:6px">
              <input type="checkbox" checked id="avail-toggle" onchange="showNotif(this.checked?'Now accepting bookings':'Availability paused')"/>
              <span style="font-size:12px">Toggle</span>
            </label>
          </div>
        </div>
      </div>`;
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>Appointments</h1><div class="topbar-actions"><button class="btn-sm btn-blue-sm" onclick="bookAptModal()">Book slot</button></div></div>
    <div ${isPatient ? 'style="margin-bottom:1rem"' : 'class="grid-2"'}>
      <div class="card">
        <div class="cal-header">
          <button class="cal-nav">â† Apr</button>
          <span style="font-size:14px;font-weight:500">May 2025</span>
          <button class="cal-nav">Jun â†’</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">
          ${days.map(d=>`<div style="text-align:center;font-size:11px;color:var(--color-text-secondary);padding:4px">${d}</div>`).join('')}
        </div>
        <div class="cal-grid" id="cal-grid">
          ${Array.from({length:31},(_,i)=>{
            const d=i+1;
            return `<div class="cal-day ${apts.includes(d)?'has-apt':''} ${d===1?'today':''} ${d===sel?'selected':''}" onclick="selectCalDay(${d})">${d}</div>`;
          }).join('')}
        </div>
        <div id="time-slots-area" style="margin-top:1rem">
          <h4 style="font-size:12px;color:var(--color-text-secondary);margin-bottom:.5rem">Available slots â€” May ${sel}</h4>
          <div class="time-slots" id="time-slots">
            ${['09:00','09:30','10:00','10:30 (booked)','11:00','14:00','14:30','15:00','16:00'].map(t=>`<div class="slot ${t.includes('booked')?'booked':''}" onclick="pickSlot(this,'${t}')">${t}</div>`).join('')}
          </div>
        </div>
      </div>${upcomingCard}
    </div>`;
    window.selectCalDay = function(d) {
        sel = d;
        document.querySelectorAll('.cal-day').forEach((el, i) => {
            el.classList.toggle('selected', (i + 1) === d);
        });
        const h = document.querySelector('#time-slots-area h4');
        if (h) h.textContent = `Available slots â€” May ${d}`;
    };
    window.pickSlot = function(el, slot) {
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        bookAptModal(slot);
    };
}

function bookAptModal(slot) {
    showModal(`<h3>Confirm booking</h3>
    <div style="background:var(--color-background-secondary);border-radius:8px;padding:.75rem;margin-bottom:1rem;font-size:13px">
      <div><strong>Date:</strong> May 17, 2025</div>
      <div><strong>Time:</strong> ${slot || '10:00 AM'}</div>
      <div><strong>Dentist:</strong> Dr. Yusuf Karim</div>
    </div>
    <div class="field"><label>Patient name</label><input type="text" placeholder="Your name"/></div>
    <div class="field"><label>Reason</label><input type="text" placeholder="Checkup / pain / etc."/></div>
    <div style="display:flex;gap:8px;margin-top:1rem">
      <button class="btn-sm btn-blue-sm" style="flex:1" onclick="closeModal();showNotif('Appointment confirmed!')">Confirm booking</button>
      <button class="btn-sm" style="flex:1" onclick="closeModal()">Cancel</button>
    </div>`);
}

function renderTeleconsult() {
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>Telehealth consultation</h1><div class="topbar-actions"><span class="badge badge-green">â— Live</span></div></div>
    <div class="grid-2">
      <div>
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:1rem">
          <div style="background:#0d1117;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;position:relative">
            <div style="width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e,#0d1b2a)">
              <div style="text-align:center">
                <div class="avatar" style="width:64px;height:64px;font-size:22px;margin:0 auto 8px">YK</div>
                <div style="color:rgba(255,255,255,.8);font-size:14px;font-weight:500">Dr. Yusuf Karim</div>
                <div style="color:rgba(255,255,255,.4);font-size:12px">Dentist Â· Active</div>
              </div>
            </div>
            <div style="position:absolute;bottom:12px;right:12px;width:100px;aspect-ratio:4/3;background:linear-gradient(135deg,#0f3460,#533483);border-radius:8px;border:2px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center">
              <div style="text-align:center">
                <div class="avatar" style="width:28px;height:28px;font-size:10px;margin:0 auto 4px">KR</div>
                <div style="color:rgba(255,255,255,.7);font-size:10px">You</div>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:.75rem;background:var(--color-background-primary)">
            <button class="vc-btn" id="mic-btn" onclick="toggleMic()" title="Mute">ðŸŽ¤</button>
            <button class="vc-btn" id="cam-btn" onclick="toggleCam()" title="Camera">ðŸ“·</button>
            <button class="vc-btn end" onclick="showModal(endCallModal())">ðŸ“ž</button>
            <button class="vc-btn" onclick="showNotif('Screen sharing started')" title="Share screen">ðŸ–¥ï¸</button>
          </div>
        </div>
        <div class="card card-sm">
          <h3>Shared notes</h3>
          <div style="background:var(--color-background-secondary);border-radius:8px;padding:.75rem;font-size:12px;color:var(--color-text-secondary)">
            Patient reports sensitivity on upper left side. AI analysis from Apr 12 shows early caries on #14...
          </div>
        </div>
      </div>
      <div class="card" style="display:flex;flex-direction:column;height:fit-content">
        <h3>Chat</h3>
        <div id="chat-msgs" style="flex:1;overflow-y:auto;max-height:260px;margin-bottom:8px">
          <div class="chat-msg them"><div class="bubble">Hello! Can you describe where the pain is?</div></div>
          <div class="chat-msg me clearfix"><div class="bubble">It's on the upper left, especially with cold drinks</div></div>
          <div class="chat-msg them"><div class="bubble">I can see from the AI analysis â€” we'll look at tooth #14</div></div>
        </div>
        <div class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendChat()"/>
          <button class="btn-sm btn-blue-sm" onclick="sendChat()">Send</button>
        </div>
      </div>
    </div>`;
}

window.toggleMic = function() {
    micOn = !micOn;
    const btn = document.getElementById('mic-btn');
    if (btn) { btn.textContent = micOn ? '🎤' : '🔇';
        btn.classList.toggle('active', !micOn); }
    showNotif(micOn ? 'Microphone on' : 'Microphone muted');
};
window.toggleCam = function() {
    camOn = !camOn;
    const btn = document.getElementById('cam-btn');
    if (btn) { btn.textContent = camOn ? '🎥' : '🔴';
        btn.classList.toggle('active', !camOn); }
    showNotif(camOn ? 'Camera on' : 'Camera off');
};

window.finishTeleconsultCall = function() {
    closeModal();
    navigate(currentRole === 'Dentist' ? 'patients' : 'dashboard');
    showNotif('Call ended. Summary saved.');
};

function endCallModal() {
    return `<h3>End consultation?</h3>
    <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:1rem">A summary will be saved to the patient record when you end the call.</p>
    <div style="display:flex;gap:8px">
      <button class="btn-sm" style="background:#e24b4a;color:white;border-color:#e24b4a;flex:1" onclick="finishTeleconsultCall()">End call</button>
      <button class="btn-sm" style="flex:1" onclick="closeModal()">Stay in call</button>
    </div>`;
}

window.sendChat = function() {
    const inp = document.getElementById('chat-input');
    if (!inp || !inp.value.trim()) return;
    const msgs = document.getElementById('chat-msgs');
    const div = document.createElement('div');
    div.className = 'chat-msg me clearfix';
    div.innerHTML = `<div class="bubble">${inp.value}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    inp.value = '';
};

function renderReports() {
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>Reports</h1></div>
    <div class="card">
      <table class="tbl">
        <thead><tr><th>Patient</th><th>Date</th><th>Findings</th><th>Confidence</th><th>Actions</th></tr></thead>
        <tbody>
          ${[
            ['Fatima Noor','Apr 12','Bone loss','87%','badge-amber'],
            ['Ibrahim Qureshi','Mar 28','Caries #14','92%','badge-red'],
            ['Amina Siddiqui','Apr 20','No issues','96%','badge-green'],
            ['Bilal Haddad','Feb 14','Calculus','80%','badge-amber'],
            ['Maryam Tariq','Apr 25','No issues','98%','badge-green']
          ].map(([n,d,f,c,b])=>`
          <tr>
            <td>${n}</td><td>${d}</td>
            <td><span class="badge ${b}">${f}</span></td>
            <td style="font-weight:500">${c}</td>
            <td><button class="btn-sm btn-blue-sm" onclick="showNotif('PDF downloaded')">Download PDF</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderMyReports() {
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>My reports</h1></div>
    <div class="card">
      <h3>Report timeline</h3>
      ${[
        ['Apr 12, 2025','Mild caries â€” tooth #14','Reviewed by Dr. Yusuf Karim','badge-amber'],
        ['Mar 1, 2025','Routine checkup â€” all clear','No action required','badge-green'],
        ['Jan 15, 2025','X-ray: early calculus buildup','Treatment recommended','badge-amber'],
        ['Dec 2024','Initial consultation','Records created','badge-blue']
      ].map(([d,t,s,b])=>`
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:500">${t}</div><div style="font-size:11px;color:var(--color-text-secondary)">${d} Â· ${s}</div></div>
        <button class="btn-sm" style="flex-shrink:0" onclick="showNotif('Report downloaded')">View PDF</button>
      </div>`).join('')}
    </div>`;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ADMIN PANEL
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function statCard(label, value, sub, trend, accent) {
    const trendHtml = trend
        ? `<span class="stat-trend ${trend.startsWith('+') ? 'up' : trend.startsWith('-') ? 'down' : ''}">${trend}</span>`
        : '';
    return `<div class="stat-card stat-card-${accent || 'blue'}">
      <div class="stat-card-label">${label}</div>
      <div class="stat-card-value">${value}</div>
      <div class="stat-card-footer">${sub || ''}${trendHtml}</div>
    </div>`;
}

function renderAdminDashboard() {
    const s = getPlatformStats();
    const c = document.getElementById('main-content');
    c.innerHTML = `
    ${renderTopbar('Platform overview', 'Monitor clinics, users, and AI diagnostics across DeepSense', '<span class="badge badge-admin">Live</span><button class="btn-sm btn-blue-sm" onclick="navigate(\'admin-users\')">Manage users</button>')}
    <div class="grid-4">
      ${statCard('Total users', s.totalUsers, `${s.dentists} dentists Â· ${s.patients} patients`, '+12% this month', 'blue')}
      ${statCard('Active clinics', s.clinics, 'Registered practices', '+8 new', 'teal')}
      ${statCard('AI analyses', s.analyses.toLocaleString(), 'All time', '+340 today', 'purple')}
      ${statCard('Appointments today', s.appointmentsToday, 'Scheduled across clinics', '+12', 'green')}
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header-row">
          <h3>User growth</h3>
          <span class="badge badge-blue">Last 7 days</span>
        </div>
        <div class="bar-chart" style="height:100px">
          ${[42, 58, 51, 72, 68, 85, 94].map((h, i) => `<div class="bar" style="height:${h}%;background:var(--indigo)" title="Day ${i + 1}"></div>`).join('')}
        </div>
        <div class="bar-labels">
          ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span class="bar-label">${d}</span>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header-row">
          <h3>System health</h3>
          <span class="badge badge-green">Operational</span>
        </div>
        <div class="health-list">
          <div class="health-row"><span>API uptime</span><strong>${s.uptime}</strong></div>
          <div class="health-row"><span>AI inference</span><strong>3.8s avg</strong></div>
          <div class="health-row"><span>Storage</span><strong>68% used</strong></div>
          <div class="health-row"><span>HIPAA audit</span><strong class="text-green">Passed</strong></div>
        </div>
        <button class="btn-sm" style="margin-top:1rem;width:100%" onclick="navigate('admin-system')">View system settings</button>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header-row"><h3>Recent registrations</h3><button class="btn-sm" onclick="navigate('admin-users')">View all</button></div>
        <table class="tbl">
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
          <tbody>${getRecentUsersRows(5)}</tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-header-row"><h3>Recent activity</h3></div>
        ${getAuditEntries(5)
            .map(
                e => `<div class="activity-row">
          <div class="activity-icon">${e.icon}</div>
          <div class="activity-body">
            <div class="activity-title">${e.title}</div>
            <div class="activity-meta">${e.time}</div>
          </div>
        </div>`
            )
            .join('')}
      </div>
    </div>`;
}

function getRecentUsersRows(limit) {
    const users = loadUserRecords()
        .filter(u => u.role !== 'Admin')
        .slice(-limit)
        .reverse();
    if (!users.length) {
        return '<tr><td colspan="4" style="color:var(--color-text-secondary)">No users registered yet</td></tr>';
    }
    return users
        .map(u => {
            const badge =
                u.role === 'Dentist' ? 'badge-blue' : 'badge-green';
            return `<tr>
        <td>${u.fullName}</td>
        <td><span class="badge ${badge}">${u.role}</span></td>
        <td style="color:var(--color-text-secondary)">${u.email}</td>
        <td><span class="badge badge-green">Active</span></td>
      </tr>`;
        })
        .join('');
}

function getAuditEntries(limit) {
    const entries = [
        { icon: 'ðŸ”¬', title: 'AI analysis completed â€” Clinic SmileCare', time: '2 min ago' },
        { icon: 'ðŸ‘¤', title: 'New dentist registered â€” Dr. Aisha Khan', time: '18 min ago' },
        { icon: 'ðŸ“‹', title: 'PDF report generated â€” Patient #4421', time: '34 min ago' },
        { icon: 'ðŸ¥', title: 'New clinic registered â€” Bright Dental Studio', time: '1 hr ago' },
        { icon: 'ðŸ”’', title: 'Admin login â€” Platform Administrator', time: '2 hr ago' },
        { icon: 'ðŸ“…', title: '142 appointments booked today', time: '3 hr ago' },
        { icon: 'âš¡', title: 'AI model v3.2 deployed to production', time: 'Yesterday' },
    ];
    return entries.slice(0, limit);
}

function renderAdminUsers() {
    const users = loadUserRecords();
    const c = document.getElementById('main-content');
    c.innerHTML = `
    ${renderTopbar('User management', `${users.length} accounts on the platform`, '<button class="btn-sm btn-blue-sm" onclick="showNotif(\'Export started â€” CSV will download shortly\')">Export CSV</button>')}
    <div class="card">
      <div class="toolbar-row">
        <input type="text" class="search-input" placeholder="Search by name or email..." oninput="filterAdminUsers(this.value)"/>
        <select class="filter-select" id="user-role-filter" onchange="filterAdminUsers()">
          <option value="">All roles</option>
          <option value="Dentist">Dentist</option>
          <option value="Patient">Patient</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <table class="tbl" id="admin-users-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>License</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${users.map(renderUserRow).join('')}</tbody>
      </table>
    </div>`;
}

function renderUserRow(u) {
    const roleBadge =
        u.role === 'Admin' ? 'badge-purple' : u.role === 'Dentist' ? 'badge-blue' : 'badge-green';
    return `<tr data-role="${u.role}" data-search="${(u.fullName + ' ' + u.email).toLowerCase()}">
      <td><div class="tbl-user"><div class="avatar" style="width:28px;height:28px;font-size:10px">${getInitialsFromName(u.fullName)}</div><span>${u.fullName}</span></div></td>
      <td style="color:var(--color-text-secondary)">${u.email}</td>
      <td><span class="badge ${roleBadge}">${u.role}</span></td>
      <td style="color:var(--color-text-secondary)">${u.medicalLicense || 'â€”'}</td>
      <td><span class="badge badge-green">Active</span></td>
      <td><button class="btn-sm" onclick="showNotif('User details opened')">View</button></td>
    </tr>`;
}

window.filterAdminUsers = function (query) {
    const q = (query ?? document.querySelector('.search-input')?.value ?? '').toLowerCase();
    const role = document.getElementById('user-role-filter')?.value ?? '';
    document.querySelectorAll('#admin-users-table tbody tr').forEach(row => {
        const matchQ = !q || (row.dataset.search || '').includes(q);
        const matchR = !role || row.dataset.role === role;
        row.style.display = matchQ && matchR ? '' : 'none';
    });
};

function renderAdminClinics() {
    const clinics = [
        ['SmileCare Dental', 'Karachi', '4 dentists', 'Active'],
        ['Bright Dental Studio', 'Lahore', '8 dentists', 'Active'],
        ['Family Dental Hub', 'Islamabad', '1 dentist', 'Active'],
        ['Premier Oral Health', 'Rawalpindi', '3 dentists', 'Active'],
        ['City Smile Clinic', 'Multan', '5 dentists', 'Active'],
    ];
    document.getElementById('main-content').innerHTML = `
    ${renderTopbar('Clinics', 'Manage registered dental practices', '<button class="btn-sm btn-blue-sm" onclick="showNotif(\'Clinic onboarding wizard opened\')">Add clinic</button>')}
    <div class="grid-3">
      ${clinics
          .map(
              ([name, city, staff, status]) => `
      <div class="clinic-card">
        <div class="clinic-card-top">
          <div class="clinic-icon">${name.charAt(0)}</div>
        </div>
        <h4 class="clinic-name">${name}</h4>
        <p class="clinic-meta">${city} Â· ${staff}</p>
        <div class="clinic-footer">
          <span class="badge badge-green">${status}</span>
          <button class="btn-sm" onclick="showNotif('Clinic profile opened')">Manage</button>
        </div>
      </div>`
          )
          .join('')}
    </div>`;
}

function renderAdminAnalytics() {
    const s = getPlatformStats();
    document.getElementById('main-content').innerHTML = `
    ${renderTopbar('Analytics', 'Platform-wide insights and performance metrics', '<button class="btn-sm" onclick="showNotif(\'Report scheduled for Monday 9 AM\')">Schedule report</button>')}
    <div class="grid-4">
      ${statCard('Analyses / day', '340', 'Avg. last 30 days', '+22%', 'blue')}
      ${statCard('Active dentists', s.dentists, 'On platform', '+4', 'teal')}
      ${statCard('Avg. scan time', '3.8s', 'AI inference', '-0.2s', 'green')}
      ${statCard('Report downloads', '1,240', 'Last 30 days', '+18%', 'purple')}
    </div>
    <div class="grid-2">
      <div class="card">
        <h3>Analyses by clinic</h3>
        <div class="revenue-bars">
          <div class="revenue-row"><span>SmileCare Dental</span><div class="revenue-bar-wrap"><div class="revenue-bar" style="width:72%;background:var(--indigo)"></div></div><strong>2,840</strong></div>
          <div class="revenue-row"><span>Bright Dental Studio</span><div class="revenue-bar-wrap"><div class="revenue-bar" style="width:55%;background:var(--blue)"></div></div><strong>1,920</strong></div>
          <div class="revenue-row"><span>Family Dental Hub</span><div class="revenue-bar-wrap"><div class="revenue-bar" style="width:35%;background:var(--teal)"></div></div><strong>680</strong></div>
        </div>
      </div>
      <div class="card">
        <h3>Top findings (AI)</h3>
        ${[
            ['Caries', 38, '#e24b4a'],
            ['Bone loss', 24, '#ef9f27'],
            ['Calculus', 18, '#178fd4'],
            ['No issues', 20, '#639922'],
        ]
            .map(
                ([label, pct, color]) => `
        <div style="margin-bottom:.75rem">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${label}</span><span style="font-weight:500">${pct}%</span></div>
          <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>`
            )
            .join('')}
      </div>
    </div>`;
}

function renderAdminAudit() {
    const entries = getAuditEntries(12);
    document.getElementById('main-content').innerHTML = `
    ${renderTopbar('Audit log', 'Security and compliance event history', '<span class="badge badge-green">HIPAA compliant</span>')}
    <div class="card">
      <table class="tbl">
        <thead><tr><th>Event</th><th>User</th><th>IP</th><th>Time</th></tr></thead>
        <tbody>
          ${entries
              .map(
                  (e, i) => `<tr>
            <td>${e.title}</td>
            <td style="color:var(--color-text-secondary)">${i === 4 ? 'admin@deepsense.health' : 'system'}</td>
            <td style="color:var(--color-text-secondary)">192.168.${i + 1}.${10 + i}</td>
            <td style="color:var(--color-text-secondary)">${e.time}</td>
          </tr>`
              )
              .join('')}
        </tbody>
      </table>
    </div>`;
}

function renderAdminSystem() {
    document.getElementById('main-content').innerHTML = `
    ${renderTopbar('System settings', 'Configure platform services and AI engine', '<button class="btn-sm btn-blue-sm" onclick="showNotif(\'Settings saved\')">Save changes</button>')}
    <div class="grid-2">
      <div class="card">
        <h3>AI engine</h3>
        <div class="settings-row"><div><strong>Model version</strong><p class="settings-desc">Production inference model</p></div><span class="badge badge-blue">v3.2</span></div>
        <div class="settings-row"><div><strong>Auto-scaling</strong><p class="settings-desc">Scale GPU workers on demand</p></div><label class="toggle"><input type="checkbox" checked/><span></span></label></div>
        <div class="settings-row"><div><strong>Confidence threshold</strong><p class="settings-desc">Minimum score to flag findings</p></div><span style="font-weight:500">85%</span></div>
      </div>
      <div class="card">
        <h3>Security</h3>
        <div class="settings-row"><div><strong>Two-factor auth</strong><p class="settings-desc">Required for admin accounts</p></div><label class="toggle"><input type="checkbox" checked/><span></span></label></div>
        <div class="settings-row"><div><strong>Session timeout</strong><p class="settings-desc">Auto logout inactive admins</p></div><span style="font-weight:500">30 min</span></div>
        <div class="settings-row"><div><strong>Data retention</strong><p class="settings-desc">Radiograph storage period</p></div><span style="font-weight:500">7 years</span></div>
      </div>
      <div class="card">
        <h3>Notifications</h3>
        <div class="settings-row"><div><strong>Email alerts</strong><p class="settings-desc">System errors and downtime</p></div><label class="toggle"><input type="checkbox" checked/><span></span></label></div>
        <div class="settings-row"><div><strong>Weekly digest</strong><p class="settings-desc">Platform summary to admins</p></div><label class="toggle"><input type="checkbox" checked/><span></span></label></div>
      </div>
      <div class="card">
        <h3>Maintenance</h3>
        <p style="font-size:13px;color:var(--color-text-secondary);margin-bottom:1rem">Last backup: Today, 03:00 AM Â· Next scheduled maintenance: May 25, 2025</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-sm" onclick="showNotif('Backup initiated')">Run backup</button>
          <button class="btn-sm" onclick="showNotif('Cache cleared')">Clear cache</button>
          <button class="btn-sm" style="color:#a32d2d;border-color:#e24b4a" onclick="showNotif('Maintenance mode enabled')">Maintenance mode</button>
        </div>
      </div>
    </div>`;
}
