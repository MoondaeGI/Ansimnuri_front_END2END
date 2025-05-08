import './App.css'
import Main from './page/main/Main'
import Board from './page/board/Board'
import {Login, MyPage, SignIn} from './page/member'
import {Routes, Route} from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

function App() {
  return (
    <Container className="App" fluid>
      <Row>
        <Col className="">헤더</Col>
      </Row>
      <Row>
        <main>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/notice" element={<Board />} />
            <Route path="/qna" element={<Board />} />
          </Routes>
        </main>
      </Row>
      <Row>
        <Col>푸터</Col>
      </Row>
    </Container>
  )
}

export default App
