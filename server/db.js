const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://aakashpathakece063_db_user:patkotoba123@kotoba-cluster.bdjtfg2.mongodb.net/?appName=kotoba-cluster",
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

module.exports = mongoose;
