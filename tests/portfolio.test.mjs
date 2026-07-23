import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const app = read("src/components/MainContainer.tsx");
const character = read("src/components/Character/ProceduralCharacter.tsx");
const css = read("src/index.css");
const html = read("index.html");
const portfolio = read("src/data/portfolio.ts");

test("page exposes core landmarks, sections, and a skip link", () => {
  for (const marker of ["<header", "<nav", "<main", "<section", "<footer", "skip-link"]) {
    assert.match(app, new RegExp(marker));
  }
  for (const section of ["home", "about", "capabilities", "career", "work", "toolkit", "contact"]) {
    assert.match(app, new RegExp(`id="${section}"`));
  }
});

test("primary interactions expose accessible state and feedback", () => {
  assert.match(app, /aria-expanded=\{navOpen\}/);
  assert.match(app, /aria-expanded=\{expanded\}/);
  assert.match(app, /aria-controls=\{`service-panel-/);
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /prefers-reduced-motion: reduce/);
});

test("original procedural character supports every page zone", () => {
  for (const zone of ["hero", "about", "capabilities", "career", "work", "toolkit", "contact"]) {
    assert.match(character, new RegExp(`${zone}: \\{`));
    assert.match(app, new RegExp(`data-character-zone="${zone}"`));
  }
  assert.match(character, /new THREE\.WebGLRenderer/);
  assert.match(character, /new THREE\.BoxGeometry/);
  assert.match(character, /window\.cancelAnimationFrame/);
  assert.match(character, /renderer\.dispose\(\)/);
  assert.match(character, /webglcontextlost/);
  assert.doesNotMatch(character, /\.glb|GLTFLoader|\/models\//);
});

test("character gaze is relative to its projected head position", () => {
  assert.match(character, /head\.getWorldPosition\(projectedHead\)/);
  assert.match(character, /projectedHead\.project\(camera\)/);
  assert.match(character, /const gazeDeltaX = pointer\.x - projectedHead\.x/);
  assert.match(character, /pointerTrackingWeight = THREE\.MathUtils\.damp/);
  assert.match(character, /pupilTarget\.length\(\) > 0\.038/);
  assert.match(character, /about:\s*\{\s*x:\s*-0\.22/);
  assert.match(character, /capabilities:\s*\{\s*x:\s*0\.24/);
  assert.match(character, /work:\s*\{\s*x:\s*-0\.24/);
  assert.match(character, /toolkit:\s*\{\s*x:\s*0\.15/);
});

test("pointer input is frame-smoothed and joints remain physically bounded", () => {
  assert.match(character, /pointerTarget\.set\(nx, ny\)/);
  assert.match(character, /pointer\.lerp\(pointerTarget/);
  assert.doesNotMatch(character, /kick\(sp\.(?:l|r)(?:Shoulder|Elbow|Wrist|Leg)/);
  assert.match(character, /clamp\(rawDelta,\s*-50,\s*50\)/);
  assert.match(character, /springClamped/);
  assert.match(character, /scrollVelocity \+ delta \* 0\.002/);
  assert.match(character, /shoulder\.quaternion\.slerp/);
  assert.match(character, /elbow\.rotation\.z = THREE\.MathUtils\.clamp/);
  assert.match(character, /wrist\.rotation\.z = THREE\.MathUtils\.clamp/);
});

test("reduced motion clears accumulated physical energy", () => {
  assert.match(character, /if \(!motion\) \{/);
  assert.match(character, /Object\.values\(sp\)\.forEach/);
  assert.match(character, /springState\.pos = 0/);
  assert.match(character, /springState\.vel = 0/);
  assert.match(character, /const travelEffect = motion && phase === "traveling"/);
});

test("section travel preserves velocity and blends gestures with smootherstep", () => {
  assert.match(character, /transitionPhaseRef/);
  assert.match(character, /const smoothDampValue/);
  assert.match(character, /phase === "neutral"/);
  assert.match(character, /phase === "traveling" && timeSinceEntry >= 850/);
  assert.match(character, /gestureProgress \* 6 - 15/);
  assert.match(character, /rootMotion\.x/);
  assert.match(character, /rootMotion\.y/);
  assert.match(character, /rootMotion\.scale/);
  assert.match(character, /rootMotion\.rotation/);
  assert.doesNotMatch(character, /transitionStartX|transitionStartY|transitionStartScale/);
  assert.match(app, /data-character-zone="toolkit"/);
  assert.match(app, /activationLine/);
  assert.match(app, /candidateScore \+ 32 < activeScore/);
});

test("camera framing and section safe regions fit the complete model", () => {
  assert.match(character, /const modelBounds = new THREE\.Box3/);
  assert.match(character, /const getFittedFrame/);
  assert.match(character, /navbarSafeBottom \+ 60/);
  assert.match(character, /viewportHeight - 32/);
  assert.match(character, /zone === "work"/);
  assert.match(character, /zone === "toolkit"/);
  assert.match(character, /root\.scale\.setScalar\(initialScale\)/);
});

test("pointing and waving use complete target-aware arm mechanics", () => {
  for (const zone of ["about", "capabilities", "career", "work", "toolkit", "contact"]) {
    assert.match(app, new RegExp(`data-character-target="${zone}"`));
  }
  assert.match(character, /const solvePointingPose/);
  assert.match(character, /getBoundingClientRect\(\)/);
  assert.match(character, /screenPointToRoot/);
  assert.match(character, /rightShoulderTarget = 1\.68/);
  assert.match(character, /rightElbowTarget = 1\.05 \+ wave \* 0\.07/);
  assert.match(character, /rightForearmTwist = 1\.28/);
  assert.match(character, /const heroWaveTime = timeSinceEntry/);
  assert.match(character, /const gestureDuration/);
  assert.match(character, /const gestureActive/);
  assert.match(character, /const celebrationWaveActive/);
  const wavingHandRise =
    -1.02 * Math.cos(1.68) - 0.88 * Math.cos(1.68 + 1.05);
  assert.ok(wavingHandRise > 0.8, "The waving hand must remain above its shoulder");
});

test("renderer quality adapts without shadowing every decorative mesh", () => {
  assert.match(character, /const qualityDpr = \[1, 1\.15, 1\.5\]/);
  assert.match(character, /averageFps < 52/);
  assert.match(character, /object\.userData\.majorShadow/);
  assert.match(character, /mesh\.castShadow = false/);
  assert.match(character, /new THREE\.MeshStandardMaterial/);
});

test("first load renders one silver robot with ready-relative wave timing", () => {
  assert.doesNotMatch(app, /Suspense|character-loading|character-fallback/);
  assert.doesNotMatch(app, /lazy\(\(\) => import/);
  assert.match(character, /color: 0x929ba4/);
  assert.match(character, /color: 0xd7dde2/);
  assert.match(character, /zoneEntryTimeRef\.current = performance\.now\(\);\s*render\(\)/);
  assert.match(character, /heroWaveTime >= 250 && heroWaveTime < 3600/);
});

test("character motion can rest, pause, and acknowledge a successful contact", () => {
  assert.match(app, /aria-label=\{characterPaused \? "Resume character animation"/);
  assert.match(app, /aria-pressed=\{characterPaused\}/);
  assert.match(app, /setCharacterSignal\(\(signal\) => signal \+ 1\)/);
  assert.match(character, /motionPausedRef/);
  assert.match(character, /celebrationTimeRef/);
  assert.match(character, /1000 \/ 30/);
  assert.match(character, /1000 \/ 12/);
  assert.match(character, /gestureEntryBlend \* exitProgress/);
  assert.match(character, /window\.innerWidth < 900/);
});

test("navigation exposes toolkit, progress, current state, and mobile keyboard handling", () => {
  assert.match(app, /\{ id: "toolkit", label: "Toolkit" \}/);
  assert.match(app, /className="page-progress"/);
  assert.match(app, /aria-current=\{activeZone === item\.id \? "page"/);
  assert.match(app, /event\.key === "Escape"/);
  assert.match(app, /event\.key !== "Tab"/);
  assert.match(app, /aria-controls="primary-navigation"/);
  assert.match(css, /\.site-nav\.nav-open/);
});

test("contact feedback resets on editing and submit state is announced", () => {
  assert.match(app, /const updateFormField/);
  assert.match(app, /setFormState\("idle"\)/);
  assert.match(app, /aria-busy=\{formState === "sending"\}/);
  assert.match(app, /<span>View case study<\/span>/);
});

test("contact and professional links use portfolio owner data", () => {
  assert.match(app, /<form className="contact-form"/);
  assert.match(app, /sendEmail\(formData\)/);
  assert.match(app, /github\.com\/i-am-ramprakash/);
  assert.match(app, /np\.linkedin\.com\/in\/ramprakash-sah-b368a5179/);
});

test("project media is optimized and deferred", () => {
  const imagePaths = [...portfolio.matchAll(/image:\s*'([^']+)'/g)].map((match) => match[1]);
  assert.equal(imagePaths.length, 6);
  for (const imagePath of imagePaths) {
    assert.match(imagePath, /\.webp$/);
    assert.ok(
      existsSync(new URL(`../public${imagePath}`, import.meta.url)),
      `Missing project image: ${imagePath}`,
    );
  }
  assert.match(app, /loading="lazy"/);
  assert.match(app, /decoding="async"/);
});

test("responsive, pointer, and reduced-motion safeguards remain present", () => {
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /overflow-wrap: anywhere/);
});

test("editorial section redesign preserves data while reducing visual weight", () => {
  assert.match(app, /className="about-layout reveal-card"/);
  assert.match(app, /className="capabilities-content"/);
  assert.match(app, /className="career-marker"/);
  assert.match(app, /className=\{`project-card \$\{index === 0 \? "project-featured" : ""\}`\}/);
  assert.match(app, /digitalSkills\.map/);
  assert.match(app, /experience\.responsibilities\.map/);
  assert.doesNotMatch(app, /experience\.responsibilities\.slice/);
  assert.doesNotMatch(app, /tech-marquee/);
  assert.match(css, /\.project-list\s*\{[\s\S]*grid-template-columns: repeat\(2/);
  assert.match(css, /\.project-featured\s*\{[\s\S]*width: min\(66%, 940px\)/);
  assert.doesNotMatch(css, /min-height:\s*570px/);
});

test("social sharing metadata and attribution are present", () => {
  assert.match(html, /property="og:image" content="\/og-image-orange\.jpg"/);
  assert.match(html, /name="twitter:image" content="\/og-image-orange\.jpg"/);
  assert.ok(existsSync(new URL("../public/og-image-orange.jpg", import.meta.url)));
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /name="robots" content="index, follow, max-image-preview:large"/);
  assert.match(app, /Interaction direction inspired by/);
  assert.match(app, /Moncy Yohannan/);
});
