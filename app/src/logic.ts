export type Cat = 'tablas' | 'valor' | 'multi' | 'division'
export type Q = { text: string; answer: string; cat: Cat; fact?: string; options?: string[]; ctx?: string }

export const CATS: Record<Cat, string> = {
  tablas: 'Tablas de multiplicar',
  valor: 'Valor de las cifras',
  multi: 'Multiplicar números grandes',
  division: 'Dividir',
}

const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1])
export const fmt = (n: number | string | bigint) => BigInt(n).toLocaleString('es-MX') // BigInt: sin pérdida pasando de 15 cifras

export const factKey = (a: number, b: number) => `${Math.min(a, b)}x${Math.max(a, b)}`
const ALL_FACTS = Array.from({ length: 11 }, (_, i) => i + 2).flatMap((a) =>
  Array.from({ length: 13 - a }, (_, j) => factKey(a, a + j)),
)

export const FACT_COUNT = ALL_FACTS.length

export function tableQ(key: string): Q {
  const [a, b] = key.split('x').map(Number)
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]
  return { text: `${x} × ${y}`, answer: String(a * b), cat: 'tablas', fact: key }
}

export function placeQ(): Q {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, r(5, 7)) // distintos: la pregunta no es ambigua
  const n = Number(digits.join(''))
  const pos = r(0, digits.length - 1)
  return {
    text: `¿Qué valor tiene el ${digits[pos]} en ${fmt(n)}?`,
    answer: String(digits[pos] * 10 ** (digits.length - 1 - pos)),
    cat: 'valor',
  }
}

export function multiQ(): Q {
  const [a, b] = Math.random() < 0.5 ? [r(100, 999), r(2, 9)] : [r(11, 35), r(11, 35)]
  return { text: `${a} × ${b}`, answer: String(a * b), cat: 'multi' }
}

export function divQ(): Q {
  const d = r(2, 9)
  const q = r(12, 99)
  return { text: `${d * q} ÷ ${d}`, answer: String(q), cat: 'division' }
}

export const diagnostic = (): Q[] => [
  ...shuffle(ALL_FACTS).slice(0, 10).map(tableQ),
  ...Array.from({ length: 4 }, placeQ),
  ...Array.from({ length: 3 }, multiQ),
  ...Array.from({ length: 3 }, divQ),
]

// Cajas de Leitner: 0 = nueva o fallada, 4 = dominada. Las cajas bajas salen más seguido.
export function nextFact(boxes: Record<string, number>, last?: string): string {
  const pool = ALL_FACTS.filter((k) => k !== last)
  let t = Math.random() * pool.reduce((s, k) => s + (5 - (boxes[k] ?? 0)) ** 2, 0)
  for (const k of pool) {
    t -= (5 - (boxes[k] ?? 0)) ** 2
    if (t <= 0) return k
  }
  return pool[0]
}

export const promote = (boxes: Record<string, number>, key: string, ok: boolean) => ({
  ...boxes,
  [key]: ok ? Math.min(4, (boxes[key] ?? 0) + 1) : 0,
})

// ---- Fase 2: números grandes (todo como string/BigInt, nunca Number) ----
export const MIN_LVL = 6
export const MAX_LVL = 15 // el teclado admite 15 dígitos
const digitsStr = (len: number) => String(r(1, 9)) + Array.from({ length: len - 1 }, () => r(0, 9)).join('')
const SUFFIX = ['', ' de millar', ' de millón', ' de millar de millón', ' de billón']
export const placeName = (pos: number) => ['unidades', 'decenas', 'centenas'][pos % 3] + SUFFIX[Math.floor(pos / 3)]

function lugarQ(len: number): Q {
  const s = digitsStr(len)
  const pos = r(0, len - 1)
  return { text: `¿Qué dígito está en las ${placeName(pos)} de ${fmt(s)}?`, answer: s[len - 1 - pos], cat: 'valor' }
}

function escribirQ(len: number): Q {
  const s = digitsStr(len)
  const m = len > 6 ? s.slice(0, len - 6) : ''
  const k = Number(s.slice(Math.max(0, len - 6), len - 3))
  const u = Number(s.slice(-3))
  const parts = [m && (m === '1' ? '1 millón' : `${fmt(m)} millones`), k && `${k} mil`, u && String(u)].filter(Boolean)
  return { text: `Escríbelo con cifras: ${parts.join(' ')}`, answer: s, cat: 'valor' }
}

function compararQ(len: number): Q {
  const s = digitsStr(len)
  const p = r(1, len - 1) // cambia una cifra que no sea la primera: los números se parecen
  let d: string
  do d = String(r(0, 9)); while (d === s[p])
  const t = s.slice(0, p) + d + s.slice(p + 1)
  const mayor = Math.random() < 0.5
  const [lo, hi] = [s, t].sort() // misma longitud: orden de texto = orden numérico
  return { text: `¿Cuál es ${mayor ? 'mayor' : 'menor'}?`, answer: mayor ? hi : lo, options: shuffle([s, t]), cat: 'valor' }
}

function desplazarQ(len: number): Q {
  const k = r(1, 3)
  const base = digitsStr(Math.max(2, len - k))
  const pow = fmt(10n ** BigInt(k))
  return Math.random() < 0.5
    ? { text: `${fmt(base)} × ${pow}`, answer: base + '0'.repeat(k), cat: 'multi' }
    : { text: `${fmt(base + '0'.repeat(k))} ÷ ${pow}`, answer: base, cat: 'division' }
}

export const bigQ = (len: number): Q => [lugarQ, escribirQ, compararQ, desplazarQ, escribirQ][r(0, 4)](len)

// good va sobre 10: 9+ sube un nivel, 5 o menos baja uno
export const nextLevel = (lvl: number, good: number, min = MIN_LVL, max = MAX_LVL) =>
  Math.max(min, Math.min(max, lvl + (good >= 9 ? 1 : good <= 5 ? -1 : 0)))

// ---- Fase 3: multiplicar con varias cifras, paso a paso (productos parciales) ----
export const MUL_LEVELS: [number, number][] = [[2, 1], [3, 1], [2, 2], [3, 2], [4, 2], [3, 3], [5, 3], [6, 3]] // [cifras de A, cifras de B]

function mulProblem(la: number, lb: number): Q[] {
  const a = digitsStr(la)
  // cifras de B: la primera y la última nunca son 0; las de en medio a veces sí (trampa del corrimiento)
  const bd = Array.from({ length: lb }, (_, i) => (i === 0 || i === lb - 1 ? r(1, 9) : Math.random() < 0.2 ? 0 : r(1, 9)))
  const b = bd.join('')
  if (lb === 1) return [{ text: `${fmt(a)} × ${b}`, answer: String(BigInt(a) * BigInt(b)), cat: 'multi' }]
  const done = [`Resuelve ${fmt(a)} × ${fmt(b)}`]
  const parts: bigint[] = []
  const qs: Q[] = []
  for (let j = 0; j < lb; j++) {
    const v = BigInt(bd[lb - 1 - j]) * 10n ** BigInt(j)
    const p = BigInt(a) * v
    qs.push({ text: `${fmt(a)} × ${fmt(v)}`, answer: String(p), cat: 'multi', ctx: done.join('\n') })
    done.push(`${fmt(a)} × ${fmt(v)} = ${fmt(p)}`)
    parts.push(p)
  }
  qs.push({ text: parts.map(fmt).join(' + '), answer: String(parts.reduce((x, y) => x + y)), cat: 'multi', ctx: done.join('\n') })
  return qs
}

export function mulRound(lvl: number): Q[] {
  const [la, lb] = MUL_LEVELS[lvl]
  const qs: Q[] = []
  while (qs.length < 10) qs.push(...mulProblem(la, lb)) // problemas completos: 10 a 12 preguntas
  return qs
}

// ---- Fase 4: división larga guiada, una cifra del cociente a la vez ----
export const DIV_LEVELS: [number, number, boolean][] = [ // [cifras del dividendo, cifras del divisor, con residuo]
  [3, 1, false], [3, 1, true], [4, 1, true], [3, 2, false], [4, 2, true], [5, 2, true], [5, 3, true], [6, 3, true],
]

function divProblem(ln: number, ld: number, resid: boolean): Q[] {
  const D = BigInt(ld === 1 ? r(2, 9) : digitsStr(ld)) // D=1 haría el ciclo de abajo infinito (todo es múltiplo)
  let N: bigint
  if (resid) {
    do N = BigInt(digitsStr(ln)); while (N % D === 0n || N < D * 10n) // residuo real y cociente de 2+ cifras
  } else {
    const lo = (10n ** BigInt(ln - 1) + D - 1n) / D
    const hi = (10n ** BigInt(ln) - 1n) / D
    N = D * (lo + BigInt(r(0, Number(hi - lo))))
  }
  const ns = String(N)
  const head = `Resuelve ${fmt(N)} ÷ ${fmt(D)}`
  const ctx = (c: string, note = '') => [head, note, `Cociente hasta ahora: ${c || '—'}`].filter(Boolean).join('\n')
  let idx = ld
  let cur = BigInt(ns.slice(0, idx))
  if (cur < D) cur = BigInt(ns.slice(0, ++idx))
  let quo = ''
  let note = ''
  const out: Q[] = []
  for (;;) {
    const q = cur / D // una sola cifra: cur < 10·D siempre
    const rest = cur - q * D
    out.push({ text: `¿Cuántas veces cabe ${fmt(D)} en ${fmt(cur)}?`, answer: String(q), cat: 'division', ctx: ctx(quo, note) })
    quo += q
    const last = idx >= ns.length
    out.push({ text: `${fmt(cur)} − (${q} × ${fmt(D)})${last ? ' = el residuo' : ''}`, answer: String(rest), cat: 'division', ctx: ctx(quo) })
    if (last) return out
    note = `Bajamos el ${ns[idx]}`
    cur = rest * 10n + BigInt(ns[idx++])
  }
}

export function divRound(lvl: number): Q[] {
  const [ln, ld, resid] = DIV_LEVELS[lvl]
  const qs: Q[] = []
  while (qs.length < 8) qs.push(...divProblem(ln, ld, resid)) // problemas completos: 8 a 16 preguntas
  return qs
}
