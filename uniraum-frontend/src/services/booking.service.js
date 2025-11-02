import api from './api';

const createBooking = (bookingData) => {
  return api.post('/bookings', bookingData);
};

const getUserBookings = () => {
  return api.get('/bookings/user');
};

const cancelBooking = (id) => {
  return api.put(`/bookings/${id}/cancel`);
};

const createDamageReport = (reportData) => {
  return api.post('/damage-reports', reportData);
};

// Admin functions
const getAllBookings = (params = {}) => {
  return api.get('/admin/bookings', { params });
};

const deleteBooking = (id) => {
  return api.delete(`/admin/bookings/${id}`);
};

const updateBooking = (id, bookingData) => {
  return api.put(`/admin/bookings/${id}`, bookingData);
};

const getBookingById = (id) => {
  return api.get(`/admin/bookings/${id}`);
};

const getBookingsByDate = (date) => {
  return api.get(`/admin/bookings/date/${date}`);
};

const getBookingsByRoom = (roomId) => {
  return api.get(`/admin/bookings/room/${roomId}`);
};

const getBookingsByUser = (userId) => {
  return api.get(`/admin/bookings/user/${userId}`);
};

const BookingService = {
  createBooking,
  getUserBookings,
  cancelBooking,
  createDamageReport,
  
  // Admin functions
  getAllBookings,
  deleteBooking,
  updateBooking,
  getBookingById,
  getBookingsByDate,
  getBookingsByRoom,
  getBookingsByUser,
};

export default BookingService;