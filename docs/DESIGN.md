---
name: ROLLOVER Gacha Arcade
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5c4037'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#907065'
  outline-variant: '#e5beb2'
  surface-tint: '#aa3600'
  primary: '#a63500'
  on-primary: '#ffffff'
  primary-container: '#d04400'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59c'
  secondary: '#536600'
  on-secondary: '#ffffff'
  secondary-container: '#c7ef00'
  on-secondary-container: '#576a00'
  tertiary: '#006672'
  on-tertiary: '#ffffff'
  tertiary-container: '#008190'
  on-tertiary-container: '#f7feff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#822700'
  secondary-fixed: '#caf300'
  secondary-fixed-dim: '#b0d500'
  on-secondary-fixed: '#171e00'
  on-secondary-fixed-variant: '#3e4c00'
  tertiary-fixed: '#9cf0ff'
  tertiary-fixed-dim: '#00daf3'
  on-tertiary-fixed: '#001f24'
  on-tertiary-fixed-variant: '#004f58'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.03em
  display-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels an unapologetic collision between Y2K arcade physical hardware and contemporary digital Neobrutalism. The core identity is kinetic, tactile, punchy, and arcade-authentic—engineered to evoke the visceral dopamine hit of mechanical prize dispensers, sticker-bombed cabinets, and high-stakes coin drops.

Key attributes:
- **Kinetic Nostalgia:** References Japanese capsule machines, coin slots, chunky physical toggles, and retro CRT scoreboards without falling into messy irony.
- **Precision Rawness:** Combines thick structural framing, intense unblurred hard drop shadows, and high-voltage flat fills with strictly maintained whitespace and tight internal component alignments.
- **Physical Feedback:** Micro-interactions mimic microswitches and arcade pushbuttons: instant displacement downward-right along the shadow axis on press (`translate(4px, 4px)`), eliminating shadow offsets on active states to create mechanical spring-back.

## Colors

The palette relies on pure, punchy flat tones anchored against a warm retro cream base and locked into place with heavy architectural black:

- **Canvas & Surfaces:**
  - Base Background: `#F7F5EE` (warm retro off-white cream)
  - Card & Container Surface: `#FFFFFF` (crisp white for pure contrast inside thick borders)
  - Secondary Inset Paneling: `#EFEADF` (used for coin trays, mechanical troughs, and inset displays)
- **Border & Inking:**
  - Ink Solid: `#121212` (applied uniformly across borders, hard box-shadows, and primary text)
- **High-Voltage Accents:**
  - Primary / Hero: `#FF5500` (Arcade Flame Orange—CTA buttons, jackpot banners, alert highlights)
  - Secondary: `#D4FF00` (Electric Volt Lime—capsule indicators, badge accents, high-roller labels)
  - Tertiary: `#00E5FF` (Hyper Cyan—interactive toggles, coin counts, secondary tags)
  - Supplementary Utility: `#FF2E93` (Laser Magenta—rare drop tiers, sticker badges)

All color boundaries must be separated by an ink line (`#121212`); gradients are strictly forbidden in favor of pure flat blocks and halftone dot micro-patterns.

## Typography

Type choices prioritize bold geometry, punchy retro-futurism, and strict tabular legibility:

- **Headlines & Body (`Space Grotesk`):** Chosen for its unapologetic structural quirks, sharp angles, and robust counters that remain razor-sharp inside heavy-bordered boxes. Set all display sizes tight (`-0.02em` to `-0.03em` letter-spacing) to project an authentic arcade header impact.
- **Labels, Telemetry & Coin Counts (`Space Mono`):** Monospaced precision for prize rarities, odds percentages, credit balances, and hardware serial badges. Styled with uppercase transformations and loose tracking (`+0.04em` to `+0.06em`).

## Layout & Spacing

The layout operates on an uncompromising 8px baseline grid designed to balance bold brutality with structured readability:

- **Desktop (1200px+):** 12-column rigid grid with `gutter: 1.5rem` and outer frame margins of `margin: 2rem`. Maximum container bound is `1280px` centered, anchored by a deliberate perimeter framing line.
- **Tablet (768px - 1199px):** 8-column layout, `gutter: 1rem`, `margin: 1.5rem`. Side panels collapse into stacked, tabbed machine decks.
- **Mobile (< 768px):** 4-column layout, `gutter: 0.75rem`, `margin: 1rem`. Gacha viewport locks to sticky upper deck while inventory and controls occupy a scrollable lower chassis.

Elements must maintain decisive inner padding (`space-md` to `space-lg`). Content within cards must never touch card borders; allow generous interior breathing space to offset the physical mass of the 3px-4px structural strokes.

## Elevation & Depth

Soft shadows and blurred diffusion are strictly prohibited. Depth is achieved entirely through mechanical offsets and hard graphic silhouettes:

- **Base Line Weight:** All structural elements utilize solid `3px` or `4px` borders in `#121212`.
- **Primary Elevation (Cards & Panels):** `4px 4px 0px 0px #121212`.
- **Hero Elevation (Prizes, Machines, Primary CTAs):** `6px 6px 0px 0px #121212`.
- **Inset Depth (Troughs, Drop Slots, Inputs):** Inverted inner shadow `inset 3px 3px 0px 0px #121212` combined with background tone `#EFEADF` to simulate a sunken physical cavity.
- **Interaction Physics:** Hovering translates components `-2px, -2px` while expanding the shadow to `6px 6px 0px #121212`. On active click/press, components translate `+4px, +4px` with the shadow reduced to `0px 0px 0px #121212`, simulating a real microswitch bottoming out.

## Shapes

The shape vocabulary blends geometric brutality with ergonomic arcade hardware:

- **Chassis & Structural Cards:** `roundedness: 2` (8px / `0.5rem`). This slight radius prevents the corners from becoming clinically sharp, capturing the molded plastic edge of Japanese gacha machines.
- **Pill Badges & Stickers:** Pill radius (`9999px`) used strictly for category tags, drop rarity stickers, roll counters, and hardware rivets.
- **Capsule Orbs:** Perfect circles (`50%` radius) featuring heavy 3px perimeter inking and dual-tone half-and-half color fills (e.g. half `#FF5500`, half transparent white).

## Components

### Buttons
- **Push CTA (Primary):** Background `#FF5500`, text `#121212`, border `3px solid #121212`, shadow `5px 5px 0px #121212`, radius `8px`. Font `Space Grotesk`, bold uppercase. Hover: slight shift to `#FF6B1A` and `6px` shadow. Active: `translate(5px, 5px)` with zero shadow.
- **Secondary Action:** Background `#D4FF00` or `#00E5FF`, identical border and mechanics.
- **Coin Insert / Ghost Button:** Background `#FFFFFF`, border `3px solid #121212`, shadow `4px 4px 0px #121212`.

### Cards & Chassis Panels
- **Arcade Card:** Background `#FFFFFF`, border `3px solid #121212`, shadow `4px 4px 0px #121212`, radius `8px`.
- **Contrasting Header Bar:** Cards feature a discrete top bar (36px high) filled with `#121212`, `#FF5500`, or `#D4FF00`, separated from the body by a `3px` solid horizontal border. Contains section label in `Space Mono` uppercase with an inline colored status pip.

### Chips & Rarity Stickers
- Pill-shaped (`rounded-full`), border `2px solid #121212`, shadow `2px 2px 0px #121212`.
- **SSR / Rare Drop:** Background `#D4FF00`, text `#121212`.
- **Special Event:** Background `#FF2E93`, text `#FFFFFF`.
- Optional `transform: rotate(-2deg)` to `-3deg` applied to corner badge stickers for a tactile, stickered arcade cabinet effect.

### Input Fields & Selectors
- Background `#FFFFFF`, border `3px solid #121212`, radius `8px`, inset shadow `inset 2px 2px 0px rgba(18, 18, 18, 0.1)`. Focused state shifts border to `#121212` with an external hard focus ring: `3px 3px 0px #00E5FF`. Text set in `Space Mono`.

### Checkboxes & Radios
- **Checkbox:** Square, `20px x 20px`, border `3px solid #121212`, radius `4px`, background `#FFFFFF`. Checked state fills `#D4FF00` with an uncompromising black `X` or solid check glyph.
- **Radio:** Circular, `22px x 22px`, border `3px solid #121212`. Checked state holds a solid `#FF5500` centered disk.

### Gacha Drop Slot / Viewport
- Sunken container with background `#EFEADF`, border `4px solid #121212`, inner shadow `inset 4px 4px 0px #121212`. Features an acrylic highlight line (`2px solid rgba(255,255,255,0.6)`) running along the upper internal edge to mimic glass capsule display windows.