import { useState } from 'react'
import reactLogo from '../../assets/react.svg'
import viteLogo from '/vite.svg'
import '../../styles/App.css'
import { Routes, Route } from 'react-router-dom'

import UsersList from '../api/getinfo.tsx'

import { User } from '../../components'

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
