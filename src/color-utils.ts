export function adjustLuminance(color: string, lum: number) {
  const [r, g, b] = parseHexColor(color);

  const changeLuminosity = (c: number) => {
    const newValue = Math.round(Math.min(Math.max(0, c + c * lum), 255));
    return newValue.toString(16).padStart(2, "0");
  };

  return "#" + [r, g, b].map(changeLuminosity).join("");
}

export function setHexLuminosityPercent(
  color: string,
  luminosityPercent: number,
) {
  const [unscaledR, unscaledG, unscaledB] = parseHexColor(color);
  const r = unscaledR / 255;
  const g = unscaledG / 255;
  const b = unscaledB / 255;

  const targetLightness =
    Math.max(0, Math.min(100, Number(luminosityPercent))) / 100;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Keep hue/saturation and set absolute HSL lightness.
  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * ((max + min) / 2) - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  const c = (1 - Math.abs(2 * targetLightness - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = targetLightness - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  const newR = Math.round((rp + m) * 255);
  const newG = Math.round((gp + m) * 255);
  const newB = Math.round((bp + m) * 255);

  return `#${[newR, newG, newB].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function parseHexColor(color: string): [number, number, number] {
  if (color.length !== 7 || !color.startsWith("#")) {
    throw new Error(`Invalid hex color: ${color}. Expected format: #RRGGBB.`);
  }

  const normalized = color.slice(1);

  const parsePart = (part: string) => {
    const value = parseInt(part, 16);
    if (isNaN(value)) {
      throw new Error(`Invalid hex color component: ${part}`);
    }
    return value;
  };

  return [
    parsePart(normalized.slice(0, 2)),
    parsePart(normalized.slice(2, 4)),
    parsePart(normalized.slice(4, 6)),
  ];
}

export function getForegroundShadeForBackground(color: string) {
  const [r8, g8, b8] = parseHexColor(color);

  // WCAG relative luminance.
  const scaleChannel = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = scaleChannel(r8);
  const g = scaleChannel(g8);
  const b = scaleChannel(b8);
  const backgroundLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Pick the side (light/dark) that preserves contrast, but compute an actual gray shade.
  if (backgroundLuminance <= 0.18) {
    return setHexLuminosityPercent(color, 95);
  } else {
    return setHexLuminosityPercent(color, 5);
  }
}
