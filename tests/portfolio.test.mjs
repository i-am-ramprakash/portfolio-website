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

test("character gaze follows the pointer and section focal direction", () => {
  assert.match(character, /\? pointer\.x \* 0\.36/);
  assert.match(character, /\? pointer\.x \* 0\.025/);
  assert.match(character, /about:\s*\{\s*x:\s*-0\.22/);
  assert.match(character, /capabilities:\s*\{\s*x:\s*0\.24/);
  assert.match(character, /work:\s*\{\s*x:\s*-0\.24/);
  assert.match(character, /toolkit:\s*\{\s*x:\s*0\.15/);
});

test("character impulses and joints remain physically bounded", () => {
  assert.match(character, /Math\.min\(speed \* 6,\s*0\.8\)/);
  assert.match(character, /clamp\(rawDelta,\s*-50,\s*50\)/);
  assert.match(character, /springClamped/);
  assert.match(character, /scrollVelocity \+ delta \* 0\.002/);
  assert.match(character, /shoulder\.rotation\.z = THREE\.MathUtils\.clamp/);
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
  assert.match(character, /phase === "neutral" && timeSinceEntry >= 280/);
  assert.match(character, /phase === "traveling" && timeSinceEntry >= 700/);
  assert.match(character, /MathUtils\.lerp\(transitionStartX,\s*targetX/);
  assert.match(app, /data-character-zone="toolkit"/);
  assert.match(app, /midpointDistance/);
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
