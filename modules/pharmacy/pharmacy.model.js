const mongoose = require("mongoose");

const PharmacySchema = mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [100, "Pharmacy name should not exceed 100 characters!"],
      required: [true, "Pharmacy name is required!"],
    },
    registrationNumber: {
      type: String,
      maxlength: [50, "Pharmacy name should not exceed 50 characters!"],
      required: [true, "Pharmacy registration number is required!"],
      unique: true,
    },
    address: {
      type: String,
      maxlength: [150, "Pharmacy address should not exceed 150 characters!"],
      required: [true, "Pharmacy address is required!"],
    },
    contactNumber: {
      type: String,
      maxlength: [
        20,
        "Pharmacy contact number should not exceed 20 characters!",
      ],
      required: [true, "Pharmacy contact number is required!"],
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
    image: {
      type: String,
    },
    location: {
      latitude: {
        type: Number,
        required: [true, "latitudes are missing!"],
      },
      longitude: {
        type: Number,
        required: [true, "Logitudes are missing!"],
      },
    },
    owner: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Pharmacy", PharmacySchema);
