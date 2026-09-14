import React from 'react';
import { Route, AlertTriangle } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { HonestLabel } from '../common/HonestLabel';
import { clsx } from 'clsx';

export const DistanceCard: React.FC = () => {
  const { distanceUsedKm, distanceLimitKm } = useSmartRider();

  const remainingKm = Math.max(0, distanceLimitKm - distanceUsedKm);
  const percentage = Math.min(100, Math.round((distanceUsedKm / distanceLimitKm) * 100));

  // Determine color based on threshold
  const isNearLimit = percentage >= 75 && percentage < 100;
  const isAtLimit = percentage >= 100;

  const barColor = isAtLimit
    ? 'bg-rose-500 shadow-[0_0_12px_#FF3B3B]'
    : isNearLimit
    ? 'bg-amber-500 shadow-[0_0_12px_#FFB020]'
    : 'bg-crt-green shadow-[0_0_12px_#39FF88]';

  return (
    <Panel
      title="D. Distance Monitoring"
      icon={<Route className="w-4 h-4" />}
      footer={<HonestLabel type="policy" />}
      variant={isAtLimit ? 'red' : isNearLimit ? 'amber' : 'default'}
    >
      <div className="space-y-4">
        {/* Progress Metrics Row */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          
          <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Used
            </div>
            <div className="text-base sm:text-lg font-bold dark:text-crt-textBright text-slate-900">
              {distanceUsedKm.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km</span>
            </div>
          </div>

          <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Remaining
            </div>
            <div
              className={clsx(
                'text-base sm:text-lg font-bold',
                isAtLimit ? 'text-rose-500' : isNearLimit ? 'text-amber-500' : 'dark:text-crt-green text-emerald-700'
              )}
            >
              {remainingKm.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km</span>
            </div>
          </div>

          <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              Quota Limit
            </div>
            <div className="text-base sm:text-lg font-bold dark:text-slate-300 text-slate-700">
              {distanceLimitKm.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km</span>
            </div>
          </div>

        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 dark:text-crt-muted">Budget Utilization:</span>
            <span
              className={clsx(
                'font-bold',
                isAtLimit ? 'text-rose-500' : isNearLimit ? 'text-amber-500' : 'dark:text-crt-green text-emerald-700'
              )}
            >
              {percentage}%
            </span>
          </div>

          <div className="relative h-3 w-full rounded-full dark:bg-[#070D0A] bg-slate-200 overflow-hidden border dark:border-slate-800 border-slate-300">
            <div
              className={clsx('h-full transition-all duration-300 rounded-full', barColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Warning Callout if near/at limit */}
        {isAtLimit && (
          <div className="p-2 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>Prototype distance quota reached. Ignition throttle cutoff initiated.</span>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>Distance approaching prototype policy limit. Return to test perimeter.</span>
          </div>
        )}
      </div>
    </Panel>
  );
};
