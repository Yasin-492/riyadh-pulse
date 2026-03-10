# Riyadh Pulse Navigator (Prototype)

A production-ready starter for a **client-side turn-by-turn navigation** experience using the Next.js App Router and TypeScript.

## Tech Stack

- Next.js (App Router under `src/app`)
- TypeScript
- MapLibre GL JS (browser-loaded)
- Turf.js (browser-loaded)
- Native Geolocation API via custom hooks
- Speech Synthesis API for voice guidance

## Package-level Architecture

- **UI layer (`src/components`)**
  - Stateless and stateful components for planning, navigation, and map rendering.
- **Hook layer (`src/hooks`)**
  - Browser capability wrappers (`useGeolocation`, `useSpeechSynthesis`) and navigation progress logic (`useNavigationProgress`).
- **Domain/util layer (`src/lib`)**
  - API integration (`tomtom.ts`), geospatial math (`geospatial.ts`), and thresholds/config (`constants.ts`).
- **Type layer (`src/types`)**
  - Shared types for route shape, instructions, navigation state, and geolocation state.
- **App entry (`src/app`)**
  - Server layout/page shells with client AppShell composition.

## Folder Structure

```text
src/
  app/
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  components/
    AppShell.tsx
    map/
      MapView.tsx
    navigation/
      NavigationPanel.tsx
    planning/
      PlanningPanel.tsx
  hooks/
    useGeolocation.ts
    useNavigationProgress.ts
    useSpeechSynthesis.ts
  lib/
    constants.ts
    geospatial.ts
    tomtom.ts
  types/
    navigation.ts
    vendor.d.ts
```

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_TOMTOM_API_KEY=your_tomtom_key
```

## Run

```bash
npm install
npm run dev
```

## Notes

- Route planning is powered by TomTom in `src/lib/tomtom.ts`.
- Geospatial progress evaluation and off-route detection are in `src/lib/geospatial.ts`.
- Threshold tuning constants live in `src/lib/constants.ts`.
- The home page already contains placeholders and baseline flows for planning mode and navigation mode.
