import './App.css'
import Main from './page/main/Main'
import Board from './page/board/Board'
import {Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <header className="App-header">헤더</header>
      <main>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/notice" element={<Board />} />
          <Route path="/qna" element={<Board />} />
        </Routes>
      </main>
      <footer>푸터</footer>
    </div>
  )
}

export default App
