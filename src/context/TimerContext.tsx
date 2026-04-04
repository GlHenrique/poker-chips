/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_MINUTES = 10;
const DEFAULT_SECONDS = 0;

/** File at `public/alarm-clock.mp3` — served at `/alarm-clock.mp3`. */
const ALARM_CLOCK_SRC = "/alarm-clock.mp3";

/** More noticeable pattern; only works in browsers that expose `navigator.vibrate` (e.g. Chrome on Android). Safari on iPhone does not support vibration on the web. */
function buzzAlarmEnd(): void {
  if (typeof navigator === "undefined") return;
  const v = navigator.vibrate;
  if (typeof v !== "function") return;
  try {
    v(0);
    v([320, 110, 320, 110, 320]);
  } catch {
    /* ignore */
  }
}

function clampSeconds(sec: number): number {
  if (!Number.isFinite(sec)) return 0;
  return Math.min(59, Math.max(0, Math.floor(sec)));
}

function durationToTotalSeconds(minutes: number, seconds: number): number {
  return Math.max(0, Math.round(minutes * 60) + clampSeconds(seconds));
}

/**
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS or localhost).
 * On `http://192.168.x.x` (phone on Wi‑Fi) it fails — we use a fallback.
 */
function createSessionId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    try {
      return c.randomUUID();
    } catch {
      /* continue to fallback */
    }
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export type TimerSession = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
};

type TimerPhase = "idle" | "running" | "paused";

const STORAGE_KEY = "poker-chips-timer-state";
const STORAGE_VERSION = 1 as const;

type PersistedTimerStateV1 = {
  v: typeof STORAGE_VERSION;
  sessions: TimerSession[];
  activeSessionId: string | null;
  phase: TimerPhase;
  minutes: number;
  seconds: number;
  remainingSeconds: number;
  /** `Date.now()` when `remainingSeconds` was saved; only meaningful when `phase === "running"`. */
  runningWallMs: number | null;
};

type HydratedTimerBootstrap = {
  minutes: number;
  seconds: number;
  remainingSeconds: number;
  phase: TimerPhase;
  sessions: TimerSession[];
  activeSessionId: string | null;
  showNaturalEndMessage: boolean;
};

function isTimerSessionRow(x: unknown): x is TimerSession {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.startedAt === "string" &&
    (o.finishedAt === null || typeof o.finishedAt === "string")
  );
}

function parsePersistedTimerState(raw: string): PersistedTimerStateV1 | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const o = data as Record<string, unknown>;
    if (o.v !== STORAGE_VERSION) return null;
    if (!Array.isArray(o.sessions) || !o.sessions.every(isTimerSessionRow))
      return null;
    if (typeof o.activeSessionId !== "string" && o.activeSessionId !== null)
      return null;
    if (o.phase !== "idle" && o.phase !== "running" && o.phase !== "paused")
      return null;
    if (
      typeof o.minutes !== "number" ||
      typeof o.seconds !== "number" ||
      typeof o.remainingSeconds !== "number"
    ) {
      return null;
    }
    if (typeof o.runningWallMs !== "number" && o.runningWallMs !== null)
      return null;
    return o as PersistedTimerStateV1;
  } catch {
    return null;
  }
}

function readPersistedTimerState(): PersistedTimerStateV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parsePersistedTimerState(raw);
  } catch {
    return null;
  }
}

function writePersistedTimerState(state: PersistedTimerStateV1): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage quota / private mode */
  }
}

function hydrateFromStorage(): HydratedTimerBootstrap {
  const defaults: HydratedTimerBootstrap = {
    minutes: DEFAULT_MINUTES,
    seconds: DEFAULT_SECONDS,
    remainingSeconds: durationToTotalSeconds(DEFAULT_MINUTES, DEFAULT_SECONDS),
    phase: "idle",
    sessions: [],
    activeSessionId: null,
    showNaturalEndMessage: false,
  };

  const saved = readPersistedTimerState();
  if (!saved) return defaults;

  let sessions = [...saved.sessions];
  let phase = saved.phase;
  let remainingSeconds = Math.max(0, Math.floor(saved.remainingSeconds));
  let activeSessionId = saved.activeSessionId;
  let showNaturalEndMessage = false;

  if (phase === "running" && activeSessionId && saved.runningWallMs != null) {
    const elapsed = Math.floor((Date.now() - saved.runningWallMs) / 1000);
    remainingSeconds = Math.max(0, remainingSeconds - elapsed);
    if (remainingSeconds === 0) {
      const finishTime = new Date().toISOString();
      const sid = activeSessionId;
      sessions = sessions.map((row) =>
        row.id === sid ? { ...row, finishedAt: finishTime } : row,
      );
      phase = "idle";
      activeSessionId = null;
      showNaturalEndMessage = true;
    }
  }

  if (phase === "paused" || phase === "running") {
    const hasOpenActive =
      activeSessionId &&
      sessions.some((s) => s.id === activeSessionId && s.finishedAt === null);
    if (!hasOpenActive) {
      phase = "idle";
      activeSessionId = null;
      if (remainingSeconds > 0) {
        remainingSeconds = 0;
      }
    }
  }

  if (phase === "idle") {
    const stillOpen = sessions.some((s) => s.finishedAt === null);
    if (stillOpen) {
      const now = new Date().toISOString();
      sessions = sessions.map((s) =>
        s.finishedAt === null ? { ...s, finishedAt: now } : s,
      );
    }
  }

  return {
    minutes: saved.minutes,
    seconds: clampSeconds(saved.seconds),
    remainingSeconds,
    phase,
    sessions,
    activeSessionId,
    showNaturalEndMessage,
  };
}

type TimerContextValue = {
  minutes: number;
  seconds: number;
  totalInputSeconds: number;
  remainingSeconds: number;
  phase: TimerPhase;
  sessions: TimerSession[];
  showNaturalEndMessage: boolean;
  dismissNaturalEndMessage: () => void;
  setMinutesFromInput: (value: string) => void;
  setSecondsFromInput: (value: string) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  clearSessions: () => void;
  inputDisabled: boolean;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => hydrateFromStorage());

  const [minutes, setMinutes] = useState(initial.minutes);
  const [seconds, setSeconds] = useState(initial.seconds);
  const [remainingSeconds, setRemainingSeconds] = useState(
    initial.remainingSeconds,
  );
  const [phase, setPhase] = useState<TimerPhase>(initial.phase);
  const [sessions, setSessions] = useState<TimerSession[]>(initial.sessions);
  const [showNaturalEndMessage, setShowNaturalEndMessage] = useState(
    initial.showNaturalEndMessage,
  );

  const activeSessionIdRef = useRef<string | null>(initial.activeSessionId);
  /** Kept across taps: on mobile the audio must be “unlocked” on the Start/Resume gesture. */
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAlarmClock = useCallback(() => {
    const a = alarmAudioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }, []);

  /**
   * iOS/Android block play() without a recent gesture. On Start we play muted and pause
   * so the same element can play when the timer ends.
   * iOS Safari often ignores volume=0 for the first frames; `muted` reliably avoids audible output.
   */
  const primeAlarmAudio = useCallback(() => {
    let a = alarmAudioRef.current;
    if (!a) {
      a = new Audio(ALARM_CLOCK_SRC);
      a.preload = "auto";
      alarmAudioRef.current = a;
    }
    a.muted = true;
    a.volume = 1;
    void a
      .play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      })
      .catch(() => {
        a.muted = false;
        /* unlock failed; we still try play at the end */
      });
  }, []);

  const playAlarmClock = useCallback(() => {
    const play = (el: HTMLAudioElement) => {
      el.pause();
      el.currentTime = 0;
      el.muted = false;
      el.volume = 1;
      void el
        .play()
        .then(() => {
          buzzAlarmEnd();
        })
        .catch(() => {
          buzzAlarmEnd();
        });
    };

    let a = alarmAudioRef.current;
    if (!a) {
      a = new Audio(ALARM_CLOCK_SRC);
      alarmAudioRef.current = a;
    }
    play(a);
  }, []);

  useEffect(() => {
    return () => {
      const a = alarmAudioRef.current;
      if (a) {
        a.pause();
        alarmAudioRef.current = null;
      }
    };
  }, []);

  const applyDurationToRemaining = useCallback((m: number, sec: number) => {
    setRemainingSeconds(durationToTotalSeconds(m, sec));
  }, []);

  const dismissNaturalEndMessage = useCallback(() => {
    stopAlarmClock();
    setShowNaturalEndMessage(false);
  }, [stopAlarmClock]);

  useEffect(() => {
    writePersistedTimerState({
      v: STORAGE_VERSION,
      sessions,
      activeSessionId: activeSessionIdRef.current,
      phase,
      minutes,
      seconds,
      remainingSeconds,
      runningWallMs: phase === "running" ? Date.now() : null,
    });
  }, [sessions, phase, minutes, seconds, remainingSeconds]);

  useEffect(() => {
    if (phase !== "running") return;

    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          const sid = activeSessionIdRef.current;
          if (sid) {
            const finishTime = new Date().toISOString();
            setSessions((rows) =>
              rows.map((row) =>
                row.id === sid ? { ...row, finishedAt: finishTime } : row,
              ),
            );
            activeSessionIdRef.current = null;
          }
          playAlarmClock();
          setShowNaturalEndMessage(true);
          setPhase("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, playAlarmClock]);

  const setMinutesFromInput = useCallback(
    (value: string) => {
      const normalized = value.replace(",", ".").trim();
      if (normalized === "") {
        setMinutes(0);
        if (phase === "idle") applyDurationToRemaining(0, seconds);
        return;
      }
      const parsed = parseFloat(normalized);
      if (Number.isNaN(parsed)) {
        return;
      }
      setMinutes(parsed);
      if (phase === "idle") applyDurationToRemaining(parsed, seconds);
    },
    [phase, applyDurationToRemaining, seconds],
  );

  const setSecondsFromInput = useCallback(
    (value: string) => {
      const normalized = value.trim();
      if (normalized === "") {
        setSeconds(0);
        if (phase === "idle") applyDurationToRemaining(minutes, 0);
        return;
      }
      const parsed = parseInt(normalized, 10);
      if (Number.isNaN(parsed)) {
        return;
      }
      const clamped = clampSeconds(parsed);
      setSeconds(clamped);
      if (phase === "idle") applyDurationToRemaining(minutes, clamped);
    },
    [phase, applyDurationToRemaining, minutes],
  );

  const start = useCallback(() => {
    if (phase === "paused") {
      stopAlarmClock();
      primeAlarmAudio();
      setPhase("running");
      return;
    }
    stopAlarmClock();
    primeAlarmAudio();
    const sessionId = createSessionId();
    const startedAt = new Date().toISOString();
    activeSessionIdRef.current = sessionId;
    setSessions((prev) => [
      { id: sessionId, startedAt, finishedAt: null },
      ...prev,
    ]);
    applyDurationToRemaining(minutes, seconds);
    setPhase("running");
  }, [
    phase,
    minutes,
    seconds,
    applyDurationToRemaining,
    stopAlarmClock,
    primeAlarmAudio,
  ]);

  const pause = useCallback(() => {
    if (phase === "running") {
      stopAlarmClock();
      setPhase("paused");
    }
  }, [phase, stopAlarmClock]);

  const stop = useCallback(() => {
    stopAlarmClock();
    const sid = activeSessionIdRef.current;
    if (sid) {
      const finishTime = new Date().toISOString();
      setSessions((prev) =>
        prev.map((row) =>
          row.id === sid ? { ...row, finishedAt: finishTime } : row,
        ),
      );
      activeSessionIdRef.current = null;
    }
    setPhase("idle");
    setRemainingSeconds(0);
  }, [stopAlarmClock]);

  const clearSessions = useCallback(() => {
    stopAlarmClock();
    activeSessionIdRef.current = null;
    setSessions([]);
    if (phase === "running" || phase === "paused") {
      setPhase("idle");
      setRemainingSeconds(0);
    }
  }, [phase, stopAlarmClock]);

  const value = useMemo(
    (): TimerContextValue => ({
      minutes,
      seconds,
      totalInputSeconds: durationToTotalSeconds(minutes, seconds),
      remainingSeconds,
      phase,
      sessions,
      showNaturalEndMessage,
      dismissNaturalEndMessage,
      setMinutesFromInput,
      setSecondsFromInput,
      start,
      pause,
      stop,
      clearSessions,
      inputDisabled: phase === "running",
    }),
    [
      minutes,
      seconds,
      remainingSeconds,
      phase,
      sessions,
      showNaturalEndMessage,
      dismissNaturalEndMessage,
      setMinutesFromInput,
      setSecondsFromInput,
      start,
      pause,
      stop,
      clearSessions,
    ],
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return ctx;
}
