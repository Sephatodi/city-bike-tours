import { createElement } from "react";

const ICONS = {
  building: [{ tag: "path", d: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" }, { tag: "path", d: "M8 9v.01M8 12v.01M8 15v.01M8 18v.01M16 13v.01M16 16v.01M16 19v.01" }],
  calendar: [{ tag: "rect", x: "3", y: "5", width: "18", height: "16", rx: "2" }, { tag: "path", d: "M16 3v4M8 3v4M3 11h18" }],
  clock: [{ tag: "circle", cx: "12", cy: "12", r: "9" }, { tag: "path", d: "M12 7v5l3 2" }],
  flag: [{ tag: "path", d: "M4 22V4m0 1c5-4 9 4 16 0v11c-7 4-11-4-16 0" }],
  landmark: [{ tag: "path", d: "M3 21h18M4 10h16M5 10v11m4-11v11m6-11v11m4-11v11M3 10l9-7 9 7" }],
  map: [{ tag: "path", d: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" }, { tag: "path", d: "M9 3v15m6-12v15" }],
  mapPin: [{ tag: "path", d: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" }, { tag: "circle", cx: "12", cy: "10", r: "2.5" }],
  palette: [{ tag: "path", d: "M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.8a1.7 1.7 0 0 0-1.3 2.8A2.5 2.5 0 0 1 14 22z" }, { tag: "circle", cx: "7.5", cy: "10", r: ".8" }, { tag: "circle", cx: "10", cy: "6.5", r: ".8" }, { tag: "circle", cx: "15", cy: "7", r: ".8" }],
  phone: [{ tag: "path", d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.8L7.7 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l2.8.5a2 2 0 0 1 1.7 2.7Z" }],
  route: [{ tag: "circle", cx: "6", cy: "19", r: "2" }, { tag: "circle", cx: "18", cy: "5", r: "2" }, { tag: "path", d: "M8 19h2a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4" }],
  scroll: [{ tag: "path", d: "M8 21h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8" }, { tag: "path", d: "M4 3h4v18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 5h4m-4 4h4m-4 4h4" }],
  wallet: [{ tag: "rect", x: "3", y: "5", width: "18", height: "15", rx: "2" }, { tag: "path", d: "M3 9h18m-5 5h.01" }],
  bicycle: [{ tag: "circle", cx: "5.5", cy: "17.5", r: "3.5" }, { tag: "circle", cx: "18.5", cy: "17.5", r: "3.5" }, { tag: "path", d: "M15 6h2l1 2m-7 9 4-9H9l4 9m-2-9-2-3H6m7 3H9" }],
  graduationCap: [{ tag: "path", d: "m2 10 10-5 10 5-10 5z" }, { tag: "path", d: "M6 12v5c3.5 3 8.5 3 12 0v-5m4-2v6" }],
  check: [{ tag: "path", d: "m5 12 4 4L19 6" }],
};

export function iconSvgMarkup(name, size = 18) {
  const shapes = ICONS[name] ?? ICONS.mapPin;
  const content = shapes.map(({ tag, ...attributes }) => {
    const attrs = Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ");
    return `<${tag} ${attrs}/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
}

export default function Icon({ name, size = 18, className, style }) {
  const shapes = ICONS[name] ?? ICONS.mapPin;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "inline-block", flex: "0 0 auto", verticalAlign: "middle", ...style }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes.map(({ tag, ...attributes }, index) => createElement(tag, { key: index, ...attributes }))}
    </svg>
  );
}
