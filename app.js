const express = require("express");
const cors = require("cors");
const connectDB = require("./util/dbConection");
require("dotenv").config();
require("express-async-errors");

// import routes

const app = express();

app.use(express.json());
app.use(cors());

// define routes

const start = async () => {
  const port = process.env.PORT || 5001;
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`SERVER IS LISTENING ON PORT ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

start();