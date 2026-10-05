import { useState, useEffect, useRef } from "react";
import "../Pages/MobileForm.css";
import { useNavigate } from "react-router-dom";
import {
  FaWallet, FaCreditCard, FaMobileAlt, FaSpinner,
  FaShieldAlt, FaCheckCircle, FaTimesCircle, FaPhone,
} from "react-icons/fa";
import Navbar from "./Navbar";
import axios from "axios";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";

/* ──────────────────────────────────────────────────────
   USSD PIN MODAL — shown as overlay while polling
────────────────────────────────────────────────────── */
const USSDModal = ({ method, phone, orderTime, onCheckNow, onCancel, checking, attempts, maxAttempts }) => {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const pct = Math.min(100, Math.round((attempts / maxAttempts) * 100));
  const remainSec = Math.max(0, (maxAttempts * 5) - elapsed);
  const remainMin = Math.floor(remainSec / 60);
  const remainSecFmt = String(remainSec % 60).padStart(2, "0");

  return (
    <div className="ussd-overlay">
      <div className="ussd-modal">
        {/* top pulse bar */}
        <div className="ussd-pulse-bar">
          <div className="ussd-pulse-fill" style={{ width: `${100 - pct}%` }} />
        </div>

        <div className="ussd-icon-row">
          <div className="ussd-phone-icon">
            <FaPhone size={28} color="#00d9ff" />
          </div>
        </div>

        <h3 className="ussd-title">Codsi Waxaa Loo Diray Talifoonkaaga</h3>
        <p className="ussd-subtitle">
          Lambarka <strong style={{ color: "#00d9ff" }}>+252 {phone}</strong> ayaa hada ka helaya
          codsiga USSD ee <strong style={{ color: "#00ffa6" }}>{method}</strong>.
        </p>

        {/* Step-by-step guide */}
        <div className="ussd-steps">
          <div className="ussd-step">
            <span className="ussd-step-num">1</span>
            <span>Ka eeg shaashadda talifoonkaaga — codsiga lacagta wuu soo baxayaa</span>
          </div>
          <div className="ussd-step">
            <span className="ussd-step-num">2</span>
            <span>Geli PIN-kaaga si aad u xaqiijiso lacag bixinta</span>
          </div>
          <div className="ussd-step">
            <span className="ussd-step-num">3</span>
            <span>Raac tilmaamaha shaashadda talifoonkaaga</span>
          </div>
        </div>

        {/* Timer row */}
        <div className="ussd-timer-row">
          <span className="ussd-timer-label">Wakhti la sugayo:</span>
          <span className="ussd-timer-val">
            {remainMin}:{remainSecFmt}
          </span>
          <span className="ussd-attempt-label">
            ({attempts}/{maxAttempts} hubinta)
          </span>
        </div>

        {/* Dots animation */}
        <div className="ussd-dots">
          <span /><span /><span /><span /><span />
        </div>

        <div className="ussd-actions">
          <button
            className="ussd-btn-check"
            onClick={onCheckNow}
            disabled={checking}
          >
            {checking
              ? <><FaSpinner className="spin" size={13} /> Waa la hubin...</>
              : <><FaCheckCircle size={13} /> PIN-ka Waan Geliyay — Hubi Hadda</>}
          </button>
          <button className="ussd-btn-cancel" onClick={onCancel}>
            <FaTimesCircle size={12} /> Jooji
          </button>
        </div>

        <p className="ussd-note">
          ⚡ Nidaamku si toos ah ayuu u hubin doonaa — inaad dhagsato badhanka kor kuma lahan.
        </p>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────── */
const MobileForm = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState("EVC Plus");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* USSD modal state */
  const [ussdOpen, setUssdOpen] = useState(false);
  const [ussdOrderId, setUssdOrderId] = useState(null);
  const [ussdSid, setUssdSid] = useState(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [manualChecking, setManualChecking] = useState(false);
  const MAX_ATTEMPTS = 24; // 24 × 5s = 120s

  const pollRef = useRef(null);

  const methods = [
    { name: "EVC Plus", prefix: "61", icon: <FaWallet /> },
    { name: "Zaad",    prefix: "63", icon: <FaMobileAlt /> },
    { name: "Sahal",   prefix: "90", icon: <FaWallet /> },
    { name: "eDahab",  prefix: "65", icon: <FaWallet /> },
    { name: "WAAFI",   prefix: "",   icon: <FaWallet /> },
  ];
  const selectedMethod = methods.find(m => m.name === method);

  /* ── load plan ── */
  useEffect(() => {
    const fetchPlan = async () => {
      const planId = localStorage.getItem("selectedPlanId") || "plan-premium";
      try {
        const res = await axios.get(`${API}/plans/${planId}`);
        if (res.data) {
          setPlan(res.data);
          const hasDollar = res.data.price && Number(res.data.price) > 0;
          const hasCash   = res.data.price_cash && Number(res.data.price_cash) > 0;
          setCurrency(hasCash ? "SLSH" : "USD");
        }
      } catch {
        setPlan({ id: planId, name: "Premium Elite", price: 20, price_cash: 200000, currency: "USD", duration: "1 Bishii" });
        setCurrency("USD");
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlan();
  }, []);

  /* ── clear interval on unmount ── */
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  /* ── handle a PAID response from verify ── */
  const handlePaidResult = (data) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setUssdOpen(false);
    setSubmitting(false);

    localStorage.setItem("paidPlanName",    data.plan_name || plan?.name || "");
    localStorage.setItem("paidPlanPrice",   data.amount);
    localStorage.setItem("paidPlanCurrency",data.currency);
    localStorage.setItem("paidPlanGateway", `${method} (Sifalo Pay)`);
    localStorage.setItem("paidTransactionId", data.order_id);
    localStorage.setItem("access_code",     data.access_code);
    localStorage.setItem("order_id",        data.order_id);
    localStorage.setItem("paidPaymentPhone",data.payment_phone || paymentPhone);

    toast.success("Lacag bixinta waa lagu guuleystay! 🎉", { id: "payment-toast" });
    setTimeout(() => navigate("/success"), 600);
  };

  /* ── auto-polling every 5s ── */
  const startPolling = (orderId, sid) => {
    let attempts = 0;
    setPollAttempts(0);

    pollRef.current = setInterval(async () => {
      attempts++;
      setPollAttempts(attempts);

      try {
        const res = await axios.post(`${API}/payments/verify`, { order_id: orderId, sid });
        if (res.data?.success && res.data?.status === "PAID") {
          handlePaidResult(res.data);
          return;
        }
        if (res.data?.status === "FAILED") {
          clearInterval(pollRef.current);
          setUssdOpen(false);
          setSubmitting(false);
          toast.error(res.data.message || "Lacag bixinta waa ku guuldareysatay.", { id: "payment-toast" });
        }
      } catch (e) {
        console.warn("Poll error:", e.message);
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollRef.current);
        setUssdOpen(false);
        setSubmitting(false);
        toast.error("Wakhtigii lacag bixinta wuu dhamaaday. Isku day mar kale ama la xiriir Coach.", { id: "payment-toast" });
      }
    }, 5000);
  };

  /* ── manual "I've entered my PIN" button ── */
  const handleManualCheck = async () => {
    if (!ussdOrderId) return;
    setManualChecking(true);
    try {
      const res = await axios.post(`${API}/payments/verify`, { order_id: ussdOrderId, sid: ussdSid });
      if (res.data?.success && res.data?.status === "PAID") {
        handlePaidResult(res.data);
      } else if (res.data?.status === "FAILED") {
        clearInterval(pollRef.current);
        setUssdOpen(false);
        setSubmitting(false);
        toast.error(res.data.message || "Lacag bixinta waa ku guuldareysatay.", { id: "payment-toast" });
      } else {
        toast("Weli lama xaqiijin. PIN-ka ka eeg talifoonkaaga.", { icon: "📱", id: "payment-toast" });
      }
    } catch (e) {
      toast.error("Khalad baa dhacay. Isku day mar kale.", { id: "payment-toast" });
    }
    setManualChecking(false);
  };

  const handleCancelUSSD = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setUssdOpen(false);
    setSubmitting(false);
    toast("Lacag bixinta waa la joojiyay.", { icon: "❌" });
  };

  /* ── main submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!plan) { toast.error("Qorsho ma doortin!"); return; }
    if (!paymentPhone) { toast.error("Fadlan geli lambarkaaga talifoonka lacag bixinta!"); return; }

    if (selectedMethod?.prefix && !paymentPhone.startsWith(selectedMethod.prefix)) {
      toast.error(`${method} lambarka waa inuu ku bilaabmo ${selectedMethod.prefix}`);
      return;
    }

    let questionnaireId = localStorage.getItem("questionnaire_id");
    const savedUserStr = localStorage.getItem("Qorshah-jidhka-user");
    let userData = {};
    try { if (savedUserStr) userData = JSON.parse(savedUserStr); } catch {}

    if (!questionnaireId) {
      try {
        const qRes = await axios.post(`${API}/questionnaires`, {
          name:        userData.name || "Macmiil",
          whatsapp:    userData.whatsapp || paymentPhone,
          email:       userData.email || "",
          gender:      userData.gender,
          goal:        userData.goal,
          weight:      userData.weight,
          unit:        userData.unit || "kg",
          height:      userData.height,
          height_unit: userData.heightUnit || "cm",
          challenge:   userData.challenge,
        });
        if (qRes.data?.questionnaire_id) {
          questionnaireId = qRes.data.questionnaire_id;
          localStorage.setItem("questionnaire_id", questionnaireId);
        }
      } catch (err) {
        console.warn("Questionnaire notice:", err.message);
      }
    }

    setSubmitting(true);
    let cleanPhone = String(paymentPhone).replace(/[\s\-\+\(\)]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
    const accountPayload = cleanPhone.startsWith("252") ? cleanPhone : "252" + cleanPhone;

    toast.loading("Codsiga lacag bixinta waa la dirayaa... 📱", { id: "payment-toast" });

    try {
      const res = await axios.post(`${API}/payments/create`, {
        plan_id:        plan.id,
        questionnaire_id: questionnaireId,
        payment_method: method,
        payment_phone:  accountPayload,
        email:          userData.email || "",
        currency,
      }, { timeout: 130000 });

      toast.dismiss("payment-toast");

      if (res.data?.success && res.data?.status === "PAID") {
        handlePaidResult(res.data);

      } else if (res.data?.pending || res.data?.status === "PENDING") {
        /* ── USSD Push sent — show modal + start polling ── */
        setUssdOrderId(res.data.order_id);
        setUssdSid(res.data.sid || null);
        setUssdOpen(true);
        startPolling(res.data.order_id, res.data.sid);

      } else if (res.data?.status === "PAYMENT_REVIEW") {
        setSubmitting(false);
        toast("Lacag bixintaada waxaa lagu hubinayaa. Fadlan la xiriir Coach.", { icon: "⏳", duration: 6000 });

      } else {
        setSubmitting(false);
        toast.error(res.data?.message || "Lacagta ma aadan bixin. Isku day mar kale.", { id: "payment-toast" });
      }
    } catch (err) {
      toast.dismiss("payment-toast");
      setSubmitting(false);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(typeof msg === "object" ? JSON.stringify(msg) : String(msg || "Khalad baa dhacay."), { id: "payment-toast" });
    }
  };

  if (loadingPlan) {
    return (
      <div className="payment-page" style={{ justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#fff" }}>Waa la soo raryaa... ⚡</h2>
      </div>
    );
  }

  const hasDollar = plan?.price && Number(plan.price) > 0;
  const hasCash   = plan?.price_cash && Number(plan.price_cash) > 0;
  const priceDisplay = currency === "USD"
    ? `$${plan?.price || 20}`
    : `${Number(plan?.price_cash || 200000).toLocaleString()} SLSH`;

  return (
    <>
      <Navbar />

      {/* ── USSD PIN MODAL OVERLAY ── */}
      {ussdOpen && (
        <USSDModal
          method={method}
          phone={paymentPhone}
          attempts={pollAttempts}
          maxAttempts={MAX_ATTEMPTS}
          checking={manualChecking}
          onCheckNow={handleManualCheck}
          onCancel={handleCancelUSSD}
        />
      )}

      <div className="payment-page">
        <div className="checkout-card">
          <div className="checkout-header">
            <h2>Hagaaji Lacag Bixinta</h2>
            <p>Dooro qaabka aad rabto inaad u bixiso lacagta</p>
          </div>

          {/* PLAN SUMMARY BOX */}
          {plan && (
            <div className="order-summary-box" style={{
              background: "rgba(255,255,255,0.03)", padding: "20px",
              borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px",
            }}>
              <h3 style={{ color: "#fff", marginBottom: 5 }}>{plan.name}</h3>
              <p style={{ color: "#8f9ca7", fontSize: 14, marginBottom: 15 }}>
                {plan.description || "Qorshahaaga caafimaad iyo dhismaha jirka."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#8f9ca7", display: "block" }}>MUDDO</span>
                  <strong style={{ color: "#fff" }}>{plan.duration || "1 Bishii"}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "#8f9ca7", display: "block" }}>QIIMAHA</span>
                  <strong style={{ fontSize: 20, color: "#00d9ff" }}>{priceDisplay}</strong>
                </div>
              </div>

              {hasDollar && hasCash && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#8f9ca7" }}>Lacagta ku bixi:</span>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    {["USD", "SLSH"].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        style={{
                          padding: "6px 12px", borderRadius: 6,
                          border: currency === c ? "1px solid #00d9ff" : "1px solid rgba(255,255,255,0.1)",
                          background: currency === c ? "rgba(0,217,255,0.1)" : "transparent",
                          color: currency === c ? "#00d9ff" : "#8f9ca7",
                          cursor: "pointer", fontSize: 12, fontWeight: "bold",
                        }}
                      >
                        {c === "USD" ? "Dollar ($)" : "Cash (SLSH)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENT METHOD TILES */}
          <div className="methods-grid">
            {methods.map(item => (
              <div
                key={item.name}
                className={`method-tile ${method === item.name ? "active" : ""}`}
                onClick={() => setMethod(item.name)}
              >
                <span className="method-icon">{item.icon}</span>
                <span className="method-name">{item.name}</span>
              </div>
            ))}
            <div className="method-tile" onClick={() => navigate("/mastercard")}>
              <span className="method-icon"><FaCreditCard /></span>
              <span className="method-name">Card</span>
            </div>
          </div>

          {/* PHONE INPUT FORM */}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label style={{ fontSize: 15, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                <span>Payment phone number</span>
              </label>

              <div className="phone-input" style={{ marginTop: 6 }}>
                <div className="country-code">+252</div>
                <input
                  type="tel"
                  value={paymentPhone}
                  onChange={e => setPaymentPhone(e.target.value)}
                  placeholder={selectedMethod?.prefix ? `${selectedMethod.prefix}XXXXXXX` : "6XXXXXXXX"}
                  required
                  disabled={submitting}
                />
              </div>

              <div style={{
                background: "rgba(0,217,255,0.05)", border: "1px solid rgba(0,217,255,0.2)",
                borderRadius: 8, padding: "10px 12px", marginTop: 10, fontSize: 12, color: "#00d9ff", lineHeight: 1.5,
              }}>
                ℹ️ <strong>Geli lambarka talifoonka aad lacagta ku bixinayso.</strong> Waxay ka duwan kartaa lambarka WhatsApp-kaaga.
              </div>
            </div>

            <button
              type="submit"
              className="pay-btn"
              disabled={submitting}
              style={{ marginTop: 18 }}
            >
              {submitting
                ? <><FaSpinner style={{ animation: "spin 1s linear infinite", marginRight: 8 }} /> Waa la dirayaa...</>
                : `Xaqiiji Lacag Bixinta (${priceDisplay})`}
            </button>
          </form>

          <div className="gateway" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16 }}>
            <FaShieldAlt color="#00ffa6" /> Secured via SIFALO Pay Gateway
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileForm;