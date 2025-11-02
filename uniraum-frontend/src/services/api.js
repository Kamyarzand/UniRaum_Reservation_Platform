import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// ایجاد یک نمونه از axios با تنظیمات پایه
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// افزودن اینترسپتور برای اضافه کردن توکن به درخواست‌ها
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // هر دو فرمت توکن را ارسال می‌کنیم برای اطمینان
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-access-token'] = token; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// افزودن اینترسپتور برای نمایش خطاها در کنسول
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;