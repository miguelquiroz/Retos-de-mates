import { useEffect, useRef, useState } from 'react'
import { LESSONS, type Lesson } from './lessons'

export default function Aprende({ back, practice }: { back: () => void; practice: (m: 'multi' | 'div') => void }) {
  const [l, setL] = useState<Lesson>()
  const [n, setN] = useState(1) // pasos visibles
  const now = useRef<HTMLElement>(null)
  useEffect(() => {
    // llaves: el efecto no debe devolver nada (scrollIntoView puede devolver una Promise y React tira el componente)
    now.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [n, l])

  if (!l)
    return (
      <main className="home">
        <button className="back" onClick={back}>← Inicio</button>
        <h1>Aprende cómo 📖</h1>
        <p>Elige una lección y te la explico paso a paso.</p>
        {(['Multiplicar', 'Dividir'] as const).map((g) => (
          <section key={g}>
            <h2>{g === 'Multiplicar' ? 'Multiplicar ✖️' : 'Dividir ➗'}</h2>
            {LESSONS.filter((x) => x.group === g).map((x) => (
              <button key={x.id} className="lesson" onClick={() => (setL(x), setN(1))}>{x.title}</button>
            ))}
          </section>
        ))}
        <button className="ghost" onClick={back}>Volver al inicio</button>
      </main>
    )

  const last = n >= l.steps.length
  return (
    <main className="lessonview">
      <button className="back" onClick={() => setL(undefined)}>← Lecciones</button>
      <h1 className="q">{l.problem}</h1>
      <p className="count">Paso {n} de {l.steps.length}</p>
      {l.steps.slice(0, n).map((s, i) => {
        const [head, ...body] = s.split('\n')
        return (
          <section key={i} ref={i === n - 1 ? now : undefined} className={i === n - 1 ? 'step now' : 'step'}>
            <b>{head}</b>
            <p>{body.join('\n')}</p>
          </section>
        )
      })}
      <div className="stepnav">
        {last ? (
          <>
            {l.practice && <button className="big" onClick={() => practice(l.practice!)}>¡A practicar! 💪</button>}
            <button className="ghost" onClick={() => setL(undefined)}>Ver otras lecciones</button>
          </>
        ) : (
          <button className="big" onClick={() => setN(n + 1)}>Siguiente paso ▶</button>
        )}
        {n > 1 && <button className="ghost" onClick={() => setN(n - 1)}>◀ Paso anterior</button>}
      </div>
    </main>
  )
}
