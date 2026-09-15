from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import (
    create_tables,
    seed_users,
    get_user,
    get_vehicle_authorization,
    get_learner_quota,
    grant_temporary_access,
revoke_access
)

app = FastAPI(
    title="Smart Rider Authorization Backend",
    version="1.0"

)
create_tables()
seed_users()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "status": "OK",
        "message": "Smart Rider Backend Running"
    }


@app.get("/api/rider/{user_id}")
def get_rider(user_id: str):
    user = get_user(user_id)

    if not user:
        return {
            "status": "ERROR",
            "message": "User not found"
        }

    return {
        "status": "OK",
        **user
    }


@app.get("/api/vehicle/status")
def vehicle_status():
    return {
        "vehicle_id": "V001",
        "mode": "LEARNING",
        "motor": "STOPPED",
        "supervision": "WAITING",
        "distance_used": 1.2,
        "distance_limit": 3.0,
        "distance_remaining": 1.8
    }
@app.get("/api/vehicle/{vehicle_id}/authorization/{user_id}")
def check_vehicle_authorization(vehicle_id: str, user_id: str):
    authorization = get_vehicle_authorization(vehicle_id, user_id)

    return {
        "vehicle_id": vehicle_id,
        "user_id": user_id,
        "authorization_type": authorization,
        "authorized": authorization != "NONE"
    }


@app.get("/api/learner/{user_id}/quota")
def learner_quota(user_id: str):
    quota = get_learner_quota(user_id)

    if quota is None:
        return {
            "status": "ERROR",
            "message": "Learner quota not found"
        }

    return {
        "status": "OK",
        "user_id": user_id,
        **quota
    }
@app.post("/vehicle/{vehicle_id}/temporary-access/{user_id}")
def add_temporary_access(vehicle_id: str, user_id: str):
    user = get_user(user_id)

    if not user:
        return {
            "status": "ERROR",
            "message": "User not found"
        }

    if user["licence_status"] != "VALID":
        return {
            "status": "DENIED",
            "message": "Licence invalid"
        }

    grant_temporary_access(vehicle_id, user_id)

    return {
        "status": "OK",
        "message": "Temporary access granted",
        "vehicle_id": vehicle_id,
        "user_id": user_id,
        "authorization_type": "TEMPORARY"
    }


@app.post("/vehicle/{vehicle_id}/revoke-access/{user_id}")
def remove_access(vehicle_id: str, user_id: str):
    revoke_access(vehicle_id, user_id)

    return {
        "status": "OK",
        "message": "Access revoked",
        "vehicle_id": vehicle_id,
        "user_id": user_id
    }
@app.get("/api/escort/{user_id}")
def get_escort(user_id: str):
    user = get_user(user_id)

    if not user:
        return {
            "status": "ERROR",
            "message": "Escort not found"
        }

    return {
        "status": "OK",
        "user_id": user_id,
        "name": user["name"],
        "licence_status": user["licence_status"],
        "escort_eligible": bool(user["escort_eligible"])
    }