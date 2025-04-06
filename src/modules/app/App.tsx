import '../../styles/App.css'
import { Routes, Route } from 'react-router-dom'

import { User } from '../../components/user/index'

function App() {
  return (
    
      <>
        <Routes>
          <Route path="/user" element={<User />} />
        </Routes>
      </>
    
  )
}

export default App
