# Dirección visual y sistema de diseño — JM Repro Cars

Documenta las decisiones visuales del frontend, de dónde salen y qué queda
pendiente de tu aprobación. **Nada de esto está desplegado.**

---

## 1. Dirección visual

### El problema a evitar

El sector está lleno de dos extremos: webs de taller de 2009 y plantillas
«tuning» con fibra de carbono, neones y velocímetros. Ambas dicen lo mismo:
que nadie ha pensado en esto. El encargo pedía explícitamente evitar carbono
decorativo, neones, velocímetros, degradados morados, glassmorphism y tarjetas
redondeadas idénticas.

### Diagnóstico de la primera versión

La primera versión era limpia y correcta, y precisamente por eso no decía nada.
Los defectos concretos, que son los que gobiernan el rediseño:

- **Una columna de 1.152 px centrada en una pantalla de 1.920.** El contenido
  ocupaba el 60 % del ancho y sobraba margen por todas partes.
- **Seis bandas con la misma estructura**: fondo plano, etiqueta monoespaciada,
  titular, párrafo, rejilla. El macro-ritmo era idéntico cada vez, así que la
  página entera se leía como una sola textura.
- **La fotografía era un rectángulo con borde** encajado en una casilla, no un
  entorno. Se notaba pegada.
- **Los servicios llevaban `01 / 02 / 03`**, que afirma una secuencia. Son tres
  alternativas: el número decía algo falso.
- **La escala tipográfica era estrecha.** Del cuerpo al titular había poco
  recorrido, y sin recorrido no hay jerarquía ni impacto.
- **La etiqueta monoespaciada aparecía ocho veces.** Dejó de ser señal y pasó a
  ser papel pintado.
- **El hueco vacío de «Trabajos»** era un recuadro punteado anunciando que no
  hay nada que enseñar. Restaba credibilidad en vez de sumarla.

### La idea: se abre la caja

**El objeto de este negocio es una centralita, y lo que distingue a este taller
es que la abre.** Todos los demás sustituyen la unidad. Ese es el argumento
comercial, el argumento técnico y —ahora— también el visual.

De ahí sale la firma del sitio: **un despiece de centralita dibujado a medida**,
en proyección dimétrica 2:1, con sus capas separadas y nombradas —tapa,
software, placa, carcasa con conector—. Ocupa la mitad del hero, se monta al
cargar y responde al puntero con volumen.

Por qué pertenece a JM Repro Cars y no a cualquier taller:

1. **Es su pieza**, no una metáfora prestada. Un despiece de ECU no sirve para
   una tienda de neumáticos ni para una empresa de software.
2. **Dice el argumento sin escribirlo.** Una unidad abierta en capas es
   «trabajamos por dentro», que es exactamente lo que la primera versión
   intentaba decir con un párrafo titulado «Diagnóstico primero».
3. **Es honesto.** Es un dibujo esquemático, no una fotografía disfrazada de
   trabajo propio ni una gráfica con datos inventados. No lleva ni una cifra.
4. **Es original y propio.** Trazados calculados en `src/lib/iso.ts`, sin banco
   de imágenes, sin licencias y sin depender de fotos que el cliente todavía no
   ha entregado.
5. **Organiza el sitio entero.** Las tres capas son las tres profundidades de
   intervención, y esas son los tres servicios. La portada las presenta,
   `/servicios` las recorre.

### El riesgo asumido

**La portada abre con una tesis, no con las palabras clave.** El `h1` dice
«Primero se lee. Después se toca.» a 88 px, y la frase con los términos de
búsqueda va inmediatamente debajo, en la entradilla.

Es deliberado y es el riesgo del diseño. Un `h1` que recita «reprogramación,
reparación y clonación de centralitas» nunca va a impactar, y el impacto era el
encargo. La cobertura de palabras clave se mantiene en el `<title>`, en la
`meta description`, en la entradilla y en todos los `h2` —que siguen llamándose
Reprogramación, Reparación de ECU y Clonación de ECU—. La coincidencia exacta
en `h1` es una señal débil; el primer segundo de una visita, no.

### Las tres decisiones de color y forma, sin cambios

1. **Grafito y papel.** Base de metal mecanizado y blanco cálido. Nada de azul
   corporativo genérico.
2. **Cobre como único acento.** El color de las pistas de un circuito y del
   cableado. Cálido, poco visto en el sector, y sin parecerse a la alerta roja
   ni al neón.
3. **Radios pequeños, jerarquía por borde.** 2–6 px. La sombra no marca nivel.

Lo que **sí** cambió de proporción: el grafito dejó de ser una banda que se
alterna y pasó a ser un **entorno**. La cabecera, el hero completo con su
método, el proceso y el pie van en grafito; el papel queda para el contenido de
lectura. La página está enmarcada arriba y abajo como el frontal de un equipo.

La rejilla técnica de 72 px **se retiró de casi todas partes** y quedó donde
tiene sentido: el banco de trabajo del hero. Repetida en cada sección era el
papel pintado que el encargo criticaba.

## 2. Identidad provisional (skill `brand`)

### Posicionamiento

El especialista al que llaman **otros talleres** cuando la centralita se les
resiste. No es un taller generalista ni una tienda de tuning.

### Personalidad

| Rasgo | Significa | No significa |
|---|---|---|
| Técnico | Sabe de lo que habla y lo demuestra | Jerga que excluye al particular |
| Directo | Dice qué pasa y qué se puede hacer | Seco o antipático |
| Honesto | Si no tiene solución, lo dice | Prometer resultados garantizados |
| Preciso | Trabaja sobre la causa | Presumir de perfección |

### Voz

- **Tono:** formal-neutro. Trata de «tú», sin coloquialismos forzados.
- **Lenguaje:** técnico cuando aporta, llano cuando no. «La centralita entra en
  modo emergencia», no «el módulo electrónico de control experimenta una
  condición degradada».
- **Carácter:** serio, sin ser solemne.
- **Emoción:** contenida. Cero signos de exclamación.

Adaptación por contexto: la web pública explica; el panel informa en el mínimo
número de palabras posible.

### Lo que la voz NO hace

Nada de «los mejores», «líderes del sector», «calidad garantizada» ni «expertos
con años de experiencia». Ninguna cifra, premio, certificación, garantía, plazo,
precio ni testimonio aparece en el sitio, porque **no tenemos ninguno
confirmado**.

> La web actual del cliente afirma «casi 30 años de experiencia y más de 10.000
> vehículos potenciados». **No se ha trasladado.** No es un dato inventado por
> nosotros, pero tampoco está verificado. Está registrado en
> [site-architecture.md](site-architecture.md) §7 a la espera de confirmación.

### Dirección fotográfica

Hay tres fotografías de banco de imágenes con licencia comercial, elegidas y
revisadas una a una (ver [image-sources.md](image-sources.md)). El criterio,
también para las propias del taller cuando lleguen:

- **Sí:** manos trabajando, centralitas abiertas, placas, herramienta real,
  banco de trabajo, detalle macro de componentes. Luz natural o de taller.
  Grano y suciedad reales.
- **No:** bancos de imágenes de coches deportivos al atardecer, humo de ruedas,
  velocímetros, ordenadores con código verde, apretones de manos corporativos.
- **Tratamiento:** sin filtros de color, sin viñeteados, sin duotonos. El cobre
  aparece en la interfaz, no forzado sobre las fotos.
- **Ninguna se presenta como trabajo real de JM Repro Cars.** Ilustran el
  oficio; los textos que las acompañan hablan en general, nunca de «nuestros
  trabajos».

**Ninguna imagen se genera ni se descarga sin revisar su licencia.** El sitio no
enlaza imágenes externas.

---

## 3. Qué acepté y qué rechacé de `ui-ux-pro-max`

La skill se consultó con `--design-system` para la web pública y para el panel,
más búsquedas de tipografía y del stack Astro. Sus resultados son
recomendaciones, no órdenes: varias contradecían el encargo.

### Aceptado

| Recomendación | Uso |
|---|---|
| Patrón «Trust & Authority» y su orden de secciones | La portada sigue hero → propuesta → servicios → proceso → CTA |
| Estilo «Minimalism & Swiss» para el panel | Denso, sobrio, rejilla, sin adornos |
| Estilo plano, sin degradados ni sombras decorativas | Adoptado en ambas superficies |
| «Acento solo para la llamada a la acción» | El cobre se reserva a acciones y a marcar sección |
| Escala de espaciado de 4 px | Base del sistema |
| Objetivos táctiles ≥44 px, foco visible, contraste 4.5:1 | Aplicado y verificado |
| `prefers-reduced-motion` | Regla global, no por componente |
| «Sin emojis como iconos» | Todos los iconos son SVG en línea |
| Guía de Astro: `.astro` para lo estático, y funcionar sin JS | Base de la arquitectura |
| Densidad alta para el panel, estándar para la web | Dos ritmos distintos, mismos tokens |

### Rechazado

| Recomendación | Por qué |
|---|---|
| **Paleta azul marino + naranja** (`#1E40AF` sobre `#EFF6FF`) | Es el azul de confianza de cualquier SaaS. El encargo pedía algo distintivo, y esto es justo lo contrario |
| **Inter para títulos y Playfair Display para el cuerpo** | Playfair es una serif de display: como fuente de cuerpo es una mala recomendación, y una serif editorial no encaja con electrónica del automóvil |
| **«Insignias de seguridad, certificaciones, estadísticas, precios transparentes»** | No tenemos ninguna. Inventarlas estaba prohibido explícitamente |
| **«No certifications» como antipatrón** | La skill considera un fallo no mostrar certificaciones. Preferimos no mostrarlas a fabricarlas |
| **GSAP + ScrollTrigger para las animaciones** | Evaluado tres veces, descartado tres veces. Lo que hay —montaje del despiece, trazado de la pista, revelado, paralaje, el paso a paso de la placa y el traslado entre unidades— sale en **2,9 kB comunes más 1,4–2,2 kB en las dos páginas que lo necesitan**, con IntersectionObserver, rAF y un `setTimeout`. La última evaluación fue la de `IdentityTransfer`: lo que anima es **una transición de `transform` y otra de `opacity` por capa**, disparadas al cambiar un `data-state`; eso es CSS, y GSAP serían ~70 kB para hacer exactamente lo mismo en un sitio que recibe 10–20 conversaciones al día |
| **Carrusel de logotipos de clientes** | No hay clientes que se puedan mostrar. El encargo pedía no meter un carrusel por obligación |
| **Tema oscuro para el panel** | Se usa de día en un taller. Light-first es más legible. Los tokens dejan el tema oscuro preparado para más adelante |
| **Fira Code / Fira Sans para el panel** | Dos familias más, cuando IBM Plex + JetBrains ya cubren texto y datos |

**La skill no sustituye el criterio del proyecto.** Donde chocaba con
`CLAUDE.md` o con el encargo, manda el proyecto.

---

## 4. Tokens (skill `design-system`)

Tres capas, en `web/src/styles/tokens.css`:

```
Primitivo   --jm-copper-600: #A8461E      valor crudo
     ↓
Semántico   --color-accent: var(--jm-copper-600)   propósito
     ↓
Componente  clases de Button.astro / campos del panel
```

**Los componentes usan siempre la capa semántica.** No hay ni un color, tamaño o
sombra suelto en una plantilla.

### Color

| Rol | Token | Valor |
|---|---|---|
| Lienzo | `--color-canvas` | `#FAFAF8` papel cálido |
| Superficie | `--color-surface` | `#FFFFFF` |
| Superficie inversa | `--color-surface-inverse` | `#12171C` grafito |
| Texto | `--color-ink` | `#12171C` |
| Texto atenuado | `--color-ink-muted` | `#4A5763` |
| Acento | `--color-accent` | `#A8461E` cobre |
| Acento sobre oscuro | `--color-accent-on-dark` | `#E5A986` |
| Borde | `--color-border` | `#D3DAE1` |
| Foco | `--color-focus` | cobre |

Estados de solicitud, de familia distinta al cobre a propósito:

| Estado | Color | Fondo |
|---|---|---|
| `COLLECTING` | acero `#1F5F9E` | `#E7EFF8` |
| `HUMAN` | oro `#8A6100` | `#F7EEDA` |
| `CLOSED` | grafito `#4A5763` | `#E8ECF0` |

**Los 18 pares de color se verificaron numéricamente antes de fijarlos.** El más
ajustado es el oro sobre papel, a 5,30:1. Todos superan AA para texto (4.5:1) y
para interfaz (3:1). El color **nunca** es el único indicador: cada estado lleva
su etiqueta de texto.

### Tipografía

**Una sola superfamilia, tres papeles.** IBM Plex Sans para el texto y JetBrains
Mono para los datos siguen igual; se añade **IBM Plex Sans Condensed** para los
titulares.

| Papel | Familia | Pesos | Por qué |
|---|---|---|---|
| Display | IBM Plex Sans **Condensed** | 600, 700 | Estrecha: gana tamaño sin ganar ancho, así que «Después se toca.» cabe en una línea a 88 px. Y tiene el aire de la etiqueta serigrafiada de un equipo industrial |
| Texto | IBM Plex Sans | 400, 500, 600 | Herencia de ingeniería sin ser la Inter que lleva media web |
| Datos | JetBrains Mono | 500 | DTC, VIN y matrículas con cifras tabulares |

Al ser la misma superfamilia, display y texto **no pueden desafinar**: es una
variación de ancho, no una segunda tipografía. Las tres son SIL OFL y van
**autoalojadas** con `@fontsource`, sin enlazar a Google Fonts, lo que evita
enviar la IP del visitante a Google —un problema real de RGPD en la UE—.

La condensada se importa **solo en subconjunto latino** (`latin-600.css`,
`latin-700.css`), que cubre el castellano entero. Coste real medido: **+39 kB**
sobre las fuentes que ya se descargaban; 128 kB en total para un visitante
español.

#### Escala fluida

La escala anterior era fija y estrecha. Ahora casi todos los tamaños son
`clamp()`, de modo que **el salto de 1440 a 1920 es real**, no cosmético:

| Token | 375 px | 1440 px | 1920 px | Uso |
|---|---|---|---|---|
| `--text-mega` | 44 px | 88 px | 88 px | La tesis del hero. **Una vez por sitio** |
| `--text-display` | 36 px | 68 px | 68 px | `h1` de páginas interiores |
| `--text-h2` | 28 px | 48 px | 48 px | Titulares de sección |
| `--text-h3` | 20 px | 24 px | 24 px | Titulares de bloque |
| `--text-lead` | 17 px | 21 px | 21 px | Entradilla tras un titular |

Cuerpo a 16 px con interlineado 1.6. Medida de línea acotada con
`--container-prose` (42rem ≈ 70 caracteres): la escala crece, la medida no.

#### Anchuras

Tres contenedores, tres propósitos. El que arregla la columna perdida en el
centro de una pantalla grande es `--container-wide`:

| Token | Valor | Quién lo usa |
|---|---|---|
| `--container-wide` | 90rem (1440 px) | **Toda la web pública** |
| `--container-content` | 72rem (1152 px) | El panel. Se deja intacto a propósito |
| `--container-prose` | 42rem | Párrafos largos, dentro de cualquiera de los dos |

Los márgenes laterales crecen con la pantalla: `1.25rem → 2rem → 2.5rem →
3.5rem`. Y hay composiciones que **se salen del contenedor a propósito** —la
fotografía de «El trabajo por dentro» llega al borde de la pantalla—, porque
enmarcar una foto en una casilla era justo lo que la hacía parecer pegada.

### Espaciado, radios, sombras, movimiento

- **Espaciado:** base 4 px. Secciones a `5rem` / `7rem`.
- **Radios:** 0 / 2 / 4 / 6 px, más `pill`. Pequeños a propósito.
- **Sombras:** tres niveles, todas muy contenidas. La jerarquía la da el borde.
- **Breakpoints:** 640 / 768 / 1024 / 1280 / 1536.
- **Apilamiento:** escala `--z-*` definida una vez. Nadie inventa un 9999.
- **`--header-height`** existe como token porque el índice pegajoso de
  `/servicios` y los `scroll-margin` de las anclas lo necesitan exacto. Medido a
  ojo, el titular quedaba medio tapado al saltar a un ancla.

#### Movimiento

Aquí sí hay un cambio de postura respecto a la primera versión, que no tenía más
que transiciones de color. Ahora el movimiento es parte de la identidad, con
cinco duraciones y tres curvas:

| Token | Valor | Para qué |
|---|---|---|
| `--duration-fast` / `base` / `slow` | 120 / 180 / 260 ms | Interfaz: color, foco, desplazamientos de 2 px |
| `--duration-reveal` | 620 ms | Aparición al entrar en pantalla |
| `--duration-assembly` | 1000 ms | El despiece del hero montándose |
| `--duration-draw` | 1600 ms | El trazado de la pista del proceso |
| `--ease-settle` | `cubic-bezier(0.16, 1, 0.3, 1)` | Sale rápido y se posa. Es la curva del despiece |

Cinco movimientos, cada uno con una función declarada:

1. **El despiece se separa al cargar** (CSS puro, sin JavaScript). Las capas
   parten agrupadas y se abren de abajo arriba, escalonadas 110 ms. Es la
   metáfora entera del sitio ejecutándose en un segundo.
2. **La pista de cobre del proceso se traza** de izquierda a derecha cuando la
   sección entra en pantalla, y los cuatro pads aparecen a su paso. Narra el
   recorrido de un trabajo. Una sola vez; no es un bucle.
3. **Revelado al entrar en pantalla**, 20 px y un fundido, escalonado dentro de
   cada grupo. Orientación, no adorno.
4. **Paralaje por puntero sobre el despiece**: cada capa se desplaza en
   proporción a su altura, 9 px como máximo la de arriba. Da volumen a la pieza
   cuando mueves el ratón. Solo con puntero fino.
5. **El traslado entre unidades de `/servicios/clonacion-ecu`**: cada capa cruza
   de la unidad original a la de sustitución cuando le toca. Es la explicación
   del servicio, no un adorno; lo conduce el visitante con botones y se
   reproduce una sola vez al entrar en pantalla. Ver §5.3.

Lo que **no** se hizo, y es tan importante como lo que sí: sin pantalla de
carga, sin secuestro del scroll, sin partículas, sin cursor propio, sin texto
tecleándose, sin parallax de fondo, sin animar todas las secciones con el mismo
efecto y sin efectos continuos de fondo.

#### Cómo degrada

Dos interruptores puestos por un script en línea del `<head>`, antes de pintar:

```
html.js       hay JavaScript
html.js-anim  hay JavaScript Y no se ha pedido menos movimiento
```

**Todas** las reglas que ocultan algo cuelgan de `.js-anim`. Si el script no
llega a ejecutarse, o si el sistema pide movimiento reducido, la página se sirve
entera y visible desde el primer momento. Las animaciones de carga usan
`animation-fill-mode: both`, así que al colapsarlas a 0,01 ms se quedan en su
estado final en vez de desaparecer.

Verificado con capturas reales: **sin JavaScript la portada es idéntica**, y con
movimiento reducido no queda ni un elemento por debajo de opacidad 0,9.

## 5. Componentes (skill `ui-styling`)

| Componente | Tipo | Notas |
|---|---|---|
| `BrandMark` | Astro | Marca centralizada. Símbolo desde 44 px y wordmark en la condensada: antes se perdía dentro de la cabecera |
| `Seo` | Astro | Todos los metadatos, un solo sitio |
| `Button` | Astro | Cinco variantes (se añade `onDark`), dos tamaños, altura mínima 44 px |
| `WhatsAppLink` | Astro | Icono SVG, mensaje precargable, texto para lector |
| `SiteHeader` | Astro | Siempre en grafito. Navegación móvil con `<details>`: **sin JavaScript** |
| `SiteFooter` | Astro | Cuatro columnas + aviso legal, al ancho de la web pública |
| `FinalCta` | Astro | Banda de cobre, con un eco de la pista de fondo |
| **`EcuExploded`** | Astro | **La firma del sitio.** Despiece de centralita en cuatro capas rotuladas, con coreografía de montaje y paralaje |
| **`ServiceDiagram`** | Astro | Un dibujo por servicio, en la misma proyección y con los mismos materiales |
| **`ProcessTrack`** | Astro | Los cuatro pasos sobre una pista de cobre que se traza. Compartido por portada y `/servicios` |
| **`PowerBand`** | Astro | **La firma de `/servicios/reprogramacion`.** La entrega a lo largo del régimen: la curva de partida, la del objetivo elegido y el tramo donde ese objetivo actúa. **Sin una sola cifra, sin escala y sin eje vertical rotulado.** Ver §5.15 |
| **`FaultTrace`** | Astro | **La firma de `/servicios/reparacion-ecu`.** La placa vista desde arriba, con el recorrido de una señal desde el conector, tres zonas que se marcan según se revisan y el punto donde el recorrido se interrumpe. Ver §5.1 |
| **`IdentityTransfer`** | Astro | **La firma de `/servicios/clonacion-ecu`.** Dos unidades compatibles, cuatro planos de información sobre la original y cuatro huecos sobre la de sustitución que se van ocupando con una copia de cada uno. Ver §5.3 |
| **`MessageBuilder`** | Astro | El primer mensaje, armado por el visitante y visible antes de enviarlo. Ver §5.4 |
| **`CaseHarness`** | Astro | **La firma de `/como-trabajamos`.** Seis conductores rotulados que convergen en un conector y salen como uno solo cruzando el límite de la revisión. El único dibujo del sitio que no es dimétrico. Ver §5.6 |
| **`RouteSwitch`** | Astro | Particular o taller, con su plantilla de WhatsApp. Un grupo de radios y CSS: sin JavaScript. Ver §5.7 |
| **`ServiceOptions`** | Astro | El abanico de reprogramaciones como acordeón de `<details>`: una abierta a la vez, altura animada con `::details-content` y **sin una línea de JavaScript para abrirse**. Ver §5.17 |
| **`CalcLink`** | Astro | «Calcular mejora»: **ancla interna** que baja hasta el configurador, en el hero y como pestaña pegajosa. Ver §5.17 |
| **`PowerConfigurator`** | Astro | El configurador de Tuning-shop.com bajo activación explícita, con su aviso permanente fuera del marco y su estado de fallo. Es el destino de `CalcLink`. Ver [embed-tuning-shop.md](embed-tuning-shop.md) |
| `LoginForm` | React | Estados, errores, foco gestionado |
| `AdminShell` | React | Sesión, navegación, cabecera, logout |
| `Dashboard` | React | Cifras, estados de carga, error y vacío |

Y una pieza que no es un componente pero sostiene tres de ellos:

**`src/lib/iso.ts`** — la proyección dimétrica 2:1. Cara superior con chaflán,
caras laterales visibles, cajas extruidas, recorridos de pista y retículas.
**Ningún `d="…"` se escribe a mano**: si dos caras no encajan es un error de
cálculo, no de pulso, y se arregla en un sitio. Es también lo que garantiza que
el despiece del hero y los tres diagramas de servicio vivan en el mismo espacio.

**No se instaló shadcn/ui ni Radix**, ni ninguna librería de animación. La web
pública necesita botón, enlace y `<details>`; el panel todavía no tiene diálogos
ni combos. Cuando llegue el detalle de solicitud con filtros, se reevalúa.

## 5.1 El recorrido de la placa (`FaultTrace`)

La página de reparación necesitaba una pieza propia, no una variante de la de
reprogramación. El razonamiento, por si hay que rehacerlo:

- **Reprogramación abre la capa de software.** Reparación baja una profundidad
  más: la placa. Y lo que se hace en ella no es «tocar», es **localizar**.
- Localizar es seguir un camino hasta donde deja de haberlo. Eso, dibujado, es
  una línea, unas zonas y una interrupción. No hace falta nada más, y cualquier
  cosa que se añada empieza a parecerse a una diagnosis falsa.
- **Las zonas se marcan según se revisan, y la marca se acumula.** «Claridad
  sobre lo que se ha revisado» es parte del servicio; al terminar el recorrido
  se ve todo lo comprobado, no solo lo último.
- **La interrupción está entre zonas, en un punto cualquiera.** No señala un
  componente ni un tipo de avería: eso sería inventar un diagnóstico. El pie del
  dibujo lo dice con todas las letras, y el texto de la página repite que puede
  estar en otro sitio, o no estar en la centralita.
- **Ni una cifra, ni un código, ni una medida, ni una escala**, como en
  `PowerBand` y `EcuExploded`. No hay escáner falso, ni interfaz que aparente
  estar conectada a un vehículo.

Dos decisiones de dibujo que costaron una revisión cada una, anotadas para no
repetirlas:

1. **Los contornos de zona eran del mismo cobre y del mismo grosor que el
   recorrido.** El resultado eran tres recuadros y una línea perdida entre
   ellos: exactamente lo contrario de lo que cuenta la página. Las zonas pasaron
   a ser una mancha con un filo tenue, y **el cobre pleno quedó para una sola
   cosa**.
2. **El recorrido se dibujaba antes que las piezas**, así que su primer tramo
   desaparecía bajo el conector y bajo los componentes de la primera zona, y la
   señal parecía empezar a mitad de la placa. Ahora va el último, por encima de
   todo: es el asunto del dibujo.

#### Cómo se conduce, y cómo degrada

El paso a paso es lo único del sitio atado al desplazamiento. Reglas:

- El dibujo **se sirve completo** —zonas revisadas, recorrido entero, punto de
  intervención marcado— y los seis pasos son una lista normal. Sin JavaScript,
  con movimiento reducido y por debajo de 1024 px es lo único que hay, y se
  entiende igual.
- El paso a paso se activa solo si hay JavaScript, no se ha pedido menos
  movimiento **y** caben dos columnas.
- **El interruptor se pone al cargar, no al entrar la sección en pantalla.**
  Conducido, cada paso ocupa 52 vh; ponerlo a mitad de lectura estiraría la
  página casi dos mil píxeles bajo los pies del visitante, y quitarlo al salir
  la encogería otra vez.
- La línea de lectura va al **50 % de la pantalla**, y no es arbitrario: con
  pasos de 52 vh y texto centrado, el del paso activo barre de 76 vh a 24 vh, es
  decir, se pasa toda su vida dentro de la zona de lectura.
- La lista lleva **30 vh de recorrido de sobra al final**. Sin ellos el dibujo
  se despegaba durante el último paso —justo el del punto de intervención— y se
  metía bajo la cabecera. El mínimo calculado es 24 vh.
- El estado de cada paso se marca **con la línea lateral y con la etiqueta,
  nunca bajando el contraste del texto**: lo que hay que leer se lee siempre.
- Coste: **1,4 kB** de JavaScript en línea sobre los 2,9 kB comunes. Se volvió a
  descartar GSAP; esto son un `IntersectionObserver`, un `rAF` y una fracción de
  `stroke-dashoffset` calculada en el build (`tracePath` en `src/lib/iso.ts`),
  no en el navegador.

---

## 5.2 Composición de `/servicios/reparacion-ecu`

El encargo pedía expresamente **no repetir el macro-ritmo** de la página de
reprogramación. La crítica de partida, sobre la propia página hermana: cinco de
sus siete secciones abren igual —etiqueta mono, `h2`, entradilla—, que es el
defecto que §1 le reprocha a la primera versión del sitio y que se había colado
otra vez a medias; y el icono de casilla marcada ya aparece en la portada *y* en
reprogramación, camino de volverse papel pintado como la etiqueta.

Ninguna de las ocho secciones de la página nueva comparte composición con otra:

| Sección | Forma | Por qué esa y no otra |
|---|---|---|
| Hero | Tipográfico, con una **placa de dos bloques** al lado: reparar / sustituir | Todo el presupuesto de audacia se gasta en el recorrido, que llega después. Un segundo diagrama aquí competiría con él. Y la distinción reparar/sustituir es la que ordena la página entera, así que se dice de entrada |
| Qué es | **Nota técnica: párrafo y margen** | Las advertencias («no es una reprogramación», «cuando no hay arreglo») caben al margen sin partir la lectura en tres secciones más ni acabar en letra pequeña |
| El recorrido | Dibujo fijo + seis pasos | La firma. Ver §5.1 |
| Cuándo preguntar | **Índice de filas** con la situación a la izquierda y el dato que hace falta a la derecha | Escrito como lo contaría quien tiene el problema, para que alguien se reconozca en una línea. Tarjetas idénticas harían justo lo contrario |
| Qué necesitamos | **Hoja de datos**, dos grupos | La diferencia entre «hace falta» y «ayuda si lo tienes» es real, y separarla evita dar a entender que hay que desmontar la centralita antes de escribir |
| Límites | Cuatro columnas separadas por filetes verticales, en grafito | Va en un sitio visible, no en letra pequeña al final. El filete vertical no se usa en ninguna otra parte del sitio |
| Otros servicios | **Filas con filete**, no tarjetas | La misma información que en reprogramación, con otra construcción |
| Llamada final | `FinalCta` en cobre | El cierre del sitio, compartido a propósito |

**Sin fotografía, y es una decisión, no un olvido.** Las dos ubicaciones donde
encajaría —banda a sangre junto al texto, o ambiente del hero— son exactamente
las construcciones de la portada y de reprogramación, y la foto de soldadura ya
ilustra «reparar la placa» en la portada. Una foto del banco de otro para una
página cuyo argumento es «miramos dentro de ESTA unidad» es la clase de prueba
más débil que se puede aportar. El recurso distintivo es el dibujo.

---

## 5.3 El traslado entre unidades (`IdentityTransfer`)

La firma de `/servicios/clonacion-ecu`. El razonamiento, por si hay que
rehacerlo:

- **Las otras dos páginas bajan por la pieza; ésta se mueve de lado.**
  Reprogramación abre la capa de software, reparación baja a la placa. Clonar no
  es bajar una profundidad más: es que hay **dos unidades**, y que lo que viaja
  entre ellas no es la caja, es la información. El dibujo tenía que decir eso
  antes que ninguna otra cosa.
- **La original no se vacía.** Las capas de la izquierda no se van a ninguna
  parte: lo que cruza es una copia, y por eso hay dos juegos de planos y no uno
  que se desplaza. Un dibujo en el que la pila de la izquierda se desmonta
  contaría que la original queda inservible, que es lo contrario de lo que
  ocurre.
- **La de sustitución empieza con huecos**, dibujados a trazos, y se sirven
  siempre. Son el argumento entero de la página: una unidad compatible sin la
  información del vehículo todavía no es la centralita de ese coche.
- **Cuatro capas y una comprobación.** Software, calibración, configuración e
  identificadores, y datos de adaptación; después, que la unidad de sustitución
  haga en el vehículo lo que hacía la anterior. La comprobación es un paso, no
  un adorno: mientras no se verifica, no hay trabajo terminado.
- **La pila se llena de arriba abajo**, en el mismo orden en que se leen los
  pasos. La primera versión la ordenaba al revés —el software abajo, por la
  intuición de que es el cimiento— y el dibujo se leía en contra de sí mismo:
  bajando por la página, la secuencia subía. Estos planos flotan, no se apoyan
  en nada, así que el orden lo manda la lectura.
- **Ni una cifra, ni un código, ni una dirección de memoria, ni una medida.**
  Misma regla que en `PowerBand`, `FaultTrace` y `EcuExploded`. Los planos se
  distinguen por su textura —renglones, retícula, campos, puntos sueltos—, no
  por su contenido, porque no hay contenido que enseñar sin inventarlo.
- **No se dibuja ningún procedimiento.** Ni por dónde se lee, ni con qué, ni en
  qué orden se escribe. El dibujo cuenta *qué* tiene que conservarse; el *cómo*
  no es contenido de una web pública, y menos en un servicio que roza el sistema
  antirrobo del vehículo.
- **La comprobación se marca con un filo de cobre sobre la unidad y una pista
  que sale de su conector**, no con un anillo. El anillo ya marca el punto de
  intervención en la página de reparación y el componente intervenido en los
  diagramas de servicio: una tercera vez lo convertiría en decoración.

### Lo conduce el visitante, no el desplazamiento

Es la decisión de implementación importante, y es deliberadamente **la contraria
que en `FaultTrace`**:

- El paso a paso de la placa va atado al scroll. Repetir ahí el mecanismo habría
  hecho hermanas dos páginas que tienen que distinguirse, y el encargo pedía
  expresamente no repetir el ritmo.
- Además, aquí volver atrás importa. La pregunta que deja esta página es «¿y esa
  capa, qué era?», y con el scroll la respuesta obliga a rebobinar la página.
  Con botones, no.
- Los títulos de los cinco pasos **se convierten en botones desde el script**,
  no en la plantilla. Sin JavaScript un botón que no controla nada es peor que
  un título, y el `<h3>` sigue siendo un encabezado real para un lector de
  pantalla.
- Se reproduce **una sola vez** al entrar en pantalla, para que el mecanismo se
  entienda sin tener que descubrir el control. No es un bucle, y cualquier
  interacción lo detiene.

### Cómo degrada

| Situación | Qué se ve |
|---|---|
| Sin JavaScript | El dibujo **completo**: las cuatro capas en las dos unidades y la comprobación hecha. Los cinco pasos, una lista normal |
| Movimiento reducido | Igual, y sin reproducción automática. Los botones sí funcionan: controlar no es moverse |
| Menos de 768 px | Se retiran los rótulos de las capas y sus líneas de guía —el dibujo se escala a un tercio y quedarían en cinco píxeles—, y los de las unidades pasan a una versión corta y más grande. Los nombres completos están en la lista de pasos y en la descripción del dibujo |

Verificado con navegador real en los tres modos. Coste: **1,4 kB** de JavaScript
en línea, un `IntersectionObserver` y un `setTimeout`.

## 5.4 El constructor del mensaje (`MessageBuilder`)

El sitio ya precargaba plantillas de WhatsApp desde varios botones. Esta página
necesitaba algo más, por una razón concreta suya: **el visitante no siempre puede
saber lo que le pediríamos**. Puede no tener las referencias, puede no distinguir
la unidad original de la de sustitución y puede no haber recibido todavía la de
recambio. Una plantilla fija con campos que no puede rellenar le dice, sin
querer, que todavía no le toca escribir. Y sí le toca: eso es justo lo que el
encargo pedía evitar.

Así que la plantilla base pide solo lo que cualquiera sabe —vehículo,
motorización, por qué hay que sustituirla, estado, qué se ha probado— y el
visitante añade con casillas lo que tenga. De paso ve **exactamente qué va a
enviar antes de enviarlo**, en la tipografía de datos del sitio: es lo que
convierte un botón de WhatsApp en una consulta útil.

Degrada solo: el bloque de casillas nace con `hidden` y lo abre el script, así
que sin JavaScript quedan la vista previa con la plantilla base y un enlace de
WhatsApp normal y funcional. Coste: **0,8 kB**.

---

## 5.5 Composición de `/servicios/clonacion-ecu`

Misma exigencia que en la página de reparación: ninguna sección repite la
composición de otra de la misma página, y el macro-ritmo no puede ser el de sus
hermanas. Y una más, propia de ser la tercera: **no puede parecer la segunda con
otros textos**.

| Sección | Forma | Por qué esa y no otra |
|---|---|---|
| Hero | Tipográfico, con la tesis escrita **a lo ancho** y las dos mitades unidas por una pista de cobre que se traza | La idea entera cabe en una línea —«La unidad cambia. Su identidad permanece.»—, así que se dice en una línea. Es el único sitio del hero donde hay dibujo, y es la pista del logotipo, no una pieza más |
| La transferencia | El dibujo a todo el ancho y los cinco pasos en una tira de control debajo | La firma. Llega **inmediatamente después del hero**: reprogramación pone su dibujo *en* el hero y reparación retrasa el suyo hasta media página; ésta lo pone segundo, y así las tres tienen un ritmo distinto. Ver §5.3 |
| Las tres intervenciones | **Comparación de tres columnas con las filas alineadas** (`subgrid`) | Sustituye al bloque «¿No es esto lo que necesitas?» que cierra las otras dos, y hace su trabajo mejor: quien llega aquí buscando otra cosa no necesita una tarjeta bonita, necesita ver la diferencia. La columna de esta página se marca con filete de cobre y no enlaza a ningún sitio |
| Antes de confirmar | Titular grande a la izquierda, tres comprobaciones separadas por filetes a la derecha | El contrapeso honesto, en un sitio visible. En grafito, para que la página no se lea como una promesa continua |
| Situaciones | **Rótulo colgando en el margen** y la situación escrita entre comillas, en primera persona | El índice de la página de reparación es de filas con borde y voz de manual. Aquí las frases son las que diría quien tiene el problema, y el ritmo lo llevan los rótulos, no los filetes |
| El mensaje | Lista a la izquierda, **constructor con vista previa** a la derecha | Ver §5.4 |
| Llamada final | `FinalCta` en cobre | El cierre del sitio, compartido a propósito |

**Sin fotografía**, por el mismo motivo que en reparación y con uno más: aquí lo
que hay que enseñar son **dos** unidades y la relación entre ellas, y eso no
existe en ningún banco de imágenes sin parecer un montaje. El recurso distintivo
es el dibujo.

**El `h1` es descriptivo**, «Clonación de centralita», como en las otras dos
páginas de servicio. La tesis va debajo, a tamaño de `h2`: el `h1` que se salta
las palabras clave es un riesgo que el sitio corre **una sola vez**, en la
portada, y que en una página de servicio no compensa.

---

## 5.6 El mazo de una consulta (`CaseHarness`)

La firma de `/como-trabajamos`. El razonamiento:

- **Las tres páginas de servicio dibujan la pieza**: el mapa, la placa, dos
  unidades. Ésta no habla de una centralita: habla de lo que ocurre **antes** de
  que haya una encima de la mesa. Por eso es **el único dibujo del sitio que no
  usa `iso.ts`**, y está bien que se note: es un esquema de cableado, no una
  pieza en perspectiva.
- **Seis conductores que convergen en uno**, no una pista con paradas. Esa
  distinción es todo: la pista con paradas ya existe —el proceso de cuatro pasos
  de la portada— y el encargo pedía expresamente no repetirla. Un mazo que se
  recoge dice otra cosa: varias entradas, una salida.
- **Tres gruesos y tres finos.** Los gruesos identifican el vehículo y dicen qué
  pasa; los finos ahorran vueltas. La jerarquía se ve —grosor del trazo y color
  del rótulo—, y **no se explica**: el pie que lo hacía se quitó. Un dibujo que
  necesita instrucciones no está terminado.
- **La línea de puntos es el traspaso**, y es lo único que cruza el dibujo de
  arriba abajo.
- **Termina en un pad rotulado «Al taller»**, no en un diagnóstico. Ningún tramo
  representa una herramienta, ni hay nada que insinúe una respuesta automática.
  El conector quedó sin rótulo: seis cables entrando en una caja ya se
  entienden.
- **Ni una cifra, ni un código, ni una medida.** Misma regla que el resto.

### Dos decisiones de dibujo que costaron una revisión

1. **Los rótulos estaban en una columna a la izquierda.** El más largo fijaba el
   margen en 184 unidades de 1000: a 375 px eso son 69 px de nada, y encima
   obligaba a que los rótulos cupieran en ese hueco, o sea, a dejarlos en 5 px de
   alto. Pasaron a ir **encima de su conductor**, donde caben tan anchos como
   haga falta y pueden crecer en pantalla pequeña hasta leerse.
2. **Los dobleces iban al revés.** Con las verticales en el orden equivocado los
   conductores se cruzaban entre sí y el dibujo era una maraña, que es justo lo
   contrario de lo que cuenta. Ahora cada uno dobla en su vertical y entra en su
   carril sin cruzar a ninguno.

### Coste

**Cero bytes de JavaScript.** Los conductores se trazan con el mecanismo
`.trace-draw` que ya vive en `tokens.css` y que mide `motion.ts`; el orden lo
lleva un `transition-delay` por conductor, y el resto entra con `--step`. Sin
JavaScript, o con movimiento reducido, el esquema se sirve entero y trazado.

## 5.7 El selector de recorrido (`RouteSwitch`)

Particular o taller, cada uno con lo que suele tener a mano y con su plantilla de
WhatsApp. **Sin una línea de JavaScript**: es un grupo de radios con sus
etiquetas y dos paneles, y el que se ve lo decide `:checked` con un combinador
de hermanos.

No es una postura de ahorro; es que el resultado es mejor:

| | Radios + CSS | Pestañas con JavaScript |
|---|---|---|
| Sin JavaScript | Cambia de panel | Se queda en el primero, o hay que mostrar los dos |
| Teclado | Flechas, de serie | Hay que implementar `role="tablist"` y foco itinerante |
| Al cargar | Cada panel nace en su sitio | El panel oculto parpadea hasta que llega el script |
| Estado | Ninguno guardado | Tentación de `localStorage` |

Los radios van ocultos —no del teclado ni del lector— y **el foco se pinta sobre
la etiqueta**, que es lo que se ve; sin eso, tabular hasta el selector no se
notaría. Nada se envía ni se guarda: lo único que sale de ahí es el enlace de
WhatsApp que el visitante decide abrir, con la plantilla ya escrita en el `href`.

Cada panel son **cuatro puntos y el botón**: ni párrafo de introducción, ni nota
al pie, ni título. La pestaña ya dice quién eres, y todo lo demás repetía. La
advertencia de que no es una lista de requisitos —«si te falta algún dato,
escríbenos igualmente»— se dice **una vez**, en la página y debajo del
selector.

Está escrito para exactamente dos opciones: el CSS empareja radio *n* con panel
*n* por `nth-of-type`. Una tercera necesitaría su par de reglas.

---

## 5.8 Composición de `/como-trabajamos`

El encargo pedía que la página **no fuera el proceso de cuatro pasos con más
palabras**. La respuesta no es escribir más, es cambiar de pregunta: los cuatro
pasos cuentan *qué se hace*; esta página cuenta *qué pasa con tu mensaje* y,
sobre todo, **qué no pasa**.

### La primera versión sobraba por la mitad, y es la lección de la página

La versión inicial contaba **cinco veces la misma idea** —envías información, se
revisa, te decimos el siguiente paso—: en el hero, en una sección entera
titulada «Primero se ordena. Después se decide.», en el esquema, en los dos
recorridos y en el cierre. Y repartía media docena de frases defensivas —«aquí
no se diagnostica», «no es inmediato», «no damos precio antes de revisar», «no
hace falta traerlo resuelto»— que por separado eran razonables y juntas
convertían la página en un descargo de responsabilidad.

El recorte, y por qué cada parte:

- **Fuera la sección «Primero se ordena. Después se decide.»**, entera. Estaba
  bien construida —el libro de dos columnas «qué ocurre / qué no ocurre aquí»
  era una composición nueva y limpia—, pero decía con tres columnas de texto lo
  que el esquema dice mejor y en un vistazo. Que una sección esté bien resuelta
  no es motivo para conservarla si repite.
- **El esquema sube al segundo lugar**, pegado al hero, en el mismo banco de
  trabajo. Es lo que explica el funcionamiento: cualquier párrafo puesto antes
  estaba diciendo con palabras lo que el dibujo dice solo.
- **Una sola frase de cautela** en toda la página, `CASE_DISCLAIMER`: «cada caso
  se revisa antes de confirmar el trabajo, la disponibilidad o el presupuesto».
- **Los paneles del selector bajaron a cuatro puntos** y perdieron su párrafo de
  introducción y su nota al pie. Ver §5.7.

### El segundo recorte quitó lo que quedaba de auto-descripción

Con 276 palabras la página seguía hablando de sí misma en vez de servir. El
segundo pase aplicó la regla que la gobierna de aquí en adelante: **cada frase
tiene que darle un dato al cliente o ayudarle a escribir; si solo describe cómo
trabajamos, sobra.**

- **El hero pasó a papel cálido.** Era la tercera banda oscura seguida y pesaba.
  Con el esquema en oscuro en medio, el ritmo es claro → oscuro → claro. Sin
  rejilla técnica: ésa es del banco de trabajo, y aquí lo que se busca es luz.
- **Fuera la franja «Después de revisar».** Sus tres resultados —«te pedimos
  algún dato más», «revisamos la unidad o el vehículo», «te indicamos si podemos
  ayudarte»— eran genéricos: valían para cualquier taller de cualquier sector.
  Lo único concreto que había allí, que el precio y el plazo llegan después,
  cabe en una línea debajo del selector.
- **Fuera el pie del esquema**, que explicaba cómo leer los grosores de los
  conductores. Un dibujo que necesita instrucciones no está terminado, y el
  visitante no necesita una clase sobre nuestro recurso visual.
- **Los rótulos del dibujo pasaron a lenguaje llano**: «Lo que llega» → «Lo que
  nos envías», «Revisión» → «Al taller», y el del conector —«El caso, montado»—
  se quitó: seis cables entrando en una caja ya se entienden.
- **Fuera los títulos de los paneles del selector.** La pestaña ya dice quién
  eres.
- **Fuera las repeticiones de la lista de datos.** El vehículo, el motor y qué
  ocurre llegaron a aparecer cuatro veces: entradilla, raíl, sección de datos y
  llamada final. Ahora la entradilla aporta el dato que quita fricción —«puedes
  preguntar antes de mover el vehículo»— y la llamada final explica qué hace el
  botón.

Resultado medido sobre el HTML generado: **de 952 palabras a 276, y de 276 a
201**; de 5.284 px de alto a 3.115 px a 1440. El objetivo de la página dejó de
ser «explicar nuestro proceso» y pasó a ser «hacer muy fácil empezar».

### Composición resultante

| Sección | Fondo | Forma |
|---|---|---|
| Hero | **Papel cálido** | Titular, una línea de entradilla, dos botones y tres datos en el raíl: por dónde se escribe —con el teléfono—, qué contar y qué se recibe |
| El recorrido | **Grafito**, banco de trabajo | Esquema a todo el ancho, sin pie. Ver §5.6 |
| Qué necesitamos para revisar tu caso | Papel | **Selector de radios** con dos paneles de cuatro puntos y dos plantillas. Ver §5.7. Es la sección que convierte: dice qué escribir |
| Llamada final | Cobre | `FinalCta`, el cierre del sitio, compartido a propósito |

Cuatro bandas, y la página se escanea en unos segundos.

**El bloque de proceso de la portada y de `/servicios` se conserva**, y se le
añadió un enlace a esta página. Son cosas distintas: allí hace falta un resumen
de cuatro pasos, aquí está el recorrido. Lo que no se hace es repetir uno en el
otro.

**Sin fotografía.** El recurso es el esquema, y una foto de un móvil o de una
mesa no añadiría nada a una página que habla de un procedimiento, no de una
pieza.

---

## 5.9 El cuadro de conexiones (`ContactBoard`)

La firma de `/contacto`, y el argumento de por qué esa página no es un
formulario ni seis tarjetas: **tres entradas y un solo canal.**

Tres tarjetas —una por servicio, con su capa: software, placa, de unidad a
unidad—, de cada una baja un conductor de cobre, los tres se recogen en un bus
horizontal y de él sale una bajada que termina en un pad de contacto rotulado
con el número de WhatsApp. Es el mismo lenguaje de `CaseHarness`: esquema
plano, sin proyección dimétrica, porque aquí tampoco hay ninguna pieza sobre la
mesa.

**El dibujo no es SVG.** Los conductores son cajas de CSS, y hay una razón
concreta: tienen que caer por el centro exacto de una tarjeta cuyo ancho lo
decide la rejilla. El conductor de cada tarjeta es un `::after` de la tarjeta,
así que se alinea solo; el bus calcula sus extremos a partir del mismo hueco de
rejilla que usan las columnas —con tres columnas iguales, el centro de la
primera está a `(100% − 2g)/6`—, y la bajada cae en el 50%, que con tres
columnas iguales es exactamente el centro de la del medio. Apilado, el bus se
reduce a una sola bajada: no hay nada que recoger.

### El conmutador particular/taller

Un grupo de radios, como `RouteSwitch` (§5.7), y por los mismos motivos. Lo que
cambia entre las dos variantes es **solo la plantilla**: el título, la
descripción y el enlace al servicio son los mismos. Por eso hay tres tarjetas y
no seis; seis dirían que hay seis caminos, y hay tres.

Los ocho enlaces —cuatro rutas × dos variantes— **ya están escritos en el HTML**
con su plantilla codificada en el `href`. No hay ningún `href` que un script
tenga que reescribir, así que no existe el estado intermedio en el que el botón
lleva a la plantilla equivocada. El CSS solo decide cuáles se ven.

### El movimiento, y qué explica

Dos gestos, los dos de una sola pasada:

1. **Al señalar o enfocar una ruta** se encienden su conductor, el bus y el pad.
   Responde a la pregunta que se hace quien duda: si pulso aquí, ¿dónde acabo?
   Se resuelve con `:has()`; donde no esté disponible, el cuadro se queda quieto
   y funciona igual.
2. **Al cambiar de variante** un pulso recorre el bus y el pad acusa recibo.
   Dice que las plantillas se han rearmado sin mover ni un texto de sitio. El
   truco para que se reinicie al alternar son dos animaciones idénticas con
   nombre distinto: el navegador solo reinicia una animación cuando cambia
   cuál se aplica.

Ambos cuelgan de `.js-anim` y salen de `transform` y `opacity`. Con movimiento
reducido no se ejecuta ninguna —verificado: `document.getAnimations()` devuelve
cero— y el cuadro se sirve entero.

### Coste

**Cero JavaScript.** Comprobado además con el navegador sin JavaScript: el
conmutador sigue cambiando las cuatro plantillas y los enlaces visibles son los
correctos en las dos variantes.

---

## 5.10 Composición de `/contacto`

La página más corta del sitio, a propósito. Su único trabajo es abrir WhatsApp
con la consulta ya montada; qué es cada servicio lo cuenta `/servicios` y cómo
se trabaja un caso lo cuenta `/como-trabajamos`.

| Sección | Fondo | Forma |
|---|---|---|
| Hero + cuadro | **Grafito**, banco de trabajo | Eyebrow, `h1`, una línea de entradilla y el cuadro de conexiones completo. Ver §5.9 |
| Lo práctico | Papel | Cuatro datos en `dl`: canal, zona, primer contacto y visitas. **Nada más** |
| Llamada final | Cobre | `FinalCta`, el cierre compartido del sitio |

Tres bandas. El hero y el cuadro comparten fondo —mismo ritmo que
`/servicios/clonacion-ecu`— porque separarlos habría metido un corte entre la
frase que dice «elige por dónde entra tu consulta» y las tres entradas.

**No hay `h2` de sección sobre el cuadro.** Los nombres de las tres rutas ya son
los encabezados de segundo nivel de la página; añadir uno encima habría sido un
título escrito solo para que existiera, y peor aún en la variante que se le
pone `sr-only` para no verlo.

**La salida secundaria no es una cuarta tarjeta.** Va debajo del pad, sin
recuadro y sin botón relleno: un filete de cobre a la izquierda, la frase y un
enlace subrayado. Si compitiera en la fila con las tres, casi todo el mundo la
elegiría —es la que no obliga a decidir— y se perdería el dato que hace útil la
primera respuesta. Pero está justo donde acaba el recorrido de los conductores,
que es donde mira el ojo al terminar.

### Lo que no hay, y por qué

- **Formulario.** Habría que montar un backend público, validarlo, defenderlo
  del spam y avisar de que alguien lo lea. WhatsApp ya está atendido.
- **Rutas de precio, urgencia, cita o disponibilidad.** No hay ninguna
  confirmada. Una ruta llamada «urgencias» promete una atención que hoy no se
  puede sostener.
- **Dirección, mapa, correo y horario.** Provisionales y sin confirmar. Ver
  §9 y [site-architecture.md](site-architecture.md) §11.
- **Adjuntar fotos desde la web.** La página dice, en una línea, que las fotos,
  la ficha técnica, las capturas de los DTC y las referencias se añaden dentro
  de WhatsApp.

---

## 5.11 El corte estratigráfico (`SignalStrata`)

La firma de `/sobre-nosotros`, y el único argumento que una página sobre
nosotros puede demostrar sin inventarse nada: **por qué encontrar una avería
requiere oficio**.

Un solo conductor de cobre cruza el dibujo de lado a lado —es el síntoma, que
entra igual que siempre— y en cada una de las cuatro generaciones de
electrónica baja hasta la capa más profunda y vuelve a subir. Cada generación
añade una barra a su pila, así que **cada zambullida es más honda que la
anterior**. Ese perfil descendente es la página entera: lo que ha cambiado no
es el síntoma, es a qué profundidad está la causa.

- **El eje horizontal es tiempo**, y sus extremos se rotulan «antes» y «hoy».
  **No hay ninguna fecha, ninguna cifra y ninguna referencia** en el dibujo,
  igual que en los demás.
- **La capa nueva de cada generación va marcada en cobre**; las heredadas, en
  grafito. No es una lista de tecnologías: es la cuenta de sitios donde puede
  esconderse la causa.
- **No usa `iso.ts`**, y por el mismo motivo que `CaseHarness`: esto no es una
  pieza vista en el espacio, es una sección. En dimétrica se disfrazaría de
  centralita. La geometría sí se calcula, que es la regla que aplica.
- **Las pilas se alinean a la izquierda de su columna**, no al centro, para que
  el borde de cada una caiga exactamente sobre el de su rótulo.

### Los rótulos van fuera del SVG

A 375 px el dibujo se escala a poco más de un tercio, y ahí dentro un rótulo de
cuatro palabras o no se lee o hay que hincharlo hasta romper la composición
—que es justo el problema que `CaseHarness` resolvió a base de duplicar el
tamaño de fuente en móvil—. Aquí los rótulos son texto HTML: se leen, se
seleccionan y se reordenan solos en una columna. Cada uno lleva **su marca de
profundidad** —tantas rayas como capas tiene su generación—, así que la
correspondencia con la pila sobrevive a que la rejilla deje de estar alineada
bajo el dibujo.

### La cadencia se calcula, no se ajusta a ojo

El conductor se traza con el mecanismo `.trace-draw` compartido, que dura
`--duration-draw` y usa `--ease-out`. Esa curva **no avanza a velocidad
constante**: lanza rápido y posa despacio. Con retardos repartidos a partes
iguales, la línea llegaba a una pila antes de que la pila existiera. Así que el
componente calcula la longitud real del recorrido hasta cada generación,
**invierte la curva** y de ahí saca el retardo de cada capa y de cada contacto.
Las capas entran 200 ms antes de que la línea llegue: si aparecieran a la vez,
parecería que las dibuja el trazo, y lo que se cuenta es lo contrario —ya
estaban ahí—.

### Coste

**Cero bytes de JavaScript propio.** Todo cuelga de `.js-anim`: sin JavaScript,
o con movimiento reducido, el corte se sirve entero, con las capas puestas, la
línea trazada y los contactos marcados. Verificado con capturas reales en los
dos modos.

---

## 5.12 Composición de `/sobre-nosotros`

El encargo tenía un riesgo escrito en el enunciado: acabar en una biografía de
empresa con tarjetas de valores. La regla que lo evita es la de
`/como-trabajamos`, apretada un punto más: **cada frase tiene que aportar un
dato, una razón o un criterio; si solo dice lo buenos que somos, sobra.**

| Sección | Fondo | Forma |
|---|---|---|
| Hero | **Papel cálido** | Eyebrow, `h1`, entradilla, dos botones y una fotografía vertical. Debajo, raíl de cuatro datos: al frente, experiencia, para quién y zona |
| La experiencia aplicada | Blanco | Titular a la izquierda y **dos** bloques a la derecha, cada uno con su filete de cobre. Ni uno más |
| El corte | **Grafito**, banco de trabajo | El dibujo a todo el ancho con sus cuatro rótulos. Ver §5.11 |
| Particular o taller | Papel | **Un solo cuadro partido en dos**, con los dos conductores convergiendo en un contacto debajo |
| Tres reglas | Blanco | Tres columnas breves sobre filete de cobre |
| Llamada final | Cobre | `FinalCta`, con una salida secundaria hacia `/contacto` |

Cinco decisiones que conviene no deshacer:

- **El hero abre en claro.** La portada y `/contacto` abren en el banco de
  trabajo; ésta no, porque es la página que habla de personas y necesita luz. La
  cabecera oscura sigue enmarcándola por arriba.
- **El nombre del responsable no va encima de la fotografía.** La foto es de
  banco de imágenes, y un nombre encima la convierte en un retrato falso. Va en
  el raíl de datos, que es otro bloque. El marco es vertical para que un retrato
  real ocupe su sitio sin rehacer nada. Ver
  [image-sources.md](image-sources.md).
- **Particular y taller son un cuadro, no dos tarjetas.** Dos cajas idénticas
  dirían que son dos servicios; lo que se cuenta es que son dos entradas al
  mismo trabajo, y por eso los conductores convergen en un contacto y una sola
  frase: «en los dos casos se mira lo mismo».
- **Tres principios, y tres nada más.** Cada uno se puede comprobar en una
  conversación real. En cuanto se añade un cuarto, empiezan a sonar a valores de
  empresa.
- **No repite `/como-trabajamos` ni `/servicios`.** No cuenta el flujo de una
  consulta ni explica los servicios: los enlaza desde dentro del texto.

Medido sobre el HTML generado: **519 palabras** en `<main>`, entre la portada
(675) y `/como-trabajamos` (201). Cero bytes de JavaScript propio.

---

## 5.13 El tablero de síntomas (`SymptomRoute`)

La pieza central de `/servicios/diagnostico-dtc`, y **la segunda versión de esa
pieza**. La primera se llamaba `FaultRoute` y dibujaba los cinco tramos del
análisis —síntoma, código, condiciones, comprobaciones, decisión— con una línea
de texto por tramo y por escenario: quince líneas explicando cómo razonamos.
Estaba bien construida y contaba lo que no había que contar.

Lo que dibuja ahora cabe en una frase: **lo que notas entra por la izquierda y
llega a la unidad.** Seis situaciones, seis caminos distintos, un solo destino,
y ni un rótulo de procedimiento dentro del dibujo.

### Por qué seis caminos y no uno repintado

Es lo único que hace memorable el gesto de cambiar de caso. Cada recorrido tiene
su forma —uno sube, otro baja, otro va en escalera— así que elegir **se nota**, y
se nota que tu caso no es el mismo que el de al lado. Ninguno es recto, ni
siquiera el primero: el que se ve al entrar tiene que enseñar ya que aquí hay un
recorrido.

Ninguno de los seis promete nada. El destino es **la unidad**, no «la solución»;
lo que se puede valorar lo dice la respuesta de al lado en dos líneas, y la
advertencia honesta —un código no confirma qué pieza está averiada— se dice
**una sola vez en toda la página**, al pie del tablero.

### Lo que ganó al perder el texto

El tablero anterior llevaba cinco rótulos dentro del SVG, y eso obligaba a
**retirarlo por debajo de 1024 px**: a 375 px un rótulo de catorce caracteres
queda en cuatro píxeles. El de ahora no lleva ninguno, así que **se queda en
todas las anchuras**. Es la lección de la revisión: el texto dentro de un dibujo
es lo que le impide escalar.

Tampoco lleva textura propia. Tres pistas decorativas sueltas en el campo se
leían como marcas arbitrarias; el fondo de placa lo pone la sección con la
rejilla técnica del sitio, que ya existe y es la misma en todas partes.

### Cómo se conduce

El control es un **grupo de radios**, como `RouteSwitch` y `ContactBoard`, y por
los mismos motivos de comportamiento: funciona sin JavaScript, se recorre con
las flechas, se anuncia como grupo y no parpadea al cargar.

El JavaScript (`src/scripts/symptom-route.ts`, **1,4 kB**) añade **una sola
cosa**: que el camino se trace en lugar de aparecer hecho, y que la unidad se
encienda al llegar la señal. Detalles que lo sostienen:

- **Web Animations API, no transición CSS.** Al cambiar de caso hay que
  *reiniciar* el trazado, y reiniciar una transición obliga a forzar un reflujo
  entre dos escrituras de estilo. `animate()` se cancela y se relanza limpio.
- **El tablero nace vacío**, y eso se decide al cargar. Es el defecto que tuvo
  la versión anterior: se pintaba entero y saltaba a cero justo cuando el
  visitante lo estaba mirando, y un cambio de `stroke-dasharray` no interpola.
- **La entrada late una vez** al elegir caso. La señal empieza ahí, no en
  cualquier sitio.
- **El contorno de las seis pastillas va en grafito 400**, no en
  `--color-border-inverse`: sobre esa sección da 1,4:1, y **un control necesita
  3:1** para que se vea que es un control (WCAG 1.4.11). En grafito 400 son
  5,3:1.

### Cómo degrada

| | Qué se ve |
|---|---|
| Sin JavaScript | Camino trazado entero, unidad encendida, selector funcionando |
| Movimiento reducido | Lo mismo |
| Cualquier anchura | El tablero se queda: no hay texto dentro que se vuelva ilegible |

---

## 5.14 Composición de `/servicios/diagnostico-dtc`

**Esta página se rehízo entera**, y la primera versión es la lección. Documentaba
el procedimiento: la anatomía de un código, los cinco tramos del análisis, quince
líneas de escenario, cinco desenlaces internos y la plantilla de WhatsApp
completa a la vista. **Mil cuatrocientas palabras** para explicar cómo razonamos,
en una página a la que se llega con un testigo encendido y treinta segundos.

La regla que la ordena ahora: **una necesidad, una interacción memorable, un
abanico de soluciones y una llamada a la acción.** Todo lo que no sirviera a una
de las cuatro se fue.

| Sección | Qué hace |
|---|---|
| Hero | La tesis, una frase que dice qué analizamos y un botón. Se fue la escalera «Leer · Borrar · Entender»: era una lección sobre lo que hace mal el visitante, justo donde hay que decirle qué hacemos por él |
| ¿Te ocurre algo de esto? | `SymptomRoute` (§5.13). Seis situaciones reconocibles y una respuesta de dos líneas |
| Qué podemos valorar | Seis filas con una pista de cobre a la izquierda, no seis tarjetas iguales. Título y una frase. Cierra con los tres servicios hermanos, que **no se llevan sección propia**: son el mismo tema |
| Para empezar | Cuatro datos **a tamaño de titular** y un botón. La plantilla completa vive dentro del enlace |
| Cierre | `FinalCta` |

### Lo que se midió

- **452 palabras en el DOM de `<main>`**, de las que 132 son las cinco
  respuestas que el CSS mantiene ocultas: **320 visibles a la vez**. La versión
  anterior tenía 1.396.
- **Cinco secciones**, un solo `h1`, jerarquía `h1 → h2 → h3` sin saltos.
- **4,4 kB** de JavaScript en línea: los 2,9 kB comunes más 1,4 kB del tablero.

### Los cuatro datos, grandes

Es el gesto que más cambió la sección de contacto. La versión anterior ponía
siete datos en letra pequeña al lado de la plantilla entera en un `<pre>`, y eso
convertía un «escríbenos» en un formulario. Cuatro datos caben a tamaño de
titular, se leen de un vistazo, y la plantilla larga sigue existiendo donde
sirve: dentro del enlace, ya rellenada al abrir WhatsApp.

---

## 5.15 La banda de entrega (`PowerBand`)

La firma de `/servicios/reprogramacion`, y **el cambio de rumbo de la web
entero en una sola pieza**. Sustituye a `MapLayer`, que dibujaba la retícula de
un mapa de calibración.

El razonamiento, por si hay que rehacerlo:

- **`MapLayer` estaba bien dibujado y miraba al sitio equivocado.** Enseñaba la
  tabla que se toca. Nadie compra una tabla: se compra lo que se siente en
  tercera, cuando vas a adelantar. La página cambió de pregunta —de «qué
  hacemos dentro de la centralita» a «qué voy a notar»— y el dibujo tenía que
  cambiar con ella.
- **La curva de entrega es el único instrumento que el conductor ya sabe leer.**
  No hay que explicarlo: sube, se mantiene y cae, y donde está más alta es donde
  el coche empuja. Un mapa de calibración hay que explicarlo, y explicarlo era
  justo lo que sobraba.
- **El selector es la página.** Elegir un objetivo no cambia una ilustración:
  cambia la curva, cambia el tramo iluminado, cambia la respuesta escrita y
  cambia la plantilla de WhatsApp. Es la misma decisión que el visitante tiene
  que tomar para escribirnos, tomada aquí.
- **La curva nace sobre la de partida y crece.** Es la tesis de la página en un
  gesto: esto es tu coche, esto es lo que cambia. Ocurre una vez, al entrar en
  pantalla, y no vuelve a ocurrir.

### Lo que la hace publicable

**Ni una cifra dentro del dibujo, y no puede haberla.** Es la regla que impide
que la banda se lea como la prueba de banco de un vehículo:

- El eje horizontal se rotula con **palabras** —«ralentí», «corte»—, en HTML y
  fuera del SVG, como en `SymptomRoute`.
- **El eje vertical no se rotula en absoluto** y no tiene escala.
- El aviso de que es una representación conceptual va **una sola vez**, debajo
  del dibujo, en nuestro HTML.
- **Ninguna curva de objetivo queda nunca por debajo de la de partida.** Una que
  bajase estaría afirmando que en ese tramo se pierde empuje. Con estos
  parámetros es un descuido de un decimal, así que hay una prueba que lo
  comprueba punto por punto (`web/test/repro.test.ts`).

Las cinco formas viven en `REPRO_GOALS` (`web/src/config/site.ts`) como cuatro
parámetros cada una —dónde sube, cuánto tarda, hasta dónde aguanta, cómo
cae— y la de partida en `REPRO_BASELINE_BAND`. **No modelan ningún motor**: son
la silueta que cualquiera reconoce, reducida a los gestos que la distinguen.

### Cómo está hecha

- **El control es un grupo de radios**, como `SymptomRoute`, `RouteSwitch` y
  `ContactBoard`. Sin JavaScript funciona entero: las cinco curvas van
  dibujadas en el HTML y `:checked ~` enseña la que toca.
- **Las tabulaciones no son pastillas**: son texto grande sobre una regla, y el
  elegido se enciende con un filo de cobre. Es el único sitio de la web donde la
  tipografía hace de control, y es deliberado: un instrumento tiene modos, no
  botones.
- **El relevo al dibujo vivo pasa por una sola clase.** `power-band.ts` pinta la
  curva viva, añade `is-live` y a partir de ahí el CSS esconde las estáticas. Si
  el archivo no llega, no hay nada que reparar.
- **La deformación es una interpolación lineal sobre veinticinco ordenadas.**
  Las abscisas son fijas, así que dos curvas cualesquiera tienen la misma
  estructura de segmentos Bézier y basta con mover los puntos. Sin librería de
  animación: `requestAnimationFrame` y una curva de asentamiento escrita a mano.
- **Por debajo de 1024 px se estira en vertical** (`preserveAspectRatio="none"`
  con `vector-effect: non-scaling-stroke`): con la relación del viewBox, a
  375 px de ancho quedaba en 134 px de alto y la curva no se leía. Los trazos se
  miden en píxeles de pantalla, así que no se ovalan; de paso, la curva se ve
  más gruesa en móvil, que era justo lo que hacía falta.

## 5.16 Composición de `/servicios/reprogramacion`

Es **la primera página oscura de principio a fin**, y el experimento de la
posible dirección visual del resto del sitio. Encaja mejor de lo que parece: la
cabecera ya es grafito 950 translúcida y el pie grafito 900, así que la página
se funde con ambos en vez de recortarse contra ellos.

Cinco momentos, y ni uno más:

1. **Hero fotográfico a sangre.** Un coche de noche, en movimiento, con barrido.
   No hay ninguna centralita a la vista, y es a propósito. Dos velos: el
   vertical sostiene el texto en móvil, el horizontal en escritorio.
2. **La banda** (§5.15), sobre grafito 900.
3. **Las opciones**, sobre grafito 950: cinco entradas de una línea y un díptico
   fotográfico a sangre —coche y moto— que dice a qué se le hace esto sin gastar
   una línea de texto.
4. **El configurador** de Tuning-shop.com, con su activación explícita.
5. **El cierre en cobre**: los cuatro datos que hay que enviar y nada más.

Decisiones que costaron una revisión y conviene no repetir:

- **`FinalCta` no va en esta página.** Con una sección de consulta propia,
  encadenar las dos era pedir lo mismo dos veces. El cierre usa la misma banda
  de cobre, que es el dispositivo de «aquí se actúa» del sitio.
- **El aviso legal tampoco se repite aquí.** El pie lo lleva en todas las
  páginas, y a dos secciones de distancia se leía como una advertencia
  duplicada.
- **El velo del hero es distinto por encima y por debajo de 1024 px.** Con uno
  solo, el antetítulo caía sobre la franja iluminada del túnel a 768 px y
  perdía contraste.

## 5.17 Segunda pasada sobre `/servicios/reprogramacion`

Cuatro correcciones sobre la página ya construida. Se anotan porque las cuatro
tienen un porqué que no se ve en el resultado.

### El abanico pasó a acordeón (`ServiceOptions`)

Cinco filas con una frase permanente no ayudaban a decidir: una línea no
distingue una Stage 1 de una optimización personalizada. Ahora cada opción
despliega entre treinta y cinco y setenta palabras —para qué vehículo encaja,
qué se busca, qué condición importa— y **«Vehículo modificado» desapareció como
entrada propia**: se solapaba con Stage 2 casi palabra por palabra, así que su
contenido vive dentro de Stage 2. Son cinco: Stage 1, Stage 2, optimización
personalizada, orientada al consumo y motos.

**Es `<details>`, no un `<button>` con `aria-expanded`.** Un botón necesita
JavaScript para abrir su panel, y aquí nada que haya que leer puede depender de
que llegue un archivo. `<summary>` ya tiene rol de botón y estado expandido
nativos —comprobado en el árbol de accesibilidad: `expanded: true/false` sin
declarar nada—, y el atributo `name` da el acordeón exclusivo sin script. Lo
único que hace JavaScript es **cerrar Stage 1 por debajo de 768 px**, y si no se
ejecuta, se queda abierta.

### Un atajo hasta el configurador (`CalcLink`)

El configurador de Tuning-shop.com está al final de la página. Quien entra a
mirar cifras no tiene por qué recorrerla entera, así que hay un botón
**«Calcular mejora»** que baja hasta él: en la fila de acciones del hero, junto
a «Consultar mi vehículo» y «Ver qué puedes notar», y en una pestaña lateral
que acompaña al desplazamiento.

**Es un ancla interna, no un enlace externo.** El marco sigue montado y con sus
reglas de siempre. Se llegó a probar la alternativa —enlazar fuera— y se
descartó; los dos hallazgos de esa prueba quedan anotados en `embeds.ts` y en
[embed-tuning-shop.md](embed-tuning-shop.md), porque son justo lo que se
volvería a olvidar: `tuning-shop.com/demo/` es una página de tienda con la
cuenta de demostración **del proveedor**, y `rel="noreferrer"` rompería el
enlace porque suprime la cabecera que el proveedor valida.

El desplazamiento suave no cuesta ni un byte: lo pone `scroll-behavior` de
`tokens.css`, que ya se anula solo con `prefers-reduced-motion`, y
`scroll-mt-24` evita que el titular quede debajo de la cabecera fija.

La pestaña acompaña al desplazamiento **sin una línea de JavaScript**: es
`position: sticky` dentro de un raíl que abarca la banda y las opciones, así
que aparece al dejar atrás el hero y **desaparece justo antes del
configurador** —ofrecer un atajo hacia la sección que ya estás mirando no
orienta, distrae—. Dos trampas anotadas para no repetirlas:

- **Con `writing-mode: vertical-rl` los ejes lógicos se intercambian.**
  `inline-size` pasa a ser el alto y `inset-block-start` pasa a ser `right`. La
  pestaña salía tumbada y a 378 px del borde. En ese bloque todo va en
  propiedades físicas.
- **Un pegajoso por abajo solo sube una caja que quedaría por debajo del
  borde**, nunca rescata una que ya se fue por arriba. La pastilla de móvil
  necesita `margin-block-start: auto` para vivir al final del raíl.

### La banda adelgazó un 31 %

De **1430 px a 986 px** a 1440. Sin tocar la tipografía, sin comprimir los
controles y sin recortar las curvas:

- El encuadre pasó de 1200×430 a **1200×316**: más ancha y más baja, que es
  además como mejor se lee un recorrido de régimen.
- Titular y entradilla comparten fila; la respuesta activa y la letra pequeña
  —leyenda y aviso conceptual— también. Eran tres bloques apilados que sumaban
  más alto que el propio dibujo.
- Los huecos entre bloques bajaron de 2–2,5 rem a 1,25–1,75 rem, y el relleno
  vertical de la sección de `py-28` a `py-16`.

El aviso conceptual sigue diciéndose **una sola vez**, ahora en la columna de al
lado en vez de en una franja propia.

### Fuera el pie «Imágenes de referencia»

No aportaba: la obligación de no presentar las fotos como trabajos del taller la
cumplen los textos, que hablan del oficio y nunca de «nuestros trabajos», y la
trazabilidad vive en [image-sources.md](image-sources.md).

## 5.18 El Concepto B, y por qué no está en este documento

Existe una **segunda dirección artística completa** para la página de
reprogramación, en `/conceptos/reprogramacion-b`. **No forma parte de este
sistema de diseño y no debe leerse como si lo fuera**: tiene su propia paleta
(acromática, sin cobre), su propia tipografía (una sola familia, con la anchura
como eje de jerarquía), su propia hoja de estilos sin Tailwind y sus propias
cabecera y pie. Es una maqueta interna para poder comparar, no una evolución
acordada de nada.

Todo lo suyo está documentado aparte, precisamente para que no se mezcle:
[concepto-b-reprogramacion.md](concepto-b-reprogramacion.md).

Si algún día se adopta, lo que hay que hacer **no** es copiar sus piezas a este
sistema una a una: es decidir primero si el sitio entero cambia de dirección.
Mitad y mitad sería lo peor de las dos.

## 6. Web pública frente a panel

Mismos tokens, carácter distinto. Es la diferencia entre un escaparate y una
herramienta.

| | Web pública | Panel |
|---|---|---|
| Densidad | Espaciosa: secciones de 4–6 rem | Densa: la información manda |
| Color | Bandas de grafito, acento de cobre | Casi todo neutro; el color solo marca estado |
| Tipografía | Titulares grandes, medida controlada | Tamaños pequeños, cifras tabulares |
| Movimiento | Coreografía: montaje, trazado, revelado, paralaje | Prácticamente ninguno |
| JavaScript | **2,9 kB en línea** comunes, más 1,4 kB en diagnóstico, 1,4 kB en reparación y 2,2 kB en clonación. `/como-trabajamos`, `/contacto` y `/sobre-nosotros` no añaden nada. Todo prescindible | React, solo bajo `/admin` |
| Objetivo | Que escriban por WhatsApp | Ver el estado del trabajo en dos segundos |
| Indexación | Sí | `noindex`, fuera del sitemap, `Disallow` |

---

## 7. Logo

**Ya existe un logo original**: monograma JM dentro de un conector de centralita,
con una pista de cobre que termina en un pad de contacto. Sustituye al wordmark
provisional. Concepto, variantes y normas de uso en
[brand-foundation.md](brand-foundation.md).

**Cómo se sustituye:** ninguna página dibuja la marca por su cuenta. Cabecera,
pie, login y panel usan `BrandMark.astro` o el archivo de `public/brand/`.

---

## 8. Necesita tu aprobación visual

Por orden de compromiso: lo primero es lo que más cambia si no convence.

1. **El despiece de centralita como firma del sitio.** Es la decisión grande.
   Todo lo demás cuelga de ella: el hero, los tres diagramas de servicio y la
   idea de «tres profundidades».
2. **El titular `«Primero se lee. Después se toca.»`** en lugar de un `h1` con
   las palabras clave. Ver §1, «El riesgo asumido». Si prefieres el `h1`
   descriptivo, se cambia en una línea y la portada sigue funcionando; pierde
   fuerza, no estructura.
3. **La cabecera siempre en grafito.** Enmarca la página como el frontal de un
   equipo, pero es un cambio de carácter respecto a la cabecera clara.
4. **IBM Plex Sans Condensed para titulares** (+39 kB). Si no convence, los
   titulares vuelven a IBM Plex Sans y se pierden unos 15 px de tamaño a igual
   ancho de columna.
5. **La cantidad de movimiento.** Cinco efectos con función declarada. Se puede
   bajar a solo el revelado quitando dos bloques.
6. **La fotografía del hero como ambiente**, al 16 % y desenfocada, en vez de
   como pieza de la composición.
7. **El cobre como color de marca** y **los radios pequeños con borde en vez de
   sombra**. Sin cambios respecto a la versión anterior; siguen pendientes de tu
   visto bueno.
8. **Tema claro en el panel.** Si se usa en un taller con poca luz, el tema
   oscuro está preparado en los tokens.

## 9. Contenido provisional, y dónde vive

Todo lo pendiente está centralizado en `web/src/config/site.ts`, marcado con
`PENDIENTE`. No hay contenido inventado repartido por las plantillas.

- Teléfono y WhatsApp: publicados por el cliente en su web actual.
- Correo, dirección y horario: **`null`**, a la espera de confirmación. Existen
  además valores **provisionales sin confirmar** —una dirección y un correo—
  guardados aparte en `CONTACT_PENDING_CONFIRMATION` y marcados como
  `PENDING_CLIENT_CONFIRMATION`. **Ninguna página los importa**, y
  `web/test/contact.test.ts` falla si aparecen en una plantilla.
- Zona de trabajo (Churriana de la Vega, Granada) y «visitas con cita previa»:
  **confirmados**, y son lo único práctico que publica `/contacto`.
- Plantillas de WhatsApp por servicio y variante: en `CONTACT_ROUTES` y
  `CONTACT_HELP_ROUTE`. La primera frase de cada una identifica el servicio en
  lenguaje natural —de ahí lo saca el orquestador—, todos los campos se pueden
  dejar en blanco y ninguna lleva marcadores internos. Hay pruebas de las tres
  cosas.
- Servicios: los tres confirmados, con descripciones provisionales. La página de
  clonación está escrita **en términos generales a propósito**: dice qué clase
  de información se traslada y que depende de la unidad, sin afirmar marcas,
  gestiones ni casos concretos. Ver
  [site-architecture.md](site-architecture.md) §11.
- Pasos del proceso: descritos sin prometer plazos.
- **Todo el contenido de `/sobre-nosotros` sobre el cliente**: en `ABOUT`,
  marcado `PENDING_CLIENT_CONFIRMATION`, con el listado de lo que hay que
  repasar con él en `ABOUT_TO_CONFIRM` y la procedencia de cada dato —dicho por
  el cliente, publicado en su web actual o escrito para la maqueta—. **Aquí sí
  se publica**, al revés que `CONTACT_PENDING_CONFIRMATION`: no hay datos de
  contacto ni cifras de resultados, y una maqueta que no se ve no se puede
  corregir. `web/test/about.test.ts` vigila que no aparezcan cifras de
  resultados, garantías, certificaciones ni las afirmaciones sin verificar de la
  web antigua.
- Aviso legal sobre anulaciones: recuperado de la web actual del cliente.
- Sección de trabajos: **retirada de la portada**. El recuadro punteado que
  anunciaba que todavía no hay casos restaba credibilidad en lugar de dar
  transparencia. En su lugar va **«Cuatro cosas y podemos empezar»** (`INTAKE`),
  que es honesto —solo ordena lo que el asistente de WhatsApp pregunta después—
  y además convierte: le dice al visitante exactamente qué escribir, con una
  plantilla precargada en el enlace. La URL `/trabajos` sigue reservada.

La lista completa de datos pendientes está en
[site-architecture.md](site-architecture.md) §11.
