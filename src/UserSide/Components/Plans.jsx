import "./Loading.css";
import { Utensils, Brain, Users } from "lucide-react";

const Plans = () => {
  const qorshayaal = [
    {
      tier: "HEER 01",
      name: "Bilow",
      price: "$99",
      note: "3 bilood",
      items: [
        "Qorshe gaar ah",
        "Cunto qorshe",
        "La socod usbuuc",
        "Taageero kooban",
      ],
    },
    {
      tier: "HEER 02",
      name: "Isbeddel",
      price: "$199",
      note: "6 bilood",
      popular: true,
      items: [
        "Wax walba oo Bilow",
        "WhatsApp 24/7",
        "Qiimayn joogto",
        "Custom qorshe",
      ],
    },
    {
      tier: "HEER 03",
      name: "VIP",
      price: "$399",
      note: "Mudnaan sare",
      items: [
        "1-on-1 tababar",
        "Taageero degdeg",
        "Dib eegis maalin",
        "La socod buuxa",
      ],
    },
  ];

  return (
    <section className="plan-wrap">
      <div className="plan-head">
        <p>QORSHE CASRI AH</p>
        <h1>
          DOORO <span>QORSHAHA</span>
        </h1>
        <h4>Qorshe ku salaysan jidhkaaga iyo yoolkaaga.</h4>
      </div>

      <div className="plan-grid">
        {qorshayaal.map((plan, index) => (
          <div
            key={index}
            className={`plan-box ${plan.popular ? "active-plan" : ""}`}
          >
            {plan.popular && <div className="top-badge">Ugu Caansan</div>}

            <p className="tier-name">{plan.tier}</p>
            <h2>{plan.name}</h2>

            <div className="plan-price">
              {plan.price}
              <span>/bishii</span>
            </div>

            <small>{plan.note}</small>

            <div className="plan-list">
              {plan.items.map((item, i) => (
                <p key={i}>✓ {item}</p>
              ))}
            </div>

            <button>Dooro</button>
          </div>
        ))}
      </div>

      <div className="bottom-grid">
        <div className="main-photo">
          <img src="/images/female.jpg" alt="gym" />
          <div className="photo-text">
            <h2>Falanqayn Sare</h2>
            <p>Jirkaaga si cilmi ah loo qiimeeyo.</p>
          </div>
        </div>

        <div className="right-grid">
          <div className="small-card">
              <Utensils className="mini-icon" />
            <h3>Nafaqo</h3>
            <p>Cunto sax ah.</p>
          </div>

          <div className="small-card">
             <Brain className="mini-icon" />
            <h3>Soo Kabasho</h3>
            <p>Nasasho qorshaysan.</p>
          </div>

          <div className="wide-card">
              <Users className="mini-icon" />
            <h3>Bulshada</h3>
            <p>Ku biir xubnaha gaarka ah.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;







































// styling problem 
// import "./Loading.css"

// export default function Plans() {
//   const plans = [
//     {
//       name: "Qorshaha Aasaasiga",
//       price: "$99",
//       features: [
//         "Qorshe jimicsi oo kuu gaar ah",
//         "Qorshe cunto oo dhamaystiran",
//         "La socod todobaadle ah",
//         "Talooyin joogto ah",
//       ],
//     },
//     {
//       name: "Isbeddel Dhamaystiran",
//       price: "$199",
//       popular: true,
//       features: [
//         "Wax walba oo ku jira qorshaha aasaasiga",
//         "Taageero 24/7 WhatsApp",
//         "Qiimayn joogto ah",
//         "Murqo dhis & miisaan dhimis",
//         "Qorshe si gaar ah laguu habeeyey",
//       ],
//     },
//     {
//       name: "Heerka VIP",
//       price: "$399",
//       features: [
//         "1-on-1 coaching",
//         "Taageero mudnaan leh",
//         "Qorshe full custom ah",
//         "Dib-u-eegis joogto ah",
//         "La socod maalinle ah",
//       ],
//     },
//   ];

//   return (
//     <div className="plans-page">

//       {/* HEADER */}
//       <div className="plans-header">
//         <p>QORSHE JIR DHIS CASRI AH</p>
//         <h1>
//           DOORO <span>QORSHAHAAGA</span>
//         </h1>
//         <h3>
//           Qorsheyaal si gaar ah loogu dhisay jidhkaaga, hadafkaaga iyo natiijada.
//         </h3>
//       </div>

//       {/* PRICING GRID */}
//       <div className="plans-grid">

//         {plans.map((plan, i) => (
//           <div key={i} className={`plan-card ${plan.popular ? "popular" : ""}`}>

//             {plan.popular && (
//               <div className="badge">MOST POPULAR</div>
//             )}

//             <h2>{plan.name}</h2>

//             <div className="price">
//               {plan.price} <span>/bishii</span>
//             </div>

//             <div className="features">
//               {plan.features.map((f, idx) => (
//                 <p key={idx}>✓ {f}</p>
//               ))}
//             </div>

//             <button>Dooro Qorshahan</button>

//           </div>
//         ))}

//       </div>

//       {/* BOTTOM SHOWCASE */}
//       <div className="bottom-showcase">

//         <div className="showcase-main">
//           <img src="/images/female.jpg" alt="fitness" />

//           <div className="overlay">
//             <div>
//               <h2>Falanqayn Sare</h2>
//               <p>Qorshe ku saleysan jidhkaaga, tamartaada iyo hadafkaaga.</p>
//             </div>
//           </div>
//         </div>

//         <div className="right-boxes">

//           <div className="info-box">
//             <h3>Nafaqo Sax Ah</h3>
//             <p>Cunto si cilmi ah loo habeeyay oo taageerta murqo dhisid ama miisaan dhimis.</p>
//           </div>

//           <div className="info-box">
//             <h3>Taageero Toos Ah</h3>
//             <p>Hel hagitaan joogto ah iyo jawaabo degdeg ah si aad u gaadho natiijo.</p>
//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }



















// styl problem
// import "./Loading.css";

// export default function Plans() {

//   const plans = [
//     {
//       name: "Qorshaha Aasaasiga",
//       price: "$99",
//       features: [
//         "Qorshe jimicsi oo kuu gaar ah",
//         "Qorshe cunto oo dhamaystiran",
//         "La socod todobaadle ah",
//         "Talooyin joogto ah",
//       ],
//     },

//     {
//       name: "Isbeddel Dhamaystiran",
//       price: "$199",
//       popular: true,
//       features: [
//         "Wax walba oo ku jira qorshaha aasaasiga",
//         "Taageero WhatsApp 24/7",
//         "Qiimayn joogto ah",
//         "Hagitaan dhisid murqo & miisaan dhimis",
//         "Qorshe si gaar ah laguu habeeyey",
//       ],
//     },

//     {
//       name: "Heerka VIP",
//       price: "$399",
//       features: [
//         "Tababar 1-on-1 ah",
//         "Taageero mudnaan leh",
//         "Qorshe full custom ah",
//         "Dib-u-eegis joogto ah",
//         "La socod dhamaystiran maalinle",
//       ],
//     },
//   ];

//   return (
//     <div className="plans-page">

//       <div className="plans-header">
//         <p>QORSHE JIR DHIS OO CASRI AH</p>

//         <h1>
//           DOORO <span>QORSHAHAAGA</span>
//         </h1>

//         <h3>
//           Qorsheyaal si gaar ah loogu dhisay
//           hadafkaaga iyo jidhkaaga.
//         </h3>
//       </div>

//       <div className="plans-grid">

//         {plans.map((plan, index) => (
//           <div
//             className={`plan-card ${plan.popular ? "popular" : ""}`}
//             key={index}
//           >

//             {plan.popular && (
//               <div className="popular-badge">
//                 KUWA UGU BADAN LA QAATO
//               </div>
//             )}

//             <h2>{plan.name}</h2>

//             <div className="price">
//               {plan.price}
//               <span>/bishii</span>
//             </div>

//             <div className="features">
//               {plan.features.map((item, i) => (
//                 <p key={i}>✓ {item}</p>
//               ))}
//             </div>

//             <button>
//               Dooro Qorshahan
//             </button>

//           </div>
//         ))}

//       </div>
//       <div className="bottom-showcase">
//   <div className="showcase-main">
//     <img src="/images/female.jpg" alt="fitness" />
//     <div className="showcase-overlay">
//       <div>
//         <h2>Falanqayn Sare</h2>
//         <p>Qorshe ku saleysan jidhkaaga iyo hadafkaaga.</p>
//       </div>
//     </div>
//   </div>

//   <div className="info-box">
//     <h3>Nafaqo Sax Ah</h3>
//     <p>Cunto habaysan oo taageeraysa miisaan dhimis ama murqo dhisid.</p>
//   </div>

//   <div className="info-box">
//     <h3>Taageero Toos Ah</h3>
//     <p>Hel hagitaan joogto ah iyo jawaabo degdeg ah WhatsApp.</p>
//   </div>
// </div>
//     </div>
//   );
// }








// // import { Key } from 'lucide-react'
// // import React from 'react'
// // import './Loading.css'
// // const Plans = () => {
// //     const plans = [{
// //         name:"Qorshaha Asaasigaa",
// //         price:"45$",
// //         features:[
// //             "Qorshe Jimicsi",
// //             "Qorshe Cunto",
// //             "Check In Todabaadle Ah"
// //         ],
        

// //     },
// //     {
// //         name:"Isbeddel Dhamaystiran",
// //         price:"199$",
// //         popular:true,
// //         features:[
// //             "Wax Walba Oo Ku jira Qorshaha Asaasigaa",
// //             "Tageero Whatsapp",
// //             "Qiimayn Joogto Ah",
// //         ]
// //     },
// //     {
// //         name:"Vip Qorshe",
// //         price:"399$",
// //         features:[
// //             "whatspp-24 Coaching",
// //             "Taggero Mudnaan Leh",
// //             "Qorshe Full Ah oo Custom Ah",
// //             "Dib U eegis Joogto Ah",
// //             "La Socod Dhamaystiran"
// //         ]
// //     }
// // ]
// //   return (
// //   <>
// //   <div className='plans-page'>
// //  <div className='plans-header'>
// //   <p> Qorshe Jir Dhis Oo Casri Ah</p>
// //   <h1>Dooro 
// //     <span>Qorshaahga</span>
// //   </h1>
// //   <h3>Qorshayaal Si Gaar Ah Loogu Dhisay Hadafka 
// //     Jirkaaga
// //   </h3>
// //  </div>
// //  <div className='plans-grid'>
// // {plans.map((plan,index)=>{
// //   <div className={`plan-card ${plan.popular ? "popular":""}`} key={index}>
// //    {plan.popular && (
// //     <div className='popular-badge'>
// //    Kuwa Ugu Badan Ee La Qaato
// //     </div>
// //    )}
// //    <h2>{plan.name}</h2>
// //    <div className='price'>
// //     {plan.price}
// //     <span>/Bishii</span>
// //    </div>
// //   <div className='features'>
// //     {plan.features.map((item,i)=>(
// //       <p key={i}>✔️ {item}</p>
// //     ))}
// //   </div>
// //   </div>
// // })}
// //  </div>
// //  <button>Dooro Qorshahan</button>
// //   </div>
// //   </>
// //   )
// // }

// // export default Plans