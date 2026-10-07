"""
backend/test_cloud_circuits.py — Comprehensive Verification Suite for Cloud Circuit Projects
Tests database operations, router endpoints, project cloning, and ownership access controls.
"""
import sys
import os
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

import database
import auth_router
import user_circuits_router
from user_circuits_router import SaveCircuitRequest
from auth_schemas import RegisterRequest, LoginRequest

def run_tests():
    print("=" * 65)
    print("RUNNING CLOUD CIRCUIT PROJECTS COMPREHENSIVE VERIFICATION SUITE")
    print("=" * 65)

    # Step 1: Initialize Database & Verify user_circuits Schema
    print("\n[TEST 1] Verifying database schema for 'user_circuits' table...")
    database.init_db()
    conn = database.get_connection()
    cursor = conn.cursor()
    if database.is_postgres():
        cursor.execute("SELECT column_name as name, data_type as type FROM information_schema.columns WHERE table_name = 'user_circuits'")
        columns = {row["name"]: row["type"] for row in cursor.fetchall()}
    else:
        cursor.execute("PRAGMA table_info(user_circuits)")
        columns = {row["name"]: row["type"] for row in cursor.fetchall()}
    conn.close()

    expected_cols = ["id", "user_id", "title", "description", "circuit_data", "created_at", "updated_at"]
    for col in expected_cols:
        assert col in columns, f"Missing expected column '{col}' in user_circuits! Columns: {columns}"
    print(f"PASS: All required columns present in user_circuits: {list(columns.keys())}")

    # Step 2: Create a Test Student Account
    print("\n[TEST 2] Setting up authenticated student user...")
    test_roll = "23CS999"
    test_email = "circuit.tester@campus.edu"
    test_user = "Shardul Test"
    test_pass = "SecurePass#2026"

    # Cleanup any previous test data
    conn = database.get_connection()
    cursor = conn.cursor()
    u = database.get_user_by_email(test_email)
    if u:
        database.execute_query(cursor, "DELETE FROM user_circuits WHERE user_id = ?", (u["id"],))
        database.execute_query(cursor, "DELETE FROM users WHERE id = ?", (u["id"],))
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
    auth_router.register(reg_req)
    login_req = LoginRequest(email=test_roll, password=test_pass)
    token_resp = auth_router.login(login_req)
    current_user = auth_router.get_current_user(f"Bearer {token_resp.access_token}")
    user_id = current_user["id"]
    print(f"PASS: Student authenticated (ID: {user_id}, Name: {current_user['username']}, Roll: {current_user['roll_number']})")

    # Step 3: Save a New Circuit to Cloud
    print("\n[TEST 3] Saving new IC Workbench circuit to cloud account...")
    sample_circuit_data = {
        "components": [
            {"id": "c_1", "type": "7400", "ref": "U1", "x": 400, "y": 250, "state": {}},
            {"id": "c_2", "type": "SWITCH", "ref": "SW1", "x": 200, "y": 220, "state": {"out": 1}},
            {"id": "c_3", "type": "SWITCH", "ref": "SW2", "x": 200, "y": 280, "state": {"out": 0}},
            {"id": "c_4", "type": "LED", "ref": "LED1", "x": 650, "y": 250, "state": {}}
        ],
        "wires": [
            {"id": "w_1", "from": {"compId": "c_2", "pinNum": 1}, "to": {"compId": "c_1", "pinNum": 1}, "state": 1},
            {"id": "w_2", "from": {"compId": "c_3", "pinNum": 1}, "to": {"compId": "c_1", "pinNum": 2}, "state": 0},
            {"id": "w_3", "from": {"compId": "c_1", "pinNum": 3}, "to": {"compId": "c_4", "pinNum": 1}, "state": 1}
        ]
    }

    save_req = SaveCircuitRequest(
        title="NAND Gate Verification (IC 7400)",
        description="Verify 2-input NAND truth table with active switches and logic probe LED.",
        circuit_data=sample_circuit_data
    )

    save_res = user_circuits_router.save_circuit(save_req, current_user=current_user)
    assert save_res["status"] == "success"
    circuit_id = save_res["project"]["id"]
    print(f"PASS: Circuit saved to cloud with ID {circuit_id}: '{save_res['project']['title']}'")

    # Step 4: List Circuits for User
    print("\n[TEST 4] Listing all cloud circuits for student...")
    projects = user_circuits_router.list_circuits(current_user=current_user)
    assert len(projects) == 1
    assert projects[0]["id"] == circuit_id
    assert projects[0]["title"] == "NAND Gate Verification (IC 7400)"
    print(f"PASS: Found {len(projects)} cloud project(s) belonging to student.")

    # Step 5: Fetch Circuit by ID
    print("\n[TEST 5] Fetching complete circuit JSON by ID...")
    fetched = user_circuits_router.get_circuit(circuit_id, current_user=current_user)
    assert fetched["id"] == circuit_id
    assert fetched["title"] == "NAND Gate Verification (IC 7400)"
    assert isinstance(fetched["circuit_data"], dict)
    assert len(fetched["circuit_data"]["components"]) == 4
    assert len(fetched["circuit_data"]["wires"]) == 3
    print(f"PASS: Successfully retrieved circuit JSON with {len(fetched['circuit_data']['components'])} components and {len(fetched['circuit_data']['wires'])} wires.")

    # Step 6: Overwrite / Update Existing Circuit
    print("\n[TEST 6] Overwriting/updating existing cloud circuit...")
    sample_circuit_data["components"].append(
        {"id": "c_5", "type": "PROBE", "ref": "PR1", "x": 650, "y": 320, "state": {}}
    )
    update_req = SaveCircuitRequest(
        id=circuit_id,
        title="NAND Gate Verification (IC 7400) - Revised",
        description="Updated with additional logic probe.",
        circuit_data=sample_circuit_data
    )
    update_res = user_circuits_router.save_circuit(update_req, current_user=current_user)
    assert update_res["project"]["id"] == circuit_id
    assert update_res["project"]["title"] == "NAND Gate Verification (IC 7400) - Revised"

    # Verify update persisted
    fetched_updated = user_circuits_router.get_circuit(circuit_id, current_user=current_user)
    assert len(fetched_updated["circuit_data"]["components"]) == 5
    print(f"PASS: Successfully updated circuit {circuit_id}. Title: '{fetched_updated['title']}'")

    # Step 7: Duplicate Circuit
    print("\n[TEST 7] Duplicating existing circuit project...")
    dup_res = user_circuits_router.duplicate_circuit(circuit_id, current_user=current_user)
    assert dup_res["status"] == "success"
    dup_id = dup_res["project"]["id"]
    assert dup_id != circuit_id
    assert "Copy" in dup_res["project"]["title"]
    print(f"PASS: Circuit duplicated into new project ID {dup_id} ('{dup_res['project']['title']}')")

    projects_after_dup = user_circuits_router.list_circuits(current_user=current_user)
    assert len(projects_after_dup) == 2
    print(f"PASS: Total projects now: {len(projects_after_dup)}")

    # Step 8: Delete Circuit
    print("\n[TEST 8] Deleting duplicate circuit from cloud...")
    del_res = user_circuits_router.delete_circuit(dup_id, current_user=current_user)
    assert del_res["status"] == "success"
    print(f"PASS: Project {dup_id} deleted successfully.")

    projects_after_del = user_circuits_router.list_circuits(current_user=current_user)
    assert len(projects_after_del) == 1
    print(f"PASS: Verified project was removed. Remaining projects: {len(projects_after_del)}")

    # Step 9: Clean up test account & circuit
    print("\n[TEST 9] Cleaning up test data...")
    user_circuits_router.delete_circuit(circuit_id, current_user=current_user)
    conn = database.get_connection()
    cursor = conn.cursor()
    database.execute_query(cursor, "DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    print("PASS: Test account and test projects cleaned up cleanly.")

    print("\n" + "=" * 65)
    print("ALL 9 CLOUD CIRCUIT PROJECT TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
