import React from 'react';
import { User, Shield, CheckCircle2, XCircle, AlertTriangle, Fingerprint } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { HonestLabel } from '../common/HonestLabel';

export const RiderCard: React.FC = () => {
  const {
    rider,
    riderLicenceValid,
    riderFaceVerified,
    riderAuthType,
    riderType,
    riderSeatOccupied,
    activeRole
  } = useSmartRider();

  const getRiderTypeVariant = () => {
    if (riderType === 'NORMAL') return 'green';
    if (riderType === 'LEARNER') return 'amber';
    return 'red';
  };

  const getAuthVariant = () => {
    if (riderAuthType === 'OWNER' || riderAuthType === 'PERMANENT') return 'green';
    if (riderAuthType === 'TEMPORARY') return 'blue';
    return 'red';
  };

  return (
    <Panel
      title="A. Rider Verification"
      icon={<User className="w-4 h-4" />}
      badge={
        <Badge variant={getRiderTypeVariant()} size="xs">
          {riderType} RIDER
        </Badge>
      }
      variant={!riderLicenceValid || !riderFaceVerified ? 'red' : 'default'}
      footer={<HonestLabel type="credential" />}
    >
      <div className="space-y-4">
        {/* Rider Profile Row */}
        <div className="flex items-center gap-3.5 pb-3 border-b dark:border-slate-800/80 border-slate-100">
          <div className="relative">
            <img
              src={rider.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
              alt={rider.name}
              className="w-12 h-12 rounded object-cover border-2 dark:border-crt-green/40 border-emerald-400 dark:shadow-[0_0_8px_rgba(57,255,136,0.3)]"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 dark:border-[#0F1612] border-white ${
                riderSeatOccupied ? 'bg-crt-green' : 'bg-crt-red'
              }`}
              title={riderSeatOccupied ? 'Seat Occupied' : 'Seat Empty'}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-semibold text-sm dark:text-white text-slate-900 truncate">
                {rider.name}
              </h4>
              <span className="font-mono text-xs text-slate-400 dark:text-crt-muted">
                ID: {rider.id}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                Lic: {rider.licenceNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Matrix */}
        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
          
          {/* Credential RFID Status */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Credential Card
            </div>
            <div className="flex items-center justify-between">
              <Badge variant={riderLicenceValid ? 'green' : 'red'} size="xs" dot={false}>
                {riderLicenceValid ? 'RFID VERIFIED' : 'INVALID / EXPIRED'}
              </Badge>
              {riderLicenceValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-crt-green" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-crt-red" />
              )}
            </div>
          </div>

          {/* Biometric Face Match */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1 flex items-center justify-between">
              <span>Face Match</span>
              <span className="text-[9px] text-crt-green">{riderFaceVerified ? '98.2%' : 'FAILED'}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant={riderFaceVerified ? 'green' : 'red'} size="xs" dot={false}>
                {riderFaceVerified ? 'VERIFIED' : 'MISMATCH'}
              </Badge>
              <Fingerprint className={`w-3.5 h-3.5 ${riderFaceVerified ? 'text-crt-green' : 'text-crt-red'}`} />
            </div>
          </div>

          {/* Vehicle Authorization */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Vehicle Authorization
            </div>
            <Badge variant={getAuthVariant()} size="xs">
              {riderAuthType}
            </Badge>
          </div>

          {/* Rider Seat Sensor */}
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Rider Seat Sensor
            </div>
            <Badge variant={riderSeatOccupied ? 'green' : 'red'} size="xs" pulse={!riderSeatOccupied}>
              {riderSeatOccupied ? 'OCCUPIED' : 'EMPTY / VACANT'}
            </Badge>
          </div>

        </div>

        {/* Status Line */}
        <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-crt-muted border-t dark:border-slate-800/50 border-slate-100">
          <span>Licence Type: <strong className="text-slate-700 dark:text-slate-300">{riderType === 'LEARNER' ? 'Learner (LL)' : 'Permanent (DL)'}</strong></span>
          <span>Access: <strong className="text-slate-700 dark:text-slate-300">{rider.status}</strong></span>
        </div>
      </div>
    </Panel>
  );
};
