import api from './api';

const signup = (username, email, password) => {
  return api.post('/auth/signup', {
    username,
    email,
    password,
  });
};

const login = (username, password) => {
  return api.post('/auth/signin', {
    username,
    password,
  })
  .then((response) => {
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  });
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

const isLoggedIn = () => {
  const user = getCurrentUser();
  return !!user;
};

const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

const isTeacher = () => {
  const user = getCurrentUser();
  return user && (user.role === 'teacher' || user.role === 'admin');
};

const AuthService = {
  signup,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  isAdmin,
  isTeacher,
};

export default AuthService;