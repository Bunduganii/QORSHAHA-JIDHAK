import { useEffect, useState } from "react";
import "./Success.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaDumbbell, FaUtensils, FaHeadset, FaArrowRight, FaKey, FaCopy, FaCheck } from "react-icons/fa";

const Success = () => {
  const navigate = useNavigate();
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [planName, setPlanName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Get saved paid plan information
    const paidPlan = localStorage.getItem("paidPlanName");
    const paidPrice = localStorage.getItem("paidPlanPrice") || "—";
    const paidCurrency = localStorage.getItem("paidPlanCurrency") || "USD";
    const paidGateway = localStorage.getItem("paidPlanGateway") || "Sifalo Pay";
    const storedOrderId = localStorage.getItem("order_id") || localStorage.getItem("paidTransactionId") || "FIT-2026";
    const storedAccessCode = localStorage.getItem("access_code") || "F" + storedOrderId.slice(-5);
    const storedPhone = localStorage.getItem("paidPaymentPhone") || "";

    if (!paidPlan && !storedAccessCode) {
      navigate("/plans");
      return;
    }

    setPlanName(paidPlan || "Premium Plan");
    setOrderId(storedOrderId);
    setAccessCode(storedAccessCode);
    setPaymentPhone(storedPhone);

    // 2. Get saved user quiz data
    const saved = localStorage.getItem("Qorshah-jidhka-user");
    let userData = {};
    if (saved) {
      try {
        userData = JSON.parse(saved);
      } catch (err) {}
    }

    const name = userData.name || "Macmiil";
    const whatsappNumber = userData.whatsapp || storedPhone || "—";
    const gender = userData.gender || "—";
    const goal = userData.goal || "—";
    const weight = userData.weight || "—";
    const unit = userData.unit || "kg";
    const height = userData.height || "—";
    const heightUnit = userData.heightUnit || "cm";
    const challenge = userData.challenge || "—";

    const goalMap = {
      "Misaan-kordhin": "Misaan Kordhin (Weight Gain)",
      "Muruq-dhissid":  "Muruq Dhissid (Muscle Gain)",
      "Jidh-Hagaajin":  "Jidh Hagaajin (Body Recomp)",
    };

    let formattedHeight = `${height} ${heightUnit}`;
    if (heightUnit === "ft" && typeof height === "number") {
      const feet = Math.floor(height / 12);
      const inches = height % 12;
      formattedHeight = `${feet}'${inches}" (${Math.round(height * 2.54)} cm)`;
    }

    const message = [
      `🏋️ *QORSHAHA JIDHKA — LACAG BIXIN LA XAQIIJIYEY*`,
      ``,
      `🔑 *ACCESS CODE:* ${storedAccessCode}`,
      `📦 *ORDER ID:* ${storedOrderId}`,
      `👤 *Macmiilka:* ${name}`,
      `📱 *WhatsApp:* ${whatsappNumber}`,
      storedPhone ? `💳 *Payment Phone:* ${storedPhone}` : ``,
      `📋 *Qorshaha:* ${paidPlan || "Fitness Plan"}`,
      `💵 *Qiimaha:* ${paidCurrency === "USD" ? "$" + paidPrice : Number(paidPrice).toLocaleString() + " SLSH"}`,
      `⚡ *Qaabka:* ${paidGateway}`,
      ``,
      `*Hadaf:* ${goalMap[goal] || goal}`,
      `*Miisaan:* ${weight} ${unit} | *Dherer:* ${formattedHeight}`,
      `*Caqabad:* ${challenge}`,
      ``,
      `Asc Coach Naasir! Waxaan bixiyey lacagta. Access Code-kaygu waa *${storedAccessCode}*${storedPhone ? ` waxaanan lacagta ka soo diray *${storedPhone}*` : ''}. Fadlan i soo dir qorsheyga tababarka & cuntada! 🙏`,
    ].filter(Boolean).join("\n");

    const encoded = encodeURIComponent(message);
    setWhatsappUrl(`https://wa.me/252672025632?text=${encoded}`);
  }, [navigate]);

  const copyAccessCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div className="success-page">
        <div className="success-container">
          {/* BADGE */}
          <div className="success-badge">
            <FaCheckCircle /> Payment Successful! Your coaching access is ready.
          </div>

          {/* MAIN HERO */}
          <h1 className="success-hero-title">
            WAA GUUL! <span>TABABARKAAGA HADA AYUU BILAABMAYA.</span>
          </h1>

          <p className="success-hero-sub">
            Lacag bixintaada waxaa si toos ah u xaqiijiyey nidaamka. Fadlan la xiriir Coach Naasir adigoo siinaya Access Code-kaaga hoose iyo lambarka aad lacagta ka soo dirtay.
          </p>

          {/* ACCESS CODE HERO CARD */}
          <div style={{
            background: "linear-gradient(135deg, rgba(0, 255, 166, 0.12), rgba(0, 217, 255, 0.08))",
            border: "2px solid #00ffa6",
            borderRadius: "16px",
            padding: "24px",
            margin: "24px auto",
            maxWidth: "600px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0, 255, 166, 0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#00ffa6", fontSize: "14px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
              <FaKey /> Secure Coaching Access Code
            </div>

            <div style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#ffffff",
              letterSpacing: "4px",
              margin: "12px 0",
              fontFamily: "monospace",
              background: "rgba(0, 0, 0, 0.4)",
              padding: "10px 20px",
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "14px"
            }}>
              <span>{accessCode || "F8K42P"}</span>
              <button
                onClick={copyAccessCode}
                title="Copy Access Code"
                style={{
                  background: "rgba(0, 255, 166, 0.2)",
                  border: "1px solid #00ffa6",
                  color: "#00ffa6",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {copied ? <><FaCheck /> Koobiyaysan</> : <><FaCopy /> Koobi</>}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginTop: "14px", fontSize: "13px", color: "#cbd5e1" }}>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: "11px" }}>QORSHAHA</span>
                <strong style={{ color: "#00d9ff" }}>{planName}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: "11px" }}>ORDER ID</span>
                <strong style={{ color: "#fff", fontFamily: "monospace" }}>{orderId}</strong>
              </div>
              {paymentPhone && (
                <div>
                  <span style={{ color: "#94a3b8", display: "block", fontSize: "11px" }}>PAYMENT PHONE</span>
                  <strong style={{ color: "#00ffa6" }}>{paymentPhone}</strong>
                </div>
              )}
            </div>

            {/* VERIFICATION NOTICE BOX */}
            <div style={{
              background: "rgba(0, 0, 0, 0.35)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginTop: "16px",
              fontSize: "13px",
              color: "#e2e8f0",
              lineHeight: "1.5",
              textAlign: "left"
            }}>
              📢 <strong>Farriin Muhiim ah:</strong> Si loo xaqiijiyo lacag bixintaada iyo tababarkaaga, la xiriir Coach Naasir adigoo u diraya <strong>Access Code-kaaga ({accessCode})</strong> iyo <strong>lambarka aad lacagta ka soo dirtay</strong> (haddii ay ahayd Mobile Money) ama <strong>Order ID-gaaga</strong>.
            </div>
          </div>

          {/* WHATSAPP CTA BUTTON */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-cta-btn"
              style={{ fontSize: "17px", padding: "18px 36px", display: "inline-flex", alignItems: "center", gap: "10px" }}
            >
              CHAT WITH COACH ON WHATSAPP <FaArrowRight />
            </a>
          )}

          {/* THREE PROTOCOL CARDS */}
          <div className="success-cards-grid">
            <div className="success-card">
              <div className="success-card-icon">
                <FaDumbbell size={20} />
              </div>
              <h4>PROTOCOL 01</h4>
              <p>Naqshadda tababarka gaarka ah waa la soo galiyey oo waa diyaar.</p>
            </div>

            <div className="success-card">
              <div className="success-card-icon">
                <FaUtensils size={20} />
              </div>
              <h4>QORSHAHA CUNTADA</h4>
              <p>Xogta cunnadaada iyo kaloorigaaga waa la habeeyey.</p>
            </div>

            <div className="success-card">
              <div className="success-card-icon">
                <FaHeadset size={20} />
              </div>
              <h4>XIRIIRKA TOOSKA AH</h4>
              <p>Taageero joogto ah oo 24/7 ah oo uu bixinayo Coach Naasir.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Success;
