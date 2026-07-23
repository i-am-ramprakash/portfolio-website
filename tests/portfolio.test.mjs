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
  for (const section of ["home", "about", "capabilities", "career", "work", "contact"]) {
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

test("section changes use deterministic neutral, travel, and gesture phases", () => {
  assert.match(character, /transitionPhaseRef/);
  assert.match(character, /phase === "neutral" && timeSinceEntry >= 60/);
  assert.match(character, /phase === "traveling" && timeSinceEntry >= 500/);
  assert.match(character, /gestureProgress \* gestureProgress \* \(3 - 2 \* gestureProgress\)/);
  assert.match(character, /MathUtils\.lerp\(transitionStartX,\s*targetX/);
  assert.match(app, /data-character-zone="toolkit"/);
  assert.match(app, /activationLine/);
  assert.match(app, /candidateScore \+ 32 < activeScore/);
});

test("camera framing and section safe regions fit the complete model", () => {
  assert.match(character, /const modelBounds = new THREE\.Box3/);
  assert.match(character, /const getFittedFrame/);
  assert.match(character, /navbarSafeBottom \+ 24/);
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
  assert.match(character, /rightElbowTarget = 1\.05/);
  assert.match(character, /rightForearmTwist = 1\.3/);
  assert.match(character, /timeSinceEntry - 250/);
});

test("renderer quality adapts without shadowing every decorative mesh", () => {
  assert.match(character, /const qualityDpr = \[1, 1\.15, 1\.5\]/);
  assert.match(character, /averageFps < 52/);
  assert.match(character, /object\.userData\.majorShadow/);
  assert.match(character, /mesh\.castShadow = false/);
  assert.match(character, /new THREE\.MeshStandardMaterial/);
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
  assert.match(css, /\.reduced-motion \.tech-marquee/);
  assert.match(css, /overflow-wrap: anywhere/);
});

test("social sharing metadata and attribution are present", () => {
  assert.match(html, /property="og:image" content="\/og-image-orange\.jpg"/);
  assert.match(html, /name="twitter:image" content="\/og-image-orange\.jpg"/);
  assert.ok(existsSync(new URL("../public/og-image-orange.jpg", import.meta.url)));
  assert.match(html, /application\/ld\+json/);
  assert.match(app, /Interaction direction inspired by/);
  assert.match(app, /Moncy Yohannan/);
});
