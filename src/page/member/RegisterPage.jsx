import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

const RegisterPage = () => {
  const navi = useNavigate();

  const [form, setForm] = useState({
    loginId: '',
    password: '',
    nickname: '',
    email: '',
    postcode: '',
    address: '',
    detailAddress: ''
  });

  const [pwMessage, setPwMessage] = useState('');
  const [rePwMessage, setRePwMessage] = useState('');
  const [idMessage, setIdMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [pwMatchMessage, setPwMatchMessage] = useState('');

  const idInputRef = useRef(null);
  const nickNameInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const { loginId, password, rePassword, nickname, email, postcode, address, detailAddress } = form;

    // if (
    //   !loginId || !password || !rePassword || !nickname || !email ||
    //   !postcode || !address || !detailAddress
    // ) {
    //   alert("모든 필수 항목을 입력해주세요.");
    //   return;
    // }
    axios.post('http://localhost:80/api/member/register', form)
      .then(() => {
        alert('회원가입 성공');
        navi("/");
      })
 
  };

  const handleCheckPassword = () => {
    if (form.password === '' || form.rePassword === '') {
      setPwMatchMessage('비밀번호를 모두 입력해주세요.');
    } else if (form.password !== form.rePassword) {
      setPwMatchMessage('❌ 패스워드가 일치하지 않습니다.');
    } else {
      setPwMatchMessage('✅ 패스워드가 일치합니다.');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setIdMessage('');
    setIsAvailable(null);

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
      setRePwMessage(
        form.password !== pwToCheck
          ? '패스워드가 일치하지 않습니다.'
          : ''
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
      const response = await axios.get(`http://localhost/api/member/checkId/${form.id}`);
      const exists = response.data;

      if (exists === true) {
        alert("이미 사용 중인 아이디입니다.");
        setForm({ ...form, id: '' });
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

      if (exists === true) {
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

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">회원가입</h2>
      <form onSubmit={handleSubmit}>
        아이디 <input name="loginId" ref={idInputRef} placeholder="아이디" onChange={handleChange} className="input" />
        <button className="btn" type="button" onClick={checkId}>중복확인</button><br />

        비밀번호 <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} className="input" /><br />
        <div className="text-red-500 text-sm">{pwMessage}</div>

        비밀번호 재확인 <input name="rePassword" type="password" placeholder="비밀번호재확인" onChange={handleChange} className="input" />
        <button type="button" onClick={handleCheckPassword}>확인</button><br />
        <div className="text-sm" style={{ color: pwMatchMessage.includes('일치하지') ? 'red' : 'green' }}>
          {pwMatchMessage}
        </div>

        {/* 이름 <input name="name" placeholder="이름" onChange={handleChange} className="input" /><br /> */}
        닉네임 <input name="nickname" ref={nickNameInputRef} placeholder="닉네임" onChange={handleChange} className="input" />
        <button className="btn" type='button' onClick={checkNickName}>중복확인</button><br />
        이메일<input type="email" name='email' onChange={handleChange}></input>
        <div className="form-group">
          <label>우편번호</label>
          <div className="input-with-btn">
            <input type="text" className="input" id="postcode" name="postcode" value={form.postcode} readOnly placeholder="우편번호" />
            <button type="button" onClick={handlePostcode} className="postBtn primary" id="postBtn">검색</button>
          </div>
        </div>

        <div className="form-group">
          <label>주소</label>
          <input type="text" className="input" name="address" value={form.address} readOnly placeholder="기본 주소" />
        </div>

        <div className="form-group">
          <label>상세주소</label>
          <input type="text" className="input" name="detailAddress" value={form.detailAddress} onChange={handleChange} placeholder="상세 주소를 입력하세요" />
        </div>

        <button type="submit" className="btn">가입하기</button>
      </form>
    </div>
  );
};

export default RegisterPage;
