'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RescueCountdownProps {
  deadline: string; // ISO date string or timestamp
  compact?: boolean;
  onExpire?: () => void;
}

export default function RescueCountdown({ deadline, compact = false, onExpire }: RescueCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  // Urgency states logic:
  // > 45 mins: normal
  // 15 - 45 mins: attention (orange)
  // < 15 mins: critical (red)
  const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
  let urgency: 'normal' | 'attention' | 'critical' | 'expired' = 'normal';

  if (timeLeft.isExpired) {
    urgency = 'expired';
  } else if (totalMinutes < 15) {
    urgency = 'critical';
  } else if (totalMinutes < 45) {
    urgency = 'attention';
  }

  const formatUnit = (num: number) => String(num).padStart(2, '0');

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono tracking-tight',
          urgency === 'normal' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          urgency === 'attention' && 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          urgency === 'critical' && 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse',
          urgency === 'expired' && 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        {urgency === 'expired' ? (
          'EXPIRED'
        ) : (
          <span>
            {formatUnit(timeLeft.hours)}h {formatUnit(timeLeft.minutes)}m {formatUnit(timeLeft.seconds)}s
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-xl border shadow-sm transition-all',
        urgency === 'normal' && 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
        urgency === 'attention' && 'bg-amber-50/80 border-amber-300 text-amber-950',
        urgency === 'critical' && 'bg-rose-50 border-rose-300 text-rose-950 animate-pulse-slow',
        urgency === 'expired' && 'bg-slate-100 border-slate-300 text-slate-700'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
          {urgency === 'critical' && <Flame className="w-4 h-4 text-rose-600 animate-bounce" />}
          {urgency === 'attention' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
          {urgency === 'normal' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
          RESCUE WINDOW DEADLINE
        </span>
        <span
          className={cn(
            'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full',
            urgency === 'normal' && 'bg-emerald-200/60 text-emerald-800',
            urgency === 'attention' && 'bg-amber-200/60 text-amber-900',
            urgency === 'critical' && 'bg-rose-200/60 text-rose-900',
            urgency === 'expired' && 'bg-slate-200 text-slate-800'
          )}
        >
          {urgency} Priority
        </span>
      </div>

      {urgency === 'expired' ? (
        <div className="text-xl font-bold text-rose-700 font-mono">RESCUE WINDOW EXPIRED</div>
      ) : (
        <div className="flex items-baseline gap-2 font-mono font-black text-2xl md:text-3xl tracking-tight">
          <div className="flex flex-col items-center">
            <span>{formatUnit(timeLeft.hours)}</span>
            <span className="text-[10px] font-sans font-normal text-slate-500 uppercase">Hours</span>
          </div>
          <span className="text-slate-400">:</span>
          <div className="flex flex-col items-center">
            <span>{formatUnit(timeLeft.minutes)}</span>
            <span className="text-[10px] font-sans font-normal text-slate-500 uppercase">Mins</span>
          </div>
          <span className="text-slate-400">:</span>
          <div className="flex flex-col items-center">
            <span className="w-10 text-center">{formatUnit(timeLeft.seconds)}</span>
            <span className="text-[10px] font-sans font-normal text-slate-500 uppercase">Secs</span>
          </div>
        </div>
      )}
    </div>
  );
}
