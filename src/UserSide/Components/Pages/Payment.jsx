import { useState, useEffect } from "react";
import "../Pages/Payment.css";
import "../Loading.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaLock, FaShieldAlt } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const Payment = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingPay, setLoadingPay] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [agree, setAgree] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      const planId = localStorage.getItem("selectedPlanId") || "plan-premium";
      try {
        const res = await axios.get(`http://localhost:5000/api/plans/${planId}`);
        if (res.data) setPlan(res.data);
      } catch (err) {
        console.warn("Backend plan fetch error:", err.message);
        setPlan({
          id: planId,
          name: "Premium Elite",
          price: 20,
          currency: "USD",
          description: "Full fitness and nutrition coaching program."
        });
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlan();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!plan) {
      toast.error("Qorsho ma doortin!");
      return;
    }

    if (!agree) {
      toast.error("Fadlan ogolaaw Shuruudaha iyo Xeerarka!");
      return;
    }

    let questionnaireId = localStorage.getItem("questionnaire_id");
    const savedUserStr = localStorage.getItem("Qorshah-jidhka-user");
    let userData = {};
    if (savedUserStr) {
      try { userData = JSON.parse(savedUserStr); } catch (err) {}
    }

    if (!questionnaireId) {
      try {
        const qRes = await axios.post("http://localhost:5000/api/questionnaires", {
          name: cardHolder || userData.name || "Macmiil",
          whatsapp: userData.whatsapp || "252630000000",
          gender: userData.gender,
          goal: userData.goal,
          weight: userData.weight,
          unit: userData.unit || "kg",
          height: userData.height,
          height_unit: userData.heightUnit || "cm",
          challenge: userData.challenge
        });
        if (qRes.data && qRes.data.questionnaire_id) {
          questionnaireId = qRes.data.questionnaire_id;
          localStorage.setItem("questionnaire_id", questionnaireId);
        }
      } catch (err) {
        console.warn("Questionnaire creation notice:", err.message);
      }
    }

    setLoadingPay(true);

    try {
      toast.loading("Lacag bixinta kaarka waa la farsamaynayaa... 💳", { id: "payment-toast" });

      const res = await axios.post("http://localhost:5000/api/payments/create", {
        plan_id: plan.id,
        questionnaire_id: questionnaireId,
        payment_method: "Card",
        payment_phone: userData.whatsapp || "252630000000",
        currency: "USD",
      });

      console.log("Card Payment Response:", res.data);
      setLoadingPay(false);

      if (res.data && res.data.success && res.data.status === "PAID") {
        toast.success("Lacag bixinta waa lagu guuleystay! 🎉", { id: "payment-toast" });

        localStorage.setItem("paidPlanName", res.data.plan_name || plan.name);
        localStorage.setItem("paidPlanPrice", res.data.amount);
        localStorage.setItem("paidPlanCurrency", res.data.currency);
        localStorage.setItem("paidPlanGateway", "Mastercard / Visa (Sifalo Pay)");
        localStorage.setItem("paidTransactionId", res.data.order_id);
        localStorage.setItem("access_code", res.data.access_code);
        localStorage.setItem("order_id", res.data.order_id);

        setTimeout(() => navigate("/success"), 500);
      } else if (res.data && res.data.pending) {
        toast.loading("Lacag bixinta kaarka waa la sugayaa...", { id: "payment-toast" });
      } else {
        toast.error(res.data?.message || "Lacag bixinta waa ku guuldareysatay kaarkaaga.", { id: "payment-toast" });
      }
    } catch (err) {
      console.error("Card payment error:", err);
      setLoadingPay(false);
      const errMsg = err.response?.data?.message || err.message || "Lacag bixinta kaarka waa ku guuldareysatay.";
      toast.error(errMsg, { id: "payment-toast" });
    }
  };

  if (loadingPlan) {
    return (
      <div className="payment-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#fff" }}>Waa la soo raryaa...</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-page">
        <div className="payment-container">
          {/* LEFT SIDE: DYNAMIC PLAN SUMMARY */}
          {plan && (
            <div className="order-summary">
              <span className="summary-tag">ORDER SUMMARY</span>
              <h1>{plan.name}</h1>
              <p className="summary-desc">
                {plan.description || "Start your fitness transformation today with a personalized training and nutrition program."}
              </p>

              <div className="summary-features">
                <div className="feature-card">
                  <h4>24/7 WhatsApp Coaching</h4>
                  <p>Direct communication with Coach Naasir.</p>
                </div>
                <div className="feature-card">
                  <h4>Customized Protocol</h4>
                  <p>Exercises tailored to your goals.</p>
                </div>
                <div className="feature-card">
                  <h4>Nutrition Guide</h4>
                  <p>Calculated calories and meal guidance.</p>
                </div>
              </div>

              <div className="total-box">
                <p>Total Amount (Verified)</p>
                <h2>${plan.price}</h2>
              </div>
            </div>
          )}

          {/* RIGHT SIDE: SECURE SIFALO CARD CHECKOUT */}
          <div className="payment-card">
            <div className="payment-header">
              <h2>Secure Card Checkout</h2>
              <div className="card-brands">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
              </div>
            </div>
            
            <form className="payment-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Magacaaga oo buuxa"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                />
              </div>

              <div style={{
                background: "rgba(0, 255, 166, 0.05)",
                border: "1px solid rgba(0, 255, 166, 0.2)",
                borderRadius: "10px",
                padding: "16px",
                margin: "15px 0",
                fontSize: "13px",
                color: "#e2e8f0",
                lineHeight: "1.6"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00ffa6", fontWeight: "bold", marginBottom: "6px" }}>
                  <FaLock /> <span>Direct Sifalo Pay Gateway Security</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  Card payments are processed securely through Sifalo Pay. We never store or ask for sensitive card numbers, CVVs, or PINs.
                </p>
              </div>

              <div className="checkbox-wrap">
                <input 
                  type="checkbox" 
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <p>I agree to the Terms & Conditions.</p>
              </div>

              <button type="submit" className="pay-btn" disabled={loadingPay} style={{ marginTop: "12px" }}>
                {loadingPay ? "Processing with Sifalo..." : `Pay $${plan?.price || 20} USD via Sifalo Gateway`}
              </button>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/mobile")}
                  style={{ background: "transparent", border: "none", color: "#00d9ff", cursor: "pointer", fontSize: "13px" }}
                >
                  ← Pay via Mobile Money (Zaad / EVC / Sahal / eDahab)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;