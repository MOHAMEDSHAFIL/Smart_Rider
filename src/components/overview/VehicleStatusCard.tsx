import React from 'react';
import { Gauge, Power, ShieldCheck, Lock, AlertOctagon, Bike } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { clsx } from 'clsx';

export const VehicleStatusCard: React.FC = () => {
  const {
    vehicleMode,
    motorStatus,
    speedMode,
    currentSpeedKmH,
    pwmDutyPercent,
    riderSeatOccupied,
    pillionSeatOccupied,
    riderAuthType
  } = useSmartRider();

  const modeColors = {
    NORMAL: {
      bg: 'dark:bg-emerald-950/20 bg-emerald-50',
      border: 'dark:border-crt-green/40 border-emerald-300',
      text: 'dark:text-crt-green text-emerald-700 dark:glow-green',
      glow: 'dark:box-glow-green'
    },
    LEARNING: {
      bg: 'dark:bg-amber-950/20 bg-amber-50',
      border: 'dark:border-crt-amber/40 border-amber-300',
      text: 'dark:text-crt-amber text-amber-700 dark:glow-amber',
      glow: 'dark:box-glow-amber'
    },
    SAFE: {
      bg: 'dark:bg-rose-950/30 bg-rose-50',
      border: 'dark:border-crt-red/50 border-rose-300',
      text: 'dark:text-crt-red text-rose-700 dark:glow-red',
      glow: 'dark:box-glow-red'
    },
    LOCKED: {
      bg: 'dark:bg-slate-900/40 bg-slate-100',
      border: 'dark:border-slate-700 border-slate-300',
      text: 'dark:text-slate-300 text-slate-700',
      glow: ''
    }
  }[vehicleMode];

  return (
    <Panel
      title="C. Vehicle Status"
      icon={<Gauge className="w-4 h-4" />}
      badge={
        <Badge variant={motorStatus === 'RUNNING' ? 'green' : 'red'} size="xs" pulse={motorStatus === 'RUNNING'}>
          MOTOR {motorStatus}
        </Badge>
      }
    >
      <div className="space-y-4">
        {/* Large Prominent Vehicle Mode Indicator */}
        <div
          className={clsx(
            'p-4 rounded-md border text-center transition-all duration-200',
            modeColors.bg,
            modeColors.border,
            modeColors.glow
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-1">
            Current Vehicle State
          </div>
          <div className={clsx('text-2xl sm:text-3xl font-mono font-black tracking-widest', modeColors.text)}>
            {vehicleMode} MODE
          </div>
          <div className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
            {vehicleMode === 'NORMAL' && 'Full throttle enabled • Unrestricted access'}
            {vehicleMode === 'LEARNING' && 'Speed governed to 25 km/h • Supervision active'}
            {vehicleMode === 'SAFE' && 'Supervision lost / limit exceeded • Power restricted'}
            {vehicleMode === 'LOCKED' && 'Ignition starter locked • Access unverified'}
          </div>
        </div>

        {/* Live Gauges & Telemetry Row */}
        <div className="grid grid-cols-2 gap-2.5 font-mono">
          
          {/* Speed Telemetry */}
          <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="flex items-center justify-between text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              <span>Simulated Speed</span>
              <span className="text-crt-green">{speedMode}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold dark:text-crt-textBright text-slate-900">
                {currentSpeedKmH.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">km/h</span>
            </div>
          </div>

          {/* PWM Motor Output */}
          <div className="p-2.5 rounded dark:bg-black/30 bg-slate-50 border dark:border-slate-800/60 border-slate-200">
            <div className="flex items-center justify-between text-[10px] uppercase text-slate-400 dark:text-crt-muted mb-1">
              <span>Throttle PWM</span>
              <span className="text-slate-400">Output</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold dark:text-crt-textBright text-slate-900">
                {motorStatus === 'RUNNING' ? `${pwmDutyPercent}%` : '0%'}
              </span>
              <span className="text-xs text-slate-400">duty</span>
            </div>
          </div>

        </div>

        {/* Two-Wheeler Seat Schematic Diagram */}
        <div className="p-3 rounded dark:bg-black/40 bg-slate-100 border dark:border-slate-800/60 border-slate-200">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-crt-muted mb-2 flex items-center justify-between">
            <span>Seat Sensor Schematic</span>
            <span className="text-[10px] text-slate-400">Dual Zone Matrix</span>
          </div>

          <div className="flex items-center justify-around gap-2">
            
            {/* Front Seat (Rider) */}
            <div
              className={clsx(
                'flex-1 p-2 rounded text-center border text-xs font-mono transition-colors',
                riderSeatOccupied
                  ? 'dark:bg-emerald-950/40 bg-emerald-50 dark:border-crt-green/50 border-emerald-400 dark:text-crt-green text-emerald-800'
                  : 'dark:bg-rose-950/40 bg-rose-50 dark:border-rose-500/50 border-rose-300 dark:text-rose-400 text-rose-800'
              )}
            >
              <div className="text-[10px] uppercase text-slate-400 dark:text-slate-400 mb-0.5">
                Front (Rider)
              </div>
              <div className="font-bold">{riderSeatOccupied ? 'OCCUPIED' : 'VACANT'}</div>
            </div>

            {/* Middle Divider */}
            <div className="text-slate-600 dark:text-slate-600 font-mono text-xs">
              <Bike className="w-5 h-5 text-slate-400 mx-auto" />
            </div>

            {/* Rear Seat (Pillion / Escort) */}
            <div
              className={clsx(
                'flex-1 p-2 rounded text-center border text-xs font-mono transition-colors',
                pillionSeatOccupied
                  ? 'dark:bg-emerald-950/40 bg-emerald-50 dark:border-crt-green/50 border-emerald-400 dark:text-crt-green text-emerald-800'
                  : 'dark:bg-slate-900/40 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-slate-400 text-slate-600'
              )}
            >
              <div className="text-[10px] uppercase text-slate-400 dark:text-slate-400 mb-0.5">
                Rear (Pillion)
              </div>
              <div className="font-bold">{pillionSeatOccupied ? 'OCCUPIED' : 'EMPTY'}</div>
            </div>

          </div>
        </div>
      </div>
    </Panel>
  );
};
