import api from './api';

const getUserProfile = () => {
  return api.get('/user/profile');
};

const updateUserProfile = (data) => {
  return api.put('/user/profile', data);
};

const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  return api.post('/user/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const deleteProfilePicture = () => {
  return api.delete('/user/profile/picture');
};

const getAllUsers = () => {
  return api.get('/users');
};

const getUserById = (userId) => {
  return api.get(`/users/${userId}`);
};

const createUser = (userData) => {
  return api.post('/users', userData);
};

const updateUser = (userId, userData) => {
  return api.put(`/users/${userId}`, userData);
};

const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`);
};

const updateUserRole = (userId, role) => {
  return api.put(`/users/${userId}/role`, { role });
};

const UserService = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
};

export default UserService;