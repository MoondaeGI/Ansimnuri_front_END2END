import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import caxios from '../../lib/caxios';
import './css/Login.css';
import { useAuthStore } from '../../store';
import { useEffect } from 'react';
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

  const [kakaoIdInput, setKakaoIdInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const KAKAO_REST_API_KEY = 'ff57aa7051dcd1d80b6e0f8fc712c345';
  const K_REDIRECT_URI = 'http://https://ansimnuri-357149454857.asia-northeast3.run.app//oauth2/authorization/kakao'; // 백엔드 OAuth2 설정 주소

  const KAKAO_AUTH_URL = `http://https://ansimnuri-357149454857.asia-northeast3.run.app//oauth2/authorization/kakao`;


  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleKakaoLogin = () => {

    window.location.href = "http://https://ansimnuri-357149454857.asia-northeast3.run.app//oauth2/authorization/kakao";
    // Spring Security가 제공하는 기본 경로
  };
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const id = params.get("id");
  const nickname = params.get("nickname");
  console.log({ token, id, nickname });
  if (token) {
    // 이미 회원인 경우 로그인 처리
    localStorage.setItem("token", token);
    setAuth(token, id);
    alert("카카오 로그인 성공");
    navigate("/mypage");
  } else if (id && nickname) {
    // 간편회원가입용 정보 세팅
    setKakaoIdInput(id);
    setNicknameInput(nickname);
  }
}, []);

  const handleSimpleSignup = async () => {
    try {
      await axios.post('https://ansimnuri-357149454857.asia-northeast3.run.app/api/member/kakaoSignup', {
        kakaoId: kakaoIdInput,
        nickname: nicknameInput,
      });
      alert("회원가입 성공! 다시 로그인 해주세요.");
      navigate('/login');
    } catch (err) {
      alert("간편회원가입 실패");
      console.error(err);
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://ansimnuri-357149454857.asia-northeast3.run.app/api/member/login', form);
      const { id, token } = response.data;
      setAuth(token, id);
      alert('로그인 성공');
      navigate('/');
    } catch (err) {
      console.error("로그인 실패:", err.response?.data || err.message);
      if (err.response.status === 403) {
        window.alert(err.response.data);
      } else {
        alert('아이디와 비밀번호를 확인해주세요');
      }
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
    <div className="loginContainer">
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
        <div className='buttonBox'>
          <button type="submit" disabled={forgotPwMode}>로그인</button>

          <button type="button" onClick={handleRegister}>회원가입</button>
            <div className="kakao" onClick={handleKakaoLogin}>
            <img src='/icons/kakao.png' className="kakaoImg" />
          </div>
          <p>
            <span onClick={() => setForgotIdMode(true)} className="forgotIdBtn">
              아이디찾기            </span>
           
            <span  onClick={() => setForgotPwMode(true)} className="forgotPasswordBtn">
              비밀번호찾기
            </span>
            {forgotPwMode && (
              <div className="passwordBox">
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
              <div className="passwordBox">
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
