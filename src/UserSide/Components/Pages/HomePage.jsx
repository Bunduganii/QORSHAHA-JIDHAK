import React from 'react'
import ShinyText from "../ShinyText";
import './page.css'

import Navbar from './Navbar'
import { FaChartBar, FaHeadset, FaUtensils } from 'react-icons/fa';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import 'animate.css';
import Testominal from '../Testominal';
import { useNavigate } from 'react-router-dom';






const HomePage = () => {
  const navigate = useNavigate()

//  const slides = [{
//   img:"/images/img-3.jpg",
//   title: "+12 LBS muscle",
//   desc:" Plan:basic |12 weeks"
//  },
//  {
//   img:"/images/img-2.jpg",
//   title:"-15% Body Fat",
//   desc:"Plan:Gold | 1 year"
//  },
//  {
//   img:"/images/img-4.jpg",
//   title:"23 lbs",
//   desc:"Plan: Premimum | 6 months"
//  },
// ]
  return (
   <>
   <div>
    <Navbar/>
   </div>
  <div className='hero-section'>
  <div className='hero-back'></div>
<div className='hero-content'>
     <div className='SHINNY-TEXT-ALIGN'>
     <ShinyText
  text="✨ Ma rabtaa in jidhkaagu muddo kooban isbeddelo ?"
  speed={2}
  delay={0}
  color="white"
  shineColor="#00d0ff"
  spread={120}
  direction="right"
  yoyo={true}
  pauseOnHover={false}
  disabled={false}
/>

   </div>
   <div className='headlin-quess'>
    

  <h2>90 maalmood gudahood ku arag isbeddel muuqda, 
    <span>adigoo la shaqaynaya qof dhibaatadaada soo maray</span></h2>


   </div>
   <div className='hero-btn'>
<button className="btn-primary" onClick={()=> navigate('/Questions')}>Bilow IsBadaLKaaga</button>
      
   </div>

</div>

  </div>
 
   {/* Cards */}
   <div className='cards'>
   <div className='card'>
   <div className='icon-card'><FaChartBar/></div>
   <h3>Tababar Cilimiyeysan</h3>
   <p> Jimicsi Ku  si Cilmi ah  Dhisan Loo Habeeye Oo Ku Salaysan Jidhkkaga
   </p>
   </div>
   <div className='card'>
  <div className='icon-card'> <FaUtensils/></div>
  <h3>Nafaqo Qorshaysan </h3>
  <p>Cunto Qorshaysan Oo Ku Haboon,Oo Ay Kuu Diyaariyeen Khubaro Nafaqo Si Ay Kuu Gaarsiyaan
    DegDeg Ah Oo Caafimaad Leh
  </p>
   </div>
   <div className='card'>
  <div className='icon-card'><FaHeadset/></div>
  <h3>24/7 Taageero Joogto Ah</h3>
  <p> Koox tababareyaal ah oo mar walba kula jooga, si ay kuu dhiirigeliyaan ugana
     jawaabaan su'aalahaaga.
  </p>
   </div>
   </div>
  {/* Before and after Transformation */}
  <div className='transform-section'>
 <div className='transform-header'>
 {/* <h2>Real Clients Transformation</h2>
 <p>Fat Loss,Muscle Gain,And Full Body Recomposition Result</p> */}
 </div>
  <div className='slider-section'>
    <h2 className='slider-heading'>Dib-u-habaynta Jidhka</h2>

   </div>
<div className="pro-slider-wrapper">
  <Carousel
    showThumbs={false}
    showStatus={false}
    infiniteLoop
    autoPlay
    interval={3000}
    swipeable
    emulateTouch
    showIndicators={true}
    showArrows={true}
    className="custom-carousel"
    renderArrowPrev={(clickHandler, hasPrev) =>
      hasPrev && (
        <button className="circle-arrow left" onClick={clickHandler}>
          ❮
        </button>
      )
    }
    renderArrowNext={(clickHandler, hasNext) =>
      hasNext && (
        <button className="circle-arrow right" onClick={clickHandler}>
          ❯
        </button>
      )
    }
  >
    <div className="slide-item">
      <img src="/images/khalid-slide.jpeg" alt="slide" />
      <div className="slide-overlay">
        <span className="slide-tag">WEIGHT MANAGEMENT</span>
        <h3>Lumi Baruur 🔥</h3>
        <p>Lost 15kg in 12 weeks using our structured training + nutrition.</p>
      </div>
    </div>

    <div className="slide-item">
      <img src="/images/guled-slide-1.jpeg" alt="slide" />
      <div className="slide-overlay">
        <span className="slide-tag">HYPERTROPHY</span>
        <h3>Dhis Murqo 💪</h3>
        <p>Built lean muscle in 8 weeks with progressive overload training.</p>
      </div>
    </div>

    <div className="slide-item">
      <img src="/images/image-1-back.jpeg" alt="slide" />
      <div className="slide-overlay">
        <span className="slide-tag">BODY RECOMP</span>
        <h3>Jidh Cusub ⚡</h3>
        <p>Rebuilt strength and lost fat while maintaining performance.</p>
      </div>
    </div>
  </Carousel>
</div>
  
  </div>
     <Testominal/>
   </>
  )
}

export default HomePage
