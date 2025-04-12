import './App.css'
import { Routes, Route } from 'react-router-dom'

import { User } from './modules/components/User/index'
import { NoMatch } from './components/NoMatch'
import { Home } from './modules/components/Home'

const App = () => {
  return (
    
      <>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/user' element={<User />} />
          <Route path='*' element={<NoMatch />} />
        </Routes>
      </>
    
  )
}

export default App
