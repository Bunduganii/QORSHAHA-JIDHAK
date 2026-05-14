import React from "react";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

const Paypal = () => {
  const config = {
    public_key: "FLWPUBK_TEST-a1e6d4621f01aabbe640998627d05587-X",
    tx_ref: Date.now().toString(),
    amount: 60.5,
    currency: "USD",
    payment_options: "card, mobilemoney, ussd",
    customer: {
      email: "testuser@example.com",
      phonenumber: "09000000000",
      name: "Test User",
    },
    customizations: {
      title: "Cool Table Purchase",
      description: "Payment for cool table",
      logo: "https://your-logo-url.com/logo.png",
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <div>
      <button
        onClick={() => {
          handleFlutterPayment({
            callback: (response) => {
              console.log("Payment Success:", response);

              // IMPORTANT: close modal
              closePaymentModal();
            },
            onClose: () => {
              console.log("Payment closed");
            },
          });
        }}
        style={{
          padding: "10px 20px",
          background: "#ff6b00",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Pay Now
      </button>
    </div>
  );
};

export default Paypal;




















// error code in misspeeling built in functions
// import React from 'react'
// import { useEffect } from 'react'
// import { useRef } from 'react'

// const Paypal = () => {
//     const paypal = useRef()
//     useEffect(()=>{
//     window.paypal.Buttons({
//      createOrder:(data,actions,err) => {
//         return actions.order.create({
//             intent:"CAPTURE",
//             purchase_units:[
//                 {
//                     description:"cool table",
//                     amount:{
//                         currence_code:"USD",
//                         value:60.50,

//                     }
//                 }
//             ]
//         })
//      },
//       onApprove: async (data,actions) =>{
//         const order = await actions.order.capture()
//          console.log(order)
//       },
//       onError: (err) =>{
//         console.log(err)
//       }
//     }).render(paypal.current)
//     },[])
//   return (
//   <>
//   <div>
//     <div ref={paypal}/>
//   </div>
//   </>
//   )
// }

// export default Paypal