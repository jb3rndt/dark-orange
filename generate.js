var fs = require("fs");
var JSON5 = require("json5");
const template = JSON5.parse(
  fs.readFileSync("./themes/template-flat-color-theme.json", "utf8"),
);
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

function adjustLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  var rgb = "#",
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
}

function setHexLuminosityPercent(hexColor, luminosityPercent) {
  const value = String(hexColor).trim();
  const match = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) {
    throw new Error(`Invalid RGB hex color: ${hexColor}`);
  }

  const normalizedHex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];

  const targetLightness =
    Math.max(0, Math.min(100, Number(luminosityPercent))) / 100;

  let r = parseInt(normalizedHex.slice(0, 2), 16) / 255;
  let g = parseInt(normalizedHex.slice(2, 4), 16) / 255;
  let b = parseInt(normalizedHex.slice(4, 6), 16) / 255;

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

  r = Math.round((rp + m) * 255);
  g = Math.round((gp + m) * 255);
  b = Math.round((bp + m) * 255);

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function parseHexColor(color) {
  const value = String(color).trim();
  const hexMatch = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hexMatch) {
    throw new Error(
      `Unsupported color format: ${color}. Expected #RGB or #RRGGBB.`,
    );
  }

  const normalized =
    hexMatch[1].length === 3
      ? hexMatch[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : hexMatch[1];

  return [0, 1, 2].map((i) => parseInt(normalized.slice(i * 2, i * 2 + 2), 16));
}

function getForegroundShadeForBackground(color) {
  const [r8, g8, b8] = parseHexColor(color);

  // WCAG relative luminance.
  const [r, g, b] = [r8, g8, b8].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const backgroundLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Pick the side (light/dark) that preserves contrast, but compute an actual gray shade.
  if (backgroundLuminance <= 0.18) {
    return setHexLuminosityPercent(color, 95);
  } else {
    return setHexLuminosityPercent(color, 5);
  }
}

const themes = [
  {
    name: "Dark Lime Flat",
    colors: {
      accent: "#67ca4d",
      background: "#202226",
    },
  },
  {
    name: "Dark Purple Flat",
    colors: {
      accent: "#9400d3",
      background: "#1c1e26",
    },
  },
  {
    name: "Dark Yellow Flat",
    colors: {
      accent: "#ffcc00",
      background: "#23272e",
    },
  },
  {
    name: "Dark Orange Flat",
    colors: {
      accent: "#ff7300",
      background: "#24292e",
    },
  },
  {
    name: "Crimson Nights Flat",
    colors: {
      accent: "#D7263D",
      background: "#02182B",
    },
  },
  {
    name: "Sunburst Midnight Flat",
    colors: {
      accent: "#F8C61E",
      background: "#252C37",
    },
  },
  {
    name: "Neon Mint Charcoal Gray Flat",
    colors: {
      accent: "#00F5A0",
      background: "#282D32",
    },
  },
  {
    name: "Burgundy Night Flat",
    colors: {
      accent: "#93032E",
      background: "#151515",
    },
  },
  {
    name: "Charcoal Pale Ivory Flat",
    colors: {
      accent: "#F3F0E7",
      background: "#2A2529",
    },
  },
];

const placeholders = {
  accent: "#67ca4d",
  background: "#202226",
  secondaryBackground: "#282b2f",
  foreground: "#e1e4e8",
  foregroundOnAccent: "#1d1d1d",
};

packageJson.contributes.themes = [
  {
    label: "Dark Orange Default",
    uiTheme: "vs-dark",
    path: "./themes/dark-orange-color-theme.json",
  },
];

for (const theme of themes) {
  theme.colors.secondaryBackground =
    theme.colors.secondaryBackground ??
    adjustLuminance(theme.colors.background, 0.25);
  theme.colors.foregroundOnAccent =
    theme.colors.foregroundOnAccent ??
    getForegroundShadeForBackground(theme.colors.accent);
  theme.colors.foreground =
    theme.colors.foreground ??
    getForegroundShadeForBackground(theme.colors.background);

  var newTheme = structuredClone(template);
  newTheme.name = theme.name;
  for (const [id, color] of Object.entries(template.colors)) {
    for (const [type, placeholder] of Object.entries(placeholders)) {
      if (color.includes(placeholder)) {
        newTheme.colors[id] = color.replace(placeholder, theme.colors[type]);
      }
    }
  }
  const themeFileName = `${theme.name
    .toLowerCase()
    .replaceAll(" ", "-")}-color-theme.json`;

  fs.writeFileSync(
    `./themes/${themeFileName}`,
    JSON.stringify(newTheme, null, 2),
    () => {},
  );

  packageJson.contributes.themes.push({
    label: theme.name,
    uiTheme: "vs-dark",
    path: `./themes/${themeFileName}`,
  });
}

fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
