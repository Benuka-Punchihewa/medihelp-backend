const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  return mongoose.connect(process.env.MONGODB_URI);
};

module.exports = { connectDB };
