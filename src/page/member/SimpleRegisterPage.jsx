import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './css/SimpleRegisterPage.css';

function SimpleRegisterPage() {
    const [searchParams] = useSearchParams();
    const nickNameInputRef = useRef(null);

    const [form, setForm] = useState({
        kakaoId: '',
        nickname: '',
        email: '',
        address: '',
        detailAddress: '',
        postcode: '',
    });

    const [emailMessage, setEmailMessage] = useState('');
    const [agreements, setAgreements] = useState({ terms: false, privacy: false });
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [agreedType, setAgreedType] = useState('');
    const [nicknameAvailable, setNicknameAvailable] = useState(null);

    useEffect(() => {
        const kakaoId = searchParams.get('kakaoId');
        const nickname = searchParams.get('nickname');

        setForm((prev) => ({
            ...prev,
            kakaoId: kakaoId || '',
            nickname: nickname || '',
            email: `${kakaoId}@kakao.oauth`,
        }));
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailMessage(
                emailPattern.test(value)
                    ? '올바른 형식의 이메일입니다.'
                    : '이메일 형식이 아닙니다.'
            );
        }
    };

    const checkNickName = async () => {
        if (!form.nickname) {
            alert("닉네임을 입력해주세요.");
            nickNameInputRef.current.focus();
            return;
        }

        try {
            const response = await axios.get(
                `https://ansimnuri-357149454857.asia-northeast3.run.app/api/member/checkNickName/${form.nickname}`
            );
            const exists = response.data;

            if (exists) {
                alert("이미 사용 중인 닉네임입니다.");
                setForm({ ...form, nickname: '' });
                setNicknameAvailable(false);
                nickNameInputRef.current.focus();
            } else {
                alert("사용 가능한 닉네임입니다.");
                setNicknameAvailable(true);
            }
        } catch (err) {
            alert("오류 발생");
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { kakaoId, nickname, email, address, detailAddress, postcode } = form;

        if (!kakaoId || !nickname || !email || !address || !detailAddress || !postcode) {
            alert("모든 필수 항목을 입력해주세요.");
            return;
        }

        if (!agreements.terms || !agreements.privacy) {
            alert("이용약관 및 개인정보 수집에 동의해주세요.");
            return;
        }

        try {
            await axios.post('http://localhost/api/member/kakaoSignup', {
                kakaoId, nickname, email, address, detailAddress, postcode
            });

            alert('회원가입 성공! 자동 로그인을 위해 카카오 로그인으로 이동합니다.');
            window.location.href = 'http://localhost/oauth2/authorization/kakao';
        } catch (err) {
            alert('회원가입 실패');
            console.error(err);
        }
    };

    const openAgreementModal = (type) => {
        setAgreedType(type);
        const content = type === 'terms'
            ? `📌 안심누리 이용약관\n\n제1조 (목적)...(이하 생략)` // 약관 내용 축약 가능
            : `[개인정보 수집 및 이용 동의서]\n\n1. 수집 항목...`;
        openModal(content);
    };

    const openModal = (content) => {
        setModalContent(content);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalContent('');
    };

    const confirmAndCheck = () => {
        if (agreedType) {
            setAgreements(prev => ({ ...prev, [agreedType]: true }));
        }
        closeModal();
    };

    const handlePostcode = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname) extraAddress += data.bname;
                    if (data.buildingName) {
                        extraAddress += (extraAddress ? `, ${data.buildingName}` : data.buildingName);
                    }
                    if (extraAddress) {
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

    return (
        <div className='kakaoBigBox'>
            <form onSubmit={handleSubmit}>
                <h2>카카오 간편회원가입</h2>

                <label className="formLabel">닉네임</label>
                <div className='kakaoBox'>
                    <input
                        type="text"
                        name="nickname"
                        value={form.nickname}
                        onChange={handleChange}
                        placeholder="닉네임"
                        ref={nickNameInputRef}
                    />
                    <button type="button" onClick={checkNickName}>닉네임 중복 확인</button>
                </div>
                {nicknameAvailable !== null && (
                    <div style={{ color: nicknameAvailable ? 'green' : 'red' }}>
                        {nicknameAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'}
                    </div>
                )}

                <label className="formLabel">이메일</label>
                <div className='kakaoBox'>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="이메일"
                    />
                    <div style={{ color: emailMessage.includes('올바른') ? 'green' : 'red' }}>{emailMessage}</div>
                </div>

                <label className="formLabel">우편번호</label>
                <div className='kakaoBox'>
                    <input type="text" name="postcode" value={form.postcode} readOnly placeholder="우편번호" />
                    <button type="button" className="btn" onClick={handlePostcode}>검색</button>
                </div>

                <label className="formLabel">주소</label>
                <div className='kakaoBox'>
                    <input type="text" name="address" value={form.address} readOnly placeholder="기본주소" />
                </div>

                <label className="formLabel">상세주소</label>
                <div className='kakaoBox'>
                    <input type="text" name="detailAddress" value={form.detailAddress} onChange={handleChange} placeholder="상세주소" />
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.terms}
                            onChange={() => setAgreements(prev => ({ ...prev, terms: !prev.terms }))}
                        />
                        이용약관 동의
                        <button type="button" onClick={() => openAgreementModal('terms')}>보기</button>
                    </label><br />
                    <label>
                        <input
                            type="checkbox"
                            checked={agreements.privacy}
                            onChange={() => setAgreements(prev => ({ ...prev, privacy: !prev.privacy }))}
                        />
                        개인정보 수집 동의
                        <button type="button" onClick={() => openAgreementModal('privacy')}>보기</button>
                    </label>
                </div>

                <button type="submit">회원가입 완료</button>

                {showModal && (
                    <div className="modalBackdrop" onClick={closeModal}>
                        <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                            <h3>약관 상세</h3>
                            <pre>{modalContent}</pre>
                            <button onClick={closeModal}>닫기</button>
                            <button onClick={confirmAndCheck}>확인</button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

export default SimpleRegisterPage;
