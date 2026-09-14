import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'muted' | 'outline';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  className?: string;
  dot?: boolean;
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'sm',
  pulse = false,
  className,
  dot = true,
  glow = true
}) => {
  const variantStyles = {
    green: clsx(
      'bg-emerald-950/40 text-crt-green border-crt-green/40 dark:border-crt-green/30',
      'dark:bg-[#0E291B]',
      'day:bg-day-greenBg day:text-day-green day:border-emerald-200',
      glow && 'dark:glow-green'
    ),
    amber: clsx(
      'bg-amber-950/40 text-crt-amber border-crt-amber/40 dark:border-crt-amber/30',
      'dark:bg-[#2C1D08]',
      'day:bg-day-amberBg day:text-day-amber day:border-amber-200',
      glow && 'dark:glow-amber'
    ),
    red: clsx(
      'bg-rose-950/40 text-crt-red border-crt-red/40 dark:border-crt-red/30',
      'dark:bg-[#2E1111]',
      'day:bg-day-redBg day:text-day-red day:border-rose-200',
      glow && 'dark:glow-red'
    ),
    blue: clsx(
      'bg-cyan-950/40 text-crt-blue border-crt-blue/40 dark:border-crt-blue/30',
      'dark:bg-[#0F202E]',
      'day:bg-day-blueBg day:text-day-blue day:border-blue-200',
      glow && 'dark:glow-blue'
    ),
    muted: clsx(
      'bg-slate-900/50 text-crt-muted border-slate-700/40',
      'dark:bg-[#141A17] dark:text-[#7A9386]',
      'day:bg-slate-100 day:text-slate-600 day:border-slate-200'
    ),
    outline: clsx(
      'bg-transparent text-crt-text border-slate-700/60',
      'day:text-slate-700 day:border-slate-300'
    )
  };

  const dotColors = {
    green: 'bg-crt-green dark:shadow-[0_0_6px_#39FF88]',
    amber: 'bg-crt-amber dark:shadow-[0_0_6px_#FFB020]',
    red: 'bg-crt-red dark:shadow-[0_0_8px_#FF3B3B]',
    blue: 'bg-crt-blue dark:shadow-[0_0_6px_#5FA8D3]',
    muted: 'bg-slate-400',
    outline: 'bg-slate-400'
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 font-mono tracking-wider',
    sm: 'text-xs px-2.5 py-1 font-mono tracking-wider',
    md: 'text-sm px-3 py-1.5 font-mono font-medium',
    lg: 'text-base px-4 py-2 font-mono font-semibold'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-sm border uppercase transition-all duration-150 select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'inline-block h-1.5 w-1.5 rounded-full',
            dotColors[variant],
            pulse && 'animate-pulse'
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
