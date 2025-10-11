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

export function beep({
  frequency = 880,
  durationMs = 80,
  volume = 0.2,
  type = "sine",
}: {
  frequency?: number;
  durationMs?: number;
  volume?: number;
  type?: BeepWaveType;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.value = 0;
  gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime + 0.005);
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
