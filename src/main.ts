import fs from "fs";

import JSON5 from "json5";
import {
  adjustLuminance,
  getForegroundShadeForBackground,
} from "./color-utils";

const template: { name: string; colors: Record<string, string> } = JSON5.parse(
  fs.readFileSync("./themes/template-flat-color-theme.json", "utf8"),
);
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const themes: {
  name: string;
  colors: {
    accent: string;
    background: string;
    secondaryBackground?: string;
    foreground?: string;
    foregroundOnAccent?: string;
  };
}[] = [
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

const placeholders: [keyof (typeof themes)[0]["colors"], string][] = [
  ["accent", "#67ca4d"],
  ["background", "#202226"],
  ["secondaryBackground", "#282b2f"],
  ["foreground", "#e1e4e8"],
  ["foregroundOnAccent", "#1d1d1d"],
];

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
    for (const [type, placeholder] of placeholders) {
      if (color.includes(placeholder)) {
        newTheme.colors[id] = color.replace(
          placeholder,
          theme.colors[type] ?? placeholder,
        );
      }
    }
  }
  const themeFileName = `${theme.name
    .toLowerCase()
    .replaceAll(" ", "-")}-color-theme.json`;

  fs.writeFileSync(
    `./themes/${themeFileName}`,
    JSON.stringify(newTheme, null, 2),
  );

  packageJson.contributes.themes.push({
    label: theme.name,
    uiTheme: "vs-dark",
    path: `./themes/${themeFileName}`,
  });
}

fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
