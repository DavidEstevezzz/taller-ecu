interface ResponseGoal {
  id: string;
  values: number[];
  zone: [number, number];
  message: string;
}

interface ResponseData {
  x0: number;
  x1: number;
  base: number;
  height: number;
  samples: number;
  stock: number[];
  goals: ResponseGoal[];
}

const root = document.querySelector<HTMLElement>("[data-cdx-response]");

if (root) {
  let data: ResponseData | null = null;
  try {
    data = JSON.parse(root.dataset.response ?? "") as ResponseData;
  } catch {
    /* El estado estático sigue siendo completo. */
  }

  const radios = Array.from(
    root.querySelectorAll<HTMLInputElement>(".cdx-response__radio")
  );
  const link = root.querySelector<HTMLAnchorElement>("[data-cdx-response-link]");
  const line = root.querySelector<SVGPathElement>("[data-cdx-line]");
  const glow = root.querySelector<SVGPathElement>("[data-cdx-glow]");
  const area = root.querySelector<SVGPathElement>("[data-cdx-area]");
  const zone = root.querySelector<SVGRectElement>("[data-cdx-zone]");
  const number = root.dataset.number ?? "";
  const canMove = document.documentElement.classList.contains("cdx-motion");

  const selected = (): ResponseGoal | null => {
    if (!data) return null;
    const value = radios.find((radio) => radio.checked)?.value;
    return data.goals.find((goal) => goal.id === value) ?? data.goals[0] ?? null;
  };

  const updateLink = (goal: ResponseGoal): void => {
    if (link) {
      link.href = `https://wa.me/${number}?text=${encodeURIComponent(goal.message)}`;
    }
  };

  if (data && line && glow && area && zone && canMove) {
    const { x0, x1, base, height, samples } = data;
    const span = x1 - x0;
    const px = (i: number): number => x0 + (span * i) / (samples - 1);
    const py = (value: number): number => base - value * height;

    const curve = (values: number[]): string => {
      let d = `M ${px(0).toFixed(1)} ${py(values[0]!).toFixed(1)}`;
      for (let i = 0; i < values.length - 1; i += 1) {
        const i0 = Math.max(i - 1, 0);
        const i3 = Math.min(i + 2, values.length - 1);
        const p0y = py(values[i0]!);
        const p1x = px(i);
        const p1y = py(values[i]!);
        const p2x = px(i + 1);
        const p2y = py(values[i + 1]!);
        const p3y = py(values[i3]!);
        d += ` C ${(p1x + (p2x - px(i0)) / 6).toFixed(1)} ${(p1y + (p2y - p0y) / 6).toFixed(1)}, ${(p2x - (px(i3) - p1x) / 6).toFixed(1)} ${(p2y - (p3y - p1y) / 6).toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
      }
      return d;
    };

    let current = data.stock.slice();
    let currentZone: [number, number] = data.goals[0]?.zone ?? [x0, 0];
    let frame = 0;

    const paint = (values: number[], nextZone: [number, number]): void => {
      const d = curve(values);
      line.setAttribute("d", d);
      glow.setAttribute("d", d);
      area.setAttribute("d", `${d} L ${x1} ${base} L ${x0} ${base} Z`);
      zone.setAttribute("x", nextZone[0].toFixed(1));
      zone.setAttribute("width", nextZone[1].toFixed(1));
    };

    const tween = (goal: ResponseGoal): void => {
      const from = current.slice();
      const fromZone: [number, number] = [...currentZone];
      const start = performance.now();
      const duration = 480;
      if (frame) cancelAnimationFrame(frame);

      const step = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        current = from.map(
          (value, i) => value + (goal.values[i]! - value) * eased
        );
        currentZone = [
          fromZone[0] + (goal.zone[0] - fromZone[0]) * eased,
          fromZone[1] + (goal.zone[1] - fromZone[1]) * eased,
        ];
        paint(current, currentZone);
        frame = t < 1 ? requestAnimationFrame(step) : 0;
      };
      frame = requestAnimationFrame(step);
    };

    paint(current, currentZone);
    root.classList.add("is-live");

    const enter = (): void => {
      const goal = selected();
      if (goal) tween(goal);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          enter();
        },
        { threshold: 0.25 }
      );
      observer.observe(root);
    } else {
      enter();
    }

    for (const radio of radios) {
      radio.addEventListener("change", () => {
        const goal = selected();
        if (!goal) return;
        tween(goal);
        updateLink(goal);
      });
    }
  } else {
    for (const radio of radios) {
      radio.addEventListener("change", () => {
        const goal = selected();
        if (goal) updateLink(goal);
      });
    }
  }

  const initial = selected();
  if (initial) updateLink(initial);
}

export {};
