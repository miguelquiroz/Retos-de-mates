import { CATS, DIV_LEVELS, FACT_COUNT, MUL_LEVELS, type Cat } from './logic'
import type { S } from './App'

export default function Panel({ s, back }: { s: S; back: () => void }) {
  const week = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - i * 864e5).toLocaleDateString('sv')).reverse()
  const worst = Object.entries(s.miss).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const mastered = Object.values(s.boxes).filter((b) => b >= 4).length
  return (
    <main className="home">
      <h1>Panel para papás</h1>
      <section>
        <h2>Rondas por día (últimos 7)</h2>
        {week.map((d) => <p key={d}>{d.slice(5)}: {'■'.repeat(s.log[d] ?? 0) || '–'} {s.log[d] ?? 0}</p>)}
      </section>
      <section>
        <h2>Tablas</h2>
        <p>Dominadas: {mastered} de {FACT_COUNT}</p>
        <p>Las que más falla: {worst.length ? worst.map(([k, n]) => `${k.replace('x', '×')} (${n})`).join(', ') : 'todavía no hay datos'}</p>
      </section>
      <section>
        <h2>Niveles actuales</h2>
        <p>Números grandes: {s.bigLvl} cifras</p>
        <p>Multiplicar: {MUL_LEVELS[s.mulLvl].join(' × ')} cifras</p>
        <p>Dividir: {DIV_LEVELS[s.divLvl].slice(0, 2).join(' ÷ ')} cifras</p>
      </section>
      {s.diag && (
        <section>
          <h2>Último mini examen</h2>
          {(Object.keys(CATS) as Cat[]).map((c) => <p key={c}>{CATS[c]}: {s.diag![c][0]}/{s.diag![c][1]}</p>)}
        </section>
      )}
      <button className="big" onClick={back}>Volver</button>
    </main>
  )
}
