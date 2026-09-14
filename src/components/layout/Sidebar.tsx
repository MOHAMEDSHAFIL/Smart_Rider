import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Sliders, 
  Terminal, 
  ShieldAlert, 
  Activity,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { clsx } from 'clsx';
import { sounds } from '../../utils/audio';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stateMachineState, demoMode, activeRole } = useSmartRider();

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Overview',
      sublabel: 'Diagnostic Grid',
      icon: LayoutDashboard
    },
    {
      id: 'users' as const,
      label: 'Authorized Users',
      sublabel: 'Access Roster',
      icon: Users,
      hidden: activeRole === 'RIDER' // simplified rider view
    },
    {
      id: 'sessions' as const,
      label: 'Sessions / History',
      sublabel: 'Audit & Timeline',
      icon: History
    },
    {
      id: 'policy' as const,
      label: 'Policy Settings',
      sublabel: 'Limits & Rules',
      icon: Sliders,
      hidden: activeRole !== 'OWNER_ADMIN' // Owner only
    },
    {
      id: 'demo' as const,
      label: 'Demo / Evaluator',
      sublabel: 'Hardware Simulation',
      icon: Terminal,
      highlight: true
    }
  ].filter(item => !item.hidden);

  const handleNav = (tab: 'overview' | 'users' | 'sessions' | 'policy' | 'demo') => {
    sounds.playClick(750);
    setActiveTab(tab);
  };

  return (
    <aside className="w-64 border-r dark:border-crt-panelBorder border-slate-200 dark:bg-[#070D0A]/90 bg-white/95 flex flex-col flex-shrink-0 transition-all z-30">
      
      {/* Brand Subtitle / Terminal Info */}
      <div className="p-4 border-b dark:border-crt-panelBorder/70 border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-crt-green dark:glow-green animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider dark:text-crt-green text-emerald-800 uppercase">
            System Terminal
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-black/20 dark:bg-black/50 px-1.5 py-0.5 rounded border border-slate-700/30">
          v2.4-PoC
        </span>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1.5 flex-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all font-mono text-xs text-left group',
                isActive
                  ? 'dark:bg-[#12231A] bg-emerald-50 dark:text-crt-green text-emerald-900 border border-crt-green/30 font-medium dark:shadow-[0_0_10px_rgba(57,255,136,0.15)]'
                  : 'dark:text-slate-400 text-slate-600 hover:dark:bg-white/5 hover:bg-slate-100 hover:dark:text-slate-200',
                item.highlight && !isActive && 'dark:border-emerald-500/20 border-emerald-200 dark:bg-emerald-950/10'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={clsx(
                    'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'dark:text-crt-green text-emerald-700' : 'text-slate-400'
                  )}
                />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-crt-muted truncate">{item.sublabel}</div>
                </div>
              </div>

              {item.highlight && (
                <span className="flex-shrink-0 ml-1 px-1.5 py-0.5 rounded bg-crt-green/20 text-crt-green text-[9px] font-bold">
                  DEMO
                </span>
              )}

              {isActive && !item.highlight && (
                <ChevronRight className="w-3.5 h-3.5 text-crt-green animate-pulse flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* State Machine Status Footer Box */}
      <div className="p-3 m-3 rounded dark:bg-[#0B1410] bg-slate-50 border dark:border-crt-panelBorder/70 border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-crt-muted flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-crt-green animate-ping" />
            FSM State:
          </span>
          <span className="text-[10px] font-mono font-bold text-crt-green dark:glow-green truncate max-w-[120px]">
            {stateMachineState}
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-tight">
          Supervision and vehicle interlock state machine active.
        </div>
      </div>

    </aside>
  );
};
