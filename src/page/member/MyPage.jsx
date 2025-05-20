import React, { useEffect, useState } from 'react';
import caxios from '../../lib/caxios';
import { useAuthStore } from '../../store/useAuthStore';
import './css/MyPage.css';
import { useNavigate } from 'react-router-dom';
export const MyPage = () => {
  const [member, setMember] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [beforePassword, setBeforePassword] = useState('');
  const [memberData, setMemberData] = useState({
    nickname: '',
    address: '',
    detailAddress: '',
    postcode: ''
  });

  const [forgotPwMode, setForgotPwMode] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

const navigate = useNavigate();
  const { token, logout } = useAuthStore();

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
      const res = await caxios.get(`http://localhost/api/member/checkNickName/${memberData.nickname}`);
      const exists = res.data;
      if (exists) {
        alert('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      } else {
        alert('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      }
    } catch (err) {
      alert('중복 확인 중 오류 발생');
    }
  };

  const openAddressPopup = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setMemberData(prev => ({
          ...prev,
          address: data.address,
          postcode: data.zonecode
        }));
      }
    }).open();
  };


  const changePassword = async () => {
    try {
      await caxios.post('/api/member/changePassword', { password: newPassword });
      alert('비밀번호가 변경되었습니다.');
      setIsCodeVerified(false);
      setForgotPwMode(false);
      setEmailVerified(false);
      setNewPassword('');
      setBeforePassword('');
    } catch (err) {
      alert('비밀번호 변경 실패');
    }
  };

  const checkPw = async () => {
    try {
      const res = await caxios.post('/api/member/checkPw', {
        password: beforePassword
      });
      const isMatched = res.data;
      if (isMatched) {
        alert('비밀번호가 일치합니다.');
        setIsCodeVerified(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      alert('비밀번호 확인 요청 중 오류가 발생했습니다.');
    }
  };

  const handleCheckingEmail = async () => {
    try {
      const res = await caxios.post('/api/member/checkEmail', { email: emailForReset });
      const isMatched = res.data;
      if (isMatched) {
        alert('이메일이 확인되었습니다. 비밀번호를 재설정해주세요.');
        setEmailVerified(true);
      } else {
        alert('등록되지 않은 이메일입니다.');
      }
    } catch (err) {
      alert('이메일 확인 중 오류 발생');
    }
  };
const handelDelete = async ()=>{
window.confirm("정말 회원 탈퇴 하시겠습니까?")
if(window.confirm){
  await caxios.delete(`/api/member/delete/${member.loginId}`,
    {
      headers :{
        Authorization : 'Bearer' + localStorage.getItem('ACCESS_TOKEN')
      },
    }
  )
  .then (()=>{
   
    alert("그동안 안심누리를 이용해주셔서 감사합니다");
    navigate('/');
     logout()
  })
  .catch((err)=>alert(err.response.data.message));
}else{
  return;
}
}

  const handleSave = async () => {

    const isNicknameChanged = member.nickname !== memberData.nickname;

    if (!nicknameChecked && isNicknameChanged) return alert('닉네임 중복 확인을 해주세요.');
    try {
      await caxios.put('/api/member/me', memberData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('회원 정보가 수정되었습니다.');
      const updated = await caxios.get('http://localhost/api/member/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMember(updated.data);
      setMemberData({
        nickname: updated.data.nickname,
        address: updated.data.address,
        detailAddress: updated.data.detailAddress,
        postcode: updated.data.postcode
      });
      setEditMode(false);
    } catch (err) {
      alert('정보 수정 실패');
    }
  };

  if (!member) return <div>회원 정보를 불러오는 중...</div>;

  return (
    <div className="mypageContainer">
      <h2>마이페이지</h2>
      <div className="infoBox">
        <p><strong>아이디:</strong> {member.loginId}</p>

        <p><strong>권한:</strong> {member.role}</p>
        <p><strong>가입일자:</strong> {member.regDate}</p>

        {editMode ? (
          <>
            <p>
              <strong>닉네임:</strong>
              <input name="nickname" value={memberData.nickname} onChange={handleChange} />
              <button className="mypageBtn"onClick={checkNickname}>중복 확인</button>
            </p>
    
            <p>
              <strong>우편번호:</strong>
              <input name="postcode" value={memberData.postcode} readOnly />
              <button className="mypageBtn"onClick={openAddressPopup}>우편번호 찾기</button>
            </p>
            <p>
              <strong>주소:</strong>
              <input name="address" value={memberData.address} onChange={handleChange} />
            </p>
            <p>
              <strong>상세주소:</strong>
              <input name="detailAddress" value={memberData.detailAddress} onChange={handleChange} />
            </p>
            {editMode && !forgotPwMode && (
              <p>
                <strong>기존 비밀번호:</strong>
                <input type="password" value={beforePassword} onChange={(e) => setBeforePassword(e.target.value)} />
                <button className="mypageBtn"onClick={checkPw}>비밀번호 확인</button>
              </p>)}
            <p>
              <span className="mypageBtn"onClick={() => setForgotPwMode(true)} >
                비밀번호가 기억나지 않으세요? 🤔
              </span>
              {forgotPwMode && (
                <div className="forgotPasswordBox">
                  {!emailVerified ? (
                    <>
                   
                      <p>
                      <label style={{ display: 'block', marginBottom: '5px' }}>
  회원가입 시 이메일 입력:
</label>
                        <input
                        className='emailCheck'
                          type="email"
                          value={emailForReset}
                          onChange={(e) => setEmailForReset(e.target.value)}
                        />
                        <button className="mypageBtn" onClick={handleCheckingEmail}>이메일 확인</button>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>새 비밀번호 입력:</strong>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button className="mypageBtn" onClick={changePassword}>비밀번호 재설정</button>
                      </p>
                    </>
                  )}
                </div>
              )}
            </p>

            {isCodeVerified && (
              <div className='passwordBox'>
                <strong>새 비밀번호:</strong>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button  className="mypageBtn" onClick={changePassword}>비밀번호 변경</button>

             </div>

            )}
            <br></br>
            <div className='pageBtnBox'>
            <button className="mypageBtn" onClick={handleSave}>저장</button>
            <button className="mypageBtn" onClick={() => setEditMode(false)}>취소</button>
            <button className="mypageBtn" onClick={handelDelete}>회원 탈퇴</button>
            </div>
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
