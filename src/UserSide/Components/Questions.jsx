import React, { useState, useEffect } from "react";
import "./Pages/questions.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { supabase } from "../../Supabase";

  // Story data — gender-aware
  const maleStories = {
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

  const femaleStories = {
    "Misaan-kordhin": {
      image: "/images/female-story-2.png",
      name: "Fadumo",
      result: "Waxaan dhimiyey 15kg 3 bilood gudahood"
    },
    "Muruq-dhissid": {
      image: "/images/female-story-1.jpeg",
      name: "Sahra",
      result: "Jidhkeyga si buuxda ayuu isu beddelay 90 maalmood"
    },
    "Jidh-Hagaajin": {
      image: "/images/female-story-2.png",
      name: "Hodan",
      result: "Waxaan heshay jidhka aan rabay 60 maalmood gudahood"
    }
  };

export default function Questions() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [unit, setUnit] = useState("kg");
  const [weight, setWeight] = useState(75);
  const [challenge, setChallenge] = useState("");
  const [height, setHeight] = useState(178);
  const [heightUnit, setHeightUnit] = useState("cm");
  const [birthDate, setBirthDate] = useState("");

  // Check Supabase Google auth session on mount
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setEmail(user.email);
          if (user.user_metadata?.full_name && !name) {
            setName(user.user_metadata.full_name);
          }
        }
      } catch (e) {}
    };
    checkGoogleAuth();
  }, []);

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
      setEmail(data.email || "")
      setUnit(data.unit || "kg")
      setWeight(data.weight || 75)
      setChallenge(data.challenge || "")
      setHeight(data.height || 178)
      setHeightUnit(data.heightUnit || "cm")
    }
},[])
  const storyBook = gender === "Female" ? femaleStories : maleStories;
  const selectedStory = storyBook[goal] || null;

useEffect(() => {
  const formData = {
    step,
    goal,
    gender,
    name,
    whatsapp,
    email,
    unit,
    weight,
    challenge,
    height,
    heightUnit,
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
  email,
  unit,
  weight,
  challenge,
  height,
  heightUnit,
]);
 
  const handleGoalSelect = (selectedGoal) => {
    setGoal(selectedGoal);
    setTimeout(() => {
      setStep(3);
    }, 500);
    console.log(selectedGoal)
  };
const nextStep = () => {
  if (step === 5) {
    if (name.trim() === "") {
      toast.error("Fadlan geli magacaaga!");
      return;
    }
    setStep(6);
    return;
  }

  if (step === 6) {
    setStep(7);
    return;
  }

  if (step === 7) {
    setStep(8);
    return;
  }

  if (step === 8) {
    setStep(9);
    return;
  }

  if (step === 9) {
    setStep(10);
    return;
  }

  if (step === 10) {
    const waError = validateWhatsApp(whatsapp);
    if (waError) {
      toast.error(waError);
      return;
    }

    const emError = validateEmail(email);
    if (emError) {
      setEmailError(emError);
      toast.error(emError);
      return;
    }
    setEmailError("");

    const payload = {
      name,
      whatsapp,
      email,
      gender,
      goal,
      weight,
      unit,
      height,
      height_unit: heightUnit,
      challenge,
      birth_date: birthDate
    };

    axios.post("http://localhost:5000/api/questionnaires", payload)
      .then((res) => {
        if (res.data && res.data.questionnaire_id) {
          localStorage.setItem("questionnaire_id", res.data.questionnaire_id);
          localStorage.setItem("client_id", res.data.client_id);
        }
      })
      .catch((err) => {
        console.warn("Questionnaire sync notice:", err.message);
      })
      .finally(() => {
        navigate("/Loading");
      });
    return;
  }
};

const validateEmail = (val) => {
  if (!val || !val.trim()) {
    return "Fadlan geli email-kaaga! (Email is required)";
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(val.trim())) {
    return "Fadlan geli email sax ah! (Invalid email address)";
  }
  return null;
};

const handleGoogleSignIn = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/Questions"
      }
    });
    if (error) {
      console.warn("Google OAuth popup fallback:", error.message);
      const userGoogleEmail = prompt("Enter your Google Account email:");
      if (userGoogleEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userGoogleEmail.trim())) {
        setEmail(userGoogleEmail.trim());
        setEmailError("");
        toast.success("Google account email linked!");
      }
    }
  } catch (err) {
    console.warn("Google Sign In error:", err.message);
  }
};

const validateWhatsApp = (number) => {
  if (!number || !number.trim()) {
    return "Fadlan geli lambarkaaga WhatsApp-ka!";
  }

  let cleaned = number.replace(/[\s\-\+\(\)]/g, ""); // remove spaces and symbols

  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  if (!cleaned.startsWith("252")) {
    cleaned = "252" + cleaned;
  }

  if (!/^\d+$/.test(cleaned)) {
    return "WhatsApp number waa inuu noqdaa tirooyin kaliya!";
  }

  // Accepts Telesom (63), Somtel (65), Hormuud (61), Somtelecom (62), Golis (90)
  const validPrefixes = ["25263", "25265", "25261", "25262", "25290", "25277"];
  const isValidPrefix = validPrefixes.some((prefix) => cleaned.startsWith(prefix));

  if (!isValidPrefix) {
    return "Fadlan geli lambar sax ah (Telesom, Somtel, Hormuud, Golis ama Somtelecom)!";
  }

  if (cleaned.length !== 12) {
    return "WhatsApp number waa inuu noqdaa 12 digit (e.g. 25263XXXXXXX ama 25265XXXXXXX)!";
  }

  return "";
};

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

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
                    src={gender === "Female" ? "/images/female-goal-1.png" : "/images/img-4.jpg"}
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
                    src={gender === "Female" ? "/images/female-goal-2.png" : "/images/img-3.jpg"}
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
                    src={gender === "Female" ? "/images/female-goal-3.png" : "/images/img-4.jpg"}
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
        <button
          className={heightUnit === "cm" ? "active" : ""}
          onClick={() => {
            if (heightUnit === "ft") {
              setHeight(Math.round(height * 2.54));
            }
            setHeightUnit("cm");
          }}
        >
          CM
        </button>
        <button
          className={heightUnit === "ft" ? "active" : ""}
          onClick={() => {
            if (heightUnit === "cm") {
              setHeight(Math.round(height / 2.54));
            }
            setHeightUnit("ft");
          }}
        >
          FT/IN
        </button>
      </div>

      <div className="height-display">
        <h2>
          {heightUnit === "cm"
            ? height
            : `${Math.floor(height / 12)}'${height % 12}"`}
        </h2>
        <span>{heightUnit === "cm" ? "CM" : "FT/IN"}</span>
      </div>

      <input
        className="modern-range"
        type="range"
        min={heightUnit === "cm" ? 140 : 55}
        max={heightUnit === "cm" ? 220 : 87}
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
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

    <div className="q-input-box" style={{ marginTop: "14px" }}>
      <label>Email <span style={{ color: "#00ffa6", fontSize: "11px" }}>*</span></label>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError("");
        }}
        style={{ borderColor: emailError ? "#ff4d4f" : "" }}
        required
      />
      {emailError && (
        <span style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px", display: "block", textAlign: "left" }}>
          {emailError}
        </span>
      )}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0 10px" }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.12)" }}></div>
      <span style={{ color: "#8f9ca7", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>OR</span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.12)" }}></div>
    </div>

    <button
      type="button"
      className="q-google-btn"
      onClick={handleGoogleSignIn}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "10px",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>
      Continue with Google
    </button>

    <div className="q-footer" style={{ marginTop: "20px" }}>
      <button className="q-back" onClick={prevStep}>
        ← Back
      </button>
      <button className="q-next" onClick={nextStep}>
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

























