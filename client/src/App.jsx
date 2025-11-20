import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Navigate } from 'react-router-dom'
import {Toaster} from "react-hot-toast"
import { AuthContext } from '../context/AuthContext'

const App = () => {

  const {authUser}= useContext(AuthContext)
  return (

    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <h1>HLLLO</h1>
      <Toaster/>
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login" />}/>
        <Route path='/login' element={authUser ? <Navigate to='/'/> : <LoginPage/> }/>
        <Route path='/profile' element={ authUser ? <ProfilePage/> : <Navigate to="/login"/> }/>

      </Routes>
    </div>
  )
}

export default App
