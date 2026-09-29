from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
import os
from insightface.app import FaceAnalysis
from fastapi.middleware.cors import CORSMiddleware
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
# Load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_OWNER_CHAT_ID = os.getenv("TELEGRAM_OWNER_CHAT_ID")

print("Telegram token loaded:", bool(TELEGRAM_BOT_TOKEN))
print("Telegram chat ID loaded:", bool(TELEGRAM_OWNER_CHAT_ID))

app = FastAPI(
    title="Smart Rider Authorization Backend",
    version="1.0"

)
def send_telegram_message(message: str, reply_markup=None):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_OWNER_CHAT_ID:
        print("Telegram configuration missing")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": TELEGRAM_OWNER_CHAT_ID,
        "text": message
    }

    if reply_markup is not None:
        payload["reply_markup"] = reply_markup

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=10
        )

        print("Telegram status:", response.status_code)
        print("Telegram response:", response.text)

        return response.ok

    except Exception as error:
        print("Telegram notification error:", error)
        return False
@app.get("/api/telegram/test")
def test_telegram():
    sent = send_telegram_message(
        "🏍️ Smart Rider Test\n\n"
        "Telegram notification system connected successfully."
    )

    return {
        "status": "OK" if sent else "ERROR",
        "message": "Telegram test notification sent"
        if sent
        else "Telegram notification failed"
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
    det_size=(640, 640),
    det_thresh=0.3
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

    extension = ".jpeg" if user_id == "E001" else ".jpg"

    registered_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "public",
        "faces",
        f"{user_id}{extension}"
    )

    registered_path = os.path.abspath(registered_path)

    print("Registered face path:", registered_path)

    # Load registered image
    registered_image = cv2.imread(registered_path)

    if registered_image is None:
        return {
            "status": "ERROR",
            "verified": False,
            "message": "Registered face not found"
        }

    # Detect face in registered image
    registered_faces = face_app.get(registered_image)
    print("REGISTERED FACES FOUND:", len(registered_faces))

    if len(registered_faces) == 0:
        return {
            "status": "ERROR",
            "verified": False,
            "message": "No face detected in registered image"
        }

    # Read captured image from frontend
    image_bytes = await file.read()

    np_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    captured_image = cv2.imdecode(
        np_array,
        cv2.IMREAD_COLOR
    )

    if captured_image is None:
        return {
            "status": "ERROR",
            "verified": False,
            "message": "Unable to read captured image"
        }
    cv2.imwrite("debug_capture.jpg", captured_image)

    # Detect face from captured image
    captured_faces = face_app.get(captured_image)
    print("CAPTURED FACES FOUND:", len(captured_faces))

    if len(captured_faces) == 0:
        return {
            "status": "NO_FACE",
            "verified": False,
            "message": "No face detected"
        }

    # Get embeddings
    registered_embedding = registered_faces[0].normed_embedding
    captured_embedding = captured_faces[0].normed_embedding

    # Compare faces
    similarity = float(
        np.dot(
            registered_embedding,
            captured_embedding
        )
    )

    print(f"User ID: {user_id}")
    print(f"Face similarity: {similarity}")

    verified = similarity >= 0.45

    if not verified:
        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"
        buttons = {
    "inline_keyboard": [
        [
            {
                "text": "✅ ALLOW",
                "callback_data": f"allow:{user_id}"
            },
            {
                "text": "⛔ DENY",
                "callback_data": f"deny:{user_id}"
            }
        ]
    ]
}
        send_telegram_message(
                f"🚨 SMART RIDER — ACCESS REQUEST\n\n"
                f"An unverified rider is attempting to access your vehicle.\n\n"
                f"👤 RIDER DETAILS\n"
                f"Name: {rider_name}\n"
                f"Rider ID: {user_id}\n"
                f"Licence Status: {user['licence_status'] if user else 'UNKNOWN'}\n\n"
                f"🔐 VERIFICATION\n"
                f"Face Verification: MISMATCH\n"
                f"Match Score: {round(similarity * 100, 2)}%\n\n"
                f"🏍️ VEHICLE STATUS\n"
                f"Vehicle ID: V001\n"
                f"Status: LOCKED\n\n"
                f"⚠️ Access remains blocked until owner authorization.",
                reply_markup=buttons

)
        

    return {
        "status": "OK",
        "verified": verified,
        "similarity": round(similarity * 100, 2),
        "message": "Face verified" if verified else "Face mismatch"
    }
@app.post("/api/telegram/webhook")
async def telegram_webhook(update: dict):

    callback = update.get("callback_query")

    if not callback:
        return {"ok": True}

    callback_id = callback.get("id")
    data = callback.get("data", "")
    message = callback.get("message", {})
    chat_id = message.get("chat", {}).get("id")

    print("TELEGRAM BUTTON CLICKED:", data)

    # Stop Telegram loading animation
    requests.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
        json={
            "callback_query_id": callback_id
        },
        timeout=10
    )

    if data.startswith("allow:"):
        user_id = data.split(":", 1)[1]

        print("OWNER SELECTED ALLOW:", user_id)

        send_telegram_message(
            f"✅ ACCESS APPROVAL\n\n"
            f"Rider ID: {user_id}\n\n"
            f"Choose the type of authorization:",
            reply_markup={
                "inline_keyboard": [
                    [
                        {
                            "text": "👤 PERMANENT USER",
                            "callback_data": f"permanent:{user_id}"
                        }
                    ],
                    [
                        {
                            "text": "⏱ TEMPORARY USER",
                            "callback_data": f"temporary:{user_id}"
                        }
                    ],
                    [
                        {
                            "text": "↩ CANCEL",
                            "callback_data": f"cancel:{user_id}"
                        }
                    ]
                ]
            }
        )
    elif data.startswith("permanent:"):
        user_id = data.split(":", 1)[1]

        print("OWNER SELECTED PERMANENT USER:", user_id)

        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"

        send_telegram_message(
            f"👤 PERMANENT USER APPROVAL\n\n"
            f"Name: {rider_name}\n"
            f"Rider ID: {user_id}\n\n"
            f"Permanent access has been selected."
        )
    elif data.startswith("temporary:"):
        user_id = data.split(":", 1)[1]

        print("OWNER SELECTED TEMPORARY USER:", user_id)

        send_telegram_message(
            f"⏱ TEMPORARY ACCESS\n\n"
            f"Rider ID: {user_id}\n\n"
            f"Select how long this rider should have access:",
            reply_markup={
                "inline_keyboard": [
                    [
                        {
                            "text": "1 HOUR",
                            "callback_data": f"temp_1h:{user_id}"
                        },
                        {
                            "text": "6 HOURS",
                            "callback_data": f"temp_6h:{user_id}"
                        }
                    ],
                    [
                        {
                            "text": "1 DAY",
                            "callback_data": f"temp_1d:{user_id}"
                        },
                        {
                            "text": "2 DAYS",
                            "callback_data": f"temp_2d:{user_id}"
                        }
                    ],
                    [
                        {
                            "text": "↩ CANCEL",
                            "callback_data": f"cancel:{user_id}"
                        }
                    ]
                ]
            }
        )
    elif data.startswith("temp_1h:"):
        user_id = data.split(":", 1)[1]

        print("TEMPORARY ACCESS SELECTED: 1 HOUR -", user_id)

        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"

        send_telegram_message(
            f"✅ TEMPORARY ACCESS APPROVED\n\n"
            f"👤 Name: {rider_name}\n"
            f"🆔 Rider ID: {user_id}\n"
            f"🏍️ Vehicle ID: V001\n\n"
            f"⏱ Access Duration: 1 Hour\n"
            f"🔓 Authorization Status: APPROVED\n\n"
            f"Temporary access has been confirmed by the owner."
        )
    elif data.startswith("temp_6h:"):
        user_id = data.split(":", 1)[1]

        print("TEMPORARY ACCESS SELECTED: 6 HOURS -", user_id)

        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"

        send_telegram_message(
            f"✅ TEMPORARY ACCESS APPROVED\n\n"
            f"👤 Name: {rider_name}\n"
            f"🆔 Rider ID: {user_id}\n"
            f"🏍️ Vehicle ID: V001\n\n"
            f"⏱ Access Duration: 6 Hours\n"
            f"🔓 Authorization Status: APPROVED\n\n"
            f"Temporary access has been confirmed by the owner."
        )
    elif data.startswith("temp_1d:"):
        user_id = data.split(":", 1)[1]

        print("TEMPORARY ACCESS SELECTED: 1 DAY -", user_id)

        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"

        send_telegram_message(
            f"✅ TEMPORARY ACCESS APPROVED\n\n"
            f"👤 Name: {rider_name}\n"
            f"🆔 Rider ID: {user_id}\n"
            f"🏍️ Vehicle ID: V001\n\n"
            f"⏱ Access Duration: 1 Day\n"
            f"🔓 Authorization Status: APPROVED\n\n"
            f"Temporary access has been confirmed by the owner."
        )
    elif data.startswith("temp_2d:"):
        user_id = data.split(":", 1)[1]

        print("TEMPORARY ACCESS SELECTED: 2 DAYS -", user_id)

        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"

        send_telegram_message(
            f"✅ TEMPORARY ACCESS APPROVED\n\n"
            f"👤 Name: {rider_name}\n"
            f"🆔 Rider ID: {user_id}\n"
            f"🏍️ Vehicle ID: V001\n\n"
            f"⏱ Access Duration: 2 Days\n"
            f"🔓 Authorization Status: APPROVED\n\n"
            f"Temporary access has been confirmed by the owner."
        )
    elif data.startswith("cancel:"):
        user_id = data.split(":", 1)[1]

        print("OWNER CANCELLED ACCESS REQUEST:", user_id)

        user = get_user(user_id)
        rider_name = user["name"] if user else "Unknown Rider"

        send_telegram_message(
            f"↩️ ACCESS REQUEST CANCELLED\n\n"
            f"👤 Name: {rider_name}\n"
            f"🆔 Rider ID: {user_id}\n"
            f"🏍️ Vehicle ID: V001\n\n"
            f"🔒 Vehicle Status: LOCKED\n\n"
            f"No authorization changes were made."
        )
    elif data.startswith("deny:"):
        user_id = data.split(":", 1)[1]

        print("OWNER SELECTED DENY:", user_id)

        send_telegram_message(
            f"⛔ ACCESS DENIED\n\n"
            f"Rider ID: {user_id}\n"
            f"Vehicle ID: V001\n"
            f"Status: LOCKED\n\n"
            f"No vehicle access has been granted."
        )

    return {"ok": True}
    