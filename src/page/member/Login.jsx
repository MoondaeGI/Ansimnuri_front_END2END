import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import caxios from '../../lib/caxios';
import './css/Login.css';
import { useAuthStore } from '../../store';

export const Login = () => {
  const [form, setForm] = useState({ loginId: '', password: '' });
  const [forgotPwMode, setForgotPwMode] = useState(false);
  const [forgotIdMode, setForgotIdMode] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const [idForReset, setIdForReset] = useState('');

  const [emailVerified, setEmailVerified] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newLoginId, setNewLoginId] = useState('');
const KAKAO_REST_API_KEY = 'ff57aa7051dcd1d80b6e0f8fc712c345';
const REDIRECT_URI = 'http://localhost:8080/oauth2/authorization/kakao'; // 백엔드 OAuth2 설정 주소

const KAKAO_AUTH_URL = `http://localhost:8080/oauth2/authorization/kakao`;


  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost/api/member/login', form);
      const { id, token } = response.data;
      setAuth(token, id);
      alert('로그인 성공');
      navigate('/');
    } catch (err) {
      console.error("로그인 실패:", err.response?.data || err.message);
      alert('아이디와 비밀번호를 확인해주세요');
    }
  };

  const handleCheckingEmail = async () => {
    try {
      const res = await caxios.post('/api/member/checkEmail', { email: emailForReset });
      if (res.data) {
        alert('이메일이 확인되었습니다. 아이디를 재설정해주세요.');
        setEmailVerified(true);
      } else {
        alert('등록되지 않은 이메일입니다.');
      }
    } catch (err) {
      alert('이메일 확인 중 오류 발생');
    }
  };

  const handleCheckingId = async () => {
    try {
      const res = await caxios.get(`/api/member/checkId/${idForReset}`);
      if (res.data) {
        alert('아이디가 확인되었습니다. 비밀번호를 재설정해주세요.');
        setIdVerified(true);
      } else {
        alert('등록되지 않은 아이디입니다.');
      }
    } catch (err) {
      alert(' 아이디 확인 중 오류 발생');
    }
  };

  const changeLoginIdByemail = async () => {
    try {
      await caxios.post('/api/member/email/changeLoginId', { loginId: newLoginId, email: emailForReset });
      alert('아이디가 변경되었습니다.');
      setIsCodeVerified(false);
      setForgotPwMode(false);
      setEmailVerified(false);
      setIdVerified(false);
      setNewPassword('');
      setIdForReset('');
      setEmailForReset('');

    } catch (err) {
      alert('아이디 변경 실패');
    }
  };
  const changePasswordById = async () => {
    try {
      await caxios.post('/api/member/id/changePassword', { password: newPassword, loginId: idForReset });
      alert('비밀번호가 변경되었습니다.');
      setIsCodeVerified(false);
      setForgotPwMode(false);
      setEmailVerified(false);
      setIdVerified(false);
      setNewPassword('');


      setIdForReset('');
    } catch (err) {
      alert('비밀번호 변경 실패');
    }
  };

  const handleRegister = () => {
    navigate('/RegisterPage');
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
          <button type="submit" disabled={forgotPwMode}>로그인</button>

            <button type='button' onClick={()=>window.location.href= KAKAO_AUTH_URL}>카카오로 로그인</button>
  
          <button type="button" onClick={handleRegister}>회원가입</button>
          <p>
            <button type="button" onClick={() => setForgotIdMode(true)} className="forgotIdBtn">
              아이디가 기억나지 않으세요? 🤔
            </button>
            <button type="button" onClick={() => setForgotPwMode(true)} className="forgotPasswordBtn">
              비밀번호가 기억나지 않으세요? 🤔
            </button>
            {forgotPwMode && (
              <div className="forgot-password-box">
                {!idVerified ? (
                  <p>
                    <strong>회원가입 시 입력한 아이디 입력:</strong>
                    <input

                      value={idForReset}
                      onChange={(e) => setIdForReset(e.target.value)}
                    />
                    <button type="button" onClick={handleCheckingId}>아이디 확인</button>
                  </p>
                ) : (
                  <p>
                    <strong>새 비밀번호 입력:</strong>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="button" onClick={changePasswordById}>비밀번호 재설정</button>
                  </p>
                )}
              </div>
            )}
            {forgotIdMode && (
              <div className="forgot-password-box">
                {!emailVerified ? (
                  <p>
                    <strong>회원가입 시 이메일 입력:</strong>
                    <input
                      type="email"
                      value={emailForReset}
                      onChange={(e) => setEmailForReset(e.target.value)}
                    />
                    <button type="button" onClick={handleCheckingEmail}>이메일 확인</button>
                  </p>
                ) : (
                  <p>
                    <strong>새 로그인 아이디 입력:</strong>
                    <input
                      value={newLoginId}
                      onChange={(e) => setNewLoginId(e.target.value)}
                    />
                    <button type="button" onClick={changeLoginIdByemail}>아이디 재설정</button>
                  </p>
                )}
              </div>
            )}
          </p>
        </div>
      </form>
    </div>
  );
};
