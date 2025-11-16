/* 
  Author: Sydney Stalker
  Class: CST 336 - Internet Programming
  Date: 11/18/2025
  Assignment: HW3 - 5e Spell & Monster Finder
  File: js/app.js
  Abstract: Fetches data from the public D&D 5e API based on user input and displays
  results as cards. Validates inputs (required keyword, spell level 0–9, monster CR range),
  shows inline and summary errors, and provides loading/status messages.
*/


document.querySelector("#searchForm").addEventListener("submit", onSearchSubmit);
document.querySelector("#searchTerm").addEventListener("input", () => {
  document.querySelector("#searchTermError").textContent = "";
});
document.querySelector("#level").addEventListener("input", () => {
  document.querySelector("#searchTermError").textContent = "";
});
["crMin", "crMax"].forEach(id => {
  const el = document.querySelector("#" + id);
  if (el) el.addEventListener("input", () => (document.querySelector("#crError").textContent = ""));
});


const API_BASE = "https://www.dnd5eapi.co"; 
const MAX_RESULTS = 12; 

async function onSearchSubmit(e) {
  e.preventDefault();

  clearErrors();
  setStatus("");
  setResultCount("");
  clearResults();

  const type = document.querySelector('input[name="type"]:checked').value; 
  const term = document.querySelector("#searchTerm").value.trim();
  const levelStr = document.querySelector("#level").value;
  const level = levelStr === "" ? NaN : Number(levelStr);
  const concOnly = document.querySelector("#concOnly").checked;

  const crMinStr = document.querySelector("#crMin").value;
  const crMaxStr = document.querySelector("#crMax").value;
  const crMin = crMinStr === "" ? 0 : Number(crMinStr);
  const crMax = crMaxStr === "" ? 30 : Number(crMaxStr);

  const errors = [];
  if (!term) {
    errors.push("Please enter a keyword.");
    inlineError("#searchTermError", "Keyword is required.");
  }
  if (type === "spell" && !Number.isNaN(level) && (level < 0 || level > 9 || !Number.isInteger(level))) {
    errors.push("Spell level must be an integer from 0 to 9.");
    inlineError("#searchTermError", "Spell level must be 0–9.");
  }
  if (type === "monster") {
    if (Number.isNaN(crMin) || Number.isNaN(crMax) || crMin < 0 || crMax > 30 || crMin > crMax) {
      errors.push("CR must be between 0 and 30, and Min ≤ Max.");
      inlineError("#crError", "CR must be 0–30 and Min ≤ Max.");
    }
  }
  if (errors.length) {
    renderErrors(errors);
    return;
  }

  try {
    setStatus("Loading…");
    const listUrl =
      type === "spell"
        ? `${API_BASE}/api/spells?name=${encodeURIComponent(term)}`
        : `${API_BASE}/api/monsters?name=${encodeURIComponent(term)}`;

    const listRes = await fetch(listUrl);
    if (!listRes.ok) throw new Error(`List request failed (${listRes.status})`);
    const listData = await listRes.json();
    let items = listData.results || [];

    if (!items.length) {
      setStatus("");
      setResultCount("No matches found. Try a different keyword.");
      return;
    }

    items = items.slice(0, MAX_RESULTS);
    const details = await Promise.all(
      items.map(async it => {
        const res = await fetch(API_BASE + it.url);
        if (!res.ok) return null;
        return res.json();
      })
    );
    const clean = details.filter(Boolean);

    let filtered = clean;
    if (type === "spell") {
      filtered = filtered.filter(s =>
        (Number.isNaN(level) || s.level === level) &&
        (!concOnly || (String(s.concentration).toLowerCase() === "yes" || s.concentration === true))
      );
    } else {
      filtered = filtered.filter(m => {
        const cr = typeof m.challenge_rating === "number" ? m.challenge_rating : Number(m.challenge_rating);
        return !Number.isNaN(cr) && cr >= crMin && cr <= crMax;
      });
    }

    setStatus("");
    if (!filtered.length) {
      setResultCount("No results matched your filters.");
      return;
    }

    setResultCount(`${filtered.length} result${filtered.length === 1 ? "" : "s"} shown`);
    renderCards(filtered, type);
  } catch (err) {
    setStatus("");
    renderErrors(["Something went wrong fetching data.", err.message]);
    console.error(err);
  }
}

function renderCards(items, type) {
  const grid = document.querySelector("#resultsGrid");
  grid.innerHTML = "";

  items.forEach(item => {
    if (type === "spell") {
      grid.appendChild(renderSpellCard(item));
    } else {
      grid.appendChild(renderMonsterCard(item));
    }
  });
}

function renderSpellCard(s) {
  const card = document.createElement("article");
  card.className = "card spell-card";

  const title = el("h3", {}, s.name);
  const meta = el("p", { class: "meta" }, `Level ${s.level} • ${safeText(s.school?.name || s.school || "Unknown School")}`);
  const badges = document.createElement("div");
  badges.className = "badges";
  if (String(s.concentration).toLowerCase() === "yes" || s.concentration === true) {
    badges.appendChild(makeBadge("Concentration"));
  }
  if (s.ritual === true || String(s.ritual).toLowerCase() === "yes") {
    badges.appendChild(makeBadge("Ritual"));
  }

  const details = document.createElement("div");
  details.className = "details";
  details.appendChild(el("p", {}, strongLabel("Casting Time:"), " ", safeText(s.casting_time || "—")));
  details.appendChild(el("p", {}, strongLabel("Range:"), " ", safeText(s.range || "—")));
  details.appendChild(el("p", {}, strongLabel("Components:"), " ", safeText(Array.isArray(s.components) ? s.components.join(", ") : s.components || "—")));
  details.appendChild(el("p", {}, strongLabel("Duration:"), " ", safeText(s.duration || "—")));

  const desc = el("p", { class: "desc" }, Array.isArray(s.desc) ? s.desc[0] : (s.desc || "No description."));
  card.append(title, meta, badges, details, desc);
  return card;
}

function renderMonsterCard(m) {
  const card = document.createElement("article");
  card.className = "card monster-card";

  const title = el("h3", {}, m.name);
  const meta = el("p", { class: "meta" }, `${safeText(m.size || "—")} • ${safeText(m.type || "monster")} • ${safeText(m.alignment || "—")}`);

  const badges = document.createElement("div");
  badges.className = "badges";
  const cr = typeof m.challenge_rating === "number" ? m.challenge_rating : Number(m.challenge_rating);
  if (!Number.isNaN(cr)) badges.appendChild(makeBadge(`CR ${cr}`));

  const stats = document.createElement("div");
  stats.className = "details";
  stats.appendChild(el("p", {}, strongLabel("Armor Class:"), " ", safeText(numOrDash(m.armor_class))));
  stats.appendChild(el("p", {}, strongLabel("Hit Points:"), " ", safeText(numOrDash(m.hit_points))));
  stats.appendChild(el("p", {}, strongLabel("Hit Dice:"), " ", safeText(m.hit_dice || "—")));

  const actionsWrap = document.createElement("details");
  const actionsSummary = document.createElement("summary");
  actionsSummary.textContent = "Actions";
  const actionsList = document.createElement("ul");
  (m.actions || []).forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${safeText(a.name || "Action")}:</strong> ${safeText(a.desc || "")}`;
    actionsList.appendChild(li);
  });
  actionsWrap.append(actionsSummary, actionsList);

  card.append(title, meta, badges, stats, actionsWrap);
  return card;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (node.setAttribute(k, v)));
  children.forEach(c => {
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}

function makeBadge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
}

function strongLabel(text) {
  const b = document.createElement("strong");
  b.textContent = text;
  return b;
}

function safeText(val) {
  return typeof val === "string" ? val : String(val ?? "—");
}

function numOrDash(v) {
  return (typeof v === "number" && !Number.isNaN(v)) ? v : "—";
}

function inlineError(selector, msg) {
  const el = document.querySelector(selector);
  if (el) el.textContent = msg;
}

function renderErrors(messages) {
  const ul = document.querySelector("#errors");
  ul.innerHTML = "";
  messages.forEach(m => {
    const li = document.createElement("li");
    li.textContent = m;
    ul.appendChild(li);
  });
}

function clearErrors() {
  document.querySelector("#errors").innerHTML = "";
  const inlineIds = ["#searchTermError", "#crError"];
  inlineIds.forEach(id => {
    const el = document.querySelector(id);
    if (el) el.textContent = "";
  });
}

function setStatus(msg) {
  document.querySelector("#status").textContent = msg || "";
}

function setResultCount(msg) {
  document.querySelector("#resultCount").textContent = msg || "";
}

function clearResults() {
  document.querySelector("#resultsGrid").innerHTML = "";
}

(function initFilterVisibility() {
  const type = document.querySelector('input[name="type"]:checked').value;
  document.getElementById('spellFilters').style.display   = (type === "spell") ? 'block' : 'none';
  document.getElementById('monsterFilters').style.display = (type === "spell") ? 'none'  : 'block';
})();
