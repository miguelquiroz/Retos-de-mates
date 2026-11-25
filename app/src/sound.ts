let ctx: AudioContext | undefined
let muted = false
export const setMuted = (m: boolean) => { muted = m }

const NOTES = { ok: [660, 880], bad: [220], end: [523, 659, 784] }

// Tonos suaves con WebAudio: sin archivos. En iOS suena solo tras un toque y respeta el switch de silencio.
export function play(kind: keyof typeof NOTES) {
  if (muted) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    NOTES[kind].forEach((f, i) => {
      const t = ctx!.currentTime + i * 0.1
      const osc = ctx!.createOscillator()
      const g = ctx!.createGain()
      osc.frequency.value = f
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      osc.connect(g).connect(ctx!.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch {
    /* sin audio no pasa nada */
  }
}
