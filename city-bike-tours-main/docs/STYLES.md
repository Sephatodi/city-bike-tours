# Styles inventory

## index.css

- `*` — `box-sizing: border-box;`
- `html` — `scroll-behavior: smooth;
  /* Everything is sized in rem, so growing the root grows the whole site in proportion:
     16px on phones, about…`
- `body` — `font-family: var(--font-body);
  background-color: #123222;
  color: #F5EDD9;
  overflow-x: hidden;`
- `:root` — `--cursor-direction: 1;`
- `body.bike-cursor-enabled, body.bike-cursor-enabled button, body.bike-cursor-enabled a, body.bike-cursor-enabled input, body.bike-cursor-enabled select` — `cursor: none;`
- `.custom-cursor-follower, .touch-bicycle-pointer` — `position: fixed;
  pointer-events: none;
  z-index: 10050;
  line-height: 0;
  will-change: transform;
  filter: drop-shadow(0 0 3px rgba(56…`
- `.tyre-tracks` — `position: fixed; inset: 0; z-index: 10049; width: 100vw; height: 100vh; pointer-events: none;`
- `.custom-cursor-follower` — `top: 0;
  left: 0;
  transform: translate3d(-100px, -100px, 0) translate(-50%, -50%);
  transition: opacity 0.15s ease;`
- `.touch-bicycle-pointer` — `transform: translate(-50%, -55%);`
- `.header-bike` — `--bike-w: clamp(110px, 11vw, 170px);
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden; /* sideways only matters: lanes are…`
- `.header-bike-layer` — `position: absolute;
  left: 0;
  right: 0;
  /* spread the lanes over the container, leaving room for a whole bicycle at the bottom */
  top…`
- `.header-bike-rider` — `position: absolute;
  top: 0;
  left: 0;
  width: var(--bike-w);
  height: calc(var(--bike-w) * 0.77);
  animation-duration: var(--dur, 30s)…`
- `.header-bike-layer-forward .header-bike-rider` — `animation-name: header-bike-drift-forward;`
- `.header-bike-layer-backward .header-bike-rider` — `animation-name: header-bike-drift-backward;`
- `0%` — `transform: translateX(calc(var(--bike-w) * -1.2)) rotate(-1.5deg);`
- `50%` — `transform: translateX(calc(50vw - var(--bike-w) / 2)) rotate(1.5deg);`
- `100%` — `transform: translateX(100vw) rotate(-1.5deg);`
- `0%` — `transform: translateX(100vw) scaleX(-1) rotate(-1.5deg);`
- `50%` — `transform: translateX(calc(50vw - var(--bike-w) / 2)) scaleX(-1) rotate(1.5deg);`
- `100%` — `transform: translateX(calc(var(--bike-w) * -1.2)) scaleX(-1) rotate(-1.5deg);`
- `.header-bike-rider` — `animation: none !important; left: calc(50% - var(--bike-w) / 2);`
- `.header-bike-rider:nth-child(2)` — `display: none;`
- `/* one per lane so none overlap */ .header-bike-layer:nth-child(odd) .header-bike-rider` — `left: 12%;`
- `.header-bike-layer:nth-child(even) .header-bike-rider` — `left: auto; right: 12%;`
- `.header-bike` — `--bike-w: clamp(90px, 24vw, 130px); opacity: 0.2;`
- `::-webkit-scrollbar` — `width: 8px;`
- `::-webkit-scrollbar-track` — `background: #0D0805;`
- `::-webkit-scrollbar-thumb` — `background: #C1440E;
  border-radius: 2px;`
- `.font-display` — `font-family: var(--font-display);
  /* Glow at ~45% intensity (dialed back from the earlier 65% pass) */
  text-shadow: 0 0 10px rgba(255, 2…`
- `) rather than CSS variables, so a palette-variable tweak wouldn't reach them. A CSS filter is the one lever that touches every pixel uniformly, including images and inline-styled elements. Important: this is applied to .shine-wrap (which wraps <Outlet/> only) and to <nav> directly — NOT to <body> or #root. Nav uses position:fixed, and a filter on any ANCESTOR of a fixed element makes that ancestor become its containing block instead of the viewport (a real CSS spec quirk), which would make the nav scroll away instead of staying pinned. Scoping the filter to a sibling of Nav avoids that entirely. */ .shine-wrap` — `filter: brightness(1.18) saturate(1.4) contrast(1.04);`
- `nav` — `filter: brightness(1.18) saturate(1.4) contrast(1.04);`
- `/* Tribal SVG pattern overlay */ .tribal-pattern` — `background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='…`
- `.tribal-border` — `background-image: repeating-linear-gradient(
    90deg,
    #75AADB 0px,  #75AADB 14px,
    #FFFFFF 14px, #FFFFFF 18px,
    #000000 18px, #0…`
- `/* Scroll-driven bike path */ .road-line` — `stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  transition: stroke-dashoffset 0.1s linear;`
- `/* Image carousel */ .carousel-track` — `transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);`
- `/* Site card hover */ .site-card` — `transition: transform 0.3s ease, box-shadow 0.3s ease;`
- `.site-card:hover` — `transform: translateY(-4px);`
- `/* Booking form range input */ input[type='range']` — `-webkit-appearance: none;
  height: 4px;
  background: #1A3A2A;
  border-radius: 2px;
  outline: none;`
- `input[type='range']::-webkit-slider-thumb` — `-webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #C1440E;
  border-radius: 50%;
  cursor: pointer;`
- `/* Animated underline */ .nav-link` — `position: relative;`
- `.nav-link::after` — `content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #D4A017;
  transition: width 0.3s eas…`
- `.nav-link:hover::after` — `width: 100%;`
- `/* Section reveal */ .reveal` — `opacity: 1;
  transform: none;
  transition: opacity 0.7s ease, transform 0.7s ease;`
- `.reveal.visible` — `opacity: 1;
  transform: translateY(0);`
- `/* Let the site use the available viewport on wide screens without stretching copy endlessly. */ .max-w-7xl` — `max-width: min(92vw, 90rem);`
- `/* Bicycle cursor trail */ .bike-cursor` — `position: fixed;
  pointer-events: none;
  z-index: 9999;
  transition: left 0.15s ease, top 0.15s ease;`
- `/* Gallery tab active */ .gallery-tab.active` — `background: #C1440E;
  color: #F5EDD9;`
- `0%` — `transform: scale(1); opacity: 0.8;`
- `100%` — `transform: scale(2.5); opacity: 0;`
- `.pulse-ring` — `animation: pulse-ring 2s ease-out infinite;`
- `0%` — `transform: translateX(-120px);`
- `100%` — `transform: translateX(calc(100vw + 120px));`
- `from` — `transform: rotate(0deg);`
- `to` — `transform: rotate(360deg);`
- `.wheel-anim` — `animation: wheel-spin 0.6s linear infinite;
  transform-origin: center;`
- `/* Hero scroll bike */ #hero-bike` — `transition: left 0.05s linear;`
- `.hill-bike-3d` — `width: 260px;
  height: 180px;
  transform-origin: center center;
  will-change: left, top, transform;
  pointer-events: none;`
- `.hill-climb-3d` — `position: relative;
  width: 100%;
  height: clamp(220px, 32vw, 300px);
  min-height: 220px;
  overflow: hidden;
  pointer-events: none;
  c…`
- `.hill-climb-3d canvas` — `display: block;
  width: 100% !important;
  height: 100% !important;`
- `.hill-bike-image` — `display: block;
  width: 260px;
  height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.35));`
- `/* Diagonal divider */ .clip-diagonal` — `clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);`
- `.hero-feature-list` — `padding-top: 12rem;`
- `/* Wavy section divider */ .wavy-top::before` — `content: '';
  display: block;
  height: 60px;
  background: inherit;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
  margin-top: -60px;`
- `/* Routes page and booking drawer */ .routes-intro` — `display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.9fr);
  min-height: 24rem;
  overflow: hidden;
  background: #1A3A2A;…`
- `.routes-intro-copy` — `padding: clamp(2rem, 5vw, 4rem);
  align-self: center;`
- `.routes-intro-copy > p:not(.text-xs)` — `max-width: 34rem;
  line-height: 1.7;`
- `.routes-intro-points` — `display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;`
- `.routes-intro-points span` — `padding: 0.65rem 0.8rem;
  color: rgba(245, 237, 217, 0.78);
  background: rgba(13, 8, 5, 0.28);
  border-left: 3px solid #D4A017;
  font-si…`
- `.routes-intro-points strong` — `display: block;
  color: #F5EDD9;
  font-family: var(--font-display);
  font-size: 1.15rem;`
- `.routes-intro-map` — `min-width: 0;
  padding: 1rem;
  background: #111912;`
- `.routes-intro-map-heading` — `display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0.1rem 0 0.65rem;
  color: #F5EDD9;
  font-size: 0.83rem;
  font-weight: 700…`
- `.routes-intro-map-heading > span:last-child` — `margin-left: auto;
  color: rgba(245, 237, 217, 0.5);
  font-weight: 500;`
- `.routes-intro-map > div > div:first-child` — `border: 1px solid rgba(212, 160, 23, 0.2) !important;
  border-radius: 4px !important;`
- `.routes-intro-map > div > div:last-child` — `display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 0.35rem !important;
  margin-top: 0.5rem !im…`
- `.routes-intro-map > div > div:last-child button` — `min-width: 0;
  padding: 0.5rem !important;
  border: 1px solid rgba(245, 237, 217, 0.16) !important;
  border-radius: 3px !important;
  col…`
- `.routes-intro-map > div > div:last-child button:last-child` — `border-color: #D4A017 !important;
  color: #0D0805 !important;
  background: #D4A017 !important;`
- `.route-card` — `position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(245, 237, 217, 0.16);`
- `.route-card-rust` — `background: #32150D;
  border-color: rgba(193, 68, 14, 0.7);`
- `.route-card-sage` — `background: #10271E;
  border-color: rgba(26, 58, 42, 0.95);`
- `.route-card-image` — `display: block;
  width: 100%;
  height: 13rem;
  object-fit: cover;`
- `.route-card-body` — `position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 2rem;`
- `.route-card-body > .absolute` — `top: 1.5rem;
  right: 1.5rem;`
- `.routes-cta` — `display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;`
- `.booking-drawer-overlay` — `position: fixed;
  inset: 0;
  z-index: 100;
  visibility: hidden;
  transition: visibility 0.35s ease;`
- `.booking-drawer-overlay.active` — `visibility: visible;`
- `.booking-drawer-backdrop` — `position: absolute;
  inset: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.58);
  border: 0;
  opacity: 0;
  transition: opacity 0.35s eas…`
- `.booking-drawer-overlay.active .booking-drawer-backdrop` — `opacity: 1;`
- `.booking-drawer-card` — `position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(100%, 28rem);
  height: 100%;
  padding: 2…`
- `.booking-drawer-overlay.active .booking-drawer-card` — `transform: translateX(0);`
- `.drawer-header` — `display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.75rem;…`
- `.close-drawer-btn` — `color: #F5EDD9;
  font-size: 2rem;
  line-height: 1;`
- `.booking-form-elements` — `display: flex;
  flex-direction: column;
  gap: 0.7rem;`
- `.booking-form-elements label` — `margin-top: 0.45rem;
  color: rgba(245, 237, 217, 0.6);
  font-size: 0.98rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform…`
- `.booking-form-elements input, .booking-form-elements select` — `width: 100%;
  padding: 0.8rem;
  color: #F5EDD9;
  background: #0D1B15;
  border: 1px solid rgba(245, 237, 217, 0.2);
  border-radius: 2px;…`
- `.submit-booking-action` — `margin-top: 1.25rem;
  padding: 0.9rem 1rem;
  color: #F5EDD9;
  background: #C1440E;
  border-radius: 2px;
  font-weight: 700;
  letter-spa…`
- `.routes-intro` — `display: block;`
- `.routes-intro-copy` — `padding: 2rem 1.25rem;`
- `.routes-intro-map` — `padding: 0.75rem;`
- `.routes-intro-map > div > div:first-child` — `height: 350px !important;`
- `.routes-intro-map > div > div:last-child` — `grid-template-columns: repeat(2, minmax(0, 1fr)) !important;`
- `.route-card-image` — `height: 11rem;`
- `.route-card-body` — `padding: 1.5rem 1.25rem;`
- `.booking-drawer-card` — `width: 100%;
    padding: 2rem 1.25rem;`
- `/* Admin operations */ .admin-shell` — `min-height: 75vh;
  padding: 8rem 0 6rem;
  color: #F5EDD9;`
- `.admin-shell .wrap` — `max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px;`
- `.admin-shell .section-eyebrow` — `margin-bottom: 0.65rem;
  color: #D4A017;
  font: 600 0.95rem var(--font-body), sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppe…`
- `.admin-shell h1, .admin-shell h2, .admin-shell h3` — `color: #F5EDD9;
  font-family: var(--font-display), serif;
  line-height: 1.1;`
- `.admin-shell .btn` — `display: inline-block;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(245, 237, 217, 0.35);
  border-radius: 2px;
  color: #F5EDD9;
  bac…`
- `.admin-shell .btn-primary` — `border-color: #C1440E;
  background: #C1440E;`
- `.admin-shell .btn-primary:hover` — `border-color: #D4A017; background: #8B3008;`
- `.admin-shell .btn-ghost:hover` — `border-color: #D4A017; background: rgba(245, 237, 217, 0.08);`
- `.admin-shell .btn-sm` — `padding: 0.55rem 0.8rem; font-size: 0.76rem;`
- `.admin-shell .btn:disabled` — `cursor: not-allowed; opacity: 0.55;`
- `.admin-login-panel, .admin-panel` — `border: 1px solid rgba(245, 237, 217, 0.15);
  background: rgba(20, 15, 10, 0.94);`
- `.admin-login-panel` — `max-width: 480px;
  margin: 0 auto;
  padding: 2.25rem;`
- `.admin-login-panel h1` — `font-size: 2.1rem;`
- `.admin-login-panel > p` — `margin: 0.75rem 0 1.75rem; color: rgba(245, 237, 217, 0.66); font-size: 0.9rem;`
- `.admin-shell .field` — `margin-bottom: 1rem;`
- `.admin-shell .field label, .admin-inline-form label, .admin-content-form label` — `display: block;
  margin-bottom: 0.4rem;
  color: rgba(245, 237, 217, 0.65);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: upp…`
- `.admin-shell .field input, .admin-inline-form input, .admin-content-form input, .admin-content-form select, .admin-content-form textarea, .admin-table select` — `width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(245, 237, 217, 0.2);
  border-radius: 2px;
  color: #F5EDD9;
  background: #…`
- `.admin-shell input:focus-visible, .admin-shell select:focus-visible, .admin-shell textarea:focus-visible` — `outline: 2px solid #D4A017;
  outline-offset: 2px;`
- `.admin-shell .auth-submit` — `width: 100%; margin-top: 0.5rem;`
- `.admin-heading, .admin-section-heading` — `display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;`
- `.admin-heading h1` — `font-size: clamp(2.1rem, 5vw, 3.4rem);`
- `.admin-lede` — `margin-top: 0.75rem; color: rgba(245, 237, 217, 0.65);`
- `.admin-dashboard > .wrap` — `display: flex; flex-direction: column; gap: 1.5rem;`
- `.admin-metrics` — `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; border: 1px solid rgba(245, 237, 217, 0.15); background: rgba(245…`
- `.admin-metrics > div` — `padding: 1.25rem 1.5rem; background: #17110B;`
- `.admin-metrics span` — `display: block; color: rgba(245, 237, 217, 0.6); font-size: 0.7rem; text-transform: uppercase;`
- `.admin-metrics strong` — `display: block; margin-top: 0.65rem; color: #D4A017; font: 600 1.9rem var(--font-display), serif;`
- `.admin-panel` — `padding: 1.6rem;`
- `.admin-section-heading` — `margin-bottom: 1.25rem;`
- `.admin-section-heading h2` — `font-size: 1.55rem;`
- `.admin-section-heading p` — `margin-top: 0.5rem; color: rgba(245, 237, 217, 0.62); font-size: 0.82rem;`
- `.admin-monthly-chart` — `display: flex; align-items: flex-end; gap: 0.9rem; min-height: 13rem; overflow-x: auto; padding: 0.75rem 0.25rem 0;`
- `.admin-month` — `display: flex; flex: 1 0 54px; min-width: 54px; height: 190px; flex-direction: column; align-items: center; justify-content: flex-end;`
- `.admin-month-count` — `color: #F5EDD9; font-size: 0.75rem;`
- `.admin-month-track` — `display: flex; align-items: flex-end; width: 24px; height: 110px; margin: 0.5rem 0; background: rgba(245, 237, 217, 0.08);`
- `.admin-month-bar` — `width: 100%; min-height: 4px; border-top: 2px solid #C1440E; background: #D4A017;`
- `.admin-month-label, .admin-month-riders` — `color: rgba(245, 237, 217, 0.62); font-size: 0.65rem; white-space: nowrap;`
- `.admin-month-riders` — `margin-top: 0.2rem; font-size: 0.58rem;`
- `.admin-route-list` — `border-top: 1px solid rgba(245, 237, 217, 0.15);`
- `.admin-route-row` — `display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem 0; border-bottom: 1px solid rgba(245, 237, 21…`
- `.admin-route-row strong, .admin-route-row span` — `display: block;`
- `.admin-route-row span` — `margin-top: 0.25rem; color: rgba(245, 237, 217, 0.6); font-size: 0.75rem;`
- `.admin-inline-form, .admin-content-form` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; margin-top: 1.25rem;`
- `.admin-inline-form h3` — `grid-column: 1 / -1; font-size: 1.2rem;`
- `.admin-inline-form label, .admin-content-form label` — `display: flex; flex-direction: column; gap: 0.4rem;`
- `.admin-form-actions` — `grid-column: 1 / -1; display: flex; gap: 0.65rem; flex-wrap: wrap;`
- `.admin-content-form label:nth-child(3), .admin-content-form label:nth-child(4)` — `grid-column: 1 / -1;`
- `.admin-content-form .admin-checkbox` — `flex-direction: row; align-items: center; text-transform: none;`
- `.admin-content-form .admin-checkbox input` — `width: auto; accent-color: #D4A017;`
- `.admin-content-form button` — `justify-self: start;`
- `.admin-content-list` — `margin-top: 1.5rem; border-top: 1px solid rgba(245, 237, 217, 0.15); list-style: none;`
- `.admin-content-list li` — `display: flex; justify-content: space-between; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px solid rgba(245, 237, 217, 0.15); font-size: …`
- `.admin-content-list a` — `color: #D4A017;`
- `.admin-table-wrap` — `margin-top: 1.75rem; border: 1px solid rgba(245, 237, 217, 0.15);`
- `.admin-table` — `width: 100%; min-width: 760px; border-collapse: collapse; font-size: 0.86rem;`
- `.admin-table th, .admin-table td` — `padding: 1rem; border-bottom: 1px solid rgba(245, 237, 217, 0.12); text-align: left;`
- `.admin-table th` — `color: #D4A017; font-size: 0.68rem; text-transform: uppercase;`
- `.admin-table td span` — `display: block; margin-top: 0.2rem; color: rgba(245, 237, 217, 0.6); font-size: 0.74rem;`
- `.admin-table select` — `min-width: 120px; padding: 0.5rem;`
- `.admin-empty` — `padding: 1.5rem 1rem; color: rgba(245, 237, 217, 0.64);`
- `.admin-error` — `margin-top: 1rem; color: #FF9A76;`
- `.admin-notice` — `margin-top: 1rem; color: #A9C98D; font-size: 0.9rem;`
- `.admin-shell .wrap` — `padding: 0 20px;`
- `.admin-metrics` — `grid-template-columns: 1fr;`
- `.admin-panel` — `padding: 1.25rem 1rem;`
- `.admin-inline-form, .admin-content-form` — `grid-template-columns: 1fr;`
- `.admin-inline-form h3, .admin-form-actions, .admin-content-form label:nth-child(3), .admin-content-form label:nth-child(4)` — `grid-column: 1;`
- `.admin-route-row` — `align-items: flex-start; flex-direction: column;`
- `.admin-content-list li` — `align-items: flex-start; flex-direction: column;`
- `.admin-login-panel` — `padding: 1.6rem 1.25rem;`
- `/* Admin analytics workspace */ .admin-shell.admin-dashboard` — `--admin-status-confirmed: #E65B75;
  --admin-status-pending: #E7AD2F;
  --admin-status-cancelled: #7254A5;
  --admin-status-declined: #42AFC…`
- `.admin-app-shell` — `display: grid; grid-template-columns: 248px minmax(0, 1fr); min-height: 100vh;`
- `.admin-sidebar` — `position: sticky; top: 0; display: flex; height: 100vh; min-height: 600px; flex-direction: column; padding: 1.6rem 1.15rem 1.1rem; color: #F…`
- `.admin-brand` — `display: flex; align-items: center; gap: 0.75rem; padding: 0.15rem 0.5rem 2.4rem; color: #F5EDD9; font-weight: 700;`
- `.admin-brand-mark, .admin-avatar` — `display: grid; width: 2.25rem; height: 2.25rem; flex: 0 0 auto; place-items: center; border-radius: 6px; color: #151B17; background: #D4A017…`
- `.admin-brand small, .admin-sidebar-bottom small` — `display: block; margin-top: 0.2rem; color: rgba(245, 237, 217, 0.48); font-size: 0.68rem; font-weight: 400;`
- `.admin-nav-label` — `padding: 0 0.65rem 0.65rem; color: rgba(245, 237, 217, 0.4); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;`
- `.admin-side-nav` — `display: grid; gap: 0.32rem;`
- `.admin-dashboard .admin-side-nav` — `filter: none;`
- `.admin-side-nav button` — `display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.76rem 0.65rem; border: 0; border-radius: 4px; color: rgba(245, 237…`
- `.admin-side-nav button:hover` — `color: #FFF; background: rgba(245, 237, 217, 0.07);`
- `.admin-side-nav button.active` — `color: #FFF; background: #25352D; box-shadow: inset 3px 0 #D4A017;`
- `.admin-nav-index` — `color: #D4A017; font-size: 0.63rem;`
- `.admin-sidebar-bottom` — `display: flex; align-items: center; gap: 0.7rem; margin-top: auto; padding: 1rem 0.45rem 0; border-top: 1px solid rgba(245, 237, 217, 0.12);…`
- `.admin-avatar` — `width: 2rem; height: 2rem; color: #FFF; background: #365444; font-size: 0.65rem;`
- `.admin-workspace` — `min-width: 0; padding: 2.2rem clamp(1.25rem, 3vw, 3.2rem) 3rem;`
- `.admin-topbar` — `display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.8rem;`
- `.admin-topbar h1` — `margin: 0.22rem 0 0.3rem; color: #17231D; font: 700 1.8rem var(--font-display), serif;`
- `.admin-topbar p` — `color: #76817B; font-size: 0.82rem;`
- `.admin-eyebrow` — `color: #9B6F04; font-size: 0.63rem; font-weight: 700; letter-spacing: 0.12em;`
- `.admin-top-actions` — `display: flex; flex-wrap: wrap; gap: 0.55rem;`
- `.admin-dashboard .admin-primary-button, .admin-dashboard .admin-secondary-button` — `min-height: 2.4rem; padding: 0.55rem 0.9rem; border: 1px solid #17231D; border-radius: 4px; color: #FFF; background: #17231D; cursor: pointe…`
- `.admin-dashboard .admin-primary-button:hover` — `border-color: #C1440E; background: #C1440E;`
- `.admin-dashboard .admin-secondary-button` — `color: #26332D; border-color: #D8DFDB; background: #FFF;`
- `.admin-dashboard .admin-secondary-button:hover` — `background: #F8FAF8;`
- `.admin-dashboard button:disabled` — `cursor: not-allowed; opacity: 0.55;`
- `.admin-view-content` — `display: grid; gap: 1.15rem;`
- `.admin-alert` — `margin-bottom: 1rem; padding: 0.75rem 0.9rem; border: 1px solid #C7DED0; border-radius: 4px; color: #28563C; background: #EAF5EE; font-size:…`
- `.admin-alert.is-error` — `border-color: #F0C8BC; color: #923F2A; background: #FFF0EB;`
- `.admin-metrics` — `display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.85rem; border: 0; background: transparent;`
- `.admin-metric-card` — `position: relative; min-width: 0; overflow: hidden; padding: 1.1rem 1.15rem; border: 1px solid #E4E9E6; border-radius: 5px; background: #FFF…`
- `.admin-metric-card::before` — `position: absolute; inset: 0 auto 0 0; width: 4px; content: ""; background: var(--metric-color);`
- `.admin-metric-card span` — `display: block; color: #66736B; font-size: 0.72rem; font-weight: 600;`
- `.admin-metric-card strong` — `display: block; margin: 0.45rem 0 0.3rem; color: #1C2722; font: 700 1.8rem var(--font-display), serif;`
- `.admin-metric-card small` — `display: block; color: #89938D; font-size: 0.64rem;`
- `.metric-coral` — `--metric-color: #E65B75;`
- `.metric-gold` — `--metric-color: #E4A827;`
- `.metric-blue` — `--metric-color: #42AFC1;`
- `.metric-green` — `--metric-color: #548F69;`
- `.admin-overview-grid` — `display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(250px, 0.85fr); gap: 1rem;`
- `.admin-overview-bottom` — `grid-template-columns: minmax(0, 1.55fr) minmax(250px, 0.85fr);`
- `.admin-surface` — `min-width: 0; padding: 1.25rem; border: 1px solid #E4E9E6; border-radius: 5px; background: #FFF;`
- `.admin-section-heading` — `display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem;`
- `.admin-section-heading h2` — `margin-top: 0.22rem; color: #1C2722; font: 700 1.15rem var(--font-display), serif;`
- `.admin-section-heading p` — `margin-top: 0.4rem; color: #748078; font-size: 0.77rem;`
- `.admin-period-label, .admin-count` — `color: #7B8780; font-size: 0.7rem;`
- `.admin-monthly-chart` — `display: flex; align-items: flex-end; justify-content: space-around; gap: 0.45rem; min-height: 200px; padding: 1rem 0.25rem 0; border-bottom…`
- `.admin-month` — `display: flex; flex: 1 0 26px; max-width: 52px; height: 175px; flex-direction: column; align-items: center; justify-content: flex-end; gap: …`
- `.admin-month strong` — `color: #45524A; font-size: 0.65rem;`
- `.admin-month-track` — `display: flex; align-items: flex-end; width: min(68%, 24px); height: 125px; overflow: hidden; border-radius: 4px 4px 0 0; background: #F1F4F…`
- `.admin-month-bar` — `width: 100%; min-height: 3px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, #E65B75, #EAA043);`
- `.admin-status-summary` — `display: flex; align-items: center; justify-content: space-around; gap: 0.8rem; min-height: 200px;`
- `.admin-donut` — `display: grid; width: 142px; height: 142px; flex: 0 0 auto; place-items: center; border-radius: 50%;`
- `.admin-donut::before` — `grid-area: 1 / 1; width: 92px; height: 92px; border-radius: 50%; background: #FFF; content: "";`
- `.admin-donut span` — `z-index: 1; grid-area: 1 / 1; color: #1C2722; font: 700 1.3rem var(--font-display), serif;`
- `.admin-status-legend` — `display: grid; gap: 0.65rem; min-width: 100px; color: #758078; font-size: 0.67rem;`
- `.admin-status-legend div` — `display: grid; grid-template-columns: 8px 1fr auto; align-items: center; gap: 0.4rem;`
- `.admin-status-legend strong` — `color: #35423A;`
- `.admin-status-dot` — `width: 7px; height: 7px; border-radius: 50%; background: #B8C2BC;`
- `.status-confirmed` — `background: var(--admin-status-confirmed);`
- `.status-pending` — `background: var(--admin-status-pending);`
- `.status-cancelled` — `background: var(--admin-status-cancelled);`
- `.status-declined` — `background: var(--admin-status-declined);`
- `.admin-text-button` — `border: 0; color: #A36D00; background: transparent; cursor: pointer; font: 600 0.72rem var(--font-body), sans-serif;`
- `.admin-text-button:hover` — `color: #C1440E;`
- `.admin-table-wrap` — `width: 100%; overflow-x: auto; border: 0;`
- `.admin-table` — `width: 100%; min-width: 540px; border-collapse: collapse; color: #526058; font-size: 0.73rem;`
- `.admin-table th, .admin-table td` — `padding: 0.75rem 0.65rem; border-bottom: 1px solid #EDF0EE; text-align: left; white-space: nowrap;`
- `.admin-table th` — `color: #88938D; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;`
- `.admin-table td strong` — `display: block; color: #27332D; font-weight: 600;`
- `.admin-table td span` — `display: block; margin-top: 0.16rem; color: #929C96; font-size: 0.65rem;`
- `.admin-table select, .admin-inline-form input, .admin-content-form input, .admin-content-form select, .admin-content-form textarea` — `width: 100%; min-width: 105px; padding: 0.48rem 0.58rem; border: 1px solid #DDE4DF; border-radius: 4px; color: #344139; background: #FFF; fo…`
- `.admin-table select` — `min-width: 105px;`
- `.admin-status-pill` — `display: inline-block !important; width: max-content; padding: 0.25rem 0.48rem; border-radius: 20px; font-size: 0.6rem !important; text-tran…`
- `.status-pill-pending` — `color: #946A0C !important; background: #FFF4D6;`
- `.status-pill-confirmed` — `color: #34764A !important; background: #E4F3E9;`
- `.status-pill-cancelled, .status-pill-declined` — `color: #A44836 !important; background: #FCEAE5;`
- `.admin-mini-route` — `display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.85rem 0; border-bottom: 1px solid #EDF0EE; colo…`
- `.admin-mini-route strong` — `color: #1C2722; font-size: 0.7rem;`
- `.admin-route-list` — `border-top: 1px solid #EDF0EE;`
- `.admin-route-row` — `display: grid; grid-template-columns: 2.25rem minmax(0, 1fr) auto auto; align-items: center; gap: 0.9rem; padding: 0.95rem 0; border-bottom:…`
- `.admin-route-symbol` — `display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 4px; color: #9B6F04; background: #FFF3D5; font-size: 0.65rem; …`
- `.admin-route-copy strong, .admin-route-copy span` — `display: block;`
- `.admin-route-copy strong` — `color: #27332D; font-size: 0.82rem;`
- `.admin-route-copy span` — `margin-top: 0.25rem; color: #87928B; font-size: 0.68rem;`
- `.admin-route-price` — `color: #36443B; font-size: 0.76rem; white-space: nowrap;`
- `.admin-action-button, .admin-content-actions button` — `padding: 0.45rem 0.65rem; border: 1px solid #DCE3DE; border-radius: 4px; color: #3F5147; background: #FFF; cursor: pointer; font: 600 0.68re…`
- `.admin-action-button:hover, .admin-content-actions button:hover` — `border-color: #AEBDB3; background: #F6F8F6;`
- `.admin-inline-form, .admin-content-form` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; margin-top: 1.3rem; padding: 1.1rem; border: 1px solid #E5EAE…`
- `.admin-inline-form h3` — `grid-column: 1 / -1; color: #27332D; font: 700 1rem var(--font-display), serif;`
- `.admin-inline-form label, .admin-content-form label` — `display: flex; flex-direction: column; gap: 0.35rem; margin: 0; color: #69766E; font-size: 0.67rem; font-weight: 600;`
- `.admin-content-form .admin-full-field` — `grid-column: 1 / -1;`
- `.admin-content-form .admin-checkbox` — `flex-direction: row; align-items: center; text-transform: none;`
- `.admin-content-form .admin-checkbox input` — `width: auto; min-width: 0; accent-color: #C1440E;`
- `.admin-form-actions` — `grid-column: 1 / -1; display: flex; gap: 0.55rem; flex-wrap: wrap;`
- `.admin-content-list` — `margin-top: 1.25rem; border-top: 1px solid #E7ECE9; list-style: none;`
- `.admin-content-list li` — `display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid #E7ECE9;`
- `.admin-content-list li > span:first-child strong, .admin-content-list li > span:first-child small` — `display: block;`
- `.admin-content-list li > span:first-child strong` — `color: #27332D; font-size: 0.78rem;`
- `.admin-content-list li > span:first-child small` — `margin-top: 0.2rem; color: #849088; font-size: 0.66rem;`
- `.admin-content-actions` — `display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;`
- `.admin-content-actions a` — `color: #9B6F04; font-size: 0.68rem;`
- `.admin-empty` — `padding: 1.2rem 0.6rem; color: #7B8780; font-size: 0.78rem;`
- `.admin-dashboard :focus-visible` — `outline-color: #C1440E;`
- `.admin-app-shell` — `grid-template-columns: 215px minmax(0, 1fr);`
- `.admin-metrics` — `grid-template-columns: repeat(2, minmax(0, 1fr));`
- `.admin-overview-grid, .admin-overview-bottom` — `grid-template-columns: minmax(0, 1fr);`
- `.admin-app-shell` — `display: block;`
- `.admin-sidebar` — `position: static; height: auto; min-height: 0; padding: 0.85rem 1rem;`
- `.admin-brand` — `padding: 0.15rem 0.35rem 0.8rem;`
- `.admin-nav-label, .admin-sidebar-bottom` — `display: none;`
- `.admin-side-nav` — `display: flex; overflow-x: auto; gap: 0.35rem;`
- `.admin-side-nav button` — `width: auto; flex: 0 0 auto; padding: 0.65rem 0.7rem; font-size: 0.72rem;`
- `.admin-side-nav button.active` — `box-shadow: inset 0 -2px #D4A017;`
- `.admin-nav-index` — `display: none;`
- `.admin-workspace` — `padding: 1.4rem 1rem 2rem;`
- `.admin-topbar` — `align-items: flex-start; flex-direction: column; gap: 1rem;`
- `.admin-topbar h1` — `font-size: 1.55rem;`
- `.admin-metrics` — `grid-template-columns: 1fr 1fr; gap: 0.55rem;`
- `.admin-metric-card` — `padding: 0.85rem 0.75rem;`
- `.admin-metric-card strong` — `font-size: 1.45rem;`
- `.admin-metric-card small` — `font-size: 0.58rem;`
- `.admin-surface` — `padding: 0.9rem;`
- `.admin-status-summary` — `justify-content: flex-start;`
- `.admin-donut` — `width: 120px; height: 120px;`
- `.admin-donut::before` — `width: 78px; height: 78px;`
- `.admin-route-row` — `grid-template-columns: 2rem minmax(0, 1fr);`
- `.admin-route-price, .admin-action-button` — `grid-column: 2; justify-self: start;`
- `.admin-inline-form, .admin-content-form` — `grid-template-columns: minmax(0, 1fr); padding: 0.8rem;`
- `.admin-inline-form h3, .admin-form-actions, .admin-content-form .admin-full-field` — `grid-column: 1;`
- `.admin-content-list li` — `align-items: flex-start; flex-direction: column;`
- `/* Reference-inspired admin overview */ .admin-shell.admin-dashboard` — `background: #F7F9FA;`
- `.admin-app-shell` — `display: block; min-height: 100vh;`
- `.admin-global-header` — `position: sticky;
  top: 0;
  z-index: 500;
  display: flex;
  min-height: 70px;
  align-items: center;
  justify-content: space-between;
  …`
- `.admin-global-header .admin-brand` — `flex: 0 0 auto; padding: 0; color: #202B36; font-size: 0.9rem;`
- `.admin-global-header .admin-brand small` — `color: #8B96A1;`
- `.admin-global-header .admin-brand-mark` — `color: #FFF; background: #5367B8;`
- `.admin-global-header .admin-side-nav` — `display: flex; align-items: center; gap: 0.2rem;`
- `.admin-global-header .admin-side-nav button` — `width: auto; padding: 0.55rem 0.8rem; color: #52606E; font-size: 0.74rem; white-space: nowrap;`
- `.admin-global-header .admin-side-nav button:hover` — `color: #374A9D; background: #F5F6FB;`
- `.admin-global-header .admin-side-nav button.active` — `color: #495CAD; background: transparent; box-shadow: inset 0 -2px #5367B8;`
- `.admin-global-actions` — `display: flex; align-items: center; gap: 0.7rem;`
- `.admin-global-actions .admin-avatar` — `color: #4A5BA8; background: #EEF0FA;`
- `.admin-global-actions .admin-secondary-button` — `min-height: 2.2rem; padding: 0.45rem 0.8rem; border-color: #DDE2E9; color: #354252; background: #FFF;`
- `.admin-global-actions .admin-secondary-button:hover` — `border-color: #AEB9D9; background: #F7F8FC;`
- `.admin-workspace` — `width: min(100%, 1480px); margin: 0 auto; padding: 2.3rem 4.5% 4rem;`
- `.admin-topbar` — `margin-bottom: 1.6rem;`
- `.admin-topbar h1` — `color: #17212D; font-size: 1.65rem;`
- `.admin-topbar p` — `color: #707D89;`
- `.admin-eyebrow` — `color: #5367B8;`
- `.admin-dashboard .admin-secondary-button` — `border-color: #DDE2E9; color: #354252; background: #FFF;`
- `.admin-dashboard .admin-primary-button` — `border-color: #5367B8; background: #5367B8;`
- `.admin-dashboard .admin-primary-button:hover` — `border-color: #42559F; background: #42559F;`
- `.admin-view-content` — `gap: 1.2rem;`
- `.admin-reference-layout` — `display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; gap: 1.2rem; min-height: 0;`
- `.admin-reference-dashboard` — `display: grid; gap: 0.9rem; min-width: 0;`
- `.admin-reference-dashboard .admin-metrics` — `grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem;`
- `.admin-reference-dashboard .admin-metric-card` — `padding: 0.9rem 1rem; border-color: #EDF0F2; border-radius: 7px; box-shadow: 0 4px 15px rgba(29, 47, 64, 0.035);`
- `.admin-reference-dashboard .admin-metric-card strong` — `color: #202A35; font-size: 1.6rem;`
- `.admin-reference-dashboard .metric-coral` — `--metric-color: #E85B82;`
- `.admin-reference-dashboard .metric-gold` — `--metric-color: #E7B746;`
- `.admin-reference-dashboard .metric-blue` — `--metric-color: #45B7D0;`
- `.admin-reference-dashboard .metric-green` — `--metric-color: #67B777;`
- `.admin-reference-dashboard .admin-overview-grid` — `grid-template-columns: minmax(0, 1.35fr) minmax(210px, 0.9fr); gap: 0.7rem;`
- `.admin-reference-dashboard .admin-surface` — `border-color: #EDF0F2; border-radius: 7px; box-shadow: 0 5px 18px rgba(29, 47, 64, 0.045);`
- `.admin-reference-dashboard .admin-section-heading h2` — `color: #24303B; font-size: 1rem;`
- `.admin-reference-dashboard .admin-monthly-chart` — `min-height: 165px;`
- `.admin-reference-dashboard .admin-month` — `height: 145px;`
- `.admin-reference-dashboard .admin-month-track` — `height: 95px; background: #F2F4F7;`
- `.admin-reference-dashboard .admin-month-bar` — `background: linear-gradient(180deg, #E7AD4E, #E65B82);`
- `.admin-reference-dashboard .admin-donut::before` — `background: #FFF;`
- `.admin-reference-dashboard .admin-eyebrow` — `color: #6B79BE;`
- `.admin-reference-dashboard .admin-status-legend` — `color: #66737F;`
- `.admin-reference-dashboard .admin-status-legend strong` — `color: #34414D;`
- `.admin-reference-dashboard .admin-donut span` — `color: #202A35;`
- `.admin-dashboard .admin-surface:not(.admin-reference-dashboard .admin-surface)` — `border-color: #E6EAEE; box-shadow: 0 3px 12px rgba(29, 47, 64, 0.025);`
- `.admin-reference-layout` — `gap: 1rem;`
- `.admin-global-header` — `position: static; flex-wrap: wrap; gap: 0.7rem; padding: 0.8rem 1rem;`
- `.admin-global-header .admin-brand` — `flex: 1;`
- `.admin-global-header .admin-side-nav` — `order: 3; width: 100%; overflow-x: auto;`
- `.admin-global-header .admin-side-nav button` — `flex: 0 0 auto; padding: 0.65rem 0.7rem;`
- `.admin-global-actions` — `margin-left: auto;`
- `.admin-global-actions .admin-avatar` — `display: none;`
- `.admin-workspace` — `padding: 1.5rem 1rem 2.5rem;`
- `.admin-topbar` — `align-items: flex-start;`
- `.admin-reference-layout` — `min-height: 0;`
- `.admin-reference-dashboard .admin-overview-grid` — `grid-template-columns: minmax(0, 1fr);`
- `.admin-global-header .admin-brand` — `font-size: 0.8rem;`
- `.admin-global-actions .admin-secondary-button` — `min-height: 2rem; padding: 0.4rem 0.6rem;`
- `.admin-reference-dashboard .admin-metrics` — `grid-template-columns: repeat(2, minmax(0, 1fr));`
- `.admin-modal-backdrop` — `position: fixed; inset: 0; z-index: 1500; display: grid; place-items: center; overflow-y: auto; padding: 1.25rem; background: rgba(14, 22, 3…`
- `.admin-edit-modal` — `width: min(100%, 620px); max-height: min(90vh, 820px); overflow-y: auto; padding: 1.5rem; border: 1px solid #E4E9ED; border-radius: 8px; bac…`
- `.admin-modal-heading` — `display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;`
- `.admin-modal-heading h2` — `margin-top: 0.3rem; color: #17212D; font: 700 1.5rem var(--font-display), serif;`
- `.admin-modal-heading p` — `margin-top: 0.4rem; color: #75818C; font-size: 0.78rem; line-height: 1.5;`
- `.admin-modal-close` — `display: grid; width: 2rem; height: 2rem; flex: 0 0 auto; place-items: center; border: 1px solid #E1E6EA; border-radius: 50%; color: #52606E…`
- `.admin-modal-close:hover` — `color: #17212D; background: #F4F6F8;`
- `.admin-edit-form` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.95rem;`
- `.admin-edit-form label` — `display: flex; min-width: 0; flex-direction: column; gap: 0.4rem; color: #53616E; font-size: 0.69rem; font-weight: 600;`
- `.admin-edit-form input, .admin-edit-form select, .admin-edit-form textarea` — `width: 100%; min-width: 0; padding: 0.7rem 0.75rem; border: 1px solid #DDE3E8; border-radius: 4px; color: #2D3945; background: #FFF; font: 0…`
- `.admin-edit-form input:focus-visible, .admin-edit-form select:focus-visible, .admin-edit-form textarea:focus-visible` — `outline: 2px solid #5367B8; outline-offset: 1px;`
- `.admin-edit-form input[type="date"]` — `color-scheme: light;`
- `.admin-edit-notes, .admin-modal-error, .admin-modal-actions` — `grid-column: 1 / -1;`
- `.admin-modal-error` — `margin: 0; color: #A44836; font-size: 0.76rem;`
- `.admin-modal-actions` — `display: flex; justify-content: flex-end; gap: 0.6rem; padding-top: 0.25rem;`
- `.admin-modal-actions .admin-secondary-button, .admin-modal-actions .admin-primary-button` — `min-height: 2.45rem;`
- `.admin-requests-view .admin-table` — `min-width: 780px;`
- `.admin-checkin-view` — `padding: 1.4rem;`
- `.admin-checkin-layout` — `display: grid; grid-template-columns: minmax(280px, 1fr) minmax(240px, 0.8fr); gap: 1.2rem; align-items: start;`
- `.admin-scanner-frame` — `min-width: 0; padding: 0.75rem; border: 1px solid #E5E9ED; border-radius: 5px; background: #F8FAFB;`
- `#ride-pass-scanner` — `width: 100%; max-width: 540px; margin: 0 auto; border: 0 !important;`
- `#ride-pass-scanner video` — `width: 100% !important; border-radius: 4px; object-fit: cover;`
- `#ride-pass-scanner button` — `min-height: 2.3rem; padding: 0.45rem 0.7rem; border: 1px solid #DDE2E9; border-radius: 4px; color: #354252; background: #FFF; font: 600 0.97…`
- `#ride-pass-scanner button:hover` — `background: #F1F3F8;`
- `#ride-pass-scanner a` — `color: #5367B8;`
- `.admin-checkin-result` — `display: grid; min-height: 150px; align-content: start; gap: 1rem; color: #64717D; font-size: 0.82rem;`
- `.admin-checkin-error` — `padding: 0.8rem; border: 1px solid #F0C8BC; border-radius: 4px; color: #923F2A; background: #FFF0EB;`
- `.admin-checkin-success` — `display: grid; justify-items: start; gap: 0.45rem; padding: 1.2rem; border: 1px solid #C7DED0; border-radius: 5px; color: #53616E; backgroun…`
- `.admin-checkin-success-mark` — `display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 50%; color: #FFF; background: #408454; font-weight: 700;`
- `.admin-checkin-success h3` — `color: #24332A; font: 700 1.35rem var(--font-display), serif;`
- `.admin-checkin-success p` — `font-size: 0.78rem;`
- `.admin-checkin-success > strong` — `margin-top: 0.35rem; color: #748078; font-size: 0.7rem;`
- `.ride-ticket-page` — `display: flex; min-height: 100vh; justify-content: center; padding: 2rem 1rem; color: #202A35; background: #F2F4F5;`
- `.ride-ticket-shell` — `width: min(100%, 520px);`
- `.ride-ticket-brand` — `display: inline-flex; align-items: center; gap: 0.65rem; margin-bottom: 1rem; color: #202A35; font-size: 0.85rem; font-weight: 700; text-dec…`
- `.ride-ticket-brand span` — `display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 5px; color: #FFF; background: #5367B8; font-size: 0.68rem;`
- `.ride-ticket-card` — `overflow: hidden; padding: 1.6rem; border: 1px solid #E1E6E9; border-radius: 8px; background: #FFF; box-shadow: 0 10px 35px rgba(27, 43, 55,…`
- `.ride-ticket-header` — `text-align: center;`
- `.ride-ticket-kicker` — `color: #408454; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.13em;`
- `.ride-ticket-check` — `display: grid; width: 2.6rem; height: 2.6rem; margin: 0.7rem auto; place-items: center; border-radius: 50%; color: #FFF; background: #408454…`
- `.ride-ticket-header h1` — `color: #17212D; font: 700 1.75rem var(--font-display), serif;`
- `.ride-ticket-header p` — `margin-top: 0.45rem; color: #73808B; font-size: 0.78rem;`
- `.ride-ticket-qr` — `display: grid; width: max-content; max-width: 100%; place-items: center; margin: 1.3rem auto; padding: 0.55rem; border: 1px solid #E7EAED; b…`
- `.ride-ticket-qr svg` — `display: block; width: min(232px, 60vw); height: auto;`
- `.ride-ticket-details` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.8rem; padding: 1rem 0; border-top: 1px solid #E9ECEF; border-bottom:…`
- `.ride-ticket-details div` — `display: grid; gap: 0.25rem; min-width: 0;`
- `.ride-ticket-details span` — `color: #89949D; font-size: 0.62rem; text-transform: uppercase;`
- `.ride-ticket-details strong` — `overflow-wrap: anywhere; color: #293641; font-size: 0.78rem;`
- `.ride-ticket-reference` — `display: flex; justify-content: space-between; padding: 0.75rem 0; color: #89949D; font-size: 0.64rem; letter-spacing: 0.08em;`
- `.ride-ticket-reference strong` — `color: #5367B8;`
- `.ride-ticket-meetup` — `display: grid; gap: 0.25rem; padding: 0.85rem; border-radius: 4px; color: #384640; background: #F3F7F4; font-size: 0.76rem;`
- `.ride-ticket-meetup span` — `color: #738078; font-size: 0.68rem;`
- `.ride-ticket-print` — `width: 100%; margin-top: 1rem; padding: 0.75rem; border: 0; border-radius: 4px; color: #FFF; background: #5367B8; cursor: pointer; font: 600…`
- `.ride-ticket-state` — `padding: 2rem 0.5rem; color: #53616E; text-align: center;`
- `.ride-ticket-state h1` — `color: #26323E; font: 700 1.4rem var(--font-display), serif;`
- `.ride-ticket-state p` — `margin: 0.6rem 0; font-size: 0.82rem;`
- `.ride-ticket-state a` — `color: #5367B8; font-size: 0.78rem;`
- `.ride-ticket-footer` — `margin-top: 1rem; color: #8A949C; font-size: 0.68rem; text-align: center;`
- `.admin-checkin-layout` — `grid-template-columns: minmax(0, 1fr);`
- `.admin-modal-backdrop` — `align-items: end; padding: 0.5rem;`
- `.admin-edit-modal` — `max-height: 92vh; padding: 1.1rem; border-radius: 8px 8px 4px 4px;`
- `.admin-edit-form` — `grid-template-columns: minmax(0, 1fr);`
- `.admin-edit-notes, .admin-modal-error, .admin-modal-actions` — `grid-column: 1;`
- `.ride-ticket-page` — `padding: 1rem 0.75rem;`
- `.ride-ticket-card` — `padding: 1.2rem 1rem;`
- `body` — `background: #FFF !important;`
- `.ride-ticket-page` — `min-height: auto; padding: 0; background: #FFF;`
- `.ride-ticket-brand, .ride-ticket-print, .ride-ticket-footer` — `display: none;`
- `.ride-ticket-card` — `border: 0; box-shadow: none;`
- `.schedule-page` — `min-height: 100vh; color: #26382F; background: #F4F1E8;`
- `.schedule-hero` — `position: relative; overflow: hidden; padding: 9rem max(1.5rem, calc((100vw - 80rem) / 2)) 4.5rem; background: linear-gradient(115deg, #E5EA…`
- `.schedule-hero::after` — `position: absolute; right: -8rem; bottom: -16rem; width: 42rem; height: 42rem; border: 1px solid rgba(38, 56, 47, 0.08); border-radius: 50%;…`
- `.schedule-hero-inner` — `position: relative; z-index: 1; max-width: 80rem; margin: 0 auto;`
- `.schedule-eyebrow, .schedule-section-kicker` — `color: #A44C32; font-size: 0.87rem; font-weight: 700; letter-spacing: 0.15em;`
- `.schedule-hero h1` — `margin-top: 0.8rem; color: #26382F; font: 700 clamp(3rem, 6vw, 5.3rem)/0.98 var(--font-display), serif; letter-spacing: -0.04em;`
- `.schedule-hero-inner > p:last-child` — `max-width: 34rem; margin-top: 1.25rem; color: #637167; font-size: 1rem; line-height: 1.7;`
- `.schedule-content` — `width: min(100% - 3rem, 80rem); margin: 0 auto; padding: 2.5rem 0 5rem;`
- `.schedule-map-feature` — `display: grid; grid-template-columns: minmax(285px, 0.78fr) minmax(0, 1.35fr); overflow: hidden; border: 1px solid #E5E2D8; border-radius: 1…`
- `.schedule-map-copy` — `display: flex; flex-direction: column; align-items: flex-start; padding: clamp(1.5rem, 3.2vw, 3.4rem);`
- `.schedule-map-copy h2, .schedule-section-heading h2, .schedule-cta h2` — `margin-top: 0.6rem; color: #26382F; font: 700 clamp(1.9rem, 3vw, 2.7rem)/1.05 var(--font-display), serif; letter-spacing: -0.025em;`
- `.schedule-map-description` — `max-width: 28rem; margin-top: 1rem; color: #68766B; font-size: 1rem; line-height: 1.7;`
- `.schedule-stats` — `display: grid; width: 100%; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin: 2rem 0 1.8rem; padding: 1rem 0; border-top: 1px soli…`
- `.schedule-stats div` — `display: grid; gap: 0.28rem;`
- `.schedule-stats strong` — `color: #315944; font: 700 1.05rem var(--font-display), serif;`
- `.schedule-stats span` — `color: #879087; font-size: 0.83rem; line-height: 1.35;`
- `.schedule-map-meet` — `display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;`
- `.schedule-map-meet > span` — `color: #B75A3D; font-size: 1.1rem;`
- `.schedule-map-meet div` — `display: grid; gap: 0.2rem;`
- `.schedule-map-meet strong` — `color: #38483E; font-size: 1rem;`
- `.schedule-map-meet div span` — `color: #7B857D; font-size: 0.95rem;`
- `.schedule-primary-button` — `display: inline-flex; min-height: 46px; align-items: center; justify-content: center; gap: 1.5rem; padding: 0.75rem 1.2rem; border: 1px soli…`
- `.schedule-primary-button:hover` — `transform: translateY(-2px); background: #244632;`
- `.schedule-primary-button:focus-visible, .schedule-option-bottom a:focus-visible` — `outline: 3px solid #C7834D; outline-offset: 3px;`
- `.schedule-live-map` — `min-width: 0; padding: 1rem; background: #E8ECE5;`
- `.schedule-map-label` — `display: flex; align-items: center; gap: 0.55rem; margin: 0.15rem 0 0.75rem; color: #344B3B; font-size: 0.83rem; font-weight: 700; letter-sp…`
- `.schedule-map-label > span:last-child` — `margin-left: auto; color: #879087; font-weight: 500;`
- `.schedule-live-dot` — `width: 7px; height: 7px; border-radius: 50%; background: #6D9870; box-shadow: 0 0 0 4px rgba(109, 152, 112, 0.16);`
- `.schedule-live-map > div:first-of-type + div > div:first-child` — `border: 1px solid rgba(48, 70, 55, 0.13) !important; border-radius: 9px !important; box-shadow: 0 5px 18px rgba(40, 55, 43, 0.1);`
- `.schedule-live-map > div:first-of-type + div > div:last-child` — `display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 0.4rem !important; margin-top: 0.55rem !importan…`
- `.schedule-live-map > div:first-of-type + div > div:last-child button` — `min-width: 0; padding: 0.55rem !important; border: 1px solid #DDE2D8 !important; border-radius: 5px !important; color: #405247 !important; b…`
- `.schedule-live-map > div:first-of-type + div > div:last-child button:last-child` — `border-color: #315944 !important; color: #FFFDF7 !important; background: #315944 !important;`
- `.schedule-highlights, .schedule-options, .schedule-week` — `margin-top: 5rem;`
- `.schedule-section-heading` — `display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 1.4rem;`
- `.schedule-section-heading h2` — `font-size: clamp(1.8rem, 3vw, 2.3rem);`
- `.schedule-section-heading > p` — `max-width: 25rem; margin-bottom: 0.2rem; color: #78847A; font-size: 1rem; line-height: 1.65;`
- `.schedule-photo-grid` — `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem;`
- `.schedule-photo-card` — `position: relative; min-height: 290px; overflow: hidden; border-radius: 9px; background: #344B3B; box-shadow: 0 10px 28px rgba(37, 50, 41, 0…`
- `.schedule-photo-card img` — `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 450ms ease;`
- `.schedule-photo-card:hover img` — `transform: scale(1.045);`
- `.schedule-photo-shade` — `position: absolute; inset: 0; background: linear-gradient(180deg, rgba(18, 28, 22, 0.04) 28%, rgba(18, 28, 22, 0.83) 100%);`
- `.schedule-photo-number` — `position: absolute; top: 1rem; left: 1rem; padding: 0.4rem 0.55rem; border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 3px; color: …`
- `.schedule-photo-caption` — `position: absolute; right: 1.2rem; bottom: 1.25rem; left: 1.2rem; color: #FFF;`
- `.schedule-photo-caption > span` — `font-size: 1.2rem;`
- `.schedule-photo-caption h3` — `margin-top: 0.35rem; font: 700 1.25rem/1.15 var(--font-display), serif;`
- `.schedule-photo-caption p` — `margin-top: 0.35rem; color: rgba(255, 255, 255, 0.78); font-size: 0.95rem; line-height: 1.4;`
- `.schedule-card-grid` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;`
- `.schedule-option-card` — `display: flex; min-height: 300px; flex-direction: column; padding: 1.5rem; border: 1px solid #E3E3DA; border-radius: 9px; background: #FFFEF…`
- `.schedule-option-featured` — `border-color: #C9D7C9; background: linear-gradient(145deg, #F0F4EC, #FFFEFA 72%);`
- `.schedule-option-topline` — `display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; color: #758076; font-size: 0.79rem; font-weight: 700; lette…`
- `.schedule-status-pill` — `padding: 0.38rem 0.55rem; border-radius: 99px; color: #426447; background: #E4EEE1; font-size: 0.74rem; white-space: nowrap;`
- `.schedule-status-request` — `color: #8B6537; background: #F4EBDD;`
- `.schedule-status-lessons` — `color: #96543A; background: #F5E7DF;`
- `.schedule-option-card h3` — `margin-top: 1.6rem; color: #293B30; font: 700 1.75rem/1.03 var(--font-display), serif;`
- `.schedule-option-time` — `display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem; color: #A85439; font-size: 1rem;`
- `.schedule-option-time strong` — `color: #3E5545;`
- `.schedule-option-time span` — `color: #899188; font-size: 0.95rem;`
- `.schedule-option-card > p` — `margin-top: 1rem; color: #748076; font-size: 1rem; line-height: 1.65;`
- `.schedule-option-bottom` — `display: flex; align-items: flex-end; justify-content: space-between; gap: 0.7rem; margin-top: auto; padding-top: 1.2rem;`
- `.schedule-option-bottom > span` — `color: #8B958C; font-size: 0.84rem; line-height: 1.4;`
- `.schedule-option-bottom a` — `color: #315944; font-size: 0.9rem; font-weight: 700; text-decoration: none; white-space: nowrap;`
- `.schedule-option-bottom a:hover` — `color: #A44C32;`
- `.schedule-meeting-point` — `display: flex; align-items: center; gap: 1rem; margin-top: 3rem; padding: 1.4rem 1.6rem; border: 1px solid #E5DDC8; border-radius: 8px; back…`
- `.schedule-meeting-icon` — `display: grid; width: 2.8rem; height: 2.8rem; flex: 0 0 auto; place-items: center; border-radius: 50%; color: #A44C32; background: #F0E2D5; …`
- `.schedule-meeting-point > div > strong` — `display: block; margin-top: 0.3rem; color: #33463A; font: 700 1.3rem var(--font-display), serif;`
- `.schedule-meeting-point > div > p` — `margin-top: 0.2rem; color: #7B857D; font-size: 0.95rem;`
- `.schedule-week` — `padding: 1.7rem; border: 1px solid #E5E2D8; border-radius: 10px; background: #FFFEFA;`
- `.schedule-week .schedule-section-heading` — `margin-bottom: 1.2rem;`
- `.schedule-week-grid` — `display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.5rem;`
- `.schedule-day` — `display: grid; min-height: 78px; align-content: center; gap: 0.45rem; padding: 0.7rem; border: 1px solid #ECEBE4; border-radius: 5px; color:…`
- `.schedule-day > div` — `color: var(--day-accent); font-size: 0.88rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;`
- `.schedule-day > span` — `color: #99A098; font-size: 0.87rem; line-height: 1.35; white-space: pre-line;`
- `.schedule-day-active` — `border-color: color-mix(in srgb, var(--day-accent) 24%, #ECEBE4); background: color-mix(in srgb, var(--day-accent) 6%, #FFFEFA);`
- `.schedule-day-active > span` — `color: #58665B;`
- `.schedule-cta` — `display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 3rem; padding: 2rem 2.2rem; border-radius: 10px; …`
- `.schedule-cta h2` — `font-size: 2rem;`
- `.schedule-cta .schedule-primary-button` — `flex: 0 0 auto;`
- `.schedule-map-feature` — `grid-template-columns: minmax(0, 1fr);`
- `.schedule-map-copy` — `padding: 2rem;`
- `.schedule-live-map` — `padding: 0.8rem;`
- `.schedule-live-map > div:first-of-type + div > div:first-child` — `height: 450px !important;`
- `.schedule-card-grid` — `grid-template-columns: repeat(2, minmax(0, 1fr));`
- `.schedule-option-card:last-child` — `grid-column: auto;`
- `.schedule-hero` — `padding: 8rem 1.25rem 3rem;`
- `.schedule-hero h1` — `font-size: clamp(2.8rem, 13vw, 4.2rem);`
- `.schedule-content` — `width: min(100% - 1.5rem, 80rem); padding-top: 1rem;`
- `.schedule-map-copy` — `padding: 1.5rem;`
- `.schedule-stats` — `gap: 0.35rem;`
- `.schedule-stats strong` — `font-size: 1rem;`
- `.schedule-stats span` — `font-size: 0.79rem;`
- `.schedule-live-map > div:first-of-type + div > div:first-child` — `height: 390px !important;`
- `.schedule-live-map > div:first-of-type + div > div:last-child` — `grid-template-columns: repeat(2, minmax(0, 1fr)) !important;`
- `.schedule-section-heading` — `align-items: flex-start; flex-direction: column; gap: 0.6rem;`
- `.schedule-highlights, .schedule-options, .schedule-week` — `margin-top: 3.5rem;`
- `.schedule-photo-grid, .schedule-card-grid` — `grid-template-columns: minmax(0, 1fr);`
- `.schedule-photo-card` — `min-height: 265px;`
- `.schedule-option-card, .schedule-option-card:last-child` — `grid-column: auto; min-height: 260px;`
- `.schedule-week` — `padding: 1rem;`
- `.schedule-week-grid` — `grid-template-columns: repeat(2, minmax(0, 1fr));`
- `.schedule-day:last-child` — `grid-column: 1 / -1;`
- `.schedule-cta` — `align-items: flex-start; flex-direction: column; padding: 1.5rem;`
- `.schedule-meeting-point` — `align-items: flex-start; padding: 1rem;`
- `.schedule-meeting-point > div > strong` — `font-size: 1.1rem;`
- `.route-library-field` — `display: flex; flex-direction: column; gap: 0.4rem; margin: 0.75rem 0; color: rgba(245, 237, 217, 0.65); font-size: 0.68rem; font-weight: 60…`
- `.route-library-field select` — `width: 100%; padding: 0.55rem 0.65rem; border: 1px solid rgba(245, 237, 217, 0.17); border-radius: 3px; color: #F5EDD9; background: #111912;…`
- `.route-library-field select:focus-visible, .route-gpx-import input:focus-visible` — `outline: 2px solid #D4A017; outline-offset: 2px;`
- `.route-library-metadata` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; margin: 0.8rem 0;`
- `.route-library-metadata span` — `padding: 0.5rem; border: 1px solid rgba(245, 237, 217, 0.1); color: rgba(245, 237, 217, 0.64); font-size: 0.62rem;`
- `.route-elevation-panel` — `margin: 0.8rem 0; padding: 0.7rem; border: 1px solid rgba(245, 237, 217, 0.1); background: rgba(245, 237, 217, 0.035);`
- `.route-elevation-panel > div:first-child` — `display: flex; justify-content: space-between; gap: 0.5rem; color: rgba(245, 237, 217, 0.72); font-size: 0.62rem;`
- `.route-elevation-panel > div:first-child span` — `color: #D4A017;`
- `.route-elevation-chart` — `display: flex; height: 72px; align-items: flex-end; gap: 2px; margin-top: 0.6rem;`
- `.route-elevation-chart span` — `min-width: 2px; flex: 1 1 0; border-radius: 2px 2px 0 0; background: linear-gradient(180deg, #D4A017, #C1440E);`
- `.route-gpx-import` — `display: flex; align-items: center; justify-content: space-between; gap: 0.65rem; margin-top: 0.8rem; padding: 0.65rem; border: 1px dashed r…`
- `.route-gpx-import input` — `width: min(58%, 190px); color: rgba(245, 237, 217, 0.65); font: 0.6rem var(--font-body), sans-serif;`
- `.route-import-error` — `margin-top: 0.6rem; color: #FF9A76; font-size: 0.9rem;`
- `/* Booking dashboard */ .booking-dashboard-wrap` — `width: min(100% - 3rem, 80rem); margin: 0 auto; padding: 3.5rem 0 5rem;`
- `.booking-dashboard-meta` — `display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 1.4rem;`
- `.booking-dashboard-meta h2` — `margin-top: 0.3rem; color: #F5EDD9; font: 700 1.8rem var(--font-display), serif;`
- `.booking-dashboard-kicker` — `color: #D4A017; font-size: 0.87rem; font-weight: 700; letter-spacing: 0.13em;`
- `.booking-live-indicator` — `display: flex; align-items: center; gap: 0.5rem; color: rgba(245, 237, 217, 0.62); font-size: 0.95rem;`
- `.booking-live-indicator i` — `width: 7px; height: 7px; border-radius: 50%; background: #85B77C; box-shadow: 0 0 0 4px rgba(133, 183, 124, 0.13);`
- `.booking-dashboard-form` — `display: grid; gap: 1rem;`
- `.booking-showcase-grid` — `display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem;`
- `.booking-bike-feature, .booking-route-panel, .booking-details-panel, .booking-order-panel` — `min-width: 0; border: 1px solid rgba(245, 237, 217, 0.12); border-radius: 5px; background: #15110D;`
- `.booking-bike-feature` — `position: relative; display: flex; min-height: 410px; flex-direction: column; justify-content: space-between; overflow: hidden; padding: 1.5…`
- `.booking-bike-copy` — `position: relative; z-index: 1; max-width: 21rem;`
- `.booking-bike-copy h3` — `margin-top: 0.6rem; color: #F5EDD9; font: 700 1.7rem var(--font-display), serif;`
- `.booking-bike-copy p` — `margin-top: 0.55rem; color: rgba(245, 237, 217, 0.66); font-size: 1rem; line-height: 1.55;`
- `.booking-bike-facts` — `display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 1rem;`
- `.booking-bike-facts span` — `padding: 0.35rem 0.5rem; border: 1px solid rgba(245, 237, 217, 0.17); border-radius: 3px; color: rgba(245, 237, 217, 0.8); font-size: 0.84re…`
- `.booking-bike-feature > img` — `display: block; width: 100%; height: 205px; margin: auto 0 0.4rem; object-fit: contain; object-position: center; filter: drop-shadow(0 16px …`
- `.booking-bike-caption` — `position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; padding-top: 0.8rem; border…`
- `.booking-bike-caption strong` — `color: #F5EDD9; font: 700 1.2rem var(--font-display), serif; white-space: nowrap;`
- `.booking-bike-caption small` — `color: #D4A017; font: 500 0.88rem var(--font-body), sans-serif;`
- `.booking-panel-heading` — `display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; margin-bottom: 1rem;`
- `.booking-panel-heading h3` — `margin-top: 0.3rem; color: #F5EDD9; font: 700 1.2rem var(--font-display), serif;`
- `.booking-route-panel` — `padding: 1.25rem;`
- `.booking-route-count` — `color: rgba(245, 237, 217, 0.5); font-size: 0.9rem; white-space: nowrap;`
- `.booking-route-table-wrap` — `overflow-x: auto;`
- `.booking-route-table` — `width: 100%; min-width: 650px; border-collapse: collapse; color: rgba(245, 237, 217, 0.72); font-size: 0.92rem;`
- `.booking-route-table th, .booking-route-table td` — `padding: 0.8rem 0.65rem; border-bottom: 1px solid rgba(245, 237, 217, 0.1); text-align: left; white-space: nowrap;`
- `.booking-route-table th` — `color: rgba(245, 237, 217, 0.42); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;`
- `.booking-route-table tbody tr` — `cursor: pointer; transition: background 0.15s ease;`
- `.booking-route-table tbody tr:hover` — `background: rgba(245, 237, 217, 0.035);`
- `.booking-route-table tbody tr.selected` — `background: rgba(212, 160, 23, 0.08);`
- `.booking-route-table td:first-child strong, .booking-route-table td:first-child span` — `display: block;`
- `.booking-route-table td:first-child strong` — `color: #F5EDD9; font-size: 0.98rem;`
- `.booking-route-table td:first-child span` — `margin-top: 0.2rem; color: #D4A017; font-size: 0.81rem;`
- `.booking-route-price` — `color: #D4A017; font-weight: 700;`
- `.booking-route-choice` — `display: grid; width: 1.15rem; height: 1.15rem; place-items: center; cursor: pointer;`
- `.booking-route-choice input` — `position: absolute; width: 1px; height: 1px; opacity: 0;`
- `.booking-route-choice span` — `width: 1rem; height: 1rem; border: 1px solid rgba(245, 237, 217, 0.4); border-radius: 50%;`
- `.booking-route-choice input:checked + span` — `border: 4px solid #D4A017; background: #F5EDD9;`
- `.booking-route-choice input:focus-visible + span` — `outline: 2px solid #F5EDD9; outline-offset: 3px;`
- `.booking-details-grid` — `display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.75fr); align-items: start; gap: 1rem;`
- `.booking-details-panel, .booking-order-panel` — `padding: 1.25rem;`
- `.booking-step-mark` — `display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: 1px solid rgba(212, 160, 23, 0.4); border-radius: 50%; color: #…`
- `.booking-input-grid` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem;`
- `.booking-field` — `display: flex; flex-direction: column; gap: 0.45rem; color: rgba(245, 237, 217, 0.66); font-size: 0.9rem; font-weight: 600;`
- `.booking-field input, .booking-field textarea` — `box-sizing: border-box;`
- `.booking-field input[type="date"]` — `color-scheme: dark;`
- `.booking-field input[type="range"]` — `width: 100%; margin: 0.35rem 0 0; accent-color: #D4A017;`
- `.booking-rider-value` — `color: #D4A017;`
- `.booking-range-labels` — `display: flex; justify-content: space-between; color: rgba(245, 237, 217, 0.42); font-size: 0.81rem;`
- `.booking-notes-field` — `grid-column: 1 / -1;`
- `.booking-optional` — `color: rgba(245, 237, 217, 0.38); font-size: 0.81rem; font-weight: 400;`
- `.booking-order-panel` — `position: sticky; top: 1rem; background: #18271F;`
- `.booking-order-line, .booking-order-total` — `display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; padding: 0.8rem 0; border-bottom: 1px solid rgba(245, …`
- `.booking-order-line strong` — `color: #F5EDD9; font-weight: 600; white-space: nowrap;`
- `.booking-order-total` — `align-items: center; margin-top: 0.4rem; border-bottom: 0; color: #F5EDD9; font-weight: 600;`
- `.booking-order-total strong` — `color: #D4A017; font: 700 1.65rem var(--font-display), serif;`
- `.booking-payment-note, .booking-confirmation-note` — `color: rgba(245, 237, 217, 0.47); font-size: 0.87rem; line-height: 1.5;`
- `.booking-submit-button` — `width: 100%; margin: 1rem 0 0.7rem; padding: 0.9rem 1rem; border: 1px solid #C1440E; border-radius: 3px; color: #F5EDD9; background: #C1440E…`
- `.booking-submit-button:hover` — `border-color: #D4A017; background: #A73B10;`
- `.booking-submit-button:disabled` — `cursor: wait; opacity: 0.6;`
- `.booking-confirmation-note` — `text-align: center;`
- `.booking-submit-error` — `margin-top: 0.8rem; color: #FF9A76; font-size: 0.98rem;`
- `.booking-bike-feature` — `min-height: 390px; padding: 1.15rem;`
- `.booking-details-grid` — `grid-template-columns: minmax(0, 1fr);`
- `.booking-order-panel` — `position: static;`
- `.schedule-page` — `color: #F5EDD9; background: #0D0805;`
- `.schedule-hero` — `padding-top: 7rem; padding-bottom: 1.5rem; background: #1A3A2A;`
- `.schedule-hero h1` — `font-size: clamp(2.4rem, 4vw, 3.5rem);`
- `.schedule-hero-inner > p:last-child` — `margin-top: 0.65rem;`
- `.schedule-content` — `padding-top: 0.5rem;`
- `.schedule-options` — `margin-top: 0.5rem;`
- `.schedule-week` — `margin-top: 1.5rem;`
- `.schedule-hero h1, .schedule-map-copy h2, .schedule-section-heading h2, .schedule-cta h2` — `color: #F5EDD9;`
- `.schedule-eyebrow, .schedule-section-kicker` — `color: #D4A017;`
- `.schedule-hero-inner > p:last-child, .schedule-map-description, .schedule-section-heading > p` — `color: rgba(245, 237, 217, 0.65);`
- `.schedule-map-feature, .schedule-option-card, .schedule-week` — `border-color: rgba(212, 160, 23, 0.2); background: #111912;`
- `.schedule-option-featured` — `background: #17271D;`
- `.schedule-live-map` — `background: #0D0805;`
- `.schedule-map-label` — `color: #F5EDD9;`
- `.schedule-map-label > span:last-child` — `color: rgba(245, 237, 217, 0.5);`
- `.schedule-live-map > div:first-of-type + div > div:last-child button` — `border-color: rgba(245, 237, 217, 0.18) !important; color: #F5EDD9 !important; background: #17271D !important;`
- `.schedule-live-map > div:first-of-type + div > div:last-child button:last-child` — `border-color: #D4A017 !important; color: #0D0805 !important; background: #D4A017 !important;`
- `.schedule-stats` — `border-color: rgba(245, 237, 217, 0.15);`
- `.schedule-stats strong, .schedule-map-meet strong, .schedule-option-card h3` — `color: #F5EDD9;`
- `.schedule-stats span, .schedule-map-meet div span, .schedule-option-time span, .schedule-option-bottom > span` — `color: rgba(245, 237, 217, 0.55);`
- `.schedule-map-meet > span, .schedule-option-time` — `color: #D4A017;`
- `.schedule-option-time strong` — `color: #F5EDD9;`
- `.schedule-primary-button` — `border-color: #D4A017; color: #0D0805; background: #D4A017;`
- `.schedule-primary-button:hover` — `background: #E2B945;`
- `.schedule-option-topline` — `color: rgba(245, 237, 217, 0.55);`
- `.schedule-status-pill` — `color: #B8D0B8; background: rgba(118, 181, 130, 0.16);`
- `.schedule-status-request` — `color: #E6C88E; background: rgba(212, 160, 23, 0.15);`
- `.schedule-status-lessons` — `color: #E5A78D; background: rgba(193, 68, 14, 0.16);`
- `.schedule-option-card > p` — `color: rgba(245, 237, 217, 0.7);`
- `.schedule-option-bottom a` — `color: #D4A017;`
- `.schedule-option-bottom a:hover` — `color: #F5EDD9;`
- `.schedule-meeting-point` — `border-color: rgba(212, 160, 23, 0.25); background: rgba(212, 160, 23, 0.08);`
- `.schedule-meeting-icon` — `color: #D4A017; background: rgba(212, 160, 23, 0.14);`
- `.schedule-meeting-point > div > strong` — `color: #F5EDD9;`
- `.schedule-meeting-point > div > p` — `color: rgba(245, 237, 217, 0.6);`
- `.schedule-day` — `border-color: rgba(245, 237, 217, 0.08); color: rgba(245, 237, 217, 0.35); background: rgba(245, 237, 217, 0.03);`
- `.schedule-day > span` — `color: rgba(245, 237, 217, 0.35);`
- `.schedule-day-active` — `border-color: color-mix(in srgb, var(--day-accent) 45%, transparent); background: color-mix(in srgb, var(--day-accent) 13%, #0D0805);`
- `.schedule-day-active > span` — `color: rgba(245, 237, 217, 0.8);`
- `.schedule-cta` — `background: #1A3A2A;`
- `/* Message Inbox Page */ .message-inbox-page` — `color: #F5EDD9; background: #0D0805; min-height: 100vh;`
- `.message-inbox-shell` — `max-width: 600px; margin: 0 auto; padding: 6rem 1.5rem 4rem;`
- `.message-inbox-brand` — `display: inline-flex; align-items: center; gap: 0.5rem; color: #F5EDD9; text-decoration: none; margin-bottom: 2rem; font: 700 1.5rem var(--f…`
- `.message-inbox-brand span:first-child` — `color: #D4A017;`
- `.message-inbox-card` — `background: #111912; border: 1px solid rgba(212, 160, 23, 0.2); border-radius: 12px; padding: 2rem;`
- `.message-inbox-card h1` — `font: 700 1.75rem var(--font-display), serif; color: #F5EDD9; margin-bottom: 0.5rem;`
- `.message-inbox-sub` — `color: rgba(245, 237, 217, 0.6); margin-bottom: 1.5rem;`
- `.message-inbox-phone-input` — `display: flex; flex-direction: column; gap: 1rem;`
- `.message-inbox-phone-input .field` — `flex: 1;`
- `.message-inbox-phone-input .field input` — `width: 100%;`
- `.message-inbox-error` — `color: #FF9A76; margin-top: 1rem; padding: 0.75rem; background: rgba(255, 154, 118, 0.1); border-radius: 6px;`
- `.message-inbox-empty` — `text-align: center; color: rgba(245, 237, 217, 0.5); margin-top: 2rem; padding: 2rem; background: rgba(245, 237, 217, 0.03); border-radius: …`
- `.message-inbox-list` — `list-style: none; padding: 0; margin: 1.5rem 0 0; display: flex; flex-direction: column; gap: 1rem;`
- `.message-inbox-item` — `background: rgba(245, 237, 217, 0.03); border: 1px solid rgba(212, 160, 23, 0.15); border-radius: 8px; padding: 1rem;`
- `.message-inbox-header` — `display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 1rem;`
- `.message-inbox-type` — `color: #D4A017; font-weight: 600; text-transform: capitalize;`
- `.message-inbox-date` — `color: rgba(245, 237, 217, 0.5);`
- `.message-inbox-body` — `color: #F5EDD9; line-height: 1.6; margin-bottom: 0.75rem;`
- `.message-inbox-link a` — `color: #D4A017; font-weight: 500; text-decoration: none;`
- `.message-inbox-link a:hover` — `color: #F5EDD9; text-decoration: underline;`
- `.booking-dashboard-wrap` — `width: min(100% - 2rem, 80rem); padding: 2.3rem 0 3.5rem;`
- `.booking-dashboard-meta` — `align-items: flex-start; flex-direction: column;`
- `.booking-dashboard-meta h2` — `font-size: 1.5rem;`
- `.booking-bike-feature` — `min-height: 370px;`
- `.booking-route-panel, .booking-details-panel, .booking-order-panel` — `padding: 1rem;`
- `.booking-input-grid` — `grid-template-columns: minmax(0, 1fr);`
- `.booking-notes-field` — `grid-column: 1;`
- `/* ── Page-wide backdrop: the home page header look, behind every page ───────── */ body` — `background-color: #123222;`
- `.site-backdrop` — `position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: #123222;`
- `/* Rich green with gold diamonds, like the page headers, with the city photo showing faintly through. */ .site-backdrop-photo` — `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.7;`
- `.site-backdrop-tint` — `position: absolute; inset: 0; background: linear-gradient(160deg, rgba(20, 62, 38, 0.8) 0%, rgba(14, 46, 29, 0.74) 55%, rgba(9, 32, 20, 0.82…`
- `.site-backdrop .tribal-pattern` — `background-size: 60px 60px;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.…`
- `.shine-wrap` — `position: relative; z-index: 1;`
- `::-webkit-scrollbar-track` — `background: #1A3A2A;`
- `/* Frosted panels replace the old solid black blocks so the photo shows through. */ .glass` — `background: rgba(13, 8, 5, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 160, 23,…`
- `.glass-soft` — `background: rgba(13, 8, 5, 0.3);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(245, 237, 217,…`
- `/* Home: one continuous glass-led field for the local introduction and the route map. */ .home-explore-shell` — `width: min(100% - 2.5rem, 1380px);
  margin: 0 auto 5rem;
  overflow: hidden;
  border-radius: 5px;
  background: rgba(9, 30, 20, 0.34);
  b…`
- `.home-explore-shell > section` — `background: transparent;`
- `.home-explore-shell #map` — `padding-top: 2rem;`
- `.home-explore-shell #map > div` — `max-width: 100%;`
- `/* Heritage Trail — an editorial field guide built around the actual city route. */ .heritage-trail-page` — `position: relative;
  min-height: 100vh;
  padding-top: 5.5rem;
  color: #F5EDD9;`
- `.trail-hero` — `position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(4rem, 9vw, 8rem) 2rem 4.5rem;
  border-bottom: 1px solid rgba(21…`
- `.trail-eyebrow` — `color: #D4A017;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.15em;`
- `.trail-hero h1` — `margin-top: 1rem;
  color: #F5EDD9;
  font: 700 clamp(3.2rem, 8vw, 7rem)/0.94 var(--font-display), serif;
  letter-spacing: -0.045em;`
- `.trail-hero h1 span` — `color: #D4A017;`
- `.trail-hero-lede` — `max-width: 39rem;
  margin-top: 1.5rem;
  color: rgba(245, 237, 217, 0.78);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  line-height: 1.7;`
- `.trail-hero-facts` — `display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 2rem;`
- `.trail-hero-facts span` — `padding: 0.75rem 1rem;
  border: 1px solid rgba(245, 237, 217, 0.16);
  background: rgba(13, 8, 5, 0.28);
  color: rgba(245, 237, 217, 0.7);…`
- `.trail-hero-facts strong` — `margin-right: 0.35rem; color: #F5EDD9;`
- `.trail-map-section, .trail-sites-section` — `max-width: 1280px;
  margin: 0 auto;
  padding: 5rem 2rem 1rem;`
- `.trail-section-heading` — `display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.75rem;`
- `.trail-section-heading h2` — `margin-top: 0.45rem;
  color: #F5EDD9;
  font: 700 clamp(2rem, 4vw, 3.3rem)/1.05 var(--font-display), serif;`
- `.trail-section-heading > p` — `max-width: 25rem;
  color: rgba(245, 237, 217, 0.66);
  font-size: 0.9rem;
  line-height: 1.65;`
- `.trail-map-frame` — `padding: clamp(0.65rem, 1.5vw, 1.25rem);
  border: 1px solid rgba(212, 160, 23, 0.25);
  background: rgba(13, 8, 5, 0.38);`
- `.trail-map-frame > div > div:first-child` — `border-radius: 3px !important;`
- `.trail-map-frame > div > div:last-child button` — `min-height: 2.75rem;`
- `.trail-sites-section` — `padding-top: 6rem;`
- `.trail-sites-grid` — `display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;`
- `.trail-site-card` — `min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(212, 160, 23, 0.2);
  background: rgba(13, 8, 5, 0.36);
  transition: transform 0…`
- `.trail-site-card:hover` — `transform: translateY(-3px); border-color: rgba(212, 160, 23, 0.55);`
- `.trail-site-copy` — `padding: clamp(1.2rem, 2.5vw, 2rem);`
- `.trail-site-index` — `margin-bottom: 1rem;
  color: #D4A017;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.16em;`
- `.trail-site-title` — `display: flex; align-items: flex-start; gap: 0.7rem;`
- `.trail-site-title h2` — `color: #F5EDD9; font: 700 1.35rem/1.15 var(--font-display), serif;`
- `.trail-site-title p` — `margin-top: 0.3rem; color: rgba(245, 237, 217, 0.5); font-size: 0.72rem;`
- `.trail-site-short` — `margin-top: 1.2rem; color: #D4A017; font: italic 400 1.05rem/1.4 var(--font-display), serif;`
- `.trail-site-history` — `margin-top: 0.7rem; color: rgba(245, 237, 217, 0.72); font-size: 0.84rem; line-height: 1.7;`
- `.trail-booking-cta` — `display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1248px;
  margin: 6rem auto 0;
  padding: …`
- `.trail-booking-cta h2` — `margin-top: 0.45rem;
  color: #F5EDD9;
  font: 700 clamp(1.8rem, 3.5vw, 2.7rem)/1.08 var(--font-display), serif;`
- `.trail-booking-cta > div > p:last-child` — `max-width: 39rem;
  margin-top: 0.65rem;
  color: rgba(245, 237, 217, 0.8);
  font-size: 0.88rem;
  line-height: 1.65;`
- `.trail-booking-button` — `display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 1.2rem;
  color: #1A261D;
  background: #D4A…`
- `.trail-booking-button:hover` — `background: #E6B83C; transform: translateY(-2px);`
- `.trail-food-wrap` — `max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 0;`
- `.price-calculator-anchor` — `scroll-margin-top: 7rem;`
- `/* The roaming bicycles share the cursor rider's filled-line artwork and a calmer, wider rhythm. Separate lanes keep the silhouettes from crossing one another. */ .header-bike` — `--bike-w: clamp(140px, 13vw, 190px);
  opacity: 0.18;`
- `.header-bike-layer` — `top: calc((100% - var(--bike-w) * 0.77) * var(--layer-index) / (var(--lanes) - 1));
  height: calc(var(--bike-w) * 0.77);`
- `.header-bike-rider` — `height: calc(var(--bike-w) * 0.77);`
- `.header-bike-rider svg` — `display: block; width: 100%; height: auto;`
- `.home-explore-shell` — `width: calc(100% - 1.5rem); margin-bottom: 3rem;`
- `.trail-hero` — `padding: 4rem 1.25rem 3rem;`
- `.trail-map-section, .trail-sites-section` — `padding: 3.5rem 1.25rem 0.5rem;`
- `.trail-section-heading` — `align-items: flex-start; flex-direction: column; gap: 0.8rem;`
- `.trail-sites-grid` — `grid-template-columns: minmax(0, 1fr); gap: 1rem;`
- `.trail-booking-cta` — `align-items: flex-start; flex-direction: column; margin: 4rem 1.25rem 0;`
- `.trail-food-wrap` — `padding: 1.5rem 1.25rem 0;`
- `.header-bike` — `--bike-w: 140px; opacity: 0.15;`
- `.trail-site-card, .trail-booking-button` — `transition: none;`
- `.trail-site-card:hover, .trail-booking-button:hover` — `transform: none;`

## community.css

- `/* ── See-through pages: the fixed backdrop shows behind everything ─────────── */ .schedule-page` — `background: transparent !important;`
- `.schedule-hero` — `background: transparent !important;`
- `.schedule-hero::after` — `display: none;`
- `.schedule-option-card, .schedule-map-feature, .schedule-cta, .schedule-live-map` — `background: rgba(13, 8, 5, 0.42) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-color: rgba(212, 1…`
- `.schedule-day` — `background: rgba(13, 8, 5, 0.35); backdrop-filter: blur(6px);`
- `.schedule-day-active` — `background: color-mix(in srgb, var(--day-accent) 30%, rgba(13, 8, 5, 0.4)) !important;`
- `.schedule-meeting-point` — `background: rgba(13, 8, 5, 0.4); backdrop-filter: blur(6px);`
- `.schedule-hero h1, .schedule-hero-inner > p:last-child` — `text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);`
- `.pricing-section` — `margin-top: 4.5rem; scroll-margin-top: 6rem;`
- `.pricing-section .schedule-section-heading` — `margin-bottom: 2rem;`
- `.booking-bike-feature, .booking-route-panel, .booking-details-panel, .booking-order-panel, .routes-intro, .routes-intro-map, .route-card, .route-card-body` — `background: rgba(13, 8, 5, 0.42) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);`
- `.route-card-image` — `opacity: 0.55;`
- `.booking-order-panel` — `background: rgba(26, 58, 42, 0.5) !important;`
- `.page-hero` — `max-width: 80rem; margin: 0 auto; padding: 8.5rem 1.5rem 1.5rem;`
- `.page-hero h1` — `text-shadow: 0 1px 14px rgba(0, 0, 0, 0.35);`
- `/* ── Gallery ───────────────────────────────────────────────────────────────── */ .gallery-hero` — `max-width: 80rem; margin: 0 auto; padding: 8.5rem 1.5rem 1rem;`
- `.gallery-jump` — `display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.5rem;`
- `.gallery-jump a` — `padding: 0.5rem 1rem; border: 1px solid rgba(212, 160, 23, 0.5); border-radius: 2px; color: #F5EDD9; font-size: 0.95rem; font-weight: 700; l…`
- `.gallery-jump a:hover` — `background: rgba(212, 160, 23, 0.25);`
- `.gallery-section` — `padding: 4.5rem 0 1rem; scroll-margin-top: 5rem;`
- `.gallery-subheading` — `margin-bottom: 1rem; color: #D4A017; font: 700 1.3rem var(--font-display), serif;`
- `.photo-grid` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem;`
- `.photo-grid` — `grid-template-columns: repeat(3, minmax(0, 1fr));`
- `.photo-tile` — `position: relative; overflow: hidden; border-radius: 3px; background: rgba(13, 8, 5, 0.4);`
- `.photo-open` — `display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer;`
- `.photo-open img` — `width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;`
- `.photo-open:hover img` — `transform: scale(1.05);`
- `.photo-download` — `position: absolute; right: 0.55rem; bottom: 0.55rem; display: grid; width: 2.3rem; height: 2.3rem; place-items: center; border: 0; border-ra…`
- `.photo-download:hover, .photo-download:focus-visible` — `background: #C1440E; transform: scale(1.08);`
- `.gallery-download-btn` — `display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1rem; border: 0; border-radius: 2px; color: #F5EDD9; background: #…`
- `.gallery-download-btn:hover` — `background: #D4501A;`
- `.lightbox` — `position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 1rem; background: rgba(0, 0…`
- `.lightbox figure` — `display: flex; max-width: min(100%, 1100px); max-height: 100%; flex-direction: column; margin: 0;`
- `.lightbox img` — `min-height: 0; max-width: 100%; max-height: calc(100vh - 9rem); object-fit: contain; border-radius: 3px;`
- `.lightbox figcaption` — `display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding-top: 0.8rem; color: #F5EDD9; font-size: 1rem;`
- `.lightbox figcaption p` — `max-width: 42rem; margin-top: 0.3rem; color: rgba(245, 237, 217, 0.8); font-size: 1rem; line-height: 1.5;`
- `.lightbox-close, .lightbox-nav` — `position: absolute; display: grid; place-items: center; border: 0; border-radius: 50%; color: #F5EDD9; background: #C1440E; cursor: pointer;…`
- `.lightbox-close` — `top: 1.2rem; right: 1.2rem; width: 2.6rem; height: 2.6rem;`
- `.lightbox-nav` — `top: 50%; width: 2.6rem; height: 2.6rem; transform: translateY(-50%); background: rgba(193, 68, 14, 0.85);`
- `.lightbox-nav.prev` — `left: 1rem;`
- `.lightbox-nav.next` — `right: 1rem;`
- `.lightbox-nav` — `top: auto; bottom: 1rem; transform: none;`
- `.lightbox figcaption` — `flex-direction: column;`
- `.stories-layout` — `display: grid; gap: 2rem; align-items: start;`
- `.stories-layout` — `grid-template-columns: 22rem minmax(0, 1fr);`
- `.stories-upload` — `position: sticky; top: 6rem;`
- `.story-grid` — `display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));`
- `.story-card` — `overflow: hidden; border-radius: 3px;`
- `.story-body` — `padding: 1rem 1.1rem 1.2rem;`
- `.story-body h4` — `color: #F5EDD9; font-size: 1.1rem; font-weight: 700;`
- `.story-body p` — `margin-top: 0.5rem; color: rgba(245, 237, 217, 0.82); font-size: 1rem; line-height: 1.6; white-space: pre-wrap;`
- `.story-by` — `display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: 0.8rem; color: #D4A017; font-size: 1rem;`
- `.upload-drop` — `position: relative; display: grid; min-height: 9rem; place-items: center; overflow: hidden; border: 2px dashed rgba(212, 160, 23, 0.5); bord…`
- `.upload-drop:hover` — `border-color: #D4A017;`
- `.upload-drop.has-preview` — `border-style: solid;`
- `.upload-drop img` — `width: 100%; max-height: 16rem; object-fit: cover;`
- `.upload-drop input` — `position: absolute; inset: 0; opacity: 0; cursor: pointer;`
- `/* ── Sign-in, Connect (reviews & messages) ─────────────────────────────────── */ .sr-only` — `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;`
- `.auth-shell` — `display: grid; min-height: 100vh; place-items: center; padding: 7rem 1rem 3rem;`
- `.auth-card` — `width: min(100%, 30rem); padding: clamp(1.4rem, 4vw, 2.2rem); border-radius: 6px; color: #F5EDD9;`
- `.auth-card h1` — `margin-top: 0.3rem; font-size: 2rem; font-weight: 700;`
- `.auth-kicker, .connect-kicker` — `color: #D4A017; font-size: 0.92rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;`
- `.auth-sub` — `margin-top: 0.5rem; color: rgba(245, 237, 217, 0.8); font-size: 1rem; line-height: 1.6;`
- `.auth-tabs` — `display: grid; grid-template-columns: 1fr 1fr; margin: 1.4rem 0 1rem; border: 1px solid rgba(245, 237, 217, 0.25); border-radius: 3px; overf…`
- `.auth-tabs button` — `padding: 0.65rem; border: 0; color: rgba(245, 237, 217, 0.8); background: transparent; font-size: 1rem; font-weight: 700; cursor: pointer;`
- `.auth-tabs button.active` — `color: #0D0805; background: #D4A017;`
- `.auth-socials` — `display: grid; gap: 0.5rem;`
- `.auth-social` — `position: relative; display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.7rem 1rem; border: 1px solid rgba(2…`
- `.auth-social:hover:not(:disabled), .auth-social.selected` — `border-color: #D4A017; background: rgba(212, 160, 23, 0.18);`
- `.auth-social:disabled` — `cursor: not-allowed; opacity: 0.5;`
- `.auth-social small` — `margin-left: 0.3rem; font-size: 0.87rem; font-weight: 500; opacity: 0.85;`
- `.auth-divider` — `display: flex; align-items: center; gap: 0.8rem; margin: 1.2rem 0 1rem; color: rgba(245, 237, 217, 0.75); font-size: 0.95rem; letter-spacing…`
- `.auth-divider::before, .auth-divider::after` — `flex: 1; height: 1px; content: ""; background: rgba(245, 237, 217, 0.25);`
- `.auth-form` — `display: grid; gap: 0.9rem;`
- `.auth-form label, .connect-label` — `display: grid; gap: 0.35rem; color: rgba(245, 237, 217, 0.9); font-size: 1rem; font-weight: 600;`
- `.connect-label` — `margin-bottom: 0.4rem;`
- `.auth-form input, .auth-form textarea, .chat-form textarea` — `width: 100%; padding: 0.65rem 0.8rem; border: 1px solid rgba(245, 237, 217, 0.3); border-radius: 3px; color: #F5EDD9; background: rgba(13, 8…`
- `.auth-form input:focus, .auth-form textarea:focus, .chat-form textarea:focus` — `border-color: #D4A017; box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.2);`
- `.auth-form small` — `color: rgba(245, 237, 217, 0.75); font-weight: 400;`
- `.auth-optional` — `color: rgba(245, 237, 217, 0.6); font-weight: 400;`
- `.auth-primary` — `display: inline-block; padding: 0.8rem 1.2rem; border: 0; border-radius: 3px; color: #F5EDD9; background: #C1440E; font-size: 1rem; font-wei…`
- `.auth-primary:hover:not(:disabled)` — `background: #D4501A;`
- `.auth-primary:disabled` — `cursor: not-allowed; opacity: 0.6;`
- `.auth-link` — `justify-self: start; padding: 0; border: 0; color: #D4A017; background: none; font-size: 1rem; text-decoration: underline; cursor: pointer;`
- `.auth-error` — `padding: 0.6rem 0.8rem; border-radius: 3px; color: #FFD7C9; background: rgba(193, 68, 14, 0.45); font-size: 1rem;`
- `.auth-success` — `padding: 0.6rem 0.8rem; border-radius: 3px; color: #E6F3E0; background: rgba(60, 130, 80, 0.5); font-size: 1rem;`
- `.connect-page` — `padding-bottom: 2rem;`
- `.connect-hero, .connect-grid, .connect-wide` — `width: min(100% - 3rem, 80rem); margin-inline: auto;`
- `.connect-hero` — `padding: 8.5rem 0 1.5rem;`
- `.connect-hero h1` — `margin-top: 0.3rem; color: #F5EDD9; font-size: clamp(2.3rem, 5vw, 3.6rem); font-weight: 700; line-height: 1.05;`
- `.connect-lead` — `margin-top: 0.6rem; max-width: 38rem; color: rgba(245, 237, 217, 0.82); font-size: 1rem; line-height: 1.65;`
- `.connect-signed` — `margin-top: 1rem; color: rgba(245, 237, 217, 0.85); font-size: 1rem;`
- `.connect-signed button` — `padding: 0; border: 0; color: #D4A017; background: none; text-decoration: underline; cursor: pointer;`
- `.connect-grid` — `display: grid; gap: 1.5rem; margin-top: 1rem;`
- `.connect-grid` — `grid-template-columns: 1fr 1fr; align-items: start;`
- `.connect-panel` — `padding: clamp(1.2rem, 3vw, 1.8rem); border-radius: 5px; color: #F5EDD9;`
- `.connect-panel h2, .connect-panel h3` — `margin-top: 0.2rem; color: #F5EDD9; font-size: 1.6rem; font-weight: 700;`
- `.connect-panel .connect-lead` — `margin-bottom: 1.1rem;`
- `.connect-muted` — `color: rgba(245, 237, 217, 0.72); font-size: 1rem;`
- `.connect-gate` — `display: grid; justify-items: start; gap: 0.8rem; padding: 1.1rem; border: 1px dashed rgba(212, 160, 23, 0.5); border-radius: 4px; color: rg…`
- `.connect-wide` — `padding: 3.5rem 0 1rem;`
- `.connect-wide h2` — `margin-top: 0.2rem; margin-bottom: 1.2rem; color: #F5EDD9; font-size: 2rem; font-weight: 700;`
- `.chat-list` — `display: grid; align-content: start; gap: 0.7rem; height: 22rem; padding: 0.3rem; overflow-y: auto;`
- `.chat-bubble` — `max-width: 88%; padding: 0.6rem 0.85rem; border-radius: 8px;`
- `.chat-bubble.from-me` — `justify-self: end; background: rgba(193, 68, 14, 0.7);`
- `.chat-bubble.from-team` — `justify-self: start; background: rgba(245, 237, 217, 0.16);`
- `.chat-meta` — `margin-bottom: 0.2rem; color: rgba(245, 237, 217, 0.75); font-size: 0.9rem;`
- `.chat-body` — `font-size: 1rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere;`
- `.chat-form` — `display: grid; gap: 0.6rem; margin-top: 0.9rem;`
- `.star-picker` — `display: flex; gap: 0.2rem;`
- `.star-picker button` — `padding: 0; border: 0; color: rgba(245, 237, 217, 0.3); background: none; font-size: 2rem; line-height: 1; cursor: pointer;`
- `.star-picker button.on` — `color: #D4A017;`
- `.review-grid` — `display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));`
- `.review-card` — `padding: 1.1rem 1.2rem; border-radius: 4px; color: #F5EDD9;`
- `.review-card p` — `margin-top: 0.6rem; font-size: 1rem; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere;`
- `.review-head` — `display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;`
- `.review-by` — `margin-top: 0.6rem; color: #D4A017; font-size: 1rem; font-weight: 600;`
- `.review-reply` — `margin-top: 0.9rem; padding: 0.7rem 0.9rem; border-left: 3px solid #D4A017; background: rgba(212, 160, 23, 0.12);`
- `.review-reply strong` — `color: #D4A017; font-size: 0.98rem;`
- `.review-reply p` — `margin-top: 0.3rem;`
- `.review-mine` — `display: grid; gap: 0.7rem; margin-top: 1.6rem;`
- `.review-status` — `padding: 0.15rem 0.55rem; border-radius: 99px; font-size: 0.9rem; font-weight: 700;`
- `.review-status.pending` — `color: #FFE2A0; background: rgba(212, 160, 23, 0.25);`
- `.review-status.approved` — `color: #CDEBC8; background: rgba(60, 130, 80, 0.4);`
- `.review-status.rejected` — `color: #FFD0C0; background: rgba(193, 68, 14, 0.4);`
- `/* ── Roundabout carousel ───────────────────────────────────────────────────── */ .roundabout` — `--stage-h: clamp(280px, 40vw, 560px); position: relative; outline-offset: 6px;`
- `.roundabout-stage` — `position: relative; height: var(--stage-h); margin: 0 auto; perspective: 1300px; overflow: hidden; touch-action: pan-y;`
- `.roundabout-slide` — `position: absolute; top: 4%; left: 50%; width: min(62%, 640px); height: 88%; margin: 0 0 0 calc(min(62%, 640px) / -2); transition: transform…`
- `.roundabout-slide` — `width: 76%; margin-left: -38%;`
- `.roundabout-photo` — `display: block; width: 100%; height: 100%; padding: 0; overflow: hidden; border: 2px solid rgba(212, 160, 23, 0.55); border-radius: 6px; bac…`
- `.roundabout-slide.is-front .roundabout-photo` — `border-color: #D4A017;`
- `.roundabout-photo img` — `width: 100%; height: 100%; object-fit: cover;`
- `.roundabout-slide .photo-download` — `z-index: 3;`
- `.roundabout-arrow` — `position: absolute; top: calc(var(--stage-h) / 2 - 1.4rem); z-index: 30; display: grid; width: 2.8rem; height: 2.8rem; place-items: center; …`
- `.roundabout-arrow:hover` — `background: #D4501A;`
- `.roundabout-arrow.prev` — `left: 0.4rem;`
- `.roundabout-arrow.next` — `right: 0.4rem;`
- `.roundabout-dots` — `display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1rem; color: rgba(245, 237, 217, 0.8); font-size: 1rem;`
- `.roundabout-dots button` — `width: 0.65rem; height: 0.65rem; padding: 0; border: 0; border-radius: 50%; background: rgba(245, 237, 217, 0.35); cursor: pointer;`
- `.roundabout-dots button.on` — `background: #D4A017; transform: scale(1.3);`
- `.roundabout-caption` — `display: grid; justify-items: center; gap: 0.3rem; max-width: 40rem; margin: 1rem auto 0; color: #F5EDD9; text-align: center; font-size: 1re…`
- `.roundabout-caption strong` — `font: 700 1.25rem var(--font-display), serif;`
- `.roundabout-caption span` — `color: rgba(245, 237, 217, 0.82); line-height: 1.6; white-space: pre-wrap;`
- `.roundabout-caption em` — `color: #D4A017; font-size: 1rem; font-style: normal;`
- `/* ── Food stops, booking gate ──────────────────────────────────────────────── */ .food-stops` — `margin-top: 4.5rem;`
- `.food-grid` — `display: grid; gap: 1.1rem; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); margin-top: 1.4rem;`
- `.food-card` — `padding: 1.2rem 1.3rem; border-radius: 4px; color: #F5EDD9;`
- `.food-card h3` — `margin-top: 0.6rem; font-size: 1.15rem; font-weight: 700; line-height: 1.25;`
- `.food-card p` — `margin-top: 0.5rem; color: rgba(245, 237, 217, 0.82); font-size: 1rem; line-height: 1.6;`
- `.food-card .food-area` — `margin-top: 0.2rem; color: #D4A017; font-size: 1rem; font-weight: 600;`
- `.food-tag` — `display: inline-block; padding: 0.15rem 0.6rem; border-radius: 99px; color: #0D0805; background: #D4A017; font-size: 0.88rem; font-weight: 8…`
- `.food-note` — `margin-top: 1rem; color: rgba(245, 237, 217, 0.7); font-size: 1rem;`
- `.booking-gate` — `display: grid; justify-items: start; gap: 0.8rem; max-width: 40rem; padding: clamp(1.3rem, 3vw, 2rem); border-radius: 5px; color: #F5EDD9;`
- `.booking-gate h3` — `font-size: 1.7rem; font-weight: 700;`
- `.booking-gate p` — `color: rgba(245, 237, 217, 0.85); font-size: 1rem; line-height: 1.65;`
- `.booking-gate-actions` — `display: flex; flex-wrap: wrap; align-items: center; gap: 1.2rem;`
- `/* ── Added: bigger layout, heritage trail features, neon sign-in (loaded last so these win) ── */ /* ── Fill the page: wider content column that still scales with the root size ── */ .max-w-7xl` — `max-width: min(100% , 92rem);`
- `.page-hero, .gallery-hero` — `max-width: 92rem;`
- `.connect-hero, .connect-grid, .connect-wide` — `width: min(100% - 3rem, 92rem);`
- `.schedule-content, .booking-dashboard-wrap` — `width: min(100% - 3rem, 92rem);`
- `.schedule-hero` — `padding-left: max(1.5rem, calc((100vw - 92rem) / 2)); padding-right: max(1.5rem, calc((100vw - 92rem) / 2));`
- `main, .schedule-page, .gallery-page` — `min-height: 60vh;`
- `/* ── Heritage trail: one big roundabout per site ─────────────────────────────── */ .site-feature-list` — `display: grid; gap: 4.5rem;`
- `.site-feature` — `display: grid; gap: 1.5rem; align-items: center;`
- `.site-feature-text` — `padding: clamp(1.4rem, 3vw, 2.2rem); border-radius: 6px;`
- `.site-feature-media` — `min-width: 0;`
- `.site-feature-media .roundabout` — `--stage-h: clamp(280px, 34vw, 520px);`
- `.site-feature` — `grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr); gap: 2.5rem;`
- `.site-feature.flip` — `grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr);`
- `.site-feature.flip .site-feature-text` — `order: 2;`
- `.site-feature-media .roundabout` — `--stage-h: clamp(300px, 28vw, 520px);`
- `.roundabout-caption` — `font-size: 1.05rem;`
- `.food-card` — `padding: 1.5rem 1.6rem;`
- `.food-grid` — `grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 1.4rem;`
- `.food-near` — `margin-top: 0.4rem; color: rgba(245, 237, 217, 0.7); font-size: 0.9rem; font-style: italic;`
- `.food-directions` — `display: inline-block; margin-top: 0.9rem; color: #19C3FF; font-size: 0.9rem; font-weight: 700; text-decoration: none;`
- `.food-directions:hover` — `color: #FFFFFF; text-shadow: 0 0 10px #19C3FF;`
- `.food-stops .schedule-section-heading h2` — `color: #F5EDD9;`
- `.food-stops .schedule-section-heading > p` — `color: rgba(245, 237, 217, 0.75);`
- `.food-stops .schedule-section-kicker` — `color: #D4A017;`
- `.food-stops .schedule-section-heading` — `display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 1rem;`
- `.heritage-trail-page .trail-food-wrap .food-card` — `display: flex; flex-direction: column; align-items: center; padding: 2rem clamp(2rem, 4vw, 3.5rem); border-radius: 999px; text-align: center…`
- `.heritage-trail-page .trail-food-wrap .food-card .food-directions` — `align-self: center;`
- `.pricing-section .pricing-section-intro` — `max-width: 46rem; margin-top: 0.65rem; color: rgba(245, 237, 217, 0.75); font-size: 1rem; line-height: 1.65;`
- `/* Legal pages */ .legal-body` — `width: min(100% - 3rem, 56rem); margin: 0 auto 5rem; padding: clamp(1.5rem, 4vw, 3rem); border-radius: 6px; color: rgba(245, 237, 217, 0.9);…`
- `.legal-body h2` — `margin: 2rem 0 0.6rem; color: #D4A017; font-family: var(--font-display); font-size: 1.5rem;`
- `.legal-body p, .legal-body ul, .legal-body ol` — `margin-bottom: 1rem;`
- `.legal-body ul` — `list-style: disc; padding-left: 1.4rem;`
- `.legal-body ol` — `list-style: decimal; padding-left: 1.4rem;`
- `.legal-body a` — `color: #D4A017; text-decoration: underline;`
- `.legal-body .legal-updated` — `margin-top: 2rem; color: rgba(245, 237, 217, 0.55); font-size: 0.9rem;`
- `/* Roundabout carousel inside the Heritage Trail cards */ .trail-site-card .roundabout` — `--stage-h: clamp(240px, 26vw, 400px); padding: 1.25rem 1rem 0;`
- `/* Customer dashboard */ .dash-sub` — `margin-top: 0.6rem; color: rgba(245, 237, 217, 0.8); font-size: 1.1rem;`
- `.dash-loading` — `padding: 8rem 1.5rem; text-align: center; color: #F5EDD9;`
- `.dash-wrap` — `display: grid; gap: 1.6rem; width: min(100% - 3rem, 72rem); margin: 0 auto 5rem;`
- `.dash-profile` — `display: flex; flex-wrap: wrap; align-items: center; gap: 1.2rem; padding: 1.4rem 1.6rem; border-radius: 6px; border-left: 4px solid #D4A017…`
- `.dash-avatar` — `width: 4.2rem; height: 4.2rem; border-radius: 50%; object-fit: cover; flex: none;`
- `.dash-initial` — `display: grid; place-items: center; background: #D4A017; color: #1A3A2A; font-size: 1.8rem; font-weight: 700;`
- `.dash-profile-text` — `flex: 1 1 14rem; min-width: 0;`
- `.dash-profile-text h2` — `color: #F5EDD9; font-size: 1.5rem;`
- `.dash-profile-text p` — `color: rgba(245, 237, 217, 0.75); overflow-wrap: anywhere;`
- `.dash-signout` — `padding: 0.6rem 1.2rem; border: 1px solid rgba(245, 237, 217, 0.5); border-radius: 4px; color: #F5EDD9; font-size: 0.95rem; font-weight: 600…`
- `.dash-signout:hover` — `background: rgba(245, 237, 217, 0.12);`
- `.dash-grid` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1.2rem;`
- `.dash-tile` — `display: block; padding: 1.5rem; border-radius: 6px; color: #F5EDD9; text-decoration: none; transition: transform 0.2s ease, border-color 0.…`
- `.dash-tile:hover` — `transform: translateY(-3px); border-color: #D4A017;`
- `.dash-tile-icon` — `display: block; margin-bottom: 0.6rem; font-size: 2rem;`
- `.dash-tile h3` — `color: #D4A017; font-size: 1.3rem;`
- `.dash-tile p` — `margin-top: 0.3rem; color: rgba(245, 237, 217, 0.8);`
- `.dash-reviews` — `padding: 1.5rem 1.6rem; border-radius: 6px; color: #F5EDD9;`
- `.dash-reviews-head` — `display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.8rem;`
- `.dash-reviews-head h2` — `font-size: 1.5rem;`
- `.dash-review` — `padding: 0.9rem 0; border-top: 1px solid rgba(245, 237, 217, 0.15);`
- `.dash-stars` — `color: #D4A017; letter-spacing: 0.1em;`
- `.dash-muted` — `color: rgba(245, 237, 217, 0.65); font-size: 0.95rem;`
- `.dash-reply` — `margin-top: 0.4rem; padding-left: 0.8rem; border-left: 3px solid #D4A017;`
- `.dash-photo-grid` — `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr)); gap: 1rem;`
- `.dash-photo-card` — `overflow: hidden; border: 1px solid rgba(245, 237, 217, 0.18); border-radius: 6px; background: rgba(8, 26, 16, 0.5);`
- `.dash-photo-card > img, .dash-photo-card > video` — `display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; background: rgba(0, 0, 0, 0.3);`
- `.dash-photo-copy` — `display: grid; gap: 0.45rem; padding: 0.8rem; overflow-wrap: anywhere;`
- `.dash-photo-copy > strong` — `color: #F5EDD9;`
- `.dash-photo-download` — `justify-self: start; min-height: 2.5rem; padding: 0.45rem 0.8rem; border: 1px solid #D4A017; border-radius: 4px; background: transparent; co…`
- `.dash-photo-download:hover` — `background: #D4A017; color: #1A3A2A;`
- `.dash-photo-download:focus-visible` — `outline: 3px solid #D4A017; outline-offset: 3px;`
- `.dash-photo-error` — `color: #F5A58D;`
- `.dash-booking-group-title` — `margin: 1.2rem 0 0.35rem; color: #D4A017; font-family: var(--font-display); font-size: 1.15rem;`
- `.dash-booking` — `min-width: 0; padding: 1rem 0; border-top: 1px solid rgba(245, 237, 217, 0.15); overflow-wrap: anywhere;`
- `.dash-booking-heading` — `display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 0.6rem;`
- `.dash-booking-heading h3` — `color: #F5EDD9; font-size: 1.15rem;`
- `.dash-booking-heading p` — `color: rgba(245, 237, 217, 0.72);`
- `.dash-booking-actions` — `display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: 0.75rem;`
- `.dash-status` — `display: inline-flex; padding: 0.2rem 0.55rem; border: 1px solid rgba(212, 160, 23, 0.5); border-radius: 999px; color: #F5EDD9; font-size: 0…`
- `.dash-status-confirmed` — `color: #b7e7bd; border-color: #5da968;`
- `.dash-status-pending` — `color: #f0d477;`
- `.dash-status-cancelled, .dash-status-declined` — `color: #f5a58d; border-color: #c1440e;`
- `.dash-cancel-button` — `min-height: 2.5rem; padding: 0.45rem 0.8rem; border: 1px solid rgba(245, 237, 217, 0.55); border-radius: 4px; background: transparent; color…`
- `.dash-cancel-button:disabled, .dash-photo-download:disabled` — `opacity: 0.6; cursor: wait;`
- `.dash-dialog-backdrop` — `position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 1rem; background: rgba(5, 14, 9, 0.82);`
- `.dash-cancel-dialog` — `width: min(100%, 34rem); max-height: calc(100dvh - 2rem); overflow: auto; padding: 1.4rem; border: 1px solid rgba(212, 160, 23, 0.55); borde…`
- `.dash-cancel-dialog h2` — `margin-bottom: 0.7rem; color: #D4A017; font-size: 1.5rem;`
- `.dash-cancel-dialog p` — `margin: 0.6rem 0;`
- `.dash-cancel-dialog label` — `display: grid; gap: 0.4rem; margin-top: 1rem;`
- `.dash-cancel-dialog textarea` — `width: 100%; padding: 0.65rem; border: 1px solid rgba(245, 237, 217, 0.25); border-radius: 4px; background: rgba(245, 237, 217, 0.07); color…`
- `.dashboard-page .page-hero` — `width: min(100% - 3rem, 72rem); margin-inline: auto; padding-inline: 0;`
- `.legal-page:not(.dashboard-page) .page-hero` — `width: min(100% - 3rem, 56rem); margin-inline: auto; padding-inline: 0;`
- `/* Reserve: ride cards with price, riders and booking in one place */ .ride-live` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.6rem 1.5rem; margin: -0.4rem 0 1.2rem; color: rg…`
- `.ride-next strong` — `color: #D4A017;`
- `.site-clock` — `display: inline-flex; align-items: center; gap: 0.5rem; color: rgba(245, 237, 217, 0.7); font-size: 0.95rem;`
- `.site-clock-dot` — `width: 0.55rem; height: 0.55rem; border-radius: 50%; background: #3ddc84; box-shadow: 0 0 0 0 rgba(61, 220, 132, 0.6); animation: clock-puls…`
- `70%` — `box-shadow: 0 0 0 0.5rem rgba(61, 220, 132, 0);`
- `100%` — `box-shadow: 0 0 0 0 rgba(61, 220, 132, 0);`
- `.ride-card` — `display: flex; flex-direction: column;`
- `.ride-card > p` — `flex: 1 1 auto;`
- `.ride-price-row` — `display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 0.8rem; margin-top: 1rem; padding-top: 1rem; bor…`
- `.ride-price` — `font-family: var(--font-display); font-size: clamp(2.6rem, 4vw, 3.4rem); font-weight: 800; line-height: 1; color: #F5EDD9;`
- `.schedule-option-card:not(.schedule-option-featured) .ride-price` — `color: #D4A017;`
- `.ride-price-note` — `margin-top: 0.3rem; color: rgba(245, 237, 217, 0.75); font-size: 0.9rem;`
- `.ride-facts` — `color: rgba(245, 237, 217, 0.8); font-size: 0.95rem; line-height: 1.5; text-align: right;`
- `.ride-order` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.8rem; margin: 1rem 0 0.9rem;`
- `.ride-stepper` — `display: inline-flex; align-items: center; gap: 0.2rem; border: 1px solid rgba(245, 237, 217, 0.35); border-radius: 6px; background: rgba(13…`
- `.ride-stepper button` — `width: 2.6rem; height: 2.6rem; color: #F5EDD9; font-size: 1.4rem; font-weight: 700;`
- `.ride-stepper button:hover:not(:disabled)` — `background: rgba(245, 237, 217, 0.15);`
- `.ride-stepper button:disabled` — `opacity: 0.35;`
- `.ride-stepper span` — `min-width: 6rem; text-align: center; color: #F5EDD9; font-size: 1rem;`
- `.ride-total` — `color: rgba(245, 237, 217, 0.85); font-size: 1.05rem;`
- `.ride-total strong` — `color: #F5EDD9; font-family: var(--font-display); font-size: 1.6rem;`
- `.ride-book` — `display: block; padding: 0.95rem 1rem; border-radius: 6px; background: #F5EDD9; color: #1A3A2A; font-size: 1rem; font-weight: 800; letter-sp…`
- `.ride-book:hover` — `background: #fff; transform: translateY(-2px);`
- `.schedule-option-card:not(.schedule-option-featured) .ride-book` — `background: #D4A017; color: #0D0805;`
- `.schedule-option-card:not(.schedule-option-featured) .ride-book:hover` — `background: #E8B52C;`
- `.ride-card .schedule-option-bottom` — `margin-top: 0.9rem;`
- `.schedule-day-today` — `outline: 2px solid #D4A017; outline-offset: 2px;`
- `.schedule-today-tag` — `display: block; margin-top: 0.15rem; color: #D4A017; font-size: 0.72rem; font-style: normal; font-weight: 800; letter-spacing: 0.12em; text-…`
- `/* Heritage folders: six folders that open one at a time */ .folders` — `display: flex; align-items: stretch; gap: 0.9rem;`
- `.folder` — `position: relative; display: flex; flex: 1 1 0; flex-direction: column; min-width: 0; overflow: hidden; border: 1px solid rgba(212, 160, 23,…`
- `.folder:hover` — `border-color: var(--folder-accent); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);`
- `.folders.has-open .folder:not(.is-open)` — `flex: 0.42 1 0;`
- `.folder.is-open` — `flex: 6 1 0; border-color: var(--folder-accent);`
- `.folder-face` — `position: relative; display: block; flex: 1 1 auto; width: 100%; min-height: 30rem; overflow: hidden; color: #F5EDD9; text-align: left;`
- `.folder.is-open .folder-face` — `flex: 0 0 auto; min-height: 0; height: 7.5rem;`
- `.folder-face img` — `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;`
- `.folder-face:hover img` — `transform: scale(1.06);`
- `.folder-shade` — `position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8, 18, 12, 0.15) 0%, rgba(8, 18, 12, 0.88) 100%);`
- `.folder-number` — `position: absolute; top: 0; left: 1rem; padding: 0.45rem 0.9rem 0.35rem; border-radius: 0 0 10px 10px; background: var(--folder-accent); col…`
- `.folder-label` — `position: absolute; right: 1rem; bottom: 1rem; left: 1rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.2rem 0.6rem;`
- `.folder-label strong` — `flex: 1 1 auto; font-family: var(--font-display); font-size: clamp(1.15rem, 1.6vw, 1.5rem); line-height: 1.15;`
- `.folder-label small` — `flex-basis: 100%; color: #D4A017; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;`
- `.folder.is-open .folder-label` — `bottom: 0.8rem;`
- `.folders.has-open .folder:not(.is-open) .folder-label` — `top: 3.6rem; bottom: 1rem; flex-direction: column; align-items: center; justify-content: flex-end;`
- `.folders.has-open .folder:not(.is-open) .folder-label strong` — `flex: 0 1 auto; writing-mode: vertical-rl; transform: rotate(180deg); font-size: 1.05rem;`
- `.folders.has-open .folder:not(.is-open) .folder-label small` — `display: none;`
- `.folders.has-open .folder:not(.is-open) .folder-number` — `left: 50%; transform: translateX(-50%); padding-inline: 0.6rem;`
- `.folder-body` — `animation: folder-in 0.5s ease both;`
- `from` — `opacity: 0; transform: translateY(12px);`
- `to` — `opacity: 1; transform: none;`
- `.folder-content` — `padding: 1.2rem clamp(1rem, 2.2vw, 1.8rem) 1.8rem;`
- `.folder-content .roundabout` — `--stage-h: clamp(240px, 28vw, 400px);`
- `.folder-toolbar` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.8rem;`
- `.folder-stop` — `color: #D4A017; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;`
- `.folder-toolbar-buttons` — `display: flex; flex-wrap: wrap; gap: 0.5rem;`
- `.folder-toolbar-buttons button` — `padding: 0.45rem 0.9rem; border: 1px solid rgba(245, 237, 217, 0.35); border-radius: 6px; color: #F5EDD9; font-size: 0.95rem; font-weight: 6…`
- `.folder-toolbar-buttons button:hover` — `background: rgba(245, 237, 217, 0.14);`
- `.folder-info` — `display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 1.5rem; margin-top: 1.4rem;`
- `.folder-short` — `color: #D4A017; font-family: var(--font-display); font-size: 1.25rem; font-style: italic;`
- `.folder-history` — `margin-top: 0.6rem; color: rgba(245, 237, 217, 0.88); font-size: 1.05rem; line-height: 1.75;`
- `.folder-facts` — `display: grid; align-content: start; gap: 0.6rem; list-style: none;`
- `.folder-facts li` — `display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.9rem; border-radius: 8px; background: rgba(245, 237, 217, 0.07); color: …`
- `.folder-videos` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: 1rem; margin-top: 1.4rem;`
- `.folder-videos figure` — `margin: 0;`
- `.folder-video` — `display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 10px; background: #000;`
- `.folder-videos figcaption` — `margin-top: 0.4rem; color: rgba(245, 237, 217, 0.75); font-size: 0.95rem;`
- `.folders` — `flex-direction: column;`
- `.folder, .folders.has-open .folder:not(.is-open), .folder.is-open` — `flex: 0 0 auto;`
- `.folder-face` — `min-height: 9.5rem;`
- `.folders.has-open .folder:not(.is-open) .folder-face` — `min-height: 5.2rem;`
- `.folders.has-open .folder:not(.is-open) .folder-label` — `top: auto; bottom: 0.7rem; flex-direction: row; justify-content: flex-start; align-items: center;`
- `.folders.has-open .folder:not(.is-open) .folder-label strong` — `writing-mode: horizontal-tb; transform: none; font-size: 1.05rem;`
- `.folders.has-open .folder:not(.is-open) .folder-number` — `left: 1rem; transform: none;`
- `.folder.is-open .folder-face` — `height: 6rem; min-height: 0;`
- `.folder-info` — `grid-template-columns: 1fr;`
- `.folder, .folder-face img, .folder-body` — `transition: none; animation: none;`
- `/* Connect page: simple messaging, review form and testimonial cards */ .cx-grid` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 30rem), 1fr)); gap: 1.6rem; width: min(100% - 3rem, 78rem); margin: …`
- `.cx-panel` — `display: flex; flex-direction: column; gap: 1rem; padding: clamp(1.2rem, 2.5vw, 1.8rem); border: 1px solid rgba(245, 237, 217, 0.16); border…`
- `.cx-panel-head` — `display: flex; align-items: center; gap: 0.9rem;`
- `.cx-panel-head h2` — `color: #F5EDD9; font-size: 1.5rem; line-height: 1.2;`
- `.cx-panel-head p` — `color: rgba(245, 237, 217, 0.7); font-size: 0.95rem;`
- `.cx-team-avatar` — `display: grid; flex: none; place-items: center; width: 3rem; height: 3rem; border-radius: 50%; background: #1F7A5A; color: #fff; font-size: …`
- `.cx-team-avatar.cx-gold` — `background: #D4A017; color: #1A1A1A; font-size: 1.4rem;`
- `.cx-muted` — `color: rgba(245, 237, 217, 0.65);`
- `.cx-gate` — `display: grid; gap: 0.8rem; justify-items: start; padding: 1.2rem; border-radius: 12px; background: rgba(245, 237, 217, 0.06); color: #F5EDD…`
- `.cx-button` — `display: inline-block; padding: 0.8rem 1.4rem; border-radius: 8px; background: #D4A017; color: #0D0805; font-size: 1rem; font-weight: 800; t…`
- `.cx-button:hover:not(:disabled)` — `background: #E8B52C;`
- `.cx-button:disabled` — `opacity: 0.6;`
- `.cx-error` — `color: #ff9b85; font-size: 0.95rem;`
- `.cx-success` — `color: #7fe3a8; font-size: 0.95rem;`
- `.cx-chat` — `display: flex; flex-direction: column; gap: 0.3rem; height: clamp(18rem, 42vh, 26rem); overflow-y: auto; padding: 0.3rem 0.2rem; scroll-beha…`
- `.cx-day` — `display: flex; justify-content: center; margin: 0.8rem 0 0.5rem;`
- `.cx-day span` — `padding: 0.2rem 0.8rem; border-radius: 999px; background: rgba(245, 237, 217, 0.1); color: rgba(245, 237, 217, 0.75); font-size: 0.82rem; fo…`
- `.cx-msg` — `display: flex; flex-direction: column; max-width: 82%; margin-bottom: 0.5rem;`
- `.cx-msg.from-me` — `align-items: flex-end; margin-left: auto;`
- `.cx-msg.from-team` — `align-items: flex-start;`
- `.cx-bubble` — `padding: 0.7rem 1rem; border-radius: 18px; font-size: 1rem; line-height: 1.5; overflow-wrap: anywhere; white-space: pre-wrap;`
- `.from-team .cx-bubble` — `border-bottom-left-radius: 4px; background: #F5EDD9; color: #1A1A1A;`
- `.from-me .cx-bubble` — `border-bottom-right-radius: 4px; background: #D4A017; color: #0D0805;`
- `.cx-msg-time` — `margin-top: 0.2rem; padding: 0 0.4rem; color: rgba(245, 237, 217, 0.6); font-size: 0.78rem;`
- `.cx-composer` — `display: flex; align-items: flex-end; gap: 0.6rem;`
- `.cx-composer textarea` — `flex: 1 1 auto; resize: none; padding: 0.7rem 1rem; border: 1px solid rgba(245, 237, 217, 0.25); border-radius: 14px; background: rgba(13, 8…`
- `.cx-composer textarea:focus, .cx-form textarea:focus, .cx-date input:focus` — `outline: 2px solid #D4A017; outline-offset: 1px;`
- `.cx-send` — `flex: none; width: 3rem; height: 3rem; border-radius: 50%; background: #D4A017; color: #0D0805; font-size: 1.2rem; font-weight: 800;`
- `.cx-send:disabled` — `opacity: 0.45;`
- `.cx-form` — `display: grid; gap: 0.9rem;`
- `.cx-form textarea` — `width: 100%; padding: 0.8rem 1rem; border: 1px solid rgba(245, 237, 217, 0.25); border-radius: 14px; background: rgba(13, 8, 5, 0.5); color:…`
- `.cx-rating` — `display: flex; align-items: center; gap: 0.9rem;`
- `.cx-star-picker` — `display: flex; gap: 0.15rem;`
- `.cx-star-picker button` — `color: rgba(245, 237, 217, 0.28); font-size: 2.2rem; line-height: 1; transition: transform 0.15s ease, color 0.15s ease;`
- `.cx-star-picker button.on` — `color: #D4A017;`
- `.cx-star-picker button:hover` — `transform: scale(1.15);`
- `.cx-rating-label` — `color: rgba(245, 237, 217, 0.8); font-size: 1rem; font-weight: 600;`
- `.cx-form-row` — `display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 0.8rem;`
- `.cx-date` — `display: grid; gap: 0.3rem; color: rgba(245, 237, 217, 0.85); font-size: 0.92rem;`
- `.cx-date span` — `color: rgba(245, 237, 217, 0.5);`
- `.cx-date input` — `padding: 0.55rem 0.7rem; border: 1px solid rgba(245, 237, 217, 0.25); border-radius: 8px; background: rgba(13, 8, 5, 0.5); color: #F5EDD9; f…`
- `.cx-mine` — `display: grid; gap: 0.7rem; padding-top: 0.6rem; border-top: 1px solid rgba(245, 237, 217, 0.14);`
- `.cx-mine h3` — `color: #D4A017; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;`
- `.cx-mine-item` — `padding: 0.8rem 1rem; border-radius: 12px; background: rgba(245, 237, 217, 0.06); color: #F5EDD9;`
- `.cx-mine-head` — `display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.3rem;`
- `.cx-status` — `padding: 0.15rem 0.6rem; border-radius: 999px; background: rgba(245, 237, 217, 0.12); font-size: 0.78rem; font-weight: 700;`
- `.cx-status.approved` — `background: rgba(61, 220, 132, 0.2); color: #7fe3a8;`
- `.cx-status.pending` — `background: rgba(212, 160, 23, 0.22); color: #f0c453;`
- `.cx-status.rejected` — `background: rgba(255, 120, 100, 0.2); color: #ff9b85;`
- `.cx-stamp` — `display: block; margin-top: 0.3rem; color: rgba(245, 237, 217, 0.55); font-size: 0.8rem;`
- `.cx-reply` — `margin-top: 0.6rem; padding-left: 0.8rem; border-left: 3px solid #D4A017; font-size: 0.95rem;`
- `.cx-stars` — `color: #D4A017; letter-spacing: 0.12em;`
- `.cx-stars span` — `color: rgba(128, 128, 128, 0.4);`
- `.cx-testimonials` — `width: min(100% - 3rem, 78rem); margin: 0 auto 5rem;`
- `.cx-testimonials h2` — `margin-bottom: 1.2rem; color: #F5EDD9; font-size: clamp(1.8rem, 3vw, 2.4rem);`
- `.cx-tgrid` — `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: 3rem 1.6rem; padding-top: 2rem;`
- `.tcard` — `position: relative; padding: 1.2rem 1.5rem 1.4rem; border-radius: 28px; background: rgba(245, 237, 217, 0.95); color: #1d1d1d; box-shadow: 0…`
- `.tavatar` — `position: absolute; top: -2rem; left: 1rem; display: grid; place-items: center; width: 5rem; height: 5rem; background: var(--tone, #C1440E);…`
- `.thead` — `min-height: 3.4rem; margin-left: 5.2rem;`
- `.thead h3` — `color: #B3350A; font-size: 1.3rem; line-height: 1.2;`
- `.tmeta` — `display: flex; flex-wrap: wrap; align-items: center; gap: 0.2rem 0.7rem; margin-top: 0.2rem; font-size: 0.88rem; color: #555; text-transform…`
- `.tquote` — `margin-top: 0.7rem; font-size: 1.05rem; line-height: 1.65;`
- `.tstamp` — `display: block; margin-top: 0.8rem; color: #777; font-size: 0.8rem;`
- `.treply` — `margin-top: 0.9rem; padding: 0.7rem 0.9rem; border-radius: 14px; background: rgba(26, 58, 42, 0.1); font-size: 0.95rem;`
- `.treply strong` — `color: #1A3A2A;`
- `.cx-msg` — `max-width: 92%;`
- `.thead` — `margin-left: 5rem;`
- `/* Password fields with a show / hide button */ .pw-wrap` — `position: relative; display: block;`
- `.pw-wrap input` — `width: 100%; padding-right: 3.2rem;`
- `.pw-toggle` — `position: absolute; top: 0; right: 0; bottom: 0; display: grid; place-items: center; width: 3rem; color: rgba(245, 237, 217, 0.75);`
- `.pw-toggle:hover, .pw-toggle[aria-pressed="true"]` — `color: #D4A017;`
- `.stamp` — `white-space: normal;`
- `.gallery-stamp` — `display: block; margin-top: 0.2rem; color: rgba(245, 237, 217, 0.7); font-size: 0.8rem;`
- `.folder` — `scroll-margin-top: 7rem;`
- `.cx-date .cx-date-label` — `color: rgba(245, 237, 217, 0.85);`
- `.cx-date small` — `color: rgba(245, 237, 217, 0.5); font-size: inherit;`

## rr-theme.css

- `/* "rr" theme: forest greens, ochre gold, tour orange, Vollkorn headings (used by Reviews and Gallery pages). */ .rr` — `--rr-bg: #001809; --rr-surface: #052011; --rr-surface-2: #092515; --rr-surface-3: #152f1f; --rr-card: #1b4332;
  --rr-gold: #e9c46a; --rr-or…`
- `.rr h1, .rr h2, .rr h3, .rr .rr-serif` — `font-family: "Vollkorn", Georgia, serif;`
- `.rr-bg` — `/* Let the global SiteBackdrop remain visible so Reviews, Gallery and Messages
     share the exact same page background as the rest of the …`
- `.rr-wrap` — `width: min(100% - 2rem, 92rem); margin: 0 auto; padding: 7rem 0 6rem;`
- `.rr-plate` — `border: 1px solid rgba(233, 196, 106, 0.18); border-radius: 12px; background: rgba(9, 37, 21, 0.88); backdrop-filter: blur(12px);`
- `.rr-plate-elevated` — `border: 1px solid rgba(233, 196, 106, 0.35); border-radius: 12px; background: rgba(27, 67, 50, 0.75); backdrop-filter: blur(16px); box-shado…`
- `.rr-pad` — `padding: clamp(1rem, 2.4vw, 1.5rem);`
- `.rr-pill` — `display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.8rem; border: 1px solid rgba(233, 196, 106, 0.3); border-radius: 6…`
- `.rr-btn-primary` — `display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 2.9rem; padding: 0.7rem 1.4rem; border-radius: …`
- `.rr-btn-primary:hover:not(:disabled)` — `background: var(--rr-orange-hover);`
- `.rr-btn-primary:active:not(:disabled)` — `transform: scale(0.97);`
- `.rr-btn-primary:disabled` — `opacity: 0.55; box-shadow: none;`
- `.rr-btn-ghost` — `display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; min-height: 2.6rem; padding: 0.5rem 1rem; border: 1px solid…`
- `.rr-btn-ghost:hover` — `background: rgba(233, 196, 106, 0.12);`
- `.rr a:focus-visible, .rr button:focus-visible, .rr select:focus-visible, .rr input:focus-visible, .rr textarea:focus-visible` — `outline: 2px solid var(--rr-gold); outline-offset: 2px;`
- `.rr-icon` — `flex: none; vertical-align: middle;`
- `.rr-stars` — `display: inline-flex; gap: 0.1rem;`
- `.rr-stars .on` — `color: var(--rr-gold);`
- `.rr-stars .off` — `color: rgba(203, 234, 209, 0.22);`
- `.rr-verified` — `color: var(--rr-gold);`
- `.rr-muted` — `color: var(--rr-muted);`
- `.rr-sr` — `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;`
- `/* Docked bottom navigation (phones only) */ .rr-bottom-nav` — `position: fixed; right: 0; bottom: 0; left: 0; z-index: 60; display: none; justify-content: space-around; padding: 0.4rem 0.5rem calc(0.4rem…`
- `.rr-bottom-link` — `display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem; min-height: 3rem; color: var(--r…`
- `.rr-bottom-link.is-active` — `color: #e9c46a;`
- `.rr-bottom-nav` — `display: flex;`
- `body` — `padding-bottom: 4.6rem;`
- `.rr *` — `transition: none !important; animation: none !important; scroll-behavior: auto !important;`
- `/* ── Reviews page ─────────────────────────────────────────────────────────── */ .rr-grid` — `display: grid; gap: 1.4rem;`
- `.rr-col-main, .rr-col-side` — `display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 1.2rem; min-width: 0;`
- `.rr-grid` — `grid-template-columns: minmax(0, 1.5fr) minmax(22rem, 1fr); gap: 2rem;`
- `.rr-col-side` — `position: sticky; top: 6.5rem; align-self: start; max-height: calc(100vh - 7.5rem); overflow-y: auto; padding-right: 0.2rem;`
- `.rr-hero` — `display: grid; justify-items: start; gap: 0.7rem; padding: 0.4rem 0;`
- `.rr-hero h1` — `color: var(--rr-text); font-size: clamp(2.1rem, 5vw, 3.2rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.01em;`
- `.rr-hero h1 em` — `color: var(--rr-gold); font-style: italic;`
- `.rr-hero p` — `max-width: 42rem; font-size: 1.02rem; line-height: 1.7;`
- `.rr-inline` — `color: var(--rr-gold); text-decoration: underline;`
- `.rr-label` — `display: inline-flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; color: #a5d0b9; font-size: 0.76rem; font-weight: 800; letter-…`
- `.rr-score` — `display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 1rem 1.2rem; align-items: center;`
- `.rr-score-main` — `display: grid; gap: 0.3rem; padding-right: 0.8rem; border-right: 1px solid rgba(233, 196, 106, 0.2);`
- `.rr-score-number` — `display: flex; align-items: baseline; gap: 0.3rem;`
- `.rr-score-number span` — `color: var(--rr-gold); font-size: 2.8rem; font-weight: 700; line-height: 1;`
- `.rr-score-number small` — `color: #a5d0b9; font-weight: 600;`
- `.rr-score-count` — `color: var(--rr-muted); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;`
- `.rr-score-rec` — `display: flex; align-items: center; gap: 0.35rem; color: #a5d0b9; font-size: 0.88rem; font-weight: 600;`
- `.rr-bars` — `display: grid; gap: 0.35rem;`
- `.rr-bar-row` — `display: grid; grid-template-columns: 1.8rem 1fr 2.4rem; align-items: center; gap: 0.5rem; color: var(--rr-muted); font-size: 0.78rem; font-…`
- `.rr-bar-row span:last-child` — `color: var(--rr-text); text-align: right;`
- `.rr-bar` — `height: 0.55rem; overflow: hidden; border-radius: 99px; background: #203a29;`
- `.rr-bar i` — `display: block; height: 100%; border-radius: 99px; background: var(--rr-gold);`
- `.rr-highlights` — `display: flex; grid-column: 1 / -1; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.9rem; border-top: 1px solid rgba(233, 196, 106, 0.15);`
- `.rr-chip` — `padding: 0.3rem 0.8rem; border: 1px solid rgba(233, 196, 106, 0.2); border-radius: 99px; background: #152f1f; color: #a5d0b9; font-size: 0.8…`
- `.rr-chip strong` — `color: var(--rr-gold);`
- `.rr-score` — `grid-template-columns: 1fr;`
- `.rr-score-main` — `padding: 0 0 0.8rem; border-right: 0; border-bottom: 1px solid rgba(233, 196, 106, 0.2);`
- `.rr-filter-head` — `display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.6rem;`
- `.rr-sort` — `display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.7rem; border: 1px solid rgba(233, 196, 106, 0.2); border-radius: …`
- `.rr-sort select` — `border: 0; background: transparent; color: var(--rr-gold); font: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer;`
- `.rr-sort option` — `background: #152f1f; color: var(--rr-text);`
- `.rr-pills` — `display: flex; gap: 0.5rem; margin: 0 -1rem 1.1rem; padding: 0.2rem 1rem 0.5rem; overflow-x: auto; scrollbar-width: none;`
- `.rr-pills::-webkit-scrollbar` — `display: none;`
- `.rr-pill-btn` — `display: inline-flex; flex: none; align-items: center; gap: 0.3rem; padding: 0.5rem 0.9rem; border: 1px solid rgba(233, 196, 106, 0.2); bord…`
- `.rr-pill-btn:hover` — `border-color: var(--rr-gold); color: var(--rr-gold);`
- `.rr-pill-btn.is-on` — `border-color: var(--rr-gold); background: var(--rr-gold); color: #3a2a00;`
- `.rr-cards` — `display: grid; gap: 1rem;`
- `.rr-review` — `display: grid; gap: 0.8rem;`
- `.rr-review-first` — `border-left: 4px solid var(--rr-gold);`
- `.rr-review-head` — `display: flex; align-items: flex-start; gap: 0.8rem;`
- `.rr-avatar` — `display: grid; flex: none; place-items: center; width: 2.9rem; height: 2.9rem; border: 1px solid rgba(233, 196, 106, 0.3); border-radius: 50…`
- `.rr-review-who` — `flex: 1; min-width: 0;`
- `.rr-name` — `display: flex; align-items: center; gap: 0.4rem; color: var(--rr-text); font-size: 1.15rem; font-weight: 600; line-height: 1.25;`
- `.rr-review-who p` — `color: var(--rr-muted); font-size: 0.85rem;`
- `.rr-when` — `flex: none; color: var(--rr-muted); font-size: 0.78rem; font-weight: 600;`
- `.rr-review-meta` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem;`
- `.rr-tag` — `padding: 0.2rem 0.6rem; border: 1px solid rgba(233, 196, 106, 0.3); border-radius: 4px; background: rgba(233, 196, 106, 0.14); color: var(--…`
- `.rr-comment` — `color: var(--rr-text); font-size: 1.02rem; line-height: 1.7; overflow-wrap: anywhere;`
- `.rr-photo` — `position: relative; margin: 0; overflow: hidden; border: 1px solid rgba(233, 196, 106, 0.25); border-radius: 10px;`
- `.rr-photo img` — `display: block; width: 100%; height: clamp(10rem, 28vw, 15rem); object-fit: cover;`
- `.rr-photo figcaption` — `position: absolute; bottom: 0.5rem; left: 0.5rem; display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.6rem; border: 1…`
- `.rr-stops` — `display: flex; flex-wrap: wrap; gap: 0.4rem;`
- `.rr-hash` — `padding: 0.15rem 0.6rem; border: 1px solid var(--rr-outline); border-radius: 4px; background: #092515; color: #a5d0b9; font-size: 0.8rem; fo…`
- `.rr-hash:hover` — `color: var(--rr-gold); border-color: var(--rr-gold);`
- `.rr-review-foot` — `display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; padding-top: 0.7rem; border-top: 1px solid rgba(233, 196, 1…`
- `.rr-link-btn` — `display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.2rem; color: var(--rr-muted); font-size: 0.88rem; font-weight: 600; te…`
- `.rr-link-btn:hover:not(:disabled), .rr-link-btn.is-on` — `color: var(--rr-gold);`
- `.rr-link-btn:disabled` — `opacity: 0.5;`
- `.rr-reply` — `display: grid; gap: 0.3rem; padding: 0.7rem 0.9rem; border-left: 2px solid var(--rr-gold); border-radius: 0 8px 8px 0; background: rgba(0, 1…`
- `.rr-reply > div` — `display: flex; justify-content: space-between; gap: 0.5rem;`
- `.rr-reply strong` — `color: var(--rr-gold);`
- `.rr-reply p` — `color: var(--rr-muted); font-style: italic;`
- `.rr-empty` — `color: var(--rr-muted); text-align: center;`
- `/* Composer */ .rr-composer-head` — `display: grid; gap: 0.3rem; margin-bottom: 0.9rem;`
- `.rr-composer-head h2` — `color: var(--rr-text); font-size: 1.5rem; font-weight: 600; line-height: 1.25;`
- `.rr-form` — `display: grid; gap: 1rem;`
- `.rr-field` — `display: grid; gap: 0.3rem; min-width: 0; margin: 0; padding: 0; border: 0;`
- `.rr-field legend` — `padding: 0;`
- `.rr-form select, .rr-form input[type="text"], .rr-form input[type="date"], .rr-form textarea` — `width: 100%; padding: 0.7rem 0.85rem; border: 1px solid rgba(233, 196, 106, 0.3); border-radius: 8px; background: #052011; color: var(--rr-t…`
- `.rr-form textarea` — `resize: vertical; line-height: 1.55;`
- `.rr-form ::placeholder` — `color: #8b938d;`
- `.rr-two` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 0.8rem;`
- `.rr-count` — `justify-self: end; color: var(--rr-muted); font-size: 0.78rem;`
- `.rr-rate` — `display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem;`
- `.rr-rate-stars` — `display: flex; gap: 0.1rem; padding: 0.25rem 0.6rem; border: 1px solid rgba(233, 196, 106, 0.25); border-radius: 10px; background: #052011;`
- `.rr-rate-stars button` — `display: grid; place-items: center; width: 2.7rem; height: 2.7rem; color: rgba(203, 234, 209, 0.25); transition: transform 0.12s ease, color…`
- `.rr-rate-stars button.on` — `color: var(--rr-gold);`
- `.rr-rate-stars button:hover` — `transform: scale(1.12);`
- `.rr-rate-word` — `color: var(--rr-gold); font-size: 0.88rem; font-weight: 800;`
- `.rr-toggles` — `display: flex; flex-wrap: wrap; gap: 0.45rem;`
- `.rr-toggle` — `padding: 0.4rem 0.8rem; border: 1px solid rgba(233, 196, 106, 0.25); border-radius: 99px; background: #052011; color: var(--rr-muted); font-…`
- `.rr-toggle.is-on` — `border-color: var(--rr-gold); background: rgba(233, 196, 106, 0.18); color: var(--rr-gold);`
- `.rr-attach` — `display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem; padding: 0.8rem; border: 1px dashed rgba(233, 196, 106, 0.4); border-radiu…`
- `.rr-attach > div` — `flex: 1 1 10rem;`
- `.rr-attach p` — `font-size: 0.85rem;`
- `.rr-attach strong` — `color: var(--rr-text); overflow-wrap: anywhere;`
- `.rr-attach img` — `width: 3.6rem; height: 3.6rem; border-radius: 8px; object-fit: cover;`
- `.rr-submit` — `width: 100%;`
- `.rr-gate` — `display: grid; gap: 0.8rem; justify-items: start;`
- `.rr-error` — `color: #ffb4ab; font-size: 0.92rem;`
- `.rr-success` — `color: #7fe3a8; font-size: 0.95rem;`
- `.rr-mine` — `display: grid; gap: 0.7rem;`
- `.rr-mine h3` — `color: var(--rr-gold); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-family: "Plus Jakarta Sa…`
- `.rr-mine article` — `display: grid; gap: 0.3rem; padding-top: 0.6rem; border-top: 1px solid rgba(233, 196, 106, 0.15); font-size: 0.95rem;`
- `.rr-mine-head` — `display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;`
- `.rr-status` — `padding: 0.15rem 0.6rem; border-radius: 99px; background: rgba(203, 234, 209, 0.12); font-size: 0.75rem; font-weight: 700;`
- `.rr-status.approved` — `background: rgba(61, 220, 132, 0.2); color: #7fe3a8;`
- `.rr-status.pending` — `background: rgba(233, 196, 106, 0.2); color: var(--rr-gold);`
- `.rr-status.rejected` — `background: rgba(255, 120, 100, 0.2); color: #ffb4ab;`
- `/* chat panel inside the theme */ .rr .cx-panel` — `gap: 0.8rem;`
- `.rr .cx-panel-head h2` — `color: var(--rr-text); font-family: "Vollkorn", serif; font-size: 1.3rem;`
- `.rr .cx-team-avatar` — `background: var(--rr-card); color: var(--rr-gold); border: 1px solid rgba(233, 196, 106, 0.3);`
- `.rr .cx-chat` — `height: clamp(15rem, 36vh, 22rem);`
- `.rr .from-team .cx-bubble` — `background: #cbead1; color: #052011;`
- `.rr .from-me .cx-bubble` — `background: var(--rr-gold); color: #3a2a00;`
- `.rr .cx-send` — `background: var(--rr-orange); color: #fff;`
- `.rr .cx-composer textarea` — `border-color: rgba(233, 196, 106, 0.3); background: #052011;`
- `/* ── Gallery: showcase of the six sites ───────────────────────────────────── */ .gallery-rr` — `padding-top: 7rem;`
- `.showcase` — `display: grid; gap: 1.6rem; margin-bottom: 3rem;`
- `.showcase-hero` — `display: grid; gap: 1.2rem; align-items: end;`
- `.showcase-hero` — `grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);`
- `.showcase-hero .rr-pill` — `justify-self: start;`
- `.showcase-hero h1` — `margin-top: 0.8rem; color: var(--rr-text); font-size: clamp(2.8rem, 8vw, 5.6rem); font-weight: 700; line-height: 1; letter-spacing: -0.02em;`
- `.showcase-hero h1 em` — `color: var(--rr-gold);`
- `.showcase-intro` — `display: grid; gap: 0.8rem; color: var(--rr-muted); font-family: "Vollkorn", serif; font-size: 1.1rem; line-height: 1.7;`
- `.showcase .roundabout` — `--stage-h: clamp(300px, 46vw, 560px);`
- `.showcase .roundabout-stage` — `overflow: visible;`
- `.roundabout-overlay` — `position: absolute; right: 0; bottom: 0; left: 0; display: grid; gap: 0.1rem; padding: 2.6rem 1.2rem 1rem; background: linear-gradient(180de…`
- `.showcase-num` — `color: var(--rr-gold); font-size: 0.85rem; font-weight: 800; letter-spacing: 0.2em;`
- `.showcase-name` — `font-family: "Vollkorn", serif; font-size: clamp(1.5rem, 3.6vw, 2.6rem); font-weight: 600; line-height: 1.1;`
- `.showcase-street` — `color: #cbead1; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;`
- `.showcase-info` — `display: grid; grid-template-columns: auto auto minmax(0, 1fr); gap: 0.6rem 1.2rem; align-items: center; padding: 1rem 0; color: var(--rr-te…`
- `.showcase-info > svg, .showcase-info > .icon` — `color: var(--rr-gold);`
- `.showcase-site` — `color: var(--rr-gold); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase;`
- `.showcase-info h2` — `font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 600; line-height: 1.15;`
- `.showcase-info p` — `color: var(--rr-muted); font-family: "Vollkorn", serif; font-size: 1.1rem; font-style: italic;`
- `.showcase-info dl` — `display: flex; flex-wrap: wrap; grid-column: 1 / -1; gap: 0.8rem 2rem; margin: 0;`
- `.showcase-info dt` — `color: #a5d0b9; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;`
- `.showcase-info dd` — `margin: 0; color: var(--rr-text); font-size: 0.95rem;`
- `.showcase-route` — `padding: clamp(1.2rem, 3vw, 2.2rem); border: 1px solid rgba(233, 196, 106, 0.3); border-radius: 12px; background: rgba(5, 32, 17, 0.8);`
- `.showcase-route h2` — `margin: 0.2rem 0 0.2rem; color: var(--rr-text); font-size: clamp(1.6rem, 3.4vw, 2.4rem); font-weight: 600;`
- `.showcase-buttons` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); gap: 0.9rem; margin-top: 1.2rem;`
- `.showcase-button` — `position: relative; display: flex; align-items: center; gap: 0.9rem; min-height: 4.6rem; padding: 0.9rem 2.4rem 0.9rem 1rem; border: 1px sol…`
- `.showcase-button:hover` — `border-color: var(--rr-gold); background: rgba(27, 67, 50, 0.9); transform: translateY(-2px);`
- `.showcase-button:active` — `transform: translateY(0) scale(0.99); background: rgba(27, 67, 50, 1);`
- `.showcase-button.is-current` — `border-color: var(--rr-gold); background: rgba(27, 67, 50, 0.95); box-shadow: inset 0 0 0 1px rgba(233, 196, 106, 0.4);`
- `.showcase-button-num` — `color: var(--rr-gold); font-size: 0.8rem; font-weight: 800; opacity: 0.8;`
- `.showcase-button svg:not(.showcase-button-arrow)` — `color: var(--rr-gold);`
- `.showcase-button-text` — `display: grid; gap: 0.1rem; min-width: 0;`
- `.showcase-button-text strong` — `font-family: "Vollkorn", serif; font-size: 1.15rem; font-weight: 600; line-height: 1.2;`
- `.showcase-button-text small` — `color: #a5d0b9; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;`
- `.showcase-button-arrow` — `position: absolute; top: 0.8rem; right: 0.8rem; color: var(--rr-gold); opacity: 0.7;`
- `.showcase-info` — `grid-template-columns: auto minmax(0, 1fr);`
- `.showcase-site` — `grid-column: 1 / -1;`
- `/* ── One page per site ────────────────────────────────────────────────────── */ .site-page .rr-wrap` — `display: grid; gap: 1.6rem;`
- `.sp-nav` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.6rem;`
- `.sp-nav > div` — `display: flex; gap: 0.5rem;`
- `.sp-head` — `display: grid; gap: 0.7rem; justify-items: start;`
- `.sp-head h1` — `display: flex; align-items: center; gap: 0.7rem; color: var(--rr-text); font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 700; line-height: …`
- `.sp-head h1 svg` — `color: var(--rr-gold);`
- `.sp-street` — `display: flex; align-items: center; gap: 0.4rem; color: #a5d0b9; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.12em; text-transform…`
- `.sp-short` — `color: var(--rr-gold); font-family: "Vollkorn", serif; font-size: 1.3rem; font-style: italic;`
- `.sp-history` — `max-width: 56rem; color: var(--rr-text); font-size: 1.05rem; line-height: 1.8;`
- `.sp-section-head` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.9rem;`
- `.sp-section-head h2` — `color: var(--rr-text); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 600;`
- `.sp-grid` — `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem;`
- `.sp-grid` — `grid-template-columns: repeat(3, minmax(0, 1fr));`
- `.sp-grid` — `grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.9rem;`
- `.sp-photo, .sp-rider` — `position: relative; margin: 0; overflow: hidden; border: 1px solid rgba(233, 196, 106, 0.2); border-radius: 10px; background: #052011;`
- `.sp-photo` — `display: block; aspect-ratio: 4 / 3;`
- `.sp-photo img, .sp-rider img` — `display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;`
- `.sp-photo:hover img` — `transform: scale(1.06);`
- `.sp-rider` — `display: grid; grid-template-rows: auto auto;`
- `.sp-rider img` — `aspect-ratio: 4 / 3;`
- `.sp-rider figcaption` — `display: grid; gap: 0.1rem; padding: 0.6rem 0.8rem; color: var(--rr-muted); font-size: 0.85rem;`
- `.sp-rider strong` — `color: var(--rr-text);`
- `.sp-more` — `display: flex; justify-content: center; margin-top: 1rem;`
- `.sp-videos` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 1rem;`
- `.sp-videos figure` — `margin: 0;`
- `.sp-videos figcaption` — `margin-top: 0.4rem; color: var(--rr-muted);`
- `.sp-cta` — `display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;`
- `.sp-cta h2` — `color: var(--rr-text); font-size: 1.7rem; font-weight: 600;`
- `.folder-all` — `padding: 0.45rem 0.9rem; border: 1px solid #D4A017; border-radius: 6px; color: #D4A017; font-size: 0.95rem; font-weight: 700; text-decoratio…`
- `.folder-all:hover` — `background: rgba(212, 160, 23, 0.15);`
- `/* ── Customer message inbox: same page canvas and surface treatment as Reviews ── */ .message-inbox-page` — `min-height: 100vh;`
- `.message-inbox-shell` — `padding-top: 7.5rem;`
- `.message-inbox-brand` — `display: inline-flex; align-items: center; gap: .55rem; margin-bottom: 1.5rem; color: var(--rr-text); font: 700 1.35rem "Vollkorn", Georgia,…`
- `.message-inbox-brand span:first-child` — `display: grid; width: 2.1rem; height: 2.1rem; place-items: center; border: 1px solid rgba(233,196,106,.45); border-radius: 50%; color: var(-…`
- `.message-inbox-card` — `max-width: 54rem; margin-inline: auto;`
- `.message-inbox-card h1` — `margin: 0 0 .5rem; color: var(--rr-text); font: 700 clamp(1.8rem, 4vw, 2.4rem) "Vollkorn", Georgia, serif;`
- `.message-inbox-sub` — `margin: 0 0 1.5rem; color: var(--rr-muted);`
- `.message-inbox-phone-input` — `display: flex; flex-wrap: wrap; align-items: end; gap: 1rem;`
- `.message-inbox-phone-input .field` — `flex: 1 1 16rem; display: grid; gap: .4rem; color: var(--rr-text);`
- `.message-inbox-phone-input .field input` — `width: 100%; min-height: 2.8rem; padding: .7rem .85rem; border: 1px solid rgba(233,196,106,.3); border-radius: 8px; color: var(--rr-text); b…`
- `.message-inbox-phone-input .btn` — `min-height: 2.8rem; padding: .65rem 1.1rem; border: 0; border-radius: 8px; color: #fff; background: var(--rr-orange); font: inherit; font-we…`
- `.message-inbox-error` — `margin-top: 1rem; padding: .8rem 1rem; border: 1px solid rgba(255,120,100,.35); border-radius: 8px; color: #ffc0ad; background: rgba(120,30,…`
- `.message-inbox-empty` — `margin-top: 1.5rem; padding: 1.5rem; border: 1px dashed rgba(233,196,106,.22); border-radius: 8px; color: var(--rr-muted); text-align: cente…`
- `.message-inbox-list` — `display: grid; gap: .8rem; margin: 1.5rem 0 0; padding: 0; list-style: none;`
- `.message-inbox-item` — `padding: 1rem 1.1rem; border: 1px solid rgba(233,196,106,.2); border-radius: 9px; background: rgba(0,18,6,.48);`
- `.message-inbox-header` — `display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; margin-bottom: .65rem;`
- `.message-inbox-type` — `color: var(--rr-gold); font-weight: 800;`
- `.message-inbox-date` — `color: var(--rr-muted); font-size: .82rem;`
- `.message-inbox-body` — `color: var(--rr-text); line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere;`
- `.message-inbox-link a` — `display: inline-block; margin-top: .7rem; color: var(--rr-gold); font-weight: 700; text-decoration: underline; text-underline-offset: 3px;`
- `.message-inbox-shell` — `padding-top: 6.5rem; padding-bottom: 5rem;`
- `.message-inbox-phone-input` — `align-items: stretch; flex-direction: column;`
- `.message-inbox-phone-input .btn` — `width: 100%;`
