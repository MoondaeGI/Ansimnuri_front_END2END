import { useEffect } from 'react';
import axios from 'axios'; // 또는 caxios
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

function KakaoRedirect() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const kakaoId = params.get('id');
    const nickname = params.get('nickname');

    if (!token) {
      //  토큰이 없으면 → 간편회원가입 화면으로 이동
      navigate(`/SimpleRegisterPage?kakaoId=${kakaoId}&nickname=${nickname}`);
      return;
    }

    //  토큰이 있으면 → 로그인 처리
    setAuth(token, kakaoId);
    localStorage.setItem("token", token);
    navigate('/');
  }, []);

  return <p>카카오 로그인 처리 중입니다...</p>;
}

export default KakaoRedirect;