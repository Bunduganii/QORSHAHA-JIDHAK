import React, { useState } from "react";
import "./Pages/questions.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";



  // Story data
  const stories = {
    "Misaan-kordhin": {
      image: "/images/khalid-slide.jpeg",
      name: "Khaalid",
      result: "Waxaan Kordhiyey 8kg 2 bilood gudahood"
    },
    "Muruq-dhissid": {
      image: "/images/guled-slide-1.jpeg",
      name: "Guled",
      result: "Waxaan dhisay murqo muuqata 3 bilood gudahood"
    },
    "Jidh-Hagaajin": {
      image: "/images/hassan-test-2.jpeg",
      name: "Hassan",
      result: "Jidhkayga si buuxda ayuu isu beddelay 90 maalmood"
    }
  };

export default function Questions() {
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [unit, setUnit] = useState("kg");
const [weight, setWeight] = useState(75);
const [challenge, setChallenge] = useState("");
const [height, setHeight] = useState(178);
const [birthDate, setBirthDate] = useState("");
// SAVES QUESTIONS INTO LOCAL HOST
useEffect(()=>{
  const SavedData = localStorage.getItem("Qorshah-jidhka-user")
    if(SavedData){
      const data = JSON.parse(SavedData)
      setStep(data.step || 1)
      setGoal(data.goal || "")
      setGender(data.gender || "")
      setName(data.name || "")
      setWhatsapp(data.whatsapp || "")
      setUnit(data.unit || "kg")
      setWeight(data.weight || 75)
      setChallenge(data.challenge || "")
    }
},[])
  const selectedStory = stories[goal] || null;
useEffect(() => {
  const formData = {
    step,
    goal,
    gender,
    name,
    whatsapp,
    unit,
    weight,
    challenge,
  };

  localStorage.setItem(
    "Qorshah-jidhka-user",
    JSON.stringify(formData)
  );
}, [
  step,
  goal,
  gender,
  name,
  whatsapp,
  unit,
  weight,
  challenge,
]);
 
  const handleGoalSelect = (selectedGoal) => {
    setGoal(selectedGoal);
    setTimeout(() => {
      setStep(3);
    }, 500);
    console.log(selectedGoal)
  };
const nextStep = () => {
  if (step === 4) {
    if (name.trim() === "") {
      toast.error("Fadlan geli magacaaga!");
      return;
    }
    setStep(5);
    return;
  }

  if (step === 5) {
    setStep(6); // birth -> height
    return;
  }

  if (step === 6) {
    setStep(7); // height -> weight
    return;
  }

  if (step === 7) {
    setStep(8); // weight -> whatsapp
    return;
  }

  if (step === 8) {
  
  if (step === 8) {
    setStep(9);
    return;
  }

    setStep(9); // whatsapp -> experience
    return;
  }

  if (step === 9) {
    setStep(10); // experience -> challenge
    return;
  }
    if (step === 10) {
    const error = validateWhatsApp(whatsapp);

    if (error) {
      toast.error(error);
      return;
    }

    navigate("/Loading");
    return;
  }
};
const validateWhatsApp = (number) => {
  const cleaned = number.replace(/\s+/g, ""); // remove spaces

  if (!/^\d+$/.test(cleaned)) {
    return "WhatsApp number waa inuu noqdaa tirooyin kaliya!";
  }

  if (!cleaned.startsWith("25263")) {
    return "WhatsApp number waa inuu ku bilaabmaa 25263!";
  }

  if (cleaned.length !== 12) {
    return "WhatsApp number waa inuu noqdaa 12 digit (25263XXXXXXX)!";
  }
  
  return "";
  
};

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };
  const navigate = useNavigate()

  return (
    <div className="q-wrapper">
    <ToastContainer position="top-center" autoClose={2500} />
      <div className="q-card">

        {/* TOP BAR */}
        <div className="q-topbar">
          <h4 className="q-brand">Qorshaha Jidhka</h4>

          <div className="q-progress">
            <div className="q-progress-fill" style={{ width: `${(step / 10) * 100}%` }}></div>
          </div>

          <button className="q-close" onClick={()=> navigate('/')}>✕</button>
        </div>

        {/* STEP CONTENT */}
        <div className="q-content">

          {/* STEP 2 - GOAL we made step 2 becuse we have know first gender in oder to user gets correct story */}
          {step === 2 && (
            <div className="q-step">
              <p className="q-coach">COACH Naasir</p>

              <h1 className="q-title">
                Waa maxay <span>hadafkaaga</span> hadda?
              </h1>

              <div className="q-goals">
                <div
                  className={`q-goal-card ${goal === "Misaan-kordhin" ? "active" : ""}`}
                  onClick={() => handleGoalSelect("Misaan-kordhin")}
                >
                  <img
                    src="/images/img-4.jpg"
                    alt="Lose Fat"
                  />
                  <div className="q-overlay"></div>
                  <div className="q-goal-text">
                    <small>WEIGHT MANAGEMENT</small>
                    <h3>Lumi Baruur 🔥</h3>
                  </div>
                </div>

                <div
                  className={`q-goal-card ${goal === "Muruq-dhissid" ? "active" : ""}`}
                  onClick={() => handleGoalSelect("Muruq-dhissid")}
                >
                  <img
                    src="/images/img-3.jpg"
                    alt="Build Muscle"
                  />
                  <div className="q-overlay"></div>
                  <div className="q-goal-text">
                    <small>HYPERTROPHY</small>
                    <h3>Dhis Murqo 💪</h3>
                  </div>
                </div>

                <div
                  className={`q-goal-card ${goal === "Jidh-Hagaajin" ? "active" : ""}`}
                  onClick={() => handleGoalSelect("Jidh-Hagaajin")}
                >
                  <img
                    src="/images/img-4.jpg"
                    alt="Transform"
                  />
                  <div className="q-overlay"></div>
                  <div className="q-goal-text">
                    <small>ELITE MODE</small>
                    <h3>Isbeddel Buuxa ⚡</h3>
                  </div>
                </div>
              </div>

              <div className="q-footer">
                <button className="q-back" disabled>
                  ← Back
                </button>
                <button className="q-next" disabled>
                  Next Step →
                </button>
              </div>
            </div>
          )}
          {/* STEP 2 - GENDER step we mad it step 1  becuse of story*/}
{step === 1 && (
  <div className="gender-step">

    <div className="gender-header">
      <h1 className="gender-title">
        Waa Maxay  <br />
        <span>Jinsigaagu?</span>
      </h1>

      <div className="gender-description">
        <div className="gender-line"></div>

        <p>
          This helps me optimize your hormonal and metabolic
          approach.
        </p>
      </div>
    </div>

    {/* CARDS */}
    <div className="gender-cards">

      {/* MALE */}
      <div
        className={`gender-card ${gender === "Male" ? "active" : ""}`}
        onClick={() => {
          setGender("Male");

          setTimeout(() => {
            setStep(2);
          }, 400);
        }}
      >
        <img src="/images/male.jpg" alt="male" />

        <div className="gender-overlay"></div>

        <div className="gender-content-box">
          <h2>♂</h2>
          <h1>Lab</h1>
        </div>
      </div>

      {/* FEMALE */}
      <div
        className={`gender-card ${gender === "Female" ? "active" : ""}`}
        onClick={() => {
          setGender("Female");

          setTimeout(() => {
            setStep(2);
          }, 400);
        }}
      >
        <img src="/images/female.jpg" alt="female" />

        <div className="gender-overlay"></div>

        <div className="gender-content-box">
          <h2>♀</h2>
          <h1>Dheddig</h1>
        </div>
      </div>
    </div>

    {/* FOOTER */}
    <div className="gender-footer">
      <p>
        YOUR BIOLOGICAL DATA REMAINS ENCRYPTED AND IS ONLY USED
        TO PERSONALIZE YOUR TRAINING ALGORITHMS.
      </p>

    
    </div>
  </div>
)}

          {/* STEP 4 - NAME */}
          {step === 5 && (
            <div className="q-step">
              <p className="q-coach">COACH Naasir</p>

              <h1 className="q-title">
                Ii sheeg <span>magacaaga</span>
              </h1>

              <p className="q-subtitle">
                Waxaan rabnaa inaan kuu samayno qorshe kuu gaar ah.
              </p>

              <div className="q-input-box">
                <label>Maxaan kuugu yeeraa?</label>
                <input
                  type="text"
                  placeholder="Geli magacaaga..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="q-footer">
                <button className="q-back" onClick={prevStep}>
                  ← Back
                </button>
                <button className="q-next" onClick={nextStep}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 - Height kii */}
         {step === 6 && (
  <div className="modern-step">
    <div className="modern-head">
      <p>ASSESSMENT</p>
      <h1>
        Goormaad <span>dhalatay?</span>
      </h1>
      <p className="modern-sub">
        Taariikhda dhalashada waxay naga caawisaa inaan kuu xisaabino qorshe sax ah.
      </p>
    </div>

    <div className="birth-card">
      <h2>Marka hore noo sheeg dhalashadaada</h2>

      <div className="birth-grid">
        <div className="birth-field">
          <label>Maalin</label>
          <input type="number" placeholder="24" />
        </div>

        <div className="birth-field">
          <label>Bil</label>
          <input type="text" placeholder="OCT" />
        </div>

        <div className="birth-field">
          <label>Sanad</label>
          <input type="number" placeholder="1995" />
        </div>
      </div>

      <div className="modern-actions">
        <button className="q-back" onClick={prevStep}>Back</button>
        <button className="q-next" onClick={nextStep}>Continue →</button>
      </div>
    </div>
  </div>
)}

          {/* step 6 */}
{step === 7 && (
  <div className="modern-step">
    <div className="modern-head">
      <p>ASSESSMENT</p>
      <h1>
        Waa imisa <span>dhererkaagu?</span>
      </h1>
    </div>

    <div className="height-card">
      <div className="unit-switch">
        <button className="active">CM</button>
        <button>FT/IN</button>
      </div>

      <div className="height-display">
        <h2>{height}</h2>
        <span>CM</span>
      </div>

      <input
        className="modern-range"
        type="range"
        min="140"
        max="220"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
      />

      <div className="modern-actions">
        <button className="q-back" onClick={prevStep}>Back</button>
        <button className="q-next" onClick={nextStep}>Continue →</button>
      </div>
    </div>
  </div>
)}
{/* step 7 */}
       {step === 8 && (
  <div className="q-step">

    <div className="q-coach-box">
      <img
        className="q-avatar"
        src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
        alt="coach"
      />
      <div>
        <p className="q-coach-name">COACH Naasir</p>
        <p className="q-coach-role">Qorshaha Jidhka</p>
      </div>
    </div>

    <h1 className="q-title">
      Doorosho Fiican 💪 <br />
      <span>Hadda, xaggee ka bilaabaynaa?</span>
    </h1>

    <div className="q-weight-box">
      <h2 className="q-weight-title">Waa imisa miisaankaaga hadda?</h2>

      {/* TOGGLE */}
      <div className="q-toggle">
       <button
  className={unit === "kg" ? "active" : ""}
  onClick={() => {
    if (unit === "lb") {
      setWeight(Math.round(weight / 2.205));
    }
    setUnit("kg");
  }}
>
  KG
</button>

<button
  className={unit === "lb" ? "active" : ""}
  onClick={() => {
    if (unit === "kg") {
      setWeight(Math.round(weight * 2.205));
    }
    setUnit("lb");
  }}
>
  LB
</button>
      </div>

      {/* WEIGHT INPUT */}
      <div className="q-weight-input">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <span>{unit}</span>
      </div>

      {/* SLIDER */}
      <div className="q-scale-slider">
        <div className="q-scale-lines">
          <div className="line small"></div>
          <div className="line small"></div>
          <div className="line small"></div>
          <div className="line small"></div>

          <div className="line big"></div>

          <div className="line small"></div>
          <div className="line small"></div>
          <div className="line small"></div>
          <div className="line small"></div>
        </div>

        <div className="q-scale-arrow">▲</div>
      </div>

      {/* REAL RANGE INPUT */}
      <input
        className="q-range"
        type="range"
        min={unit === "kg" ? 30 : 66}
        max={unit === "kg" ? 200 : 440}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
    </div>

    <div className="q-footer">
      <button className="q-back" onClick={prevStep}>
        ← Back
      </button>
      <button className="q-next" onClick={nextStep}>
        Continue →
      </button>
    </div>
  </div>
)}
{step === 3 && selectedStory && (
  <div className="q-step">

    <p className="q-coach">Dad badan oo sidaadoo kale ah ayaa hore u gaaray natiijooyin muuqda</p>

    <div className="story-card">
      <img src={selectedStory.image} alt="story" />

      <div className="story-content">
        <h2>{selectedStory?.name}</h2>
        <p>Before / After</p>
        <h3>{selectedStory?.result}</h3>
      </div>
    </div>

    <div className="q-footer">
      <button className="q-back" onClick={prevStep}>
        ← Back
      </button>

      <button className="q-next" onClick={() => setStep(4)}>
        Continue →
      </button>
    </div>
  </div>
)}
{/* challenge step last  step */}
{step === 4 && (
  <div className="q-step">
    <h1 className="q-title">
      Caqabadda ugu weyn <span>waa maxay?</span>
    </h1>

    <div className="q-options">
      {[
        "Wakhti la'aan",
        "Cunto xumo",
        "Jimicsi la'aan",
        "Dhiirigelin la'aan"
      ].map((item) => (
        <button
          key={item}
          className={`q-option ${challenge === item ? "active" : ""}`}
          onClick={() => {
            setChallenge(item);
            setTimeout(() => setStep(5), 400);
          }}
        >
          {item}
        </button>
      ))}
    </div>
  </div>
)}
      {step === 10 && (
  <div className="q-step">
    <div className="q-coach-box">
      <img
        className="q-avatar"
        src="/images/img-2.jpg"
        alt="coach"
      />

      <div>
        <p className="q-coach-name">COACH Naasir</p>
        <p className="q-coach-role">Qorshaha Jidhka</p>
      </div>
    </div>

    <h1 className="q-title">
      Geli <span>WhatsApp-kaaga</span>
    </h1>

    <p className="q-subtitle">
      Waxaan WhatsApp kuu isticmaaleynaa si aan kuu soo dirno:
      <br />
      ✅ Plan-kaaga Fitness
      <br />
      ✅ Support joogto ah & reminders
      <br />
      ✅ Updates iyo talooyin
      <br />
      <br />
      <span style={{ color: "#00ffa6", fontWeight: "700" }}>
        Lambarkaaga lama wadaagi doono qof kale.
      </span>
    </p>

    <div className="q-input-box">
      <label>WhatsApp Number</label>
      <input
        type="text"
        placeholder="+252 63 xxx xxxx"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />
    </div>

    <div className="q-footer">
      <button className="q-back" onClick={prevStep}>
        ← Back
      </button>
      <button className="q-next"onClick={nextStep} >
        Continue →
      </button>
    </div>
  </div>
)}
{step === 9 && (
  <div className="modern-step">
    <div className="modern-head">
      <p>ASSESSMENT PROGRESS</p>
      <h1>
        Heerkaaga <span>jimicsi?</span>
      </h1>
      <p className="modern-sub">
        Waxaan rabnaa inaan ogaano heerkaaga si qorshaha kuu fududaado.
      </p>
    </div>

    <div className="exp-grid">
      {[
        ["Bilow", "Hadda ayaan bilaabay"],
        ["Dhexe", "Waxaan joogay 6+ bilood"],
        ["Sare", "Waxaan leeyahay waayo-aragnimo"]
      ].map(([title, desc]) => (
        <div
          key={title}
          className={`exp-card ${challenge === title ? "active" : ""}`}
          onClick={() => setChallenge(title)}
        >
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
      ))}
    </div>

    <div className="modern-actions">
      <button className="q-back" onClick={prevStep}>Back</button>
      <button className="q-next" onClick={nextStep}>Continue →</button>
    </div>
  </div>
)}
        </div>

      </div>
      
    </div>
  );
}





















































// import React from 'react'
// import './Pages/questions.css'
// const Questions = () => {
//   return (
//     <>
//     {/* step 1 :Goal */}
//     <section>
//       {/* header */}
//       <div className='step-Header'>
//         <h2> Waa Maxay <span>Ujeedadadu ugu Weyn</span> Hadda?</h2>
//         <p>Dooro Hal Ikhtiyaar si aan Usii Wadno</p>
//       </div>
//       {/* Goal Cards */}
//       <div className='GoalGrid'>
//       <button className='goalCard'> 
//       <img src='/images/img-2.jpg'/>
//       <div className='overlay-cont'>
//     <div className='goal-contant'>
//     <span className='tag'>Misaan Dhimis</span>
//     <h3>Lumin Dufan 🔥</h3>
//     <p>Jirkaaga Lumi Dufanka Saaid ka ah noqo Qof Firfircoon</p>
//     </div>
//       </div>
//       </button>
//       <button className='goalCard'>
//          <img src='/images/img-3.jpg'/>
//       <div className='overlay-cont'>
//     <div className='goal-contant'>
//     <span className='tag'>Mruq Dhisid</span>
//     <h3>Dhis Muruqa Riyadad 💪</h3>
//     <p>Dhisi Muruq Xoog Ah Kii Riyadad</p>
//     </div>
//       </div>
//       </button>
//       <button className='goalCard'>
//          <img src='/images/img-2.jpg'/>
//       <div className='overlay-cont'>
//     <div className='goal-contant'>
//     <span className='tag'>IsBeddel Dhmaystiran</span>
//     <h3>Bedelka Jirka Oo Dhan ⚡</h3>
//     <p>Jirkaaga Dhis Si dhamaystiran (baruuru iyo Muruq)</p>
//     </div>
//       </div>
//       </button>
//       </div>
//     </section>
//     </>
//   )
// }

// export default Questions

























