# flaude — marketing homepage

> _the logistics layer for your life._
> Your phone already knows your life. flaude hands it to Claude.

A single, static, dependency-free marketing site for **flaude** — a thin layer on top of
Claude Code that brings your coding agent to your phone (run from anywhere, live in-app
previews, camera-to-context, auto-caffeinate, and Flo, the little in-CLI agent). BYOK,
Mac-only, installed with one `curl`.

## Stack

Plain **HTML + CSS + vanilla JS**. No frameworks, no build step, no external runtime
dependencies (one Google font, loaded async). Drop it on any static host.

```
index.html              markup + copy (inline pinwheel SVG sprite)
styles.css              cinematic editorial theme — near-black + cream + coral #de5656
script.js               hero data-rain, install terminal, scroll engine
                        (pinned reveal · horizontal panels · parallax wordmark),
                        dot-wave canvas, staggered reveals, waitlist
logo.svg                5-fold pinwheel brand mark (currentColor, recolorable)
favicon.ico             + favicon-96x96.png, apple-touch-icon.png
web-app-manifest-*.png  PWA icons
site.webmanifest        PWA manifest
vercel.json             headers + clean URLs
```

## Design

Cinematic editorial — inspired by Tetsuwan Scientific (giant cropped wordmark,
serif headline, "scroll to see the story", data-rain) and Human Delta (thin inset
frame, restrained serif, dot-wave). Near-black `#08060a`, cream display type, a
single electric coral `#de5656` accent, and the glowing 5-fold pinwheel mark.
Fonts: Instrument Serif (headlines) · Space Grotesk (wordmark/UI) · Space Mono (labels).

## Run locally

It's static — just open `index.html`, or serve it:

```sh
python3 -m http.server 5173
# → http://localhost:5173
```

## Deploy to Vercel

```sh
git init
git add -A
git commit -m "flaude homepage"
# create an empty repo on GitHub first, then:
git remote add origin git@github.com:YOUR_USER/flaude-web.git
git branch -M main
git push -u origin main
```

Then either:

- **Dashboard:** import the repo at [vercel.com/new](https://vercel.com/new) — framework preset
  **Other**, no build command, output dir `.`. Click deploy.
- **CLI:** `npm i -g vercel && vercel --prod`

## Find-and-replace knobs

| Placeholder | Where | Swap for |
|---|---|---|
| `flaude` | everywhere | your name |
| `https://flaude.com` | hero, steps, footer, `script.js` (`INSTALL_CMD`) | real install URL |
| `the logistics layer for your life` | tagline | your tagline |
| `hello@flaude.com` | footer | real contact |
| waitlist handler | `script.js` → `#waitlist` submit | real endpoint / `mailto:` |

## Accessibility & performance

- Semantic HTML, skip link, keyboard-focusable controls, `aria-live` for streamed/status text.
- Honors `prefers-reduced-motion` (terminal jumps to final state, canvas renders one frame).
- Canvas animation pauses on hidden tabs; no third-party JS.
