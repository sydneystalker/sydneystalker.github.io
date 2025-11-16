/* 
  Author: Sydney Stalker
  Class: CST 336 - Internet Programming
  Date: 11/18/2025
  Assignment: HW3 - 5e Spell & Monster Finder
  File: js/results.js
  Abstract: Reads query parameters, fetches from the D&D 5e API, and renders results as cards.
  Update: Supports empty keyword searches (e.g., "all level 5 spells" or "CR ≤ 2 monsters").
*/

const API_BASE = "https://www.dnd5eapi.co";
const MAX_RESULTS = 12;          // number of cards to render
const FETCH_CONCURRENCY = 8;     // parallel detail fetches

init();

async function init() {
  clearErrors(); setStatus(""); setResultCount(""); clearResults();

  const q = new URLSearchParams(window.location.search);
  const type  = (q.get("type") || "spell").toLowerCase(); // "spell" | "monster"
  const term  = (q.get("term") || "").trim();             // optional now
  const level = q.has("level") ? Number(q.get("level")) : NaN;
  const conc  = q.get("conc") === "1";
  const crMin = q.has("crMin") ? Number(q.get("crMin")) : 0;
  const crMax = q.has("crMax") ? Number(q.get("crMax")) : 30;

  // Validate filters
  const errors = [];
  if (type === "spell" && !Number.isNaN(level)) {
    if (!Number.isInteger(level) || level < 0 || level > 9) {
      errors.push("Spell level must be an integer from 0 to 9.");
    }
  }
  if (type === "monster") {
    if (Number.isNaN(crMin) || Number.isNaN(crMax) || crMin < 0 || crMax > 30 || crMin > crMax) {
      errors.push("CR must be 0–30 (supports .25, .5) and Min ≤ Max.");
    }
  }
  if (errors.length) { renderErrors(errors); return; }

  try {
    setStatus("Loading results… 🪄");

    // Build list URL: if keyword present, use name filter; otherwise fetch full list
    const listUrl =
      type === "spell"
        ? `${API_BASE}/api/spells${term ? `?name=${encodeURIComponent(term)}` : ""}`
        : `${API_BASE}/api/monsters${term ? `?name=${encodeURIComponent(term)}` : ""}`;

    const listRes = await fetch(listUrl);
    if (!listRes.ok) throw new Error(`List request failed (${listRes.status})`);
    const listData = await listRes.json();

    let list = Array.isArray(listData.results) ? listData.results : [];
    if (!list.length) {
      setStatus(""); setResultCount("No matches found."); return;
    }

    // Prepare filter predicates
    const spellFilter = (s) =>
      (Number.isNaN(level) || s.level === level) &&
      (!conc || (String(s.concentration).toLowerCase() === "yes" || s.concentration === true));

    const monsterFilter = (m) => {
      const cr = typeof m.challenge_rating === "number" ? m.challenge_rating : Number(m.challenge_rating);
      return !Number.isNaN(cr) && cr >= crMin && cr <= crMax;
    };

    // Fetch details. If no keyword, we may need to scan through the list to find enough
    // items that pass filters. We'll fetch in parallel batches to keep it responsive.
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

    setResultCount(`${filtered.length} result${filtered.length === 1 ? "" : "s"} shown`);
    renderCards(filtered, type);
  } catch (err) {
    setStatus("");
    renderErrors(["Error fetching results.", err.message]);
    console.error(err);
  }
}

/* --------------------------- Detail Fetch with Filtering --------------------------- */
async function fetchFilteredDetails({ list, type, wantCount, predicate }) {
  const results = [];
  const urls = list.map(it => API_BASE + it.url);

  // Process in parallel with a simple concurrency pool
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
        // ignore failed item
      }
    }
  }

  const pool = Array.from({ length: Math.min(FETCH_CONCURRENCY, urls.length) }, worker);
  await Promise.all(pool);

  // If no predicate (shouldn’t happen here), just return first N; otherwise already filtered
  return results.slice(0, wantCount);
}

/* --------------------------- Rendering --------------------------- */
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

/* --------------------------- Helpers --------------------------- */
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
