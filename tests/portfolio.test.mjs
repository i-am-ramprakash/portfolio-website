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
  for (const zone of ["hero", "about", "capabilities", "career", "work", "contact"]) {
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
