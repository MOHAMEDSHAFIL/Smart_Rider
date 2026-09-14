import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ActiveRole,
  RiderType,
  VehicleAuthType,
  LicenceStatus,
  FaceVerificationStatus,
  SeatStatus,
  VehicleMode,
  MotorStatus,
  SpeedMode,
  SupervisionIntegrityStatus,
  AlertItem,
  AlertSeverity,
  UserProfile,
  EscortProfile,
  PolicySettings,
  SessionHistoryItem,
  SessionEvent,
  SystemStateMachineState,
  ConnectivityState,
  SupervisionIntegrityMatrix
} from '../types';
import {
  MOCK_USERS,
  MOCK_ESCORTS,
  DEFAULT_POLICY,
  INITIAL_ALERTS,
  INITIAL_SESSION_HISTORY,
  INITIAL_SUPERVISION,
  INITIAL_DISTANCE,
  INITIAL_SPEED,
  INITIAL_CONNECTIVITY,
  INITIAL_VEHICLE_ID
} from '../services/mockData';
import { sounds } from '../utils/audio';
import {
  getRider,
  getEscort,
  getVehicleStatus,
  getAuthorization,
  getLearnerQuota
} from '../api';

interface SmartRiderContextType {
  // Theme & Appearance
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  scanlinesEnabled: boolean;
  toggleScanlines: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Navigation & Role
  activeTab: 'overview' | 'users' | 'sessions' | 'policy' | 'demo';
  setActiveTab: (tab: 'overview' | 'users' | 'sessions' | 'policy' | 'demo') => void;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;

  // Connectivity
  connectivity: ConnectivityState;
  setConnectivity: React.Dispatch<React.SetStateAction<ConnectivityState>>;

  // State Machine
  stateMachineState: SystemStateMachineState;
  setStateMachineState: (state: SystemStateMachineState) => void;

  // Rider Details
  rider: UserProfile;
  setRider: (rider: UserProfile) => void;
  riderLicenceValid: boolean;
  setRiderLicenceValid: (v: boolean) => void;
  riderFaceVerified: boolean;
  setRiderFaceVerified: (v: boolean) => void;
  riderAuthType: VehicleAuthType;
  setRiderAuthType: (v: VehicleAuthType) => void;
  riderType: RiderType;
  setRiderType: (v: RiderType) => void;
  riderSeatOccupied: boolean;
  setRiderSeatOccupied: (v: boolean) => void;

  // Escort Details
  escort: EscortProfile | null;
  setEscort: (escort: EscortProfile | null) => void;
  escortLicenceValid: boolean;
  setEscortLicenceValid: (v: boolean) => void;
  escortFaceVerified: boolean;
  setEscortFaceVerified: (v: boolean) => void;
  escortEligible: boolean;
  setEscortEligible: (v: boolean) => void;
  pillionSeatOccupied: boolean;
  setPillionSeatOccupied: (v: boolean) => void;
  supervisionStatus: 'ACTIVE' | 'WARNING' | 'LOST' | 'INACTIVE';

  // Vehicle Status
  vehicleId: string;
  vehicleMode: VehicleMode;
  setVehicleMode: (mode: VehicleMode) => void;
  motorStatus: MotorStatus;
  setMotorStatus: (status: MotorStatus) => void;
  speedMode: SpeedMode;
  setSpeedMode: (mode: SpeedMode) => void;
  currentSpeedKmH: number;
  setCurrentSpeedKmH: (speed: number) => void;
  pwmDutyPercent: number;
  setPwmDutyPercent: (pwm: number) => void;

  // Distance Monitoring
  distanceUsedKm: number;
  setDistanceUsedKm: (val: number) => void;
  distanceLimitKm: number;
  setDistanceLimitKm: (val: number) => void;

  // Supervision Matrix
  supervisionMatrix: SupervisionIntegrityMatrix;
  setSupervisionMatrix: React.Dispatch<React.SetStateAction<SupervisionIntegrityMatrix>>;

  // Alerts
  alerts: AlertItem[];
  addAlert: (severity: AlertSeverity, message: string, category?: AlertItem['category']) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;

  // Users & Sessions
  users: UserProfile[];
  addUser: (user: Omit<UserProfile, 'id' | 'lastVerified'>) => void;
  removeUser: (id: string) => void;
  grantTemporaryAccess: (id: string, hours?: number) => void;
  revokeAccess: (id: string) => void;

  sessionHistory: SessionHistoryItem[];
  currentSessionEvents: SessionEvent[];
  addSessionEvent: (type: SessionEvent['type'], title: string, description: string) => void;

  // Policy
  policy: PolicySettings;
  updatePolicy: (newPolicy: PolicySettings) => void;
  resetPolicy: () => void;

  // Demo Simulation Actions
  verifyRiderAction: () => void;
  verifyEscortAction: () => void;
  startVehicleAction: () => void;
  stopVehicleAction: () => void;
  simulateRiderLeavingAction: () => void;
  simulateRiderReturningAction: () => void;
  simulateEscortLeavingAction: () => void;
  simulateEscortReplacementAction: () => void;
  simulateIdentityMismatchAction: () => void;
  simulateInvalidLicenceAction: () => void;
  simulateDistanceLimitReachedAction: () => void;
  simulateGrantTempAccessAction: () => void;
  simulateRevokeTempAccessAction: () => void;
  resetDemoAction: () => void;
}

const SmartRiderContext = createContext<SmartRiderContextType | undefined>(undefined);

export const SmartRiderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme & scanlines
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sr_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tabs & Role
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sessions' | 'policy' | 'demo'>('overview');
  const [activeRole, setActiveRole] = useState<ActiveRole>('OWNER_ADMIN');
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Connectivity
  const [connectivity, setConnectivity] = useState<ConnectivityState>(INITIAL_CONNECTIVITY);

  // State Machine
  const [stateMachineState, setStateMachineState] = useState<SystemStateMachineState>('LEARNING_MODE');

  // Rider Profile & State
  const [rider, setRider] = useState<UserProfile>(MOCK_USERS[2]); // Ravi Kumar (Learner)
  const [riderLicenceValid, setRiderLicenceValid] = useState<boolean>(true);
  const [riderFaceVerified, setRiderFaceVerified] = useState<boolean>(true);
  const [riderAuthType, setRiderAuthType] = useState<VehicleAuthType>('PERMANENT');
  const [riderType, setRiderType] = useState<RiderType>('LEARNER');
  const [riderSeatOccupied, setRiderSeatOccupied] = useState<boolean>(true);

  // Escort Profile & State
  const [escort, setEscort] = useState<EscortProfile | null>(MOCK_ESCORTS[0]); // Priya Patel
  const [escortLicenceValid, setEscortLicenceValid] = useState<boolean>(true);
  const [escortFaceVerified, setEscortFaceVerified] = useState<boolean>(true);
  const [escortEligible, setEscortEligible] = useState<boolean>(true);
  const [pillionSeatOccupied, setPillionSeatOccupied] = useState<boolean>(true);

  // Vehicle
  const vehicleId = INITIAL_VEHICLE_ID;
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>('LEARNING');
  const [motorStatus, setMotorStatus] = useState<MotorStatus>('RUNNING');
  const [speedMode, setSpeedMode] = useState<SpeedMode>('RESTRICTED');
  const [currentSpeedKmH, setCurrentSpeedKmH] = useState<number>(INITIAL_SPEED.currentSpeedKmH);
  const [pwmDutyPercent, setPwmDutyPercent] = useState<number>(INITIAL_SPEED.pwmDutyPercent);

  // Distance
  const [distanceUsedKm, setDistanceUsedKm] = useState<number>(INITIAL_DISTANCE.usedKm);
  const [distanceLimitKm, setDistanceLimitKm] = useState<number>(INITIAL_DISTANCE.limitKm);

  // Supervision
  const [supervisionMatrix, setSupervisionMatrix] = useState<SupervisionIntegrityMatrix>(INITIAL_SUPERVISION);

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Users & Sessions
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>(INITIAL_SESSION_HISTORY);
  const [currentSessionEvents, setCurrentSessionEvents] = useState<SessionEvent[]>([
    { id: 'EV-INIT-1', timestamp: '11:20:40', type: 'INFO', title: 'RFID Credential Validated', description: 'Rider card #LL-09202600185 scanned.' },
    { id: 'EV-INIT-2', timestamp: '11:20:42', type: 'SUCCESS', title: 'Biometric Face Confirmed', description: 'Matched Ravi Kumar (98.2%).' },
    { id: 'EV-INIT-3', timestamp: '11:20:44', type: 'INFO', title: 'Escort Paired', description: 'Priya Patel (E001) verified on pillion seat.' },
    { id: 'EV-INIT-4', timestamp: '11:20:45', type: 'SUCCESS', title: 'Learning Mode Engaged', description: 'Vehicle initialized with restricted speed.' }
  ]);

  // Policy
  const [policy, setPolicy] = useState<PolicySettings>(DEFAULT_POLICY);

  // Sync theme to root class
  useEffect(() => {
    localStorage.setItem('sr_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync sound manager
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    if (demoMode) {
      return;
    }

    const loadBackendData = async () => {
      try {
        const riderData = await getRider('R002');
        const vehicleData = await getVehicleStatus();
        const authData = await getAuthorization('V001', 'R002');
        const quotaData = await getLearnerQuota('R002');
        const escortData = await getEscort('R003');

        setRider(prev => ({
          ...prev,
          id: riderData.user_id,
          name: riderData.name
        }));
        setEscort(prev => prev ? {
          ...prev,
          id: escortData.user_id,
          name: escortData.name
        } : prev);

        setEscortLicenceValid(
          escortData.licence_status === 'VALID'
        );

        setEscortEligible(
          escortData.escort_eligible
        );

        setRiderLicenceValid(riderData.licence_status === 'VALID');
        setRiderType(riderData.rider_type);
        setRiderAuthType(authData.authorization_type);

        setVehicleMode(vehicleData.mode);
        setMotorStatus(vehicleData.motor);

        setDistanceUsedKm(quotaData.distance_used);
        setDistanceLimitKm(quotaData.distance_limit);

      } catch (error) {
        console.error('Backend connection failed:', error);
      }
    };

    loadBackendData();
  }, [demoMode]);

  const toggleTheme = () => {
    sounds.playClick(600);
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleScanlines = () => {
    sounds.playClick(700);
    setScanlinesEnabled(prev => !prev);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Helper to append alerts
  const addAlert = (severity: AlertSeverity, message: string, category: AlertItem['category'] = 'SYSTEM') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newAlert: AlertItem = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      severity,
      timestamp: timeStr,
      message,
      category,
      acknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev]);

    if (severity === 'CRITICAL') {
      sounds.playCriticalAlert();
    } else if (severity === 'WARNING') {
      sounds.playWarning();
    } else if (severity === 'SUCCESS') {
      sounds.playSuccess();
    } else {
      sounds.playClick(500);
    }
  };

  const acknowledgeAlert = (id: string) => {
    sounds.playClick(600);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const clearAlerts = () => {
    sounds.playClick(400);
    setAlerts([]);
  };

  const addSessionEvent = (type: SessionEvent['type'], title: string, description: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEvent: SessionEvent = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      type,
      title,
      description
    };
    setCurrentSessionEvents(prev => [newEvent, ...prev]);
  };

  // User Management
  const addUser = (userData: Omit<UserProfile, 'id' | 'lastVerified'>) => {
    sounds.playSuccess();
    const newId = `R00${users.length + 1}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newUser: UserProfile = {
      ...userData,
      id: newId,
      lastVerified: now
    };
    setUsers(prev => [newUser, ...prev]);
    addAlert('SUCCESS', `New user "${newUser.name}" (${newUser.id}) registered into vehicle access roster.`, 'IDENTITY');
    addSessionEvent('SUCCESS', 'User Registered', `Added permanent user ${newUser.name} with licence ${newUser.licenceNumber}`);
  };

  const removeUser = (id: string) => {
    sounds.playWarning();
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addAlert('WARNING', `User ${target ? target.name : id} authorization removed from vehicle.`, 'IDENTITY');
    addSessionEvent('WARNING', 'User Revoked', `Removed credential authorization for ID: ${id}`);
  };

  const grantTemporaryAccess = (id: string, hours = 24) => {
    sounds.playSuccess();
    const expiry = new Date(Date.now() + hours * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          authType: 'TEMPORARY',
          status: 'ACTIVE',
          temporaryAccessExpiry: expiry
        };
      }
      return u;
    }));
    addAlert('SUCCESS', `Temporary access granted for user ${id} (valid for ${hours}h).`, 'IDENTITY');
    addSessionEvent('INFO', 'Temporary Access Granted', `User ${id} granted ${hours}-hour vehicle pass.`);
  };

  const revokeAccess = (id: string) => {
    sounds.playWarning();
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          authType: 'NONE',
          status: 'REVOKED'
        };
      }
      return u;
    }));
    addAlert('WARNING', `Access revoked for user ${id}. Starter solenoid lock enforced.`, 'IDENTITY');
    addSessionEvent('WARNING', 'Access Revoked', `Revoked all driving permissions for user ${id}`);
  };

  // Policy
  const updatePolicy = (newPolicy: PolicySettings) => {
    sounds.playSuccess();
    setPolicy(newPolicy);
    setDistanceLimitKm(newPolicy.learnerDistanceLimitKm);
    setPwmDutyPercent(newPolicy.restrictedSpeedPwm);
    addAlert('INFO', 'Vehicle policy settings updated successfully.', 'SYSTEM');
    addSessionEvent('INFO', 'Policy Updated', `Distance limit set to ${newPolicy.learnerDistanceLimitKm} km, Speed PWM ${newPolicy.restrictedSpeedPwm}%.`);
  };

  const resetPolicy = () => {
    sounds.playClick(500);
    setPolicy(DEFAULT_POLICY);
    setDistanceLimitKm(DEFAULT_POLICY.learnerDistanceLimitKm);
    setPwmDutyPercent(DEFAULT_POLICY.restrictedSpeedPwm);
    addAlert('INFO', 'Policy configuration restored to default prototype limits.', 'SYSTEM');
  };

  // Escort computed supervision status
  const supervisionStatus: 'ACTIVE' | 'WARNING' | 'LOST' | 'INACTIVE' =
    riderType !== 'LEARNER'
      ? 'INACTIVE'
      : (!escort || !pillionSeatOccupied || !escortEligible)
        ? 'LOST'
        : (!escortFaceVerified || !escortLicenceValid)
          ? 'WARNING'
          : 'ACTIVE';

  // --- DEMO / EVALUATOR SCENARIO ACTIONS ---

  const verifyRiderAction = () => {
    sounds.playSuccess();
    setRiderLicenceValid(true);
    setRiderFaceVerified(true);
    setRiderSeatOccupied(true);
    setStateMachineState(riderType === 'LEARNER' ? 'ESCORT_VERIFICATION' : 'NORMAL_MODE');
    setSupervisionMatrix(prev => ({
      ...prev,
      riderIdentityContinuity: 'ACTIVE',
      riderSeatContinuity: 'ACTIVE',
      sessionIntegrity: 'ACTIVE'
    }));
    addAlert('SUCCESS', `Rider ${rider.name} credential and face verified successfully.`, 'IDENTITY');
    addSessionEvent('SUCCESS', 'Rider Verified', `RFID and face biometrics authenticated for ${rider.name}`);
  };

  const verifyEscortAction = () => {
    sounds.playSuccess();
    if (!escort) setEscort(MOCK_ESCORTS[0]);
    setEscortLicenceValid(true);
    setEscortFaceVerified(true);
    setEscortEligible(true);
    setPillionSeatOccupied(true);
    setStateMachineState('LEARNING_MODE');
    setVehicleMode('LEARNING');
    setMotorStatus('RUNNING');
    setSupervisionMatrix(prev => ({
      ...prev,
      escortIdentityContinuity: 'ACTIVE',
      escortSeatContinuity: 'ACTIVE',
      sessionIntegrity: 'ACTIVE'
    }));
    addAlert('SUCCESS', 'Escort verified and paired. Supervision lock active. Vehicle learning mode enabled.', 'SUPERVISION');
    addSessionEvent('SUCCESS', 'Escort Verified', 'Pillion escort validated. Motor throttle enabled in LEARNING mode.');
  };

  const startVehicleAction = () => {
    sounds.playSuccess();
    setMotorStatus('RUNNING');
    if (riderType === 'LEARNER') {
      setVehicleMode('LEARNING');
      setSpeedMode('RESTRICTED');
      setCurrentSpeedKmH(18.5);
    } else {
      setVehicleMode('NORMAL');
      setSpeedMode('NORMAL');
      setCurrentSpeedKmH(35.0);
    }
    addAlert('INFO', 'Ignition solenoid engaged. Motor running.', 'SYSTEM');
    addSessionEvent('INFO', 'Vehicle Started', 'Engine starter relay energized.');
  };

  const stopVehicleAction = () => {
    sounds.playWarning();
    setMotorStatus('STOPPED');
    setCurrentSpeedKmH(0);
    addAlert('INFO', 'Vehicle motor stopped safely.', 'SYSTEM');
    addSessionEvent('INFO', 'Vehicle Stopped', 'Ignition key switched off or brake cutoff triggered.');
  };

  const simulateRiderLeavingAction = () => {
    sounds.playCriticalAlert();
    setRiderSeatOccupied(false);
    setMotorStatus('STOPPED');
    setCurrentSpeedKmH(0);
    setVehicleMode('SAFE');
    setStateMachineState('SAFE_MODE');
    setSupervisionMatrix(prev => ({
      ...prev,
      riderSeatContinuity: 'SUPERVISION LOST',
      sessionIntegrity: 'RE-VERIFICATION REQUIRED'
    }));
    addAlert('CRITICAL', 'Rider left the seat! Immediate ignition cutoff enforced. Re-verification required.', 'HARDWARE');
    addSessionEvent('CRITICAL', 'Rider Left Seat', 'Pressure sensor trigger: rider vacated seat while motor active.');
  };

  const simulateRiderReturningAction = () => {
    sounds.playSuccess();
    setRiderSeatOccupied(true);
    setRiderFaceVerified(true);
    setStateMachineState(riderType === 'LEARNER' ? 'LEARNING_MODE' : 'NORMAL_MODE');
    setVehicleMode(riderType === 'LEARNER' ? 'LEARNING' : 'NORMAL');
    setSupervisionMatrix(prev => ({
      ...prev,
      riderSeatContinuity: 'ACTIVE',
      riderIdentityContinuity: 'ACTIVE',
      sessionIntegrity: 'ACTIVE'
    }));
    addAlert('INFO', 'Rider re-seated and biometric re-authenticated. Ready to proceed.', 'IDENTITY');
    addSessionEvent('SUCCESS', 'Rider Returned', 'Seat pressure restored and continuous face verification passed.');
  };

  const simulateEscortLeavingAction = () => {
    sounds.playCriticalAlert();
    setPillionSeatOccupied(false);
    setVehicleMode('SAFE');
    setStateMachineState('SAFE_MODE');
    setCurrentSpeedKmH(5.0); // Crawl mode
    setSupervisionMatrix(prev => ({
      ...prev,
      escortSeatContinuity: 'SUPERVISION LOST',
      escortIdentityContinuity: 'SUPERVISION LOST',
      sessionIntegrity: 'SUPERVISION LOST'
    }));
    addAlert('CRITICAL', 'Supervision Lost: Escort vacated pillion seat! Safe Mode triggered with speed cutoff.', 'SUPERVISION');
    addSessionEvent('CRITICAL', 'Supervision Lost', 'Escort presence sensor unlatched during active learner session.');
  };

  const simulateEscortReplacementAction = () => {
    sounds.playWarning();
    setEscort(MOCK_ESCORTS[1]); // Arun Verma
    setEscortFaceVerified(false);
    setStateMachineState('REAUTH_REQUIRED');
    setSupervisionMatrix(prev => ({
      ...prev,
      escortIdentityContinuity: 'RE-VERIFICATION REQUIRED',
      sessionIntegrity: 'RE-VERIFICATION REQUIRED'
    }));
    addAlert('WARNING', 'New pillion passenger detected on escort seat. Biometric re-verification required.', 'SUPERVISION');
    addSessionEvent('WARNING', 'Escort Change Detected', 'Identity change detected on pillion seat; awaiting face match.');
  };

  const simulateIdentityMismatchAction = () => {
    sounds.playCriticalAlert();
    setRiderFaceVerified(false);
    setVehicleMode('LOCKED');
    setMotorStatus('STOPPED');
    setCurrentSpeedKmH(0);
    setStateMachineState('ACCESS_DENIED');
    setSupervisionMatrix(prev => ({
      ...prev,
      riderIdentityContinuity: 'SUPERVISION LOST',
      sessionIntegrity: 'SUPERVISION LOST'
    }));
    addAlert('CRITICAL', 'Identity Mismatch: Facial biometrics do not match registered cardholder! Ignition disabled.', 'IDENTITY');
    addSessionEvent('CRITICAL', 'Face Match Failed', 'Live camera stream face comparison failed threshold (< 45%). Access denied.');
  };

  const simulateInvalidLicenceAction = () => {
    sounds.playCriticalAlert();
    setRiderLicenceValid(false);
    setVehicleMode('LOCKED');
    setMotorStatus('STOPPED');
    setCurrentSpeedKmH(0);
    setStateMachineState('ACCESS_DENIED');
    addAlert('CRITICAL', 'Licence Invalid: Simulated credential check failed (Suspended or Expired). Access denied.', 'LICENCE');
    addSessionEvent('CRITICAL', 'Invalid Licence', 'Credential verification returned status: EXPIRED/REVOKED.');
  };

  const simulateDistanceLimitReachedAction = () => {
    sounds.playCriticalAlert();
    setDistanceUsedKm(3.0);
    setVehicleMode('SAFE');
    setStateMachineState('QUOTA_REACHED');
    setCurrentSpeedKmH(0);
    setMotorStatus('STOPPED');
    addAlert('CRITICAL', 'Prototype Distance Limit Reached (3.0 km)! Engine power cut to enforce boundary quota.', 'DISTANCE');
    addSessionEvent('CRITICAL', 'Distance Quota Exceeded', 'Accumulated odometer reached prototype test limit.');
  };

  const simulateGrantTempAccessAction = () => {
    grantTemporaryAccess(rider.id, 24);
    setRiderAuthType('TEMPORARY');
  };

  const simulateRevokeTempAccessAction = () => {
    revokeAccess(rider.id);
    setRiderAuthType('NONE');
    setVehicleMode('LOCKED');
    setMotorStatus('STOPPED');
    setStateMachineState('ACCESS_DENIED');
  };

  const resetDemoAction = () => {
    sounds.playSuccess();
    setRider(MOCK_USERS[2]); // Ravi
    setRiderType('LEARNER');
    setRiderLicenceValid(true);
    setRiderFaceVerified(true);
    setRiderAuthType('PERMANENT');
    setRiderSeatOccupied(true);

    setEscort(MOCK_ESCORTS[0]); // Priya
    setEscortLicenceValid(true);
    setEscortFaceVerified(true);
    setEscortEligible(true);
    setPillionSeatOccupied(true);

    setVehicleMode('LEARNING');
    setMotorStatus('RUNNING');
    setSpeedMode('RESTRICTED');
    setCurrentSpeedKmH(18.5);
    setPwmDutyPercent(45);
    setDistanceUsedKm(1.2);
    setDistanceLimitKm(3.0);

    setStateMachineState('LEARNING_MODE');
    setSupervisionMatrix(INITIAL_SUPERVISION);
    setAlerts(INITIAL_ALERTS);

    addAlert('INFO', 'Demo simulation state reset to standard Learner + Escort configuration.', 'SYSTEM');
    addSessionEvent('INFO', 'Demo Reset', 'Evaluator reset vehicle prototype to initial valid baseline.');
  };

  return (
    <SmartRiderContext.Provider
      value={{
        theme,
        toggleTheme,
        scanlinesEnabled,
        toggleScanlines,
        soundEnabled,
        toggleSound,

        activeTab,
        setActiveTab,
        activeRole,
        setActiveRole,
        demoMode,
        setDemoMode,

        connectivity,
        setConnectivity,

        stateMachineState,
        setStateMachineState,

        rider,
        setRider,
        riderLicenceValid,
        setRiderLicenceValid,
        riderFaceVerified,
        setRiderFaceVerified,
        riderAuthType,
        setRiderAuthType,
        riderType,
        setRiderType,
        riderSeatOccupied,
        setRiderSeatOccupied,

        escort,
        setEscort,
        escortLicenceValid,
        setEscortLicenceValid,
        escortFaceVerified,
        setEscortFaceVerified,
        escortEligible,
        setEscortEligible,
        pillionSeatOccupied,
        setPillionSeatOccupied,
        supervisionStatus,

        vehicleId,
        vehicleMode,
        setVehicleMode,
        motorStatus,
        setMotorStatus,
        speedMode,
        setSpeedMode,
        currentSpeedKmH,
        setCurrentSpeedKmH,
        pwmDutyPercent,
        setPwmDutyPercent,

        distanceUsedKm,
        setDistanceUsedKm,
        distanceLimitKm,
        setDistanceLimitKm,

        supervisionMatrix,
        setSupervisionMatrix,

        alerts,
        addAlert,
        acknowledgeAlert,
        clearAlerts,

        users,
        addUser,
        removeUser,
        grantTemporaryAccess,
        revokeAccess,

        sessionHistory,
        currentSessionEvents,
        addSessionEvent,

        policy,
        updatePolicy,
        resetPolicy,

        // Demo Actions
        verifyRiderAction,
        verifyEscortAction,
        startVehicleAction,
        stopVehicleAction,
        simulateRiderLeavingAction,
        simulateRiderReturningAction,
        simulateEscortLeavingAction,
        simulateEscortReplacementAction,
        simulateIdentityMismatchAction,
        simulateInvalidLicenceAction,
        simulateDistanceLimitReachedAction,
        simulateGrantTempAccessAction,
        simulateRevokeTempAccessAction,
        resetDemoAction
      }}
    >
      {children}
    </SmartRiderContext.Provider>
  );
};

export const useSmartRider = () => {
  const context = useContext(SmartRiderContext);
  if (!context) {
    throw new Error('useSmartRider must be used within a SmartRiderProvider');
  }
  return context;
};
