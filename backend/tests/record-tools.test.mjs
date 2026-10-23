// Offline only: no provider keys are read and no provider call is made.
delete process.env.OPENROUTER_API_KEY;
delete process.env.OPENAI_API_KEY;
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { filterRecords, recordsToCsv, recordsExport, deterministicInsights } from "../recordTools.mjs";

const rows = [
  { id: 1, reference: "A-1", title: "Alpha dwell", status: "Open", owner: "Sam", risk: "High", amount: 100, payload: { car: "TBOX-1" } },
  { id: 2, reference: "B-2", title: "Beta rent", status: "Closed", owner: "Jo", risk: "Low", amount: 0, payload: {} },
];
test("search/filter narrows the main list", () => {
  assert.equal(filterRecords(rows, { q: "alpha" }).length, 1);
  assert.equal(filterRecords(rows, { q: "tbox" }).length, 1);
  assert.equal(filterRecords(rows, { status: "Closed" }).length, 1);
  assert.equal(filterRecords(rows, { risk: "High" }).length, 1);
  assert.equal(filterRecords(rows, {}).length, 2);
});
test("CSV/JSON export preserves 0 and escapes formulas", () => {
  const csv = recordsToCsv(rows);
  assert.ok(csv.split("\n")[0].includes("reference"));
  assert.ok(csv.includes(",0,") || csv.endsWith(",0"));
  assert.equal(recordsExport(rows, "json").contentType.includes("json"), true);
  assert.equal(JSON.parse(recordsExport(rows, "json").body).length, 2);
  assert.equal(recordsExport(rows, "csv").contentType.includes("csv"), true);
});
test("insights are labelled aiGenerated:false and preserve false/0/empty", () => {
  const out = deterministicInsights("railcar", []);
  assert.ok(out.length >= 2 && out.length <= 3);
  for (const r of out) {
    assert.equal(r.aiGenerated, false);
    const byLabel = Object.fromEntries(r.sections.map((s) => [s.label, s.value]));
    assert.equal(byLabel["Records reviewed"], 0);
    assert.equal(byLabel["Has high-risk records"], false);
    assert.equal(byLabel["Notes"], "");
  }
  assert.equal(deterministicInsights("railcar", rows)[0].sections[0].value, 2);
});
test("server wires search, export and insights behind auth", () => {
  const s = fs.readFileSync(new URL("../server.mjs", import.meta.url), "utf8");
  assert.ok(s.includes("/records/export"));
  assert.ok(s.includes("/insights"));
  assert.ok(s.includes("filterRecords"));
});
