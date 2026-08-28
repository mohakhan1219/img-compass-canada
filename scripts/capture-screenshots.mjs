#!/usr/bin/env node
/**
 * Capture synthetic demo screenshots. Requires a running app
 * and Google Chrome. Does not import real identity.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs/screenshots");
const BASE = process.env.COMPASS_SHOT_BASE || "http://127.0.0.1:43210";
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,900"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

async function shot(name, heading) {
  await page.waitForFunction(
    (t) => document.querySelector("h1")?.textContent?.trim() === t,
    { timeout: 25000 },
    heading,
  );
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((n) => n.remove());
  });
  const dest = path.join(OUT, name);
  await page.screenshot({ path: dest, fullPage: true });
  console.log("wrote", dest);
}

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
await shot("01-signin.png", "Continue as Dr. Alex");
await Promise.all([
  page.click("button"),
  page.waitForFunction(() => document.querySelector("h1")?.textContent?.includes("Welcome back"), {
    timeout: 20000,
  }),
]);
await shot("02-dashboard.png", "Welcome back, Alex");
await page.screenshot({ path: path.join(OUT, "08-pathway-overview.png"), fullPage: true });

for (const [file, href, heading] of [
  ["12-profile.png", "/profile", "IMG profile"],
  ["03-mccqe1.png", "/mccqe1", "MCCQE1"],
  ["04-nac.png", "/nac", "NAC practice"],
  ["05-language.png", "/language", "Language evidence"],
  ["06-provincial.png", "/provincial", "Provincial pathway"],
  ["07-carms.png", "/carms", "CaRMS pipeline"],
  ["13-applications.png", "/applications", "Applications"],
  ["14-interviews.png", "/interviews", "Interviews"],
  ["15-ranking.png", "/ranking", "Rank order"],
  ["16-match.png", "/match", "Match day"],
]) {
  await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await shot(file, heading);
}

await browser.close();
