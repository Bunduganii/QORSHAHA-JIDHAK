import "./Loading.css";
import "./Plans.css";
import { Utensils, Brain, Users, Check, ArrowRight, Zap } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "./Pages/Navbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../Supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const COACH_WHATSAPP = "252672025632";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const loadPlans = async () => {
    // 1. Try fetching from Supabase
    try {
      const { data, error } = await supabase.from("plans").select("*").order("created_at", { ascending: true });
      if (data && data.length > 0) {
        setPlans(data);
        return;
      }
    } catch (sErr) {
      console.warn("Supabase fetch notice:", sErr.message);
    }

    // 2. Try backend API
    try {
      const res = await axios.get("http://localhost:5000/api/plans");
      if (res.data && res.data.length > 0) {
        setPlans(res.data);
        return;
      }
    } catch (e) {
      console.warn("Backend plans fetch error:", e.message);
    }
  };

  useEffect(() => {
    loadPlans();
    const saved = localStorage.getItem("Qorshah-jidhka-user");
    if (saved) {
      try { setUserData(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleChoosePlan = (plan) => {
    if (!userData || !userData.name || userData.name.trim() === "") {
      toast.error("Fadlan xogtaada buuxi horta! 📝", {
        duration: 3000,
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid #00d9ff" },
      });
      setTimeout(() => navigate("/Questions"), 1500);
      return;
    }

    localStorage.setItem("selectedPlanId", plan.id);
    navigate("/mobile");
  };

  // Helper: format price smartly
  const renderPrice = (plan) => {
    const hasDollar = plan.price && Number(plan.price) > 0;
    const hasCash = plan.price_cash && Number(plan.price_cash) > 0;

    if (hasDollar && hasCash) {
      return (
        <div className="plan-price-block">
          <span className="price-currency">$</span>
          <span className="price-amount">{plan.price}</span>
          <span className="price-period">/bishii</span>
          <div className="price-cash-badge">
            {Number(plan.price_cash).toLocaleString()} SLSH
          </div>
        </div>
      );
    }
    if (hasCash && !hasDollar) {
      return (
        <div className="plan-price-block">
          <span className="price-amount" style={{ fontSize: "3rem" }}>
            {Number(plan.price_cash).toLocaleString()}
          </span>
          <span className="price-currency" style={{ fontSize: "1rem", alignSelf: "flex-end", marginBottom: "10px" }}>SLSH</span>
          <span className="price-period">/bishii</span>
        </div>
      );
    }
    // default dollar only
    return (
      <div className="plan-price-block">
        <span className="price-currency">$</span>
        <span className="price-amount">{plan.price}</span>
        <span className="price-period">/bishii</span>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <section className="plan-wrap">
        {/* HEADER */}
        <div className="plan-head">
          <p>QORSHE CASRI AH</p>
          <h1>DOORO <span>QORSHAHA</span></h1>
          <h4>Qorshe ku salaysan jidhkaaga iyo yoolkaaga.</h4>
        </div>

        {/* PLAN CARDS */}
        <div className="plan-grid">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`plan-box ${plan.popular ? "active-plan" : ""}`}
            >
              {plan.popular && (
                <div className="top-badge">
                  <Zap size={12} style={{ marginRight: "4px" }} />
                  UGU CAANSAN
                </div>
              )}

              {/* TIER BADGE */}
              <div className="plan-tier-pill">{plan.tier || "Standard"}</div>

              {/* PLAN NAME */}
              <h2 className="plan-name">{plan.name}</h2>

              {/* PRICE — smart rendering */}
              {renderPrice(plan)}

              {/* DURATION */}
              {plan.duration && (
                <div className="plan-duration">⏱ {plan.duration}</div>
              )}

              {/* DESCRIPTION */}
              {plan.description && (
                <p className="plan-desc">{plan.description}</p>
              )}

              {/* DIVIDER */}
              <div className="plan-divider" />

              {/* FEATURES */}
              <div className="plan-features">
                {(plan.features || []).filter(f => f.trim() !== "").map((item, i) => (
                  <div key={i} className="plan-feature-row">
                    <span className="plan-check-icon">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA BUTTON */}
              <button
                className="plan-cta-btn"
                onClick={() => handleChoosePlan(plan)}
              >
                <FaWhatsapp size={17} />
                <span>Dooro &amp; Bilaaw</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* BOTTOM BENTO */}
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
    </>
  );
};

export default Plans;