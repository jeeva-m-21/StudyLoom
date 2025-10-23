'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';

const STORAGE_KEY = 'pomodoro_state_v1';

type Phase = 'work' | 'short_break' | 'long_break';

const DEFAULTS = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
  longBreakInterval: 4
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function PomodoroPage() {
  const [phase, setPhase] = useState<Phase>('work');
  const [remaining, setRemaining] = useState<number>(DEFAULTS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Load saved state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.phase) setPhase(parsed.phase);
        if (typeof parsed?.remaining === 'number')
          setRemaining(parsed.remaining);
        if (typeof parsed?.isRunning === 'boolean')
          setIsRunning(parsed.isRunning);
        if (typeof parsed?.completedCycles === 'number')
          setCompletedCycles(parsed.completedCycles);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Persist state
  useEffect(() => {
    const payload = { phase, remaining, isRunning, completedCycles };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [phase, remaining, isRunning, completedCycles]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            // finish phase
            handlePhaseComplete();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  function nextPhase(current: Phase, cycles: number): Phase {
    if (current === 'work') {
      // decide between short and long break
      if ((cycles + 1) % DEFAULTS.longBreakInterval === 0) return 'long_break';
      return 'short_break';
    }
    return 'work';
  }

  function handlePhaseComplete() {
    setIsRunning(false);
    setCompletedCycles((c) => {
      const nextCycles = phase === 'work' ? c + 1 : c;
      const np = nextPhase(phase, c);
      setPhase(np);
      setRemaining(DEFAULTS[np]);
      return nextCycles;
    });
  }

  function handleStartPause() {
    setIsRunning((s) => !s);
  }

  function handleReset() {
    setIsRunning(false);
    setPhase('work');
    setRemaining(DEFAULTS.work);
    setCompletedCycles(0);
  }

  const totalForPhase = DEFAULTS[phase];
  const progress =
    Math.round(((totalForPhase - remaining) / totalForPhase) * 100) || 0;

  const PhaseLabel: Record<Phase, string> = {
    work: 'Focus',
    short_break: 'Short Break',
    long_break: 'Long Break'
  };

  const Icon = phase === 'work' ? Icons.pizza : Icons.sun;

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-full p-2'>
              <Icon className='text-primary size-5' />
            </div>
            <div>
              <CardTitle>{PhaseLabel[phase]}</CardTitle>
              <CardDescription>
                {phase === 'work'
                  ? 'Stay focused — no distractions.'
                  : 'Take a breather and relax.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='flex flex-col items-center gap-4'>
            <div className='font-mono text-5xl'>{formatTime(remaining)}</div>
            <div className='w-full'>
              <Progress value={progress} />
            </div>
            <div className='text-muted-foreground flex gap-2 text-sm'>
              <div>Cycles: {completedCycles}</div>
              <div className='mx-2'>•</div>
              <div>Phase length: {Math.round(totalForPhase / 60)}m</div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className='flex w-full items-center justify-between'>
            <div className='flex gap-2'>
              <Button variant='ghost' onClick={() => setPhase('work')}>
                Work
              </Button>
              <Button variant='ghost' onClick={() => setPhase('short_break')}>
                Short
              </Button>
              <Button variant='ghost' onClick={() => setPhase('long_break')}>
                Long
              </Button>
            </div>

            <div className='flex items-center gap-2'>
              <Button onClick={handleStartPause}>
                {isRunning ? (
                  <>
                    <Icons.chevronLeft className='size-4' /> Pause
                  </>
                ) : (
                  <>
                    <Icons.arrowRight className='size-4' /> Start
                  </>
                )}
              </Button>
              <Button variant='outline' onClick={handleReset}>
                <Icons.close className='size-4' /> Reset
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
