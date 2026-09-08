# Concepto Codex — Reprogramación

Variante experimental basada en el Concepto A, creada para comparar sin
alterar la página pública.

| | |
|---|---|
| Ruta | `/conceptos/reprogramacion-codex` |
| Estado | Maqueta interna, `noindex, nofollow`, fuera del sitemap y sin enlaces públicos |
| Página de referencia | `/servicios/reprogramacion`, sin cambios |
| Pruebas | `web/test/concept-codex.test.ts` |

## Dirección: «Túnel de par»

Se conserva de A la fotografía nocturna del coche en movimiento, su encuadre,
el grafito, el cobre y la pregunta comercial «qué quiero notar». La evolución
se apoya en una única firma: una trayectoria de cobre que nace en el hero, se
convierte en la curva de entrega y reaparece como guía del selector de
configuraciones.

La paleta local es obsidiana (`#080b0e`), carbono (`#0d1217`), superficie
elevada (`#1a232b`), cobre (`#c66734`), cobre luminoso (`#f0a071`) y papel
cálido (`#f2efe9`). El cobre solo marca trayectoria, selección y acción.

Tipografía autoalojada y ya presente en el proyecto:

- Barlow 800/600 para titulares y controles: compacta y vinculada al lenguaje
  de señalización automovilística, sin imitar una interfaz de taller.
- IBM Plex Sans para el texto comercial.
- JetBrains Mono para rótulos pequeños y procedencia de datos.

No se añadió ninguna fuente ni dependencia. Las tres familias se distribuyen
bajo SIL Open Font License mediante los paquetes `@fontsource` existentes.

## Recorrido e interacciones

1. Hero fotográfico con una tesis directa, WhatsApp y acceso a sensaciones y
   datos orientativos.
2. «Qué quieres notar»: radios nativos, respuesta breve y curva conceptual en
   una sola pieza compacta. El JavaScript interpola la curva y actualiza la
   plantilla de WhatsApp; el HTML lleva las cinco curvas estáticas.
3. Configuraciones: un raíl seleccionable y una única escena cambiante. No hay
   acordeón ni cinco tarjetas repetidas. La foto de la rueda da continuidad al
   coche y la moto deportiva aparece al elegir «Motos».
4. Tuning-shop.com bajo activación voluntaria, mediante el cargador compartido.
5. Cierre de cobre con los cuatro datos de `REPRO_SEND` y la plantilla actual.

## Aislamiento y degradación

La carcasa y la hoja de estilos son propias. No importan `PublicLayout`,
`tokens.css`, los componentes del sitio ni los conceptos B/C. Solo se comparte
configuración, contenido, `whatsappUrl()` y el cargador del configurador.

Sin JavaScript, los dos selectores siguen funcionando con CSS y todo el
contenido esencial permanece visible. Con `prefers-reduced-motion`, no se
interpola la curva ni se ejecuta la entrada del hero; los cambios de estado se
aplican inmediatamente.

## Correcciones de composición

La primera maqueta tenía tres fallos de maquetación que se veían a simple
vista, y los tres se han corregido sin tocar ni una palabra del contenido.

**Ejes lógicos bajo `writing-mode` vertical.** `.cdx-hero__side` y `.cdx-calc`
usaban `inset-block-start` e `inset-inline-end` siendo elementos con
`writing-mode: vertical-rl`. Las propiedades lógicas se resuelven contra el
modo de escritura *del propio elemento*, así que «arriba» pasaba a ser «a la
derecha» y «a la derecha» pasaba a ser «abajo»: la firma nacía descolgada y el
atajo flotante aparecía suelto a media página, con la etiqueta cortada. Ambos
usan ahora insets físicos. **Si vuelve a aparecer un elemento vertical, sus
offsets van en `top/right/bottom/left`.**

**La firma vertical cabe entera.** Pasó de `clamp(5rem, 15vw, 16rem)` a
`clamp(2.4rem, 5.2vw, 5.5rem)`, centrada sobre el eje del hero. Medida entre
768 y 1920 px de ancho: siempre queda un margen superior e inferior de más de
120 px. Por debajo de 48 rem no se dibuja: sobre una columna estrecha solo
tapaba el texto y el raíl.

**El subrayado del titular.** El `<em>` del `h1` ocupa dos líneas, así que un
`::after` absoluto colgado de él caía fuera del titular y tachaba el párrafo
siguiente. La misma marca de cobre es ahora una regla en flujo, delante del
párrafo.

**Escalas de titular.** Los `h2` de sección bajaron a `clamp(2.35rem, 5vw,
4.5rem)`, y el de la sección de datos —columna estrecha y pegajosa, con la
palabra «motorización» dentro— a `clamp(2rem, 3.1vw, 3.1rem)`. Antes se salía
de su columna y se comía la tarjeta del configurador. Los titulares de las
tarjetas (`h3`) bajaron un escalón por debajo del titular de su sección, que es
la jerarquía que faltaba.

**El atajo flotante.** Es una pastilla horizontal anclada abajo a la derecha;
sobre pantallas anchas se sale de la columna de lectura y, a partir de la
sección de datos, se aparta. Eso último es lo único que añade JavaScript a la
página: **un `IntersectionObserver` en línea, dentro de la propia página**, que
alterna una clase. Sin JavaScript la pastilla se queda quieta y sigue llevando
a `#datos`; no oculta nada ni bloquea nada.

Verificado con capturas reales a 390, 768, 1024, 1440 y 1920 px, en los diez
estados de los dos selectores y con JavaScript desactivado.
