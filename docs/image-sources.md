# Procedencia de las imágenes

Todas las fotografías están **descargadas en el repositorio**
(`web/src/assets/photos/`). El navegador no hace ninguna petición a Pexels,
Unsplash ni Google: verificado en el HTML generado.

Astro las convierte a WebP en varios tamaños durante el build. Los archivos
originales JPEG no se sirven.

---

## Licencia

Las diez proceden de **Pexels**, bajo la [Licencia de Pexels](https://www.pexels.com/license/):
uso gratuito, también comercial, sin necesidad de atribución y sin registro.
Se acredita igualmente aquí por trazabilidad.

Siete están en las páginas públicas; las tres últimas son de la maqueta interna
del Concepto B y **no se sirven en ninguna página del sitio**.

No se ha usado Unsplash+ (de pago) ni ninguna imagen de licencia dudosa.

---

## Inventario

### 1. `diagnosis-portatil-vehiculo.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/diagnosis-portatil-vehiculo.jpg` |
| Autor | ThisIsEngineering |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/3862610/ |
| Descarga | `https://images.pexels.com/photos/3862610/pexels-photo-3862610.jpeg` |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-20 |
| Dónde se usa | **Ambiente del hero de la portada** (`/`): al 16 % de opacidad, ligeramente desenfocada y bajo dos degradados, como textura del banco de trabajo. `alt=""` y `aria-hidden`, porque no aporta información: la aporta el despiece dibujado que va encima |
| Qué muestra | Una técnica conecta un portátil a un vehículo y consulta gráficas de datos |
| Por qué | Es literalmente lo que se hace al leer o reprogramar una centralita. Sin rostro visible, sin matrícula y sin logotipo de marca protagonista |

### 2. `soldadura-placa-electronica.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/soldadura-placa-electronica.jpg` |
| Autor | tanfeez |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/10699354/ |
| Descarga | `https://images.pexels.com/photos/10699354/pexels-photo-10699354.jpeg` |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-20 |
| Dónde se usa | Sección «El trabajo por dentro» de la portada, **a sangre hasta el borde de la pantalla**. Es la única fotografía protagonista de la portada |
| Qué muestra | Manos soldando un componente sobre una placa de circuito impreso |
| Por qué | Es la reparación a nivel de componente, que es exactamente el servicio. El gesto es técnicamente correcto: soldador en una mano, estaño en la otra. Sin rostro ni marcas |

### 3. `equipo-diagnosis-motor.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/equipo-diagnosis-motor.jpg` |
| Autor | Lumiere Studio MX |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/4116172/ |
| Descarga | `https://images.pexels.com/photos/4116172/pexels-photo-4116172.jpeg` |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-20 |
| Dónde se usa | **Hoy en ninguna parte.** Estuvo a sangre en `/servicios/reprogramacion`, junto a «Cuándo tiene sentido», hasta que esa página se rehízo entera alrededor del vehículo y no de la centralita (ver [frontend-design.md](frontend-design.md) §5.16). Antes de eso fue una banda decorativa en `/servicios`, también retirada. **El archivo se conserva**: sigue siendo la mejor candidata para ilustrar «equipo conectado al vehículo» cuando haga falta, y al no importarla nadie no pesa un solo byte en el build |
| Qué muestra | Equipo de diagnosis apoyado sobre el vano motor de un vehículo en el taller |
| Por qué | Taller real, no de catálogo. Distinta de la del hero de la portada, como se pedía. Sin rostro, matrícula ni marca protagonista |

### 4. `manos-placa-precision.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/manos-placa-precision.jpg` |
| Autor | Bulat843 |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/close-up-of-hands-repairing-circuit-board-with-precision-37340089/ |
| Descarga | `https://images.pexels.com/photos/37340089/pexels-photo-37340089.jpeg` (1100 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-24 |
| Dónde se usa | **Hero de `/sobre-nosotros`**, en la columna derecha, dentro de un marco vertical (4:5 en escritorio, 4:3 en móvil) |
| Qué muestra | Unas manos trabajando con una herramienta de precisión sobre una placa electrónica, en un banco de trabajo |
| Por qué | Es el gesto de la reparación a nivel de componente, y las manos se ven trabajadas: es lo más cerca que se puede estar de «años de oficio» sin fingir un retrato. Sin rostro, sin matrícula, sin logotipo protagonista |

**Provisional, y con una condición de uso propia:** es la única fotografía del
sitio colocada junto a la presentación de una persona, así que **el nombre del
responsable no se escribe encima ni al lado dentro del marco**. Va en el raíl
de datos del hero, que es otro bloque. Una foto de banco con un nombre encima
es un retrato falso, y esta página no puede permitirse ninguno.

El marco es vertical **para que un retrato real ocupe su sitio sin rehacer la
composición**: sustituir el `import` del archivo en
`web/src/pages/sobre-nosotros.astro` es todo el trabajo.

---

### 5. `coche-tunel-noche.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/coche-tunel-noche.jpg` |
| Autor | Benni Fish |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/dynamic-motion-blur-of-car-in-dark-tunnel-37383934/ |
| Descarga | `https://images.pexels.com/photos/37383934/pexels-photo-37383934.jpeg` (1800 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito, sin atribución obligatoria) |
| Consultada | 2026-08-28 |
| Dónde se usa | **Hero de `/servicios/reprogramacion`**, a sangre y a toda la sección, bajo dos velos de grafito |
| Qué muestra | Un coche circulando de noche por un túnel, captado con barrido: la carrocería nítida, el entorno movido y los pilotos rojos reflejados en el asfalto |
| Por qué | Es literalmente la pregunta que responde la página —qué se nota al volante— y no una centralita sobre una mesa. Sin matrícula legible, sin logotipo de marca reconocible, sin rostros, y lo bastante oscura para sostener texto blanco sin apagar la imagen |

### 6. `rueda-en-movimiento.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/rueda-en-movimiento.jpg` |
| Autor | 04iraq |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/dynamic-close-up-of-a-spinning-car-wheel-29615588/ |
| Descarga | `https://images.pexels.com/photos/29615588/pexels-photo-29615588.jpeg` (1200 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-28 |
| Dónde se usa | Mitad izquierda del **díptico de `/servicios/reprogramacion`**, a sangre |
| Qué muestra | La rueda de un coche girando a velocidad, con los radios desdibujados por el movimiento y reflejos cálidos en el asfalto |
| Por qué | Movimiento puro, sin marca ni matrícula, y con una llanta de tono bronce que convive con el cobre de la marca. Es el detalle dinámico que pedía la dirección visual sin recurrir a un plano de motor de catálogo |
| Retocada | **Sí**, y conviene saberlo: el original es **vertical** (1200 × 1800) y en una banda apaisada solo se veía el buje. Se recortó a 3:2 centrado en la rueda (1200 × 800) y se le bajó la exposición y la saturación un punto (`brightness 0.84`, `saturation 0.86`) para que no partiera el díptico en dos mundos. Ni recorte ni tono cambian lo que la foto muestra |

### 7. `moto-deportiva-reflejo.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/moto-deportiva-reflejo.jpg` |
| Autor | Marius Gabriel |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/motorcyclist-reflected-on-wet-urban-street-at-dusk-32150796/ |
| Descarga | `https://images.pexels.com/photos/32150796/pexels-photo-32150796.jpeg` (1400 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-28 |
| Dónde se usa | Mitad derecha del **díptico de `/servicios/reprogramacion`**, a sangre |
| Qué muestra | Una moto deportiva con su piloto sobre asfalto mojado al anochecer, reflejada en el suelo, con un puente atirantado al fondo |
| Por qué | Es rendimiento, no movilidad urbana: supersport moderna, postura de conducción y una localización controlada. Comparte gramática con el hero —vehículo, luz baja, suelo mojado, reflejos—, así que las tres fotografías de la página se leen como una serie. Sin matrícula visible, sin logotipo legible en el carenado y con el piloto de casco, no identificable |
| Retocada | **Sí**: recortada a 3:2 sobre la moto y su reflejo (868 × 579 desde 1400 × 931). En el encuadre original la moto quedaba pequeña entre cielo y asfalto y no transmitía nada |

**Sustituye a `moto-noche-ciudad.jpg`** (Keyla Brito, Pexels
[36785842](https://www.pexels.com/photo/nighttime-urban-motorcyclist-in-motion-36785842/)),
que **se retiró del repositorio**. Era una buena fotografía y contaba lo que no
tocaba: una utilitaria con baúl y un piloto en pantalón corto: movilidad
urbana, no rendimiento. La reserva que ya figuraba aquí sobre ella acabó siendo
el motivo de cambiarla.

---

## Inventario del Concepto B

Las tres siguientes **no las usa ninguna página pública**: son de la maqueta
interna `/conceptos/reprogramacion-b` (ver
[concepto-b-reprogramacion.md](concepto-b-reprogramacion.md)). Se buscaron con
un criterio propio, y el criterio explica por qué no valían las del Concepto A:
esa serie es **nocturna**, y este concepto necesitaba **luz de día y
movimiento** para no leerse como la misma página con otro color.

Misma licencia que el resto: Pexels, uso comercial gratuito, sin atribución
obligatoria; se acredita aquí por trazabilidad.

### 8. `concepto-b-coche-barrido.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/concepto-b-coche-barrido.jpg` (1800 × 1440) |
| Autor | Nico Kusuma Jaya |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/39211567/ |
| Descarga | `https://images.pexels.com/photos/39211567/pexels-photo-39211567.jpeg` (1800 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-30 |
| Dónde se usa | **Franja de portada** del Concepto B, a sangre, recortada a una banda de 480 px de alto; y como lámina «coche» del selector «Tu caso» |
| Qué muestra | Un coche azul circulando de día, captado con barrido: carrocería nítida, asfalto y quitamiedos completamente movidos |
| Por qué | Es la tesis del concepto en una imagen: **el vehículo es el único color de la página**. La carrocería azul y las pinzas de freno amarillas son los dos únicos acentos cromáticos de toda la portada, y el resto de la interfaz es gris y tinta |
| Retocada | No |

**Comprobado antes de incorporarla**, ampliándola al 260 %: no hay rostros; la
matrícula delantera queda deshecha por el barrido y es ilegible al tamaño en que
se sirve; no hay ningún logotipo de marca reconocible en el encuadre.

### 9. `concepto-b-vista-conductor.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/concepto-b-vista-conductor.jpg` (1600 × 1067) |
| Autor | Ceren Büşra SEVTEKİN |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/37832994/ |
| Descarga | `https://images.pexels.com/photos/37832994/pexels-photo-37832994.jpeg` (1600 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-30 |
| Dónde se usa | Sección «Al volante» del Concepto B, en la mitad derecha |
| Qué muestra | La carretera vista desde el asiento del conductor: parabrisas, retrovisor interior, una mano en el volante y una nacional entre monte seco |
| Por qué | La sección responde «qué se nota», y esto es literalmente desde dónde se nota. Además el paisaje —secano, cipreses, sierra al fondo— podría ser perfectamente la comarca del taller, cosa que ninguna foto de autopista alpina consigue |
| Retocada | No |

Sin rostro, sin matrícula y sin ningún logotipo legible en el salpicadero.

### 10. `concepto-b-moto-curva.jpg`

| | |
|---|---|
| Archivo | `web/src/assets/photos/concepto-b-moto-curva.jpg` (1200 × 900) |
| Autor | cnrdmroglu (`@entero`) |
| Biblioteca | Pexels |
| URL original | https://www.pexels.com/photo/31837785/ |
| Descarga | `https://images.pexels.com/photos/31837785/pexels-photo-31837785.jpeg` (1400 px de ancho) |
| Licencia | Licencia de Pexels (uso comercial gratuito) |
| Consultada | 2026-08-30 |
| Dónde se usa | Lámina «moto» del selector «Tu caso»: sustituye a la del coche en cuanto el visitante responde que conduce una moto |
| Qué muestra | Una moto naked inclinada en una curva de carretera de montaña, con el piloto con casco integral |
| Por qué | La moto es presencia secundaria en el concepto y aparece **solo cuando alguien dice que conduce una**. Comparte gramática con las otras dos —día, carretera, movimiento— y la curva del asfalto es la mitad de la fotografía: es conducción, no una moto aparcada |
| Retocada | **Sí.** El original es vertical (1400 × 2100) y la lámina es 4:3: se recortó a 1200 × 900 alrededor del piloto y de la curva, sin tocar tono ni color. En el encuadre original más de la mitad del alto era vegetación |

El piloto no es identificable (casco integral con pantalla espejada). El casco
lleva el logotipo de su fabricante y la camiseta un estampado, ninguno legible
al tamaño en que se sirve la imagen; se comprobó ampliando al 300 %.

---

## Fotografías que hay que pedirle al cliente

Por orden de utilidad. Ninguna existe hoy, y cada una sustituye a algo
provisional o llena un hueco que ahora ocupa un dibujo:

| Fotografía | Para qué | Sustituye a |
|---|---|---|
| **Retrato natural del responsable**, trabajando y sin posar | Hero de `/sobre-nosotros` | `manos-placa-precision.jpg` |
| **Zona de trabajo**, plano general y ordenado | Banda ancha en `/sobre-nosotros` o `/como-trabajamos` | Nada: hueco nuevo |
| **Un vehículo real del taller**, en movimiento o en el banco de trabajo | Hero y díptico de `/servicios/reprogramacion` | `coche-tunel-noche.jpg`, `rueda-en-movimiento.jpg` y `moto-deportiva-reflejo.jpg` |
| **Una centralita real**, con la tapa abierta | `/servicios/reparacion-ecu` | El dibujo `FaultTrace` seguiría, la foto acompañaría |
| **Trabajo sobre el vehículo o sobre el banco** | Portada | `diagnosis-portatil-vehiculo.jpg` |
| **Detalle de herramientas o conexiones** | Cualquier banda de apoyo | `soldadura-placa-electronica.jpg` |

Condiciones que hay que pedirle con ellas: **sin matrículas legibles, sin
rostros de clientes, sin logotipos de otras marcas como protagonista**, y con
permiso expreso si aparece alguien identificable. En horizontal para las bandas
anchas y en vertical para el retrato.

---

## Criterios aplicados

**Aceptadas** porque son técnicamente creíbles y coherentes con el servicio:
diagnosis sobre vehículo, electrónica a nivel de placa y taller real.

**Descartadas** durante la selección: salpicaderos y cuadros de instrumentos
(decorativos, sin relación con el servicio), fotos con lector OBD de marca
comercial muy visible, y retratos de mecánico sonriente que parecen de banco de
imágenes.

### El criterio de «nada de coches» se revocó, y solo para reprogramación

Las cuatro primeras imágenes se eligieron con una regla explícita: **fuera los
coches deportivos genéricos**, porque decoraban sin decir nada del servicio. Esa
regla sigue siendo buena para las páginas que hablan de la unidad —reparación,
clonación, diagnóstico— y **se ha revocado para `/servicios/reprogramacion`**,
que ya no habla de la unidad: habla de conducir.

La diferencia no es de gusto. En reparación, una foto de un coche bonito es
decoración; en reprogramación, el coche **es** el asunto, y una placa electrónica
es lo decorativo. Las tres imágenes nuevas comparten además una gramática
—vehículo, de noche, en movimiento, con barrido— para que se lean como una serie
deliberada y no como tres fotos de banco sueltas.

**Esto no autoriza a llenar el resto del sitio de coches.** Si esa dirección se
extiende, se decide página por página y con el mismo argumento: ¿el vehículo es
el asunto, o es el fondo?

**Descartadas en esta segunda tanda**, y por qué, para no repetir la búsqueda:
un Porsche y un Subaru espectaculares con **el logotipo de la marca legible** en
el encuadre; un coche en garaje con **matrícula visible**; una moto de circuito
cubierta de **liveries de patrocinador**; y varias con **rostros identificables**
al volante.

En la segunda vuelta a la fotografía de moto se descartaron además: un Aprilia
y una Kawasaki con **el logotipo de la marca legible**; una Honda CBR roja
—magnífica de luz— con **«HONDA» y «CBR» perfectamente legibles** en el
carenado; y las de circuito, que además de logotipos afirmarían un contexto de
competición que no es el del taller.

### Las páginas de reparación y de clonación no llevan ninguna, y es deliberado

Se evaluó incorporar una macrofotografía de placa y **se descartó**. Los dos
sitios donde encajaría son la banda a sangre junto al texto y el ambiente del
hero, que son exactamente las construcciones de la portada y de
`/servicios/reprogramacion`; y `soldadura-placa-electronica.jpg` ya ilustra
«reparar la placa» en la portada, así que repetir el motivo no añadía nada.

Sobre todo: es una página cuyo argumento es que se mira dentro de **esa** unidad.
Una foto del banco de otra persona es la prueba más débil que se puede aportar
ahí. El recurso distintivo es el dibujo del recorrido (`FaultTrace`), que es
propio, no depende de licencias y no se puede confundir con un trabajo del
taller. Razonamiento completo en
[frontend-design.md](frontend-design.md) §5.2 y §5.5.

**`/servicios/clonacion-ecu` tampoco lleva.** Se evaluó y se descartó por el
mismo motivo, más uno propio: lo que hay que enseñar ahí son **dos** unidades y
la relación entre ellas, y eso no existe en ningún banco de imágenes sin parecer
un montaje. Dos centralitas sueltas sobre una mesa no dicen nada que el dibujo
no diga mejor, y presentarlas como «un trabajo» sería exactamente lo que este
documento prohíbe. El recurso distintivo es `IdentityTransfer`, que es propio,
no depende de licencias y no se puede confundir con un trabajo del taller.

**`/como-trabajamos` tampoco lleva**, y ahí ni siquiera se planteó: la página
habla de un procedimiento, no de una pieza. Una foto de un móvil o de una mesa
de taller no añadiría nada, y el recurso propio es su esquema de cableado.

**Cuando lleguen fotografías reales del taller, las dos páginas de servicio son
las primeras candidatas.**

### Una fotografía por página, no tres

Al rediseñar se redujo deliberadamente el peso de la fotografía de banco de
imágenes. La identidad la llevan ahora **dibujos originales** de centralita
(`EcuExploded`, `ServiceDiagram`, `PowerBand`, `FaultTrace` e
`IdentityTransfer`), que no dependen de licencias, no se pueden confundir con
trabajos del taller y son propios del negocio.

Cada página pública que lleva fotografía conserva **una sola protagonista**, más
la del hero de la portada usada como ambiente. **La excepción es
`/servicios/reprogramacion`**, que lleva tres: es la única página cuyo asunto es
el vehículo y no la pieza, y ahí la fotografía no acompaña al argumento, **es**
el argumento. Tres de las siete páginas
públicas no llevan ninguna. `/sobre-nosotros` sí lleva una, y es la excepción
razonada: es la única página que habla de personas, y sin ninguna imagen queda
en una declaración de intenciones. Cuando lleguen fotos reales del taller, son las que
deben ocupar esos huecos.

### Sobre el retoque

Hasta ahora ninguna imagen se había tocado. Dos del díptico de reprogramación
**sí**, y las dos fichas lo dicen: recorte de encuadre en las dos y un punto
menos de exposición y saturación en la rueda. **Nada de eso cambia lo que la
fotografía muestra**; son las decisiones de encuadre y tono que tomaría
cualquiera al maquetar, hechas sobre el archivo en vez de con `object-position`
porque así no se arrastran píxeles que no se van a ver nunca.

Lo que **no** se hace, y no se va a hacer: retirar o añadir elementos, cambiar
matrículas, fabricar reflejos, ni nada que convierta una foto de banco en algo
que no ocurrió.

**Cada imagen se revisó visualmente antes de incorporarla**, no solo por su
descripción; las tres últimas, además, sobre una hoja de contactos con las
treinta candidatas juntas, y después a tamaño completo. Ninguna tiene aspecto generado por IA, ninguna muestra una acción
técnicamente absurda, y en ninguna hay rostros reconocibles, matrículas legibles
ni logotipos de terceros como elemento principal.

---

## Advertencia importante

**Ninguna de estas imágenes es un trabajo real de JM Repro Cars**, y el sitio no
las presenta como tal: ilustran el tipo de trabajo, no casos concretos. Los
textos que las acompañan hablan del oficio en general, nunca de «nuestros
trabajos».

Cuando haya fotografías propias del taller, deberían sustituir a estas. Es la
opción claramente mejor: son creíbles, únicas y propias.

---

## Rendimiento

| Archivo | Original | WebP generados |
|---|---|---|
| `coche-tunel-noche` | 196 kB | 10 / 22 / 55 / 89 kB |
| `rueda-en-movimiento` | 74 kB | 18 / 31 / 45 kB |
| `moto-deportiva-reflejo` | 97 kB | 15 / 27 / 44 kB |
| `diagnosis-portatil-vehiculo` | 124 kB | 36 / 65 kB |
| `soldadura-placa-electronica` | 175 kB | 46 / 69 / 94 / 117 kB |
| `equipo-diagnosis-motor` | 170 kB | 61 / 101 kB |
| `manos-placa-precision` | 237 kB | 42 / 67 / 123 kB |
| `concepto-b-coche-barrido` | 257 kB | 13 / 20 / 24 / 42 / 45 / 75 / 130 kB |
| `concepto-b-vista-conductor` | 181 kB | 19 / 38 / 72 / 121 kB |
| `concepto-b-moto-curva` | 208 kB | 33 / 59 / 102 / 119 kB |

Los dibujos de centralita **no son archivos**: son SVG en línea, calculados en
el build. No añaden ninguna petición, y el HTML de la portada entero pesa 16 kB
comprimido con el despiece dentro.

Se descargaron a 1400 px de ancho, no en su resolución original: suficiente para
el mayor tamaño servido y evita arrastrar megabytes innecesarios.

Todas llevan `width` y `height` declarados (sin CLS), `alt` descriptivo, y
`loading="lazy"` salvo las de los heros, que van con `fetchpriority="high"`.

## Concepto C

El Concepto C (`/conceptos/reprogramacion-c`) **no usa ninguna fotografía**:
todo su material visual —las siluetas de coche y moto, la figura del
registrador y el trazado en vivo— está dibujado a código (SVG en línea y un
`<canvas>`) para esta maqueta. No hay archivos nuevos que registrar ni
licencias de terceros implicadas; los pictogramas no representan ningún
vehículo real.
