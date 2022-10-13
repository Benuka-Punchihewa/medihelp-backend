const constants = {
  API: {
    PREFIX: "/api/v1",
  },
  USER: {
    ROLES: {
      CUSTOMER: "customer",
      PHARMACY_OWNER: "pharmacy owner",
      ADMIN: "admin",
    },
  },
  ORDER: {
    STATUS: {
      PENDING: "pending",
      REQUIRES_CUSTOMER_CONFIRMATION: "requires_customer_confimation",
      CONFIRMED: "confirmed",
      CANCELLED: "cancelled",
      COMPLETED: "completed",
    },
  },
  PAYMENT: {
    METHODS: {
      ONLINE: "online",
      CASH_ON_DELIVERY: "cash_on_delivery",
    },
    PAYMENT_CURRENCY: "LKR",
  },
  MEDICINE: {
    TYPE: {
      PRESCRIPTION: "prescription",
      NON_PRESCRIPTION: "non-prescription",
    },
  },
  DELIVERY: {
    CHARGE_PER_KM: 10,
  },
  STRIPE_CHECKOUT_SESSION: {
    PAYMENT_STATUS: {
      PAID: "paid",
    },
  },
  DAYS: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

module.exports = constants;
