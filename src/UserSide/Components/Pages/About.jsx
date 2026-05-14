import React from "react";
import "../Pages/About.css";
import Navbar from "./Navbar";

const About = () => {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      <main className="about-main">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-bg">
            <img src="/images/image-1-back.jpeg" alt="Hero" />
            <div className="hero-overlay"></div>
          </div>

          <div className="hero-content">
            <span className="hero-tag">Aasaasaha Qorshaha Jidhka</span>

            <h1 className="hero-title">
              Coach <br /> <span>Nasir</span>
            </h1>

            <p className="hero-desc">
              Qorshe Sax Ah, Tababar Caqli Leh, Iyo Natiijo Muuqata.
            </p>
          </div>
        </section>

        {/* ORIGIN */}
        <section className="origin-section">
          <div className="origin-container">
            <div className="origin-text">
              <h2 className="origin-title">
                Bilowga <span>Qorshaha</span> Jidhka
              </h2>

              <p>
                Ka dib sanado badan oo tababar adag ah, waxaan ogaaday in dad badan
                ay u tababaraan si khaldan. Dadku waxay raadiyaan qurux kaliya,
                laakiin waxaan rabnaa awood dhab ah.
              </p>

              <p>
                Qorshaha Jidhka waa nidaam kuu dhisaya jidh xoog leh, degdeg ah,
                oo adkaysi badan.
              </p>

              <div className="origin-stats">
                <div>
                  <h3>6+</h3>
                  <span>Sannado Khibrad ah</span>
                </div>

                <div>
                  <h3>3K+</h3>
                  <span>Dhalinyaro La Tababaray</span>
                </div>
              </div>
            </div>

            <div className="origin-image">
              <img src="/images/image-1-back.jpeg" alt="Origin" />
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="timeline-section">
          <h2 className="timeline-heading">Safarka Guusha</h2>

          <div className="timeline-grid">
            <div className="timeline-card big">
              <h3>2018</h3>
              <h4>Bilowgii Tababarka</h4>
              <p>
                Waxaan bilaabay qorshe tababar oo adag, si aan dadka ugu dhiso jidh
                xoog leh.
              </p>
            </div>

            <div className="timeline-card">
              <h3>2020</h3>
              <h4>BARNAAMIJKA ONLINE</h4>
              <p>
                Waxaan bilownay tababar online ah si qof walba u helo fursad.
              </p>
            </div>

            <div className="timeline-card">
              <h3>2022</h3>
              <h4>KORRIIN IYO GUUL</h4>
              <p>
                Dad badan ayaa ku guuleystay yoolkoodii, miisaan dhimis iyo xoog.
              </p>
            </div>

            <div className="timeline-card wide">
              <h3>2026</h3>
              <h4>Qorshaha Jidhka Platform</h4>
              <p>
                Waxaan kuu dhisnay bog casri ah oo kuugu diyaarinaya tababar casri ah,
                cunto, iyo qorshe joogto ah.
              </p>

              <button className="timeline-btn">Bilow Hadda</button>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <section className="quote-section">
          <h2>
            "Muruqu kuma imaado nasiib ee wuxuu ku yimaadaa joogtayn iyo qorshe.
            <span> Joogtaynta iyo Qorshaha Saxda ahi</span> waa guul."
          </h2>

          <div className="quote-line"></div>

          <p>- Coach Naasir</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">Qorshaha Jidhka</div>

          <div className="footer-links">
            <a href="#">Home</a>
            <a href="#">Coaching</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-copy">
            © 2026 QORSHAHA JIDHKA. DHAMMAAN XUQUUQDA WAY XAFIDSAN TAHAY.
          </div>
        </div>
      </footer>
    </>
  );
};

export default About;




















// misspled classnames
// import React from 'react'

// import '../Pages/About.css'
// import Navbar from './Navbar'
// const About = () => {
//   return (
//   <>
//   <main>
//   {/* navbar */}
//   <div className='nav-cont'>
//    <Navbar/>
//   </div>
//   {/* main about */}
//   <div className='about-main'>
//    <section className='hero-section'>
//    <div className='hero-bg'>
//     <img src='/images/hero-1.jpg'/>
//     <div className='hero-overlay'></div>
//    </div>
//    {/* hero-conten */}
//    <div className='hero-content'>
//    <span>Asaasha Qorshaha Jidhka</span>
//    <h1 className='hero-title'>Coach <br/><span>Nasir</span> </h1>
//    <p>Qorshe Sax Ah,Tababar Caqli Leh,Iyo Natiijo Muuqata</p>
//     <p className="hero-desc">
//               Waxaan dhisnaa awood, adkaysi, iyo jidh si heer sare ah u shaqeeya.
//             </p>
//    </div>
//    </section>
//   </div>

//   {/* origin */}
//   <section className='origin-section'>
//  <div className='origin-container'>
//   <div className='origin-text'>
//    <h2 className='origin-title'>
//     Bilowga <span>Qorshah</span> Jidhka
//    </h2>
//    <p>   Ka dib sanado badan oo tababar adag ah, waxaan ogaaday in dad badan
//   ay u tababaraan si khaldan. Dadku waxay raadiyaan qurux kaliya, 
//   laakiin waxaan rabnaa awood dhab ah.</p>

//   <p> Qorshaha Jidhka waa nidaam kuu dhisaya jidh xoog leh, 
//     degdeg ah, oo adkaysi badan.</p>
//     <div className='origin-stats'>
//      <div>
//       <h3>6+</h3>
//      <span>Sannado Khibrad ah</span>
//      </div>
//      <div>
//       <h3>3K+</h3>
//      <span>Dhalin yaro La Tababray</span>
//      </div>
//     </div>
    
//   </div>
//    <div className='origin-image'>
//     <img src='/images/hero-3.jpg'/>
//     </div>

//  </div>
//   </section>
//   {/* Timeline */}
//   <section className='timeline-section'>
//  <h2 className='timeline-heading'>Safarka Guusha</h2>
//  <div className='timeline-grid'>
//   <h3>2018</h3>
//   <h4>Bilowgii Tababarka</h4>
//     <p>Waxaan bilaabay qorshe tababar oo adag, 
//     si aan dadka ugu dhisojidh xoog leh.</p>
//  </div>
//    <div className="timeline-card">
//   <h3>2020</h3>
//   <h4>BARNAAMIJKA ONLINE</h4> 
//   <p>Waxaan bilownay tababar online ah si qof walba u helo fursad. </p> 
//   </div>
//    <div className="timeline-card">
//   <h3>2020</h3>
//   <h4>BARNAAMIJKA ONLINE</h4> 
//   <p>Waxaan bilownay tababar online ah si qof walba u helo fursad. </p> 
//   </div>
//   <div className="timeline-card">
//   <h3>2022</h3>
//   <h4>KORRIIN IYO GUUL</h4>
//   <p>
//    Dad badan ayaa ku guuleystay yoolkoodii, miisaan dhimis iyo xoog.
//   </p>
//  </div>
// <div className='timeline-card-wide'>
//  <h3>2026</h3>
//  <h4>Qorshah Jidhka Platform</h4>
//  <p>Waxaan Kuu Dhisnay Bog Casri Ah Oo Kuugu Diyaarinaya Tababar Casri Ah,
//   Cunto, Iyo Qorshe Joogto Ah</p>
//   <button className="timeline-btn">Bilow Hadda</button>
//  </div>
//   </section>
//   {/* Qoute */}
//   <section className='qoute-section'>
//    <h2>
//     Muruqu Ku Ma Imaado Nasiib Ee Waxa Uu Ku Yimadaa Joogtayn Iyo Qorshe
//     <span>Joogtayn Iyo Qorshe Saxi Ah</span> Waa Guul
//    </h2>
//    <p>- Coach Naasir</p>
//   </section>
//     </main>
//     {/* Footer */}
//     <footer className='footer'>
//       <div className='footer-container'>
//    <div className='footer-logo'>Qorshaha Jidhka</div>
//       <div className='footer-links'>
//          <a href='#'>Home</a>
//          <a href='#'>Coaching</a>
//          <a href='#'>About</a>
//          <a href='#'>Contact</a>
//         </div>
//         <div className='footer-copy'>
//          © 2026 QORSHAHA JIDHKA. DHAMMAAN XUQUUQDA WAY XAFIDSAN TAHAY.
//         </div>
//       </div>
//     </footer>
//   </>
//   )
// }

// export default About
