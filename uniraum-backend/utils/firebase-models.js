const { db } = require('../config/firebase.config');

// Collection names definition
const collections = {
  USERS: 'users',
  ROOMS: 'rooms',
  BOOKINGS: 'bookings',
  DAMAGE_REPORTS: 'damage_reports'
};

// Helper function for working with collections
const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

module.exports = {
  collections,
  getCollection
};