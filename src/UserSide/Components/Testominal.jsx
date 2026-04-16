import React from 'react'
import "./Pages/page.css"
const testominals = [
  {
    name: "Cabdi Xasan",
    goal: "Missan iska ridi",
    text: "Ku biirista Elite Fitness waxay ahayd go'aankii ugu fiicnaa ee aan naftayda u sameeyo. Qorshaha nafaqada si weyn ayuu ii caawiyay, waxaan dhimay miisaan badan anigoo weliba xoog badan helay.",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
    {
    name: "Sahra Cali",
    goal: "baruurta wejiga",
    text: "Taageerada 24/7 waa dhab. Markasta oo niyad-jab igu dhaco, tababarahaygu wuu i garab istaagaa. Meeshan ma aha jim keliya, waa meel waxqabad lagu hormariyo.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Maxamed Nuur",
    goal: "Muruq-dhisid",
    text: "Waxay si fiican u fahmaan cilmiga jirka iyo caafimaadka. Anigoo 50 jir ah, waxaan dareemayaa firfircooni iyo dabacsanaan ka badan sidii aan 30 jir u ahaa.",
    img: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  {
    name: "Aamina Yuusuf",
    goal: "Arday Fitness",
    text: "Tababaradu ma aha kuwo random ah, waa qorshe sax ah. Natiijooyinkuna si degdeg ah ayay ii yimaadeen. Toddobaad kasta waxaan dareemayaa xoog iyo kalsooni badan.",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
  },
]
const Testominal = () => {
  return (
   <>
   <section className='testimonial-section'>
    <div className='testimonial-header'>
  <h4>Falooyinka Macamiisha</h4>
  <h2>Wax Ka Maqal Qorshaha Jidhka</h2>
    </div>
    <div className='testominal-slider'>
   <div className='testimonial-track'>
    {[...testominals,...testominals].map((item,index)=>(
      <div className='testo-card' key={index}>
       <div className='stars'>
          ★★★★★
       </div>
       <p className='testo-text'>{item.text}</p>
       <div className='test-user'>
        <img src={item.img} alt={item.name} className='avatar'/>
       </div>
       <h3>{item.name}</h3>
       <span>{item.goal}</span>
      </div>
    ))}
   </div>
    </div>


   </section>
   </>
    
  )
    
}

export default Testominal
