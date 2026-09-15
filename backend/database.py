import sqlite3
import os

DB_NAME = "/tmp/smart_rider.db" if os.getenv("VERCEL") else "smart_rider.db"


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


# --------------------------------------------------
# CREATE TABLES
# --------------------------------------------------

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    # Users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        licence_status TEXT NOT NULL,
        rider_type TEXT NOT NULL,
        vehicle_authorized INTEGER NOT NULL,
        escort_eligible INTEGER NOT NULL,
        distance_used REAL DEFAULT 0
    )
    """)

    # Vehicle authorization
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_users (
        vehicle_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        authorization_type TEXT NOT NULL,
        PRIMARY KEY (vehicle_id, user_id)
    )
    """)

    # Learner quota
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learner_quota (
        user_id TEXT PRIMARY KEY,
        distance_limit REAL DEFAULT 3.0,
        distance_used REAL DEFAULT 0.0
    )
    """)

    # Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        vehicle_id TEXT,
        rider_id TEXT,
        escort_id TEXT,
        mode TEXT,
        supervision_status TEXT,
        distance REAL DEFAULT 0.0,
        status TEXT
    )
    """)

    conn.commit()
    conn.close()


# --------------------------------------------------
# INSERT DEMO DATA
# --------------------------------------------------

def seed_users():
    conn = get_connection()
    cursor = conn.cursor()

    users = [
        ("R001", "Arun", "VALID", "NORMAL", 1, 1, 0.0),
        ("R002", "Mohamed Shafil", "VALID", "LEARNER", 1, 0, 1.2),
        ("R003", "Priya", "VALID", "NORMAL", 1, 1, 0.0),
        ("R004", "Sam", "VALID", "NORMAL", 0, 1, 0.0)
    ]

    cursor.executemany("""
    INSERT OR IGNORE INTO users (
        user_id,
        name,
        licence_status,
        rider_type,
        vehicle_authorized,
        escort_eligible,
        distance_used
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, users)

    vehicle_users = [
        ("V001", "R001", "OWNER"),
        ("V001", "R002", "PERMANENT"),
        ("V001", "R003", "PERMANENT")
    ]

    cursor.executemany("""
    INSERT OR IGNORE INTO vehicle_users (
        vehicle_id,
        user_id,
        authorization_type
    )
    VALUES (?, ?, ?)
    """, vehicle_users)

    learner_quotas = [
        ("R002", 3.0, 1.2)
    ]

    cursor.executemany("""
    INSERT OR IGNORE INTO learner_quota (
        user_id,
        distance_limit,
        distance_used
    )
    VALUES (?, ?, ?)
    """, learner_quotas)

    conn.commit()
    conn.close()


# --------------------------------------------------
# GET USER
# --------------------------------------------------

def get_user(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE user_id = ?",
        (user_id,)
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return dict(row)


# --------------------------------------------------
# CHECK VEHICLE AUTHORIZATION
# --------------------------------------------------

def get_vehicle_authorization(vehicle_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT authorization_type
    FROM vehicle_users
    WHERE vehicle_id = ? AND user_id = ?
    """, (vehicle_id, user_id))

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return "NONE"

    return row["authorization_type"]


# --------------------------------------------------
# GET LEARNER QUOTA
# --------------------------------------------------

def get_learner_quota(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT distance_limit, distance_used
    FROM learner_quota
    WHERE user_id = ?
    """, (user_id,))

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    data = dict(row)

    data["distance_remaining"] = max(
        data["distance_limit"] - data["distance_used"],
        0
    )

    return data
def grant_temporary_access(vehicle_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO vehicle_users (
        vehicle_id,
        user_id,
        authorization_type
    )
    VALUES (?, ?, ?)
    ON CONFLICT(vehicle_id, user_id)
    DO UPDATE SET authorization_type = excluded.authorization_type
    """, (vehicle_id, user_id, "TEMPORARY"))

    conn.commit()
    conn.close()


def revoke_access(vehicle_id, user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    DELETE FROM vehicle_users
    WHERE vehicle_id = ? AND user_id = ?
    """, (vehicle_id, user_id))

    conn.commit()
    conn.close()