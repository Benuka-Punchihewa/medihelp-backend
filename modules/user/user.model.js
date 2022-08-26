const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    maxlength: [50, "First name should not exceed 50 characters!"],
    required: [true, "First name is required!"],
  },
  lastName: {
    type: String,
    maxlength: [50, "Last name should not exceed 50 characters!"],
    required: [true, "Last name is required!"],
  },
  NIC: {
    type: String,
    maxlength: [20, "NIC should not exceed 20 characters!"],
    required: [true, "NIC is required!"],
  },
  address: {
    type: String,
    maxlength: [100, "Address should not exceed 100 characters!"],
    required: [true, "Address is required!"],
  },
  mobile: {
    type: String,
    maxlength: [20, "Mobile number should not exceed 20 characters!"],
    required: [true, "Mobile number is required!"],
  },
  email: {
    type: String,
    unique: true,
    maxlength: [50, "Email should not exceed 50 characters!"],
    required: [true, "Email is required!"],
  },
  Birthday: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);
