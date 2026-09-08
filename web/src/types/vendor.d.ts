/**
 * Declaraciones para dependencias que no traen las suyas.
 *
 * `iframe-resizer` v4 se publicó antes de que el paquete llevara tipos, y su
 * `@types` de DefinitelyTyped describe la v3. Se declara aquí lo poco que
 * usamos —la función del lado padre— en vez de arrastrar un paquete de tipos
 * que describe otra versión.
 */
declare module "iframe-resizer/js/iframeResizer.js" {
  /** Opciones que realmente pasamos. La librería admite muchas más. */
  export interface IFrameResizerOptions {
    log?: boolean;
    /** Orígenes admitidos para los mensajes. Nunca `false` en nuestro código. */
    checkOrigin?: string[] | boolean;
    minHeight?: number;
    tolerance?: number;
    onInit?: (iframe: HTMLIFrameElement) => void;
  }

  export default function iFrameResize(
    options: IFrameResizerOptions,
    target: HTMLElement | string
  ): HTMLIFrameElement[];
}
