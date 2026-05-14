import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./../Components/Loading.css"
const Loading = () => {
    const navigate = useNavigate()
    const [currentText,setCurrentText] = useState(0)
    const Text =[
        "Falqynta Xogtaad...",
        "Qiimaynta Hadfakaaga...",
        "Dhisayaa Qorshaahaga Gaarka ah...",
        "Diyaarinayaa Qorshaahag...",
    ]
    useEffect(()=>{
        const interval = setInterval(()=>{
            setCurrentText((prev)=>{
                if(prev < Text.length -1){
                    return prev +1
                }
            })
        },1500)
         const timout = setTimeout(()=>{
        navigate("/plans")
    },6500)
    return () => {
        clearInterval(interval)
        clearTimeout(timout)
    };
    },[])
   

  return (
   <>
  <div className='loading-page'>
  <div className='loading-circle'>
<div className='circle'></div>
  <div className='loading-logo'>
 <h1>Qorshah</h1>
 <span>Jidhka</span>
  </div>
  </div>
  <h2 className='loading-title'>
    {Text[currentText]}
  </h2>
  <p className='laoding-sub'>
    Waxaan Kuu Diyaarinaynaa Qorshe Ku Salaysan Hadafkaaga Iyo Xogtaada
  </p>
  <div className='loading-bars'>
   <span></span>
   <span></span>
   <span></span>
  </div>
  </div>
   </>
  )
}

export default Loading