export type ActiveRole = 'OWNER_ADMIN' | 'RIDER' | 'ESCORT';

export type RiderType = 'NORMAL' | 'LEARNER' | 'INVALID';

export type VehicleAuthType = 'OWNER' | 'PERMANENT' | 'TEMPORARY' | 'NONE';

export type LicenceStatus = 'VALID' | 'INVALID' | 'EXPIRED' | 'UNVERIFIED';

export type FaceVerificationStatus = 'VERIFIED' | 'FAILED' | 'MATCH_LOW' | 'PENDING';

export type SeatStatus = 'OCCUPIED' | 'EMPTY';

export type VehicleMode = 'NORMAL' | 'LEARNING' | 'SAFE' | 'LOCKED';

export type MotorStatus = 'RUNNING' | 'STOPPED';

export type SpeedMode = 'NORMAL' | 'RESTRICTED';

export type SupervisionIntegrityStatus = 'ACTIVE' | 'RE-VERIFICATION REQUIRED' | 'SUPERVISION LOST';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

export type SystemStateMachineState =
  | 'IDLE'
  | 'CREDENTIAL_CHECK'
  | 'FACE_CHECK'
  | 'VEHICLE_AUTHORIZATION'
  | 'OWNER_APPROVAL_REQUIRED'
  | 'CATEGORY_CHECK'
  | 'ESCORT_VERIFICATION'
  | 'ESCORT_PRESENCE_CHECK'
  | 'NORMAL_MODE'
  | 'LEARNING_MODE'
  | 'SAFE_MODE'
  | 'REAUTH_REQUIRED'
  | 'ACCESS_DENIED'
  | 'QUOTA_REACHED'
  | 'SESSION_ENDED';

export interface UserProfile {
  id: string;
  name: string;
  riderType: RiderType;
  licenceStatus: LicenceStatus;
  licenceNumber: string;
  authType: VehicleAuthType;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'PENDING_APPROVAL';
  lastVerified: string;
  avatarUrl?: string;
  isOwner?: boolean;
  temporaryAccessExpiry?: string;
}

export interface EscortProfile {
  id: string;
  name: string;
  licenceStatus: LicenceStatus;
  licenceNumber: string;
  faceStatus: FaceVerificationStatus;
  eligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE';
  pillionPresence: 'PRESENT' | 'ABSENT';
  supervisionStatus: 'ACTIVE' | 'WARNING' | 'LOST' | 'INACTIVE';
  avatarUrl?: string;
}

export interface ConnectivityState {
  backend: 'ONLINE' | 'OFFLINE';
  esp32: 'CONNECTED' | 'DISCONNECTED';
  camera: 'CONNECTED' | 'DISCONNECTED';
  rfid: 'READY' | 'NOT READY';
  database: 'CONNECTED' | 'DISCONNECTED';
}

export interface SupervisionIntegrityMatrix {
  riderIdentityContinuity: SupervisionIntegrityStatus;
  escortIdentityContinuity: SupervisionIntegrityStatus;
  riderSeatContinuity: SupervisionIntegrityStatus;
  escortSeatContinuity: SupervisionIntegrityStatus;
  sessionIntegrity: SupervisionIntegrityStatus;
  lastHeartbeat: string;
}

export interface DistanceMonitoringData {
  usedKm: number;
  limitKm: number;
  remainingKm: number;
  percentage: number;
}

export interface SpeedTelemetryData {
  currentSpeedKmH: number;
  pwmDutyPercent: number;
  maxAllowedSpeedKmH: number;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  timestamp: string;
  message: string;
  category: 'IDENTITY' | 'LICENCE' | 'SUPERVISION' | 'DISTANCE' | 'HARDWARE' | 'SYSTEM';
  acknowledged?: boolean;
}

export interface SessionEvent {
  id: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  title: string;
  description: string;
  details?: string;
}

export interface SessionHistoryItem {
  sessionId: string;
  vehicleId: string;
  rider: UserProfile;
  escort: EscortProfile | null;
  startTime: string;
  endTime?: string;
  mode: VehicleMode;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'DENIED';
  distanceKm: number;
  events: SessionEvent[];
}

export interface PolicySettings {
  learnerDistanceLimitKm: number;
  restrictedSpeedPwm: number;
  restrictedSpeedMaxKmH: number;
  sessionExpiryDurationMinutes: number;
  escortRequirementEnabled: boolean;
  reverificationTriggerSeatLift: boolean;
  reverificationTriggerFaceLoss: boolean;
  reverificationIntervalSeconds: number;
}
