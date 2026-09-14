import React from 'react';
import { 
  Terminal, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Square, 
  UserCheck, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  Gauge, 
  Route, 
  Key, 
  Power,
  CheckCircle2,
  XCircle,
  Cpu,
  CornerDownRight
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { HonestLabel } from '../common/HonestLabel';
import { MOCK_USERS, MOCK_ESCORTS } from '../../services/mockData';
import { 
  RiderType, 
  VehicleAuthType, 
  VehicleMode, 
  MotorStatus, 
  SystemStateMachineState 
} from '../../types';
import { sounds } from '../../utils/audio';
import { clsx } from 'clsx';

export const DemoPage: React.FC = () => {
  const {
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

    vehicleMode,
    setVehicleMode,
    motorStatus,
    setMotorStatus,
    currentSpeedKmH,
    setCurrentSpeedKmH,
    distanceUsedKm,
    setDistanceUsedKm,
    distanceLimitKm,
    setDistanceLimitKm,

    // Actions
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
  } = useSmartRider();

  const fsmStates: SystemStateMachineState[] = [
    'IDLE',
    'CREDENTIAL_CHECK',
    'FACE_CHECK',
    'VEHICLE_AUTHORIZATION',
    'CATEGORY_CHECK',
    'ESCORT_VERIFICATION',
    'ESCORT_PRESENCE_CHECK',
    'NORMAL_MODE',
    'LEARNING_MODE',
    'SAFE_MODE',
    'REAUTH_REQUIRED',
    'ACCESS_DENIED',
    'QUOTA_REACHED'
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 rounded-lg dark:bg-[#07130C] bg-white panel-border dark:border-crt-green/40 border-emerald-300 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-crt-green animate-pulse" />
            <h2 className="text-base font-bold dark:text-crt-textBright text-slate-900 font-mono">
              Evaluator & College Presentation Command Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate every hardware sensor, RFID card event, camera match, and supervisor condition with instant real-time UI sync.
          </p>
        </div>

        <button
          onClick={resetDemoAction}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-crt-green hover:bg-emerald-400 text-crt-dark font-mono font-bold text-xs shadow-[0_0_12px_rgba(57,255,136,0.3)] transition-all flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo to Default State</span>
        </button>
      </div>

      {/* State Machine Visualizer Bar */}
      <Panel
        title="Finite State Machine (FSM) Active Execution Flow"
        icon={<Cpu className="w-4 h-4" />}
        footer={
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Click any state below to manually force transition the system:</span>
            <span className="text-crt-green font-bold">Active: {stateMachineState}</span>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2 py-2">
          {fsmStates.map(st => {
            const isActive = stateMachineState === st;
            const isDenied = st === 'ACCESS_DENIED' || st === 'QUOTA_REACHED';
            const isSafe = st === 'SAFE_MODE' || st === 'REAUTH_REQUIRED';
            const isSuccess = st === 'NORMAL_MODE' || st === 'LEARNING_MODE';

            return (
              <button
                key={st}
                onClick={() => {
                  sounds.playClick(700);
                  setStateMachineState(st);
                  if (st === 'NORMAL_MODE') setVehicleMode('NORMAL');
                  if (st === 'LEARNING_MODE') setVehicleMode('LEARNING');
                  if (st === 'SAFE_MODE') setVehicleMode('SAFE');
                  if (st === 'ACCESS_DENIED') setVehicleMode('LOCKED');
                }}
                className={clsx(
                  'px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1.5',
                  isActive
                    ? isDenied
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-[0_0_10px_#FF3B3B] font-bold'
                      : isSafe
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_0_10px_#FFB020] font-bold'
                      : 'bg-emerald-950/80 text-crt-green border-crt-green shadow-[0_0_12px_#39FF88] font-bold'
                    : 'dark:bg-black/30 bg-slate-100 text-slate-400 dark:border-slate-800 border-slate-200 hover:dark:border-slate-600'
                )}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                <span>{st.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* 1-Click Simulation Scenario Presets (The "Presentation Magic Buttons") */}
      <Panel
        title="1-Click Evaluation Scenarios (Demonstration Triggers)"
        icon={<Terminal className="w-4 h-4" />}
        variant="default"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono text-xs">
          
          {/* S1: Verify Rider */}
          <button
            onClick={verifyRiderAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-emerald-500/30 border-emerald-200 hover:dark:border-crt-green hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center justify-between text-crt-green mb-1">
              <UserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-slate-500">Preset #1</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Verify Rider</div>
            <div className="text-[10px] text-slate-400 mt-1">Authenticates card & face biometrics</div>
          </button>

          {/* S2: Verify Escort */}
          <button
            onClick={verifyEscortAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-emerald-500/30 border-emerald-200 hover:dark:border-crt-green hover:border-emerald-400 transition-all group"
          >
            <div className="flex items-center justify-between text-crt-green mb-1">
              <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-slate-500">Preset #2</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Verify Escort</div>
            <div className="text-[10px] text-slate-400 mt-1">Pairs pillion escort & activates Learning Mode</div>
          </button>

          {/* S3: Escort Leaves */}
          <button
            onClick={simulateEscortLeavingAction}
            className="p-3 rounded text-left border dark:bg-rose-950/20 bg-rose-50/50 dark:border-rose-500/40 border-rose-300 hover:dark:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between text-rose-500 mb-1">
              <AlertTriangle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-rose-400">Critical Test</span>
            </div>
            <div className="font-bold text-rose-700 dark:text-rose-300">Simulate Escort Leaving</div>
            <div className="text-[10px] text-slate-400 mt-1">Supervision lost $\rightarrow$ Triggers Safe Mode</div>
          </button>

          {/* S4: Rider Leaves Seat */}
          <button
            onClick={simulateRiderLeavingAction}
            className="p-3 rounded text-left border dark:bg-rose-950/20 bg-rose-50/50 dark:border-rose-500/40 border-rose-300 hover:dark:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between text-rose-500 mb-1">
              <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-rose-400">Cutoff Test</span>
            </div>
            <div className="font-bold text-rose-700 dark:text-rose-300">Rider Vacates Seat</div>
            <div className="text-[10px] text-slate-400 mt-1">Seat lift $\rightarrow$ Motor stops immediately</div>
          </button>

          {/* S5: Rider Returns */}
          <button
            onClick={simulateRiderReturningAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:dark:border-crt-blue transition-all group"
          >
            <div className="flex items-center justify-between text-crt-blue mb-1">
              <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-slate-500">Recovery</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Rider Returns to Seat</div>
            <div className="text-[10px] text-slate-400 mt-1">Re-authenticates face and restores drive</div>
          </button>

          {/* S6: Escort Replacement */}
          <button
            onClick={simulateEscortReplacementAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:dark:border-amber-400 transition-all group"
          >
            <div className="flex items-center justify-between text-amber-500 mb-1">
              <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-amber-500">Reauth Test</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Escort Replacement</div>
            <div className="text-[10px] text-slate-400 mt-1">Different pillion detected; demands face scan</div>
          </button>

          {/* S7: Biometric Mismatch */}
          <button
            onClick={simulateIdentityMismatchAction}
            className="p-3 rounded text-left border dark:bg-rose-950/20 bg-rose-50/50 dark:border-rose-500/40 border-rose-300 hover:dark:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between text-rose-500 mb-1">
              <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-rose-400">Security Test</span>
            </div>
            <div className="font-bold text-rose-700 dark:text-rose-300">Identity Mismatch</div>
            <div className="text-[10px] text-slate-400 mt-1">Impostor detected $\rightarrow$ Access Denied</div>
          </button>

          {/* S8: Invalid Licence */}
          <button
            onClick={simulateInvalidLicenceAction}
            className="p-3 rounded text-left border dark:bg-rose-950/20 bg-rose-50/50 dark:border-rose-500/40 border-rose-300 hover:dark:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between text-rose-500 mb-1">
              <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-rose-400">Security Test</span>
            </div>
            <div className="font-bold text-rose-700 dark:text-rose-300">Invalid Licence</div>
            <div className="text-[10px] text-slate-400 mt-1">Expired credential $\rightarrow$ Interlock locked</div>
          </button>

          {/* S9: Distance Quota Exceeded */}
          <button
            onClick={simulateDistanceLimitReachedAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:dark:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between text-amber-500 mb-1">
              <Route className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-amber-500">Policy Test</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Distance Limit Hit</div>
            <div className="text-[10px] text-slate-400 mt-1">Distance 3.0/3.0 km $\rightarrow$ Motor cutoff</div>
          </button>

          {/* S10: Grant Temp Access */}
          <button
            onClick={simulateGrantTempAccessAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:dark:border-crt-green transition-all group"
          >
            <div className="flex items-center justify-between text-crt-green mb-1">
              <Key className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-crt-green">Admin</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Grant Temp Access</div>
            <div className="text-[10px] text-slate-400 mt-1">Issues 24h temporary driver permission</div>
          </button>

          {/* S11: Revoke Temp Access */}
          <button
            onClick={simulateRevokeTempAccessAction}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:dark:border-rose-400 transition-all group"
          >
            <div className="flex items-center justify-between text-rose-500 mb-1">
              <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-rose-400">Admin</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Revoke Temp Access</div>
            <div className="text-[10px] text-slate-400 mt-1">Cancels vehicle pass $\rightarrow$ Locks starter</div>
          </button>

          {/* S12: Start/Stop Motor Toggle */}
          <button
            onClick={() => {
              if (motorStatus === 'RUNNING') stopVehicleAction();
              else startVehicleAction();
            }}
            className="p-3 rounded text-left border dark:bg-black/40 bg-slate-50 dark:border-slate-800 border-slate-200 hover:dark:border-crt-green transition-all group"
          >
            <div className="flex items-center justify-between text-crt-green mb-1">
              <Power className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-slate-500">Toggle</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">Toggle Motor State</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Current: <strong className="text-crt-green">{motorStatus}</strong>
            </div>
          </button>

        </div>
      </Panel>

      {/* Granular Manual State Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
        
        {/* Panel 1: Granular Rider Controls */}
        <Panel title="Rider Hardware & Credential Controls" icon={<UserCheck className="w-4 h-4" />}>
          <div className="space-y-3">
            
            {/* Profile Dropdown */}
            <div>
              <label className="block text-slate-400 mb-1">Select Rider Profile</label>
              <select
                value={rider.id}
                onChange={e => {
                  const sel = MOCK_USERS.find(u => u.id === e.target.value);
                  if (sel) {
                    setRider(sel);
                    setRiderType(sel.riderType);
                    setRiderAuthType(sel.authType);
                    setRiderLicenceValid(sel.licenceStatus === 'VALID');
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900"
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.id} - {u.riderType})
                  </option>
                ))}
              </select>
            </div>

            {/* Licence Validity */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Licence Status</span>
              <button
                onClick={() => setRiderLicenceValid(!riderLicenceValid)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  riderLicenceValid ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {riderLicenceValid ? 'VALID' : 'INVALID'}
              </button>
            </div>

            {/* Face Match */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Face Biometrics</span>
              <button
                onClick={() => setRiderFaceVerified(!riderFaceVerified)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  riderFaceVerified ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {riderFaceVerified ? 'VERIFIED' : 'FAILED'}
              </button>
            </div>

            {/* Rider Seat */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Rider Seat Sensor</span>
              <button
                onClick={() => setRiderSeatOccupied(!riderSeatOccupied)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  riderSeatOccupied ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {riderSeatOccupied ? 'OCCUPIED' : 'VACANT'}
              </button>
            </div>

            {/* Rider Classification */}
            <div>
              <label className="block text-slate-400 mb-1">Rider Classification</label>
              <select
                value={riderType}
                onChange={e => setRiderType(e.target.value as RiderType)}
                className="w-full px-2.5 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900"
              >
                <option value="LEARNER">Learner (Needs Escort)</option>
                <option value="NORMAL">Normal (Full Licence)</option>
                <option value="INVALID">Invalid / Suspended</option>
              </select>
            </div>

          </div>
        </Panel>

        {/* Panel 2: Granular Escort Controls */}
        <Panel title="Escort Hardware & Biometric Controls" icon={<Users className="w-4 h-4" />}>
          <div className="space-y-3">
            
            {/* Profile Dropdown */}
            <div>
              <label className="block text-slate-400 mb-1">Select Escort Profile</label>
              <select
                value={escort?.id || ''}
                onChange={e => {
                  const sel = MOCK_ESCORTS.find(esc => esc.id === e.target.value);
                  if (sel) {
                    setEscort(sel);
                    setEscortLicenceValid(sel.licenceStatus === 'VALID');
                    setEscortFaceVerified(sel.faceStatus === 'VERIFIED');
                    setEscortEligible(sel.eligibility === 'ELIGIBLE');
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded bg-black/40 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900"
              >
                {MOCK_ESCORTS.map(esc => (
                  <option key={esc.id} value={esc.id}>
                    {esc.name} ({esc.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Licence Validity */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Escort Licence</span>
              <button
                onClick={() => setEscortLicenceValid(!escortLicenceValid)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  escortLicenceValid ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {escortLicenceValid ? 'VALID' : 'INVALID'}
              </button>
            </div>

            {/* Face Match */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Face Biometrics</span>
              <button
                onClick={() => setEscortFaceVerified(!escortFaceVerified)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  escortFaceVerified ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {escortFaceVerified ? 'MATCHED' : 'FAILED'}
              </button>
            </div>

            {/* Pillion Seat */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Pillion Seat Sensor</span>
              <button
                onClick={() => setPillionSeatOccupied(!pillionSeatOccupied)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  pillionSeatOccupied ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {pillionSeatOccupied ? 'SEATED' : 'VACANT'}
              </button>
            </div>

            {/* Eligibility */}
            <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800 border-slate-200">
              <span>Supervision Eligibility</span>
              <button
                onClick={() => setEscortEligible(!escortEligible)}
                className={`px-2.5 py-0.5 rounded font-bold ${
                  escortEligible ? 'bg-emerald-500/20 text-crt-green' : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {escortEligible ? 'ELIGIBLE' : 'INELIGIBLE'}
              </button>
            </div>

          </div>
        </Panel>

        {/* Panel 3: Granular Vehicle & Telemetry Sliders */}
        <Panel title="Vehicle Telemetry & Sliders" icon={<Gauge className="w-4 h-4" />}>
          <div className="space-y-4">
            
            {/* Speed Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">Simulated Speed</span>
                <span className="font-bold text-crt-green">{currentSpeedKmH.toFixed(1)} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={currentSpeedKmH}
                onChange={e => setCurrentSpeedKmH(parseFloat(e.target.value))}
                className="w-full accent-crt-green"
              />
            </div>

            {/* Distance Used Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">Distance Used</span>
                <span className="font-bold text-crt-blue">{distanceUsedKm.toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="5.0"
                step="0.1"
                value={distanceUsedKm}
                onChange={e => setDistanceUsedKm(parseFloat(e.target.value))}
                className="w-full accent-crt-blue"
              />
            </div>

            {/* Vehicle Mode Direct Picker */}
            <div>
              <label className="block text-slate-400 mb-1">Force Vehicle Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {(['NORMAL', 'LEARNING', 'SAFE', 'LOCKED'] as VehicleMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      sounds.playClick(600);
                      setVehicleMode(mode);
                    }}
                    className={`py-1 px-2 rounded font-bold text-center border ${
                      vehicleMode === mode
                        ? 'border-crt-green bg-crt-green/20 text-crt-green'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </Panel>

      </div>

    </div>
  );
};
