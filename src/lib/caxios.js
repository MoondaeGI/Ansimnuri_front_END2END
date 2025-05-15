import axios from 'axios';

const caxios = axios.create({
  baseURL: 'http://localhost', // 필요한 base URL
});

// 요청 인터셉터 설정
caxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default caxios;