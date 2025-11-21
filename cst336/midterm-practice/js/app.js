//   Author: Sydney Stalker 
//   Class: CST 336 - Internet Programing
//   Date: 11/20/2025
//   Assignment: Midterm Practice
//   File: app.js


// ========================= Constants =========================
// Web APIs 
const ENDPOINT_RANDOM     = "https://csumb.space/api/famousQuotes/getRandomQuote.php";
const ENDPOINT_TRANSLATE  = "https://csumb.space/api/famousQuotes/translateQuote.php";
const ENDPOINT_GET_QUOTES = "https://csumb.space/api/famousQuotes/getQuotes.php";

// Language radios 
const LANGUAGES = [
  { api: "EN", name: "English",   flag: "imgs/english_flag.png"   },
  { api: "ES", name: "Esperanto", flag: "imgs/esperanto_flag.png" },
  { api: "FR", name: "French",    flag: "imgs/french_flag.png"    },
  { api: "SP", name: "Spanish",   flag: "imgs/spanish_flag.png"   }
];

// Currently shown quote/author here
let current = {
  quoteId: null,
  firstName: "",
  lastName: "",
  bio: "",
  picture: ""
};

// ========================= Boot =========================
document.addEventListener("DOMContentLoaded", () => {
  renderLanguageOptions();   // Step 3: make radios (random order)
  fetchRandomQuote();        // Step 1: show a random quote + author
  getRandomBackground();     // Step 6: random Pixabay background

  // Wire up buttons (Steps 2, 4, 5)
  document.getElementById("showAuthorBtn").addEventListener("click", showAuthorInfo);
  document.getElementById("translateBtn").addEventListener("click", onTranslateClick);
  document.getElementById("getQuotesBtn").addEventListener("click", onGetQuotes);
});

// ========================= Step 1: Random quote =========================
function fetchRandomQuote() {
  // Light UX while loading
  document.getElementById("quote").textContent = "Loading…";
  document.getElementById("author").textContent = "";

  fetch(ENDPOINT_RANDOM)
    .then(r => r.json())
    .then(data => {
      // Use the common field names returned by the API
      current.quoteId  = data.quoteId;
      current.firstName = data.firstName;
      current.lastName  = data.lastName;
      current.bio       = data.bio;
      current.picture   = data.picture;

      // Put quote and author on the page
      document.getElementById("quote").textContent  = `“${data.quoteText}”`;
      document.getElementById("author").textContent = `— ${data.firstName} ${data.lastName}`;

      // Clear translation output from any prior quote
      document.getElementById("translatedQuote").textContent = "";
      const flag = document.getElementById("flag");
      flag.hidden = true; flag.src = ""; flag.alt = "";

      // Hide author panel until the button is clicked
      document.getElementById("authorInfo").hidden = true;
      document.getElementById("authorPic").hidden  = true;
    });
}

// ========================= Step 2: Show author info =========================
function showAuthorInfo() {
  // Fill in author fields
  document.getElementById("authorName").textContent = `${current.firstName} ${current.lastName}`;
  document.getElementById("authorBio").textContent  = current.bio;

  // Show the image and the panel
  const img = document.getElementById("authorPic");
  img.src = current.picture;
  img.alt = `${current.firstName} ${current.lastName}`;
  img.hidden = false;

  document.getElementById("authorInfo").hidden = false;
}

// ========================= Step 3: Language radios (random order) =========================
function renderLanguageOptions() {
  const form = document.getElementById("langForm");
  form.innerHTML = "";

  // Simple shuffle: sort by random value
  const shuffled = [...LANGUAGES].sort(() => Math.random() - 0.5);

  // Build radios with flag icons
  shuffled.forEach(lang => {
    const label = document.createElement("label");
    label.className = "lang-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "language";
    input.value = lang.api;

    const img = document.createElement("img");
    img.src = lang.flag;
    img.alt = lang.name;
    img.width = 24;

    label.appendChild(input);
    label.appendChild(img);
    label.append(` ${lang.name}`);
    form.appendChild(label);
  });
}

function getSelectedLanguageCode() {
  const sel = document.querySelector('input[name="language"]:checked');
  return sel ? sel.value : null; // returns EN / ES / FR / SP
}

// ========================= Step 4: Translate quote =========================
function onTranslateClick() {
  const code = getSelectedLanguageCode();
  if (!code || !current.quoteId) { alert("Pick a language first."); return; }

  // show flag
  const lang = LANGUAGES.find(l => l.api === code);
  const flag = document.getElementById("flag");
  flag.src = lang.flag; flag.alt = `${lang.name} flag`; flag.hidden = false;

  // fetch translation
  const url = `${ENDPOINT_TRANSLATE}?lang=${code}&quoteId=${current.quoteId}`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const obj = Array.isArray(data) ? data[0] : data;
      const t =
        (obj && (obj.translatedQuote || obj.translation || obj.quote || obj.text)) || "";

      document.getElementById("translatedQuote").textContent =
        t || "(no translation returned)";
    });
}

// ========================= Step 5: Get 1–5 quotes =========================
function onGetQuotes() {
  const qtyInput = document.getElementById("qty");
  const n = parseInt(qtyInput.value, 10);

  // Very light validation per rubric
  const err = document.getElementById("qtyError");
  err.textContent = (Number.isInteger(n) && n >= 1 && n <= 5) ? "" : "Please enter a whole number between 1 and 5.";
  if (err.textContent) return;

  fetch(`${ENDPOINT_GET_QUOTES}?n=${n}`)
    .then(r => r.json())
    .then(list => {
      const results = document.getElementById("multiResults");
      results.innerHTML = ""; // clear previous

      list.forEach(q => {
        const card = document.createElement("article");
        card.className = "quote-card";

        const block = document.createElement("blockquote");
        block.textContent = `“${q.quoteText}”`;

        const by = document.createElement("div");
        by.className = "by";
        by.textContent = `— ${q.firstName} ${q.lastName}`;

        card.append(block, by);
        results.appendChild(card);
      });
    });
}

// ========================= Step 6: Random Pixabay background =========================
function getRandomBackground() {
  const PIXABAY_API = "https://pixabay.com/api/?key=5589438-47a0bca778bf23fc2e8c5bf3e&per_page=50&orientation=horizontal&q=flowers";

  fetch(PIXABAY_API)
    .then(r => r.json())
    .then(data => {
      const hit = data.hits[Math.floor(Math.random() * data.hits.length)];
      const url = hit.largeImageURL || hit.webformatURL;
      document.body.style.backgroundImage = `url("${url}")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
    });
}
