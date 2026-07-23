import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const app = read("src/components/MainContainer.tsx");
const css = read("src/index.css");
const html = read("index.html");
const portfolio = read("src/data/portfolio.ts");

test("page exposes core landmarks and a skip link", () => {
  for (const marker of ["<header", "<nav", "<main", "<section", "<footer", "skip-link"]) {
    assert.match(app, new RegExp(marker));
  }
});

test("primary interactions expose accessible state", () => {
  assert.match(app, /aria-expanded=\{navOpen\}/);
  assert.match(app, /aria-pressed=\{selectedSkill === skill\}/);
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /aria-current=/);
});

test("contact and professional profile links are actionable", () => {
  assert.match(app, /<form className="contact-form"/);
  assert.match(app, /sendEmail\(formData\)/);
  assert.match(app, /np\.linkedin\.com\/in\/ramprakash-sah-b368a5179/);
  assert.doesNotMatch(app, /href="https:\/\/linkedin\.com"/);
});

test("project images are optimized and lazy-loaded", () => {
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

test("mobile and reduced-motion safeguards remain present", () => {
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /overflow-wrap:anywhere/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.motion-off \.orbit/);
});

test("social sharing metadata references the generated preview", () => {
  assert.match(html, /property="og:image" content="\/og-image\.jpg"/);
  assert.match(html, /name="twitter:image" content="\/og-image\.jpg"/);
  assert.ok(existsSync(new URL("../public/og-image.jpg", import.meta.url)));
  assert.match(html, /application\/ld\+json/);
});

test("legacy blocking 3D application path is not referenced", () => {
  const entry = read("src/App.tsx");
  assert.doesNotMatch(entry, /Character|LoadingProvider|<Loading/);
  assert.doesNotMatch(app, /three|requestAnimationFrame|WebGLRenderer/);
});
