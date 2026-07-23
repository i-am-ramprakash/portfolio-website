# Portfolio Website UI/UX Audit

Audit date: 23 July 2026  
Project: `portfolio-website`  
Audit type: UI/UX, responsive design, accessibility, content, performance, SEO, and implementation quality

## Executive summary

The portfolio has a coherent dark/orange visual direction, clear project imagery, and a production build that completes successfully. However, the redesign is not integrated cleanly: the active React components render the older 3D/orange experience, while most of `src/index.css` describes a separate HUD-style redesign for components that do not exist. This creates unnecessary CSS, conflicting design tokens, and a misleading maintenance state.

The most serious user-facing risks are:

1. The loading overlay can remain indefinitely if the 3D model fails.
2. The mobile header cannot reliably fit at narrow widths and has no mobile menu.
3. The long contact URL is likely to clip on small screens.
4. The interactive “What I Do” cards cannot be operated from a keyboard.
5. The LinkedIn button points to the generic LinkedIn homepage.
6. The experience makes all visitors download and continuously render a costly 3D scene before the portfolio is fully usable.

Overall assessment: **needs another stabilization pass before launch**.

| Area | Score | Summary |
|---|---:|---|
| Visual direction | 7/10 | Strong color identity and card treatment, but two design systems coexist in source |
| Information architecture | 6/10 | Core sections exist, but the hero and contact journey lack strong conversion paths |
| Responsive UX | 4/10 | Several narrow-screen overflow risks and no compact navigation |
| Accessibility | 3/10 | Missing landmarks, keyboard-inaccessible controls, and incomplete motion handling |
| Performance | 4/10 | Heavy 3D and image payloads, eager media, continuous animation, and a large JS chunk |
| Content/conversion | 5/10 | Good project breadth, but outcomes and direct contact options are underused |
| SEO/social sharing | 6/10 | Basic metadata exists; social preview imagery and canonical/structured data are absent |
| Code quality | 4/10 | Build passes, but lint reports 25 errors and several lifecycle leaks are present |

## Scope and verification

Reviewed:

- All active React components and styles
- Desktop/mobile breakpoint rules
- Navigation, project, career, skills, loading, 3D, and contact flows
- Semantic HTML and keyboard support
- Public assets, metadata, headers, and robots configuration
- Production build output
- ESLint output

Verification results:

- `npm run build`: **passes**
- `npm run lint`: **fails with 25 errors and 5 warnings**
- Automated test suite: **none configured**
- Browser screenshot/viewport QA: **not completed because no local browser session was available in the audit environment**

Responsive findings below are therefore based on deterministic CSS/layout analysis. A final device pass remains necessary after the fixes.

## Prioritized findings

### Critical — loading can block the entire site indefinitely

**Evidence:** `src/components/Character/Scene.tsx:56`, `src/components/Character/Scene.tsx:68`, `src/components/Loading.tsx:87`

The loading state only reaches completion after `loadCharacter()` resolves. If both the encrypted model and `.glb` fallback fail, the rejected promise is not caught in `Scene`, and the simulated progress stops below completion. Because the loader is a fixed overlay, visitors can be locked out of the site.

**Impact:** complete loss of access on model/network/WebGL failure.

**Recommendation:** make content independent of the 3D asset. Add a bounded timeout, catch the model error, clear the loader, and show a static hero fallback. The portfolio content should become usable even when WebGL is unavailable.

### High — the redesign and the rendered UI are different systems

**Evidence:** `src/index.css:30-90`, `src/components/MainContainer.tsx:32-52`

The global stylesheet defines `.hud`, `.hero`, `.profile-grid`, `.skill-tree`, `.world-card`, command palette, project modal, recruiter mode, theme variants, and other redesigned patterns. None of these structures are rendered by the active component tree. The live tree uses `.landing-section`, `.whatIDO`, `.career-section`, `.work-section`, and the older 3D character experience.

The production build ships roughly 38.9 KB of global CSS (9.1 KB gzip), much of it unused. It also mixes blue/violet global tokens with hard-coded orange component styles.

**Impact:** the intended redesign is not actually delivered; CSS conflicts and future regressions are likely.

**Recommendation:** choose one system. Either implement the JSX that matches the HUD redesign or remove the orphaned rules and formalize the orange design tokens. Do not continue with both.

### High — mobile navigation is not viable at 320–400 px

**Evidence:** `src/components/styles/Navbar.css:1-83`

The fixed header always contains the full `RAMPRAKASH` brand plus three navigation links with 36 px gaps. The only breakpoint reveals a centered GitHub link above 900 px; there is no small-screen menu or wrapping strategy.

At 320 px, the header has roughly 288 px available, which is not enough for the brand and all links. Because the body hides horizontal overflow, clipped controls may become unreachable rather than creating a visible scrollbar.

**Recommendation:** introduce a compact menu below approximately 768 px, reduce fixed-header density, and preserve at least 44×44 px touch targets.

### High — contact content can clip on narrow screens

**Evidence:** `src/components/styles/Contact.css:25-52`

The contact card uses 50 px padding on each side and displays `github.com/i-am-ramprakash` at 28 px with no wrapping or overflow rule. On a 320 px viewport, the card has too little usable line width for this string.

**Recommendation:** add a mobile breakpoint, reduce card padding and type size, and use `overflow-wrap: anywhere`. Prefer a human CTA such as “Email Ramprakash” or “View GitHub” instead of exposing the full URL as the primary contact action.

### High — “What I Do” cards are not keyboard accessible

**Evidence:** `src/components/WhatIDo.tsx:29-79`

Clickable expansion is attached to plain `<div>` elements. They have no keyboard interaction, focusability, role, or expanded state. Hover is the primary desktop affordance, and the click behavior has no visible label indicating that the cards expand.

**Recommendation:** use real `<button>` controls associated with content panels and expose `aria-expanded`/`aria-controls`. Ensure the same content is available without hover.

### High — animation and 3D work ignore reduced-motion intent

**Evidence:** `src/index.css:87`, `src/components/Character/Scene.tsx:109-128`, `src/components/utils/GsapScroll.ts`

The reduced-motion rule hides `.three-bg`, but the active 3D element is `.character-model`. Its render loop, head tracking, loader marquee, and GSAP scroll sequences continue. The scene renders continuously even when it is not changing or is off-screen.

**Recommendation:** when `prefers-reduced-motion: reduce` is active, skip the 3D scene and scroll-scrub animations, use a static fallback, and stop marquee/autoplay effects.

### High — lifecycle leaks can duplicate work and waste CPU

**Evidence:** `src/components/Character/Scene.tsx:74-76`, `src/components/Character/Scene.tsx:109-141`, `src/components/WhatIDo.tsx:14-25`, `src/components/utils/GsapScroll.ts:10`

Confirmed issues:

- `requestAnimationFrame` is never cancelled.
- The anonymous resize listener is never removed.
- The GSAP intensity interval is never cleared.
- Object URLs created for the decrypted model are never revoked.
- `WhatIDo` removes different anonymous functions from the ones it registered, so cleanup does not work.
- The model-loading progress interval is not cleared when the scene unmounts.

React Strict Mode makes several of these easier to trigger during development.

**Recommendation:** retain handler, interval, RAF, timeline, and object-URL references; clean all of them in effect teardown.

### High — incorrect LinkedIn destination

**Evidence:** `src/components/SocialIcons.tsx:21`

The LinkedIn icon links to `https://linkedin.com`, not the owner’s profile.

**Impact:** visitors cannot reach the expected profile, reducing trust and conversion.

**Recommendation:** use the exact public profile URL or remove the icon until it is available.

### Medium — missing semantic page structure

**Evidence:** active components use generic `<div>` containers throughout.

There is no `<main>`, `<nav>`, semantic `<header>`, `<section>` labelling, or `<footer>`. A skip-link style exists in `index.css`, but no skip link is rendered. `initialFX.ts` even searches for a `<main>` element that does not exist.

The “What I Do” heading also nests a `<div>` inside `<h2>`, which is invalid heading content.

**Recommendation:** establish landmarks, add a visible-on-focus “Skip to content” link, label sections, and keep heading markup valid and sequential.

### Medium — no strong above-the-fold action

**Evidence:** `src/components/Landing.tsx`

The hero states the name and “Developer & Engineer” but provides no visible primary action, availability signal, specialty statement, or path to contact/work. Visitors must scroll or use the fixed navigation before they can act.

**Recommendation:** add one primary CTA (“View selected work”) and one secondary CTA (“Contact me” or “Download résumé”), plus a concise value proposition such as the type of products and systems built.

### Medium — contact flow has unnecessary friction

**Evidence:** `src/components/Contact.tsx`

“Get In Touch” offers only GitHub. There is no email address, mail link, contact form, résumé link, or response expectation. `src/services/emailService.ts` exists but is unused.

**Recommendation:** provide at least one direct contact route. An email link plus LinkedIn is sufficient; a form should only be added if it is reliable, protected from spam, and has clear success/error states.

### Medium — portfolio proof is present in data but omitted from the UI

**Evidence:** `src/data/portfolio.ts`, `src/components/Work.tsx:12-31`

Project records contain `status`, `outcome`, `challenge`, `architecture`, and `features`, but cards render only title, role, technologies, and description. This makes the work read like a list of repositories rather than case studies.

**Recommendation:** surface one outcome and one contribution per card, then expose the deeper challenge/architecture/features in a detail page or accessible dialog.

### Medium — project links lack explicit action language

**Evidence:** `src/components/WorkImage.tsx:30-47`

Only the image is linked, with a small arrow overlay. There is no visible “View project”/“View repository” text, and every project opens a new tab.

**Recommendation:** add an explicit text CTA and distinguish “Live demo” from “Source code.” If opening a new tab, communicate that in accessible text.

### Medium — experience order weakens quick recruiter scanning

**Evidence:** `src/data/portfolio.ts:88-112`

The completed TCS role appears before the current role. Most recruiters scan for the current position first.

**Recommendation:** use reverse chronology and make dates, company, role, and 2–3 measurable contributions easy to scan.

### Medium — images are eagerly loaded and oversized

**Evidence:** `src/components/WorkImage.tsx:45`, `public/projects/*`

All six project images load without `loading="lazy"`, `decoding="async"`, responsive `srcset`, or explicit dimensions. Individual JPEGs range up to about 1.07 MB, and the project image set is roughly 3.2 MB.

**Impact:** unnecessary network contention, layout instability risk, and slower mobile rendering.

**Recommendation:** generate AVIF/WebP variants at card-appropriate sizes, set width/height or `aspect-ratio`, lazy-load below-fold images, and reserve eager/high-priority loading only for the actual LCP asset.

### Medium — 3D delivery is expensive for a portfolio

**Evidence:** public asset inventory and build output

Key costs:

- `character.enc`: about 1.54 MB
- `character.glb`: about 1.54 MB fallback copy
- Draco decoder JS + WASM: about 1.01 MB
- HDR environment: about 296 KB
- Largest JS chunk: about 605 KB minified / 157 KB gzip
- Total public assets: about 8.29 MiB

The renderer uses uncapped `window.devicePixelRatio`, antialiasing, and continuous rendering.

**Recommendation:** cap pixel ratio at 1.5–2, render on demand where possible, pause off-screen, provide a static mobile experience, and treat the model as progressive enhancement rather than a loading prerequisite.

### Medium — build quality gate is red

**Evidence:** `npm run lint`

ESLint reports 25 errors and 5 warnings. Beyond style-only `prefer-const` errors, material findings include explicit `any` types, an async Promise executor, effect cleanup risks, and missing hook dependencies.

**Recommendation:** fix lifecycle and hook warnings first, then typing and style issues. Make lint and build mandatory in CI.

### Medium — no automated regression coverage

**Evidence:** `package.json`

No unit, interaction, accessibility, or end-to-end test script is configured.

**Recommendation:** add a small Playwright suite for:

- loader success and asset-failure fallback
- navigation at 320, 768, 1024, and 1440 px
- keyboard access to all interactive elements
- project links and social destinations
- reduced-motion behavior
- no horizontal overflow

Run an automated accessibility scan on the landing page and after interactive states change.

### Low — social and search metadata are incomplete

**Evidence:** `index.html`, `public/robots.txt`

Basic title, description, Open Graph text, Twitter text, favicon, and robots rules exist. Missing items include:

- canonical URL
- `og:url`
- `og:image`
- `twitter:image`
- JSON-LD person/profile data
- sitemap reference

The page declares `summary_large_image` without supplying an image.

**Recommendation:** add a 1200×630 branded social preview and complete metadata after the production URL is known.

### Low — external fonts are a visual/performance dependency

**Evidence:** `index.html:17-19`

Three Google font families are requested. The URL does not request `display=swap`.

**Recommendation:** add `display=swap` or self-host a reduced set of WOFF2 files. Limit weights to those actually used.

### Low — custom cursor targets viewport width, not pointer capability

**Evidence:** `src/components/styles/Cursor.css:26`

The custom cursor activates above 600 px even on touch-first tablets. It also introduces delayed cursor motion, which can feel imprecise.

**Recommendation:** enable it only for `(hover: hover) and (pointer: fine)`, and never replace or obscure the system cursor’s functional feedback.

### Low — loader messaging dilutes positioning

**Evidence:** `src/components/Loading.tsx:53-56`

The loader repeats “Creative Developer” and “Creative Designer,” while the rest of the site positions the owner as a full-stack/systems engineer. The opening experience also delays access without adding useful information.

**Recommendation:** shorten or remove the loader. Keep messaging aligned with the desired role.

## Responsive review checklist

These cases should be visually verified after implementation:

| Viewport | Highest-risk checks |
|---|---|
| 320×568 | Header collision, contact URL clipping, card padding, heading wraps |
| 375×812 | Fixed social icons covering content, 3D GPU cost, project card width |
| 768×1024 | Full nav density, custom cursor on touch hardware, character placement |
| 1024×768 | Breakpoint jump between embedded/fixed character layouts |
| 1280×720 | Fixed header and character overlap at short landscape heights |
| 1440×900 | Scroll-trigger transitions, text/model balance, line lengths |
| 2560×1440 | Max-width behavior and excessive empty space |

Also test 200% browser zoom, keyboard-only navigation, forced colors/high contrast, reduced motion, slow 3G, model request failure, and WebGL disabled.

## Recommended remediation sequence

### Phase 1 — launch blockers

1. Decouple the loader from 3D success and add a static failure fallback.
2. Decide which redesign is canonical and remove/integrate the other system.
3. Add a mobile navigation pattern.
4. Fix contact overflow and the LinkedIn destination.
5. Convert interactive cards to accessible controls.
6. Respect reduced motion and stop animation/render loops correctly.

### Phase 2 — conversion and content

1. Add hero CTAs and a clear specialty/value statement.
2. Add direct email/resume access.
3. Surface project outcomes and contributions.
4. Reorder experience in reverse chronology and quantify achievements.
5. Add explicit project CTA labels.

### Phase 3 — performance and quality

1. Optimize and lazy-load project imagery.
2. Make 3D optional on mobile and cap GPU work.
3. Remove unused CSS and split heavy JavaScript dependencies.
4. Resolve lint errors and add CI checks.
5. Add responsive, keyboard, failure-state, and accessibility tests.
6. Complete social preview and structured metadata.

## Definition of done

The redesign is ready for release when:

- Content remains usable when the model, decoder, fonts, or WebGL fail.
- There is no horizontal overflow from 320 px upward.
- Every action is reachable and understandable by keyboard.
- Reduced-motion visitors receive a stable, non-scrubbed experience.
- Header, contact, work, and career flows pass the listed viewport checks.
- LinkedIn, GitHub, project, email, and résumé destinations are correct.
- Lint and production build both pass.
- Below-fold images are optimized and lazy-loaded.
- One coherent design system is present in both JSX and CSS.
- A browser-based accessibility check reports no serious or critical violations.

