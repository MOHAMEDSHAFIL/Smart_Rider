import React from 'react';
import { SessionEvent } from '../../types';
import { CheckCircle2, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface EventTimelineProps {
  events: SessionEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const getEventIcon = (type: SessionEvent['type']) => {
    switch (type) {
      case 'CRITICAL':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-crt-green" />;
      case 'INFO':
      default:
        return <Info className="w-3.5 h-3.5 text-crt-blue" />;
    }
  };

  const getEventBorder = (type: SessionEvent['type']) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-rose-500/50 dark:bg-rose-950/20 bg-rose-50/50';
      case 'WARNING':
        return 'border-amber-500/50 dark:bg-amber-950/20 bg-amber-50/50';
      case 'SUCCESS':
        return 'border-crt-green/40 dark:bg-emerald-950/20 bg-emerald-50/50';
      case 'INFO':
      default:
        return 'border-slate-700/40 dark:bg-black/20 bg-slate-50';
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="py-4 text-center text-xs font-mono text-slate-400">
        No event telemetry packets logged for this session.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-3 py-2 border-l-2 dark:border-slate-800 border-slate-300 ml-4 my-2">
      {events.map((event, idx) => (
        <div key={event.id || idx} className="relative group">
          {/* Node Dot on Timeline */}
          <div className="absolute -left-[31px] top-1.5 p-0.5 rounded-full dark:bg-[#070D0A] bg-white border dark:border-slate-700 border-slate-300">
            {getEventIcon(event.type)}
          </div>

          {/* Event Content Box */}
          <div className={clsx('p-2.5 rounded border text-xs font-mono transition-all', getEventBorder(event.type))}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-800 dark:text-crt-textBright">
                {event.title}
              </span>
              <span className="text-[10px] text-slate-400">{event.timestamp}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              {event.description}
            </p>
            {event.details && (
              <div className="mt-1.5 text-[10px] text-slate-400 dark:text-crt-muted font-mono bg-black/20 p-1.5 rounded">
                Raw: {event.details}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
