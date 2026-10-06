"""
Unit & integration tests for Auth Router, SQLite Database, and OTP Verification.
"""
import pytest
from fastapi.testclient import TestClient
from main import app
import database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_clean_db():
    database.init_db()
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE email LIKE '%@test.com'")
    cursor.execute("DELETE FROM otp_codes WHERE email LIKE '%@test.com'")
    conn.commit()
    conn.close()
    yield

def test_registration_and_otp_verification():
    test_email = "tester@test.com"
    test_user = "testuser"
    test_pass = "secret123"

    # Step 1: Register
    res = client.post("/auth/register", json={
        "username": test_user,
        "email": test_email,
        "password": test_pass
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert "verification code" in data["message"]

    # Retrieve OTP directly from DB for verification test
    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT otp FROM otp_codes WHERE email = ? AND used = 0", (test_email,))
    row = cursor.fetchone()
    conn.close()
    assert row is not None
    otp_code = row["otp"]

    # Step 2: Verify OTP
    res_verify = client.post("/auth/verify-otp", json={
        "email": test_email,
        "otp": otp_code
    })
    assert res_verify.status_code == 200, res_verify.text
    token_data = res_verify.json()
    assert "access_token" in token_data
    assert token_data["username"] == test_user

    # Step 3: Login with verified account
    res_login = client.post("/auth/login", json={
        "email": test_email,
        "password": test_pass
    })
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Step 4: Access /auth/me with Bearer token
    res_me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == test_email
    assert res_me.json()["username"] == test_user

def test_change_password_and_forgot_password():
    test_email = "reset@test.com"
    test_user = "resetuser"
    test_pass = "initial123"
    new_pass = "newpassword456"

    # Register & direct verify
    database.create_user(test_user, test_email, database.get_user_by_email(test_email) or "")
    # Use proper hash
    from auth_router import hash_password
    database.update_password(test_email, hash_password(test_pass))
    database.verify_user(test_email)

    # Login
    res_login = client.post("/auth/login", json={"email": test_email, "password": test_pass})
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Change password while logged in
    res_change = client.post(
        "/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"old_password": test_pass, "new_password": new_pass}
    )
    assert res_change.status_code == 200

    # Forgot password flow
    res_forgot = client.post("/auth/forgot-password", json={"email": test_email})
    assert res_forgot.status_code == 200

    conn = database.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT otp FROM otp_codes WHERE email = ? AND purpose = 'password_reset' AND used = 0", (test_email,))
    row = cursor.fetchone()
    conn.close()
    assert row is not None
    reset_otp = row["otp"]

    # Reset password with OTP
    final_pass = "finalpassword789"
    res_reset = client.post("/auth/reset-password", json={
        "email": test_email,
        "otp": reset_otp,
        "new_password": final_pass
    })
    assert res_reset.status_code == 200

    # Login with final pass
    res_final_login = client.post("/auth/login", json={"email": test_email, "password": final_pass})
    assert res_final_login.status_code == 200
