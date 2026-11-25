// Cada paso: primera línea = título, el resto = explicación. Las cuentas están revisadas en lessons.test.ts.
export type Lesson = { id: string; group: 'Multiplicar' | 'Dividir'; title: string; problem: string; steps: string[]; practice?: 'multi' | 'div' }

export const LESSONS: Lesson[] = [
  {
    id: 'mult-simple', group: 'Multiplicar', title: 'Simple (47 × 6)', problem: '47 × 6', practice: 'multi',
    steps: [
      "Acomoda los números\nEscribe 47 arriba y 6 abajo, con las unidades alineadas (el 7 y el 6 uno sobre otro).",
      "Empieza por las unidades\n6 × 7 = 42. Escribe el 2 abajo y 'llévate' el 4.",
      "Sigue con las decenas\n6 × 4 = 24. Súmale lo que te llevaste: 24 + 4 = 28.",
      "Escribe todo el 28\nComo ya no hay más cifras, el 28 va completo a la izquierda del 2. El resultado es 282.",
      "Comprueba con un cálculo rápido\n47 es casi 50, y 50 × 6 = 300. Como 282 está cerca de 300, ¡vas bien! ✅",
    ],
  },
  {
    id: 'mult-mediana', group: 'Multiplicar', title: 'Mediana (382 × 27)', problem: '382 × 27', practice: 'multi',
    steps: [
      "Acomoda\nEscribe 382 arriba y 27 abajo. Vas a multiplicar 382 por cada cifra del 27, empezando por la derecha, y al final sumar los renglones.",
      "Primer renglón: por el 7\n382 × 7 = 2,674. (7 × 2 = 14, llevas 1; 7 × 8 = 56 + 1 = 57, llevas 5; 7 × 3 = 21 + 5 = 26.)",
      "Segundo renglón: por el 2, que en realidad vale 20\nPrimero pon un 0 en las unidades: ese 0 es el corrimiento y NO se te puede olvidar. Luego 382 × 2 = 764, así que el renglón queda 7,640.",
      "Suma los renglones\n2,674 + 7,640 = 10,314.",
      "Comprueba\n382 es casi 400 y 27 es casi 25; 400 × 25 = 10,000. Tu resultado, 10,314, anda cerca ✅",
    ],
  },
  {
    id: 'mult-grande', group: 'Multiplicar', title: 'Grande (48,325 × 306)', problem: '48,325 × 306', practice: 'multi',
    steps: [
      "Acomoda y fíjate en los ceros\n306 tiene un 0 en el lugar de las decenas. Vas a hacer un renglón por cada cifra: por el 6, por el 0 y por el 3 (que vale 300).",
      "Renglón del 6\n48,325 × 6 = 289,950. Truco para revisarlo: 48,000 × 6 = 288,000 y 325 × 6 = 1,950; súmalos y da lo mismo.",
      "Renglón del 0 (las decenas)\nCualquier número × 0 = 0, así que este renglón vale 0. Puedes escribirlo o saltártelo, pero ojo: el siguiente renglón lleva dos ceros al final.",
      "Renglón del 3, que vale 300\nPon dos ceros al final y multiplica: 48,325 × 3 = 144,975. Con los dos ceros: 14,497,500.",
      "Suma los renglones\n289,950 + 0 + 14,497,500 = 14,787,450.",
      "Comprueba y léelo\n48,325 es casi 50,000 y 306 es casi 300; 50,000 × 300 = 15,000,000, así que estás cerca ✅ Léelo en grupos de 3: 14 millones 787 mil 450.",
    ],
  },
  {
    id: 'mult-decimal', group: 'Multiplicar', title: 'Con punto decimal (12.45 × 3.2)', problem: '12.45 × 3.2',
    steps: [
      "Olvídate del punto por ahora\nEscribe los números sin el punto: 1245 × 32. Pero acuérdate de cuántas cifras había después del punto.",
      "Multiplica como números enteros\n1,245 × 2 = 2,490. Luego 1,245 × 30 = 37,350 (con su 0 de corrimiento). Suma: 2,490 + 37,350 = 39,840.",
      "Cuenta los decimales\n12.45 tiene 2 cifras después del punto y 3.2 tiene 1. En total: 2 + 1 = 3.",
      "Pon el punto\nEn 39,840 cuenta 3 lugares desde la derecha y ahí va el punto: 39.840, que es lo mismo que 39.84.",
      "Comprueba\n12 × 3 = 36, y 12.45 × 3.2 es un poquito más, así que 39.84 tiene sentido ✅ (Si te hubiera salido 3.984 o 398.4, el punto quedó mal puesto.)",
    ],
  },
  {
    id: 'div-simple', group: 'Dividir', title: 'Simple (75 ÷ 4)', problem: '75 ÷ 4', practice: 'div',
    steps: [
      "Arma la casita\n75 va adentro de la casita y 4 afuera. Vas a ir cifra por cifra, de izquierda a derecha.",
      "¿Cuántas veces cabe el 4 en el 7?\nCabe 1 vez, porque 1 × 4 = 4 (y 2 × 4 = 8 ya se pasa). Escribe 1 arriba, en el cociente.",
      "Resta\n7 − 4 = 3. Lo que sobra siempre tiene que ser menor que 4; si no, se pudo usar un número más grande.",
      "Baja la siguiente cifra\nBaja el 5 junto al 3: ahora tienes 35.",
      "¿Cuántas veces cabe el 4 en el 35?\n8 veces, porque 8 × 4 = 32 (y 9 × 4 = 36 se pasa). Escribe 8 en el cociente. Resta: 35 − 32 = 3.",
      "Resultado\n75 ÷ 4 = 18 y sobran 3 (residuo 3).",
      "Comprueba\nCociente × divisor + residuo = dividendo: 18 × 4 + 3 = 72 + 3 = 75 ✅",
    ],
  },
  {
    id: 'div-mediana', group: 'Dividir', title: 'Mediana (874 ÷ 23)', problem: '874 ÷ 23', practice: 'div',
    steps: [
      "Arma la casita\n874 adentro y 23 afuera. Como 23 tiene dos cifras, empieza tomando dos cifras del 874: el 87.",
      "¿Cuántas veces cabe 23 en 87?\nEstima: 23 es casi 20 y 87 es casi 80; 20 en 80 cabe 4 veces. Pero 4 × 23 = 92 y se pasa de 87. Prueba con 3: 3 × 23 = 69 ✓. Escribe 3 en el cociente.",
      "Resta\n87 − 69 = 18.",
      "Baja el 4\nJunto al 18 queda 184.",
      "¿Cuántas veces cabe 23 en 184?\nEstima: 20 en 180 son 9, pero 9 × 23 = 207 se pasa. Prueba con 8: 8 × 23 = 184 ✓ justo. Escribe 8 en el cociente.",
      "Resta\n184 − 184 = 0. No sobra nada.",
      "Resultado y comprobación\n874 ÷ 23 = 38. Comprueba: 38 × 23 = 874 ✅",
    ],
  },
  {
    id: 'div-grande', group: 'Dividir', title: 'Grande (52,847 ÷ 36)', problem: '52,847 ÷ 36', practice: 'div',
    steps: [
      "Arma la casita\n52,847 adentro (al hacer la cuenta, sin comas: 52847) y 36 afuera. El 5 solito no alcanza para el 36, así que toma dos cifras: 52.",
      "Primera cifra del cociente\n36 en 52 cabe 1 vez (1 × 36 = 36). Resta: 52 − 36 = 16.",
      "Baja el 8 y queda 168\n36 en 168 cabe 4 veces (4 × 36 = 144; 5 × 36 = 180 se pasa). Resta: 168 − 144 = 24.",
      "Baja el 4 y queda 244\n36 en 244 cabe 6 veces (6 × 36 = 216; 7 × 36 = 252 se pasa). Resta: 244 − 216 = 28.",
      "Baja el 7 y queda 287\n36 en 287 cabe 7 veces (7 × 36 = 252; 8 × 36 = 288 se pasa por 1). Resta: 287 − 252 = 35.",
      "Resultado\nEl cociente es 1,467 y el residuo es 35. Ya no hay más cifras que bajar.",
      "Un truco que te va a salvar\nSi al bajar una cifra el número queda más chico que el divisor, escribe 0 en el cociente y baja otra cifra.",
      "Comprueba\n1,467 × 36 = 52,812, y 52,812 + 35 = 52,847 ✅",
    ],
  },
  {
    id: 'div-decimal-cociente', group: 'Dividir', title: 'Seguir con decimales (19 ÷ 4)', problem: '19 ÷ 4',
    steps: [
      "Empieza normal\n4 en 19 cabe 4 veces (4 × 4 = 16). Resta: 19 − 16 = 3. Hasta aquí es 4 y sobran 3.",
      "No te quedes en el residuo: sigue con decimales\nPon un punto después del 4 en el cociente y agrégale un 0 al residuo: el 3 se vuelve 30.",
      "Sigue dividiendo\n4 en 30 cabe 7 veces (7 × 4 = 28). Resta: 30 − 28 = 2. Escribe 7 después del punto.",
      "Otro 0 más\nAl 2 le agregas otro 0: 20. 4 en 20 cabe 5 veces (5 × 4 = 20). Resta: 20 − 20 = 0. Escribe 5. Como ya no sobra nada, terminaste.",
      "Resultado\n19 ÷ 4 = 4.75. Comprueba: 4 × 4.75 = 19 ✅",
      "Cuando lo que divides ya trae punto (7.5 ÷ 3)\nDivide normal y sube el punto al cociente justo cuando bajes la primera cifra después del punto: 7 ÷ 3 = 2 (sobra 1); pon el punto; baja el 5 y queda 15; 15 ÷ 3 = 5. Resultado: 2.5.",
    ],
  },
  {
    id: 'div-decimal-divisor', group: 'Dividir', title: 'Entre un decimal (4.5 ÷ 0.15)', problem: '4.5 ÷ 0.15',
    steps: [
      "El que va afuera no puede traer punto\nCuando el divisor tiene punto (0.15), hay que quitárselo antes de dividir.",
      "Cuenta sus decimales\n0.15 tiene 2 cifras después del punto. Entonces recorre el punto 2 lugares a la derecha en AMBOS números (es como multiplicar los dos por 100: el resultado no cambia).",
      "Recorre el punto\n0.15 se vuelve 15. Y 4.5 se vuelve 450 (le faltaba un lugar, rellénalo con un 0).",
      "Ahora divide enteros\n450 ÷ 15: 15 en 45 cabe 3 veces (45). Resta: 0. Baja el 0: 15 en 0 cabe 0 veces, escribe 0. Cociente: 30.",
      "Comprueba\n0.15 × 30 = 4.5 ✅",
    ],
  },
]
