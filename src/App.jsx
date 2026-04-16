import React from 'react'
import { Route, Routes } from 'react-router-dom'

import HomePage from './UserSide/Components/Pages/HomePage'



import './App.css'

import { Toaster } from 'react-hot-toast'
import Coaching from './UserSide/Components/Pages/Coaching'
import Nutration from './UserSide/Components/Pages/Nutration'

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
   <Route path='/Nutration' element={<Nutration/>}/>
    </Routes>
    </div>
    </>
  )
}

export default App
