import { expect, test } from 'vitest'
import { DIV_LEVELS, divRound, MUL_LEVELS, mulRound, bigQ, fmt, nextLevel, placeName, diagnostic, divQ, factKey, nextFact, placeQ, promote, tableQ } from './logic'

test('factKey es conmutativa', () => expect(factKey(7, 8)).toBe(factKey(8, 7)))

test('tableQ responde a×b', () => {
  const q = tableQ('7x8')
  expect(q.answer).toBe('56')
  expect(['7 × 8', '8 × 7']).toContain(q.text)
})

test('divQ es exacta', () => {
  for (let i = 0; i < 200; i++) {
    const q = divQ()
    const [n, d] = q.text.split(' ÷ ').map(Number)
    expect(n / d).toBe(Number(q.answer))
  }
})

test('placeQ: el valor responde al dígito preguntado', () => {
  for (let i = 0; i < 200; i++) {
    const q = placeQ()
    const digit = q.text.match(/el (\d) en/)![1]
    expect(q.answer.startsWith(digit)).toBe(true)
    expect(q.answer.slice(1)).toMatch(/^0*$/)
  }
})

test('diagnóstico: 20 preguntas con respuesta numérica', () => {
  const d = diagnostic()
  expect(d).toHaveLength(20)
  d.forEach((q) => expect(q.answer).toMatch(/^[1-9]\d*$/))
})

test('promote sube hasta 4 y un error regresa a 0', () => {
  let b: Record<string, number> = {}
  for (let i = 0; i < 6; i++) b = promote(b, '7x8', true)
  expect(b['7x8']).toBe(4)
  expect(promote(b, '7x8', false)['7x8']).toBe(0)
})

test('nextFact no repite el último', () => {
  for (let i = 0; i < 200; i++) expect(nextFact({}, '7x8')).not.toBe('7x8')
})

const LEVELS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const many = (f: (q: ReturnType<typeof bigQ>, len: number) => void) =>
  LEVELS.forEach((len) => { for (let i = 0; i < 150; i++) f(bigQ(len), len) })

test('fmt agrupa de 3 en 3 sin perder cifras en 15 dígitos', () => expect(fmt('123456789012345')).toBe('123,456,789,012,345'))

test('placeName', () => {
  expect(placeName(4)).toBe('decenas de millar')
  expect(placeName(7)).toBe('decenas de millón')
  expect(placeName(9)).toBe('unidades de millar de millón')
})

test('bigQ: cada tipo tiene respuesta correcta', () =>
  many((q, len) => {
    if (q.text.startsWith('¿Qué dígito')) {
      const [, name, n] = q.text.match(/en las (.+) de ([\d,]+)\?/)!
      const pos = Array.from({ length: len }, (_, i) => i).find((i) => placeName(i) === name)!
      expect(n.replace(/,/g, '').split('').reverse()[pos]).toBe(q.answer)
    } else if (q.text.startsWith('Escríbelo')) {
      const tk = q.text.replace('Escríbelo con cifras: ', '').split(' ')
      let v = 0n
      tk.forEach((t, i) => {
        if (!/^[\d,]+$/.test(t)) return
        const n = BigInt(t.replace(/,/g, ''))
        v += tk[i + 1]?.startsWith('mill') ? n * 10n ** 6n : tk[i + 1] === 'mil' ? n * 1000n : n
      })
      expect(String(v)).toBe(q.answer)
      expect(q.answer).toHaveLength(len)
    } else if (q.options) {
      const [a, b] = q.options.map(BigInt)
      expect(a).not.toBe(b)
      expect(BigInt(q.answer)).toBe(q.text.includes('mayor') ? (a > b ? a : b) : a < b ? a : b)
    } else {
      const [x, op, y] = q.text.replace(/,/g, '').split(' ')
      expect(String(op === '×' ? BigInt(x) * BigInt(y) : BigInt(x) / BigInt(y))).toBe(q.answer)
      if (op === '÷') expect(BigInt(x) % BigInt(y)).toBe(0n)
    }
  }))

test('nextLevel sube, baja y respeta límites', () => {
  expect(nextLevel(8, 10)).toBe(9)
  expect(nextLevel(8, 7)).toBe(8)
  expect(nextLevel(8, 3)).toBe(7)
  expect(nextLevel(6, 0)).toBe(6)
  expect(nextLevel(15, 10)).toBe(15)
})

test('mulRound: pasos correctos y la suma final es A × B', () => {
  MUL_LEVELS.forEach((_, lvl) => {
    for (let n = 0; n < 60; n++) {
      const qs = mulRound(lvl)
      expect(qs.length).toBeGreaterThanOrEqual(10)
      expect(qs.length).toBeLessThanOrEqual(12)
      qs.forEach((q) => {
        const tk = q.text.replace(/,/g, '').split(' ')
        if (tk[1] === '×') {
          expect(String(BigInt(tk[0]) * BigInt(tk[2]))).toBe(q.answer)
        } else {
          const [, a, b] = q.ctx!.replace(/,/g, '').match(/Resuelve (\d+) × (\d+)/)!
          const sum = tk.filter((_, i) => i % 2 === 0).reduce((x, y) => x + BigInt(y), 0n)
          expect(String(sum)).toBe(q.answer)
          expect(q.answer).toBe(String(BigInt(a) * BigInt(b)))
        }
      })
    }
  })
})

test('divRound: cada paso es correcto y el problema cierra con N = cociente × D + residuo', () => {
  DIV_LEVELS.forEach(([, , resid], lvl) => {
    for (let n = 0; n < 60; n++) {
      const qs = divRound(lvl)
      expect(qs.length).toBeGreaterThanOrEqual(8)
      expect(qs.length).toBeLessThanOrEqual(16)
      // cada problema termina en el paso "= el residuo" (dos problemas iguales en una ronda no se mezclan)
      const probs: { head: string; steps: typeof qs; closed: boolean }[] = []
      qs.forEach((q) => {
        let cur = probs[probs.length - 1]
        if (!cur || cur.closed) probs.push((cur = { head: q.ctx!.split('\n')[0], steps: [], closed: false }))
        cur.steps.push(q)
        if (q.text.includes('= el residuo')) cur.closed = true
      })
      probs.forEach(({ head, steps }) => {
        const [N, D] = head.replace('Resuelve ', '').replace(/,/g, '').split(' ÷ ').map(BigInt)
        let quo = ''
        let rest = 0n
        steps.forEach((q) => {
          const t = q.text.replace(/,/g, '')
          if (t.startsWith('¿')) {
            const [d, cur] = t.match(/cabe (\d+) en (\d+)/)!.slice(1).map(BigInt)
            expect(d).toBe(D)
            expect(BigInt(q.answer)).toBe(cur / d)
            expect(BigInt(q.answer) < 10n).toBe(true)
            quo += q.answer
          } else {
            const [cur, k, d] = t.match(/^(\d+) − \((\d) × (\d+)\)/)!.slice(1).map(BigInt)
            rest = cur - k * d
            expect(BigInt(q.answer)).toBe(rest)
            expect(rest < D).toBe(true)
          }
        })
        expect(BigInt(quo) * D + rest).toBe(N)
        expect(rest === 0n).toBe(!resid)
      })
    }
  })
})
