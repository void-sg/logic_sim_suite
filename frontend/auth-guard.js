/**
 * frontend/auth-guard.js — Route protection for authenticated simulation suite pages.
 * Include this script at the top or bottom of pages that require login.
 */

(function () {
  function checkAuth() {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token) {
      // Not logged in -> redirect to landing page
      window.location.href = "landing.html";
    }
  }

  checkAuth();
})();
