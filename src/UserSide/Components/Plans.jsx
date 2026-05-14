import "./Loading.css";

export default function Plans() {

  const plans = [
    {
      name: "Qorshaha Aasaasiga",
      price: "$99",
      features: [
        "Qorshe jimicsi oo kuu gaar ah",
        "Qorshe cunto oo dhamaystiran",
        "La socod todobaadle ah",
        "Talooyin joogto ah",
      ],
    },

    {
      name: "Isbeddel Dhamaystiran",
      price: "$199",
      popular: true,
      features: [
        "Wax walba oo ku jira qorshaha aasaasiga",
        "Taageero WhatsApp 24/7",
        "Qiimayn joogto ah",
        "Hagitaan dhisid murqo & miisaan dhimis",
        "Qorshe si gaar ah laguu habeeyey",
      ],
    },

    {
      name: "Heerka VIP",
      price: "$399",
      features: [
        "Tababar 1-on-1 ah",
        "Taageero mudnaan leh",
        "Qorshe full custom ah",
        "Dib-u-eegis joogto ah",
        "La socod dhamaystiran maalinle",
      ],
    },
  ];

  return (
    <div className="plans-page">

      <div className="plans-header">
        <p>QORSHE JIR DHIS OO CASRI AH</p>

        <h1>
          DOORO <span>QORSHAHAAGA</span>
        </h1>

        <h3>
          Qorsheyaal si gaar ah loogu dhisay
          hadafkaaga iyo jidhkaaga.
        </h3>
      </div>

      <div className="plans-grid">

        {plans.map((plan, index) => (
          <div
            className={`plan-card ${plan.popular ? "popular" : ""}`}
            key={index}
          >

            {plan.popular && (
              <div className="popular-badge">
                KUWA UGU BADAN LA QAATO
              </div>
            )}

            <h2>{plan.name}</h2>

            <div className="price">
              {plan.price}
              <span>/bishii</span>
            </div>

            <div className="features">
              {plan.features.map((item, i) => (
                <p key={i}>✓ {item}</p>
              ))}
            </div>

            <button>
              Dooro Qorshahan
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}








// import { Key } from 'lucide-react'
// import React from 'react'
// import './Loading.css'
// const Plans = () => {
//     const plans = [{
//         name:"Qorshaha Asaasigaa",
//         price:"45$",
//         features:[
//             "Qorshe Jimicsi",
//             "Qorshe Cunto",
//             "Check In Todabaadle Ah"
//         ],
        

//     },
//     {
//         name:"Isbeddel Dhamaystiran",
//         price:"199$",
//         popular:true,
//         features:[
//             "Wax Walba Oo Ku jira Qorshaha Asaasigaa",
//             "Tageero Whatsapp",
//             "Qiimayn Joogto Ah",
//         ]
//     },
//     {
//         name:"Vip Qorshe",
//         price:"399$",
//         features:[
//             "whatspp-24 Coaching",
//             "Taggero Mudnaan Leh",
//             "Qorshe Full Ah oo Custom Ah",
//             "Dib U eegis Joogto Ah",
//             "La Socod Dhamaystiran"
//         ]
//     }
// ]
//   return (
//   <>
//   <div className='plans-page'>
//  <div className='plans-header'>
//   <p> Qorshe Jir Dhis Oo Casri Ah</p>
//   <h1>Dooro 
//     <span>Qorshaahga</span>
//   </h1>
//   <h3>Qorshayaal Si Gaar Ah Loogu Dhisay Hadafka 
//     Jirkaaga
//   </h3>
//  </div>
//  <div className='plans-grid'>
// {plans.map((plan,index)=>{
//   <div className={`plan-card ${plan.popular ? "popular":""}`} key={index}>
//    {plan.popular && (
//     <div className='popular-badge'>
//    Kuwa Ugu Badan Ee La Qaato
//     </div>
//    )}
//    <h2>{plan.name}</h2>
//    <div className='price'>
//     {plan.price}
//     <span>/Bishii</span>
//    </div>
//   <div className='features'>
//     {plan.features.map((item,i)=>(
//       <p key={i}>✔️ {item}</p>
//     ))}
//   </div>
//   </div>
// })}
//  </div>
//  <button>Dooro Qorshahan</button>
//   </div>
//   </>
//   )
// }

// export default Plans