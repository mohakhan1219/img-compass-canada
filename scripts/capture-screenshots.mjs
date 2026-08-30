#!/usr/bin/env node
/**
 * Capture recruiter gallery from the live AWS demo (page content only, 1440×900).
 * COMPASS_SHOT_BASE defaults to the prod-demo ALB.
 */
import { mkdirSync, unlinkSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs/screenshots");
const BASE = (process.env.COMPASS_SHOT_BASE || "http://img-compass-prod-demo-1496842689.ca-central-1.elb.amazonaws.com").replace(/\/$/, "");
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

mkdirSync(OUT, { recursive: true });

const KEEP = new Set([
  "README.md",
  "01-entry.png",
  "02-dashboard-top.png",
  "03-dashboard-progress.png",
  "04-program-explorer.png",
  "05-profile-credentials.png",
  "06-provincial-pathway.png",
  "07-carms-applications.png",
  "08-interviews-ranking.png",
  "09-match.png",
  "10-about.png",
]);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.setDefaultTimeout(45000);

async function clean() {
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((n) => n.remove());
  });
}

async function waitForText(text, timeout = 30000) {
  try {
    await page.waitForFunction(
      (t) => document.body?.innerText?.includes(t),
      { timeout },
      text,
    );
  } catch (err) {
    const snippet = await page.evaluate(() => (document.body?.innerText || "").slice(0, 800));
    console.error("waitForText failed:", text);
    console.error("url:", page.url());
    console.error("body snippet:\n", snippet);
    throw err;
  }
}

async function shot(name) {
  await clean();
  await new Promise((r) => setTimeout(r, 500));
  const dest = path.join(OUT, name);
  await page.screenshot({ path: dest, type: "png", captureBeyondViewport: false });
  console.log("wrote", name);
}

async function gotoPath(href) {
  await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 600));
}

await gotoPath("/");
await waitForText("Continue as Dr. Alex Morgan");
await shot("01-entry.png");

await page.evaluate(async () => {
  await fetch("/api/auth/demo", { method: "POST", credentials: "include" });
});
await gotoPath("/dashboard");
await waitForText("Welcome back, Alex");
await waitForText("Continue preparation");
await shot("02-dashboard-top.png");

await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("h2")];
  const graph = nodes.find((n) => n.textContent?.includes("Residency pathway progress"));
  graph?.scrollIntoView({ block: "center" });
});
await new Promise((r) => setTimeout(r, 500));
await waitForText("Overall pathway progress");
await shot("03-dashboard-progress.png");

for (const [file, href, marker] of [
  ["04-program-explorer.png", "/programs", "Save to My Programs"],
  ["05-profile-credentials.png", "/credentials", "Track status only"],
  ["06-provincial-pathway.png", "/provincial", "Provincial pathways"],
  ["07-carms-applications.png", "/carms", "CaRMS pipeline"],
  ["08-interviews-ranking.png", "/ranking", "Rank order"],
  ["09-match.png", "/match", "Match day"],
  ["10-about.png", "/about", "Your Path to Canadian Residency"],
]) {
  await gotoPath(href);
  await waitForText(marker);

  if (file === "04-program-explorer.png") {
    const province = await page.$("select");
    if (province) await province.select("ON");
    await waitForText("University of Toronto");
  }

  if (file === "06-provincial-pathway.png") {
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      const ontario = buttons.filter((b) => (b.textContent || "").trim() === "Ontario");
      ontario[ontario.length - 1]?.click();
    });
    await waitForText("University of Toronto");
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(file);
}

await browser.close();

for (const name of readdirSync(OUT)) {
  if (KEEP.has(name)) continue;
  if (name.endsWith(".png")) {
    unlinkSync(path.join(OUT, name));
    console.log("removed", name);
  }
}
