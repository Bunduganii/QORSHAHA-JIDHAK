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

const App = () => {
  return (
    <>
     <Toaster
      position='top-center'
      reverseOder={false}
      />
    <div className='app-continers'> 
     
    <Routes>
  
  
   <Route path='/' element={<HomePage/>}/>
   <Route path='/Coaching' element={<Coaching/>}/>
   <Route path='/Social' element={<Socials/>}/>
   <Route path='/Questions' element={<Questions/>}/>
   <Route path='/About' element={<About/>}/>
   <Route path='/payment' element={<Payment/>}/>
   <Route path='/plans' element={<Plans/>}/>
   <Route path='/Loading' element={<Loading/>}/>
    </Routes>
    </div>
    </>
  )
}

export default App
