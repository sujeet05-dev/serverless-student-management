---
name: Lumina Cloud
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d5'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424753'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4d8efe'
  on-primary-container: '#00285c'
  inverse-primary: '#005ac1'
  secondary: '#a6e6ff'
  on-secondary: '#003543'
  secondary-container: '#14d1ff'
  on-secondary-container: '#00566b'
  tertiary: '#45dfa4'
  on-tertiary: '#003825'
  tertiary-container: '#00a574'
  on-tertiary-container: '#003120'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004494'
  secondary-fixed: '#b7eaff'
  secondary-fixed-dim: '#4cd6ff'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  status-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  card-padding: 32px
  input-padding: 12px 16px
---

## Brand & Style

This design system is built for high-performance administrative environments. It conveys **intelligence, security, and velocity**. The aesthetic leverages a "Glass-SaaS" approach—combining the depth of Glassmorphism with the structured reliability of Corporate Modern design.

The UI should feel like a sophisticated command center. This is achieved through:
- **Atmospheric Depth:** Using subtle radial gradients in the background to prevent a "flat" dark mode.
- **Glassmorphism:** Containers use semi-transparent backgrounds with backdrop blurs and thin, luminous borders to simulate layered glass.
- **Precision:** Tight tracking in headings and monospaced-adjacent numeric displays to emphasize a data-driven nature.

## Colors

The palette is anchored in **Deep Space Navy** and **Charcoal**. 
- **Primary:** A vibrant "Electric Blue" used for actions and focus states.
- **Accent:** A "Cyan Glint" used for secondary highlights and gradients.
- **Success/Online:** A vivid emerald green specifically for API status indicators.
- **Surface Strategy:** Backgrounds are never pure black; they use a deep navy hex (#0B0E14) with a subtle radial gradient of deep purple/blue to provide a sense of infinite depth. 
- **Glass Effect:** Component surfaces use a semi-transparent slate with a `backdrop-filter: blur(12px)`.

## Typography

The typography system uses **Hanken Grotesk** for its sharp, contemporary geometry which balances technical precision with high readability.

- **Headlines:** Use tighter letter-spacing and heavy weights to command attention.
- **Labels:** Small labels and status indicators switch to **Inter** for its neutral, UI-centric legibility at micro-scales.
- **Mobile Scaling:** For mobile viewports, `headline-lg` should scale down to `24px` to maintain visual balance within condensed cards.

## Layout & Spacing

The design system utilizes a **Fluid Grid** with fixed-width constraints for dashboard widgets.
- **Rhythm:** An 8px base grid governs all spatial relationships.
- **Layout Model:** A sidebar-primary navigation layout (280px fixed width) paired with a flexible content area.
- **Containers:** Content is housed in centered "Glass Modules" that cap at 1200px on desktop to maintain eye-line focus.
- **Breakpoints:**
  - Mobile (<768px): Single column, 16px margins, bottom-sheet navigation.
  - Tablet (768px - 1024px): 2-column card layouts, collapsed sidebar.
  - Desktop (>1024px): Full 12-column grid with expanded sidebar.

## Elevation & Depth

Depth is communicated through **Tonal Stacking** and **Backdrop Blurs** rather than traditional drop shadows.

- **Level 0 (Background):** Deepest navy with subtle color bleed.
- **Level 1 (Navigation/Sidebar):** Solid dark slate, slightly lighter than the background.
- **Level 2 (Main Cards):** Glassmorphic surfaces with a 1px border (`rgba(255,255,255,0.1)`) and a 12px blur.
- **Level 3 (Modals/Popovers):** Increased blur (24px) and a subtle outer glow using the primary blue at 10% opacity to indicate interaction focus.

## Shapes

The shape language is **Refined and Rounded**. 
- **Core Elements:** Cards and main containers use a `1rem` (16px) radius to soften the technical aesthetic.
- **Interactive Elements:** Buttons and input fields follow an 8px radius.
- **Status Badges:** Pill-shaped (fully rounded) to distinguish them from functional UI components.

## Components

### Buttons
- **Primary:** Solid gradient fill (Blue to Cyan) with white text. Apply a subtle outer glow on hover.
- **Secondary/Ghost:** Transparent background with a 1px white-alpha border. Text is high-contrast white.

### Input Fields
- **Default State:** Dark charcoal background (#1E293B at 50% opacity), 1px border. 
- **Focus State:** Border changes to Primary Blue with a 2px outer glow. Labels sit above the field in `label-caps` style.

### API Online Status Indicator
- **Structure:** A horizontal pill badge.
- **Style:** Small 6px circle with a "breathing" CSS animation (soft glow) next to the text "API Online". 
- **Colors:** Success Green background at 10% opacity with a solid Green icon.

### 'Secured by AWS' Badge
- **Style:** A compact, dark-emerald translucent pill. 
- **Icon:** A small padlock icon in gold or bright green.
- **Typography:** `status-label` style, centered.

### Cards
- **Construction:** Use the Glassmorphism specification. Header sections within cards should be separated by a thin 1px line with a `linear-gradient` that fades out at the edges.