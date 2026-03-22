# Dashboard Command Desk Design

## Goal

Redesign the localized dashboard route so the first impression feels forceful, directed, and executive rather than evenly distributed and card-heavy.

## Approved Direction

- Primary mood: command and control
- Secondary mood: institutional polish
- Accent mood: restrained AI-native signal
- Brightness model: light workspace with a dark primary command surface
- Scope: dashboard and landing experience hierarchy only, not a full application-wide visual reset

## Current Problems

- The current dashboard gives nearly equal visual weight to every block.
- The hero, metrics, and list surfaces all use similar card treatments and contrast levels.
- The page reads as a tidy admin surface instead of an operational command desk.
- There is no single dominant focal point that tells the operator what matters now.

## Target Experience

The dashboard should feel like an executive operating surface. A user should land on the page and immediately understand:

1. what the current pressure is
2. where human attention is required
3. which supporting signals explain that pressure

## Layout Strategy

### Command Hero

Replace the current generic page hero with a two-part hero:

- Left: assertive headline, short situational description, and high-value status chips
- Right: dark command panel with the current priority, regional pulse, and review pressure

This is the dominant visual anchor of the page.

### Metric Hierarchy

Replace the equal four-card metric row with a weighted metric stage:

- One large primary metric card
- Two supporting metric cards
- One alert-oriented status card

The metrics should read in priority order instead of behaving like a report grid.

### Secondary Intelligence Bands

Replace the current equal two-by-two record card grid with:

- A large primary intelligence card for priorities
- A narrower side rail for regional execution
- Two compact secondary cards for feedback and review

## Visual Language

- Keep the page background light and breathable.
- Use a dark graphite or deep slate command panel as the main authority surface.
- Use warmer copper or rust accents sparingly for emphasis.
- Increase typographic authority with a dedicated display face for headlines and large numerals.
- Use sharper dividers, stronger spacing contrast, and fewer equal-weight boxes.

## Implementation Notes

- Prefer dashboard-specific components over mutating shared module templates into a new aesthetic.
- Reuse existing translated copy where possible to avoid widening the localization surface more than necessary.
- Keep the rest of the app shell stable unless a small dashboard-adjacent adjustment materially improves the first impression.

## Verification

- Confirm responsive behavior on mobile and desktop.
- Confirm localized routes still render correctly.
- Run typecheck and production build after the redesign.
