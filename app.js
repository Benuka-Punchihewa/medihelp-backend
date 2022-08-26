const express = require("express");
const cors = require("cors");
const connectDB = require("./util/dbConection");
const constants = require("./util/constants");
require("dotenv").config();
require("express-async-errors");

// import routes
const userRoutes = require("./modules/user/user.route");

const app = express();

app.use(express.json());
app.use(cors());

// define routes
app.use(constants.API.PREFIX.concat("/users"), userRoutes);

// not found route
app.use((req, res, next) => {
  throw new NotFoundError("API Endpoint Not Found!");
});

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
