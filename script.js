const USER_STORE_KEY = 'deepsense_users';

let currentRole = 'Patient';
let currentPage = 'dashboard';
let currentUserName = '';
let micOn = true,
    camOn = true;

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
    const fullName = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!fullName) {
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
    users[idx].fullName = fullName;
    saveUserRecords(users);
    const sessionRole = users[idx].role === 'Dentist' ? 'Dentist' : 'Patient';
    showNotif(`Signed in as ${sessionRole}. Loading dashboard...`);

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
    document.getElementById('view-auth').classList.remove('hidden');
    switchAuthTab('login');
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
        { id: 'dashboard', icon: '⬛', label: 'Dashboard' },
        { id: 'analysis', icon: '🔬', label: 'AI Analysis' },
        { id: 'patients', icon: '👥', label: 'Patients' },
        { id: 'appointments', icon: '📅', label: 'Appointments' },
        { id: 'teleconsult', icon: '🎥', label: 'Telehealth' },
        { id: 'reports', icon: '📋', label: 'Reports' },
    ],
    Patient: [
        { id: 'dashboard', icon: '⬛', label: 'Home' },
        { id: 'myreports', icon: '📋', label: 'My Reports' },
        { id: 'appointments', icon: '📅', label: 'Appointments' },
        { id: 'teleconsult', icon: '🎥', label: 'Video Call' },
    ]
};

function setupDashboard() {
    const nav = document.getElementById('sidebar-nav');
    const items = navConfigs[currentRole] || navConfigs.Dentist;
    nav.innerHTML = items.map(i => `
    <div class="nav-item ${i.id === 'dashboard' ? 'active' : ''}" onclick="navigate('${i.id}')" id="nav-${i.id}">
      <span style="font-size:14px">${i.icon}</span>
      <span>${i.label}</span>
    </div>`).join('');
    const initials = getInitialsFromName(currentUserName);
    document.getElementById('sidebar-avatar').textContent = initials;
    document.getElementById('sidebar-name').textContent = currentUserName;
    document.getElementById('sidebar-role').textContent = currentRole;
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
    };
    (renders[page] || renderDashboard)();
}

function renderDashboard() {
    const c = document.getElementById('main-content');
    if (currentRole === 'Dentist') {
        c.innerHTML = `
      <div class="topbar"><h1>Dashboard</h1><div class="topbar-actions"><span class="badge badge-blue">AI Active</span><button class="btn-sm btn-blue-sm" onclick="navigate('analysis')">New Analysis</button></div></div>
      <div class="grid-4">
        <div class="metric"><div class="label">Patients</div><div class="value">124</div><div class="sub">+3 this week</div></div>
        <div class="metric"><div class="label">Analyses today</div><div class="value">18</div><div class="sub">AI-powered</div></div>
        <div class="metric"><div class="label">Appointments</div><div class="value">7</div><div class="sub">Today</div></div>
        <div class="metric"><div class="label">Avg confidence</div><div class="value">94%</div><div class="sub">AI accuracy</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>Today's appointments</h3>
          <table class="tbl">
            <thead><tr><th>Time</th><th>Patient</th><th>Type</th><th></th></tr></thead>
            <tbody>
              <tr><td>09:00</td><td>Fatima Noor</td><td><span class="badge badge-blue">Checkup</span></td><td><button class="btn-sm" onclick="navigate('teleconsult')">Join</button></td></tr>
              <tr><td>10:30</td><td>Ibrahim Qureshi</td><td><span class="badge badge-amber">X-ray</span></td><td><button class="btn-sm" onclick="navigate('analysis')">Analyze</button></td></tr>
              <tr><td>14:00</td><td>Amina Siddiqui</td><td><span class="badge badge-green">Follow-up</span></td><td><button class="btn-sm" onclick="navigate('teleconsult')">Join</button></td></tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>Recent AI findings</h3>
          <div class="ai-finding"><div class="ai-finding-dot" style="background:#e24b4a"></div><div><div style="font-size:13px;font-weight:500">Caries detected — Tooth #14</div><div style="font-size:11px;color:var(--color-text-secondary)">Patient: Ibrahim Qureshi · 92% confidence</div></div></div>
          <div class="ai-finding"><div class="ai-finding-dot" style="background:#ef9f27"></div><div><div style="font-size:13px;font-weight:500">Early bone loss — lower molar</div><div style="font-size:11px;color:var(--color-text-secondary)">Patient: Fatima Noor · 87% confidence</div></div></div>
          <div class="ai-finding"><div class="ai-finding-dot" style="background:#639922"></div><div><div style="font-size:13px;font-weight:500">No abnormalities found</div><div style="font-size:11px;color:var(--color-text-secondary)">Patient: Amina Siddiqui · 96% confidence</div></div></div>
        </div>
      </div>`;
    } else {
        c.innerHTML = `
      <div class="topbar"><h1>My health</h1><div class="topbar-actions"><button class="btn-sm btn-blue-sm" onclick="navigate('appointments')">Book appointment</button></div></div>
      <div class="grid-3">
        <div class="metric"><div class="label">Last visit</div><div class="value" style="font-size:18px">Apr 12</div></div>
        <div class="metric"><div class="label">Next appointment</div><div class="value" style="font-size:18px">May 5</div></div>
        <div class="metric"><div class="label">Reports</div><div class="value">4</div></div>
      </div>
      <div class="grid-2">
        <div class="card"><h3>Latest report</h3>
          <div class="ai-finding"><div class="ai-finding-dot" style="background:#ef9f27"></div><div><div style="font-size:13px;font-weight:500">Mild caries — tooth #14</div><div style="font-size:11px;color:var(--color-text-secondary)">Reviewed by Dr. Yusuf Karim · Apr 12</div></div></div>
          <button class="btn-sm" style="margin-top:.75rem;width:100%" onclick="navigate('myreports')">View all reports</button>
        </div>
        <div class="card"><h3>Upcoming</h3>
          <div class="timeline-item"><div class="timeline-dot"></div><div><div style="font-size:13px;font-weight:500">Video consultation</div><div style="font-size:11px;color:var(--color-text-secondary)">May 5 · 10:00 AM · Dr. Yusuf Karim</div></div></div>
          <div class="timeline-item"><div class="timeline-dot" style="background:var(--amber)"></div><div><div style="font-size:13px;font-weight:500">Follow-up x-ray</div><div style="font-size:11px;color:var(--color-text-secondary)">May 15 · In clinic</div></div></div>
          <button class="btn-sm" style="margin-top:.75rem;width:100%" onclick="navigate('teleconsult')">Join video call</button>
        </div>
      </div>`;
    }
}

function renderAnalysis() {
    document.getElementById('main-content').innerHTML = `
    <div class="topbar"><h1>AI Analysis — DeepSense</h1><div class="topbar-actions"><span class="badge badge-blue">AI Engine v3.2</span></div></div>
    <div class="grid-2">
      <div>
        <div class="card" style="margin-bottom:1rem">
          <h3>Upload radiograph</h3>
          <div class="upload-zone" onclick="simulateUpload()" id="upload-zone">
            <span class="icon">🦷</span>
            <p><strong>Click to upload</strong> or drag & drop</p>
            <p style="font-size:11px;margin-top:4px">DICOM, PNG, JPEG · Max 20MB</p>
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
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;font-weight:500">Caries — Tooth #14</span><span class="badge badge-red">92%</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:92%;background:#e24b4a"></div></div>
          </div>
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:13px;font-weight:500">Bone loss — Lower left</span><span class="badge badge-amber">78%</span></div>
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
            showNotif('Analysis complete — 2 findings detected');
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
        <label style="display:flex;align-items:center;gap:8px"><input type="checkbox"/> Billing codes</label>
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
      <h3>Patient timeline — Fatima Noor</h3>
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
          <button class="cal-nav">← Apr</button>
          <span style="font-size:14px;font-weight:500">May 2025</span>
          <button class="cal-nav">Jun →</button>
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
          <h4 style="font-size:12px;color:var(--color-text-secondary);margin-bottom:.5rem">Available slots — May ${sel}</h4>
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
        if (h) h.textContent = `Available slots — May ${d}`;
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
    <div class="topbar"><h1>Telehealth consultation</h1><div class="topbar-actions"><span class="badge badge-green">● Live</span></div></div>
    <div class="grid-2">
      <div>
        <div class="card" style="padding:0;overflow:hidden;margin-bottom:1rem">
          <div style="background:#0d1117;border-radius:var(--border-radius-lg) var(--border-radius-lg) 0 0;position:relative">
            <div style="width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e,#0d1b2a)">
              <div style="text-align:center">
                <div class="avatar" style="width:64px;height:64px;font-size:22px;margin:0 auto 8px">YK</div>
                <div style="color:rgba(255,255,255,.8);font-size:14px;font-weight:500">Dr. Yusuf Karim</div>
                <div style="color:rgba(255,255,255,.4);font-size:12px">Dentist · Active</div>
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
            <button class="vc-btn" id="mic-btn" onclick="toggleMic()" title="Mute">🎤</button>
            <button class="vc-btn" id="cam-btn" onclick="toggleCam()" title="Camera">📷</button>
            <button class="vc-btn end" onclick="showModal(endCallModal())">📞</button>
            <button class="vc-btn" onclick="showNotif('Screen sharing started')" title="Share screen">🖥️</button>
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
          <div class="chat-msg them"><div class="bubble">I can see from the AI analysis — we'll look at tooth #14</div></div>
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
    if (btn) { btn.textContent = camOn ? '📷' : '🚫';
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
        ['Apr 12, 2025','Mild caries — tooth #14','Reviewed by Dr. Yusuf Karim','badge-amber'],
        ['Mar 1, 2025','Routine checkup — all clear','No action required','badge-green'],
        ['Jan 15, 2025','X-ray: early calculus buildup','Treatment recommended','badge-amber'],
        ['Dec 2024','Initial consultation','Records created','badge-blue']
      ].map(([d,t,s,b])=>`
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:500">${t}</div><div style="font-size:11px;color:var(--color-text-secondary)">${d} · ${s}</div></div>
        <button class="btn-sm" style="flex-shrink:0" onclick="showNotif('Report downloaded')">View PDF</button>
      </div>`).join('')}
    </div>`;
}
