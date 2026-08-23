# Dirección visual y sistema de diseño — JM Repro Cars

Documenta las decisiones visuales del frontend, de dónde salen y qué queda
pendiente de tu aprobación. **Nada de esto está desplegado.**

> **Nota sobre las skills.** Las secciones que las citan —`ui-ux-pro-max`,
> `brand`, `design-system`, `ui-styling`— se escribieron cuando estaban
> disponibles. La página de `/servicios/reparacion-ecu` (2026-08-23) **se hizo
> sin ellas**: no existen en el entorno remoto donde se escribió. Sus decisiones
> salen de lo que ya estaba documentado aquí, no de una consulta nueva.

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
| **GSAP + ScrollTrigger para las animaciones** | Evaluado y descartado tres veces: al diseñar, al ampliar el movimiento y al montar el cerco de la página de reparación. Todo lo que hay —montaje del despiece, trazado de la pista, revelado, paralaje y el cerco que se estrecha— sale en **2,4 kB de JavaScript en línea** (3,8 kB en la página de reparación) con IntersectionObserver, rAF y transiciones CSS. GSAP son ~70 kB para hacer lo mismo, en un sitio que recibe 10–20 conversaciones al día |
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

Cuatro movimientos, cada uno con una función declarada:

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
5. **El cerco que se estrecha**, en `/servicios/reparacion-ecu`. Es el único
   movimiento del sitio que dispara la persona, no el scroll: al pasar de
   «Síntoma» a «Causa» y a «Intervención», un mismo círculo pasa de rodear la
   unidad entera a ajustarse a un componente, y la tapa se levanta y se queda
   como contorno. Dice el argumento de la página —el cerco se estrecha— sin una
   palabra. Si no se encogiera, el dibujo no diría nada que no dijera el texto,
   y entonces sobraría.

**Sigue sin haber librería de animación.** El cerco son dos propiedades CSS
personalizadas y una transición de `transform`; lo único en JavaScript es el
patrón de pestañas —flechas, Inicio, Fin y `aria-selected`—, que son treinta
líneas de teclado y no las resuelve GSAP.

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

**El grupo de pestañas de `/servicios/reparacion-ecu` es la única pieza del sitio
que necesita JavaScript para funcionar, y por eso no existe sin él.** Los tres
botones están ocultos por CSS hasta que `html.js` aparece; sin JavaScript los
tres pasos se sirven seguidos, separados por una línea, y no se pierde ni una
palabra. Medido sobre el HTML generado con el navegador y JavaScript desactivado:
1.301 palabras en `<main>`, frente a las 1.133 que se ven de una vez con las
pestañas montadas. Con movimiento reducido las pestañas siguen cambiando —es
navegación, no decoración—; lo que se colapsa es el recorrido del cerco.

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
| **`MapLayer`** | Astro | La capa de software abierta: dos retículas sobre la unidad cerrada. Profundiza el diagrama de reprogramación de `/servicios`. **Sin un solo valor, sin curvas y sin escalas** |
| **`PowerConfigurator`** | Astro | El configurador de Tuning-shop.com bajo activación explícita, con su aviso permanente fuera del marco y su estado de fallo. Ver [embed-tuning-shop.md](embed-tuning-shop.md) |
| **`FaultTrace`** | Astro | El recorrido de una señal sobre una placa, con el punto donde se interrumpe. Firma de `/servicios/reparacion-ecu`. Proporción apaisada, que no tiene ningún otro diagrama, y **rótulos en HTML, no dentro del SVG** |
| **`FaultIsolation`** | Astro | Síntoma, causa e intervención sobre un solo dibujo: **el mismo cerco recorre tres tamaños** mientras la tapa se levanta. La pieza distintiva de la página de reparación |
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

## 6. Web pública frente a panel

Mismos tokens, carácter distinto. Es la diferencia entre un escaparate y una
herramienta.

| | Web pública | Panel |
|---|---|---|
| Densidad | Espaciosa: secciones de 4–6 rem | Densa: la información manda |
| Color | Bandas de grafito, acento de cobre | Casi todo neutro; el color solo marca estado |
| Tipografía | Titulares grandes, medida controlada | Tamaños pequeños, cifras tabulares |
| Movimiento | Coreografía: montaje, trazado, revelado, paralaje | Prácticamente ninguno |
| JavaScript | **2,4 kB en línea** en portada, `/servicios` y reprogramación; **3,8 kB** en reparación de ECU, que añade el grupo de pestañas | React, solo bajo `/admin` |
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
5. **La cantidad de movimiento.** Cuatro efectos con función declarada. Se puede
   bajar a solo el revelado quitando dos bloques.
6. **La fotografía del hero como ambiente**, al 16 % y desenfocada, en vez de
   como pieza de la composición.
7. **El cobre como color de marca** y **los radios pequeños con borde en vez de
   sombra**. Sin cambios respecto a la versión anterior; siguen pendientes de tu
   visto bueno.
8. **Tema claro en el panel.** Si se usa en un taller con poca luz, el tema
   oscuro está preparado en los tokens.
9. **El cerco de tres pasos de `/servicios/reparacion-ecu`.** Es la única pieza
   del sitio que se maneja, no que se mira. Está montada como grupo de pestañas
   accesible y sin ella la página se lee igual, pero es una decisión de
   interacción que conviene ver funcionando antes de darla por buena.
10. **`/servicios/reparacion-ecu` no lleva ninguna fotografía.** Su identidad la
    llevan los dos dibujos originales. Las tres fotos del banco de imágenes ya
    están cada una en su página y repetir una habría sido peor; el hueco natural
    es una foto real del taller cuando llegue. Ver
    [image-sources.md](image-sources.md).

## 9. Contenido provisional, y dónde vive

Todo lo pendiente está centralizado en `web/src/config/site.ts`, marcado con
`PENDIENTE`. No hay contenido inventado repartido por las plantillas.

- Teléfono y WhatsApp: publicados por el cliente en su web actual.
- Correo, dirección y horario: **`null`**, a la espera de confirmación.
- Servicios: los tres confirmados, con descripciones provisionales.
- Pasos del proceso: descritos sin prometer plazos.
- Aviso legal sobre anulaciones: recuperado de la web actual del cliente.
- Reparación de ECU: motivos de consulta, ficha de datos y plantilla de WhatsApp
  viven en `REPAIR_REASONS`, `REPAIR_INTAKE` y `REPAIR_MESSAGE`. Nada de lo que
  hay ahí promete precio, plazo, garantía ni que una unidad concreta se pueda
  reparar; hay una prueba que lo comprueba (`web/test/site-config.test.ts`).
- Sección de trabajos: **retirada de la portada**. El recuadro punteado que
  anunciaba que todavía no hay casos restaba credibilidad en lugar de dar
  transparencia. En su lugar va **«Cuatro cosas y podemos empezar»** (`INTAKE`),
  que es honesto —solo ordena lo que el asistente de WhatsApp pregunta después—
  y además convierte: le dice al visitante exactamente qué escribir, con una
  plantilla precargada en el enlace. La URL `/trabajos` sigue reservada.

La lista completa de datos pendientes está en
[site-architecture.md](site-architecture.md) §11.
