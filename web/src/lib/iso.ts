/**
 * Proyección dimétrica 2:1 para los dibujos de centralita.
 *
 * Todos los diagramas del sitio —el despiece del hero y los tres de
 * servicios— comparten estas funciones, de modo que las piezas encajan entre
 * dibujos y no hay dos «isometrías» ligeramente distintas conviviendo.
 *
 * Coordenadas de tablero (u, v):
 *   u avanza hacia la derecha y abajo   → pantalla (+u, +u/2)
 *   v avanza hacia la izquierda y abajo → pantalla (−v, +v/2)
 *
 * Nada de esto se dibuja a mano en un `d="…"`: si las caras no encajan, es un
 * error de cálculo, no de pulso.
 */

export const px = (ox: number, u: number, v: number): number => ox + u - v;
export const py = (oy: number, u: number, v: number): number => oy + (u + v) / 2;

export const pt = (ox: number, oy: number, u: number, v: number): string =>
  `${px(ox, u, v).toFixed(1)} ${py(oy, u, v).toFixed(1)}`;

/**
 * Cara superior de una placa rectangular, con la esquina derecha achaflanada
 * `c` unidades. El chaflán es el mismo gesto que el del logotipo.
 */
export function topFace(
  ox: number,
  oy: number,
  w: number,
  d: number,
  c = 0
): string {
  if (c <= 0) {
    return (
      `M ${pt(ox, oy, 0, 0)} L ${pt(ox, oy, w, 0)} ` +
      `L ${pt(ox, oy, w, d)} L ${pt(ox, oy, 0, d)} Z`
    );
  }

  return (
    `M ${pt(ox, oy, 0, 0)} L ${pt(ox, oy, w - c, 0)} L ${pt(ox, oy, w, c)} ` +
    `L ${pt(ox, oy, w, d)} L ${pt(ox, oy, 0, d)} Z`
  );
}

/**
 * Las caras laterales visibles de esa placa extruida `t` hacia abajo: chaflán
 * (si lo hay), costado derecho y frontal. Las otras dos quedan ocultas.
 */
export function sideFaces(
  ox: number,
  oy: number,
  w: number,
  d: number,
  c: number,
  t: number
): string[] {
  const down = (u: number, v: number): string =>
    `${px(ox, u, v).toFixed(1)} ${(py(oy, u, v) + t).toFixed(1)}`;

  const faces: string[] = [];

  if (c > 0) {
    faces.push(
      `M ${pt(ox, oy, w - c, 0)} L ${pt(ox, oy, w, c)} ` +
        `L ${down(w, c)} L ${down(w - c, 0)} Z`
    );
  }

  faces.push(
    `M ${pt(ox, oy, w, c)} L ${pt(ox, oy, w, d)} ` +
      `L ${down(w, d)} L ${down(w, c)} Z`
  );

  faces.push(
    `M ${pt(ox, oy, w, d)} L ${pt(ox, oy, 0, d)} ` +
      `L ${down(0, d)} L ${down(w, d)} Z`
  );

  return faces;
}

export interface IsoBox {
  top: string;
  sides: string[];
}

/** Caja extruida colocada en (u, v) sobre el tablero de origen (ox, oy). */
export function box(
  ox: number,
  oy: number,
  u: number,
  v: number,
  w: number,
  d: number,
  t: number,
  c = 0
): IsoBox {
  const bx = px(ox, u, v);
  const by = py(oy, u, v);

  return {
    top: topFace(bx, by, w, d, c),
    sides: sideFaces(bx, by, w, d, c, t),
  };
}

export type TraceStep = [1 | 2, number];

/**
 * Recorrido de pista: pasos alternos por los dos ejes del tablero, como en una
 * placa real. Nunca en diagonal libre.
 */
export function trace(
  ox: number,
  oy: number,
  u0: number,
  v0: number,
  steps: TraceStep[]
): string {
  let u = u0;
  let v = v0;
  let path = `M ${pt(ox, oy, u, v)}`;

  for (const [axis, len] of steps) {
    if (axis === 1) u += len;
    else v += len;
    path += ` L ${pt(ox, oy, u, v)}`;
  }

  return path;
}

/** Retícula sobre una placa: el mapa de calibración dibujado como la tabla que es. */
export function grid(
  ox: number,
  oy: number,
  w: number,
  d: number,
  cols: number,
  rows: number
): string[] {
  const lines: string[] = [];

  for (let i = 0; i <= cols; i += 1) {
    const u = (w / cols) * i;
    lines.push(`M ${pt(ox, oy, u, 0)} L ${pt(ox, oy, u, d)}`);
  }

  for (let i = 0; i <= rows; i += 1) {
    const v = (d / rows) * i;
    lines.push(`M ${pt(ox, oy, 0, v)} L ${pt(ox, oy, w, v)}`);
  }

  return lines;
}

export interface TracePath {
  /** El atributo `d` del recorrido. */
  d: string;
  /**
   * Fracción del recorrido (0..1) recorrida al terminar cada paso, medida en
   * longitud de pantalla. Sirve para dibujar el trazo por tramos con
   * `pathLength="1"` sin tener que medirlo en el navegador: la geometría ya
   * se conoce aquí, y medir en el cliente ataría el dibujo a que el
   * JavaScript llegue a ejecutarse.
   */
  stops: number[];
}

/**
 * Igual que `trace`, pero devolviendo además dónde queda cada paso dentro del
 * recorrido completo. Los pasos consecutivos por el mismo eje son colineales
 * a propósito: sirven para marcar un punto intermedio sin partir la línea.
 */
export function tracePath(
  ox: number,
  oy: number,
  u0: number,
  v0: number,
  steps: TraceStep[]
): TracePath {
  let u = u0;
  let v = v0;
  let x = px(ox, u, v);
  let y = py(oy, u, v);

  let d = `M ${pt(ox, oy, u, v)}`;
  const lengths: number[] = [];
  let total = 0;

  for (const [axis, len] of steps) {
    if (axis === 1) u += len;
    else v += len;

    const nx = px(ox, u, v);
    const ny = py(oy, u, v);
    total += Math.hypot(nx - x, ny - y);
    lengths.push(total);

    d += ` L ${pt(ox, oy, u, v)}`;
    x = nx;
    y = ny;
  }

  return {
    d,
    stops: lengths.map((value) => (total === 0 ? 1 : value / total)),
  };
}
