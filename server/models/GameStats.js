const mongoose = require("mongoose");

const gameStatsSchema = new mongoose.Schema({
  players: Number,
  rounds: Number,
  mode: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GameStats", gameStatsSchema);
