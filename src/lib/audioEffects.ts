export type BeepWaveType = "sine" | "triangle" | "square" | "sawtooth";

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioContext) {
      // @ts-ignore
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      sharedAudioContext = new Ctor();
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

function getMasterVolumePercent(): number {
  try {
    const raw = localStorage.getItem("aos_settings");
    if (!raw) return 70;
    const parsed = JSON.parse(raw);
    const val = Number(parsed?.soundVolume);
    if (Number.isFinite(val)) return Math.max(0, Math.min(100, val));
    return 70;
  } catch {
    return 70;
  }
}

export function beep({
  frequency = 880,
  durationMs = 80,
  volume = 0.2,
  type = "sine",
}: {
  frequency?: number;
  durationMs?: number;
  volume?: number; // 0..1, will be gated by master volume
  type?: BeepWaveType;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  const master = Math.max(0, Math.min(1, getMasterVolumePercent() / 100));
  const finalVolume = Math.max(0, Math.min(1, (volume ?? 0.2) * master));

  gainNode.gain.value = 0;
  gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.005);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export function setMasterMuted(muted: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if ((ctx as any).suspend && muted) (ctx as any).suspend();
  if ((ctx as any).resume && !muted) (ctx as any).resume();
}

export type CueName = "objective" | "hazard" | "scan-complete";
export type Soundset = "auto" | "division" | "animus";

function getSoundset(): Soundset {
  try {
    const raw = localStorage.getItem("aos_settings");
    if (!raw) return "auto";
    const parsed = JSON.parse(raw);
    const v = parsed?.soundset as Soundset | undefined;
    return v === "division" || v === "animus" ? v : "auto";
  } catch {
    return "auto";
  }
}

export function playCue(cue: CueName, opts?: { soundset?: Soundset; volume?: number }) {
  const chosen = opts?.soundset && opts.soundset !== "auto" ? opts.soundset : getSoundset();
  // Frequencies tuned by soundset
  const base = chosen === "animus" ? 620 : 820;
  const alert = chosen === "animus" ? 980 : 1040;
  const ok = chosen === "animus" ? 760 : 660;
  const vol = Math.max(0, Math.min(1, (opts?.volume ?? 0.4)));

  switch (cue) {
    case "objective": {
      // rising two-tone
      beep({ frequency: ok, durationMs: 90, volume: vol, type: "triangle" });
      setTimeout(() => beep({ frequency: ok + 120, durationMs: 120, volume: vol, type: "triangle" }), 110);
      break;
    }
    case "hazard": {
      // sharp triple
      beep({ frequency: alert, durationMs: 80, volume: vol, type: "square" });
      setTimeout(() => beep({ frequency: alert, durationMs: 80, volume: vol, type: "square" }), 120);
      setTimeout(() => beep({ frequency: alert, durationMs: 140, volume: vol * 0.9, type: "square" }), 260);
      break;
    }
    case "scan-complete": {
      // descending sweep
      beep({ frequency: base + 200, durationMs: 100, volume: vol, type: "sine" });
      setTimeout(() => beep({ frequency: base + 80, durationMs: 100, volume: vol * 0.85, type: "sine" }), 100);
      setTimeout(() => beep({ frequency: base, durationMs: 160, volume: vol * 0.75, type: "sine" }), 210);
      break;
    }
  }
}
