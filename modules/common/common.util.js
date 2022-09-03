require("dotenv").config();

const capitalizeFirstLetter = (str) => {
  if (!str) return;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const generateFirebaseStorageURL = (fileName) => {
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${fileName}?alt=media`;
};

module.exports = { capitalizeFirstLetter, generateFirebaseStorageURL };
