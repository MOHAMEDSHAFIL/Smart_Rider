import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  Calendar, 
  Route, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { EventTimeline } from './EventTimeline';
import { HonestLabel } from '../common/HonestLabel';
import { sounds } from '../../utils/audio';

export const SessionsPage: React.FC = () => {
  const { sessionHistory, currentSessionEvents, rider, escort, vehicleMode, distanceUsedKm } = useSmartRider();

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>('SES-20260914-003');
  const [riderFilter, setRiderFilter] = useState<string>('ALL');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dynamic current session item with live events
  const currentLiveSession = {
    sessionId: "SES-20260914-003",
    vehicleId: "V001",
    rider,
    escort,
    startTime: "2026-09-14 11:20:45",
    mode: vehicleMode,
    status: 'ACTIVE' as const,
    distanceKm: distanceUsedKm,
    events: currentSessionEvents
  };

  const allSessions = [
    currentLiveSession,
    ...sessionHistory.filter(s => s.sessionId !== 'SES-20260914-003')
  ];

  const filteredSessions = allSessions.filter(session => {
    if (riderFilter !== 'ALL' && session.rider.name !== riderFilter) return false;
    if (modeFilter !== 'ALL' && session.mode !== modeFilter) return false;
    if (statusFilter !== 'ALL' && session.status !== statusFilter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    sounds.playClick(600);
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') return <Badge variant="green" size="xs" pulse>ACTIVE LIVE</Badge>;
    if (status === 'COMPLETED') return <Badge variant="blue" size="xs">COMPLETED</Badge>;
    if (status === 'TERMINATED') return <Badge variant="amber" size="xs">TERMINATED</Badge>;
    return <Badge variant="red" size="xs">DENIED</Badge>;
  };

  const getModeBadge = (mode: string) => {
    if (mode === 'NORMAL') return <Badge variant="green" size="xs">NORMAL</Badge>;
    if (mode === 'LEARNING') return <Badge variant="amber" size="xs">LEARNING</Badge>;
    if (mode === 'SAFE') return <Badge variant="red" size="xs">SAFE MODE</Badge>;
    return <Badge variant="red" size="xs">LOCKED</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* Filter Bar */}
      <div className="p-4 rounded-lg dark:bg-[#0C1511] bg-white panel-border flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs flex-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px]">Filters:</span>
          </div>

          {/* Rider Filter */}
          <select
            value={riderFilter}
            onChange={e => setRiderFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-black/30 border dark:border-slate-800 border-slate-300 dark:text-slate-200 text-slate-800 focus:outline-none focus:border-crt-green"
          >
            <option value="ALL">All Riders</option>
            <option value="Ravi Kumar">Ravi Kumar</option>
            <option value="Anita Sharma">Anita Sharma</option>
            <option value="Karan Johar">Karan Johar</option>
          </select>

          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-black/30 border dark:border-slate-800 border-slate-300 dark:text-slate-200 text-slate-800 focus:outline-none focus:border-crt-green"
          >
            <option value="ALL">All Modes</option>
            <option value="LEARNING">Learning Mode</option>
            <option value="NORMAL">Normal Mode</option>
            <option value="LOCKED">Locked</option>
            <option value="SAFE">Safe Mode</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-black/30 border dark:border-slate-800 border-slate-300 dark:text-slate-200 text-slate-800 focus:outline-none focus:border-crt-green"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DENIED">Denied</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong>{filteredSessions.length}</strong> recorded sessions
        </div>
      </div>

      {/* History Table Panel */}
      <Panel
        title="Vehicle Authorization & Supervision Audit Trail"
        icon={<History className="w-4 h-4" />}
        footer={<HonestLabel type="policy" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider dark:bg-[#070D0A] bg-slate-50">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Escort</th>
                <th className="py-3 px-4">Vehicle Mode</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/60 divide-slate-100">
              {filteredSessions.map(session => {
                const isExpanded = expandedSessionId === session.sessionId;

                return (
                  <React.Fragment key={session.sessionId}>
                    <tr
                      onClick={() => toggleExpand(session.sessionId)}
                      className="cursor-pointer hover:dark:bg-white/5 hover:bg-slate-50 transition-colors"
                    >
                      {/* Chevron Toggle */}
                      <td className="py-3 px-4 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-crt-green" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </td>

                      {/* Session ID */}
                      <td className="py-3 px-4 font-bold dark:text-crt-green text-emerald-800">
                        {session.sessionId}
                      </td>

                      {/* Rider */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {session.rider.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {session.rider.id} ({session.rider.riderType})
                        </div>
                      </td>

                      {/* Escort */}
                      <td className="py-3 px-4">
                        {session.escort ? (
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {session.escort.name}
                            </div>
                            <div className="text-[10px] text-amber-500">
                              Escort ({session.escort.id})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">None (Solo)</span>
                        )}
                      </td>

                      {/* Mode */}
                      <td className="py-3 px-4">
                        {getModeBadge(session.mode)}
                      </td>

                      {/* Start Time */}
                      <td className="py-3 px-4 text-slate-400">
                        {session.startTime}
                      </td>

                      {/* Distance */}
                      <td className="py-3 px-4 font-bold">
                        {session.distanceKm.toFixed(1)} km
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(session.status)}
                      </td>
                    </tr>

                    {/* Expandable Event Timeline Row */}
                    {isExpanded && (
                      <tr className="dark:bg-[#08100C]/80 bg-slate-50/80">
                        <td colSpan={8} className="p-4 border-t dark:border-slate-800 border-slate-200">
                          <div className="max-w-4xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold uppercase text-slate-400 dark:text-crt-muted flex items-center gap-2">
                                <span>Diagnostic Event Log Timeline</span>
                                <span className="text-[10px] text-crt-green">({session.events?.length || 0} events)</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                Click row again to collapse
                              </span>
                            </div>
                            <EventTimeline events={session.events} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

    </div>
  );
};
