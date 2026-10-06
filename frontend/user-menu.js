/**
 * frontend/user-menu.js — User Profile Avatar & Dropdown Menu Component
 * Injects a profile button with user info, Change Password modal, and Logout into the navigation bar.
 */

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    initUserMenu();
  });

  async function initUserMenu() {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token) return;

    let user = null;
    try {
      const uStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      user = uStr ? JSON.parse(uStr) : null;
    } catch {
      user = null;
    }

    if (!user) {
      // Fetch fresh profile
      if (window.Auth && typeof Auth.getMe === "function") {
        user = await Auth.getMe();
      }
    }

    const username = user?.username || "Student";
    const email = user?.email || "user@example.com";
    const initial = username.charAt(0).toUpperCase();

    // Inject User Menu CSS
    injectUserMenuStyles();

    // Find nav container
    const navWrap = document.querySelector(".nav-wrap") || document.querySelector("header");
    if (!navWrap) return;

    // Create Profile Element
    const menuContainer = document.createElement("div");
    menuContainer.className = "user-profile-widget";
    menuContainer.innerHTML = `
      <button type="button" class="user-avatar-btn" id="userAvatarBtn" title="Account Settings">
        <span class="user-avatar-initial">${initial}</span>
        <span class="user-avatar-name">${username}</span>
        <span class="user-avatar-arrow">▼</span>
      </button>

      <div class="user-dropdown-menu" id="userDropdownMenu">
        <div class="user-dropdown-header">
          <div class="user-dropdown-avatar">${initial}</div>
          <div class="user-dropdown-info">
            <strong class="user-dropdown-name">${username}</strong>
            <span class="user-dropdown-email">${email}</span>
          </div>
        </div>

        <div class="user-dropdown-divider"></div>

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
      if (window.Auth && typeof Auth.logout === "function") {
        Auth.logout();
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user");
        window.location.href = "landing.html";
      }
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
        margin-left: 18px;
        display: inline-block;
      }
      .user-avatar-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(44, 110, 232, 0.15);
        border: 1px solid rgba(44, 110, 232, 0.35);
        padding: 6px 14px 6px 8px;
        border-radius: 30px;
        color: #ffffff;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s ease;
      }
      .user-avatar-btn:hover {
        background: rgba(44, 110, 232, 0.25);
        border-color: #2c6ee8;
      }
      .user-avatar-initial {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e9bd4f;
        color: #14233b;
        font-weight: 800;
        font-size: 13px;
        display: grid;
        place-items: center;
        font-family: 'DM Mono', monospace;
      }
      .user-avatar-name {
        font-size: 13px;
        font-weight: 700;
        max-width: 110px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-avatar-arrow {
        font-size: 9px;
        color: #94a3b8;
        transition: transform 0.2s;
      }
      .user-dropdown-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 260px;
        background: #16243b;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        box-shadow: 0 14px 35px rgba(0, 0, 0, 0.45);
        padding: 8px 0;
        display: none;
        z-index: 1000;
        animation: menuFadeIn 0.2s ease;
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
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #e9bd4f;
        color: #14233b;
        font-weight: 800;
        font-size: 16px;
        display: grid;
        place-items: center;
        font-family: 'DM Mono', monospace;
      }
      .user-dropdown-info {
        overflow: hidden;
      }
      .user-dropdown-name {
        display: block;
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-dropdown-email {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-dropdown-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
        margin: 6px 0;
      }
      .user-dropdown-item {
        width: 100%;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: none;
        color: #cbd5e1;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        font-family: inherit;
        transition: background 0.15s, color 0.15s;
      }
      .user-dropdown-item:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
      }
      .user-dropdown-item.logout {
        color: #f87171;
      }
      .user-dropdown-item.logout:hover {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }
      .menu-icon {
        font-size: 15px;
      }

      /* Modal Styling */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(10, 18, 30, 0.75);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        z-index: 2000;
        padding: 20px;
      }
      .modal-card {
        background: #16243b;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 14px;
        width: 100%;
        max-width: 420px;
        padding: 28px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        position: relative;
        color: #ffffff;
      }
      .modal-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .modal-head h3 {
        font-size: 18px;
        font-weight: 800;
        margin: 0;
      }
      .modal-close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
      }
      .modal-close-btn:hover { color: #ffffff; }
      .modal-form-group {
        margin-bottom: 16px;
      }
      .modal-label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        font-family: 'DM Mono', monospace;
        color: #cbd5e1;
        margin-bottom: 6px;
      }
      .modal-input {
        width: 100%;
        padding: 10px 14px;
        background: #0f1929;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        color: #ffffff;
        font-size: 13px;
        box-sizing: border-box;
      }
      .modal-input:focus {
        outline: none;
        border-color: #2c6ee8;
      }
      .modal-btn-submit {
        width: 100%;
        padding: 11px;
        background: #2c6ee8;
        color: white;
        font-weight: 700;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 8px;
        transition: background 0.2s;
      }
      .modal-btn-submit:hover { background: #4c8aff; }
      .modal-msg {
        font-size: 12px;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 14px;
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  function openChangePasswordModal() {
    const existing = document.getElementById("changePassModalBackdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.id = "changePassModalBackdrop";
    backdrop.innerHTML = `
      <div class="modal-card">
        <div class="modal-head">
          <h3>🔑 Change Account Password</h3>
          <button type="button" class="modal-close-btn" id="modalCloseBtn">&times;</button>
        </div>

        <div id="modalAlert" class="modal-msg"></div>

        <form id="changePassForm">
          <div class="modal-form-group">
            <label class="modal-label">CURRENT PASSWORD</label>
            <input type="password" id="modalOldPass" class="modal-input" placeholder="••••••••" required>
          </div>

          <div class="modal-form-group">
            <label class="modal-label">NEW PASSWORD</label>
            <input type="password" id="modalNewPass" class="modal-input" placeholder="Minimum 6 characters" minlength="6" required>
          </div>

          <div class="modal-form-group">
            <label class="modal-label">CONFIRM NEW PASSWORD</label>
            <input type="password" id="modalConfirmPass" class="modal-input" placeholder="Repeat new password" minlength="6" required>
          </div>

          <button type="submit" class="modal-btn-submit" id="modalSubmitBtn">Update Password</button>
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

})();
