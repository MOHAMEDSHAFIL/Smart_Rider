import { 
  UserProfile, 
  EscortProfile, 
  PolicySettings, 
  SessionHistoryItem, 
  AlertItem,
  SupervisionIntegrityMatrix,
  DistanceMonitoringData,
  SpeedTelemetryData,
  ConnectivityState
} from '../types';

export const INITIAL_VEHICLE_ID = "V001 - Smart Rider Unit #01";

export const MOCK_USERS: UserProfile[] = [
  {
    id: "R001",
    name: "Vikram Malhotra",
    riderType: "NORMAL",
    licenceStatus: "VALID",
    licenceNumber: "DL-04201800912",
    authType: "OWNER",
    status: "ACTIVE",
    lastVerified: "2026-09-14 10:15:22",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isOwner: true
  },
  {
    id: "R002",
    name: "Anita Sharma",
    riderType: "NORMAL",
    licenceStatus: "VALID",
    licenceNumber: "DL-07202100438",
    authType: "PERMANENT",
    status: "ACTIVE",
    lastVerified: "2026-09-14 09:30:10",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "R003",
    name: "Ravi Kumar",
    riderType: "LEARNER",
    licenceStatus: "VALID",
    licenceNumber: "LL-09202600185",
    authType: "PERMANENT",
    status: "ACTIVE",
    lastVerified: "2026-09-14 11:20:45",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "R004",
    name: "Siddharth Sen",
    riderType: "LEARNER",
    licenceStatus: "VALID",
    licenceNumber: "LL-09202600721",
    authType: "TEMPORARY",
    status: "ACTIVE",
    lastVerified: "2026-09-13 16:45:00",
    temporaryAccessExpiry: "2026-09-15 18:00:00",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "R005",
    name: "Karan Johar",
    riderType: "INVALID",
    licenceStatus: "EXPIRED",
    licenceNumber: "DL-01201500331",
    authType: "NONE",
    status: "REVOKED",
    lastVerified: "2026-09-10 12:00:00",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
  }
];

export const MOCK_ESCORTS: EscortProfile[] = [
  {
    id: "E001",
    name: "Priya Patel",
    licenceStatus: "VALID",
    licenceNumber: "DL-04201600889",
    faceStatus: "VERIFIED",
    eligibility: "ELIGIBLE",
    pillionPresence: "PRESENT",
    supervisionStatus: "ACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "E002",
    name: "Arun Verma",
    licenceStatus: "VALID",
    licenceNumber: "DL-09201400214",
    faceStatus: "VERIFIED",
    eligibility: "ELIGIBLE",
    pillionPresence: "ABSENT",
    supervisionStatus: "INACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "E003",
    name: "Meera Nair",
    licenceStatus: "INVALID",
    licenceNumber: "DL-03202500012",
    faceStatus: "FAILED",
    eligibility: "NOT_ELIGIBLE",
    pillionPresence: "ABSENT",
    supervisionStatus: "INACTIVE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

export const DEFAULT_POLICY: PolicySettings = {
  learnerDistanceLimitKm: 3.0,
  restrictedSpeedPwm: 45,
  restrictedSpeedMaxKmH: 25,
  sessionExpiryDurationMinutes: 45,
  escortRequirementEnabled: true,
  reverificationTriggerSeatLift: true,
  reverificationTriggerFaceLoss: true,
  reverificationIntervalSeconds: 30
};

export const INITIAL_CONNECTIVITY: ConnectivityState = {
  backend: "ONLINE",
  esp32: "CONNECTED",
  camera: "CONNECTED",
  rfid: "READY",
  database: "CONNECTED"
};

export const INITIAL_SUPERVISION: SupervisionIntegrityMatrix = {
  riderIdentityContinuity: "ACTIVE",
  escortIdentityContinuity: "ACTIVE",
  riderSeatContinuity: "ACTIVE",
  escortSeatContinuity: "ACTIVE",
  sessionIntegrity: "ACTIVE",
  lastHeartbeat: "Just now (ESP32: 24ms)"
};

export const INITIAL_DISTANCE: DistanceMonitoringData = {
  usedKm: 1.2,
  limitKm: 3.0,
  remainingKm: 1.8,
  percentage: 40.0
};

export const INITIAL_SPEED: SpeedTelemetryData = {
  currentSpeedKmH: 18.5,
  pwmDutyPercent: 45,
  maxAllowedSpeedKmH: 25
};

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "ALT-108",
    severity: "INFO",
    timestamp: "11:20:46",
    message: "Supervision integrity validated. Learner pairing locked with Escort Priya Patel (E001).",
    category: "SUPERVISION",
    acknowledged: true
  },
  {
    id: "ALT-107",
    severity: "INFO",
    timestamp: "11:20:45",
    message: "Rider Ravi Kumar (R003) biometric face match 98.2% verified.",
    category: "IDENTITY",
    acknowledged: true
  },
  {
    id: "ALT-106",
    severity: "WARNING",
    timestamp: "11:18:12",
    message: "Learner mode active: Speed governed to 25 km/h (PWM: 45%). Prototype distance quota enabled.",
    category: "SYSTEM",
    acknowledged: true
  }
];

export const INITIAL_SESSION_HISTORY: SessionHistoryItem[] = [
  {
    sessionId: "SES-20260914-003",
    vehicleId: "V001",
    rider: MOCK_USERS[2], // Ravi
    escort: MOCK_ESCORTS[0], // Priya
    startTime: "2026-09-14 11:20:45",
    mode: "LEARNING",
    status: "ACTIVE",
    distanceKm: 1.2,
    events: [
      { id: "EV-1", timestamp: "11:20:40", type: "INFO", title: "RFID Tag Detected", description: "Learner Card #LL-09202600185 scanned on vehicle reader." },
      { id: "EV-2", timestamp: "11:20:42", type: "SUCCESS", title: "Face Match Confirmed", description: "Camera matched Ravi Kumar with 98.2% confidence." },
      { id: "EV-3", timestamp: "11:20:44", type: "INFO", title: "Escort Tag Detected", description: "Verified Escort Priya Patel (E001) confirmed on pillion seat." },
      { id: "EV-4", timestamp: "11:20:45", type: "SUCCESS", title: "Learning Mode Initialized", description: "Motor power enabled with speed limit 25 km/h & 3.0 km distance budget." }
    ]
  },
  {
    sessionId: "SES-20260914-002",
    vehicleId: "V001",
    rider: MOCK_USERS[1], // Anita
    escort: null,
    startTime: "2026-09-14 09:15:00",
    endTime: "2026-09-14 09:48:20",
    mode: "NORMAL",
    status: "COMPLETED",
    distanceKm: 8.4,
    events: [
      { id: "EV-201", timestamp: "09:15:00", type: "INFO", title: "RFID Tag Detected", description: "Permanent driver card scanned for Anita Sharma." },
      { id: "EV-202", timestamp: "09:15:04", type: "SUCCESS", title: "Identity Confirmed", description: "Biometric and vehicle authorization valid (PERMANENT)." },
      { id: "EV-203", timestamp: "09:15:05", type: "INFO", title: "Normal Mode Engaged", description: "Unrestricted engine ignition enabled." },
      { id: "EV-204", timestamp: "09:48:20", type: "INFO", title: "Session Closed", description: "Vehicle parked and ignition safely turned off." }
    ]
  },
  {
    sessionId: "SES-20260913-089",
    vehicleId: "V001",
    rider: MOCK_USERS[4], // Karan (Unauthorized)
    escort: null,
    startTime: "2026-09-13 14:10:11",
    endTime: "2026-09-13 14:10:20",
    mode: "LOCKED",
    status: "DENIED",
    distanceKm: 0.0,
    events: [
      { id: "EV-301", timestamp: "14:10:11", type: "INFO", title: "Card Scanned", description: "RFID tag #DL-01201500331 scanned." },
      { id: "EV-302", timestamp: "14:10:14", type: "CRITICAL", title: "Licence Expired & Revoked", description: "Credential status is EXPIRED; Vehicle authorization is NONE." },
      { id: "EV-303", timestamp: "14:10:15", type: "CRITICAL", title: "Ignition Interlock Active", description: "Starter solenoid disabled. Access denied recorded." }
    ]
  }
];
