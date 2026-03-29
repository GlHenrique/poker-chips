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

/** Ficheiro em `public/alarm-clock.mp3` — servido em `/alarm-clock.mp3`. */
const ALARM_CLOCK_SRC = "/alarm-clock.mp3";

/** Padrão mais perceptível; só funciona em browsers que expõem `navigator.vibrate` (ex.: Chrome no Android). Safari no iPhone não suporta vibração na Web. */
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
 * `crypto.randomUUID()` só existe em contextos seguros (HTTPS ou localhost).
 * Em `http://192.168.x.x` (celular no Wi‑Fi) falha — usamos fallback.
 */
function createSessionId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    try {
      return c.randomUUID();
    } catch {
      /* continua para o fallback */
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
  inputDisabled: boolean;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const [remainingSeconds, setRemainingSeconds] = useState(
    durationToTotalSeconds(DEFAULT_MINUTES, DEFAULT_SECONDS),
  );
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [showNaturalEndMessage, setShowNaturalEndMessage] = useState(false);

  const activeSessionIdRef = useRef<string | null>(null);
  /** Mantido entre toques: em mobile o áudio tem de ser “desbloqueado” no gesto Iniciar/Continuar. */
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAlarmClock = useCallback(() => {
    const a = alarmAudioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
  }, []);

  /**
   * iOS/Android bloqueiam play() sem gesto recente. No Iniciar, tocamos com volume 0 e pausamos
   * para o mesmo elemento poder tocar no fim do timer.
   */
  const primeAlarmAudio = useCallback(() => {
    let a = alarmAudioRef.current;
    if (!a) {
      a = new Audio(ALARM_CLOCK_SRC);
      a.preload = "auto";
      alarmAudioRef.current = a;
    }
    a.volume = 0;
    void a
      .play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.volume = 1;
      })
      .catch(() => {
        /* unlock falhou; ainda tentamos play no fim */
      });
  }, []);

  const playAlarmClock = useCallback(() => {
    const play = (el: HTMLAudioElement) => {
      el.pause();
      el.currentTime = 0;
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
  }, []);

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
    ],
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error("useTimer deve ser usado dentro de TimerProvider");
  }
  return ctx;
}
