// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import { SITE_URL } from "./src/config/domain.mjs";
import { buildDevProxy } from "./src/config/devProxy.mjs";

export default defineConfig({
  site: SITE_URL,

  // Sin barra final: /servicios, nunca /servicios/.
  trailingSlash: "never",
  build: { format: "file" },

  integrations: [
    react(),
    sitemap({
      /*
       * El panel nunca entra en el sitemap.
       * Es una de las tres barreras: aquí, `noindex` en el layout del
       * panel y `Disallow: /admin` en robots.txt.
       *
       * `/conceptos` va por el mismo camino y por otro motivo: son maquetas
       * internas para comparar direcciones visuales, no páginas del sitio.
       * Mismas tres barreras —fuera del sitemap, `noindex, nofollow` en su
       * carcasa y `Disallow` en robots—, más una cuarta: ninguna página
       * pública enlaza a ellas.
       */
      filter: (page) => !page.includes("/admin") && !page.includes("/conceptos"),
      /*
       * Nota: la integración emite la portada como el origen desnudo
       * ("https://jmreprocars.com") por la política trailingSlash "never",
       * mientras que su canonical es "/". Google normaliza ambas a la
       * misma URL, así que no se fuerza nada.
       */
    }),
  ],

  vite: {
    plugins: [tailwindcss()],

    server: {
      /*
       * Sin DEV_API_PROXY_TARGET no hay proxy: el servidor de desarrollo no
       * puede alcanzar el backend de producción por descuido.
       * Ver src/config/devProxy.mjs.
       */
      proxy: buildDevProxy(),
    },
  },
});
