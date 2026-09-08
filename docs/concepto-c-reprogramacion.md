# Concepto C — Reprogramación

Tercera dirección artística para la página de reprogramación, creada para
**comparar**, no para publicar.

| | |
|---|---|
| Ruta | `/conceptos/reprogramacion-c` |
| Estado | Maqueta interna. `noindex, nofollow`, fuera del sitemap, bloqueada en `robots.txt`, sin canónica y sin un solo enlace desde el sitio |
| Conceptos A y B | Intactos. Ni un byte suyo se ha tocado |
| Pruebas | `web/test/concept-c.test.ts` (espejo de las del B) |

**Nada de esto está desplegado y el concepto no sustituye a nada.**

---

## 1. La dirección elegida: «Banco»

A vende la sensación (túnel de noche, cobre, fotografía en movimiento). B
pregunta como el mostrador (papel editorial, tipografía enorme, tres
preguntas). **C enseña la naturaleza real del trabajo: software de precisión
con manos de taller.** La página es la placa frontal de un instrumento.

Tres decisiones lo sostienen:

1. **La página es un objeto.** Un chasis gris aluminio con canto, apoyado en
   una mesa más oscura; módulos separados por juntas de un píxel («la retícula
   como protagonista», no como guía oculta); rótulos serigrafiados en
   monoespaciada de sistema; un solo color funcional —azul de instrumento— que
   solo significa estado o acción. Ni papel blanco (B) ni grafito nocturno
   (A): el tercer polo es literalmente gris.
2. **Sin fotografía.** A y B son foto-dirigidos; C es diagramático: siluetas
   de placa para coche y moto, y una única ventana oscura —el registrador—.
   Todo el material visual está dibujado a código para esta maqueta.
3. **Se pisa, no se elige.** La pieza central no es una curva que se
   selecciona (A) ni un cuestionario (B): es un **pedal que se mantiene
   pisado** mientras un plóter dibuja la pisada en tiempo real.

## 2. Contrato de diferenciación

| Concepto A | Concepto B | Concepto C |
|---|---|---|
| Grafito nocturno, cobre | Papel acromático | Gris aluminio + azul de señal |
| Fotografía nocturna | Fotografía diurna | Sin fotografía: dibujo técnico |
| Bandas a sangre | Portada de revista | Chasis modular con juntas de 1 px |
| IBM Plex Condensed | Archivo (eje de anchura) | Barlow (herencia DIN) + mono de sistema |
| Curva que se selecciona | Tres preguntas → recomendación | Pedal que se mantiene pisado → trazado en vivo |
| Acordeón de opciones | Opciones como respuesta | Carta de banco: cinco filas siempre visibles |
| CTA cobre a toda anchura | Cierre tipográfico sobre papel | Ficha con casillas por rellenar + WhatsApp |

## 3. La interacción: el banco de respuesta

`web/src/components/concepto-c/CcPedalBench.astro` +
`web/src/scripts/concept-c-pedal.ts` (~2 kB).

- **HTML**: la figura estática con la misma comparación (pisada, entrega de
  serie, entrega ajustada) viaja en la página y nace visible. Es el estado
  sin JavaScript y con `prefers-reduced-motion`.
- **JavaScript**, solo con `cc-motion`: revela el pedal, cambia la figura por
  un lienzo y dibuja en vivo. Mantener pisado —puntero, dedo o barra
  espaciadora (con `preventDefault`: no desplaza la página)— genera la
  demanda; dos filtros de primer orden con retardo dibujan las dos entregas.
  El bucle `requestAnimationFrame` solo corre mientras hay algo moviéndose.
- Estado expuesto: chip «En reposo / Pisando», región `role="status"`, foco
  visible. Sin cifras, sin unidades y con el aviso de demostración conceptual
  al lado, como la banda del A.

Verificado en navegador real: activación, pisada por teclado, `scrollY` sin
tocar, cero errores de consola y cero peticiones externas.

## 4. Referencias investigadas

Principios extraídos, nada copiado:

- **Teenage Engineering / Braun-Rams**: el producto como objeto sobre fondo
  limpio; la construcción visible es parte del diseño. De ahí el chasis con
  canto y las juntas vistas.
- **Instrumentación de taller (multímetros, osciloscopios)**: gris utilitario
  + un color funcional; los rótulos serigrafiados. Es el proveedor visual
  honesto de un negocio de electrónica, sin prometer mediciones.
- **Tendencia «hardware UI» 2025–26** (retículas en primer plano, densidad
  calmada, superficies neutras por capas): confirma que la dirección está
  viva y que ninguno de los dos conceptos la ocupa.
- **Sector chiptuning** (dyno rojo/negro/carbono con cifras): el cliché a
  evitar; aquí está prohibido de raíz porque no se publica ni una cifra.
- Los configuradores de fabricante y el editorial de motor ya estaban
  explorados (y uno descartado) en `docs/concepto-b-reprogramacion.md` §4–5.

## 5. Aislamiento técnico

- No importa Tailwind, `tokens.css`, `PublicLayout`, `Seo`, `SiteHeader`,
  `SiteFooter` ni `BrandMark`; tampoco nada del Concepto B. Hoja propia
  (`web/src/styles/concept-c.css`), carcasa propia
  (`web/src/layouts/ConceptoCLayout.astro`) con raíles de cabecera y pie
  integrados.
- **Sí reutiliza la lógica compartida**: `site.ts` (contenido, `whatsappUrl`,
  `REPRO_GOALS`, `REPRO_OPTIONS`, `REPRO_SEND`, `REPRO_MESSAGE`,
  `LEGAL_NOTICE`), `embeds.ts` y `src/scripts/configurator.ts` con los mismos
  `data-*` y las reglas de `docs/embed-tuning-shop.md` intactas.
- **Una dependencia nueva**: `@fontsource/barlow` (pesos 400/600/800, solo
  latín, cargada solo por esta carcasa). Se justifica igual que Archivo en el
  B: el eje tipográfico DIN es la mitad de la dirección y no existe entre las
  familias instaladas.

## 6. Datos provisionales

- El abanico de cinco opciones sigue **SIN CONFIRMAR**
  (`REPRO_OPTIONS_TO_CONFIRM`); las líneas «para quién» de la carta son
  destilaciones directas de los textos ya revisados de `REPRO_OPTIONS`, no
  contenido nuevo.
- Las siluetas de coche y moto son pictogramas dibujados a código: no
  representan ningún vehículo real y no llevan cifras, códigos ni medidas.
- No hay potencias, porcentajes, precios, plazos, garantías ni testimonios;
  hay una prueba que falla si aparecen.

## 7. Calidad verificada

Con capturas reales (Chromium sobre `astro preview`):

- **375 / 768 / 1024 / 1440 / 1920 px**: sin desbordamiento horizontal y sin
  errores de consola en ninguno.
- **Sin peticiones externas** al cargar; el configurador sigue sin cargarse
  hasta que se pulsa.
- **Teclado**: pedal operable con la barra espaciadora sin desplazar la
  página; foco visible; enlace de salto.
- **Sin JavaScript / menos movimiento**: página completa y quieta, figura
  estática con la comparación entera, aviso del configurador con salida por
  WhatsApp.
- `npm run check` (0 errores), `npm test` (185 pruebas, 23 del concepto) y
  `npm run build` en verde.

## 8. Si el concepto gustara

Igual que con el B: primero se decide si la dirección se extiende al sitio
entero, después qué pasa con la marca (el chasis pide una identidad más
técnica), y el abanico comercial hay que confirmarlo con el cliente antes de
dar por buena la carta de configuraciones.
