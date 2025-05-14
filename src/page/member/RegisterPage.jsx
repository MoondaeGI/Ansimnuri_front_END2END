import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/RegisterPage.css';

export const RegisterPage = () => {
  const navi = useNavigate();

  const [form, setForm] = useState({
    loginId: '',
    password: '',
    rePassword: '',
    nickname: '',
    email: '',
    postcode: '',
    address: '',
    detailAddress: ''
  });

  const [pwMessage, setPwMessage] = useState('');
  const [pwMatchMessage, setPwMatchMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const idInputRef = useRef(null);
  const nickNameInputRef = useRef(null);

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
      setPwMessage(
        !passwordPattern.test(value)
          ? '패스워드는 8자 이상이며, 영문과 숫자를 포함해야 합니다.'
          : ''
      );
    }

    if (name === 'rePassword' || (name === 'password' && form.rePassword)) {
      const pwToCheck = name === 'rePassword' ? value : form.rePassword;
      setPwMatchMessage(
        form.password !== pwToCheck
          ? '패스워드가 일치하지 않습니다.'
          : '패스워드가 일치합니다.'
      );
    }

    if (name === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailMessage(
        emailPattern.test(value)
          ? '올바른 형식의 이메일입니다.'
          : '이메일 형식이 아닙니다.'
      );
    }
  };

  const checkId = async () => {
    if (!form.loginId) {
      alert("아이디를 입력해주세요.");
      idInputRef.current.focus();
      return;
    }

    try {
      const response = await axios.get(`http://localhost/api/member/checkId/${form.loginId}`);
      const exists = response.data;

      if (exists) {
        alert("이미 사용 중인 아이디입니다.");
        setForm({ ...form, loginId: '' });
        idInputRef.current.focus();
      } else {
        alert("사용 가능한 아이디입니다.");
      }
    } catch (err) {
      alert("오류 발생");
      console.error(err);
    }
  };

  const checkNickName = async () => {
    if (!form.nickname) {
      alert("닉네임을 입력해주세요.");
      nickNameInputRef.current.focus();
      return;
    }

    try {
      const response = await axios.get(`http://localhost/api/member/checkNickName/${form.nickname}`);
      const exists = response.data;

      if (exists) {
        alert("이미 사용 중인 닉네임입니다.");
        setForm({ ...form, nickname: '' });
        nickNameInputRef.current.focus();
      } else {
        alert("사용 가능한 닉네임입니다.");
      }
    } catch (err) {
      alert("오류 발생");
      console.error(err);
    }
  };

  const handlePostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddress += data.bname;
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          }
          if (extraAddress !== '') {
            fullAddress += ` (${extraAddress})`;
          }
        }

        setForm((prev) => ({
          ...prev,
          postcode: data.zonecode,
          address: fullAddress
        }));
      }
    }).open();
  };
  const [agreedType, setAgreedType] = useState('');
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });
  const confirmAndCheck = () => {
    if (agreedType) {
      setAgreements(prev => ({ ...prev, [agreedType]: true }));
    }
    closeModal();
  };
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { loginId, password, rePassword, nickname, email, postcode, address, detailAddress } = form;

    if (!loginId || !password || !rePassword || !nickname || !email || !postcode || !address || !detailAddress) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      await axios.post('http://localhost:80/api/member/register', form);
      alert('회원가입 성공');
      navi("/");
    } catch (err) {
      alert('회원가입 실패');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2 className="text-xl font-bold mb-4">회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className='box'>
        아이디 <input name="loginId" ref={idInputRef} placeholder="아이디" onChange={handleChange} className="input" />
        <button className="btn" type="button" onClick={checkId}>중복확인</button>
        </div><br />
   <div className='box'>
        비밀번호 <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} className="input" /><br />
        <div className="text-red-500 text-sm">{pwMessage}</div>
</div>
   <div className='box'>
        비밀번호 재확인 <input name="rePassword" type="password" placeholder="비밀번호재확인" onChange={handleChange} className="input" />
        <div className="text-sm" style={{ color: pwMatchMessage.includes('일치하지') ? 'red' : 'green' }}>
          {pwMatchMessage}
        </div>
                </div>
         <div className='box'>
        닉네임 <input name="nickname" ref={nickNameInputRef} placeholder="닉네임" onChange={handleChange} className="input" />
        <button className="btn" type='button' onClick={checkNickName}>중복확인</button>
        </div><br />
         <div className='box'>
        이메일 <input type="email" name="email" onChange={handleChange} className="input" /></div><br />
        <div className="text-sm" style={{ color: emailMessage.includes('올바른') ? 'green' : 'red' }}>
          {emailMessage}
        </div>

        <div className="form-group">
          <label>우편번호</label>
          <div className="input-with-btn">
            <input type="text" className="input" name="postcode" value={form.postcode} readOnly />
            <button type="button" className="btn"onClick={handlePostcode}>검색</button>
          </div>
        </div>

        <div className="form-group">
          <label>주소</label>
          <input type="text" className="input" name="address" value={form.address} readOnly />
        </div>

        <div className="form-group">
          <label>상세주소</label>
          <input type="text" className="input" name="detailAddress" value={form.detailAddress} onChange={handleChange} />
        </div>

        <div className="agreement-section mt-4">
          <label>
            <input type="checkbox" required /> 이용약관 동의
            <button type="button" onClick={() => openModal('이용약관 내용입니다.')}>보기</button>
          </label><br />
          <label>
            <input type="checkbox" required /> 개인정보 수집방침 동의
            <button type="button" onClick={() => openModal(`
[개인정보 수집 및 이용 동의서]

1. 수집 항목:
- 필수: 이름, 아이디, 비밀번호, 이메일, 주소, 연락처
- 선택: 마케팅 수신 동의 여부 등

2. 수집 목적:
- 회원 가입 및 본인 확인
- 서비스 제공 및 이용자 식별
- 공지사항 전달 및 문의 응대
- 마케팅 정보 안내 (선택 항목 해당 시)

3. 보유 및 이용 기간:
- 회원 탈퇴 시까지
- 단, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관

4. 동의 거부 권리 및 불이익:
- 개인정보 제공을 거부할 권리가 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.

※ 위 내용을 충분히 이해하였으며, 개인정보 수집 및 이용에 동의합니다.
            `)}>보기</button>
          </label><br />
       
        </div>

        <button type="submit"className="btn" >가입하기</button>
      </form>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>약관 상세</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{modalContent}</pre>
            <div className="modal-buttons">
              <button onClick={closeModal}>닫기</button>
              <button onClick={confirmAndCheck}>동의</button>
            </div>


          </div>
        </div>
      )}
    </div>
  );
};