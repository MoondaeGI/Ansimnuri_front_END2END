import './App.css'
import Main from './page/main/Main'
import { Qna, Notice } from './page/board'
import { Login, MyPage, RegisterPage } from './page/member'
import { Routes, Route } from 'react-router-dom'
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap'
import SimpleRegisterPage from './page/member/SimpleRegisterPage';
import { useEffect, useState } from 'react'
import { useAuthStore,useNoteStore  } from './store'
import { Steps } from 'intro.js-react';
import KakaoRedirect from './page/member/KakaoRedirect';
import 'intro.js/introjs.css';

function App() {
  const [expanded, setExpanded] = useState(false)

  const [showGuide, setShowGuide] = useState(false);
  const { token, initialize, logout } = useAuthStore();
  const { connect } = useNoteStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  useEffect(() => {
    initialize();
    connect();
  }, [])



  const handleLogout = () => {
    logout();
    window.location.href = '/'
  }
  const openGuide = (e) => {
    e.preventDefault();
    setShowGuide(true);
  };

  const steps = [
    {
      element: ".step1",
      title: "메인화면 뉴스 버튼",
      intro: "여기서 실시간 범죄 뉴스를 볼 수 있어요!"
    },
    {
      element: ".step2",
      title: "안전 지도 기능",
      intro: `
- 현재 위치를 기반으로 <strong>지구대와 경찰서 위치</strong>를 확인할 수 있어요.<br/>
- 아래 버튼을 통해 <strong>안전한 경로를 네비게이션</strong으로 안내받을 수 있고,<br/>
- 특정 지점을 눌러 <strong>쪽지를 남겨</strong> 다른 사용자와 안전 정보를 공유할 수도 있어요!
  `
    }
    ,
    {
      element: ".step3",
      title: "안심 챗봇 누리봇",
      intro: "범죄 예방 및 피해자 지원을 위한 생활 안전 챗봇으로 원하는 정보를 손 쉽게 얻을 수 있어요 !"
    },
    {
      element: "#pwaTip",
      title: "앱 설치 안내",
      intro: `
<img src="./icons/아이콘.png"><br>아이콘을 눌러<br />
PWA 앱으로 설치할 수 있어요!<br />
(아이콘은 브라우저에 따라 다르게 보일 수 있습니다)
    `
    }
  ];

  const stepsOption = {
    nextLabel: "다음",
    prevLabel: "이전",
    doneLabel: "확인",
    skipLabel: "x"
  };


  return (
    <Container fluid className="App p-0">
  

      <div id="pwaTip" style={{
        position: 'absolute',
        top: '0px',
        right: '320px',
        zIndex: 9999
      }}>

      </div>

      <Navbar expand="md" className="py-3" expanded={expanded} onToggle={setExpanded}>
        <Container>
          <Navbar.Brand href="/" className='nav' >
            <img src="/icons/logo.png" alt="로고" className='logoImg' width={200} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
       
              <Nav.Link href="/notice/list">공지사항</Nav.Link>
              <Nav.Link href="/qna/list">QNA</Nav.Link>
              <Nav.Link href="/guide" onClick={openGuide}>이용가이드</Nav.Link>
              {token ? (
                <>
                  <Nav.Link href="/mypage">마이페이지</Nav.Link>
                  <Nav.Link onClick={handleLogout}>로그아웃</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href="/login">로그인</Nav.Link>
                  <Nav.Link href="/RegisterPage">회원가입</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Steps
        enabled={showGuide}
        steps={steps}
        initialStep={0}
        options={stepsOption}
        onChange={(stepIndex) => setCurrentStepIndex(stepIndex)}
        onExit={() => setShowGuide(false)}
        onComplete={() => setShowGuide(false)}
      />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/oauth" element={<OAuth2RedirectHandler />} /> */}
          <Route path="/login/oauth2/redirect" element={<KakaoRedirect />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/notice/*" element={<Notice />} />
                  <Route path="/SimpleRegisterPage" element={<SimpleRegisterPage />} />
          <Route path="/qna/*" element={<Qna />} />
          <Route path="/RegisterPage/*" element={<RegisterPage />} />
 
        </Routes>
      </main>


      <footer className="py-4 mt-5 footer bg-dark text-light">
        <Container>
          <Row>
            <Col md={6} className="mb-3 text-center text-md-start mb-md-0">
              <div>안심누리</div>
              <div>© CompanyName. All rights reserved.</div>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <Nav className="justify-content-center justify-content-md-end">
                <Nav.Link className="text-light" href="/guide">
                  이용가이드
                </Nav.Link>
             
                <Nav.Link className="text-light" href="/notice/list">
                  공지사항
                </Nav.Link>
                <Nav.Link className="text-light" href="/qna/list">
                  QNA
                </Nav.Link>
              </Nav>
            </Col>
          </Row>
        </Container>
      </footer>
    </Container>
  )
}

export default App
