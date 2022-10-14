require("dotenv").config();

const capitalizeFirstLetter = (str) => {
  if (!str) return;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const generateFirebaseStorageURL = (fileName) => {
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${fileName}?alt=media`;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
// This function uses the Haversine formula
// Formula Ref : http://www.movable-type.co.uk/scripts/latlong.html
const getDistanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2 - lat1);
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Distance in km
  return R * c;
};

const arrPaginate = (array, pagable) => {
  const { limit, page } = pagable;
  const content = array.slice((page - 1) * limit, page * limit);

  const totalElements = array.length;

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / limit),
  };
};

const addLeadingZeros = (number, length) => {
  return String(number).padStart(length, "0");
};

module.exports = {
  capitalizeFirstLetter,
  generateFirebaseStorageURL,
  deg2rad,
  getDistanceBetweenPoints,
  arrPaginate,
  addLeadingZeros,
};
