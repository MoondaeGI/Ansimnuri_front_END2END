import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Login.css';
import { useAuthStore } from '../../store/useAuthStore';

export const Login = () => {
  const [form, setForm] = useState({ loginId: '', password: '' });
  const navigate = useNavigate();
const { setAuth } = useAuthStore();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost/api/member/login', form);

     setAuth(response.data);
      console.log("로그인 응답:", response.data);


      alert('로그인 성공');

      window.location.href = '/';

    } catch (err) {
     console.error("로그인 실패:", err.response?.data || err.message);
      alert('아이디와 비밀번호를 확인해주세요');
    }
  };

  const handleRegister = () => {
    navigate('/RegisterPage'); // 회원가입 페이지로 이동
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>아이디</label>
          <input
            type="text"
            name="loginId"
            value={form.loginId}
            onChange={handleChange}
            placeholder="아이디를 입력하세요"
          />
        </div>
        <div>
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <div>
          <button type="submit">로그인</button>
          <button type="button" onClick={handleRegister}>회원가입</button>
        </div>
      </form>
    </div>
  );
};
