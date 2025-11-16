/*  
  Author: Sydney Stalker
  Class: CST 336 - Internet Programming
  Date: 11/18/2025
  Assignment: HW3 - 5e Spell & Monster Finder
  File: js/results.js
  Abstract: Reads query parameters, fetches from the D&D 5e API, and renders results as cards.
*/

const API_BASE = "https://www.dnd5eapi.co";
const MAX_RESULTS = 12;        
const FETCH_CONCURRENCY = 8;     

init();

/* Helper: validate CR is .25, .5, .75, or whole numbers 1–30 */
function isValidCR(n) {
  if (n === null || n === undefined) return true; // absent is fine
  if (!Number.isFinite(n)) return false;
  if (n === 0.25 || n === 0.5 || n === 0.75) return true;
  return Number.isInteger(n) && n >= 1 && n <= 30;
}

async function init() {
  clearErrors(); setStatus(""); setResultCount(""); clearResults();

  const q = new URLSearchParams(window.location.search);
  const type  = (q.get("type") || "spell").toLowerCase(); 
  const term  = (q.get("term") || "").trim();             
  const level = q.has("level") ? Number(q.get("level")) : NaN;
  const conc  = q.get("conc") === "1";

  // Read CR bounds only if present; otherwise keep them null so we can apply defaults later
  const crMin = q.has("crMin") ? Number(q.get("crMin")) : null;
  const crMax = q.has("crMax") ? Number(q.get("crMax")) : null;

  const errors = [];
  if (type === "spell" && !Number.isNaN(level)) {
    if (!Number.isInteger(level) || level < 0 || level > 9) {
      errors.push("Spell level must be an integer from 0 to 9.");
    }
  }
  if (type === "monster") {
    // RUBRIC: JS validation for CR (.25, .5, .75, or whole 1–30) and Min ≤ Max
    if (!isValidCR(crMin) || !isValidCR(crMax)) {
      errors.push("CR must be .25, .5, .75, or whole numbers 1–30.");
    } else {
      const minVal = (crMin === null ? 0.25 : crMin);
      const maxVal = (crMax === null ? 30    : crMax);
      if (minVal > maxVal) errors.push("CR Min must be ≤ CR Max.");
    }
  }
  if (errors.length) { renderErrors(errors); return; }

  try {
    setStatus("Loading results… 🪄");

    const listUrl =
      type === "spell"
        ? `${API_BASE}/api/spells${term ? `?name=${encodeURIComponent(term)}` : ""}`
        : `${API_BASE}/api/monsters${term ? `?name=${encodeURIComponent(term)}` : ""}`;

    // RUBRIC: At least one fetch() call to an existing Web API
    const listRes = await fetch(listUrl);
    if (!listRes.ok) throw new Error(`List request failed (${listRes.status})`);
    const listData = await listRes.json();

    let list = Array.isArray(listData.results) ? listData.results : [];
    if (!list.length) {
      setStatus(""); setResultCount("No matches found."); return;
    }

    const spellFilter = (s) =>
      (Number.isNaN(level) || s.level === level) &&
      (!conc || (String(s.concentration).toLowerCase() === "yes" || s.concentration === true));

    const monsterFilter = (m) => {
      const cr = typeof m.challenge_rating === "number" ? m.challenge_rating : Number(m.challenge_rating);
      if (!Number.isFinite(cr)) return false;

      // Enforce allowed CR set: .25, .5, .75, or whole 1–30
      const allowed = (cr === 0.25 || cr === 0.5 || cr === 0.75 || (Number.isInteger(cr) && cr >= 1 && cr <= 30));
      if (!allowed) return false;

      // Apply bounds only if provided; otherwise default to [.25, 30]
      const minVal = (crMin === null ? 0.25 : crMin);
      const maxVal = (crMax === null ? 30    : crMax);
      return cr >= minVal && cr <= maxVal;
    };

    // RUBRIC: Additional fetch calls for item details (concurrency pool)
    const filtered = await fetchFilteredDetails({
      list,
      type,
      wantCount: MAX_RESULTS,
      predicate: type === "spell" ? spellFilter : monsterFilter
    });

    setStatus("");
    if (!filtered.length) {
      setResultCount("No results matched your filters.");
      return;
    }

    // RUBRIC: Web API data displayed in a user-friendly format (count + grid of cards)
    setResultCount(`${filtered.length} result${filtered.length === 1 ? "" : "s"} shown`);
    renderCards(filtered, type);
  } catch (err) {
    setStatus("");
    renderErrors(["Error fetching results.", err.message]);
    console.error(err);
  }
}

async function fetchFilteredDetails({ list, type, wantCount, predicate }) {
  const results = [];
  const urls = list.map(it => API_BASE + it.url);

  let i = 0;
  async function worker() {
    while (i < urls.length && results.length < wantCount) {
      const idx = i++;
      const url = urls[idx];
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (!predicate || predicate(data)) {
          results.push(data);
        }
      } catch {
        // ignore individual fetch failures
      }
    }
  }

  const pool = Array.from({ length: Math.min(FETCH_CONCURRENCY, urls.length) }, worker);
  await Promise.all(pool);

  return results.slice(0, wantCount);
}

function renderCards(items, type) {
  const grid = document.querySelector("#resultsGrid");
  grid.innerHTML = "";
  items.forEach(item => {
    grid.appendChild(type === "spell" ? renderSpellCard(item) : renderMonsterCard(item));
  });
}

function renderSpellCard(s) {
  const card = document.createElement("article");
  card.className = "card spell-card";
  const title = el("h3", {}, s.name);
  const meta  = el("p", { class: "meta" }, `Level ${s.level} • ${safe(s.school?.name || s.school || "Unknown School")}`);
  const badges = div("badges");
  if (String(s.concentration).toLowerCase() === "yes" || s.concentration === true) badges.appendChild(badge("Concentration"));
  if (s.ritual === true || String(s.ritual).toLowerCase() === "yes") badges.appendChild(badge("Ritual"));

  const details = div("details");
  details.appendChild(pStrong("Casting Time:", s.casting_time));
  details.appendChild(pStrong("Range:", s.range));
  details.appendChild(pStrong("Components:", Array.isArray(s.components) ? s.components.join(", ") : s.components));
  details.appendChild(pStrong("Duration:", s.duration));

  const desc = el("p", { class: "desc" }, Array.isArray(s.desc) ? s.desc[0] : (s.desc || "No description."));
  card.append(title, meta, badges, details, desc);
  return card;
}

function renderMonsterCard(m) {
  const card = document.createElement("article");
  card.className = "card monster-card";
  const title = el("h3", {}, m.name);
  const meta  = el("p", { class: "meta" }, `${safe(m.size || "—")} • ${safe(m.type || "monster")} • ${safe(m.alignment || "—")}`);

  const badges = div("badges");
  const cr = typeof m.challenge_rating === "number" ? m.challenge_rating : Number(m.challenge_rating);
  if (!Number.isNaN(cr)) badges.appendChild(badge(`CR ${cr}`));

  const stats = div("details");
  stats.appendChild(pStrong("Armor Class:", numOrDash(m.armor_class)));
  stats.appendChild(pStrong("Hit Points:", numOrDash(m.hit_points)));
  stats.appendChild(pStrong("Hit Dice:", m.hit_dice || "—"));

  const actions = document.createElement("details");
  const sum = document.createElement("summary"); sum.textContent = "Actions";
  const ul = document.createElement("ul");
  (m.actions || []).forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${safe(a.name || "Action")}:</strong> ${safe(a.desc || "")}`;
    ul.appendChild(li);
  });
  actions.append(sum, ul);

  card.append(title, meta, badges, stats, actions);
  return card;
}

function el(tag, attrs = {}, ...children){
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,v));
  children.forEach(c => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return n;
}
function div(cls){ const d = document.createElement("div"); d.className = cls; return d; }
function badge(t){ const s = document.createElement("span"); s.className="badge"; s.textContent=t; return s; }
function pStrong(label, value){
  const p = document.createElement("p");
  const b = document.createElement("strong"); b.textContent = label;
  p.append(b, document.createTextNode(" " + safe(value || "—")));
  return p;
}
function safe(v){ return typeof v === "string" ? v : String(v ?? "—"); }
function numOrDash(v){ return (typeof v === "number" && !Number.isNaN(v)) ? v : "—"; }

function renderErrors(msgs){
  const ul = document.querySelector("#errors"); ul.innerHTML = "";
  msgs.forEach(m => { const li = document.createElement("li"); li.textContent = m; ul.appendChild(li); });
}
function clearErrors(){ const ul = document.querySelector("#errors"); if (ul) ul.innerHTML = ""; }
function setStatus(msg){ const s = document.querySelector("#status"); if (s) s.textContent = msg || ""; }
function setResultCount(msg){ const r = document.querySelector("#resultCount"); if (r) r.textContent = msg || ""; }
function clearResults(){ const g = document.querySelector("#resultsGrid"); if (g) g.innerHTML = ""; }
