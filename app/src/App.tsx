import { useEffect, useRef, useState } from 'react'
import { bigQ, CATS, diagnostic, DIV_LEVELS, divRound, fmt, MAX_LVL, MIN_LVL, MUL_LEVELS, mulRound, nextFact, nextLevel, promote, tableQ, type Cat, type Q } from './logic'
import Aprende from './Aprende'
import Panel from './Panel'
import { play, setMuted } from './sound'

type Res = { q: Q; ok: boolean }
type Diag = Record<Cat, [number, number]>
export type S = {
  name: string; mute: boolean
  boxes: Record<string, number>; miss: Record<string, number>; log: Record<string, number>
  stars: number; streak: number; last: string
  bigLvl: number; mulLvl: number; divLvl: number; diag?: Diag
}
type Mode = 'tablas' | 'grandes' | 'multi' | 'div'

const KEY = 'retos-mates:v1'
const GOAL = 3 // rondas por día: da un cierre claro a la sesión
const EMPTY: S = { name: '', mute: false, boxes: {}, miss: {}, log: {}, stars: 0, streak: 0, last: '', bigLvl: 7, mulLvl: 2, divLvl: 1 }
const load = (): S => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return EMPTY
  }
}
const day = (ms = 0) => new Date(Date.now() - ms).toLocaleDateString('sv')
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
const show = (v: string) => (v ? fmt(v) : '…')

const BIEN = ['¡Eso es!', '¡Órale, bien hecho!', '¡Qué crack!', '¡Exacto!', '¡Ándale, así se hace!', '¡Buenísimo!']
const MAL = ['Uy, casi.', 'No pasa nada, así se aprende.', 'Ni modo, la próxima sale.', 'Échale ganas, ya casi.']

function Quiz(p: {
  total: number
  next: (i: number) => Q
  feedback: boolean
  onAnswer: (q: Q, ok: boolean) => void
  onDone: (r: Res[]) => void
  onQuit: () => void
}) {
  const [i, setI] = useState(0)
  const [q, setQ] = useState(() => p.next(0))
  const [val, setVal] = useState('')
  const [res, setRes] = useState<Res[]>([])
  const [fb, setFb] = useState<{ ok: boolean; msg: string } | null>(null)

  const advance = (r: Res[]) => {
    if (i + 1 >= p.total) return p.onDone(r)
    setI(i + 1)
    setQ(p.next(i + 1))
    setVal('')
    setFb(null)
  }
  const submit = (a = val) => {
    if (!a || fb) return
    const ok = a === q.answer
    const r = [...res, { q, ok }]
    p.onAnswer(q, ok)
    setRes(r)
    if (p.feedback) (play(ok ? 'ok' : 'bad'), setFb({ ok, msg: pick(ok ? BIEN : MAL) }))
    else advance(r)
  }
  const tap = (d: string) => !fb && val.length < 15 && setVal(val === '0' ? d : val + d)

  return (
    <main className="quiz">
      <div className="top">
        <button className="ghost quit" onClick={p.onQuit}>✕ Terminar</button>
        <div className="bar"><i style={{ width: `${(i / p.total) * 100}%` }} /></div>
      </div>
      <p className="count">{i + 1} de {p.total}</p>
      {q.ctx && <p className="ctx">{q.ctx}</p>}
      <h1 className="q" style={q.text.length > 24 ? { fontSize: '1.7rem' } : undefined}>{q.text}</h1>
      <div className={`ans ${fb ? (fb.ok ? 'ok' : 'bad') : ''}`}>{show(val)}</div>
      {fb ? (
        <div className="fb">
          <p>{fb.msg}{!fb.ok && <> La respuesta es <b>{show(q.answer)}</b>.</>}</p>
          <button className="big" onClick={() => advance(res)}>Seguir</button>
        </div>
      ) : q.options ? (
        <div className="opts">
          {q.options.map((o) => <button key={o} onClick={() => (setVal(o), submit(o))}>{show(o)}</button>)}
        </div>
      ) : (
        <div className="pad">
          {'123456789'.split('').map((d) => <button key={d} onClick={() => tap(d)}>{d}</button>)}
          <button onClick={() => setVal(val.slice(0, -1))} aria-label="Borrar">⌫</button>
          <button onClick={() => tap('0')}>0</button>
          <button className="go" onClick={() => submit()} aria-label="Listo">✓</button>
        </div>
      )}
    </main>
  )
}

function Welcome({ onName }: { onName: (n: string) => void }) {
  const [v, setV] = useState('')
  return (
    <main className="home">
      <h1>¡Hola! 👋</h1>
      <p>Soy tu entrenador de mates. Vamos a practicar un ratito cada día y te vas a poner bien buena. ¿Cómo te llamas?</p>
      <input value={v} maxLength={20} placeholder="Tu nombre" onChange={(e) => setV(e.target.value)} />
      <button className="big" disabled={!v.trim()} onClick={() => onName(v.trim())}>¡Vamos!</button>
    </main>
  )
}

export default function App() {
  const [s, setS] = useState(load)
  const [screen, setScreen] = useState<'home' | 'diag' | 'practice' | 'done' | 'panel' | 'aprende'>('home')
  const [notes, setNotes] = useState<string[]>([])
  const [dq, setDq] = useState<Q[]>([])
  const [done, setDone] = useState<Res[]>([])
  const [mode, setMode] = useState<Mode>('tablas')
  const [mq, setMq] = useState<Q[]>([])
  const boxes = useRef(s.boxes)
  const lastFact = useRef<string | undefined>(undefined)
  const snap = useRef<Record<string, number>>({})
  boxes.current = s.boxes
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(s)), [s])
  useEffect(() => setMuted(s.mute), [s.mute])
  useEffect(() => void navigator.storage?.persist?.(), []) // pide a Safari no borrar el progreso

  const finishDiag = (r: Res[]) => {
    const diag = { tablas: [0, 0], valor: [0, 0], multi: [0, 0], division: [0, 0] } as Diag
    const seed = { ...s.boxes }
    r.forEach(({ q, ok }) => {
      diag[q.cat][1]++
      if (ok) diag[q.cat][0]++
      if (q.fact) seed[q.fact] = ok ? 2 : 0
    })
    setS({ ...s, diag, boxes: seed, mulLvl: s.diag ? s.mulLvl : diag.multi[0], divLvl: s.diag ? s.divLvl : diag.division[0] }) // primer examen: el nivel de multiplicar parte de ahí
    setScreen('home')
  }
  const finishPractice = (r: Res[]) => {
    const hoy = day()
    const streak = s.last === hoy ? s.streak : s.last === day(864e5) ? s.streak + 1 : 1
    const good = Math.round((r.filter((x) => x.ok).length * 10) / r.length)
    const key = ({ grandes: 'bigLvl', multi: 'mulLvl', div: 'divLvl', tablas: null } as const)[mode]
    const [mn, mx] = mode === 'grandes' ? [MIN_LVL, MAX_LVL] : mode === 'multi' ? [0, MUL_LEVELS.length - 1] : [0, DIV_LEVELS.length - 1]
    const lvl = key ? nextLevel(s[key], good, mn, mx) : 0
    const n = (s.log[hoy] ?? 0) + 1
    const better = [...new Map(r.filter((x) => x.ok && x.q.fact && snap.current[x.q.fact] === 0).map((x) => [x.q.fact, x.q.text])).values()]
    setNotes([
      ...(better.length ? [`Hoy mejoraste en: ${better.join(', ')} 🎯`] : []),
      ...(key && lvl > s[key] ? ['¡Subiste de nivel! 🚀'] : key && lvl < s[key] ? ['Bajamos un nivelito para reforzar, sin pena 💪'] : []),
      n >= GOAL ? '¡Meta de hoy cumplida! 🎉 Ya puedes descansar la mente.' : `Te faltan ${GOAL - n} ronda${GOAL - n === 1 ? '' : 's'} para tu meta de hoy.`,
    ])
    setS((p) => ({
      ...p, streak, last: hoy,
      log: Object.fromEntries(Object.entries({ ...p.log, [hoy]: n }).sort().slice(-30)),
      ...(key ? { [key]: lvl } : {}),
    }))
    play('end')
    setDone(r)
    setScreen('done')
  }

  const start = (m: Mode) => {
    setMode(m)
    snap.current = { ...s.boxes }
    if (m === 'multi') setMq(mulRound(s.mulLvl))
    if (m === 'div') setMq(divRound(s.divLvl))
    setScreen('practice')
  }

  if (!s.name) return <Welcome onName={(name) => setS({ ...s, name })} />
  if (screen === 'aprende') return <Aprende back={() => setScreen('home')} practice={start} />
  if (screen === 'panel') return <Panel s={s} back={() => setScreen('home')} />
  if (screen === 'diag')
    return <Quiz total={dq.length} next={(i) => dq[i]} feedback={false}
        onAnswer={() => {}}
        onDone={finishDiag}
        onQuit={() => confirm('¿Salir del mini examen? Se pierde lo que llevas.') && setScreen('home')} // las rondas de práctica no se pierden: cada respuesta ya quedó guardada
      />
  if (screen === 'practice')
    return (
      <Quiz
        total={mode === 'multi' || mode === 'div' ? mq.length : 10}
        feedback
        next={(i) => {
          if (mode === 'multi' || mode === 'div') return mq[i]
          if (mode === 'grandes') return bigQ(s.bigLvl)
          lastFact.current = nextFact(boxes.current, lastFact.current)
          return tableQ(lastFact.current)
        }}
        onAnswer={(q, ok) =>
          setS((p) => ({
            ...p,
            boxes: q.fact ? promote(p.boxes, q.fact, ok) : p.boxes,
            miss: q.fact && !ok ? { ...p.miss, [q.fact]: (p.miss[q.fact] ?? 0) + 1 } : p.miss,
            stars: p.stars + (ok ? 1 : 0),
          }))
        }
        onDone={finishPractice}
        onQuit={() => setScreen('home')}
      />
    )
  if (screen === 'done') {
    const good = done.filter((x) => x.ok).length
    const fails = [...new Map(done.filter((x) => !x.ok).map((x) => [x.q.text + x.q.answer, x])).values()]
    return (
      <main className="home">
        <h1>{good >= 9 ? '¡Estás en llamas! 🔥' : good >= 6 ? '¡Muy bien! 💪' : '¡Sigue así, ya vas agarrando la onda! 🌱'}</h1>
        <p className="big-n">{good} / {done.length} ⭐</p>
        {notes.map((t) => <p key={t} className="note">{t}</p>)}
        {fails.length > 0 && (
          <section>
            <h2>Para repasar</h2>
            {fails.map((x) => <p key={x.q.text + x.q.answer}>{x.q.options ? `${x.q.text} ${x.q.options.map(fmt).join(' o ')}` : x.q.text} → <b>{fmt(x.q.answer)}</b></p>)}
          </section>
        )}
        <button className="big" onClick={() => start(mode)}>Otra ronda</button>
        <button className="ghost" onClick={() => setScreen('home')}>Volver al inicio</button>
      </main>
    )
  }

  return (
    <main className="home">
      <h1>¡Hola, {s.name}! 👋</h1>
      <p className="stats">⭐ {s.stars} &nbsp; 🔥 {s.streak} {s.streak === 1 ? 'día' : 'días'}</p>
      {s.diag && (
        <p className="note">
          Meta de hoy: {Math.min(GOAL, s.log[day()] ?? 0)}/{GOAL} rondas {(s.log[day()] ?? 0) >= GOAL && '✅'}
        </p>
      )}
      {s.diag ? (
        <section>
          <h2>Cómo vas</h2>
          {(Object.keys(CATS) as Cat[]).map((c) => {
            const [a, b] = s.diag![c]
            return <p key={c}>{a / b >= 0.8 ? '🟢' : a / b >= 0.5 ? '🟡' : '🔴'} {CATS[c]}: {a}/{b}</p>
          })}
        </section>
      ) : (
        <p>Primero hagamos un mini examen de 20 preguntas para ver en qué te podemos echar la mano. ¡No cuenta para calificación! 😉</p>
      )}
      <button className="big" onClick={() => s.diag ? start('tablas') : (setDq(diagnostic()), setScreen('diag'))}>
        {s.diag ? 'Practicar tablas' : 'Empezar el mini examen'}
      </button>
      {s.diag && (
        <>
          <button className="big" onClick={() => start('grandes')}>
            Números grandes 🔢 <small>({s.bigLvl} cifras)</small>
          </button>
          <button className="big" onClick={() => start('multi')}>
            Multiplicar paso a paso ✖️ <small>({MUL_LEVELS[s.mulLvl][0]} × {MUL_LEVELS[s.mulLvl][1]} cifras)</small>
          </button>
          <button className="big" onClick={() => start('div')}>
            Dividir paso a paso ➗ <small>({DIV_LEVELS[s.divLvl][0]} ÷ {DIV_LEVELS[s.divLvl][1]} cifras)</small>
          </button>
        </>
      )}
      {s.diag && (
        <button className="ghost" onClick={() => (setDq(diagnostic()), setScreen('diag'))}>Repetir el mini examen</button>
      )}
      <button className="big alt" onClick={() => setScreen('aprende')}>Aprende cómo 📖</button>
      <div className="foot">
        <button className="ghost" onClick={() => setS({ ...s, mute: !s.mute })}>{s.mute ? '🔇 Sin sonido' : '🔊 Con sonido'}</button>
        <button className="ghost" onClick={() => setScreen('panel')}>👨‍👩‍👧 Panel para papás</button>
      </div>
    </main>
  )
}
