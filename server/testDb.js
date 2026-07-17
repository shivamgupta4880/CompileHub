require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/compilehub";

console.log(`Attempting to connect to MongoDB at: ${uri}`);
mongoose.connect(uri)
  .then(() => {
    console.log("✅ Connection successfully established!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    console.error(err);
    process.exit(1);
  });
