import fs from "fs";

import JSON5 from "json5";
import {
  adjustLuminance,
  getForegroundShadeForBackground,
} from "./color-utils";

const template: { name: string; colors: Record<string, string> } = JSON5.parse(
  fs.readFileSync("template-flat-color-theme.json", "utf8"),
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
    name: "Pale Ivory Charcoal Flat",
    colors: {
      accent: "#F3F0E7",
      background: "#2A2529",
    },
  },
  {
    name: "Icy Blue Gunmetal Flat",
    colors: {
      accent: "#A4D8FF",
      background: "#232729",
    },
  },
  {
    name: "Neo Lime Ink Void Flat",
    colors: {
      accent: "#F1FEC8",
      background: "#23212C",
    },
  },
  {
    name: "Blush Midnight Flat",
    colors: {
      accent: "#F2DFD8",
      background: "#211D2D",
    },
  },
  {
    name: "Electric Purple Deep Black Flat",
    colors: {
      accent: "#B23EFF",
      background: "#1E1E1E",
    },
  },
  {
    name: "Lemon Glow Steel Gray Flat",
    colors: {
      accent: "#FEEF4C",
      background: "#282D32",
    },
  },
  {
    name: "Peyton Frosted Black Flat",
    colors: {
      accent: "#1A7A4C",
      background: "#101820",
    },
  },
  {
    name: "Aquamarine Carbon Flat",
    colors: {
      accent: "#216869",
      background: "#1F2421",
    },
  },
  {
    name: "Butter Charcoal Flat",
    colors: {
      accent: "#FDF984",
      background: "#202221",
    },
  },
  {
    name: "Mana Midnight Flat",
    colors: {
      accent: "#3869F4",
      background: "#0D131A",
    },
  },
  {
    name: "Sandy Cove Midnight Flat",
    colors: {
      accent: "#CFB787",
      background: "#0D131A",
    },
  },
  {
    name: "Persian Red Raisin Black Flat",
    colors: {
      accent: "#BB4430",
      background: "#231F20",
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

fs.readdirSync("./themes").forEach((file) => {
  if (file !== "dark-orange-color-theme.json") {
    fs.unlinkSync(`./themes/${file}`);
  }
});
const readmeElements: string[] = [];

themes.sort((a, b) => a.name.localeCompare(b.name));

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

  readmeElements.push(
    `### ${theme.name}\n\n![${theme.name} (JavaScript example)](images/${theme.name.toLowerCase().replaceAll(" ", "-")}-javascript.png)\n`,
  );
}

fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));
const readmeContent = fs.readFileSync("./README.md", "utf8");
const updatedReadmeContent = readmeContent.replace(
  /<!-- FLAT_THEME_LIST_START -->[\s\S]*<!-- FLAT_THEME_LIST_END -->/,
  `<!-- FLAT_THEME_LIST_START -->\n\n${readmeElements.join("\n")}\n<!-- FLAT_THEME_LIST_END -->`,
);
fs.writeFileSync("./README.md", updatedReadmeContent);
