// Pure record tools: search/filter, CSV export, deterministic insights (aiGenerated:false). No provider calls.
export function filterRecords(rows, { q = "", status = "", risk = "" } = {}) {
  const needle = String(q || "").trim().toLowerCase();
  return (Array.isArray(rows) ? rows : []).filter((r) => {
    if (status && String(r.status || "") !== status) return false;
    if (risk && String(r.risk || "") !== risk) return false;
    if (!needle) return true;
    return [r.reference, r.title, r.owner, r.status, r.risk, JSON.stringify(r.payload ?? {})]
      .join(" ").toLowerCase().includes(needle);
  });
}
function csvCell(v) {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/^[=+@\t\r-]/.test(s)) s = "'" + s;
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
export function recordsToCsv(rows, columns) {
  const cols = columns && columns.length ? columns : ["id","feature_id","reference","title","status","owner","risk","due_date","amount"];
  const list = Array.isArray(rows) ? rows : [];
  return [cols.join(","), ...list.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n");
}
export function recordsExport(rows, format) {
  if (format === "csv") return { contentType: "text/csv; charset=utf-8", body: recordsToCsv(rows) };
  return { contentType: "application/json; charset=utf-8", body: JSON.stringify(Array.isArray(rows) ? rows : [], null, 2) };
}
const INSIGHT_DEFS = {
  demurrage: [
    ["dwell-overdue-review", "Dwell overdue review"],
    ["variance-concentration", "Charge variance concentration"],
    ["evidence-gap-review", "Evidence gap review"],
  ],
  railcar: [
    ["rent-variance-review", "Rent variance review"],
    ["mileage-exception-review", "Mileage exception review"],
    ["repair-evidence-gaps", "Repair evidence gaps"],
  ],
};
export function deterministicInsights(kind, rows) {
  const defs = INSIGHT_DEFS[kind] || INSIGHT_DEFS.demurrage;
  const list = Array.isArray(rows) ? rows : [];
  const open = list.filter((r) => !["Approved", "Closed"].includes(String(r.status || "")));
  const highRisk = list.filter((r) => ["High", "Critical"].includes(String(r.risk || "")));
  const total = list.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  return defs.map(([feature, label], i) => ({
    feature, label, aiGenerated: false, source: "deterministic-fallback",
    summary: `${label}: reviewed ${list.length} record(s) locally without an AI provider.`,
    sections: [
      { label: "Records reviewed", value: list.length },
      { label: "Open records", value: open.length },
      { label: "High-risk records", value: highRisk.length },
      { label: "Total amount", value: total },
      { label: "Has high-risk records", value: highRisk.length > 0 },
      { label: "Notes", value: "" },
    ],
    findings: list.length === 0 ? ["No records were supplied; nothing was assessed."]
      : i === 0 ? [`${open.length} open record(s) need review.`]
      : i === 1 ? [`Total represented amount is ${total}.`]
      : [`${highRisk.length} high-risk record(s) need evidence review.`],
  }));
}
