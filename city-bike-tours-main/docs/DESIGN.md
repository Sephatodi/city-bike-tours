# Design system

Two looks live side by side. The **rr theme** (reviews and gallery pages, `src/rr-theme.css`) follows the "Rider Reviews & Stories" mobile design. The rest of the site keeps the original palette in `src/index.css` and `src/community.css`. Pages using rr add `class="rr rr-bg"` to their main element.

## Colour

| Token | Value | Use |
|---|---|---|
| `--rr-bg` | `#001809` | page background |
| `--rr-surface` / `-2` / `-3` | `#052011` / `#092515` / `#152f1f` | inputs, plates, chips |
| `--rr-card` | `#1b4332` | avatars, selected cards |
| `--rr-gold` | `#e9c46a` | accents, stars, headings in italics |
| `--rr-orange` | `#f75510` | primary call to action |
| `--rr-text` / `--rr-muted` | `#cbead1` / `#c1c8c2` | text |
| `--rr-outline` | `#414844` | quiet borders |

The older pages use forest green and a gold of `#D4A017`, a cream text colour `#F5EDD9` and the orange Book button. The cursor and the moving background riders are sky blue (`#38BDF8`). The site icon and favicon are gold (`#F5B800`) on dark green (`#1A3A2A`).

## Type

- rr theme: **Vollkorn** (serif) for headings, **Plus Jakarta Sans** for body and labels (loaded in `index.html`, `display=swap`).
- Other pages: Fraunces for display, Outfit for body.
- Small labels are uppercase with wide letter spacing; headings use a calm serif with the key word in gold italic ("Stories from the *Saddle*").

## Surfaces and components

- Background: two radial dot layers on a 24px grid (`.rr-bg`), a quiet echo of the diamond motif.
- `.rr-plate` (translucent green, blur, 18% gold border) and `.rr-plate-elevated` (35% border, deep shadow).
- Buttons: `.rr-btn-primary` (orange, white uppercase text, 44px+ high) and `.rr-btn-ghost` (gold outline). Filter pills: `.rr-pill-btn`; toggles: `.rr-toggle`.
- Icons are inline SVG from `RrIcon.jsx`; no icon font is loaded.
- Review card: initials avatar, name with optional verified tick, time, stars, tour tag, quote, optional photo with stop label, stop chips, helpful and share actions, and a tinted team-reply block.
- Site folders (heritage trail) and the showcase carousel with six route buttons (gallery); a per-site photo grid with a fixed 4:3 ratio to avoid layout shift.
- Phones get a docked bottom bar (Trail, Gallery, Reviews, Book) below 768px.

## Behaviour rules

- **Real data only.** Never ship placeholder numbers, names or photos. Show real data or an empty state; badges such as "Verified rider" must be backed by a check in the database.
- **Time** is always shown in Gaborone time through `src/lib/time.js`; use `Stamp` for "29 Oct 2026, 21:28 · 5 min ago".
- **Freshness:** use `usePolling` for lists that change (messages 20s, reviews and prices 60s).
- **Motion:** respect `prefers-reduced-motion`; the rr theme switches animation off.
- **Accessibility:** visible focus rings, 44px touch targets, AA contrast, labels on every control, `aria-pressed` on toggles, `aria-current` on the active navigation item.
- **Passwords** always have a Show / Hide button.
- **Heritage trail map:** the optional street-route JSON is dynamically loaded only on `/heritage-trail`. A gold bicycle and ridden-progress line animate along the orange route, pausing at each site; the home and booking maps retain their original straight-line route. Playback pauses when the tab or map is out of view, and reduced-motion users must start it manually. Keep route-provider attribution visible beside the map controls.
