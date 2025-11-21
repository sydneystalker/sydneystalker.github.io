/*
  Author: Sydney Stalker
  File: js/app.js
  Abstract: Minimal pattern to fetch from a Web API and render the results.
            Keep it simple: one endpoint, one button, one render function.
*/

// ===== 1) SET YOUR ENDPOINT HERE =====
// Replace with the real URL you get on the midterm (must support GET + JSON).
const ENDPOINT = "https://example.com/api/items";

// ===== 2) WIRE UP EVENTS WHEN THE PAGE IS READY =====
document.addEventListener("DOMContentLoaded", () => {
  // Find the "Load Data" button and attach a click handler
  document.getElementById("loadBtn").addEventListener("click", loadData);

  // If you prefer auto-load on page open, uncomment:
  // loadData();
});

// ===== 3) FETCH DATA FROM THE API =====
function loadData() {
  // Show the user that something is happening
  setStatus("Loading…");
  setError("");

  // Make a simple GET request to the endpoint
  fetch(ENDPOINT)
    .then(res => res.json()) // Convert the HTTP response body to JSON
    .then(data => {
      // Normalize the result to an array for easy rendering
      // If the API returns {results: [...]}, {items: [...]}, or a single object,
      // we coerce it to an array named list.
      const list = Array.isArray(data)
        ? data
        : (data.results || data.items || [data]);

      // Render the normalized array to the page
      renderResults(list);

      // Tell the user we're done + how many items we got
      setStatus(`Loaded ${list.length} item(s).`);
    })
    .catch(() => {
      // Minimal, exam-friendly error handling (no stack traces)
      setError("Failed to load data.");
      setStatus("");
    });
}

// ===== 4) RENDER THE RESULTS ON THE PAGE =====
function renderResults(list) {
  const container = document.getElementById("results");
  container.innerHTML = ""; // Clear any previous results

  // If nothing came back, show a friendly message
  if (!list || list.length === 0) {
    container.textContent = "No results.";
    return;
  }

  // Create a small “card” for each item
  list.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";

    // Map API fields to display text (adjust these keys on exam day!)
    // Use nullish coalescing to fall back if a field isn't present.
    const title  = item.title ?? item.name ?? item.id ?? "Untitled";
    const detail = item.description ?? item.summary ?? item.author ?? "";

    // Insert simple, safe HTML (escape text to avoid injecting HTML)
    card.innerHTML = `
      <h3 class="card-title">${escapeHTML(String(title))}</h3>
      <p class="card-detail">${escapeHTML(String(detail))}</p>
    `;

    container.appendChild(card);
  });
}

// ===== 5) SMALL HELPERS FOR STATUS / ERROR TEXT =====
function setStatus(msg) { document.getElementById("status").textContent = msg; }
function setError(msg)  { document.getElementById("error").textContent  = msg; }

// ===== 6) BASIC ESCAPER TO AVOID HTML INJECTION IN RENDERED TEXT =====
function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
