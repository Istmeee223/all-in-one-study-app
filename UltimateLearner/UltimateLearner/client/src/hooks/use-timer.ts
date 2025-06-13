import { useState, useEffect, useCallback } from "react";

export type TimerType = "focus" | "break" | "long_break";

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isCompleted: boolean;
  type: TimerType;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setDuration: (minutes: number) => void;
  setType: (type: TimerType) => void;
}

const TIMER_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
  long_break: 15 * 60,
};

export function useTimer(initialType: TimerType = "focus"): [TimerState, TimerActions] {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[initialType]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [type, setType] = useState<TimerType>(initialType);

  const start = useCallback(() => {
    if (timeLeft > 0 && !isCompleted) {
      setIsRunning(true);
    }
  }, [timeLeft, isCompleted]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(TIMER_DURATIONS[type]);
  }, [type]);

  const setDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setIsRunning(false);
    setIsCompleted(false);
  }, []);

  const setTimerType = useCallback((newType: TimerType) => {
    setType(newType);
    setTimeLeft(TIMER_DURATIONS[newType]);
    setIsRunning(false);
    setIsCompleted(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            // Could trigger notification here
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const state: TimerState = {
    timeLeft,
    isRunning,
    isCompleted,
    type,
  };

  const actions: TimerActions = {
    start,
    pause,
    reset,
    setDuration,
    setType: setTimerType,
  };

  return [state, actions];
}
