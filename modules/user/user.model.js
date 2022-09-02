const mongoose = require("mongoose");
const constants = require("../../constants");

const OwnedPharmacySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
  },
  name: {
    type: String,
  },
});

const UserSchema = new mongoose.Schema(
  {
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
      validate: {
        validator: (value) => {
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            value
          );
        },
        message: (props) => `"${props.value}" is not a valid email address!`,
      },
    },
    birthday: {
      type: Date,
    },
    role: {
      type: String,
      required: [true, "User role is required!"],
      enum: {
        values: [
          constants.USER.ROLES.CUSTOMER,
          constants.USER.ROLES.PHARMACY_OWNER,
          constants.USER.ROLES.ADMIN,
        ],
        message: "Valid role is required!",
      },
    },
    pharmacies: {
      type: [OwnedPharmacySchema],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
