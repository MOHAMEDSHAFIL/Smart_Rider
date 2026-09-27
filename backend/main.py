from fastapi import FastAPI, UploadFile, File
from dotenv import load_dotenv, dotenv_values
import cv2
import numpy as np
from insightface.app import FaceAnalysis
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from dotenv import load_dotenv
from database import (
    create_tables,
    seed_users,
    get_user,
    get_vehicle_authorization,
    get_learner_quota,
    grant_temporary_access,
revoke_access
)
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
print("ENV PATH:", env_path)
print("ENV FILE EXISTS:", os.path.exists(env_path))
print("ENV KEYS:", list(dotenv_values(env_path).keys()))

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_OWNER_CHAT_ID = os.getenv("TELEGRAM_OWNER_CHAT_ID")
print("Telegram token loaded:", bool(TELEGRAM_BOT_TOKEN))
print("Telegram chat ID loaded:", bool(TELEGRAM_OWNER_CHAT_ID))
app = FastAPI(
    title="Smart Rider Authorization Backend",
    version="1.0"

)
def send_telegram_message(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_OWNER_CHAT_ID:
        print("Telegram configuration missing")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": TELEGRAM_OWNER_CHAT_ID,
        "text": message
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        print("Telegram notification sent")
        return True
    except Exception as error:
        print("Telegram notification error:", error)
        return False
@app.get("/api/telegram/test")
def test_telegram():
    sent = send_telegram_message(
        "🏍️ Smart Rider Test\n\nOwner notification system connected successfully."
    )

    return {
        "status": "OK" if sent else "ERROR",
        "message": "Telegram test notification sent" if sent else "Telegram notification failed"
    }
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

    registered_path = (
    f"../public/faces/{user_id}.jpeg"
    if user_id == "E001"
    else f"../public/faces/{user_id}.jpg"
)
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
    
    print(f"User ID: {user_id}")
    print(f"Face similarity: {similarity}")

    verified = similarity >= 0.45
    if not verified:
      send_telegram_message(
        f"⚠️ SMART RIDER ACCESS REQUEST\n\n"
        f"Rider ID: {user_id}\n"
        f"Face verification: MISMATCH\n"
        f"Match score: {round(similarity * 100, 2)}%\n\n"
        f"An unverified rider is requesting vehicle access."
    )
    
    return {
            "status": "OK",
            "verified": verified,
            "similarity": round(similarity * 100, 2),
            "message": "Face verified" if verified else "Face mismatch"
        }   