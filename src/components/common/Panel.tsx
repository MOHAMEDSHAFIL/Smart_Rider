import React from 'react';
import { clsx } from 'clsx';

interface PanelProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  variant?: 'default' | 'amber' | 'red' | 'blue' | 'muted';
  footer?: React.ReactNode;
  disabled?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  icon,
  badge,
  actions,
  children,
  className,
  headerClassName,
  bodyClassName,
  variant = 'default',
  footer,
  disabled = false
}) => {
  const variantBorder = {
    default: 'dark:border-crt-panelBorder dark:hover:border-crt-green/30 border-slate-200 hover:border-slate-300',
    amber: 'dark:border-amber-500/40 border-amber-300 dark:box-glow-amber',
    red: 'dark:border-red-500/40 border-red-300 dark:box-glow-red',
    blue: 'dark:border-blue-500/40 border-blue-300 dark:box-glow-blue',
    muted: 'dark:border-slate-800 border-slate-200'
  };

  return (
    <div
      className={clsx(
        'relative rounded-md transition-all duration-200 flex flex-col',
        'dark:bg-crt-panel/95 bg-white backdrop-blur-sm',
        'panel-border shadow-sm',
        variantBorder[variant],
        disabled && 'opacity-40 grayscale pointer-events-none',
        className
      )}
    >
      {/* Engineering Corner Accents (CRT Dark only) */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-crt-green/40 pointer-events-none hidden dark:block" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-crt-green/40 pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-crt-green/40 pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-crt-green/40 pointer-events-none hidden dark:block" />

      {/* Header */}
      {(title || icon || badge || actions) && (
        <div
          className={clsx(
            'flex items-center justify-between px-4 py-3 border-b',
            'dark:border-crt-panelBorder/70 dark:bg-[#0B110E]',
            'border-slate-100 bg-slate-50/70',
            headerClassName
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="text-crt-green dark:glow-green text-sm flex-shrink-0">{icon}</span>}
            {title && (
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-crt-textBright truncate">
                {title}
              </h3>
            )}
            {badge}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}

      {/* Body */}
      <div className={clsx('p-4 flex-1', bodyClassName)}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-2.5 border-t dark:border-crt-panelBorder/50 border-slate-100 dark:bg-[#0A0F0D] bg-slate-50 text-xs font-mono">
          {footer}
        </div>
      )}
    </div>
  );
};
