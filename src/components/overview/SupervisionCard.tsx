import React from 'react';
import { ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { SupervisionIntegrityStatus } from '../../types';

export const SupervisionCard: React.FC = () => {
  const { supervisionMatrix, riderType } = useSmartRider();

  const getIntegrityVariant = (status: SupervisionIntegrityStatus) => {
    if (riderType === 'NORMAL') return 'muted';
    if (status === 'ACTIVE') return 'green';
    if (status === 'RE-VERIFICATION REQUIRED') return 'amber';
    return 'red';
  };

  const isWarning = supervisionMatrix.sessionIntegrity !== 'ACTIVE' && riderType === 'LEARNER';

  return (
    <Panel
      title="E. Supervision Integrity"
      icon={<ShieldCheck className="w-4 h-4" />}
      badge={
        <Badge
          variant={getIntegrityVariant(supervisionMatrix.sessionIntegrity)}
          size="xs"
          pulse={isWarning}
        >
          {riderType === 'NORMAL' ? 'BYPASS (NORMAL)' : `INTEGRITY: ${supervisionMatrix.sessionIntegrity}`}
        </Badge>
      }
      variant={
        riderType === 'NORMAL'
          ? 'muted'
          : supervisionMatrix.sessionIntegrity === 'SUPERVISION LOST'
          ? 'red'
          : supervisionMatrix.sessionIntegrity === 'RE-VERIFICATION REQUIRED'
          ? 'amber'
          : 'default'
      }
      footer={
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-crt-green animate-pulse" />
            <span>ESP32 Continuity Heartbeat: 20Hz</span>
          </span>
          <span>{supervisionMatrix.lastHeartbeat}</span>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Integrity Items Matrix */}
        <div className="space-y-2 font-mono text-xs">
          
          {/* Rider Identity Continuity */}
          <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <span className="text-slate-400 dark:text-slate-400">Rider Identity Continuity:</span>
            <Badge variant={getIntegrityVariant(supervisionMatrix.riderIdentityContinuity)} size="xs" dot={false}>
              {supervisionMatrix.riderIdentityContinuity}
            </Badge>
          </div>

          {/* Escort Identity Continuity */}
          <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <span className="text-slate-400 dark:text-slate-400">Escort Identity Continuity:</span>
            <Badge
              variant={riderType === 'NORMAL' ? 'muted' : getIntegrityVariant(supervisionMatrix.escortIdentityContinuity)}
              size="xs"
              dot={false}
            >
              {riderType === 'NORMAL' ? 'NOT APPLICABLE' : supervisionMatrix.escortIdentityContinuity}
            </Badge>
          </div>

          {/* Rider Seat Continuity */}
          <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <span className="text-slate-400 dark:text-slate-400">Rider Seat Presence Continuity:</span>
            <Badge variant={getIntegrityVariant(supervisionMatrix.riderSeatContinuity)} size="xs" dot={false}>
              {supervisionMatrix.riderSeatContinuity}
            </Badge>
          </div>

          {/* Escort Seat Continuity */}
          <div className="flex items-center justify-between p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <span className="text-slate-400 dark:text-slate-400">Escort Pillion Continuity:</span>
            <Badge
              variant={riderType === 'NORMAL' ? 'muted' : getIntegrityVariant(supervisionMatrix.escortSeatContinuity)}
              size="xs"
              dot={false}
            >
              {riderType === 'NORMAL' ? 'NOT APPLICABLE' : supervisionMatrix.escortSeatContinuity}
            </Badge>
          </div>

          {/* Overall Session Integrity */}
          <div className="flex items-center justify-between p-2 rounded dark:bg-black/50 bg-slate-100 border dark:border-crt-green/30 border-slate-300 font-semibold">
            <span className="dark:text-crt-textBright text-slate-800">Overall Session Integrity:</span>
            <Badge
              variant={getIntegrityVariant(supervisionMatrix.sessionIntegrity)}
              size="xs"
              pulse={isWarning}
            >
              {riderType === 'NORMAL' ? 'ACTIVE (NORMAL)' : supervisionMatrix.sessionIntegrity}
            </Badge>
          </div>

        </div>
      </div>
    </Panel>
  );
};
