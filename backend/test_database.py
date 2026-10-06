"""
backend/test_database.py — Verification script for Table 1: users (Student & Faculty Profiles)
Tests database initialization, schema migrations, roll number queries, and auth flow.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

import database
import auth_router
from auth_schemas import RegisterRequest, LoginRequest, UpdateProfileRequest

def run_tests():
    print("=" * 60)
    print("RUNNING DATABASE & STUDENT PROFILES VERIFICATION SUITE")
    print("=" * 60)

    # Step 1: Initialize Database & Verify Migration
    print("\n[TEST 1] Initializing database & running migrations...")
    database.init_db()
    conn = database.get_connection()
    cursor = conn.cursor()
    columns = {row["name"]: row["type"] for row in cursor.execute("PRAGMA table_info(users)").fetchall()}
    conn.close()

    required_columns = ["id", "roll_number", "username", "email", "password_hash", "branch", "semester", "role", "is_verified", "created_at"]
    for col in required_columns:
        assert col in columns, f"Missing expected column '{col}' in users table! Columns: {columns}"
    print(f"PASS: All required Table 1 columns present: {list(columns.keys())}")

    # Step 2: Create Student User with Academic Profile
    print("\n[TEST 2] Creating student account with Roll Number...")
    test_roll = "23CS012"
    test_email = "student23cs012@campus.edu"
    test_user = "Aditya K"
    test_pass = "CampusPass#2026"

    # Clean up test accounts if existing
    conn = database.get_connection()
    conn.cursor().execute("DELETE FROM users WHERE email = ? OR roll_number = ?", (test_email, test_roll))
    conn.commit()
    conn.close()

    reg_req = RegisterRequest(
        username=test_user,
        email=test_email,
        password=test_pass,
        roll_number=test_roll,
        branch="CSE",
        semester=3,
        role="student"
    )
    reg_res = auth_router.register(reg_req)
    assert "successful" in reg_res.message.lower()
    print(f"PASS: Registration response: {reg_res.message}")

    # Step 3: Query by Roll Number
    print("\n[TEST 3] Fetching user by roll number...")
    user_by_roll = database.get_user_by_roll_number(test_roll)
    assert user_by_roll is not None, "Failed to retrieve user by roll number!"
    assert user_by_roll["roll_number"] == test_roll
    assert user_by_roll["branch"] == "CSE"
    assert user_by_roll["semester"] == 3
    assert user_by_roll["role"] == "student"
    print(f"PASS: Retrieved user by roll number '{test_roll}': id={user_by_roll['id']}, username={user_by_roll['username']}")

    # Step 4: Login with Roll Number (Identifier flexibility)
    print("\n[TEST 4] Signing in using Roll Number instead of email...")
    login_req_roll = LoginRequest(
        email=test_roll,
        password=test_pass
    )
    token_roll = auth_router.login(login_req_roll)
    assert token_roll.roll_number == test_roll
    assert token_roll.branch == "CSE"
    assert token_roll.semester == 3
    assert token_roll.role == "student"
    print(f"PASS: Login via roll number succeeded! Token issued for {token_roll.username} ({token_roll.roll_number})")

    # Step 5: Verify /auth/me returns Academic Profile
    print("\n[TEST 5] Verifying /auth/me profile metadata...")
    current_user = auth_router.get_current_user(f"Bearer {token_roll.access_token}")
    me_profile = auth_router.get_me(current_user)
    assert me_profile.roll_number == test_roll
    assert me_profile.branch == "CSE"
    assert me_profile.semester == 3
    assert me_profile.role == "student"
    print(f"PASS: Student profile verified: {me_profile.model_dump()}")

    # Step 6: Update Profile
    print("\n[TEST 6] Testing profile update (semester promotion & branch transfer)...")
    update_req = UpdateProfileRequest(
        semester=4,
        branch="ECE"
    )
    updated_profile = auth_router.update_profile(update_req, current_user)
    assert updated_profile.semester == 4
    assert updated_profile.branch == "ECE"
    print(f"PASS: Profile successfully updated: semester={updated_profile.semester}, branch={updated_profile.branch}")

    # Step 7: Duplicate Roll Number Prevention
    print("\n[TEST 7] Testing duplicate roll number collision rejection...")
    dup_req = RegisterRequest(
        username="Duplicate Student",
        email="another_student@campus.edu",
        password="PassWord#123",
        roll_number=test_roll
    )
    try:
        auth_router.register(dup_req)
        raise AssertionError("Duplicate roll number registration was incorrectly allowed!")
    except Exception as e:
        assert "already registered" in str(getattr(e, "detail", "")), f"Unexpected exception: {e}"
        print(f"PASS: Duplicate roll number rejected as expected: {e.detail}")

    # Step 8: Academic Roster Query (DBeaver / Faculty inspection)
    print("\n[TEST 8] Testing academic roster listing...")
    roster = database.list_users(role="student")
    assert len(roster) > 0
    print(f"PASS: Roster query returned {len(roster)} enrolled students.")

    # Cleanup test user
    conn = database.get_connection()
    conn.cursor().execute("DELETE FROM users WHERE email = ? OR roll_number = ?", (test_email, test_roll))
    conn.commit()
    conn.close()

    print("\n" + "=" * 60)
    print("ALL 8 DATABASE & STUDENT PROFILE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
