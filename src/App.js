import './App.css'
import {Detail, List, Write} from './page/board'
import Main from './page/main/Main'
import {Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <header className="App-header">헤더</header>
      <main>
        바디
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/notice" element={<List />} />
        </Routes>
      </main>
      <footer>푸터</footer>
    </div>
  )
}

export default App
