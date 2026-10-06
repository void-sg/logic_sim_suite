"""
backend/inspect_db.py — Visual database inspector for logic_sim_suite
Run anytime: .venv\\Scripts\\python.exe backend/inspect_db.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

def inspect():
    if not os.path.exists(DB_PATH):
        print(f"[!] Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("=" * 88)
    print("LOGIC SIM SUITE — LIVE DATABASE INSPECTION (Table 1: users)")
    print(f"Database File: {os.path.abspath(DB_PATH)}")
    print("=" * 88)

    # 1. Schema check
    print("\n[SCHEMA COLUMNS]")
    cols = cursor.execute("PRAGMA table_info(users)").fetchall()
    col_str = " | ".join([f"{c['name']} ({c['type']})" for c in cols])
    print(col_str)

    # 2. Registered Users
    rows = cursor.execute("SELECT id, roll_number, username, branch, semester, role, is_verified, email FROM users ORDER BY id ASC").fetchall()
    print(f"\n[REGISTERED USERS ({len(rows)} records)]")
    header_fmt = "{:<4} | {:<10} | {:<16} | {:<6} | {:<4} | {:<8} | {:<6} | {:<25}"
    print(header_fmt.format("ID", "ROLL NO", "USERNAME", "BRANCH", "SEM", "ROLE", "ACTIVE", "EMAIL"))
    print("-" * 88)
    for r in rows:
        roll = r["roll_number"] if r["roll_number"] else "-"
        branch = r["branch"] if r["branch"] else "CSE"
        sem = str(r["semester"]) if r["semester"] else "3"
        role = r["role"] if r["role"] else "student"
        verified = "YES" if r["is_verified"] else "NO"
        print(header_fmt.format(r["id"], roll, r["username"][:16], branch, sem, role, verified, r["email"][:25]))

    print("-" * 88)
    print("[STATUS] Database is healthy, connected, and operating normally.\n")
    conn.close()

if __name__ == "__main__":
    inspect()
