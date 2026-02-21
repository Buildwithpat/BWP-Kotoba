const { categories } = require("./data/loader");

/* =========================
   HELPER — Random Item
========================= */

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =========================
   RANDOM LETTER (valid ones)
   avoids rare letters like Q,X,Z
========================= */

const SAFE_LETTERS = "abcdefghijklmnopqrstuvwxyz"
  .split("")
  .filter((l) => !["q", "x", "z"].includes(l));

function getRandomLetter() {
  return randomItem(SAFE_LETTERS);
}

/* =========================
   WORD VALIDATION
========================= */

function isValidWord(word, usedWords = []) {
  if (!word) return false;

  word = word.toLowerCase();

  // must be alphabetical
  if (!/^[a-z]+$/.test(word)) return false;

  // cannot repeat
  if (usedWords.includes(word)) return false;

  return true;
}

/* =========================
   WORD DUEL RULE CHECK
========================= */

function validateWordDuel(word, rules, usedWords) {
  if (!isValidWord(word, usedWords)) return false;

  if (word.length !== rules.length) return false;

  if (rules.startLetter && word[0] !== rules.startLetter) return false;

  return true;
}

/* =========================
   CATEGORY VALIDATION
========================= */

function validateCategoryWord(word, category) {
  word = word.toLowerCase();

  if (!categories[category]) return false;

  return categories[category].includes(word);
}

/* =========================
   RANDOM CATEGORY QUESTION
========================= */

const CATEGORY_LIST = [
  "countries",
  "cities",
  "animals",
  "fruits",
  "sports",
  "programmingLanguages",
  "carBrands",
  "chemicalElements",
];

const EXTRA_SHIFT_CATEGORIES = ["spokenLanguages"];

function getRandomCategory() {
  const category = randomItem([...CATEGORY_LIST, ...EXTRA_SHIFT_CATEGORIES]);
  const word = randomItem(categories[category]);

  return {
    category,
    answer: word,
  };
}

/* =========================
   LETTER FORGE GENERATOR
========================= */

function scrambleWord(word) {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function generateLetterForgeRound() {
  const category = randomItem(CATEGORY_LIST);
  const word = randomItem(categories[category]);

  return {
    letters: scrambleWord(word),
    answer: word,
    category,
  };
}

/* =========================
   RANDOM SHIFT RULE GENERATOR
========================= */

function generateRandomShiftRule() {
  const type = randomItem(["letter", "category"]);

  if (type === "letter") {
    return {
      type: "letter",
      letter: getRandomLetter(),
      length: Math.floor(Math.random() * 4) + 4, // 4-7 letters
    };
  }

  const category = randomItem(CATEGORY_LIST);

  return {
    type: "category",
    category,
  };
}

/* =========================
   EXPORTS
========================= */

module.exports = {
  getRandomLetter,
  validateWordDuel,
  validateCategoryWord,
  getRandomCategory,
  generateLetterForgeRound,
  generateRandomShiftRule,
};
