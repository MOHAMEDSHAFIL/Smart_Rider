import React from 'react';
import { AlertCircle, Check, Trash2, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { AlertItem } from '../../types';
import { clsx } from 'clsx';
import { sounds } from '../../utils/audio';

export const AlertsCard: React.FC = () => {
  const { alerts, acknowledgeAlert, clearAlerts, activeRole } = useSmartRider();

  const getAlertIcon = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-crt-green flex-shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-crt-blue flex-shrink-0" />;
    }
  };

  const getAlertVariant = (severity: AlertItem['severity']): 'red' | 'amber' | 'green' | 'blue' => {
    switch (severity) {
      case 'CRITICAL':
        return 'red';
      case 'WARNING':
        return 'amber';
      case 'SUCCESS':
        return 'green';
      case 'INFO':
      default:
        return 'blue';
    }
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <Panel
      title="G. Real-Time Telemetry & Access Alerts"
      icon={<AlertCircle className="w-4 h-4" />}
      badge={
        unacknowledgedCount > 0 ? (
          <Badge variant="red" size="xs" pulse>
            {unacknowledgedCount} ACTIVE ALERTS
          </Badge>
        ) : (
          <Badge variant="green" size="xs" dot={false}>
            ALL NORMAL
          </Badge>
        )
      }
      actions={
        alerts.length > 0 && activeRole === 'OWNER_ADMIN' ? (
          <button
            onClick={clearAlerts}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Clear all alerts"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500 dark:text-slate-400">
            No active diagnostic or authorization alerts.
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={clsx(
                'p-2.5 rounded text-xs font-mono transition-all border flex items-start justify-between gap-3',
                alert.severity === 'CRITICAL' && 'dark:bg-rose-950/20 bg-rose-50/70 dark:border-rose-500/40 border-rose-200',
                alert.severity === 'WARNING' && 'dark:bg-amber-950/20 bg-amber-50/70 dark:border-amber-500/40 border-amber-200',
                alert.severity === 'SUCCESS' && 'dark:bg-emerald-950/20 bg-emerald-50/70 dark:border-crt-green/30 border-emerald-200',
                alert.severity === 'INFO' && 'dark:bg-cyan-950/20 bg-cyan-50/70 dark:border-cyan-500/30 border-cyan-200',
                alert.acknowledged && 'opacity-70'
              )}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {getAlertIcon(alert.severity)}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getAlertVariant(alert.severity)} size="xs" dot={false}>
                      {alert.severity}
                    </Badge>
                    <span className="text-[10px] text-slate-400">[{alert.category}]</span>
                    <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                  </div>
                  <p className="dark:text-slate-200 text-slate-800 leading-snug break-words">
                    {alert.message}
                  </p>
                </div>
              </div>

              {!alert.acknowledged && activeRole === 'OWNER_ADMIN' && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-black/20 text-slate-400 hover:text-crt-green transition-colors"
                  title="Acknowledge alert"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};
