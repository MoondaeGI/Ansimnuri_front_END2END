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
const [isIdAvailable, setIsIdAvailable] = useState(null);
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
  if (name === 'loginId') {
  setIsIdAvailable(null);
}

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
              setIsIdAvailable(false);
        setForm({ ...form, loginId: '' });
        idInputRef.current.focus();
      } else {
        alert("사용 가능한 아이디입니다.");
             setIsIdAvailable(true);
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


  const openAgreementModal = (type) => {
    setAgreedType(type);
    if (type === 'terms') {
      openModal(`📌 안심누리 이용약관
제1조 (목적)
이 약관은 "안심누리(이하 '회사')"가 제공하는 서비스의 이용조건 및 절차, 이용자와 회사 간의 권리∙의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (서비스의 정의)
회사는 이용자에게 범죄 예방을 위한 정보 제공, 위치 기반 안전 경로 안내, 커뮤니티 기능 등을 제공합니다.

제3조 (이용자의 의무)

타인의 개인정보를 도용하거나 부정한 행위를 해서는 안됩니다.

서비스 내 제공되는 정보의 무단 복제 및 상업적 이용을 금합니다.

범죄와 관련된 허위신고, 비방, 협박 등은 이용 제한 조치가 될 수 있습니다.

제4조 (서비스 이용의 제한)
회사는 다음과 같은 경우 사전 통보 없이 이용을 제한하거나 해지할 수 있습니다.

타인 명의 도용, 허위 정보 등록

서비스 방해 행위 또는 범죄 목적의 사용

기타 회사의 정책상 위반으로 판단되는 경우

제5조 (개인정보 보호)
이용자의 개인정보는 관련 법령에 따라 보호되며, 회사의 [개인정보처리방침]에 따릅니다.

제6조 (책임 제한)
회사는 이용자의 부주의로 발생한 손해에 대해 책임을 지지 않으며, 제3자와의 분쟁에도 관여하지 않습니다.

제7조 (약관의 변경)
회사는 약관을 사전 고지 없이 변경할 수 있으며, 변경된 내용은 홈페이지를 통해 공지됩니다. 변경 이후에도 서비스를 계속 이용하는 경우, 변경된 약관에 동의한 것으로 간주됩니다.`); // 전체 약관 내용
    } else if (type === 'privacy') {
      openModal(`[개인정보 수집 및 이용 동의서]

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

※ 위 내용을 충분히 이해하였으며, 개인정보 수집 및 이용에 동의합니다.`);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const { loginId, password, rePassword, nickname, email, postcode, address, detailAddress } = form;

  // 정규식 검사
  const pwValid = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 if (isIdAvailable === null) {
    alert("아이디 중복 확인을 해주세요.");
    idInputRef.current.focus();
    return;
  }
   if (isIdAvailable === false) {
    alert("이미 사용 중인 아이디입니다. 아이디를 다시 입력해주세요.");
    idInputRef.current.focus();
    return;
  }
  if (!loginId || !password || !rePassword || !nickname || !email || !postcode || !address || !detailAddress) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  if (!pwValid) {
    alert("비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.");
    return;
  }

  if (password !== rePassword) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (!emailValid) {
    alert("올바른 이메일 형식이 아닙니다.");
    return;
  }

  if (!agreements.terms || !agreements.privacy) {
    alert("이용약관 및 개인정보 수집에 동의해주세요.");
    return;
  }

  try {
    await axios.post('http://localhost/api/member/register', form);
    alert('회원가입 성공');
    navi("/");
  } catch (err) {
    alert('회원가입 실패');
    console.error(err);
  }
};


  return (
    <div className="container">

      <div className='innerBox'>
      <h2 className="text-xl font-bold mb-4">회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className='box'>
            <label className="formLabel">아이디</label> <input name="loginId" ref={idInputRef} placeholder="아이디" onChange={handleChange} className="input" />
            <button className="btn" type="button" onClick={checkId}>중복확인</button>
          </div><br />
          <div className='box'>
            <label className="formLabel">비밀번호</label> <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} className="input" /><br />
            <div className="text-red-500 text-sm">{pwMessage}</div>
          </div>
          <div className='box'>
            <label className="formLabel">비밀번호 재확인</label><input name="rePassword" type="password" placeholder="비밀번호재확인" onChange={handleChange} className="input" />
            <div className="text-sm" style={{ color: pwMatchMessage.includes('일치하지') ? 'red' : 'green' }}>
              {pwMatchMessage}
            </div>
          </div>
          <div className='box'>
            <label className="formLabel">닉네임</label><input name="nickname" ref={nickNameInputRef} placeholder="닉네임" onChange={handleChange} className="input" />
            <button className="btn" type='button' onClick={checkNickName}>중복확인</button>
          </div>
          <div className='box'>
            <label className="formLabel">이메일</label><input type="email" name="email" onChange={handleChange} className="input" /></div><br />
          <div className="text-sm" style={{ color: emailMessage.includes('올바른') ? 'green' : 'red' }}>
            {emailMessage}
          </div>

          <div className="box">
            <label className="formLabel">우편번호</label>
            <input type="text" className="input" name="postcode" value={form.postcode} readOnly />
            <button type="button" className="btn" onClick={handlePostcode}>검색</button>
          </div>

          <div className="box">
            <label className="formLabel">주소</label>
            <input type="text" className="input" name="address" value={form.address} readOnly />
          </div>

          <div className="box">
            <label className="formLabel">상세주소</label>
            <input type="text" className="input" name="detailAddress" value={form.detailAddress} onChange={handleChange} />
          </div>

          <div className="agreementSection mt-4">
            <label>
              <input
                type="checkbox"
                checked={agreements.terms}
                onChange={() =>
                  setAgreements(prev => ({ ...prev, terms: !prev.terms }))
                }
                required
              /> 이용약관 동의
              <button type="button" className="btn" onClick={() => openAgreementModal('terms')}>보기</button>
            </label><br />

            <label>
              <input
                type="checkbox"
                checked={agreements.privacy}
                onChange={() =>
                  setAgreements(prev => ({ ...prev, privacy: !prev.privacy }))
                }
                required
              /> 개인정보 수집방침 동의
              <button type="button" className="btn" onClick={() => openAgreementModal('privacy')}>보기</button>
            </label><br />
            <button type="submit" className="btn" >가입하기</button>
          </div>


        </form>

        {showModal && (
          <div className="modalBackdrop" onClick={closeModal}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h3>상세 동의서</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{modalContent}</pre>
              <div className="modalButtons">
                <button onClick={closeModal}>닫기</button>
                <button onClick={confirmAndCheck}>확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};