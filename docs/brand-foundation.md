# Identidad de marca — JM Repro Cars

Resumen de la identidad visual. **No es un manual de marca completo**: recoge lo
necesario para usar el logo con criterio y ampliarlo cuando haga falta.

---

## Concepto del logo

**Un monograma JM dentro de un conector de centralita, con una pista de circuito
que termina en un pad de contacto.**

Tres ideas, una sola forma:

1. **El chasis** es la silueta de una centralita vista de frente, con la esquina
   superior derecha achaflanada y tres pines arriba. Reconocible para quien
   trabaja con ellas; para el resto, simplemente un contorno técnico limpio.
2. **El monograma JM** ocupa el interior. La J desciende y gira; la M se levanta
   con vértice en V, no en U: da tensión y evita el aire redondeado.
3. **La pista de cobre** cruza la parte baja y termina en un pad circular. Es el
   único elemento en color y el que ancla la marca al oficio: electrónica, no
   mecánica.

### Por qué no otras direcciones

Se descartaron deliberadamente el coche completo, las alas, los escudos, los
pistones cruzados y los engranajes: son la plantilla de cualquier taller y no
dicen nada sobre el trabajo concreto de este. Tampoco se buscó el aire de
empresa de software (marcas abstractas, degradados, formas geométricas
flotantes): esto es un taller técnico.

---

## Archivos

| Archivo | Uso |
|---|---|
| `web/public/brand/logo-mark.svg` | Solo el símbolo. Avatares, favicon grande, sellos |
| `web/public/brand/logo-horizontal.svg` | Símbolo + wordmark. Uso externo: firmas, documentos, terceros |
| `web/public/favicon.svg` | Pestaña del navegador. Símbolo sobre grafito, esquinas redondeadas |
| `web/src/components/BrandMark.astro` | **El que usa la web.** Símbolo en línea + texto HTML |

### Por qué el sitio no usa el SVG horizontal

`BrandMark.astro` inserta el símbolo **en línea** y pone el wordmark como texto
HTML real. Tres ventajas: hereda `currentColor` (una sola geometría sirve para
fondo claro y oscuro), el texto usa la fuente ya cargada y es seleccionable, y
no depende de que el navegador tenga IBM Plex disponible dentro de un `<img>`.

`logo-horizontal.svg` existe para cuando alguien necesite un archivo suelto.
Lleva `<text>` con pila de fuentes con reserva. **Para imprenta conviene
convertir ese texto a curvas**; la geometría del símbolo no lo necesita, porque
son trazados puros.

---

## Variantes

| Variante | Cómo |
|---|---|
| Fondo claro | `<BrandMark />` — símbolo en grafito, pista en cobre |
| Fondo oscuro | `<BrandMark tone="inverse" />` — símbolo en papel, pista en cobre claro |
| Tamaños | `sm` (32 px), `md` (40 px), `lg` (48 px) |
| Solo símbolo | `<BrandMark markOnly />` |
| Sin enlace | `<BrandMark href={false} />` |

**A una tinta** funciona: la pista de cobre puede ir del mismo color que el
resto sin perder legibilidad, porque el contraste lo da la forma.

**Tamaño mínimo:** 24 px de alto para el símbolo. Por debajo, los pines del
conector se empastan; para esos casos existe el favicon, con menos detalle.

**Aire mínimo** alrededor: la altura de un pin (≈ 1/8 del alto del símbolo).

---

## Qué no hacer

- Recolorearlo fuera de grafito / papel / cobre.
- Deformarlo, inclinarlo o añadirle sombras, biseles o degradados.
- Separar el monograma de su chasis.
- Ponerlo sobre una fotografía con detalle: necesita fondo plano.
- Rehacer el wordmark con otra tipografía.

---

## Dónde aparece

Cabecera pública, pie, acceso al panel y cabecera del panel. Siempre a través de
`BrandMark.astro` o del archivo de `public/brand/`. **Ninguna página dibuja la
marca por su cuenta**, así que sustituirla es cambiar un archivo.

---

## Estado

Este logo es **original**, creado para este proyecto: trazados SVG escritos a
mano, sin partir de ninguna plantilla, sin copiar marcas de talleres o
fabricantes, y sin incorporar fotografías ni recursos de stock.

Sustituye al wordmark provisional anterior. Si el cliente encarga una identidad
profesional más adelante, el punto de sustitución sigue siendo el mismo.
