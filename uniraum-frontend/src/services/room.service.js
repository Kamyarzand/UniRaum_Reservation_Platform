import api from './api';

const getAllRooms = () => {
  return api.get('/rooms');
};

const getRoomById = (id) => {
  return api.get(`/rooms/${id}`);
};

const getAvailableRooms = (startTime, endTime, filters = {}) => {
  let query = `/rooms/available?startTime=${startTime}&endTime=${endTime}`;
  
  if (filters.capacity) query += `&capacity=${filters.capacity}`;
  if (filters.type) query += `&type=${filters.type}`;
  if (filters.building) query += `&building=${filters.building}`;
  if (filters.hasComputers) query += `&hasComputers=${filters.hasComputers}`;
  if (filters.hasProjector) query += `&hasProjector=${filters.hasProjector}`;
  
  return api.get(query);
};

const getRoomBookings = (roomId, startDate, endDate) => {
  let query = `/rooms/${roomId}/bookings`;
  
  if (startDate && endDate) {
    query += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  return api.get(query);
};

const createRoom = (roomData) => {
  return api.post('/rooms', roomData);
};

const updateRoom = (id, roomData) => {
  return api.put(`/rooms/${id}`, roomData);
};

const deleteRoom = (id) => {
  return api.delete(`/rooms/${id}`);
};

const RoomService = {
  getAllRooms,
  getRoomById,
  getAvailableRooms,
  getRoomBookings,
  createRoom,
  updateRoom,
  deleteRoom
};

export default RoomService;