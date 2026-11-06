import fs from "node:fs";
import path from "node:path";

const SRC = "src";
const CSS_FILES = ["index.css", "community.css", "rr-theme.css"].map(f => path.join(SRC, f));
const bicycleRe = /(?:cursor|tyre|tracks|header-bike|bike-roll|wheel-anim|wheel-spin|hill-|bicycle|RiderIcon)/i;

let out = { styles: {}, bicycle: [] };
for (const file of CSS_FILES) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(text))) {
    const selector = m[1].trim().replace(/\s+/g, " ");
    const body = m[2].trim();
    if (!selector || selector.startsWith("@")) continue;
    (out.styles[path.basename(file)] ||= []).push({ selector, body });
    if (bicycleRe.test(selector) || bicycleRe.test(body)) {
      out.bicycle.push(`${selector} { ${body} }  /* ${path.basename(file)} */`);
    }
  }
}
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/bicycle.txt", [
  "Bicycle-related CSS rules extracted from src/index.css, src/community.css, src/rr-theme.css.",
  "",
  ...out.bicycle,
].join("\n"));

const styleLines = ["# Styles inventory", ""];
for (const [file, rules] of Object.entries(out.styles)) {
  styleLines.push(`## ${file}`, "");
  for (const r of rules) styleLines.push(`- \`${r.selector}\` — \`${r.body.slice(0, 140)}${r.body.length > 140 ? "…" : ""}\``);
  styleLines.push("");
}
fs.writeFileSync("docs/STYLES.md", styleLines.join("\n"));
console.log(`Extracted ${Object.values(out.styles).flat().length} rules, ${out.bicycle.length} bicycle rules.`);
