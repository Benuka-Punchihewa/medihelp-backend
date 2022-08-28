const mongoose = require("mongoose");

const AuthSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Please provide the password!"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true,
      ref: "User",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Auth", AuthSchema);
