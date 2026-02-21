const fs = require("fs");
const path = require("path");

/* =========================
   LOAD FULL ENGLISH DICTIONARY
========================= */

const wordsFile = path.join(__dirname, "words.txt");

let wordsCache = null;

function loadDictionary() {
  if (!wordsCache) {
    console.log("📘 Loading dictionary...");
    wordsCache = new Set(
      fs
        .readFileSync(wordsFile, "utf-8")
        .split("\n")
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean),
    );
    console.log("✅ Dictionary ready:", wordsCache.size, "words");
  }
  return wordsCache;
}

/* =========================
   CATEGORY LOADER FUNCTION
========================= */

const categoriesDir = path.join(__dirname, "categories");

function loadCategory(fileName) {
  const filePath = path.join(categoriesDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ Missing category file:", fileName);
    return new Set();
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return new Set(data.map((item) => item.toLowerCase().trim()));
}

/* =========================
   LOAD ALL CATEGORIES
========================= */

const datasets = {
  words,

  animals: loadCategory("animals.json"),
  carBrands: loadCategory("carBrands.json"),
  cities: loadCategory("cities.json"),
  countries: loadCategory("countries.json"),
  elements: loadCategory("elements.json"),
  fruits: loadCategory("fruits.json"),
  programmingLanguages: loadCategory("programmingLanguages.json"),
  spokenLanguages: loadCategory("spokenLanguages.json"),
  sports: loadCategory("sports.json"),
};

/* =========================
   DEBUG LOG
========================= */

console.log("📂 Categories Loaded:");
Object.keys(datasets).forEach((key) => {
  if (key !== "words") {
    console.log(`${key}:`, datasets[key].size);
  }
});

module.exports = datasets;

