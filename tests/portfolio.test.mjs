import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const main = read("src/components/MainContainer.tsx");
const header = read("src/components/layout/Header.tsx");
const footer = read("src/components/layout/Footer.tsx");
const hero = read("src/components/sections/HeroSection.tsx");
const about = read("src/components/sections/AboutSection.tsx");
const capabilities = read("src/components/sections/CapabilitiesSection.tsx");
const career = read("src/components/sections/CareerSection.tsx");
const work = read("src/components/sections/WorkSection.tsx");
const toolkit = read("src/components/sections/ToolkitSection.tsx");
const contact = read("src/components/sections/ContactSection.tsx");
const reveal = read("src/components/ui/Reveal.tsx");
const sectionHeading = read("src/components/ui/SectionHeading.tsx");
const narrative = read("src/hooks/useScrollNarrative.ts");
const characterStage = read("src/components/layout/CharacterStage.tsx");
const character = read("src/components/Character/PolarBear3DCanvas.tsx");
const characterConfig = read("src/components/Character/characterConfig.ts");
const theme = read("src/hooks/useTheme.ts");
const email = read("src/services/emailService.ts");
const portfolio = read("src/data/portfolio.ts");
const css = read("src/index.css");
const html = read("index.html");

test("the application is composed from dedicated layout and section components", () => {
  for (const component of [
    "Header",
    "HeroSection",
    "AboutSection",
    "CapabilitiesSection",
    "CareerSection",
    "WorkSection",
    "ToolkitSection",
    "ContactSection",
    "Footer",
  ]) {
    assert.match(main, new RegExp(`<${component}`));
  }
  assert.ok(main.split("\n").length < 90, "MainContainer should remain a composition layer");
});

test("all core sections and document landmarks remain present", () => {
  assert.match(main, /<main id="main-content">/);
  assert.match(header, /<header/);
  assert.match(header, /<nav/);
  for (const [source, id] of [
    [hero, "home"],
    [about, "about"],
    [capabilities, "capabilities"],
    [career, "career"],
    [work, "work"],
    [toolkit, "toolkit"],
    [contact, "contact"],
  ]) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
});

test("real portfolio data and destinations are preserved", () => {
  assert.equal([...portfolio.matchAll(/title:\s*['"]/g)].length, 8);
  assert.equal([...portfolio.matchAll(/category:\s*'/g)].length, 5);
  for (const value of [
    "DeutschSpaß",
    "Space Ludo",
    "MuTu",
    "Tata Consultancy Services",
    "Mentor Friends Pvt. Ltd.",
  ]) {
    assert.match(portfolio, new RegExp(value));
  }
  for (const source of [header, hero, contact]) {
    assert.match(source, /github\.com\/i-am-ramprakash/);
  }
  assert.match(contact, /np\.linkedin\.com\/in\/ramprakash-sah-b368a5179/);
});

test("the corrected Ramprakash Sah identity is consistent", () => {
  for (const source of [header, footer, hero, about, html]) {
    assert.match(source, /Ramprakash Sah/);
    assert.doesNotMatch(source, /Ram Prakash Sah/);
  }
});

test("project imagery and social preview imagery are removed", () => {
  assert.doesNotMatch(portfolio, /image:/);
  assert.doesNotMatch(work, /<img|project-image/);
  assert.doesNotMatch(html, /og:image|twitter:image/);
  assert.equal(existsSync(new URL("../public/projects", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/og-image-orange.jpg", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/og-image.jpg", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/favicon.ico", import.meta.url)), false);
});

test("the polar bear uses the minimal section-based FBX library", () => {
  assert.equal(existsSync(new URL("../public/models/polar-bear.glb", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/models/polar-bear-hero.webm", import.meta.url)), false);
  const requiredAssets = [
    "shared/polar-bear-base.fbx",
    "shared/polar-bear-idle-standing-loop.fbx",
    "shared/polar-bear-run-loop.fbx",
    "about/polar-bear-listen-idle-loop.fbx",
    "capabilities/polar-bear-present-right.fbx",
    "career/polar-bear-proud-idle-loop.fbx",
    "work/polar-bear-type-loop.fbx",
    "toolkit/polar-bear-use-tool-loop.fbx",
    "contact/polar-bear-contact-idle-loop.fbx",
    "footer/polar-bear-thank-you-wave.fbx",
  ];
  for (const asset of requiredAssets) {
    assert.ok(existsSync(new URL(`../public/models/${asset}`, import.meta.url)), asset);
    assert.ok(characterConfig.includes(asset), asset);
  }
  assert.doesNotMatch(hero, /PolarBear3DCanvas|HeroCharacterVideo|<video/);
  assert.match(characterStage, /<PolarBear3DCanvas activeSection=\{activeSection\} reducedMotion=\{reducedMotion\}/);
  assert.match(character, /fetch\(assetUrl\(path\), \{ signal: abortController\.signal \}\)/);
  assert.doesNotMatch(character, /\.webm|\.glb/);
});

test("light and dark themes use saved or system preference", () => {
  assert.match(theme, /portfolio-theme/);
  assert.match(theme, /prefers-color-scheme: dark/);
  assert.match(theme, /root\.dataset\.theme = theme/);
  assert.match(theme, /theme-color/);
  assert.match(html, /document\.documentElement\.dataset\.theme = theme/);
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(header, /Switch to light mode/);
  assert.match(header, /Switch to dark mode/);
});

test("the visual system uses solid surfaces without glass or flashy effects", () => {
  assert.doesNotMatch(
    css,
    /background(?:-image)?:\s*(?:linear-gradient|radial-gradient)|page-grain|ambient-glow/,
  );
  assert.match(css, /--accent: #b94710/);
  assert.match(css, /--accent: #e46a2b/);
  assert.match(css, /background: var\(--surface\)/);
});

test("glass is limited to button-like controls", () => {
  assert.match(css, /\.glass-button\s*\{[\s\S]*backdrop-filter: blur\(10px\)/);
  assert.match(hero, /button-primary glass-button/);
  assert.match(hero, /button-secondary glass-button/);
  assert.match(contact, /button-primary glass-button/);
  assert.match(work, /project-card-action glass-button/);
  assert.match(work, /glass-button carousel-control/);
  assert.match(footer, /glass-button footer-button/);
  assert.doesNotMatch(
    css,
    /\.(?:project-carousel|project-stream-card|capability-card|toolkit-card|contact-form-wrap)[^{]*\{[^}]*backdrop-filter/,
  );
  assert.doesNotMatch(header, /<a[^>]*glass-button/);
  assert.doesNotMatch(hero, /<a[^>]*glass-button/);
  assert.doesNotMatch(contact, /<a[^>]*glass-button/);
});

test("section headings and cards reveal with restrained scroll transitions", () => {
  assert.match(reveal, /IntersectionObserver/);
  assert.match(reveal, /observer\.disconnect/);
  assert.match(css, /\.reveal\s*\{/);
  assert.match(css, /translateY\(22px\)/);
  assert.match(css, /--reveal-delay/);
  assert.match(css, /\.section-heading\.is-visible\s*>\s*i/);
  assert.doesNotMatch(css, /bounce|rotate\(.*deg\).*reveal/);
});

test("one reversible narrative engine drives every section", () => {
  for (const [source, effect, side] of [
    [hero, "hero", "center"],
    [about, "about", "right"],
    [capabilities, "capabilities", "left"],
    [career, "career", "right"],
    [work, "work", "left"],
    [toolkit, "toolkit", "right"],
    [contact, "contact", "left"],
  ]) {
    assert.match(source, new RegExp(`data-narrative-effect="${effect}"`));
    assert.match(source, new RegExp(`data-character-side="${side}"`));
  }
  assert.match(narrative, /getBoundingClientRect\(\)/);
  assert.match(narrative, /const enter =/);
  assert.match(narrative, /const exit =/);
  assert.match(narrative, /requestAnimationFrame/);
  assert.match(narrative, /removeEventListener\("scroll"/);
});

test("split headings remain accessible while visual words scrub", () => {
  assert.match(sectionHeading, /aria-label=/);
  assert.match(sectionHeading, /aria-hidden="true"/);
  assert.match(sectionHeading, /data-narrative-word/);
  assert.match(hero, /aria-label="Engineering reliable systems and clear products\."/);
  assert.match(css, /\.split-heading-visual\s*>\s*\[data-narrative-word\]/);
  assert.match(narrative, /--word-opacity/);
  assert.match(narrative, /--word-x/);
});

test("the About section contains no door animation", () => {
  assert.doesNotMatch(about, /door-transition|door-handle|hinge|door-image/);
  assert.doesNotMatch(css, /door-transition|--door-left|--door-right/);
  assert.doesNotMatch(narrative, /--door-left|--door-right/);
});

test("one persistent character stage is prepared for continuous section scenes", () => {
  for (const mapping of [
    /home: "center"/,
    /about: "right"/,
    /capabilities: "left"/,
    /career: "right"/,
    /work: "left"/,
    /toolkit: "right"/,
    /contact: "left"/,
    /footer: "center"/,
  ]) {
    assert.match(characterStage, mapping);
  }
  assert.match(main, /<CharacterStage activeSection=\{activeSection\} reducedMotion=\{reducedMotion\}/);
  assert.doesNotMatch(characterStage, /activeZone|ProceduralCharacter/);
  assert.match(css, /\.character-stage\s*\{[\s\S]*position: fixed;[\s\S]*pointer-events: none/);
  assert.match(css, /\.character-canvas,[\s\S]*\.character-canvas-host/);
  assert.doesNotMatch(css, /\.character-stage-reserved/);
});

test("the character uses one cancellable run transition and one animation per section", () => {
  assert.match(characterConfig, /SECTION_SCENES/);
  assert.match(characterConfig, /about: \{ clip: "listenIdle"/);
  assert.match(characterConfig, /capabilities: \{ clip: "presentRight"/);
  assert.match(characterConfig, /career: \{ clip: "proudIdle"/);
  assert.match(characterConfig, /work: \{ clip: "typeLoop"/);
  assert.match(characterConfig, /toolkit: \{ clip: "useToolLoop"/);
  assert.match(characterConfig, /contact: \{ clip: "contactIdle"/);
  assert.match(characterConfig, /footer: \{ clip: "thankYouWave"/);
  assert.match(characterConfig, /CORE_CLIPS: ClipKey\[\] = \["idleStanding", "runLoop"\]/);
  assert.match(character, /const requestSection/);
  assert.match(character, /const cancelSequence/);
  assert.match(character, /mixer\.addEventListener\("finished"/);
  assert.match(character, /const runSectionTransition/);
  assert.match(character, /playLoop\("runLoop"/);
  assert.match(character, /scrollStartY/);
  assert.match(character, /Math\.abs\(window\.scrollY - motion\.scrollStartY\)/);
  assert.doesNotMatch(character, /runHeroAwake|runHeroSleep|walkStart|jumpForward|lieDown/);
});

test("the hero model is positioned before display without waiting for the run clip", () => {
  assert.match(character, /home: \{[\s\S]*scale: 2\.50[\s\S]*rotation: -0\.34/);
  assert.match(character, /wrapper\.visible = false/);
  assert.match(character, /await ensureClips\(clipsForSection\(activeSectionRef\.current\)\)/);
  assert.match(character, /applyTransform\(resolveSectionAnchor\(currentSection\), 1\)/);
  assert.match(character, /await playSectionAnimation\(currentSection, token, 0\);[\s\S]*mixer\.update\(0\);[\s\S]*wrapper\.visible = true/);
  assert.match(character, /wrapper\.visible = true/);
  assert.doesNotMatch(css, /character-loading-pulse|character-canvas-loading::after/);
});

test("the character stage uses a restrained signature loader without a progress counter", () => {
  assert.match(character, /className="character-signature-loader"/);
  assert.match(character, /signature-loader-glasses/);
  assert.match(character, /signature-loader-scarf/);
  assert.match(character, /signature-loader-outline/);
  assert.match(character, /The engineer is getting ready\./);
  assert.match(css, /\.character-signature-loader\s*\{[\s\S]*position: absolute;[\s\S]*left: 77%/);
  assert.match(css, /\.character-canvas-loading \.character-signature-loader/);
  assert.match(css, /stroke-width: 7;[\s\S]*stroke-dasharray: 42 58/);
  assert.match(css, /@keyframes signature-loader-progress/);
  assert.match(css, /animation: signature-loader-copy 3s steps\(30, end\) infinite/);
  assert.match(css, /@keyframes signature-loader-copy/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*\.character-signature-loader-line/);
  assert.doesNotMatch(character, /character-loading-progress|loading-percentage/);
  assert.doesNotMatch(character, /signature-loader-frame/);
  assert.match(character, /groundShadow\.visible = false;[\s\S]*scene\.add\(groundShadow\)/);
});

test("adjacent character handoffs wait until the next section reaches the header", () => {
  assert.match(character, /const resolveHeroScrollAnchor/);
  assert.match(character, /heroScroll = THREE\.MathUtils\.clamp\(-heroRect\.top, 0, heroRect\.height\)/);
  assert.match(character, /anchor\.position\.y \+= \(heroScroll \/ Math\.max\(viewportHeight, 1\)\) \* visibleHeight/);
  assert.match(character, /const syncSectionToScroll/);
  assert.match(character, /const configureSectionClip/);
  assert.match(character, /renderer\.setScissorTest\(true\)/);
  assert.match(character, /const nextSection = SECTION_ORDER\[requestedIndex \+ 1\]/);
  assert.match(character, /nextElement\.getBoundingClientRect\(\)\.top <= characterStageTop \+ 24/);
  assert.match(character, /Math\.abs\(requestedIndex - incomingIndex\) === 1/);
  assert.match(character, /window\.addEventListener\("scroll", handleSectionBoundaryScroll/);
  assert.match(character, /window\.removeEventListener\("scroll", handleSectionBoundaryScroll\)/);
});

test("the full-body About bear runs in immediately from the right at its reveal boundary", () => {
  assert.match(character, /about: \{[\s\S]*x: 0\.34,[\s\S]*y: -0\.02,[\s\S]*scale: 1\.14,[\s\S]*rotation: -0\.82/);
  assert.match(character, /const switchingBetweenAdjacentSections/);
  assert.match(character, /!switchingBetweenAdjacentSections &&[\s\S]*tweenTo\(exitAnchor/);
  assert.match(character, /applyTransform\(entryAnchor, 0\)[\s\S]*tweenTo\(target, 1/);
});

test("each character returns only after its current section leaves the viewport", () => {
  assert.match(character, /currentElement\.getBoundingClientRect\(\)\.top >= window\.innerHeight/);
  assert.match(character, /requestSection\(SECTION_ORDER\[requestedIndex - 1\]\)/);
  assert.match(character, /Math\.abs\(currentIndex - targetIndex\) === 1\) setCharacterOpacity\(0\)/);
});

test("every non-Hero bear stays centered while scrolling with its owning section", () => {
  assert.match(character, /const resolveNarrativeScrollAnchor = \(section: CharacterSection\)/);
  assert.match(character, /querySelectorAll<HTMLElement>\("\[data-character-anchor\]"\)/);
  assert.match(character, /const contentTop = contentRects\.length/);
  assert.match(character, /const contentBottom = contentRects\.length/);
  assert.match(character, /const sectionCenter = \(contentTop \+ contentBottom\) \/ 2/);
  assert.match(character, /const stageCenter = canvasRect\.top \+ viewportHeight \/ 2/);
  assert.match(character, /const sectionCenterOffset = sectionCenter - stageCenter/);
  assert.match(character, /sectionCenterOffset \/ Math\.max\(viewportHeight, 1\)/);
  assert.match(character, /if \(section === "home" && viewportWidth > 820\) return resolveHeroScrollAnchor\(\)/);
  assert.match(character, /return resolveNarrativeScrollAnchor\(section\)/);
  assert.match(character, /applyTransform\(resolveSectionAnchor\(requestedSection\), 1\)/);
});

test("all post-Hero sections use the same full-body character size", () => {
  for (const section of ["about", "capabilities", "career", "work", "toolkit", "contact", "footer"]) {
    assert.match(character, new RegExp(`${section}: \\{[\\s\\S]*?scale: 1\\.14`));
  }
  assert.match(character, /capabilities: \{[\s\S]*rotation: 0\.82/);
  assert.match(character, /career: \{[\s\S]*rotation: -0\.82/);
});

test("section text lanes use the available space without crowding the bear", () => {
  assert.match(css, /\.narrative-section\[data-character-side="right"\]\s*>\s*\*\s*\{[\s\S]*width: 68%/);
  assert.match(css, /\.narrative-section\[data-character-side="left"\]\s*>\s*\*\s*\{[\s\S]*width: 68%/);
});

test("character anchors follow each section's actual data area", () => {
  assert.match(about, /className="about-grid" data-character-anchor/);
  assert.match(about, /className="fact-grid" data-character-anchor/);
  assert.match(capabilities, /className="capability-grid" data-character-anchor/);
  assert.match(career, /className="career-list" data-character-anchor/);
  assert.match(work, /characterAnchor/);
  assert.match(toolkit, /className="toolkit-grid" data-character-anchor/);
  assert.match(contact, /className="contact-grid" data-character-anchor/);
  assert.match(reveal, /data-character-anchor=\{characterAnchor \? "" : undefined\}/);
});

test("mobile sections use movable circular character viewports without changing desktop anchors", () => {
  for (const source of [hero, about, capabilities, career, work, toolkit, contact, footer]) {
    assert.match(source, /className="mobile-character-slot[^"]*"[\s\S]*data-mobile-character-anchor/);
  }
  assert.match(character, /viewportWidth <= 820[\s\S]*querySelector<HTMLElement>\("\[data-mobile-character-anchor\]"\)/);
  assert.match(character, /mobileAnchor[\s\S]*\[mobileAnchor\][\s\S]*querySelectorAll<HTMLElement>\("\[data-character-anchor\]"\)/);
  assert.match(css, /\.mobile-character-slot\s*\{\s*display: none/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*\.mobile-character-slot\s*\{[\s\S]*display: block/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*\.character-stage\s*\{[\s\S]*clip-path: circle/);
  assert.match(css, /\.character-stage::after\s*\{[\s\S]*border: 3px solid var\(--accent\)[\s\S]*border-radius: 50%/);
  assert.match(css, /\.narrative-section\[data-character-side="left"\] > \.mobile-character-slot,[\s\S]*\.narrative-section\[data-character-side="right"\] > \.mobile-character-slot\s*\{[\s\S]*min\(42vw, 42vh\)/);
  assert.match(character, /syncMobileCharacterViewport[\s\S]*--mobile-character-x[\s\S]*--mobile-character-y[\s\S]*--mobile-character-radius/);
  assert.match(character, /resolveViewportSection[\s\S]*window\.innerHeight \* 0\.46/);
  assert.match(character, /requestedSection = resolveViewportSection\(\)[\s\S]*syncMobileCharacterViewport\(\)/);
  assert.match(character, /headBone = modelRoot\.getObjectByName\("mixamorigHead"\)/);
  assert.match(character, /frameCompactCharacterPortrait[\s\S]*desiredScreenY = slotRect\.top \+ slotRect\.height \* 0\.3[\s\S]*headBone\.getWorldPosition/);
  assert.match(character, /syncSectionToScroll\(\);[\s\S]*frameCompactCharacterPortrait\(\);[\s\S]*syncMobileCharacterViewport\(\)/);
  assert.match(character, /if \(viewportWidth <= 820\) \{[\s\S]*applyTransform\(resolveSectionAnchor\(section\), 1\)[\s\S]*playSectionAnimation\(section, token\)/);
  assert.match(character, /const visibleSection = resolveViewportSection\(\)[\s\S]*visibleSection !== requestedSection/);
  assert.match(character, /section === "home" && viewportWidth > 820/);
  assert.match(character, /viewportWidth <= 359[\s\S]*section === "home" \? 0\.64[\s\S]*viewportWidth <= 420[\s\S]*section === "home" \? 0\.7/);
});

test("the Work typing scene includes a synchronized orange-and-white workstation", () => {
  assert.match(character, /const createWorkstation/);
  assert.match(character, /group\.name = "workstation"/);
  assert.match(character, /const orange = createMaterial\(0xe46a2b/);
  assert.match(character, /const white = createMaterial\(0xf5f5f3/);
  assert.match(character, /const dark = createMaterial\(0x171717/);
  assert.match(character, /Chair: a visible tall back and angled orange seat/);
  assert.match(character, /const chair = new THREE\.Group\(\)/);
  assert.match(character, /chair\.rotation\.y = 0\.0/);
  assert.match(character, /\[1\.82, 0\.22, 1\.32\], \[0\.0, -1\.72, 0\.0\], orange/);
  assert.match(character, /const chairLegPositions:[\s\S]*chairLegPositions\.forEach/);
  assert.match(character, /const desk = new THREE\.Group\(\)/);
  assert.match(character, /desk\.position\.set\(0\.0, -0\.72, 1\.42\)/);
  assert.match(character, /desk\.rotation\.y = 0\.0/);
  assert.match(character, /\[3\.0, 0\.18, 1\.52\], \[0\.0, 0\.0, 0\.0\], orange/);
  assert.match(character, /const deskLegPositions:[\s\S]*deskLegPositions\.forEach/);
  assert.match(character, /const laptop = new THREE\.Group\(\)/);
  assert.match(character, /Laptop base \(keyboard deck\)/);
  assert.match(character, /\[1\.72, 0\.10, 1\.12\], \[0\.0, 0\.0, 0\.0\], white/);
  assert.match(character, /Screen lid.*tilted back/);
  assert.match(character, /\[1\.68, 1\.08, 0\.06\].*orange/);
  assert.match(character, /workstation\.visible = requestedSection === "work"/);
  assert.match(character, /workstation\.position\.copy\(anchor\.position\)/);
  assert.match(character, /workstation\.rotation\.y = anchor\.rotation/);
  assert.match(character, /if \(workstation\) disposeObject\(workstation\)/);
});

test("the project stream leaves a dedicated workstation lane", () => {
  assert.match(css, /\.work-section \.project-carousel\s*\{[\s\S]*width: 62%;[\s\S]*margin-left: auto/);
});

test("adjacent sections use compact shared vertical spacing", () => {
  assert.match(css, /\.content-section\s*\{[\s\S]*padding: clamp\(72px, 7vw, 108px\) 0/);
});

test("the hero capability strip stays in the left content column away from the model", () => {
  assert.match(css, /\.hero-copy,[\s\S]*\.hero-aside\s*\{[\s\S]*grid-column: 1/);
  assert.match(css, /\.hero-aside\s*\{[\s\S]*grid-template-columns: minmax\(120px, 0\.24fr\) minmax\(0, 1fr\)/);
  assert.match(css, /\.hero-aside ul\s*\{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /\.hero-aside\s*\{[^}]*margin-bottom: -140px/);
});

test("short desktop viewports keep the complete hero content visible", () => {
  assert.match(css, /@media \(min-width: 1081px\) and \(max-height: 900px\)/);
  assert.match(css, /\.hero-section\s*\{[\s\S]*padding-top: 32px;[\s\S]*padding-bottom: 40px/);
  assert.doesNotMatch(css, /\.hero-grid\s*\{[^}]*translateY\(-54px\)/);
  assert.match(css, /font-size: clamp\(52px, 5\.8vw, 88px\)/);
  assert.match(css, /\.hero-aside\s*>\s*span,[\s\S]*\.hero-aside li\s*\{[\s\S]*padding: 14px 0/);
});

test("Hero and About meet without oversized transition spacing", () => {
  assert.match(css, /\.about-section\s*\{[\s\S]*padding-top: clamp\(72px, 6vw, 96px\)/);
});

test("run root motion and section playback speeds are restrained", () => {
  assert.match(characterConfig, /runLoop:[\s\S]*neutralizeHorizontalRootMotion: true/);
  assert.match(characterConfig, /presentRight:[\s\S]*desiredDuration: 1\.8/);
  assert.match(characterConfig, /thankYouWave:[\s\S]*desiredDuration: 1\.8/);
  assert.match(character, /const normalizeClip/);
  assert.match(character, /driftX \* progress/);
  assert.match(character, /driftZ \* progress/);
  assert.match(character, /clamp\(playbackRate, 0\.72, 1\.6\)/);
});

test("the character renderer cleans up asynchronous and WebGL resources", () => {
  assert.match(character, /const abortController = new AbortController\(\)/);
  assert.match(character, /abortController\.abort\(\)/);
  assert.match(character, /window\.cancelAnimationFrame\(frameId\)/);
  assert.match(character, /mixer\?\.stopAllAction\(\)/);
  assert.match(character, /disposeObject\(modelRoot\)/);
  assert.match(character, /renderer\?\.dispose\(\)/);
  assert.match(character, /renderer\?\.forceContextLoss\(\)/);
  assert.match(character, /setLoadState\("failed"\)/);
});

test("reserved character lanes preserve enough width for long section headings", () => {
  assert.match(
    css,
    /\.narrative-section\[data-character-side="left"\] \.section-heading,[\s\S]*grid-template-columns: minmax\(96px, 0\.22fr\) minmax\(0, 1fr\)/,
  );
  assert.match(
    css,
    /\.narrative-section\[data-character-side="left"\] \.section-description,[\s\S]*grid-column: 2/,
  );
  assert.match(css, /\.toolkit-section \.section-heading h2\s*\{[\s\S]*word-break: normal/);
});

test("solid tilted orange cards identify primary text without effects", () => {
  for (const phrase of [
    "clear products.",
    "made clear.",
    "into products.",
    "in the real world.",
    "engineering depth.",
    "for the problem.",
    "or problem?",
  ]) {
    assert.match(
      `${hero}\n${about}\n${capabilities}\n${career}\n${work}\n${toolkit}\n${contact}`,
      new RegExp(phrase.replace(/[.?]/g, "\\$&")),
    );
  }
  assert.match(header, /identity-card-text">Ramprakash Sah/);
  assert.match(header, /tilted-card-text nav-card-text/);
  assert.match(footer, /identity-card-text">Ramprakash Sah/);
  assert.match(css, /\.tilted-card-text::before\s*\{[\s\S]*background: var\(--accent\)/);
  assert.match(css, /transform: rotate\(-1\.5deg\)/);
  assert.doesNotMatch(css, /\.tilted-card-text[\s\S]{0,500}(?:filter|box-shadow|opacity|gradient)/);
  assert.doesNotMatch(css, /\.primary-navigation button::after/);
});

test("footer identity keeps its subtitle below the tilted name card", () => {
  assert.match(css, /\.footer-identity\s*\{[\s\S]*justify-items: start;[\s\S]*gap: 10px/);
  assert.match(css, /\.footer-identity b\s*\{[\s\S]*width: fit-content/);
  assert.match(css, /\.footer-identity span\s*\{[\s\S]*z-index: 1;[\s\S]*display: block/);
});

test("cards use a consistent soft-corner system without duplicated section lines", () => {
  assert.match(css, /--radius-large: 18px/);
  assert.match(css, /--radius-card: 14px/);
  assert.match(css, /--radius-control: 8px/);
  assert.match(css, /--radius-tag: 6px/);
  assert.match(css, /\.content-section\s*\{[^}]*padding:[^}]*\}/);
  assert.doesNotMatch(css, /\.content-section\s*\{[^}]*border-top/);
  assert.match(css, /\.fact-grid\s*\{[\s\S]*gap: 14px/);
  assert.doesNotMatch(css, /\.fact-grid\s*\{[^}]*(?:border-top|border-bottom)/);
  assert.match(
    css,
    /\.career-card\s*\{[\s\S]*border-left: 4px solid var\(--accent\);[\s\S]*border-radius: var\(--radius-card\)/,
  );
  assert.doesNotMatch(css, /\.career-card:last-child/);
});

test("reduced motion disables reveal movement and smooth scrolling", () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.reveal\s*\{[\s\S]*opacity: 1;[\s\S]*transform: none/);
  assert.match(main, /behavior: reducedMotion \? "auto" : "smooth"/);
});

test("mobile navigation exposes state and keyboard handling", () => {
  assert.match(header, /aria-expanded=\{navOpen\}/);
  assert.match(header, /aria-controls="primary-navigation"/);
  assert.match(header, /event\.key === "Escape"/);
  assert.match(header, /event\.key !== "Tab"/);
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /\.primary-navigation\.is-open/);
});

test("contact form preserves delivery while adding timeout and accessible feedback", () => {
  assert.match(contact, /<form className="contact-form"/);
  assert.match(contact, /aria-busy=\{formState === "sending"\}/);
  assert.match(contact, /aria-live="polite"/);
  assert.match(contact, /minLength=\{20\}/);
  assert.match(contact, /maxLength=\{1000\}/);
  assert.match(email, /formspree\.io\/f\/xqalzwbz/);
  assert.match(email, /AbortController/);
  assert.match(email, /12000/);
  assert.match(email, /clearTimeout/);
});

test("semantic cards render complete project and experience data", () => {
  assert.match(work, /projects\.map/);
  assert.doesNotMatch(work, /project-card-featured/);
  assert.match(work, /selectedProject\.outcome/);
  assert.match(work, /selectedProject\.challenge/);
  assert.match(work, /selectedProject\.architecture/);
  assert.match(work, /selectedProject\.features\.map/);
  assert.match(career, /\[\.\.\.experiences\]\.reverse\(\)\.map/);
  assert.match(career, /experience\.responsibilities\.map/);
  assert.match(career, /experience\.technologies\.map/);
});

test("project stream loops slowly and pauses for every interaction mode", () => {
  assert.match(work, /project-carousel-track/);
  assert.match(work, /project-carousel-group-clone/);
  assert.match(work, /aria-hidden="true"/);
  assert.match(work, /manualPaused/);
  assert.match(work, /interactionPaused/);
  assert.match(work, /onPointerDown=\{pauseForInteraction\}/);
  assert.match(work, /onPointerUp=\{resumeAfterInteraction\}/);
  assert.match(css, /animation: project-stream-right 72s linear infinite/);
  assert.match(css, /\.project-carousel-viewport:hover \.project-carousel-track/);
  assert.match(css, /\.project-carousel-viewport:focus-within \.project-carousel-track/);
  assert.match(css, /\.project-carousel\.is-reduced \.project-carousel-track/);
});

test("carousel uses compact cards, soft edge masking, and a static detail panel", () => {
  assert.match(css, /mask-image: linear-gradient/);
  assert.match(css, /\.project-stream-card\s*\{[\s\S]*min-height: 410px/);
  assert.match(work, /technologies\.slice\(0, 4\)/);
  assert.match(work, /selectedProject/);
  assert.match(work, /className="project-detail-panel"/);
  assert.match(work, /View repository/);
});

test("responsive safeguards cover desktop, tablet, mobile, and wrapping", () => {
  for (const breakpoint of ["1080px", "820px", "620px"]) {
    assert.match(css, new RegExp(`@media \\(max-width: ${breakpoint}\\)`));
  }
  assert.match(css, /min-width: 320px/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /flex-wrap: wrap/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*--header-height: 64px/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*\.hero-copy\s*\{[\s\S]*padding-bottom: 0/);
  assert.match(css, /@media \(max-width: 820px\)[\s\S]*\.character-signature-loader\s*\{[\s\S]*left: var\(--mobile-character-x, 50%\)/);
  assert.match(character, /mobileX: -0\.12,[\s\S]*mobileY: -0\.27,[\s\S]*mobileScale: 0\.92,[\s\S]*mobileRotation: -0\.08/);
  assert.match(character, /viewportWidth <= 359[\s\S]*section === "home" \? 0\.64[\s\S]*viewportWidth <= 420[\s\S]*section === "home" \? 0\.7/);
});

test("metadata and typography reflect the redesigned system", () => {
  assert.match(html, /Manrope/);
  assert.match(html, /Inter/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
  assert.match(css, /font-family: Manrope/);
  assert.match(css, /font-family: Inter/);
});
