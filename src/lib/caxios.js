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

caxios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response.status;
      switch (status) {
        case 401:
          window.alert(error.response.data.message);
          break;
        case 403:
          window.alert(error.response.data.message);
          break;
      }

      return Promise.reject(error);
    }
)

export default caxios;