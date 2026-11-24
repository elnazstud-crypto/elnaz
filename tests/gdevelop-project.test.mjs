import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("GDevelop project is a portrait native project with one JavaScript scene", async () => {
  const project = JSON.parse(await readFile(new URL("../android-gdevelop/game.json", import.meta.url), "utf8"));
  assert.equal(project.gdVersion.major, 5);
  assert.equal(project.firstLayout, "GemQuest");
  assert.equal(project.properties.orientation, "portrait");
  assert.equal(project.properties.packageName, "com.gemquest.fantasyjewels");
  assert.equal(project.layouts.length, 1);
  const events = project.layouts[0].events;
  assert.ok(events.some(event => event.type === "BuiltinCommonInstructions::JsCode"));
});

test("GDevelop scene embeds the same runtime source used by the web preview", async () => {
  const project = JSON.parse(await readFile(new URL("../android-gdevelop/game.json", import.meta.url), "utf8"));
  const runtime = await readFile(new URL("../src/gemquest-runtime.js", import.meta.url), "utf8");
  const event = project.layouts[0].events.find(event => event.type === "BuiltinCommonInstructions::JsCode");
  assert.equal(event.inlineCode.join("\n"), runtime);
});

test("campaign runtime includes 10 stages, touch input and local progress", async () => {
  const runtime = await readFile(new URL("../src/gemquest-runtime.js", import.meta.url), "utf8");
  assert.equal((runtime.match(/\["[^"]+","(?:امتیاز|زمرد|یاقوت|یخ|یاقوت کبود|کهربا|آمتیست|خورشید)",\d+/g) || []).length, 10);
  assert.match(runtime, /pointerdown/);
  assert.match(runtime, /localStorage\.setItem/);
  assert.match(runtime, /rocket-h/);
  assert.match(runtime, /rainbow/);
});
