/**
 * frontend/auth.js — Client-side Authentication & Session Management Module
 */

const Auth = {
  // Determine API base URL
  getBaseUrl() {
    if (typeof API_BASE !== "undefined" && API_BASE && !API_BASE.includes("YOUR-APP-NAME")) {
      return API_BASE.replace(/\/+$/, "");
    }
    if (window.location.port === "8000" || window.location.hostname.endsWith("onrender.com")) {
      return window.location.origin;
    }
    // Default local backend port
    return "http://127.0.0.1:8000";
  },

  getToken() {
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  },

  getUser() {
    try {
      const u = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setSession(token, username, email, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", token);
    storage.setItem("auth_user", JSON.stringify({ username, email }));
  },

  clearSession() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  logout() {
    this.clearSession();
    window.location.href = "landing.html";
  },

  async handleFetch(url, options) {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || `Server returned error (${res.status})`);
      }
      return data;
    } catch (err) {
      if (err.name === "TypeError" && err.message.toLowerCase().includes("fetch")) {
        throw new Error(`Cannot reach backend server (${this.getBaseUrl()}). Please make sure your FastAPI backend is running (e.g. 'uvicorn main:app --reload').`);
      }
      throw err;
    }
  },

  async register(username, email, password) {
    return await this.handleFetch(`${this.getBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
  },

  async verifyOtp(email, otp) {
    const data = await this.handleFetch(`${this.getBaseUrl()}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    this.setSession(data.access_token, data.username, data.email);
    return data;
  },

  async resendOtp(email, purpose = "register") {
    return await this.handleFetch(`${this.getBaseUrl()}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose })
    });
  },

  async login(email, password, remember = true) {
    const data = await this.handleFetch(`${this.getBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    this.setSession(data.access_token, data.username, data.email, remember);
    return data;
  },

  async guestLogin() {
    try {
      const data = await this.handleFetch(`${this.getBaseUrl()}/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      this.setSession(data.access_token, data.username, data.email, true);
      return data;
    } catch {
      // Local offline fallback if backend isn't reachable
      const offlineToken = "offline_guest_token_" + Date.now();
      this.setSession(offlineToken, "Guest Student", "student.guest@logicsim.edu", true);
      return { access_token: offlineToken, username: "Guest Student", email: "student.guest@logicsim.edu" };
    }
  },

  async forgotPassword(email) {
    return await this.handleFetch(`${this.getBaseUrl()}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(email, otp, new_password) {
    return await this.handleFetch(`${this.getBaseUrl()}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password })
    });
  },

  async changePassword(old_password, new_password) {
    const token = this.getToken();
    if (!token) throw new Error("You must be logged in to change your password");

    return await this.handleFetch(`${this.getBaseUrl()}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ old_password, new_password })
    });
  },

  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${this.getBaseUrl()}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          this.clearSession();
        }
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  }
};

window.Auth = Auth;
