# Fundamentos SEO — revisión de código y build local

**Esto no es una auditoría SEO de producción.** No hay despliegue, ni Search
Console, ni analítica, ni métricas de usuarios reales, ni enlaces entrantes, ni
contenido definitivo. Lo único que se ha revisado es el código del repositorio y
los archivos que genera `npm run build` en local, con la skill `seo-audit`.

Fecha de la primera revisión: 2026-08-20. Ampliada el 2026-08-23 al añadir
`/servicios/reparacion-ecu`, y el 2026-08-24 al añadir
`/servicios/clonacion-ecu`, `/como-trabajamos`, `/contacto` y
`/sobre-nosotros`. Build revisado: **11 páginas** (9 públicas —portada,
`/servicios`, las tres de servicio, `/como-trabajamos`, `/contacto`,
`/sobre-nosotros` y la 404— más las dos del panel, que van `noindex`).

---

## 1. Qué se ha implementado

### Indexabilidad y rastreo

| Elemento | Estado | Dónde |
|---|---|---|
| `robots.txt` | Generado, con `Disallow: /admin` y referencia al sitemap | `src/pages/robots.txt.ts` |
| Sitemap XML | Generado, solo con páginas públicas | `@astrojs/sitemap` en `astro.config.mjs` |
| Panel fuera del sitemap | Filtro explícito `!page.includes("/admin")` | `astro.config.mjs` |
| `noindex, nofollow` en el panel | En el layout, no por página | `src/layouts/AdminLayout.astro` |
| `noindex` en la 404 | Sí | `src/pages/404.astro` |

El panel tiene **tres barreras** independientes: el filtro del sitemap, la
metaetiqueta `noindex` y el `Disallow` de robots. Ninguna es seguridad: la
protección real es la sesión del backend. Son señales para buscadores.

### Metadatos

Centralizados en un único componente, `src/components/Seo.astro`. Ninguna página
escribe etiquetas sueltas.

| Elemento | Implementado |
|---|---|
| Título por página, con sufijo de marca | Sí |
| Meta description por página | Sí, con valor por defecto |
| Canonical absoluta | Sí, normalizada |
| Open Graph (`type`, `site_name`, `locale`, `title`, `description`, `url`) | Sí |
| Twitter Card | Sí, `summary` (pasa a `summary_large_image` cuando haya imagen) |
| `lang="es"` | Sí, desde la configuración del sitio |
| `viewport` | Sí, sin bloquear el zoom |
| Favicon | Provisional, SVG, sustituible |
| `theme-color` | Sí |
| Datos estructurados (JSON-LD) | Sí en `/contacto` y `/sobre-nosotros`, a través del mismo componente |

**Los datos estructurados también pasan por `Seo.astro`.** La página decide qué
declara y pasa un objeto; el componente lo serializa. Un
`<script type="application/ld+json">` suelto en una plantilla sería una etiqueta
de cabecera escrita fuera de su sitio.

`/contacto` declara un grafo con `Organization` —nombre, dominio, teléfono en
E.164, `areaServed` y un `ContactPoint` que apunta al enlace de WhatsApp— y una
`ContactPage` que lo referencia. **No declara `address`, ni coordenadas, ni
`openingHours`, ni valoraciones**: no hay ninguno confirmado. Tampoco usa
`AutoRepair`, que sin dirección no aporta y sí invita a inventarla. Ver
[site-architecture.md](site-architecture.md) §11.

`/sobre-nosotros` declara el **mismo nodo `Organization`** —referenciado por
`@id`, para que sea la misma entidad— y una `AboutPage` que lo describe. **No
declara `founder`, ni `foundingDate`, ni `employee`, ni `numberOfEmployees`, ni
`address`**: los años de experiencia y el nombre del responsable son
provisionales, y un dato estructurado provisional es una afirmación firmada. La
página los publica como texto, que se corrige en un minuto; en JSON-LD se
convertirían en algo que Google puede citar.

El dominio sale siempre de `src/config/domain.mjs`. No aparece escrito a mano en
ningún componente ni plantilla.

### Estructura

- Un solo `<h1>` por página. **Verificado en las diez páginas públicas**, con
  navegador real sobre el HTML generado.
- Jerarquía secuencial verificada en el HTML generado: `h1 → h2 → h3`, sin
  saltos de nivel. Comprobado recorriendo todos los encabezados del DOM.
- **Navegación principal formada solo por páginas reales.** Los cuatro servicios
  cuelgan de un desplegable «Servicios» hecho con `<details>` y al lado van
  `/como-trabajamos`, `/sobre-nosotros` y `/contacto`: los siete enlaces están
  en el HTML servido,
  no los inyecta ningún script, así que un rastreador los ve igual que antes.
  **Añadir `/servicios/diagnostico-dtc` no cambió la barra**: entró sola en el
  desplegable al rellenar su `page` en la configuración.
  «Preguntas habituales» sigue siendo un ancla y sigue fuera de la barra.
  Ver [site-architecture.md](site-architecture.md) §4.
- Migas de pan en el nivel 2, reflejando la ruta: Inicio › Servicios ›
  Reprogramación.
- HTML semántico: `header`, `nav`, `main`, `section`, `article`, `footer`, `ol`
  para pasos numerados, `dl` para pares dato/valor.
- Cada `section` tiene nombre accesible mediante `aria-labelledby`.
- Enlace «Saltar al contenido» como primer elemento enfocable.
- Enlaces internos con texto descriptivo. No hay ningún «pincha aquí».

---

## 2. Problemas encontrados y corregidos

La revisión encontró **cinco** defectos reales en el HTML generado —cuatro en
2026-08-20 y uno más en 2026-08-23—. Los cinco están corregidos y verificados en
un build posterior.

### 2.1 Canonicals apuntando a archivos `.html` — **corregido**

Con `build.format: "file"`, `Astro.url.pathname` incluye la extensión durante la
compilación. El resultado era:

```html
<link rel="canonical" href="https://jmreprocars.com/admin.html">
<link rel="canonical" href="https://jmreprocars.com/404.html">
```

La canónica apuntaba a una dirección que el servidor no servirá. Corregido con
una función de normalización en `Seo.astro` que elimina `.html` e `/index.html`
y aplica la política de barra final. Ahora:

```html
<link rel="canonical" href="https://jmreprocars.com/admin">
<link rel="canonical" href="https://jmreprocars.com/404">
```

### 2.2 La página 404 era indexable — **corregido**

No llevaba `noindex` y sí una canónica propia, así que podía acabar indexada
como si fuera contenido. Se añadió `noindex` a la 404 y la capacidad de
propagarlo desde `PublicLayout`.

### 2.3 `PublicLayout` no admitía `noindex` — **corregido**

Consecuencia del anterior: no había forma de marcar una página pública como no
indexable sin duplicar el componente de SEO.

### 2.4 Código muerto en la configuración del sitemap — **corregido**

Se había añadido un `serialize` para forzar la barra final en la portada. No
surtía efecto, porque la integración normaliza después según `trailingSlash`.
Se eliminó en lugar de dejarlo aparentando funcionar.

### 2.5 La cabecera nunca marcaba la página actual — **corregido (2026-08-23)**

Mismo origen que 2.1, y no se había visto porque **en `astro dev` funciona**:
con `build.format: "file"`, `Astro.url.pathname` vale
`/servicios/reprogramacion.html` durante la compilación, así que la comparación
en crudo de `SiteHeader.astro` daba siempre falso. Consecuencia en el HTML
generado de las cuatro páginas públicas: **ni un solo `aria-current="page"`**, y
el pad de cobre que marca la sección activa no se dibujaba nunca.

La normalización se sacó de `Seo.astro` a `src/lib/path.ts` para que haya una
sola, y la usan los dos componentes. Verificado en el build: cada página marca
exactamente un destino, y `/servicios/reprogramacion` marca «Reprogramación»
sin marcar además «Servicios». Hay prueba en `web/test/navigation.test.ts`.

---

### 2.6 Términos de diagnosis sin página propia — **corregido (2026-08-26)**

Las búsquedas de problema —«diagnóstico DTC», «códigos de avería», «testigo de
motor encendido», «modo emergencia»— son las que más tráfico de intención
inmediata traen a un taller de electrónica, y **el sitio no tenía ninguna página
que las respondiera**: estaban repartidas como frases sueltas dentro de
reparación y de la portada, compitiendo entre sí sin que ninguna fuera la
respuesta.

`/servicios/diagnostico-dtc` es esa página. Decisiones que la sostienen:

- **El `h1` no lleva el término.** Es la tesis —«Un código dice dónde mirar. No
  siempre qué cambiar»— porque es lo que convierte al visitante. El término va en
  el `title`, en la descripción, en la entradilla, en la miga de pan y en el
  nombre del servicio, que es más que suficiente y no obliga a escribir un
  titular de catálogo.
- **Nada de relleno por densidad, y se revisó a la baja.** La primera versión de
  la página tenía 1.396 palabras en `<main>` explicando el procedimiento
  interno. **Se rehízo a cinco secciones y 320 palabras visibles** (452 en el
  DOM, contando las cinco respuestas que el CSS oculta). Medido sobre el HTML
  generado, «diagnóstico» aparece 3 veces y «DTC» 3 en `<main>`: suficiente, y
  escrito para alguien con un testigo encendido, no para un contador de palabras
  clave. **Una página concisa y útil vale más que volumen de texto**, y perder
  mil palabras no costó ni un término objetivo: siguen en el `title`, en la
  descripción, en la entradilla, en la miga de pan y en el nombre del servicio.
- **Ningún código de avería concreto**, ni real ni de ejemplo. Es la clase de
  contenido que atrae tráfico y que aquí sería una afirmación técnica sin
  respaldo: qué significa un código depende del vehículo, de la unidad y del
  contexto. Hay una prueba que lo impide (`web/test/dtc.test.ts`), y también
  cierra la puerta a generar páginas por código, que es la tentación evidente.
- **Un solo `h1`, cuatro `h2` y jerarquía sin saltos**, verificado sobre el HTML
  generado después de la reescritura.
- **Los términos que faltaban se reparten sin canibalizar.** La página nueva se
  queda con diagnosis y códigos; reparación sigue siendo la de la avería física;
  reprogramación, la del rendimiento. Los tres `title` y las tres descripciones
  son distintos, y ninguna otra página cambió de tema.
- Se corrigieron además el `title` y la descripción de la portada y de
  `/servicios`, que enumeraban tres servicios y ahora enumeran el nuevo primero.

---

## 3. Observaciones que no son defectos

**La portada aparece en el sitemap como `https://jmreprocars.com` y su canonical
es `https://jmreprocars.com/`.** Google normaliza ambas a la misma URL. Forzar
la coincidencia obligaría a pelearse con la integración sin beneficio.

**Twitter Card es `summary`, no `summary_large_image`.** Correcto mientras no
haya imagen social. El componente cambia solo cuando se le pasa una.

**No hay datos estructurados.** Es deliberado (§5).

**Ni `/servicios/reparacion-ecu` ni `/servicios/clonacion-ecu` hacen ninguna
petición a terceros.** Verificado con navegador real: cero peticiones externas
al cargar. Ninguna de las dos lleva fotografía —el razonamiento está en
[frontend-design.md](frontend-design.md) §5.2 y §5.5— y sus dibujos son SVG en
línea, así que tampoco añaden descargas de imagen.

**En `/como-trabajamos` no hay ni un byte de JavaScript propio**, y nada
esencial depende del que comparte con el resto del sitio: el esquema del
recorrido se sirve trazado y el selector —particular o taller— es un grupo de
radios que cambia de panel con CSS. Es además **la única página pública con el
hero en claro**, para que el esquema en grafito destaque en medio. Comprobado con el JavaScript desactivado en
el navegador: el selector sigue funcionando y los dos paneles siguen siendo
alcanzables.

**En `/servicios/clonacion-ecu` nada esencial depende de JavaScript**: el dibujo
del traslado se sirve completo, los cinco pasos son texto normal y la plantilla
de WhatsApp va servida entera con su enlace funcional. Comprobado con el
JavaScript desactivado en el navegador.

**Contenido propio por página**, contado sobre el HTML generado dentro de
`<main>`, descartando `script`, `style` y el texto rotulado dentro de los SVG:

| Página | Palabras propias |
|---|---|
| `/servicios/clonacion-ecu` | 1.274 |
| `/servicios/reparacion-ecu` | 1.272 |
| `/servicios/reprogramacion` | 891 |
| `/servicios` | 794 |
| `/` | 675 |
| `/sobre-nosotros` | 519 |
| `/como-trabajamos` | 201 |

**`/como-trabajamos` es corta a propósito, y hay que saberlo.** Empezó con 952
palabras, bajó a 276 al quitar lo que repetía y quedó en 201 tras un segundo
pase que retiró lo que describía el propio funcionamiento en vez de servir al
cliente; el razonamiento está en [frontend-design.md](frontend-design.md) §5.8.
La decisión de producto fue optimizarla para **claridad y conversión**, no para
extensión: el contenido técnico y las palabras clave se concentran en las tres
páginas de servicio, y ésta enlaza a las tres en lugar de repetirlas.

**Consecuencia SEO, dicha sin adornos:** con 201 palabras es, con diferencia, la
página pública más ligera del sitio, y a esa extensión no competirá por
consultas como «cómo solicitar una reprogramación». No es un defecto que haya
que corregir con relleno —lo que se quitó repetía o hablaba de nosotros—, pero
si en algún momento interesa que esta URL posicione, el sitio donde ganar
contenido propio sin volver a repetirse es una sección de preguntas frecuentes
reales, que hoy vive como ancla en `/servicios#preguntas`.

Las cifras anteriores de este documento se midieron con otro criterio y no son
comparables con éstas. Éste es el que se usa a partir de ahora.

**El contenido del configurador de `/servicios/reprogramacion` no es contenido
nuestro.** Vive en un `<iframe>` de `tuning-shop.com`, que además lo marca
`noindex, nofollow` por su cuenta. No aporta nada a nuestro posicionamiento, y
por eso la página se sostiene sola con sus 891 palabras propias.
Tampoco se copian sus cifras a nuestro HTML ni se generan páginas por vehículo.
Ver [embed-tuning-shop.md](embed-tuning-shop.md) §5.

**El marco no existe en el HTML inicial.** Se crea solo si el visitante activa el
configurador, así que un rastreador nunca lo ve. Verificado con navegador real:
cero peticiones externas al cargar cualquiera de las cuatro páginas públicas
indexables.

---

## 4. Riesgos de rendimiento y Core Web Vitals

Previsiones a partir del código, no medidas reales. Sin despliegue no hay TTFB,
ni LCP real, ni datos de campo.

| Aspecto | Situación | Riesgo |
|---|---|---|
| Sitio estático | Astro genera HTML plano; la web pública no carga ningún archivo JS | Bajo |
| JS en el panel | ~187 KB (58 KB gzip) de React, solo bajo `/admin` | Ninguno para SEO: el panel no se indexa |
| JS en la web pública | 2,9 KB en línea; 4,3 KB en `/servicios/reparacion-ecu` y 5,0 KB en `/servicios/clonacion-ecu`. `/como-trabajamos`, `/contacto` y `/sobre-nosotros` se quedan en los 2,9 KB comunes | Bajo. Nada de ello hace falta para leer |
| Fuentes | Autoalojadas con `@fontsource`, no desde Google Fonts | Bajo. Evita además enviar la IP del visitante a Google, que en la UE es un problema de RGPD |
| CLS | Sin imágenes todavía; sin contenido que se inyecte tarde | Bajo hoy. **Sube en cuanto haya fotos**: toda imagen deberá llevar `width`, `height` y `alt` |
| LCP | El elemento mayor es texto del hero | Bajo hoy. Cambiará cuando el hero lleve imagen |
| INP | Sin JavaScript en la web pública | Bajo |
| Animaciones | Solo transiciones CSS, con `prefers-reduced-motion` global | Bajo |

**Riesgo principal pendiente:** las fotografías. Cuando lleguen habrá que
servirlas en AVIF/WebP con dimensiones declaradas y `loading="lazy"` salvo la
del hero. El componente `<Image>` de Astro lo resuelve; todavía no se usa porque
no hay imágenes.

---

## 5. Datos estructurados: deliberadamente pendientes

**No se ha implementado ningún schema.** Marcar un negocio local con datos
inventados sería peor que no marcarlo: puede acarrear penalización y desde luego
engaña al usuario.

Se añadirá `LocalBusiness` / `AutoRepair` cuando tengamos confirmados:

- [ ] Logo definitivo (`logo`, `image`)
- [ ] Dirección postal (`address`)
- [ ] Teléfono público (`telephone`)
- [ ] Horario de atención (`openingHoursSpecification`)
- [ ] Área de servicio (`areaServed`)
- [ ] Perfiles sociales reales (`sameAs`)
- [ ] Razón social y NIF (obligatorios además en el aviso legal)

Pendiente de decidir: `Service` para las páginas individuales y `BreadcrumbList`
para las migas de nivel 2, que ya existen en las tres páginas de servicio. Ninguno de los dos necesita datos que no tengamos,
así que son los primeros candidatos cuando se retome el SEO técnico. No se han
añadido en esta fase para no mezclar marcado estructurado con contenido nuevo.

---

## 6. Móvil y HTTPS

- Diseño responsive real, mobile-first, verificado a 375, 414, 768, 1024, 1440 y
  1920 px con navegador real.
- Sin scroll horizontal: comprobado midiendo `scrollWidth` contra `clientWidth`
  en esos seis anchos, no a ojo. Repetido en las cinco páginas indexables al
  añadir `/servicios/clonacion-ecu`, cuyo dibujo se sale del contenedor hasta el
  borde de la pantalla por debajo de 768 px.
- La cabecera mide **77 px exactos en las seis páginas indexables**, a 768,
  1024 y 1280 px. No es cosmética: `--header-height` es lo que usan el índice
  pegajoso de `/servicios` y todos los `scroll-margin` de anclas, y es lo que
  obligó a agrupar los servicios en un desplegable.
- Objetivos táctiles de 44 px mínimo en botones, enlaces de navegación y campos.
- Texto base de 16 px, que evita el autozoom de iOS en los formularios.
- El zoom no está bloqueado.
- **HTTPS: pendiente de despliegue.** No hay servidor ni certificado todavía.
  Cuando llegue el reverse proxy hará falta: HTTPS en todo el sitio, redirección
  301 de HTTP, y sin contenido mixto.

---

## 7. Pendiente para cuando exista despliegue

1. **Redirecciones 301** desde las URLs antiguas de WordPress. El mapa está en
   [site-architecture.md](site-architecture.md) §8.
2. **Regla de barra final en el servidor**: 301 de `/ruta/` a `/ruta`.
3. **HTTPS y HSTS.**
4. Alta en Search Console y envío del sitemap.
5. Medición real de Core Web Vitals con datos de campo.
6. Comprobar los datos estructurados con Rich Results Test **cuando existan**:
   `WebFetch` y `curl` no ven el JSON-LD inyectado por JavaScript, así que
   cualquier revisión de schema hecha solo con ellos daría un falso negativo.

---

## 8. Lo que esta revisión NO cubre

Por si alguien la lee dentro de seis meses y la confunde con otra cosa:

- Investigación de palabras clave. No se ha hecho, y no se afirma ningún volumen
  de búsqueda: sin datos reales sería inventar.
- Análisis de competencia.
- Autoridad, enlaces entrantes o menciones.
- Rendimiento medido: no hay despliegue.
- Calidad del contenido definitivo: el actual es provisional.
- E-E-A-T: depende de datos del cliente que aún no tenemos.
