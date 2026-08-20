# Procedencia de las imágenes

Todas las fotografías están **descargadas en el repositorio**
(`web/src/assets/photos/`). El navegador no hace ninguna petición a Pexels,
Unsplash ni Google: verificado en el HTML generado.

Astro las convierte a WebP en varios tamaños durante el build. Los archivos
originales JPEG no se sirven.

---

## Licencia

Las tres proceden de **Pexels**, bajo la [Licencia de Pexels](https://www.pexels.com/license/):
uso gratuito, también comercial, sin necesidad de atribución y sin registro.
Se acredita igualmente aquí por trazabilidad.

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
| Dónde se usa | **`/servicios/reprogramacion`**, a sangre hasta el borde derecho, junto a «Cuándo tiene sentido». Antes fue una banda decorativa a todo el ancho de `/servicios`, que **se retiró**: separaba dos secciones que ya se distinguían solas y no aportaba nada. Aquí sí tiene función: conectar el equipo al vehículo es literalmente el gesto del servicio |
| Qué muestra | Equipo de diagnosis apoyado sobre el vano motor de un vehículo en el taller |
| Por qué | Taller real, no de catálogo. Distinta de la del hero de la portada, como se pedía. Sin rostro, matrícula ni marca protagonista |

---

## Criterios aplicados

**Aceptadas** porque son técnicamente creíbles y coherentes con el servicio:
diagnosis sobre vehículo, electrónica a nivel de placa y taller real.

**Descartadas** durante la selección: coches deportivos genéricos, salpicaderos
y cuadros de instrumentos (decorativos, sin relación con el servicio), fotos con
lector OBD de marca comercial muy visible, y retratos de mecánico sonriente que
parecen de banco de imágenes.

### Una fotografía por página, no tres

Al rediseñar se redujo deliberadamente el peso de la fotografía de banco de
imágenes. La identidad la llevan ahora **dibujos originales** de centralita
(`EcuExploded`, `ServiceDiagram`), que no dependen de licencias, no se pueden
confundir con trabajos del taller y son propios del negocio.

Cada página pública conserva **una sola fotografía protagonista**, más la del
hero de la portada usada como ambiente. Cuando lleguen fotos reales del taller,
son las que deben ocupar esos huecos.

**Cada imagen se revisó visualmente antes de incorporarla**, no solo por su
descripción. Ninguna tiene aspecto generado por IA, ninguna muestra una acción
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
| `diagnosis-portatil-vehiculo` | 124 kB | 36 / 65 kB |
| `soldadura-placa-electronica` | 175 kB | 46 / 69 / 94 / 117 kB |
| `equipo-diagnosis-motor` | 170 kB | 61 / 101 kB |

Los dibujos de centralita **no son archivos**: son SVG en línea, calculados en
el build. No añaden ninguna petición, y el HTML de la portada entero pesa 16 kB
comprimido con el despiece dentro.

Se descargaron a 1400 px de ancho, no en su resolución original: suficiente para
el mayor tamaño servido y evita arrastrar megabytes innecesarios.

Todas llevan `width` y `height` declarados (sin CLS), `alt` descriptivo, y
`loading="lazy"` salvo las de los heros, que van con `fetchpriority="high"`.
