import React from 'react'
import { FaBars, FaDumbbell, FaTimes } from 'react-icons/fa'
import './page.css'
import { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const Navbar = () => {
  const navigate = useNavigate()
  const [menuOpen,setMenuOpen] = useState(false)
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  }
  useEffect(()=>{
    const handleRezie = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false)
      }

    }
    window.addEventListener("resize",handleRezie);
    return () =>
      window.removeEventListener("resize",handleRezie)
  },[])
  useEffect(()=>{
    document.body.style.overflow = menuOpen ? "hidden" :"auto";
  },[menuOpen])
  const CloseMenu = () => {
    setMenuOpen(false)
  }
  return (
  <>
  {/* Left side */}
<header className='navbar'>
    <div className='nav-log'>
  <img src='/images/main-logo.png' alt='logo'/>
<h2 className='nav-logo-text'>Qorshaha Jidhka</h2>
  </div>
 
  {/*  Desktop links */}
  <div className='center-links'>
<ul className='nav-links'>
  <li><a href="/" onClick={CloseMenu}>Home</a></li>
  <li><a href="">Coaching</a></li>
  <li><a href="">Socials</a></li>
  <li><a href="About"  onClick={CloseMenu}>About</a></li>
</ul>
  </div>
  {/* Right-side */}
  <div className='right-nav'>
<button className='join-btn' onClick={()=>{navigate('/Questions')}}>Nagu Soo Biir</button>
   {/* Hamburger Icon for mobile */}
  <div className='hamburger' onClick={toggleMenu}>
    <FaBars className='nav-icon' />
  </div>
  </div>
     {/* Mobile Side Menu */}
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <FaTimes className='close-icon' onClick={CloseMenu}/>
        <ul className="mobile-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Coaching</a></li>
          <li><a href="#">Socials</a></li>
          <li><a href="#">About</a></li>
        </ul>

        <button className="mobile-btn" onClick={()=>{navigate('/Questions')}}>Nagu Biir</button>
      </div>
</header>

  </>
  )
}

export default Navbar
