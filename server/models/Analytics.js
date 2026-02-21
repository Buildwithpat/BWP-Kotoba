const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  totalGames: { type: Number, default: 50 },
  totalRounds: { type: Number, default: 300 },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
