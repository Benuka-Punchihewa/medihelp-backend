const mongoose = require("mongoose");
const constants = require("../../constants");

const OrderedMedicineSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
  },
  globalMedicine: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalMedicine",
    },
    name: { type: String },
  },
  quantity: {
    type: Number,
  },
  availability: {
    type: Boolean,
  },
  subTotal: {
    type: Number,
  },
  suggession: {
    type: Object,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    pharmacy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pharmacy",
        required: [true, "Pharmacy ID is required!"],
      },
      name: {
        type: String,
        // TODO: uncomment this
        // required: [true, "Pharmacy name is required!"],
      },
    },
    status: {
      type: String,
      required: [true, "Order status is required!"],
      enum: {
        values: [
          constants.ORDER.STATUS.PENDING,
          constants.ORDER.STATUS.REQUIRES_CUSTOMER_CONFIRMATION,
          constants.ORDER.STATUS.CONFIRMED,
          constants.ORDER.STATUS.CANCELLED,
          constants.ORDER.STATUS.COMPLETED,
        ],
        message: "Valid status is required!",
      },
    },
    customer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Customer ID is required!"],
      },
    },
    prescriptionSheet: {
      type: String,
      required: [true, "Prescription sheet is required!"],
    },
    medicines: {
      type: [OrderedMedicineSchema],
      default: [],
    },
    patient: {
      name: {
        type: String,
        required: [true, "Name is required!"],
        maxlength: [100, " Name should not exceed 100 characters!"],
      },
      NIC: {
        type: String,
        required: [true, "NIC number is required!"],
        maxlength: [20, "NIC number should not exceed 20 characters!"],
      },
      email: {
        type: String,
        maxlength: [50, "Email number should not exceed 50 characters!"],
      },
      contactNumber: {
        type: String,
        required: [true, "Contact number is required!"],
        maxlength: [20, "contact number should not exceed 20 characters!"],
      },
    },
    delivery: {
      address: {
        type: String,
        maxlength: [150, "Address should not exceed 150 characters!"],
        required: [true, "Address is required!"],
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
    },
    payment: {
      method: {
        type: String,
        enum: {
          values: [
            constants.PAYMENT.METHODS.ONLINE,
            constants.PAYMENT.METHODS.CASH_ON_DELIVERY,
          ],
          message: "Valid payment method is required!",
        },
      },
      status: {
        type: Boolean,
        required: [true, "Payment status is required!"],
        default: false,
      },
      subtotal: {
        type: Number,
      },
      total: {
        type: Number,
      },
      delivery: {
        type: Number,
      },
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
