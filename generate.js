var fs = require("fs");
const JSON5 = require("json5");
const template = JSON5.parse(
  fs.readFileSync("./themes/template-flat-color-theme.json", "utf8")
);

const themes = [
  {
    name: "Dark Lime Flat",
    colors: {
      accent: "67ca4d",
      background: "202226",
      secondaryBackground: "282b2f",
      foreground: "e1e4e8",
      foregroundOnAccent: "0d0d0d",
    },
  },
  {
    name: "Dark Purple Flat",
    colors: {
      accent: "9400d3",
      background: "1c1e26",
      secondaryBackground: "1f2428",
      foreground: "e1e4e8",
      foregroundOnAccent: "e1e4e8",
    },
  },
  {
    name: "Dark Yellow Flat",
    colors: {
      accent: "ffcc00",
      background: "23272e",
      secondaryBackground: "1f2428",
      foreground: "e1e4e8",
      foregroundOnAccent: "0d0d0d",
    },
  },
  {
    name: "Dark Orange Flat",
    colors: {
      accent: "ff7300",
      background: "24292e",
      secondaryBackground: "1f2428",
      foreground: "e1e4e8",
      foregroundOnAccent: "e1e4e8",
    },
  },
];

const placeholders = {
  accent: "67ca4d",
  background: "202226",
  secondaryBackground: "282b2f",
  foreground: "e1e4e8",
  foregroundOnAccent: "1d1d1d",
};

for (const theme of themes) {
  var newTheme = structuredClone(template);
  newTheme.name = theme.name;
  for (const [id, color] of Object.entries(template.colors)) {
    for (const [type, placeholder] of Object.entries(placeholders)) {
      if (color.includes(placeholder)) {
        newTheme.colors[id] = color.replace(placeholder, theme.colors[type]);
      }
    }
  }

  fs.writeFileSync(
    `./themes/${theme.name
      .toLowerCase()
      .replaceAll(" ", "-")}-color-theme.json`,
    JSON.stringify(newTheme, null, 2),
    () => {}
  );
}
