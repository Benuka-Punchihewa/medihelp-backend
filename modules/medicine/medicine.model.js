const mongoose = require("mongoose");
const GlobalMedicine = require("../globalMedicine/globalMedicine.model");

const MedicineSchema = new mongoose.Schema(
  {
    global: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "GlobalMedicine",
      },
      doc: {
        type: GlobalMedicine.schema,
        required: true,
      },
    },
    pharmacy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Pharmacy",
      },
    },
    stockLevel: {
      type: Number,
      required: [true, "Stock level is required!"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required!"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Medicine", MedicineSchema);
