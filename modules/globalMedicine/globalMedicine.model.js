const mongoose = require("mongoose");
const constants = require("../../constants");

const GlobalMedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [50, "Name should not exceed 50 characters!"],
      required: [true, "Name is required!"],
    },
    strength: {
      type: Number,
      required: [true, "Strength is required!"],
    },
    brand: {
      type: String,
      maxlength: [50, "Brand name should not exceed 50 characters!"],
      required: [true, "Brand name is required!"],
    },
    manufacturer: {
      type: String,
      maxlength: [50, "Manufacturer name should not exceed 50 characters!"],
      required: [true, "Manufacturer name is required!"],
    },
    type: {
      type: String,
      enum: {
        values: [
          constants.MEDICINE.TYPE.PRESCRIPTION,
          constants.MEDICINE.TYPE.NON_PRESCRIPTION,
        ],
        message: "Valid medicine type is required!",
      },
      required: [true, "Medicine type is required!"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("GlobalMedicine", GlobalMedicineSchema);
