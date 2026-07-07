---
name: Portal Alpha
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c5c6cf'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8f9099'
  outline-variant: '#44474e'
  surface-tint: '#b5c7ef'
  primary: '#b5c7ef'
  on-primary: '#1e3051'
  primary-container: '#0b1f3f'
  on-primary-container: '#7687ad'
  inverse-primary: '#4d5e82'
  secondary: '#ffb786'
  on-secondary: '#502400'
  secondary-container: '#e1730a'
  on-secondary-container: '#461f00'
  tertiary: '#b1c7f6'
  on-tertiary: '#183057'
  tertiary-container: '#031f46'
  on-tertiary-container: '#7288b4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b5c7ef'
  on-primary-fixed: '#061b3b'
  on-primary-fixed-variant: '#354769'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#ffb786'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#723600'
  tertiary-fixed: '#d7e2ff'
  tertiary-fixed-dim: '#b1c7f6'
  on-tertiary-fixed: '#001a40'
  on-tertiary-fixed-variant: '#30476f'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 16px
---

## Brand & Style

The design system is built for a prestigious academic environment, balancing institutional authority with modern technological innovation. It serves the ICT University community by providing a transparent, efficient, and engaging voting experience.

The visual style is **Corporate / Modern** with a **Glassmorphic** twist. It utilizes deep, immersive navy backgrounds to represent the "university at night" during gala events, contrasted with vibrant orange interactive elements. The "open door" motif is expressed through the use of perspective shifts in transitions and layered depth, suggesting access and opportunity. The ICT University shield is used as a primary grounding element, appearing in the navigation header and as a subtle watermark in high-profile dashboard views.

## Colors

This design system uses a **dark-first** approach to maximize the impact of the vibrant orange accent and ensure a premium, tech-forward feel.

- **Primary:** Deep Navy (#0B1F3F) is the foundation, used for major background surfaces.
- **Secondary:** Vibrant Orange (#F58220) is reserved for calls to action, active states, and critical information.
- **Tertiary:** A mid-tone Navy (#162E55) is used for card backgrounds and container elevations to provide subtle contrast against the primary background.
- **Surface:** Pure White (#FFFFFF) and high-opacity greys are used for text and iconography to ensure AAA accessibility on dark backgrounds.

## Typography

Typography is used to establish a clear hierarchy between institutional data and user interaction.

- **Headlines:** Hanken Grotesk provides a sharp, contemporary geometric feel that aligns with ICT University’s technical focus. Large display sizes use extra-bold weights to command attention on leaderboards.
- **Body:** Inter is used for all functional text to ensure maximum legibility across diverse mobile devices.
- **Labels:** JetBrains Mono is used for metadata, vote counts, and "Live" status indicators to reinforce the tech-forward, data-driven nature of the app.

## Layout & Spacing

This design system employs a **Mobile-First Fluid Grid** for the voting interface and a **Fixed Grid Dashboard** for leaderboard displays.

- **Mobile (Voting):** A single-column layout with 24px side margins. Content cards use full width to maximize touch targets for voting.
- **Desktop (Leaderboard):** A 12-column grid. Real-time results are displayed in high-contrast "lanes" or large-scale cards.
- **Rhythm:** An 8px base unit governs all padding and margin increments. Use larger `lg` and `xl` spacing for section breaks on large displays to maintain a clean, professional aesthetic.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layering** and **Glassmorphism**:

1.  **Floor:** The primary background (#0B1F3F) with a subtle radial gradient.
2.  **Containers:** Surface cards use a slightly lighter navy (#162E55) with a 1px inner border (white at 10% opacity) to simulate a glass edge.
3.  **Active Elements:** Voting buttons and active selections use a soft, orange-tinted outer glow (`box-shadow: 0 4px 20px rgba(245, 130, 32, 0.3)`) to indicate interactivity.
4.  **Overlays:** Modals and bottom sheets use a heavy backdrop blur (20px) to maintain context while focusing user attention on the voting action.

## Shapes

The shape language is structured and architectural, reflecting the "open door" theme.

- **Standard Corners:** 0.5rem (8px) for buttons and input fields to maintain a professional, balanced look.
- **Container Corners:** 1rem (16px) for cards and leaderboard modules to create a softer, modern container feel.
- **The "Door" Motif:** Use 90-degree corners on the left side and rounded corners on the right side for specific progress bars or tab indicators to subtly mimic an opening door.

## Components

- **Primary Buttons:** Solid Orange (#F58220) with white text. Use uppercase Hanken Grotesk for weight.
- **Voting Cards:** Large containers featuring the candidate/project image. Upon selection, the card border glows orange and a "Checked" icon appears.
- **Leaderboard Bars:** Horizontal bars using a gradient fill. The leading candidate's bar should have an animated "shimmer" effect.
- **ICT Shield Anchor:** The university shield should be placed in the top-left of the navigation bar, acting as the "Home" button.
- **Status Chips:** Small, monospaced labels for status (e.g., "VOTING OPEN", "RESULTS FINAL"). "LIVE" status should include a pulsing orange dot.
- **Input Fields:** Dark navy background with a 1px white border (20% opacity). On focus, the border turns solid orange.