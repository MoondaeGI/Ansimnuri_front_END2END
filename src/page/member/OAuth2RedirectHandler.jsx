// src/pages/OAuth2RedirectHandler.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

export const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const id = url.searchParams.get('id');

    if (token) {
      setAuth(token, id);
      localStorage.setItem('accessToken', token);
      navigate('/'); // 홈으로 이동
    } else {
      alert('카카오 로그인 실패');
      navigate('/login');
    }
  }, []);

  return <p>로그인 처리 중입니다...</p>;
};
