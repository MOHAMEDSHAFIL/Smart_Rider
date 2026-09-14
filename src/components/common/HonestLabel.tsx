import React from 'react';
import { AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { clsx } from 'clsx';

interface HonestLabelProps {
  type: 'credential' | 'policy' | 'demo' | 'telemetry';
  className?: string;
}

export const HonestLabel: React.FC<HonestLabelProps> = ({ type, className }) => {
  if (type === 'credential') {
    return (
      <div
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono tracking-tight',
          'dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-300',
          'bg-amber-50 border-amber-200 text-amber-800',
          className
        )}
      >
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Prototype Credential Simulation — Not a government licence lookup</span>
      </div>
    );
  }

  if (type === 'policy') {
    return (
      <div
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono tracking-tight',
          'dark:bg-blue-950/20 dark:border-blue-500/30 dark:text-blue-300',
          'bg-blue-50 border-blue-200 text-blue-800',
          className
        )}
      >
        <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Prototype Configurable Policy — Not a legal constraint</span>
      </div>
    );
  }

  if (type === 'demo') {
    return (
      <div
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono font-medium uppercase tracking-wider animate-pulse',
          'dark:bg-emerald-950/30 dark:border-crt-green/40 dark:text-crt-green dark:glow-green',
          'bg-emerald-50 border-emerald-300 text-emerald-800',
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-crt-green shadow-[0_0_6px_#39FF88]" />
        <span>Demo Simulation Active (Standalone Evaluation)</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono text-slate-500 border-slate-300 dark:border-slate-800 dark:text-slate-400',
        className
      )}
    >
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span>Prototype Sensor Packet</span>
    </div>
  );
};
