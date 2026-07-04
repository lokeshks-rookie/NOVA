---
name: spline-3d-integration
description: "Use when adding interactive 3D scenes from Spline.design to a React + TypeScript + Vite + Tailwind project. Covers the @splinetool/react-spline component, full TypeScript typing, lazy loading, scroll-driven animations, cursor-reactive scenes, and landing page hero patterns. Vanilla JS and iframe methods are excluded — this project uses React exclusively."
---

# Spline 3D Integration
### Stack: React + TypeScript + Vite + Tailwind CSS

---

## What Is Spline?

Spline is a browser-based 3D design tool — Figma for 3D. Scenes are built in the Spline editor, exported as a `.splinecode` file, and embedded in React via a component. The scene runs on WebGL and supports mouse, scroll, keyboard, and touch interactions out of the box.

- Free tier available (adds a small Spline watermark — acceptable for competition)
- Scenes are hosted on Spline's CDN or can be self-hosted in `/public`
- One package handles everything for this stack: `@splinetool/react-spline`

---

## Installation

```bash
npm install @splinetool/react-spline @splinetool/runtime
```

> Always install both together. `react-spline` wraps `runtime` internally — version mismatch between the two causes blank screens or TypeScript errors.

---

## Getting Your Scene URL

1. Build your scene in the Spline editor
2. Click **Export** (top-right)
3. Select **Code → React**
4. Copy the scene URL:
   ```
   https://prod.spline.design/aBcDeFgHiJkLmNoP/scene.splinecode
   ```

> Each re-export generates a new URL. Always use the latest one. Store it in a constants file, not hardcoded across components.

```ts
// src/constants/scenes.ts
export const SCENES = {
  hero: 'https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode',
  dashboard: 'https://prod.spline.design/YOUR_SECOND_SCENE_ID/scene.splinecode',
} as const;
```

---

## Core Wrapper Component

Build this once. Use it everywhere. Never import `Spline` directly in page components.

```tsx
// src/components/SplineScene.tsx
import { Suspense, lazy, useState } from 'react';
import type { SplineEvent } from '@splinetool/runtime';
import type { Application } from '@splinetool/runtime';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;
  className?: string;
  onLoad?: (app: Application) => void;
  onSplineEvent?: (e: SplineEvent) => void;
}

export function SplineScene({ scene, className = '', onLoad, onSplineEvent }: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (app: Application) => {
    setLoaded(true);
    onLoad?.(app);

    if (onSplineEvent) {
      app.addEventListener('mouseDown', onSplineEvent);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Skeleton shown while WebGL initialises */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            <span className="text-slate-400 text-sm">Loading scene...</span>
          </div>
        </div>
      )}
      <Suspense fallback={null}>
        <Spline
          scene={scene}
          onLoad={handleLoad}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}
        />
      </Suspense>
    </div>
  );
}
```

---

## Runtime API — Full TypeScript Reference

Once the scene loads, `onLoad` gives you an `Application` instance. Use it for all programmatic control.

### Types to import

```ts
import type { Application } from '@splinetool/runtime';
import type { SplineEvent } from '@splinetool/runtime';
import type { SPEObject } from '@splinetool/runtime';
```

### Object Queries

```ts
const handleLoad = (app: Application) => {
  const obj: SPEObject | undefined = app.findObjectByName('Cube');
  const byId: SPEObject | undefined = app.findObjectById('uuid-string');
  const all: SPEObject[] = app.getAllObjects();
};
```

### Triggering Events

```ts
// Trigger events defined in the Spline editor by object name
app.emitEvent('mouseDown', 'Button_CTA');
app.emitEvent('mouseHover', 'Card_Task');

// Supported types: 'mouseDown' | 'mouseUp' | 'mouseHover' | 'keyDown' | 'keyUp' | 'start' | 'lookAt' | 'follow'
```

### Listening to Events

```ts
app.addEventListener('mouseDown', (e: SplineEvent) => {
  const name = e.target.name; // name of clicked object
  if (name === 'Button_GetStarted') {
    navigate('/register');
  }
});
```

### Variables (Bidirectional Scene Control)

Variables are defined in the Spline editor and read/written from React. This is how you drive 3D animations from your UI state.

```ts
// Read
const progress = app.getVariable('taskProgress') as number;

// Write — scene reacts immediately
app.setVariable('taskProgress', 0.72);      // number
app.setVariable('isActive', true);           // boolean
app.setVariable('userName', 'Priya');        // string
```

### Direct Object Manipulation

```ts
const card = app.findObjectByName('TaskCard');
if (card) {
  card.position.y += 20;              // float up
  card.rotation.y = Math.PI / 6;     // rotate 30deg
  card.scale.x = 1.2;                // scale up X
}
```

---

## Patterns for This Project

### Pattern 1 — Hero Section (Landing Page)

Split layout: left side has headline + CTA, right side has Spline scene. This is the primary pattern for the landing page.

```tsx
// src/sections/HeroSection.tsx
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application } from '@splinetool/runtime';
import { SplineScene } from '@/components/SplineScene';
import { SCENES } from '@/constants/scenes';

export function HeroSection() {
  const navigate = useNavigate();
  const splineRef = useRef<Application | null>(null);

  const handleLoad = (app: Application) => {
    splineRef.current = app;
  };

  return (
    <section className="relative w-full min-h-screen flex items-center bg-slate-950 overflow-hidden">
      {/* Left — Text content */}
      <div className="relative z-10 flex flex-col gap-6 w-full max-w-xl px-10 lg:px-20">
        <span className="text-sky-400 text-sm font-medium tracking-widest uppercase">
          Project Management, Reimagined
        </span>
        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
          Build. Assign.<br />
          <span className="text-sky-400">Deliver.</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-md">
          Full project lifecycle management with WBS, Gantt charts, critical path analysis,
          and real-time team coordination.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Get Started Free
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="px-8 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-medium rounded-lg transition-colors duration-200"
          >
            View Demo
          </button>
        </div>
      </div>

      {/* Right — 3D Scene */}
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
        <SplineScene scene={SCENES.hero} onLoad={handleLoad} />
      </div>
    </section>
  );
}
```

### Pattern 2 — Scroll-Driven 3D

Tie scroll position to a Spline variable. Use this to animate the 3D scene as the user scrolls through the landing page.

```tsx
// src/hooks/useScrollSpline.ts
import { useEffect } from 'react';
import type { Application } from '@splinetool/runtime';

export function useScrollSpline(
  appRef: React.MutableRefObject<Application | null>,
  variableName: string
) {
  useEffect(() => {
    const handleScroll = () => {
      if (!appRef.current) return;
      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      appRef.current.setVariable(variableName, Math.min(scrollPercent, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [appRef, variableName]);
}
```

Usage:

```tsx
const splineRef = useRef<Application | null>(null);
useScrollSpline(splineRef, 'scrollProgress');
// In Spline editor, bind an animation to the 'scrollProgress' variable (0 to 1)
```

### Pattern 3 — Cursor-Reactive Scene

Make the 3D scene respond to mouse movement for a premium, alive feeling on the landing page.

```tsx
// src/hooks/useCursorSpline.ts
import { useEffect } from 'react';
import type { Application } from '@splinetool/runtime';

export function useCursorSpline(appRef: React.MutableRefObject<Application | null>) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!appRef.current) return;
      // Normalise to -1 to 1 range
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      appRef.current.setVariable('cursorX', x);
      appRef.current.setVariable('cursorY', y);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [appRef]);
}
```

In the Spline editor, bind `cursorX` and `cursorY` to object rotations on your scene objects.

### Pattern 4 — Feature Section with Reactive 3D

A section that shows a 3D task board or Gantt chart scene, and updates the Spline variables when the user hovers over feature cards.

```tsx
// src/sections/FeaturesSection.tsx
import { useRef } from 'react';
import type { Application } from '@splinetool/runtime';
import { SplineScene } from '@/components/SplineScene';
import { SCENES } from '@/constants/scenes';

const FEATURES = [
  { id: 'gantt', label: 'Gantt Chart', splineVar: 'activeView', value: 1 },
  { id: 'wbs', label: 'WBS Tree', splineVar: 'activeView', value: 2 },
  { id: 'risks', label: 'Risk Register', splineVar: 'activeView', value: 3 },
];

export function FeaturesSection() {
  const splineRef = useRef<Application | null>(null);

  const handleFeatureHover = (value: number) => {
    splineRef.current?.setVariable('activeView', value);
  };

  return (
    <section className="w-full min-h-screen flex items-center bg-slate-900 px-10 lg:px-20">
      <div className="flex flex-col gap-8 w-1/2">
        {FEATURES.map((f) => (
          <div
            key={f.id}
            onMouseEnter={() => handleFeatureHover(f.value)}
            className="p-6 rounded-xl border border-slate-800 hover:border-sky-500 cursor-pointer transition-colors duration-200"
          >
            <h3 className="text-white text-xl font-medium">{f.label}</h3>
          </div>
        ))}
      </div>
      <div className="w-1/2 h-[600px]">
        <SplineScene scene={SCENES.dashboard} onLoad={(app) => { splineRef.current = app; }} />
      </div>
    </section>
  );
}
```

---

## Mobile Strategy

The Spline scene is hidden on mobile. Show a high-quality static export instead. Do not try to run WebGL scenes on phones for a competition — the risk of lag is not worth it.

```tsx
// src/components/ResponsiveSpline.tsx
import { SplineScene } from './SplineScene';

interface Props {
  scene: string;
  mobileFallback: string; // path to exported image in /public
  className?: string;
}

export function ResponsiveSpline({ scene, mobileFallback, className }: Props) {
  return (
    <>
      <div className={`hidden lg:block w-full h-full ${className}`}>
        <SplineScene scene={scene} />
      </div>
      <div className="block lg:hidden w-full">
        <img src={mobileFallback} alt="3D preview" className="w-full rounded-xl" />
      </div>
    </>
  );
}
```

Export a high-res PNG from Spline (File → Export → Image) and place it in `/public/spline-hero-fallback.png`.

---

## Watermark Removal

The free Spline tier adds a small watermark. For a competition, this is acceptable. If you want it removed:

- Upgrade to Spline Pro ($9/month), or
- Self-host the `.splinecode` file — download it from the export panel and place in `/public/scene.splinecode`, then reference it as `scene="/scene.splinecode"`. The watermark is injected by Spline's CDN, not the file itself, so self-hosting removes it.

---

## Performance Rules (Non-Negotiable)

| Rule | Limit | Reason |
|------|-------|--------|
| Polygon count | < 150k | GPU cost scales linearly |
| Lights in scene | ≤ 3 | Each light re-renders the whole scene |
| Spline scenes per page | 1 | Multiple scenes compete for the same GPU context |
| Export geometry quality | Performance mode | Reduces bundle 50–80% |
| Mobile | No WebGL | Show static fallback instead |

### Vite-Specific Optimization

Spline's runtime is ~500KB. Since you're on Vite, it will be code-split automatically when you use `lazy()` — verify this in the build output:

```bash
npm run build
# Look for a separate chunk containing 'splinetool' in the dist/ output
# If it's merged into the main bundle, the lazy() import is not working
```

---

## Troubleshooting

**Blank white canvas**
The parent container has no height. Every ancestor of `SplineScene` must have an explicit height — `h-screen`, `h-[600px]`, or `min-h-[500px]`. A `div` with no height collapses to 0.

**CORS error in console**
Spline's CDN occasionally has CORS issues in dev. Fix: download the `.splinecode` file, place in `/public`, change the scene URL to `/your-file.splinecode`.

**TypeScript error on `onLoad` prop**
The `Application` type is in `@splinetool/runtime`, not `@splinetool/react-spline`. Import from the right package:
```ts
import type { Application } from '@splinetool/runtime'; // correct
import type { Application } from '@splinetool/react-spline'; // wrong — does not export this
```

**Scene loads but no interaction**
Events like `mouseDown` only fire on objects that have those events defined in the Spline editor. If nothing happens, check the object's Events panel in Spline and ensure the event is added there.

**Spline watermark covers UI**
The watermark is in the bottom-right of the canvas. Use CSS `overflow: hidden` on the container and offset the canvas slightly, or self-host the file (see Watermark Removal above).

**Version mismatch blank screen**
```bash
npm install @splinetool/react-spline@latest @splinetool/runtime@latest
```
Both must be installed and must match. Check `package.json` — if one is pinned to an older version, it breaks the other.

---

## File Placement Reference

```
client/
├── public/
│   ├── scene.splinecode          ← self-hosted scene (optional)
│   └── spline-hero-fallback.png  ← mobile fallback image
├── src/
│   ├── constants/
│   │   └── scenes.ts             ← all scene URLs in one place
│   ├── components/
│   │   ├── SplineScene.tsx       ← core lazy-loaded wrapper
│   │   └── ResponsiveSpline.tsx  ← desktop 3D / mobile image switcher
│   ├── hooks/
│   │   ├── useScrollSpline.ts    ← bind scroll to Spline variable
│   │   └── useCursorSpline.ts    ← bind cursor to Spline variable
│   └── sections/
│       ├── HeroSection.tsx       ← landing page hero with 3D
│       └── FeaturesSection.tsx   ← feature cards with reactive 3D
```
