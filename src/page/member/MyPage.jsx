import React, { useEffect, useState } from 'react';
import caxios from '../../lib/caxios';
import './css/MyPage.css';
import { useAuthStore } from '../../store/useAuthStore';
export const MyPage = () => {
  const [member, setMember] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [memberData, setMemberData] = useState({
    nickname: '',
    address: '',
    detailAddress: ''
  });
    const { token } = useAuthStore();
 
  useEffect(() => {
    const memberInformation = async () => {
        console.log("token 확인:", sessionStorage.getItem("token"));
      try {
        const res = await caxios.get('http://localhost/api/member/me', {
          headers: {
            Authorization:  `Bearer ${token}`
            
          }
            
        });
         setMember(res.data); 

      

        setMember(res.data);
       setMemberData({
        loginId :res.data.loginId,
          nickname: res.data.nickname,
          address: res.data.address,
          detailAddress: res.data.detailAddress
        });
      } 
      catch (err) {
        console.error('회원 정보 불러오기 실패:', err);
        alert('로그인이 필요합니다.');
      }
    };

   memberInformation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await caxios.put('http://localhost/api/member/me', memberData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('회원 정보가 수정되었습니다.');
      setMember({ ...member, ...memberData });
      setEditMode(false);
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  if (!member) return <div>회원 정보를 불러오는 중...</div>;

  return (
    <div className="mypage-container">
      <h2>마이페이지</h2>
      <div className="info-box">
        <p><strong>아이디:</strong> {member.loginId}</p>
        <p><strong>이메일:</strong> {member.email}</p>
        <p><strong>우편번호:</strong> {member.postcode}</p>
        <p><strong>권한:</strong> {member.role}</p>
        <p><strong>가입일자:</strong> {member.regDate}</p>

        {editMode ? (
          <>
            <p>
              <strong>닉네임:</strong>
              <input name="nickname" value={memberData.nickname} onChange={handleChange} />
            </p>
            <p>
              <strong>주소:</strong>
              <input name="address" value={memberData.address} onChange={handleChange} />
            </p>
            <p>
              <strong>상세주소:</strong>
              <input name="detailAddress" value={memberData.detailAddress} onChange={handleChange} />
            </p>
            <button onClick={handleSave}>저장</button>
            <button onClick={() => setEditMode(false)}>취소</button>
          </>
        ) : (
          <>
            <p><strong>닉네임:</strong> {member.nickname}</p>
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
