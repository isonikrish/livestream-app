import './App.css'
import { Route, Routes } from 'react-router-dom'
import Stream from './pages/Stream'
import Watch from './pages/Watch'

function App() {
  

  return (
    <Routes>
      <Route path='/stream' element={<Stream />}/>
      <Route path='/watch' element={<Watch />}/>
    </Routes>
  )
}

export default App
