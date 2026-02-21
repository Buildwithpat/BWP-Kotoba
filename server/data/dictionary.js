const fs = require("fs");
const path = require("path");

const wordSet = new Set();

const filePath = path.join(__dirname, "words.txt");

const words = fs.readFileSync(filePath, "utf-8").split("\n");

words.forEach((word) => {
  wordSet.add(word.trim().toLowerCase());
});

console.log("📚 Dictionary Loaded:", wordSet.size, "words");

module.exports = wordSet;
