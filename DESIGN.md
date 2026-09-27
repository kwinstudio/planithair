# Planit Hair Design System

## Brand personality
Editorial, confident, warm, modern and detail-focused. The site should feel like a boutique hair studio rather than a generic beauty template.

## Visual principles
- Low visual density with deliberate whitespace.
- Strong photography and typography before decorative UI.
- Forest green as the action/brand anchor; warm cream as the dominant surface.
- No gradients, glassmorphism or excessive card chrome.
- Rounded corners are restrained and used mainly for media, forms and interactive controls.

## Tokens
- `--ink`: #183a2a
- `--ink-deep`: #0f281d
- `--cream`: #f7f2e8
- `--paper`: #fffdf8
- `--sage`: #dfe8dd
- `--muted`: #68766c
- `--line`: rgba(24,58,42,.14)
- `--accent`: #183a2a

## Typography
- Display: Georgia / Times New Roman, editorial serif.
- UI/body: Inter/Arial/system sans.
- Body copy max width: ~65ch.

## Spacing scale
8, 12, 16, 24, 32, 48, 64, 96 px.

## Radius
- Small: 12px
- Medium: 18px
- Media: 28px
- Pills only for compact CTAs/tabs.

## Motion
- 140–240ms for micro-interactions.
- Transform and opacity only where possible.
- No decorative continuous motion.
- Respect `prefers-reduced-motion`.

## Responsive
- Mobile first.
- Sticky bottom booking action on mobile.
- Desktop uses 12-column editorial composition.
- No hover-only critical controls.

## Accessibility
- Visible `:focus-visible` outlines.
- Semantic buttons/links/forms.
- 44px minimum touch targets for primary controls.
- High text contrast.
