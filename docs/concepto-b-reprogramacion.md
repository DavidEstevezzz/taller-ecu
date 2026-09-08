# Concepto B — Reprogramación

Segunda dirección artística para la página de reprogramación, creada para
**comparar**, no para publicar.

| | |
|---|---|
| Ruta | `/conceptos/reprogramacion-b` |
| Estado | Maqueta interna. `noindex, nofollow`, fuera del sitemap, bloqueada en `robots.txt`, sin canónica y sin un solo enlace desde el sitio |
| Concepto A | `/servicios/reprogramacion`, intacto. Ni un byte suyo se ha tocado |
| Pruebas | `web/test/concept-b.test.ts` |

**Nada de esto está desplegado, y el concepto no sustituye a nada.** Si se
adopta, se decide expresamente y entonces se rehace como página del sitio.

---

## 1. Qué problema resuelve

La página actual se ha ido afinando durante semanas. Puede ser buena y aun así
estar juzgándose por costumbre: cuando llevas quince iteraciones sobre la misma
composición, ya no distingues «esto funciona» de «esto me resulta familiar». La
única forma de saberlo es tener delante otra interpretación completa de la misma
categoría de negocio.

Por eso el Concepto B **no es una revisión** del A. Cambia la lógica
compositiva, el tratamiento del vehículo, el sistema tipográfico, la paleta y —
lo más importante— **qué hace la página**.

---

## 2. La dirección elegida: «Cabina»

Tres decisiones sostienen todo lo demás.

### 2.1 El único color de la página es el vehículo

La interfaz entera es **acromática**: gris de plató fotográfico (`#ecedee`),
tinta (`#101214`) y negro (`#0a0c0d`). No hay un color de marca, ni de acento,
ni de estado. Lo único cromático que aparece en toda la página son las
fotografías.

Consecuencia práctica, y es una regla del sistema: **el estado seleccionado
nunca se dice con color**. Se dice con relleno de tinta, peso y anchura de
letra. Además de ser más disciplinado, cumple sin esfuerzo la regla de que el
color nunca sea el único portador de información.

El Concepto A hace lo contrario, y con criterio: el cobre es su marca y está en
cada etiqueta, cada enlace y cada llamada a la acción. Aquí el cobre no existe,
y el resultado es que **el coche es lo primero que ve el ojo**, siempre.

### 2.2 De noche a mediodía

A es un túnel nocturno, con el titular sobre la fotografía bajo dos velos de
grafito. B es carretera de día, con la fotografía como **franja de portada** y
el titular encima, sobre papel, a contraste 16:1.

Es la diferencia que se percibe antes de leer una palabra, y tiene dos ventajas
que no son de gusto: el titular no depende de que la imagen sea oscura, y la
fotografía no tiene que sacrificar la mitad de su rango para sostener texto.

### 2.3 La página pregunta en vez de exponer

Este es el cambio estructural, y es el que de verdad separa los dos conceptos.

- **A expone.** Enseña una banda de entrega que se deforma según el objetivo,
  un acordeón con las cinco opciones y un configurador. El visitante mira,
  entiende y decide por su cuenta.
- **B pregunta.** Hace tres preguntas sobre el vehículo y sobre quien lo
  conduce, y responde: **por dónde empezar**, con qué segunda opción también
  encaja y con el mensaje de WhatsApp ya redactado con sus respuestas.

La página se comporta como el mostrador del taller, no como un folleto.

---

## 3. Contrato de diferenciación

Lo que usa el Concepto A y qué hace el B en su lugar:

| Concepto A | Concepto B |
|---|---|
| Fondo grafito de principio a fin | Papel de plató, con **un tramo negro** en el último tercio |
| Cobre como acento en toda la página | **Sin color**: el único color son las fotos |
| IBM Plex Sans **Condensed** en titulares, tres familias | **Archivo Variable, una sola familia**, con la **anchura** como eje de jerarquía (titulares a `wdth` 118–125, etiquetas a 88) |
| Hero oscuro, texto sobre la imagen | Portada de revista: rótulo, titular, **franja fotográfica** y entradilla debajo |
| Grandes bandas horizontales de la misma estructura | Alternancia de bloque, franja a sangre y **superficie de decisión** |
| Gráfica conceptual de entrega (curva) | **Selector de caso**: tres preguntas y una recomendación |
| Introducción a la izquierda y acordeón a la derecha | Preguntas a la izquierda, **vehículo elegido a la derecha**, respuesta a lo ancho |
| Franja fotográfica de coche y moto (díptico) | **Una lámina que cambia** de coche a moto según lo que respondas |
| Configurador en panel oscuro dentro de sección oscura | Mismo marco de tercero, **apéndice de datos** al final del tramo negro |
| CTA final naranja a toda anchura | Cierre sobre papel: los cuatro datos como **lista de gran tamaño** |
| Pestaña vertical pegajosa («Calcular mejora») | **Barra de estado inferior** que dice en qué punto está tu elección |
| Etiquetas monoespaciadas | Etiquetas en la misma familia, **estrechas** |

Cabecera y pie también son propios: la cabecera **no es fija** —se va con el
desplazamiento y deja la portada limpia, porque la acción vive abajo— y no tiene
menú desplegable ni menú de móvil.

---

## 4. Las dos direcciones descartadas

Se formularon tres y se implementó una. Las otras dos quedan aquí por si
interesa un Concepto C:

**«Prueba de carretera» (editorial de revista de motor).** Papel crema,
tipografía de gran contraste, fotografía tratada en duotono, filetes finos y
pies de foto. Se descartó por dos motivos: es exactamente el sitio donde acaba
cualquier diseño generado sin criterio propio —crema, serif de alto contraste y
un acento terracota son el promedio del oficio ahora mismo—, y el duotono habría
apagado lo único que aquí es de verdad del cliente: el coche.

**«Pit wall» (telemetría y muro de boxes).** Pantalla de tiempos, datos densos,
alto contraste, monoespaciada. Se descartó porque el negocio **no puede publicar
datos**: sin cifras reales, una estética de telemetría es un decorado que promete
mediciones que no existen. Habría sido la dirección más vistosa y la menos
honesta.

---

## 5. Referencias y qué se extrajo de cada una

Ninguna se ha copiado: de cada una se extrajo un principio y se aplicó al
material de este negocio.

| Referencia | Qué se extrajo |
|---|---|
| **Polestar** (sistema de marca y web; Stockholm Design Lab) | «La tipografía, no el color, es la voz de la marca». Una sola familia, peso contenido, cero radio de esquina y confianza en el blanco. De ahí sale la interfaz acromática |
| **Configuradores de fabricante** (Porsche, BMW; análisis de UX de configuradores en Smashing Magazine) | La superficie de decisión manda: el producto siempre a la vista, la elección con respuesta inmediata, un resumen persistente y **un punto de partida razonable** en vez de una pantalla en blanco. De ahí salen la lámina que cambia y la barra de estado |
| **Fotografía de barrido de prensa de motor** | El vehículo se enseña **en movimiento y de día**, no posado en un plató. Es lo que corrige el punto débil del lenguaje Polestar —el catálogo de galería— para un taller de rendimiento |
| **Portadas de revista impresa** | Rótulo, titular, imagen, entradilla. La estructura que permite que un titular enorme conviva con una fotografía sin pelearse por el mismo espacio |
| **Sitio de Lando Norris** (Awwwards, dirección tipográfica) | Que un titular puede ser la pieza gráfica principal si se le da tamaño de verdad. Se tomó la ambición tipográfica; se dejó fuera el 3D y el desplazamiento cinemático, que aquí serían coste sin argumento |

---

## 6. La interacción principal: «Tu caso»

`web/src/components/concepto-b/CbCaseSelector.astro` y
`web/src/scripts/concept-b-case.ts`.

### Qué hace

Tres preguntas —qué conduces, cómo lo usas, qué lleva montado— y una respuesta
compuesta por cuatro cosas a la vez:

1. La **línea de estado**, en versalitas expandidas: `COCHE / CARRETERA / DE
   SERIE`. Es la firma tipográfica de la página.
2. La **opción por la que empezar**, con su texto íntegro de `site.ts`, y la
   segunda que también encaja.
3. El **vehículo correcto en la lámina**: coche o moto.
4. El **mensaje de WhatsApp ya redactado**, visible antes de enviarlo.

### La tabla de decisión

```
moto                        → Motos
coche + con modificaciones  → Stage 2
coche + de serie/no lo sé   → a diario   → Stage 1
                              carretera  → Orientada al consumo
                              exigente   → Optimización personalizada
                              con carga  → Optimización personalizada
```

«No lo sé» se trata igual que «de serie», a propósito: es la respuesta honesta
de quien no lo sabe y no puede empujar a nadie hacia la opción mayor. Las cinco
opciones son alcanzables, y además están listadas siempre debajo, de modo que la
elección **no esconde el resto del abanico**.

### Cómo se reparte el trabajo

- **HTML.** Tres grupos de radios nativos en tres `<fieldset>`. Flechas dentro
  del grupo, tabulador entre grupos, estado expuesto sin una línea de guion.
- **CSS.** Decide **qué se ve**. Las reglas `:has()` se generan en compilación a
  partir de la misma tabla de decisión que consume el script, así que la tabla
  existe una sola vez. **Sin JavaScript la página sigue respondiendo a cada
  elección.**
- **JavaScript** (1,6 kB). Lo que el CSS no puede hacer: redactar el mensaje con
  las respuestas, enseñarlo antes de enviarlo, anunciar el cambio en una región
  `aria-live`, marcar la opción vigente en el índice, llevar la barra de estado
  y deformar la anchura de la palabra que acaba de cambiar.

### Verificado

Con los scripts desactivados: la elección sigue cambiando el panel, la línea de
estado y la lámina; la vista previa del mensaje **no aparece** (nace oculta,
porque sin JavaScript no habría nada que previsualizar) y el enlace de WhatsApp
lleva la plantilla en blanco de siempre. Nada queda invisible ni muerto.

---

## 7. Recorrido esperado del visitante

1. **Portada.** En una pantalla: qué servicio es, para coche y moto, dónde, y un
   titular que dice que esto se juzga conduciendo. Dos acciones.
2. **Al volante.** Qué es una reprogramación, en una frase, y qué se nota, en
   tres. Con la carretera vista desde el asiento.
3. **Tu caso.** Tres clics. Aparece la opción, la segunda que encaja y el
   mensaje redactado. Es el centro de la página y el motor de la conversión.
4. **La condición.** A tamaño de titular y en negro: no hay dos motores iguales,
   y por eso no publicamos cifras.
5. **Cifras.** Si aun así quieres una referencia: el configurador del proveedor,
   con su aviso.
6. **Cierre.** Los cuatro datos que hacen falta y WhatsApp.

Treinta segundos bastan para 1, 2 y 3, que es donde está la decisión.

---

## 8. Recursos visuales

Tres fotografías nuevas, las tres de Pexels y las tres **de día y en
movimiento**, para que la serie no se confunda con la del Concepto A (nocturna).
Fichas completas, autoría y licencia en [image-sources.md](image-sources.md).

| Archivo | Dónde | Qué es |
|---|---|---|
| `concepto-b-coche-barrido.jpg` | Franja de portada y lámina «coche» | Coche azul en barrido sobre carretera |
| `concepto-b-vista-conductor.jpg` | «Al volante» | La carretera vista desde el asiento del conductor |
| `concepto-b-moto-curva.jpg` | Lámina «moto» | Moto inclinada en una curva de montaña |

**Ninguna es un trabajo del taller**, y la página lo dice donde podría
confundirse: el pie de la lámina lo declara literalmente.

No hay ningún dibujo de centralita. Es coherente con la tesis: esta página
habla de conducir, y su lenguaje gráfico es la fotografía más la tipografía.
Por eso tampoco usa `iso.ts`.

---

## 9. Datos provisionales

El concepto **no inventa ni un dato**. Todo el contenido sale de
`web/src/config/site.ts`, con las mismas advertencias que ya tenía:

- **El abanico de cinco opciones sigue SIN CONFIRMAR** (`REPRO_OPTIONS_TO_CONFIRM`).
  «Stage 1», «Stage 2», «orientada al consumo» y «motos» son una propuesta de
  cómo nombrar el servicio. El concepto los presenta igual de provisionales que
  el sitio; que aquí salgan recomendados **no los confirma**.
- La tabla de decisión de «Tu caso» es una propuesta **nueva y también
  pendiente**: dice por dónde empezar, no qué se va a hacer. Hay que revisarla
  con el cliente antes de considerarla buena.
- Los textos de las tres preguntas y sus pistas son nuevos y descriptivos: no
  prometen resultado, plazo, precio ni compatibilidad.
- Teléfono, zona y aviso legal salen de `CONTACT` y `LEGAL_NOTICE`.
- No hay cifras de potencia, porcentajes, ahorros, plazos, precios, garantías,
  certificaciones, testimonios ni número de clientes. Hay una prueba que falla
  si aparecen.

---

## 10. Dependencias añadidas

Una: **`@fontsource-variable/archivo`**.

Se justifica porque el eje tipográfico es la mitad del concepto: el sistema del
sitio usa una condensada para titulares y aquí se prueba justo lo contrario, una
expandida, con la anchura como jerarquía. Con las familias ya instaladas no se
puede probar esa idea.

Solo la carga la carcasa del concepto, y solo se descarga el subconjunto latino:
**un archivo, 90 kB**, frente a los seis archivos de tres familias que carga el
sitio. Ninguna página pública la ve.

---

## 11. Aislamiento técnico

Esto es lo que hace que la comparación sea limpia y que probar aquí no cueste
nada en el sitio:

- **El concepto no importa Tailwind ni `tokens.css`.** Tiene su propia hoja
  (`web/src/styles/concept-b.css`) con reset, tokens `--cb-*` y componentes.
  Es la razón de que ninguna clase, token o regla base de aquí pueda alcanzar a
  otra página.
- **No usa `PublicLayout`, `Seo`, `SiteHeader`, `SiteFooter` ni `BrandMark`.**
  Tiene carcasa, cabecera y pie propios.
- **Sí reutiliza lo que es lógica, no presentación**: `whatsappUrl()` y el
  contenido de `site.ts`, `embeds.ts` y el script del configurador
  (`src/scripts/configurator.ts`), que sigue siendo uno solo para todo el
  repositorio. Lo único que hace falta por reutilizarlo son tres reglas de
  compatibilidad en la hoja del concepto, anotadas ahí mismo: ese script habla
  el idioma de clases del sitio.

**Comprobado en el build:** los archivos CSS de todas las páginas existentes
conservan su hash byte a byte tras añadir el concepto
(`reprogramacion.XwDVdbw0.css`, `index.CXoL4A7-.css`, …). Si el concepto hubiera
tocado algo compartido, el hash habría cambiado.

---

## 12. Calidad verificada

Con capturas reales y medición en navegador (Chromium sobre `astro preview`):

- **375 / 768 / 1024 / 1440 / 1920 px**: sin desbordamiento horizontal en
  ninguno (`scrollWidth === clientWidth`).
- **Cero errores de consola** y **cero peticiones externas** al cargar: el único
  destino es el propio servidor. El configurador del proveedor sigue sin
  cargarse hasta que se pulsa.
- **Contraste**: 16,0:1 el texto principal sobre papel; 7,1:1 el secundario;
  16,1:1 y 8,5:1 sobre negro. Todos por encima de AA.
- **Teclado**: los tres grupos son radios nativos; el foco es visible en todos
  los controles; hay enlace de salto al contenido; la barra pegajosa no tapa el
  foco (`scroll-padding-block`).
- **Sin JavaScript**: página completa, elección funcionando y enlace de WhatsApp
  con la plantilla en blanco.
- **`prefers-reduced-motion`**: nada se mueve y nada queda oculto —el
  interruptor `cb-motion` solo se activa si hay JavaScript **y** no se ha pedido
  menos movimiento—.
- **Sin desplazamiento secuestrado, sin bucles de animación y sin dependencia
  del `hover`.**

---

## 13. Si el concepto gustara

No basta con «publicarlo»: habría que decidir, por este orden,

1. si la dirección acromática se extiende al resto del sitio o convive con la
   actual —convivir sería lo peor de las dos—;
2. si la marca se rehace en la nueva tipografía, que es lo que pide el concepto,
   y qué pasa entonces con el símbolo actual;
3. si la tabla de decisión de «Tu caso» es correcta comercialmente, que es una
   pregunta para el cliente, no de diseño;
4. y si el nombre de las cinco opciones se confirma de una vez
   (`REPRO_OPTIONS_TO_CONFIRM`), porque la pieza central de esta página las
   recomienda por su nombre.
