import React, { useState, useEffect } from 'react';
import { Terminal, Clock, Hash, Shield, Key } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';

export const SessionCard: React.FC = () => {
  const {
    rider,
    escort,
    vehicleId,
    vehicleMode,
    motorStatus,
    stateMachineState,
    riderType
  } = useSmartRider();

  const [elapsedSeconds, setElapsedSeconds] = useState(765); // ~12m 45s simulated

  useEffect(() => {
    const timer = setInterval(() => {
      if (motorStatus === 'RUNNING') {
        setElapsedSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [motorStatus]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Panel
      title="F. Current Session"
      icon={<Terminal className="w-4 h-4" />}
      badge={
        <Badge variant={motorStatus === 'RUNNING' ? 'green' : 'amber'} size="xs">
          ACTIVE SESSION
        </Badge>
      }
    >
      <div className="space-y-3 font-mono text-xs">
        
        {/* Session ID & Timing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-0.5">
              Session ID
            </div>
            <div className="font-bold text-crt-green dark:glow-green truncate">
              SES-20260914-003
            </div>
          </div>

          <div className="p-2 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-0.5">
              Duration
            </div>
            <div className="font-bold flex items-center gap-1 dark:text-white text-slate-900">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatElapsed(elapsedSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Pairing Summary */}
        <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Vehicle Unit:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{vehicleId.split(' ')[0]}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Rider In Seat:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
              {rider.name} ({rider.id})
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Escort Assigned:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
              {riderType === 'LEARNER' ? (escort ? `${escort.name} (${escort.id})` : 'None') : 'Bypassed (Normal)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Authorization Level:</span>
            <span className="text-crt-green font-semibold">{rider.authType}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t dark:border-slate-800 border-slate-200">
            <span className="text-slate-400">FSM Interlock:</span>
            <span className="text-crt-blue font-bold">{stateMachineState}</span>
          </div>
        </div>

      </div>
    </Panel>
  );
};
