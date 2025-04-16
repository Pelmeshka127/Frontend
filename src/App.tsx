import './App.css'
import { Routes, Route } from 'react-router-dom'

import { User } from './modules/components/User/index'
import { NoMatch } from './components/NoMatch'
import { Home } from './modules/components/Home'
import { Dialogue } from './modules/components/Dialogue'

const App = () => {
  return (
    
      <>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/user' element={<User />} />
          <Route path='/dialogue' element={<Dialogue />} />
          <Route path='*' element={<NoMatch />} />
        </Routes>
      </>
    
  )
}

export default App
