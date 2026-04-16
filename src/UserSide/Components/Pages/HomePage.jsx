import React from 'react'
import ShinyText from "../ShinyText";
import './page.css'
import TrueFocus from '../TrueFocus';
import Navbar from './Navbar'
import { FaChartBar, FaHeadset, FaUtensils } from 'react-icons/fa';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import 'animate.css';
import Testominal from '../Testominal';





const HomePage = () => {

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
  text="✨ UNLEASH YOUR ULTIMATE POTENTIAL"
  speed={2}
  delay={0}
  color="#00d0ff"
  shineColor="#f30f0f"
  spread={120}
  direction="right"
  yoyo={true}
  pauseOnHover={false}
  disabled={false}
/>

   </div>
   <div className='focus-text'>
 <TrueFocus 
sentence="Elite coaching for those who demand excellence. 
Data-driven results and personalized
 support to transform your physique."
manualMode={false}
blurAmount={5}
borderColor="#5227FF"
animationDuration={0.5}
pauseBetweenAnimations={0.2}
/>
   </div>
   <div className='hero-btn'>
<button className="btn-primary">Start Your Transformation</button>
          <button className="btn-secondary">Explore Programs</button>
   </div>

</div>

  </div>
     <div className='features-section'>
    <div className='sec-title'>
    <span className='title-question'>Why Elite Fitness ?</span>
    </div>
    <div className='title-row'>
     <h1>The Elite Standard Of Performence</h1>
    </div>
      <p> We Combine Cutting-Edge Sports 
        Science With Personalized Human Connection
        To Deliver Measurble Result</p>
   </div>
   {/* Cards */}
   <div className='cards'>
   <div className='card'>
   <div className='icon-card'><FaChartBar/></div>
   <h3>Scince Based Traning</h3>
   <p>Driven Workout tarilored to Your Unique Physically
    and Goals We Track Every Rep To Ensure Progess
   </p>
   </div>
   <div className='card'>
  <div className='icon-card'> <FaUtensils/></div>
  <h3>Personalized Nutration</h3>
  <p>Custom Meal Plans Designed By Profissinal 
    Nutrationist That Fit Your LifeStyle Not the Other way Around</p>
   </div>
   <div className='card'>
  <div className='icon-card'><FaHeadset/></div>
  <h3>24/7 Support</h3>
  <p> Direct Acess To Your Dedicated Coaching Team.
    We're Here To Keep You Accountable Every Step Of The Way
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
    <h2 className='slider-heading'>Recoding Biology</h2>

   </div>
  <div className='slider-wrapper'>
    <Carousel
    showThumbs={false}
    showStatus={false}
    infiniteLoop
    autoPlay
    interval={3000}
    swipeable
    emulateTouch
    >
                <div className='images-fix'>
                    <img src="/images/side-img.jpg" />
                    <p className="legend">Legend 1</p>
                </div>
                <div>
                    <img src="/images/img-3.jpg" />
                    <p className="legend">Legend 2</p>
                </div>
                <div>
                    <img src="/images/img-4.jpg" />
                    <p className="legend">Legend 3</p>
                </div>
            </Carousel>
  </div>
  
  </div>
     <Testominal/>
   </>
  )
}

export default HomePage
