import { expect, test } from 'vitest'
import { LESSONS } from './lessons'

test('lecciones: ids únicos y cada paso trae título y explicación', () => {
  expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length)
  LESSONS.forEach((l) =>
    l.steps.forEach((s) => {
      const [head, ...body] = s.split('\n')
      expect(head.length).toBeGreaterThan(0)
      expect(body.join('').length).toBeGreaterThan(0)
    }),
  )
})

// Las cuentas de los ejemplos, calculadas aparte: si alguien edita un número en el texto, esto no lo detecta,
// pero fija que los resultados escritos en las lecciones son verdaderos.
test('lecciones: las cuentas de los ejemplos son correctas', () => {
  const c = (a: number, b: number) => expect(a).toBeCloseTo(b, 9)
  c(47 * 6, 282); c(382 * 7, 2674); c(382 * 2, 764); c(2674 + 7640, 10314); c(382 * 27, 10314)
  c(48325 * 6, 289950); c(48325 * 3 * 100, 14497500); c(289950 + 14497500, 14787450); c(48325 * 306, 14787450)
  c(1245 * 32, 39840); c(12.45 * 3.2, 39.84)
  c(18 * 4 + 3, 75); c(3 * 23, 69); c(8 * 23, 184); c(38 * 23, 874)
  c(Math.floor(52847 / 36), 1467); c(52847 % 36, 35); c(1467 * 36, 52812)
  c(4 * 4.75, 19); c(7.5 / 3, 2.5); c(0.15 * 30, 4.5); c(450 / 15, 30)
})
