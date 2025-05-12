import React, { useEffect, useState } from 'react';
import caxios from '../../lib/caxios';
import { useAuthStore } from '../../store/useAuthStore';
import './css/MyPage.css';

export const MyPage = () => {
  const [member, setMember] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwMatchMessage, setPwMatchMessage] = useState('');
  const [memberData, setMemberData] = useState({
    nickname: '',
    address: '',
    detailAddress: '',
    postcode: ''
  });

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await caxios.get('http://localhost/api/member/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMember(res.data);
        setMemberData({
          nickname: res.data.nickname,
          address: res.data.address,
          detailAddress: res.data.detailAddress,
          postcode: res.data.postcode
        });
      } catch (err) {
        alert('로그인이 필요합니다.');
      }
    };
    fetchMember();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({ ...prev, [name]: value }));
  };

  const checkNickname = async () => {
    try {
      const res = await caxios.post('/api/member/checkNickName/${memberData.nickname}');
      if (res.data.available) {
        alert('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      } else {
        alert('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      }
    } catch (err) {
      alert('중복 확인 중 오류 발생');
    }
  };

  const openAddressPopup = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        setMemberData(prev => ({
          ...prev,
          address: data.address,
          postcode: data.zonecode
        }));
      }
    }).open();
  };

  const requestEmailVerification = async () => {
    try {
      await caxios.post('/api/member/request-email-auth');
      alert('인증 메일이 전송되었습니다.');
    } catch (err) {
      alert('메일 전송 실패');
    }
  };

  const changePassword = async () => {
    try {
      await caxios.post('/api/member/change-password', { newPassword });
      alert('비밀번호가 변경되었습니다.');
      setEmailVerified(false);
      setNewPassword('');
    } catch (err) {
      alert('비밀번호 변경 실패');
    }
  };

  const handleSave = async () => {
    if (!nicknameChecked) return alert('닉네임 중복 확인을 해주세요.');
    try {
      await caxios.put('/api/member/me', memberData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('회원 정보가 수정되었습니다.');
      setEditMode(false);
    } catch (err) {
      alert('정보 수정 실패');
    }
  };

  if (!member) return <div>회원 정보를 불러오는 중...</div>;

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>
      <div className="info-box">
        <p><strong>아이디:</strong> {member.loginId}</p>
        <p><strong>이메일:</strong> {member.email}</p>
        <p><strong>권한:</strong> {member.role}</p>
        <p><strong>가입일자:</strong> {member.regDate}</p>

        {editMode ? (
          <>
            <p>
              <strong>닉네임:</strong>
              <input name="nickname" value={memberData.nickname} onChange={handleChange} />
              <button onClick={checkNickname}>중복 확인</button>
            </p>
            <p>
              <strong>우편번호:</strong>
              <input name="postcode" value={memberData.postcode} readOnly />
              <button onClick={openAddressPopup}>우편번호 찾기</button>
            </p>
            <p>
              <strong>주소:</strong>
              <input name="address" value={memberData.address} onChange={handleChange} />
            </p>
            <p>
              <strong>상세주소:</strong>
              <input name="detailAddress" value={memberData.detailAddress} onChange={handleChange} />
            </p>
            <p>
              <strong>비밀번호 변경:</strong>
              <input type='password'></input>
                <div className="text-sm" style={{ color: pwMatchMessage.includes('일치하지') ? 'red' : 'green' }}>
          {pwMatchMessage}
        </div>
              <button onClick={requestEmailVerification}>이메일 인증 요청</button>
              {emailVerified && (
                <input
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              )}
              {emailVerified && <button onClick={changePassword}>비밀번호 변경</button>}
            </p>
            <button onClick={handleSave}>저장</button>
            <button onClick={() => setEditMode(false)}>취소</button>
          </>
        ) : (
          <>
            <p><strong>닉네임:</strong> {member.nickname}</p>
            <p><strong>우편번호:</strong> {member.postcode}</p>
            <p><strong>주소:</strong> {member.address}</p>
            <p><strong>상세주소:</strong> {member.detailAddress}</p>
            <button onClick={() => setEditMode(true)}>수정하기</button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyPage;
