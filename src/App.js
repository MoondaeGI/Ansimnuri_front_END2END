import './App.css'
import Main from './page/main/Main'
import { Qna, Notice } from './page/board'
import { Login, MyPage, RegisterPage } from './page/member'
import { Routes, Route } from 'react-router-dom'
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useAuthStore, useNoteStore } from './store'

function App() {
  const [expanded, setExpanded] = useState(false)

  const {token,initialize, logout } = useAuthStore();
  const {connect} = useNoteStore();

  useEffect(() => {
      initialize();
      connect();
  }, [])

  const handleLogout = () => {
    logout();
    window.location.href = '/'
  }


  return (
    <Container fluid className="App p-0">
      {/* Header */}
      <Navbar expand="md" bg="light" className="py-3" expanded={expanded} onToggle={setExpanded}>
        <Container>
          <Navbar.Brand href="/">안심누리</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/download">앱 다운로드</Nav.Link>
              <Nav.Link href="/notice/list">공지사항</Nav.Link>
              <Nav.Link href="/qna/list">QNA</Nav.Link>
              <Nav.Link href="/guide">이용가이드</Nav.Link>

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

      {/* Body */}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/notice/*" element={<Notice />} />
          <Route path="/qna/*" element={<Qna />} />
          <Route path="/RegisterPage/*" element={<RegisterPage />} />

        </Routes> 
      </main>

      {/* Footer */}
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
                <Nav.Link className="text-light" href="/download">
                  앱 다운로드
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
