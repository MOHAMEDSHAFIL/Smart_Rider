import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  UserPlus, 
  Key, 
  Sliders, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { RiderCard } from './RiderCard';
import { EscortCard } from './EscortCard';
import { VehicleStatusCard } from './VehicleStatusCard';
import { DistanceCard } from './DistanceCard';
import { SupervisionCard } from './SupervisionCard';
import { SessionCard } from './SessionCard';
import { AlertsCard } from './AlertsCard';
import { AddUserModal } from '../users/AddUserModal';
import { Badge } from '../common/Badge';
import { Panel } from '../common/Panel';
import { HonestLabel } from '../common/HonestLabel';
import { sounds } from '../../utils/audio';

export const OverviewPage: React.FC = () => {
  const {
    activeRole,
    motorStatus,
    startVehicleAction,
    stopVehicleAction,
    setActiveTab,
    rider,
    escort,
    vehicleMode,
    riderLicenceValid,
    riderFaceVerified,
    riderAuthType,
    riderType,
    currentSpeedKmH,
    distanceUsedKm,
    distanceLimitKm,
    supervisionStatus,
    pillionSeatOccupied,
    escortFaceVerified,
    alerts
  } = useSmartRider();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Remaining distance computation
  const remainingKm = Math.max(0, distanceLimitKm - distanceUsedKm);
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING');

  // --- RIDER SPECIFIC SIMPLIFIED VIEW ---
  if (activeRole === 'RIDER') {
    return (
      <div className="space-y-6">
        {/* Rider Top Summary Banner */}
        <div className="p-5 rounded-lg dark:bg-[#0C1510] bg-white panel-border dark:border-crt-green/40 border-emerald-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={rider.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                alt={rider.name}
                className="w-14 h-14 rounded-full border-2 border-crt-green object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold dark:text-white text-slate-900">{rider.name}</h2>
                  <Badge variant={riderType === 'LEARNER' ? 'amber' : 'green'} size="sm">
                    {riderType}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-crt-muted mt-1">
                  Licence: {rider.licenceNumber} • Auth: {riderAuthType}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400">Current Mode</div>
                <div className="text-lg font-bold text-crt-green">{vehicleMode}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400">Allowed Speed</div>
                <div className="text-lg font-bold text-crt-blue">{riderType === 'LEARNER' ? '25 km/h' : 'Unrestricted'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rider HUD Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Speed HUD */}
          <Panel title="Live Speedometer" icon={<Gauge className="w-4 h-4" />}>
            <div className="py-6 text-center">
              <div className="text-5xl font-mono font-black text-crt-green dark:glow-green">
                {currentSpeedKmH.toFixed(1)}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 uppercase">km / hour</div>
              <div className="mt-4 inline-block px-3 py-1 rounded bg-black/20 text-xs font-mono text-slate-400 border border-slate-700">
                Limit: {riderType === 'LEARNER' ? '25.0 km/h (Gov)' : 'Open Road'}
              </div>
            </div>
          </Panel>

          {/* Distance Remaining HUD */}
          <Panel title="Distance Quota" icon={<Gauge className="w-4 h-4" />} footer={<HonestLabel type="policy" />}>
            <div className="py-6 text-center">
              <div className="text-5xl font-mono font-black text-crt-blue dark:glow-blue">
                {remainingKm.toFixed(1)}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 uppercase">km remaining</div>
              <div className="mt-4 text-xs font-mono text-slate-400">
                Used: {distanceUsedKm.toFixed(1)} km / Budget: {distanceLimitKm.toFixed(1)} km
              </div>
            </div>
          </Panel>

          {/* Escort Supervision status (if learner) */}
          <Panel title="Supervision Status" icon={<Eye className="w-4 h-4" />}>
            <div className="py-6 text-center space-y-3">
              {riderType === 'LEARNER' ? (
                <>
                  <Badge variant={supervisionStatus === 'ACTIVE' ? 'green' : 'red'} size="lg" pulse={supervisionStatus !== 'ACTIVE'}>
                    SUPERVISION {supervisionStatus}
                  </Badge>
                  <p className="text-xs font-mono text-slate-400">
                    Escort: {escort ? `${escort.name} (${pillionSeatOccupied ? 'Seated' : 'Not Detected'})` : 'No Escort Paired'}
                  </p>
                </>
              ) : (
                <>
                  <Badge variant="green" size="lg" dot={false}>
                    NOT REQUIRED
                  </Badge>
                  <p className="text-xs font-mono text-slate-400">
                    Full Licence Holder — Solo Driving Permitted
                  </p>
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* Critical Warnings for Rider */}
        {criticalAlerts.length > 0 && (
          <Panel title="Safety Notices & Warnings" icon={<AlertCircle className="w-4 h-4" />} variant="amber">
            <div className="space-y-2">
              {criticalAlerts.map(alert => (
                <div key={alert.id} className="p-3 rounded dark:bg-amber-950/20 bg-amber-50 border border-amber-400/40 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    );
  }

  // --- ESCORT SPECIFIC VIEW ---
  if (activeRole === 'ESCORT') {
    return (
      <div className="space-y-6">
        {/* Escort Header Banner */}
        <div className="p-5 rounded-lg dark:bg-[#0E1712] bg-white panel-border dark:border-crt-amber/40 border-amber-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={escort?.avatarUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"}
                alt={escort?.name || 'Escort'}
                className="w-14 h-14 rounded-full border-2 border-crt-amber object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold dark:text-white text-slate-900">{escort?.name || 'Supervisor'}</h2>
                  <Badge variant="amber" size="sm">
                    VERIFIED ESCORT
                  </Badge>
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-crt-muted mt-1">
                  Licence: {escort?.licenceNumber} • Pillion: {pillionSeatOccupied ? 'Present' : 'Absent'}
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] uppercase text-slate-400">Paired Learner</div>
              <div className="text-lg font-bold text-crt-green">{rider.name} ({rider.id})</div>
            </div>
          </div>
        </div>

        {/* Escort Supervision Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SupervisionCard />
          <VehicleStatusCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EscortCard />
          <AlertsCard />
        </div>
      </div>
    );
  }

  // --- OWNER / ADMIN VIEW (Full Diagnostic Grid + Action Toolbar) ---
  return (
    <div className="space-y-6">
      
      {/* Admin Action Bar */}
      <div className="p-3.5 rounded-lg dark:bg-[#0A120E] bg-white panel-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-crt-green animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-crt-textBright">
            Admin Vehicle Controls:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Motor Toggle */}
          {motorStatus === 'STOPPED' ? (
            <button
              onClick={() => {
                sounds.playSuccess();
                startVehicleAction();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold shadow-[0_0_10px_rgba(57,255,136,0.3)] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Prototype</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sounds.playWarning();
                stopVehicleAction();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold shadow-[0_0_10px_rgba(255,59,59,0.3)] transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Prototype</span>
            </button>
          )}

          {/* Add Permanent User */}
          <button
            onClick={() => {
              sounds.playClick(600);
              setIsAddUserOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded dark:bg-black/40 bg-slate-100 dark:hover:bg-crt-green/10 hover:bg-slate-200 border dark:border-crt-green/30 border-slate-300 text-xs font-mono dark:text-crt-green text-slate-800 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Permanent User</span>
          </button>

          {/* Configure Limits */}
          <button
            onClick={() => {
              sounds.playClick(600);
              setActiveTab('policy');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded dark:bg-black/40 bg-slate-100 dark:hover:bg-crt-blue/10 hover:bg-slate-200 border dark:border-slate-700 border-slate-300 text-xs font-mono dark:text-crt-blue text-slate-800 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure Policy</span>
          </button>

          {/* Open Demo Mode */}
          <button
            onClick={() => {
              sounds.playClick(700);
              setActiveTab('demo');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded dark:bg-emerald-950/40 bg-emerald-50 border border-crt-green/40 dark:text-crt-green text-emerald-800 text-xs font-mono font-bold hover:dark:bg-emerald-900/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-crt-green" />
            <span>Open Demo Mode</span>
          </button>
        </div>
      </div>

      {/* Grid Layout Cards A, B, C, D, E, F, G */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        
        {/* Card A: Rider Verification */}
        <RiderCard />

        {/* Card B: Escort Verification */}
        <EscortCard />

        {/* Card C: Vehicle Status */}
        <VehicleStatusCard />

        {/* Card D: Distance Monitoring */}
        <DistanceCard />

        {/* Card E: Supervision Integrity */}
        <SupervisionCard />

        {/* Card F: Current Session */}
        <SessionCard />

      </div>

      {/* Card G: Alerts Log (Full Width on bottom) */}
      <AlertsCard />

      {/* Add User Modal */}
      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />

    </div>
  );
};
