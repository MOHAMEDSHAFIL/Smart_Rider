from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
from insightface.app import FaceAnalysis
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
face_app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)

face_app.prepare(
    ctx_id=-1,
    det_size=(640, 640)
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
@app.post("/api/face/verify/{user_id}")
async def verify_face(user_id: str, file: UploadFile = File(...)):

    registered_path = f"../public/faces/{user_id}.jpg"
    registered_image = cv2.imread(registered_path)

    if registered_image is None:
        return {
            "status": "ERROR",
            "verified": False,
            "message": "Registered face not found"
        }

    registered_faces = face_app.get(registered_image)

    if len(registered_faces) == 0:
        return {
            "status": "ERROR",
            "verified": False,
            "message": "No face detected in registered image"
        }

    image_bytes = await file.read()
    np_array = np.frombuffer(image_bytes, np.uint8)
    captured_image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    captured_faces = face_app.get(captured_image)

    if len(captured_faces) == 0:
        return {
            "status": "NO_FACE",
            "verified": False,
            "message": "No face detected"
        }

    registered_embedding = registered_faces[0].normed_embedding
    captured_embedding = captured_faces[0].normed_embedding

    similarity = float(
        np.dot(registered_embedding, captured_embedding)
    )

    verified = similarity >= 0.45

    return {
        "status": "OK",
        "verified": verified,
        "similarity": round(similarity * 100, 2),
        "message": "Face verified" if verified else "Face mismatch"
    }   