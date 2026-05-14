import React from 'react'
import "./Pages/page.css"
const testominals = [
  {
    name: "Xasan",
    goal: "Baruurta Wejiga",
    text: "Baruurta wajiga aad dhib iga haystay laakiin aad ayaan u farxay markaan helay qof ila garanaya wixii iyo hadafkaygana fahmaya waanigaa ka midho dhaliyey mana dhawi laakin wada shaqayn wanaagsan.",
    img: "/images/hassan-test-2.jpeg",
  },
    {
    name: "Marwaan",
    goal: "Miisaan-dhimis",
    text: "Miisaankayga ayaa i dhibayey laakiin go'aan aan qaatay iyo Barnaamajka ayaa aad ii caawiyey waad mahadsatay adna couch Nasir kama marmayo ilaa manta Barnamajka couching .",
    img: "/images/Marwaan-test.jpeg",
  },
  {
    name: "Guleed",
    goal: "Muruq-dhisid",
    text: "Misaankayga ayaa aad ii dhibayey 140kg wiil ha markaad tahay noloshu waa dhib depression ayaa i haystay laakiin markaan go'aan kii qaatay een riday baruurtii ayuu depressionkii iyo niyad jabkiiba tageen tageero joogtaana waan ka helayey wllky nasir.",
    img: "/images/Guled-test-1.jpeg",
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
  <h2>Wax Ka Maqal dadkii isbadal ka arkay Barnaamajkayga</h2>
    </div>
    <div className='testimonial-slider'>
   <div className='testimonial-track'>
    {[...testominals,...testominals].map((item,index)=>(
      <div className='testo-card' key={index}>
       <div className='stars'>
          ★★★★★
       </div>
       <p className='testo-text'>{item.text}</p>
       <div className='testo-user'>
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
