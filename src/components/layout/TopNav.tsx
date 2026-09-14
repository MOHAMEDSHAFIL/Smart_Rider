import React from 'react';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Tv, 
  ShieldCheck, 
  User, 
  Users, 
  Sparkles,
  Server,
  Cpu,
  Camera,
  Radio,
  Database
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { ActiveRole } from '../../types';
import { Badge } from '../common/Badge';
import { clsx } from 'clsx';
import { sounds } from '../../utils/audio';

export const TopNav: React.FC = () => {
  const {
    theme,
    toggleTheme,
    scanlinesEnabled,
    toggleScanlines,
    soundEnabled,
    toggleSound,
    activeRole,
    setActiveRole,
    connectivity,
    vehicleId,
    demoMode,
    setDemoMode,
    stateMachineState,
    vehicleMode
  } = useSmartRider();

  const handleRoleChange = (role: ActiveRole) => {
    sounds.playClick(650);
    setActiveRole(role);
  };

  const modeBadgeVariant = {
    NORMAL: 'green',
    LEARNING: 'amber',
    SAFE: 'red',
    LOCKED: 'red'
  }[vehicleMode] as 'green' | 'amber' | 'red';

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors dark:bg-[#070B09]/95 bg-white/95 dark:border-crt-panelBorder border-slate-200">
      <div className="px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Section: Vehicle ID & System Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-crt-green/10 border border-crt-green/30 flex items-center justify-center text-crt-green font-mono font-bold text-xs shadow-[0_0_10px_rgba(57,255,136,0.2)]">
              SR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm tracking-wider dark:text-crt-green dark:glow-green text-emerald-800">
                  {vehicleId}
                </span>
                <Badge variant={modeBadgeVariant} size="xs" pulse={vehicleMode === 'SAFE' || vehicleMode === 'LEARNING'}>
                  {vehicleMode} MODE
                </Badge>
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-crt-muted tracking-tight hidden sm:block">
                PoC Authorization & Supervision Terminal
              </div>
            </div>
          </div>

          {/* Demo Mode indicator */}
          {demoMode && (
            <button
              onClick={() => {
                sounds.playClick(500);
                setDemoMode(!demoMode);
              }}
              title="Click to toggle Demo vs Live Mode"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-crt-green dark:border-crt-green/30 text-[11px] font-mono hover:bg-emerald-500/20 transition-all"
            >
              <Sparkles className="w-3 h-3 text-crt-green" />
              <span>DEMO MODE ACTIVE</span>
            </button>
          )}
        </div>

        {/* Center: Live Connectivity Row */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded bg-black/20 dark:bg-black/40 border dark:border-slate-800/80 border-slate-200 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <span className="text-[10px] uppercase text-slate-500 mr-1">HARDWARE:</span>
          </div>

          {/* Backend */}
          <div className="flex items-center gap-1.5" title="Central REST API Server">
            <Server className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">API</span>
            <span className={clsx("w-1.5 h-1.5 rounded-full", connectivity.backend === 'ONLINE' ? 'bg-crt-green shadow-[0_0_5px_#39FF88]' : 'bg-crt-red')} />
          </div>

          {/* ESP32 */}
          <div className="flex items-center gap-1.5" title="Vehicle Telemetry Microcontroller">
            <Cpu className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">ESP32</span>
            <span className={clsx("w-1.5 h-1.5 rounded-full", connectivity.esp32 === 'CONNECTED' ? 'bg-crt-green shadow-[0_0_5px_#39FF88]' : 'bg-crt-red')} />
          </div>

          {/* Camera */}
          <div className="flex items-center gap-1.5" title="Facial Biometric Verification Stream">
            <Camera className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">CAM</span>
            <span className={clsx("w-1.5 h-1.5 rounded-full", connectivity.camera === 'CONNECTED' ? 'bg-crt-green shadow-[0_0_5px_#39FF88]' : 'bg-crt-red')} />
          </div>

          {/* RFID */}
          <div className="flex items-center gap-1.5" title="13.56MHz Card Reader">
            <Radio className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">RFID</span>
            <span className={clsx("w-1.5 h-1.5 rounded-full", connectivity.rfid === 'READY' ? 'bg-crt-green shadow-[0_0_5px_#39FF88]' : 'bg-crt-red')} />
          </div>

          {/* Database */}
          <div className="flex items-center gap-1.5" title="Local Access DB / Cache">
            <Database className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">DB</span>
            <span className={clsx("w-1.5 h-1.5 rounded-full", connectivity.database === 'CONNECTED' ? 'bg-crt-green shadow-[0_0_5px_#39FF88]' : 'bg-crt-red')} />
          </div>
        </div>

        {/* Right Section: Role Switcher & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Active Role Selector */}
          <div className="flex items-center p-0.5 rounded border dark:border-slate-800 border-slate-200 dark:bg-black/30 bg-slate-100 text-xs font-mono">
            <button
              onClick={() => handleRoleChange('OWNER_ADMIN')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded transition-all',
                activeRole === 'OWNER_ADMIN'
                  ? 'bg-crt-green/20 text-crt-green dark:text-crt-green border border-crt-green/40 dark:shadow-[0_0_8px_rgba(57,255,136,0.3)] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              )}
              title="Administrator and Vehicle Owner Access"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Owner/Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>

            <button
              onClick={() => handleRoleChange('RIDER')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded transition-all',
                activeRole === 'RIDER'
                  ? 'bg-crt-green/20 text-crt-green dark:text-crt-green border border-crt-green/40 dark:shadow-[0_0_8px_rgba(57,255,136,0.3)] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              )}
              title="Simplified Rider HUD View"
            >
              <User className="w-3.5 h-3.5" />
              <span>Rider</span>
            </button>

            <button
              onClick={() => handleRoleChange('ESCORT')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 rounded transition-all',
                activeRole === 'ESCORT'
                  ? 'bg-crt-green/20 text-crt-green dark:text-crt-green border border-crt-green/40 dark:shadow-[0_0_8px_rgba(57,255,136,0.3)] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              )}
              title="Escort & Supervision Monitoring View"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Escort</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-700/40 hidden sm:block" />

          {/* Quick UI Toggles: Audio, Scanlines, Theme */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className={clsx(
                'p-1.5 rounded border transition-colors',
                soundEnabled
                  ? 'text-crt-green border-crt-green/30 dark:bg-crt-green/10 bg-emerald-50'
                  : 'text-slate-400 border-slate-700/50 bg-transparent'
              )}
              title={soundEnabled ? 'Mute Terminal Audio FX' : 'Enable Terminal Audio FX'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleScanlines}
              className={clsx(
                'p-1.5 rounded border transition-colors hidden sm:block',
                scanlinesEnabled
                  ? 'text-crt-green border-crt-green/30 dark:bg-crt-green/10 bg-emerald-50'
                  : 'text-slate-400 border-slate-700/50 bg-transparent'
              )}
              title={scanlinesEnabled ? 'Disable CRT Scanline Overlay' : 'Enable CRT Scanline Overlay'}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded border dark:border-crt-panelBorder border-slate-300 dark:text-crt-green text-slate-700 dark:hover:bg-crt-green/10 hover:bg-slate-100 transition-colors"
              title={theme === 'dark' ? 'Switch to Day / CRT-Light Theme' : 'Switch to Night / CRT-Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
