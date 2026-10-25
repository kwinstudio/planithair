# Planit Hair Design System

## Brand personality
Editorial streetwear-store energy applied to a hair studio: confident, minimal, image-led. Off-white surfaces, tight grotesk display type, serif accents and a cinematic dark hero.

## Files
- `north.css` — the whole theme (tokens, layout, components, responsive).
- `north.js` — marquee loop, header states, hero video, drag-to-explore slider, row arrows, pixel-block image reveal.
- `booking-modal.css` — the quick booking dialog in the same style.
- Fonts are self-hosted in `assets/fonts` (Inter Tight, Inter, Newsreader — SIL OFL).

## Tokens
- `--bg`: #f4f3f1 (page) · `--paper`: #fff · `--tile`: #e8e7e4 (image tiles) · `--lav`: #ebe7eb (showcase)
- `--ink`: #0e0e0e · `--muted`: #707070 · `--line`: rgba(14,14,14,.12) · `--dark`: #121110 (hero/footer)

## Typography
- Display: Inter Tight 600/700, tight tracking (-.05em), used for big titles and uppercase style names.
- Accent: Newsreader 600 for section titles with an ellipsis ("Made at Planit…").
- UI/body: Inter 400–600, small sizes; labels are 10–11px uppercase with wide tracking.

## Components
- Black marquee bar + header with centred wordmark.
- Square-cornered buttons (black, or white on dark); pills for secondary links.
- Product-style cards: 4:5 image on a grey tile, name left, price right, swatches for Women/Men.
- Sticky booking bar at the bottom (like a sticky add-to-cart).

## Motion
- Pixel-block reveal on images, word-rise on hero/footer titles, slow hero zoom.
- Everything respects `prefers-reduced-motion`.
