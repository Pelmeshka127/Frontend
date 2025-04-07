import './App.css'
import { Routes, Route } from 'react-router-dom'

import { User } from './modules/user/index'

function App() {
  return (
    
      <>
        <Routes>
          <Route path="/user" element={<User />} />
          {/* <Route path="*" element={<NoMatch />} /> */}
        </Routes>
      </>
    
  )
}

export default App
