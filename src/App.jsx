import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './UserSide/Components/Pages/HomePage'
import './App.css'
import { Toaster } from 'react-hot-toast'
import Coaching from './UserSide/Components/Pages/Coaching'
import Socials from './UserSide/Components/Pages/Socials'
import Questions from './UserSide/Components/Questions'
import About from './UserSide/Components/Pages/About'
import Payment from './UserSide/Components/Pages/Payment'
import Plans from './UserSide/Components/Plans'
import Loading from './UserSide/Components/Loading'
import AdminLogin from './AdminSide/pages/AdminLogin'
import AdminDashboard from './AdminSide/pages/AdDash'
import MobileForm from './UserSide/Components/Pages/MobileForm'
import Success from './UserSide/Components/Pages/Success'
import Blog from './UserSide/Components/Pages/Blog'
import ArticleDetail from './UserSide/Components/Pages/ArticleDetail'

const App = () => {
  return (
    <>
      <Toaster position='top-center' reverseOrder={false} />
      <div className='app-continers'> 
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/Coaching' element={<Coaching />} />
          <Route path='/blog' element={<Blog />} />
          <Route path='/blog/:slug' element={<ArticleDetail />} />
          <Route path='/Social' element={<Socials />} />
          <Route path='/Questions' element={<Questions />} />
          <Route path='/About' element={<About />} />
          <Route path='/mastercard' element={<Payment />} />
          <Route path='/mobile' element={<MobileForm />} />
          <Route path='/plans' element={<Plans />} />
          <Route path='/Loading' element={<Loading />} />
          <Route path='/success' element={<Success />} />
          <Route path='/admin' element={<AdminLogin />} />
          <Route path='/admin-dashboard' element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  )
}

export default App
