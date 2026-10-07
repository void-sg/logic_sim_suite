/**
 * frontend/user-menu.js — User Profile Avatar, Academic Profile Editor & Dropdown Menu Component
 * Injects profile widget with Roll Number, Branch, Semester, Profile Editor, Change Password, and Logout.
 */

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    initUserMenu();
  });

  async function initUserMenu() {
    // Find nav container
    const navWrap = document.querySelector(".wb-header") || document.querySelector(".nav-wrap") || document.querySelector("header");
    if (!navWrap) return;

    // Inject User Menu CSS
    injectUserMenuStyles();

    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token) {
      // Show Sign In link
      const existingSignIn = document.getElementById("guestSignInContainer");
      if (existingSignIn) existingSignIn.remove();

      const guestContainer = document.createElement("div");
      guestContainer.id = "guestSignInContainer";
      guestContainer.className = "user-profile-widget";
      guestContainer.innerHTML = `
        <a href="login.html" class="user-signin-nav-btn" title="Sign in with your roll number or email">
          <span>🔑 Sign In / Register</span>
        </a>
      `;
      navWrap.appendChild(guestContainer);
      return;
    }

    let user = null;
    try {
      const uStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      user = uStr ? JSON.parse(uStr) : null;
    } catch {
      user = null;
    }

    if (!user || !user.branch || !user.semester) {
      if (window.Auth && typeof Auth.getMe === "function") {
        try {
          const fresh = await Auth.getMe();
          if (fresh) {
            user = Object.assign(user || {}, fresh);
            localStorage.setItem("auth_user", JSON.stringify(user));
          }
        } catch (e) {
          console.warn("Could not fetch fresh profile:", e);
        }
      }
    }

    renderUserWidget(navWrap, user);
  }

  function renderUserWidget(navWrap, user) {
    const existing = document.getElementById("userProfileWidget");
    if (existing) existing.remove();

    const username = user?.username || "Student";
    const email = user?.email || "student@example.com";
    const roll = user?.roll_number || "NO ROLL";
    const branch = user?.branch || "CSE";
    const sem = user?.semester ? `Sem ${user?.semester}` : "Sem 3";
    const initial = username.charAt(0).toUpperCase();

    // Create Profile Element
    const menuContainer = document.createElement("div");
    menuContainer.id = "userProfileWidget";
    menuContainer.className = "user-profile-widget";
    menuContainer.innerHTML = `
      <button type="button" class="user-avatar-btn" id="userAvatarBtn" title="Academic Account & Settings">
        <span class="user-avatar-initial">${initial}</span>
        <div class="user-avatar-text-block">
          <span class="user-avatar-name">${escapeHTML(username)}</span>
          <span class="user-avatar-meta-badge">${escapeHTML(roll)} &bull; ${escapeHTML(branch)} &bull; ${escapeHTML(sem)}</span>
        </div>
        <span class="user-avatar-arrow">▼</span>
      </button>

      <div class="user-dropdown-menu" id="userDropdownMenu">
        <div class="user-dropdown-header">
          <div class="user-dropdown-avatar">${initial}</div>
          <div class="user-dropdown-info">
            <strong class="user-dropdown-name" id="menuDropName">${escapeHTML(username)}</strong>
            <span class="user-dropdown-badge" id="menuDropRoll">${escapeHTML(roll)} &bull; ${escapeHTML(branch)} &bull; ${escapeHTML(sem)}</span>
            <span class="user-dropdown-email">${escapeHTML(email)}</span>
          </div>
        </div>

        <div class="user-dropdown-divider"></div>

        <button type="button" class="user-dropdown-item" id="btnOpenEditProfileModal">
          <span class="menu-icon">🎓</span>
          <span>Edit Academic Profile</span>
        </button>

        <button type="button" class="user-dropdown-item" id="btnOpenChangePassModal">
          <span class="menu-icon">🔑</span>
          <span>Change Password</span>
        </button>

        <div class="user-dropdown-divider"></div>

        <button type="button" class="user-dropdown-item logout" id="btnLogoutAction">
          <span class="menu-icon">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    `;

    navWrap.appendChild(menuContainer);

    // Toggle Dropdown
    const btn = document.getElementById("userAvatarBtn");
    const menu = document.getElementById("userDropdownMenu");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });

    document.addEventListener("click", () => {
      menu.classList.remove("open");
    });

    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Logout Action
    document.getElementById("btnLogoutAction").addEventListener("click", () => {
      if (confirm("Are you sure you want to log out?")) {
        if (window.Auth && typeof Auth.logout === "function") {
          Auth.logout();
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_user");
          window.location.href = "login.html";
        }
      }
    });

    // Edit Profile Action
    document.getElementById("btnOpenEditProfileModal").addEventListener("click", () => {
      menu.classList.remove("open");
      openEditProfileModal();
    });

    // Change Password Action
    document.getElementById("btnOpenChangePassModal").addEventListener("click", () => {
      menu.classList.remove("open");
      openChangePasswordModal();
    });
  }

  function injectUserMenuStyles() {
    if (document.getElementById("userMenuStyles")) return;
    const style = document.createElement("style");
    style.id = "userMenuStyles";
    style.textContent = `
      .user-profile-widget {
        position: relative;
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        z-index: 50;
      }
      .user-signin-nav-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #2563eb;
        color: #ffffff !important;
        border-radius: 6px;
        padding: 7px 16px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        transition: all 0.2s ease;
        font-family: 'DM Mono', monospace;
      }
      .user-signin-nav-btn:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      .user-avatar-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #14233b;
        border: 1px solid #334155;
        padding: 5px 12px 5px 6px;
        border-radius: 30px;
        color: #ffffff;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s ease;
      }
      .user-avatar-btn:hover {
        background: #1e293b;
        border-color: #60a5fa;
        transform: translateY(-1px);
      }
      .user-avatar-initial {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #2563eb;
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        display: grid;
        place-items: center;
        font-family: 'DM Mono', monospace;
      }
      .user-avatar-text-block {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
      .user-avatar-name {
        font-size: 13px;
        font-weight: 700;
        color: #f8fafc;
        max-width: 130px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-avatar-meta-badge {
        font-size: 10px;
        font-family: 'DM Mono', monospace;
        color: #94a3b8;
        font-weight: 600;
      }
      .user-avatar-arrow {
        font-size: 9px;
        color: #94a3b8;
        transition: transform 0.2s;
        margin-left: 2px;
      }
      .user-dropdown-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 280px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 12px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
        padding: 10px 0;
        display: none;
        z-index: 10000;
        animation: menuFadeIn 0.18s ease;
      }
      .user-dropdown-menu.open {
        display: block;
      }
      @keyframes menuFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .user-dropdown-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
      }
      .user-dropdown-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #2563eb;
        color: #ffffff;
        font-weight: 800;
        font-size: 16px;
        display: grid;
        place-items: center;
        font-family: 'DM Mono', monospace;
      }
      .user-dropdown-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }
      .user-dropdown-name {
        font-size: 14px;
        font-weight: 800;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-dropdown-badge {
        font-size: 11px;
        font-family: 'DM Mono', monospace;
        color: #38bdf8;
        font-weight: 700;
      }
      .user-dropdown-email {
        font-size: 11px;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-dropdown-divider {
        height: 1px;
        background: #1e293b;
        margin: 6px 0;
      }
      .user-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 16px;
        background: transparent;
        border: none;
        color: #cbd5e1;
        font-size: 13px;
        font-family: inherit;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s;
      }
      .user-dropdown-item:hover {
        background: #1e293b;
        color: #ffffff;
      }
      .user-dropdown-item.logout {
        color: #f87171;
      }
      .user-dropdown-item.logout:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .menu-icon {
        font-size: 15px;
      }

      /* Modal Styling */
      .modal-backdrop-generic {
        position: fixed;
        inset: 0;
        background: rgba(10, 18, 30, 0.75);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        z-index: 20000;
        padding: 20px;
      }
      .modal-card-generic {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 14px;
        width: 100%;
        max-width: 440px;
        padding: 26px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        color: #ffffff;
        font-family: 'DM Mono', monospace;
      }
      .modal-head-generic {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid #1e293b;
        padding-bottom: 12px;
      }
      .modal-head-generic h3 {
        font-size: 17px;
        font-weight: 800;
        margin: 0;
        color: #f8fafc;
      }
      .modal-close-btn-generic {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 22px;
        cursor: pointer;
      }
      .modal-close-btn-generic:hover { color: #ffffff; }
      .modal-form-group-generic {
        margin-bottom: 16px;
      }
      .modal-label-generic {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        margin-bottom: 6px;
        letter-spacing: 0.5px;
      }
      .modal-input-generic {
        width: 100%;
        padding: 10px 12px;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 6px;
        color: #ffffff;
        font-size: 13px;
        box-sizing: border-box;
        font-family: inherit;
      }
      .modal-input-generic:focus {
        outline: none;
        border-color: #3b82f6;
      }
      .modal-btn-submit-generic {
        width: 100%;
        padding: 11px;
        background: #2563eb;
        color: white;
        font-weight: 700;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 10px;
        font-family: inherit;
        transition: background 0.2s;
      }
      .modal-btn-submit-generic:hover { background: #1d4ed8; }
      .modal-msg-generic {
        font-size: 12px;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 14px;
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  function openEditProfileModal() {
    const existing = document.getElementById("editProfileModalBackdrop");
    if (existing) existing.remove();

    let user = null;
    try {
      const uStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      user = uStr ? JSON.parse(uStr) : null;
    } catch { user = null; }

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop-generic";
    backdrop.id = "editProfileModalBackdrop";
    backdrop.innerHTML = `
      <div class="modal-card-generic">
        <div class="modal-head-generic">
          <h3>🎓 Edit Academic Profile</h3>
          <button type="button" class="modal-close-btn-generic" id="profModalCloseBtn">&times;</button>
        </div>

        <div id="profModalAlert" class="modal-msg-generic"></div>

        <form id="editProfileForm">
          <div class="modal-form-group-generic">
            <label class="modal-label-generic">FULL NAME / DISPLAY NAME</label>
            <input type="text" id="profModalUsername" class="modal-input-generic" value="${escapeHTML(user?.username || '')}" disabled style="opacity: 0.65; cursor: not-allowed;">
          </div>

          <div class="modal-form-group-generic">
            <label class="modal-label-generic">COLLEGE ROLL NUMBER</label>
            <input type="text" id="profModalRollNumber" class="modal-input-generic" value="${escapeHTML(user?.roll_number || '')}" placeholder="e.g. 23CS012" style="text-transform: uppercase;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="modal-form-group-generic">
              <label class="modal-label-generic">BRANCH</label>
              <select id="profModalBranch" class="modal-input-generic">
                <option value="CSE" ${user?.branch === 'CSE' ? 'selected' : ''}>CSE</option>
                <option value="ECE" ${user?.branch === 'ECE' ? 'selected' : ''}>ECE</option>
                <option value="EEE" ${user?.branch === 'EEE' ? 'selected' : ''}>EEE</option>
                <option value="IT" ${user?.branch === 'IT' ? 'selected' : ''}>IT</option>
                <option value="MECH" ${user?.branch === 'MECH' ? 'selected' : ''}>MECH</option>
              </select>
            </div>

            <div class="modal-form-group-generic">
              <label class="modal-label-generic">CURRENT SEMESTER</label>
              <select id="profModalSemester" class="modal-input-generic">
                <option value="1" ${user?.semester == 1 ? 'selected' : ''}>Sem 1</option>
                <option value="2" ${user?.semester == 2 ? 'selected' : ''}>Sem 2</option>
                <option value="3" ${user?.semester == 3 ? 'selected' : ''}>Sem 3</option>
                <option value="4" ${user?.semester == 4 ? 'selected' : ''}>Sem 4</option>
                <option value="5" ${user?.semester == 5 ? 'selected' : ''}>Sem 5</option>
                <option value="6" ${user?.semester == 6 ? 'selected' : ''}>Sem 6</option>
                <option value="7" ${user?.semester == 7 ? 'selected' : ''}>Sem 7</option>
                <option value="8" ${user?.semester == 8 ? 'selected' : ''}>Sem 8</option>
              </select>
            </div>
          </div>

          <button type="submit" class="modal-btn-submit-generic" id="profModalSubmitBtn">Save Academic Profile</button>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closeBtn = document.getElementById("profModalCloseBtn");
    closeBtn.addEventListener("click", () => backdrop.remove());
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    const form = document.getElementById("editProfileForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const roll = document.getElementById("profModalRollNumber").value.trim().toUpperCase();
      const branch = document.getElementById("profModalBranch").value;
      const semester = parseInt(document.getElementById("profModalSemester").value, 10);
      const alertEl = document.getElementById("profModalAlert");
      const submitBtn = document.getElementById("profModalSubmitBtn");

      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      try {
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        const apiBase = window.Auth?.getBaseUrl ? Auth.getBaseUrl() : "http://127.0.0.1:8000";

        const res = await fetch(`${apiBase}/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            roll_number: roll || null,
            branch: branch,
            semester: semester
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Failed to update profile.");
        }

        // Update local storage session
        const currentU = (localStorage.getItem("auth_user") ? JSON.parse(localStorage.getItem("auth_user")) : {}) || {};
        currentU.roll_number = data.roll_number;
        currentU.branch = data.branch;
        currentU.semester = data.semester;
        currentU.username = data.username;
        localStorage.setItem("auth_user", JSON.stringify(currentU));

        alertEl.style.display = "block";
        alertEl.style.background = "rgba(46, 204, 113, 0.15)";
        alertEl.style.color = "#86efac";
        alertEl.textContent = "Profile updated successfully!";

        // Refresh navbar badge
        const navWrap = document.querySelector(".wb-header") || document.querySelector(".nav-wrap") || document.querySelector("header");
        if (navWrap) renderUserWidget(navWrap, currentU);

        setTimeout(() => backdrop.remove(), 800);
      } catch (err) {
        alertEl.style.display = "block";
        alertEl.style.background = "rgba(239, 68, 68, 0.15)";
        alertEl.style.color = "#fca5a5";
        alertEl.textContent = err.message || "Failed to save profile.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Academic Profile";
      }
    });
  }

  function openChangePasswordModal() {
    const existing = document.getElementById("changePassModalBackdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop-generic";
    backdrop.id = "changePassModalBackdrop";
    backdrop.innerHTML = `
      <div class="modal-card-generic">
        <div class="modal-head-generic">
          <h3>🔑 Change Account Password</h3>
          <button type="button" class="modal-close-btn-generic" id="modalCloseBtn">&times;</button>
        </div>

        <div id="modalAlert" class="modal-msg-generic"></div>

        <form id="changePassForm">
          <div class="modal-form-group-generic">
            <label class="modal-label-generic">CURRENT PASSWORD</label>
            <input type="password" id="modalOldPass" class="modal-input-generic" placeholder="••••••••" required>
          </div>

          <div class="modal-form-group-generic">
            <label class="modal-label-generic">NEW PASSWORD</label>
            <input type="password" id="modalNewPass" class="modal-input-generic" placeholder="Minimum 6 characters" minlength="6" required>
          </div>

          <div class="modal-form-group-generic">
            <label class="modal-label-generic">CONFIRM NEW PASSWORD</label>
            <input type="password" id="modalConfirmPass" class="modal-input-generic" placeholder="Repeat new password" minlength="6" required>
          </div>

          <button type="submit" class="modal-btn-submit-generic" id="modalSubmitBtn">Update Password</button>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closeBtn = document.getElementById("modalCloseBtn");
    closeBtn.addEventListener("click", () => backdrop.remove());
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    const form = document.getElementById("changePassForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const oldPass = document.getElementById("modalOldPass").value;
      const newPass = document.getElementById("modalNewPass").value;
      const confirmPass = document.getElementById("modalConfirmPass").value;
      const alertEl = document.getElementById("modalAlert");
      const submitBtn = document.getElementById("modalSubmitBtn");

      if (newPass !== confirmPass) {
        alertEl.style.display = "block";
        alertEl.style.background = "rgba(239, 68, 68, 0.15)";
        alertEl.style.color = "#fca5a5";
        alertEl.textContent = "New passwords do not match.";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";

      try {
        if (!window.Auth || typeof Auth.changePassword !== "function") {
          throw new Error("Authentication module not loaded.");
        }
        await Auth.changePassword(oldPass, newPass);
        alertEl.style.display = "block";
        alertEl.style.background = "rgba(46, 204, 113, 0.15)";
        alertEl.style.color = "#86efac";
        alertEl.textContent = "Password successfully updated!";
        setTimeout(() => backdrop.remove(), 1200);
      } catch (err) {
        alertEl.style.display = "block";
        alertEl.style.background = "rgba(239, 68, 68, 0.15)";
        alertEl.style.color = "#fca5a5";
        alertEl.textContent = err.message || "Failed to change password.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Password";
      }
    });
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

})();
