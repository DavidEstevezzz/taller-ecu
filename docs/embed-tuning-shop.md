# Configurador de Tuning-shop.com

La web pública de JM Repro Cars **no hace peticiones a terceros**: las fuentes van
autoalojadas, las imágenes están en el repositorio y no hay analítica. Este
documento registra la **única excepción**, por qué se acepta y con qué límites.

Fecha de la investigación: **2026-08-20**. Nada de esto está desplegado.

---

## 1. Qué es y de dónde viene

La web antigua del cliente ya incrusta este recurso:

```
https://tuning-shop.com/iframe/iframe.php?user=6898
```

Es el configurador de **Tuning-shop.com / Dyno-ChiptuningFiles**: un listado
donde se elige marca, modelo, generación y motorización, y que devuelve potencia
y par de origen, los estimados tras la reprogramación y la diferencia entre
ambos, más algún dato del motor y de la centralita.

El identificador `6898` es la cuenta del cliente. **Aparece públicamente en el
HTML de su web actual**, no es un secreto y no da acceso a nada: solo identifica
de quién es la personalización del listado.

La propia web antigua ya advierte de que el listado es genérico y orientativo, y
de que para la ganancia real, precios o cualquier consulta hay que escribir por
WhatsApp. Ese significado se conserva; lo que cambia es la redacción y, sobre
todo, que el aviso pasa a estar **en nuestro HTML** y no dentro del marco.

---

## 2. Qué se ha comprobado

Todo con `curl` sobre el recurso público, leyendo su HTML y sus scripts. **No se
ha extraído su base de datos, no se han copiado sus registros al repositorio y no
se ha reproducido ninguno de sus endpoints internos.**

### 2.1 Valida el dominio por `Referer` — y esto es lo que más condiciona

| Petición | Respuesta |
|---|---|
| Sin `Referer` | `404` · «Domain could not be validated - please check your referrer settings» |
| `Referer: https://jmreprocars.com/` | `200` · el configurador |
| `Referer: http://localhost:4321/…` | `404` |
| `Referer: http://127.0.0.1:4399/` | `404` |

Consecuencias:

- **`jmreprocars.com` ya está dado de alta** en la cuenta del proveedor. Cuando
  el sitio nuevo se sirva desde ese dominio, debería funcionar.
- **En desarrollo no se puede probar.** Ni con `npm run dev`, ni con
  `astro preview`, ni desde ninguna IP local.
- **La página tiene que servirse por HTTPS.** Con la política de referente por
  defecto (`strict-origin-when-cross-origin`), un documento HTTP no manda
  `Referer` a un recurso HTTPS, y el configurador devolvería `404`.
- Falsear la cabecera `Referer` para que funcione en local **se ha descartado a
  propósito**: es exactamente la restricción de dominio del proveedor y saltársela
  no está permitido.

### 2.2 Cabeceras y marcado

- **No envía `X-Frame-Options` ni `Content-Security-Policy: frame-ancestors`.**
  El marcado no está bloqueado por cabeceras; la única puerta es el `Referer`.
- Sirve `Content-Type: text/html; charset=UTF-8` detrás de Cloudflare.
- El documento del marco lleva `<meta name="robots" content="noindex, nofollow">`
  **puesto por ellos**. Refuerza lo obvio: su contenido no es contenido nuestro
  a efectos de buscadores.

### 2.3 Cookies y almacenamiento

- Deja **una cookie de sesión PHP de tercero**, `HttpOnly`, con nombre
  aleatorizado por instalación (`8828abac…`). No declara `SameSite`.
- Y borra otra (`tuningshopcom=deleted`).
- **No usa `localStorage` ni `sessionStorage`**: buscados en sus dos paquetes de
  JavaScript, cero apariciones.

Por eso el configurador **no se carga solo**: ver §3.

Observación de la prueba: en un Chrome actual, con el bloqueo de cookies de
tercero por defecto, **no llegó a almacenarse ninguna cookie**. No se puede
concluir de ahí que nunca vaya a almacenarse: depende del navegador y de su
configuración. Se registra como observación, no como garantía.

### 2.4 Peticiones externas que genera

Solo a **`tuning-shop.com`**: su CSS, sus dos scripts y sus tipografías
(Oswald, Roboto y Font Awesome, **autoalojadas por ellos**).

- **Sin Google Fonts.**
- **Sin analítica de terceros.** La única coincidencia con `gTag` en su código
  resultó ser `Symbol.toStringTag` del empaquetador, no Google Analytics.

Es un tercero, no seis. Es lo mejor que se podía esperar.

### 2.5 Altura, scroll y redimensionado

- El documento inicial es corto: cabecera, cuatro `<select>` y un botón.
- **El resultado se dibuja en el navegador**, no en el servidor: el HTML que
  devuelve `?car=<id>` es el mismo armazón, y las gráficas las monta su
  JavaScript con Highcharts. Por eso el resultado es bastante más alto que el
  selector.
- **No se ha medido la altura del resultado**, y no se puede desde aquí: haría
  falta renderizarlo, y en desarrollo el proveedor devuelve `404`.
- **Sí ofrece un mecanismo de redimensionado documentado**: su paquete incluye
  `iframe-resizer` **v4** del lado del marco (protocolo `[iFrameSizer]`, saludo
  `[iFrameResizerChild]Ready`). Es la vía prevista para que el marco crezca solo,
  y es la que se usa (§3).

### 2.6 Lo que NO emite

Sus únicos `postMessage` son los de tamaño de `iframe-resizer`. **No publica la
selección del visitante.** Por tanto:

> **No se puede precargar en WhatsApp el vehículo elegido en el configurador.**
> La plantilla es genérica y la rellena la persona. Prometer otra cosa sería
> falso.

Existe en su API un campo `offerte_url` (`?eng=<id>`) que apunta a un flujo de
petición de presupuesto configurable desde su panel. **No está documentado
públicamente, no se ha probado y no se usa.** Queda anotado por si algún día el
cliente quiere explorarlo desde su cuenta.

### 2.7 Accesibilidad y responsive

Lo que se puede afirmar **leyendo su HTML**:

- Los controles son `<select>` nativos con atributo `title`, así que entran en el
  orden de tabulación y los lee un lector de pantalla.
- Lleva `<meta name="viewport">` con `maximum-scale=1.0`, que **bloquea el zoom**
  dentro del marco. Es un defecto suyo y no lo podemos corregir: el interior del
  marco es de otro origen y no se toca.

**No se ha verificado en vivo** su comportamiento en escritorio, tablet ni móvil,
ni su navegación real por teclado, porque no se puede renderizar en desarrollo.
No afirmamos nada más sobre su accesibilidad interna.

### 2.8 Su tema visual

La cuenta `6898` tiene configurados: fondo `#000`, texto `#FFF`, cabecera `#333`
y **botón de acción `#f50052`**, un rosa que no pertenece a la paleta de la web
nueva. El fondo oscuro encaja bien con el panel de grafito donde va incrustado;
el rosa desentona.

**Es configurable desde el panel de Tuning-shop.com del cliente**, no desde
nuestro código. Ver §6.

---

## 3. Cómo se ha integrado

### Activación explícita, no carga automática

El marco **no existe hasta que el visitante lo pide**. Hasta entonces no sale ni
una petición a `tuning-shop.com` ni se deja su cookie.

Resuelve cuatro cosas a la vez:

1. **Privacidad.** Es la razón principal. Un tercero que deja cookie no se carga
   a espaldas de nadie.
2. **Rendimiento.** El tercero desaparece de la carga inicial de la página.
3. **Diseño.** Hasta que se abre, manda nuestro panel, no su estética.
4. **Narrativa.** Da un paso natural entre «explicación» y «selección».

Verificado con navegador real: **cero peticiones externas y cero cookies** en
`/`, `/servicios` y `/servicios/reprogramacion` antes de activar; solo
`tuning-shop.com` después.

### El control es un enlace, no un botón muerto

Sin JavaScript, el control es un enlace normal que abre el configurador en la web
del proveedor. Con JavaScript se intercepta y se incrusta aquí. Se respeta
además Ctrl/Cmd/Shift-clic para abrir en pestaña nueva.

Conviene decirlo claro: **sin JavaScript no hay configurador incrustado, y no por
cómo lo hemos montado nosotros** — su herramienta se dibuja entera en el
navegador. La página lo explica y ofrece WhatsApp, que es el camino que sí
funciona siempre.

### Redimensionado

Se usa `iframe-resizer` **v4.4.5** (MIT), que es el lado padre del mecanismo que
el proveedor ya incluye en el suyo.

- Se importa **dinámicamente al activar**, así que Vite lo separa en su propio
  trozo: quien no abre el configurador no descarga sus ~6,3 kB comprimidos.
- `checkOrigin` limitado al origen del proveedor. Nunca `false`.
- **Red de seguridad**: el marco nace con `min-height` y `height` de 620 px. Si
  el redimensionador no responde —proveedor caído, dominio no autorizado, script
  bloqueado—, el marco se queda en esa altura y desplaza por dentro, en vez de
  colapsar a cero.

**El camino correcto no se ha podido verificar de extremo a extremo**, porque en
desarrollo el proveedor no sirve contenido. Lo que sí está verificado es que el
mecanismo existe en su lado y que el camino de fallo funciona.

### Caja de arena

El marco lleva `sandbox="allow-scripts allow-same-origin allow-forms
allow-popups allow-popups-to-escape-sandbox"`: puede hacer su trabajo, pero **no
puede navegar nuestra ventana**. También `referrerpolicy` explícito, para que una
política más estricta puesta mañana a nivel de documento no lo deje en un `404`.

**Sin verificar** contra el contenido real del proveedor, por lo mismo de siempre.
Es lo primero que hay que mirar el día que se pruebe en el dominio bueno.

### Si el proveedor no responde

A los ocho segundos sin saludo de tamaño aparece un aviso, **sin retirar el
marco** (podría ir lento; quitarlo sería peor). El texto distingue dos casos:

- En `localhost`/`127.0.0.1`: dice que en desarrollo no carga por la restricción
  de dominio, y que eso **no dice nada sobre producción**.
- En cualquier otro sitio: dice que puede ser una caída o un bloqueador, recuerda
  que las cifras son orientativas y lleva a WhatsApp.

El resto de la página —explicación, cuándo tiene sentido, qué enviarnos, avisos,
WhatsApp— **no depende del marco en absoluto**.

---

## 4. Cómo se presentan las cifras

El aviso vive **en nuestro HTML**, fuera del marco, y por tanto se lee siempre:
antes de abrirlo, con él abierto, sin JavaScript y en el HTML que ve un buscador.

Se dice, literalmente, que las cifras:

- son **genéricas y orientativas**, y describen una motorización en general;
- **no son mediciones nuestras**;
- **no salen de una prueba en banco** del vehículo del visitante;
- **no confirman compatibilidad**;
- **no son un presupuesto**.

Y que lo alcanzable en un vehículo real depende de su estado, su historial y su
propia unidad.

En ningún punto del sitio se presenta el configurador como desarrollo propio: la
atribución a Tuning-shop.com aparece en la cabecera del panel, en el aviso y en
el texto de la sección, con enlace a su web.

---

## 5. SEO: qué cuenta y qué no

El contenido del marco es un **documento de otro origen**, marcado `noindex` por
ellos. **No es contenido de nuestra página** y no aporta absolutamente nada a su
posicionamiento.

Por eso la página se sostiene sola: `/servicios/reprogramacion` tiene **843
palabras propias** en `<main>`, medidas sobre el HTML generado —más que la
portada (681) y que `/servicios` (622)—, y ninguna depende del marco.

Y por eso tampoco se hace lo contrario:

- **No se crean páginas por vehículo** ni se indexan combinaciones de marca y
  motor. Sería contenido de otro, multiplicado, sin valor propio.
- **No se copian sus cifras** a nuestro HTML para «tener contenido».

---

## 6. Riesgos abiertos y decisiones del cliente

| # | Asunto | Estado |
|---|---|---|
| 1 | **La integración no se ha probado end-to-end.** Solo se puede el día que la web se sirva desde `jmreprocars.com` por HTTPS | **Pendiente**. Es lo primero que hay que comprobar al desplegar |
| 2 | **Consentimiento de cookies.** El tercero deja cookie de sesión. La activación explícita es una base razonable, pero **no se ha hecho una valoración legal** | **Pendiente de asesoría.** No damos el cumplimiento por cerrado |
| 3 | **Dominios dados de alta.** Hoy responde a `jmreprocars.com`. Si el sitio se sirve desde `www.` o desde un dominio de pruebas, hay que darlo de alta en la cuenta de Tuning-shop.com | **Acción del cliente** |
| 4 | **Color de acción rosa `#f50052`** dentro del marco, que desentona con el cobre | **Acción del cliente**, desde su panel de Tuning-shop.com |
| 5 | **`maximum-scale=1.0`** en el marco bloquea el zoom dentro de él | Defecto del proveedor. No se puede corregir desde fuera |
| 6 | **Dependencia del proveedor.** Si Tuning-shop.com cae o el cliente deja de pagar, el configurador desaparece | Mitigado: la página funciona sin él y hay estado alternativo |
| 7 | **Condiciones de uso del proveedor** para incrustar el recurso | **Sin revisar.** No se han localizado unos términos públicos; conviene que el cliente los confirme con ellos |

---

## 7. Qué no se ha hecho, a propósito

- No se ha extraído su base de datos ni se ha copiado ningún registro suyo al
  repositorio.
- No se han reproducido sus endpoints internos en nuestro código.
- No se ha construido ningún scraper.
- No se ha ocultado la atribución.
- No se ha intentado acceder a ninguna cuenta.
- No se ha falseado el `Referer` para saltarse su restricción de dominio.
- No se toca el DOM interior del marco: es otro origen, y lo único que cruza la
  frontera son sus propios mensajes de tamaño.
- No se ha dibujado ninguna gráfica de potencia propia con valores que no
  podemos leer de forma autorizada.
