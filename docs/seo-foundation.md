# Fundamentos SEO — revisión de código y build local

**Esto no es una auditoría SEO de producción.** No hay despliegue, ni Search
Console, ni analítica, ni métricas de usuarios reales, ni enlaces entrantes, ni
contenido definitivo. Lo único que se ha revisado es el código del repositorio y
los archivos que genera `npm run build` en local, con la skill `seo-audit`.

Fecha de la revisión: 2026-08-20. Build revisado: **6 páginas** (4 públicas
—portada, `/servicios`, `/servicios/reprogramacion` y la 404— más las dos del
panel, que van `noindex`).

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

El dominio sale siempre de `src/config/domain.mjs`. No aparece escrito a mano en
ningún componente ni plantilla.

### Estructura

- Un solo `<h1>` por página. **Verificado en las cuatro páginas públicas.**
- Jerarquía secuencial verificada en el HTML generado: `h1 → h2 → h3`, sin
  saltos de nivel. Comprobado recorriendo todos los encabezados del DOM.
- **Navegación principal formada solo por páginas reales** (`/servicios` y
  `/servicios/reprogramacion`). Ver [site-architecture.md](site-architecture.md) §4.
- Migas de pan en el nivel 2, reflejando la ruta: Inicio › Servicios ›
  Reprogramación.
- HTML semántico: `header`, `nav`, `main`, `section`, `article`, `footer`, `ol`
  para pasos numerados, `dl` para pares dato/valor.
- Cada `section` tiene nombre accesible mediante `aria-labelledby`.
- Enlace «Saltar al contenido» como primer elemento enfocable.
- Enlaces internos con texto descriptivo. No hay ningún «pincha aquí».

---

## 2. Problemas encontrados y corregidos

La revisión encontró cuatro defectos reales en el HTML generado. Los cuatro
están corregidos y verificados en un build posterior.

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

---

## 3. Observaciones que no son defectos

**La portada aparece en el sitemap como `https://jmreprocars.com` y su canonical
es `https://jmreprocars.com/`.** Google normaliza ambas a la misma URL. Forzar
la coincidencia obligaría a pelearse con la integración sin beneficio.

**Twitter Card es `summary`, no `summary_large_image`.** Correcto mientras no
haya imagen social. El componente cambia solo cuando se le pasa una.

**No hay datos estructurados.** Es deliberado (§5).

**El contenido del configurador de `/servicios/reprogramacion` no es contenido
nuestro.** Vive en un `<iframe>` de `tuning-shop.com`, que además lo marca
`noindex, nofollow` por su cuenta. No aporta nada a nuestro posicionamiento, y
por eso la página se sostiene sola: **843 palabras propias** en `<main>` medidas
sobre el HTML generado, frente a 681 de la portada y 622 de `/servicios`.
Tampoco se copian sus cifras a nuestro HTML ni se generan páginas por vehículo.
Ver [embed-tuning-shop.md](embed-tuning-shop.md) §5.

**El marco no existe en el HTML inicial.** Se crea solo si el visitante activa el
configurador, así que un rastreador nunca lo ve. Verificado con navegador real:
cero peticiones externas al cargar cualquiera de las tres páginas públicas.

---

## 4. Riesgos de rendimiento y Core Web Vitals

Previsiones a partir del código, no medidas reales. Sin despliegue no hay TTFB,
ni LCP real, ni datos de campo.

| Aspecto | Situación | Riesgo |
|---|---|---|
| Sitio estático | Astro genera HTML plano; la web pública no envía JavaScript | Bajo |
| JS en el panel | ~187 KB (58 KB gzip) de React, solo bajo `/admin` | Ninguno para SEO: el panel no se indexa |
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

Cuando haya página de servicios individuales, añadir `Service`; y `BreadcrumbList`
en cuanto existan las migas de nivel 2.

---

## 6. Móvil y HTTPS

- Diseño responsive real, mobile-first, verificado a 375, 768, 1024 y 1280 px.
- Sin scroll horizontal: los contenedores usan `max-width` relativo.
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
