import { useState, useEffect, useCallback } from "react";
import "./../pages/admin-dash.css";
import {
  getDashboardStats,
  getPayments,
  getCoachClientByAccessCode,
  updatePaymentStatus,
  verifySifaloPayment,
  getFullClientProfile
} from "../Services/AdminService";
import UploadPlan from "./UploadPlan";
import BlogManagement from "./BlogManagement";
import EmailManagement from "./EmailManagement";
import toast from "react-hot-toast";
import {
  FaSearch, FaKey, FaUserCheck, FaTimes, FaCheck, FaSync,
  FaChartLine, FaMoneyBillWave, FaEnvelope, FaNewspaper, FaDumbbell,
  FaShieldAlt, FaSpinner, FaExternalLinkAlt
} from "react-icons/fa";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'payments' | 'articles' | 'emails'
  const [stats, setStats] = useState({
    totalRevenueUSD: 0,
    totalRevenueCash: 0,
    totalClients: 0,
    paidClients: 0,
    activeCoaching: 0,
    pendingPayments: 0,
    reviewPayments: 0,
    planCounts: {},
    methodCounts: {}
  });

  const [openUpload, setOpenUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  
  // Coach Access Code Lookup Modal/Panel
  const [coachCodeInput, setCoachCodeInput] = useState("");
  const [searchingCode, setSearchingCode] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, paymentsData] = await Promise.all([
        getDashboardStats(),
        getPayments({
          q: searchTerm,
          status: statusFilter,
          method: methodFilter
        })
      ]);
      setStats(statsData);
      setPayments(paymentsData);
    } catch (e) {
      console.error("Dashboard loading error:", e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, methodFilter]);

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "payments") {
      const delayDebounce = setTimeout(() => {
        loadData();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [loadData, activeTab]);

  const handleVerifyAccessCode = async (e) => {
    e.preventDefault();
    if (!coachCodeInput.trim()) {
      toast.error("Fadlan geli Access Code-ka!");
      return;
    }
    setSearchingCode(true);
    const res = await getCoachClientByAccessCode(coachCodeInput.trim());
    setSearchingCode(false);

    if (res.success) {
      setClientDetails(res.data);
      toast.success("Macmiilka waa la helay! ✅");
    } else {
      toast.error(res.error || "Access Code-ka lama helin!");
      setClientDetails(null);
    }
  };

  const [verifyingOrderId, setVerifyingOrderId] = useState(null);

  const handleLiveSifaloVerify = async (orderId) => {
    setVerifyingOrderId(orderId);
    toast.loading("Waxaa lala xiriirayaa Sifalo Pay Gateway API... ⏳", { id: "sifalo-verify" });
    const res = await verifySifaloPayment(orderId);
    setVerifyingOrderId(null);
    toast.dismiss("sifalo-verify");

    if (res.success) {
      if (res.data?.payment_status === "PAID") {
        toast.success(res.data.message || "Lacag bixinta waa la xaqiijiyay! PAID ✅");
      } else {
        toast(res.data?.message || "Lacag bixintu weli waa PENDING.", { icon: "ℹ️" });
      }
      loadData();
      if (clientDetails && (clientDetails.order_id === orderId || clientDetails.payment_info?.order_id === orderId)) {
        handleOpenProfile(orderId);
      }
    } else {
      toast.error(res.error || "Sifalo Pay xaqiijintu way fashilantay.");
    }
  };

  const handleOpenProfile = async (orderId) => {
    const res = await getFullClientProfile(orderId);
    if (res.success) {
      setClientDetails(res.data);
    } else {
      toast.error("Xogta macmiilka lama helin.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updatePaymentStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Xaaladda lacag bixinta waxaa loo beddelay ${newStatus}`);
      loadData();
    } else {
      toast.error(res.error || "Waxaa dhacay khalad.");
    }
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="logo-area">
          <h2>Qorshaha Jidhka</h2>
          <p>COACHING DASHBOARD</p>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <FaChartLine />
            <span style={{ fontSize: "14px" }}>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`admin-nav-item ${activeTab === "payments" ? "active" : ""}`}
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <FaMoneyBillWave />
            <span style={{ fontSize: "14px" }}>Payments &amp; Orders</span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`admin-nav-item ${activeTab === "articles" ? "active" : ""}`}
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <FaNewspaper />
            <span style={{ fontSize: "14px" }}>Blog Articles</span>
          </button>

          <button
            onClick={() => setActiveTab("emails")}
            className={`admin-nav-item ${activeTab === "emails" ? "active" : ""}`}
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <FaEnvelope />
            <span style={{ fontSize: "14px" }}>Email &amp; Subscribers</span>
          </button>

          <button
            onClick={() => setOpenUpload(true)}
            className="admin-nav-item"
            style={{ background: "transparent", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <FaDumbbell />
            <span style={{ fontSize: "14px" }}>Manage Plans</span>
          </button>
          
          <UploadPlan
            isOpen={openUpload}
            onClose={() => setOpenUpload(false)}
            onPlanCreated={loadData}
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="coach-profile">
            <img
              src="/images/img-2.jpg"
              alt="Coach Naasir"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300"; }}
            />
            <div>
              <h4>Coach Naasir</h4>
              <p>Head Performance Coach</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="admin-topbar" style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "center", justifyContent: "space-between" }}>
          <div className="top-left" style={{ flex: "1 1 300px" }}>
            <h1>COACH &amp; ADMIN PORTAL</h1>
          </div>

          {/* QUICK COACH ACCESS CODE VERIFIER */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,255,166,0.08)", padding: "6px 12px", borderRadius: "10px", border: "1px solid rgba(0,255,166,0.3)" }}>
            <FaKey color="#00ffa6" />
            <input
              type="text"
              placeholder="Geli Access Code (e.g. F8K42P)"
              value={coachCodeInput}
              onChange={(e) => setCoachCodeInput(e.target.value.toUpperCase())}
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                width: "190px",
                textTransform: "uppercase"
              }}
            />
            <button
              onClick={handleVerifyAccessCode}
              disabled={searchingCode}
              style={{
                background: "#00ffa6",
                color: "#0f172a",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              {searchingCode ? "..." : "Xaqiiji"}
            </button>
          </div>
        </header>

        {/* TAB 1: BLOG ARTICLES */}
        {activeTab === "articles" && (
          <div style={{ padding: "28px" }}>
            <BlogManagement />
          </div>
        )}

        {/* TAB 2: EMAIL & SUBSCRIBERS */}
        {activeTab === "emails" && (
          <div style={{ padding: "28px" }}>
            <EmailManagement />
          </div>
        )}

        {/* TAB 3 & 4: DASHBOARD / PAYMENTS */}
        {(activeTab === "dashboard" || activeTab === "payments") && (
          <div className="dashboard-content">
            {/* COACH ACCESS CODE & COMPREHENSIVE PROFILE MODAL (SECTION 11 & 23) */}
            {clientDetails && (
              <div style={{
                background: "rgba(13, 28, 41, 0.95)",
                border: "1px solid #00d9ff",
                borderRadius: "16px",
                padding: "28px",
                marginBottom: "28px",
                position: "relative",
                boxShadow: "0 10px 40px rgba(0, 217, 255, 0.15)"
              }}>
                <button
                  onClick={() => setClientDetails(null)}
                  style={{
                    position: "absolute",
                    right: "18px",
                    top: "18px",
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#8f9ca7",
                    fontSize: "16px",
                    cursor: "pointer",
                    padding: "6px 10px"
                  }}
                >
                  <FaTimes />
                </button>

                {/* MODAL HEADER */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <FaUserCheck color="#00ffa6" size={26} />
                    <div>
                      <h2 style={{ color: "#fff", margin: 0, fontSize: "20px", fontWeight: "900" }}>
                        {clientDetails.user_info?.name || clientDetails.customer_name || "Client Profile"}
                      </h2>
                      <span style={{ fontSize: "12px", color: "#8f9ca7" }}>
                        ORDER: {clientDetails.order_id || clientDetails.payment_info?.order_id || "—"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      background: (clientDetails.payment_info?.payment_status || clientDetails.payment_status) === "PAID" ? "rgba(0, 255, 166, 0.15)" : "rgba(255, 193, 7, 0.15)",
                      color: (clientDetails.payment_info?.payment_status || clientDetails.payment_status) === "PAID" ? "#00ffa6" : "#ffc107",
                      border: (clientDetails.payment_info?.payment_status || clientDetails.payment_status) === "PAID" ? "1px solid rgba(0,255,166,0.3)" : "1px solid rgba(255,193,7,0.3)",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "900"
                    }}>
                      PAYMENT: {clientDetails.payment_info?.payment_status || clientDetails.payment_status}
                    </span>

                    {(clientDetails.payment_info?.access_code || clientDetails.access_code) && (
                      <span style={{
                        background: "rgba(0, 217, 255, 0.15)",
                        color: "#00d9ff",
                        border: "1px solid rgba(0, 217, 255, 0.3)",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "900",
                        fontFamily: "monospace"
                      }}>
                        ACCESS: {clientDetails.payment_info?.access_code || clientDetails.access_code}
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 SECTION GRID (USER, FITNESS, PLAN, PAYMENT) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                  {/* 1. USER INFORMATION */}
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 style={{ color: "#00d9ff", fontSize: "12px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                      1. USER INFORMATION
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div><strong style={{ color: "#8f9ca7" }}>Magaca:</strong> {clientDetails.user_info?.name || clientDetails.customer_name || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Email:</strong> {clientDetails.user_info?.email || clientDetails.questionnaire?.email || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>WhatsApp:</strong> {clientDetails.user_info?.whatsapp || clientDetails.whatsapp_phone || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Payment Phone:</strong> {clientDetails.user_info?.payment_phone || clientDetails.payment_phone || "—"}</div>
                    </div>
                  </div>

                  {/* 2. FITNESS INFORMATION */}
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 style={{ color: "#00ffa6", fontSize: "12px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                      2. FITNESS INFORMATION
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div><strong style={{ color: "#8f9ca7" }}>Goal:</strong> {clientDetails.fitness_info?.goal || clientDetails.questionnaire?.goal || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Gender:</strong> {clientDetails.fitness_info?.gender || clientDetails.questionnaire?.gender || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Weight:</strong> {clientDetails.fitness_info?.weight || (clientDetails.questionnaire ? `${clientDetails.questionnaire.weight} ${clientDetails.questionnaire.unit}` : "—")}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Height:</strong> {clientDetails.fitness_info?.height || (clientDetails.questionnaire ? `${clientDetails.questionnaire.height} ${clientDetails.questionnaire.height_unit}` : "—")}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Challenge:</strong> {clientDetails.fitness_info?.challenge || clientDetails.questionnaire?.challenge || "—"}</div>
                    </div>
                  </div>

                  {/* 3. PLAN INFORMATION */}
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 style={{ color: "#ffc107", fontSize: "12px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                      3. PLAN INFORMATION
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div><strong style={{ color: "#8f9ca7" }}>Plan Name:</strong> {clientDetails.plan_info?.name || clientDetails.plan_name || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Tier:</strong> {clientDetails.plan_info?.tier || "Standard"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Duration:</strong> {clientDetails.plan_info?.duration || "1 Bishii"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Price:</strong> {clientDetails.plan_info?.price ? `$${clientDetails.plan_info.price}` : "—"}</div>
                    </div>
                  </div>

                  {/* 4. PAYMENT INFORMATION */}
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h4 style={{ color: "#00d9ff", fontSize: "12px", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                      4. PAYMENT & SIFALO
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                      <div><strong style={{ color: "#8f9ca7" }}>Status:</strong> {clientDetails.payment_info?.payment_status || clientDetails.payment_status}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Amount:</strong> {clientDetails.payment_info?.amount ? `${clientDetails.payment_info.amount} ${clientDetails.payment_info.currency}` : "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Provider:</strong> Sifalo Pay</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Tx ID:</strong> <span style={{ fontFamily: "monospace", color: "#00d9ff" }}>{clientDetails.payment_info?.provider_transaction_id || "—"}</span></div>
                      <div><strong style={{ color: "#8f9ca7" }}>Coaching:</strong> {clientDetails.payment_info?.coaching_status || (clientDetails.payment_status === "PAID" ? "ACTIVE" : "INACTIVE")}</div>
                    </div>
                  </div>
                </div>

                {/* MODAL ACTIONS BAR */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "18px" }}>
                  <button
                    onClick={() => handleLiveSifaloVerify(clientDetails.order_id || clientDetails.payment_info?.order_id)}
                    disabled={verifyingOrderId === (clientDetails.order_id || clientDetails.payment_info?.order_id)}
                    style={{
                      background: "rgba(0, 217, 255, 0.15)",
                      border: "1px solid #00d9ff",
                      color: "#00d9ff",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <FaShieldAlt /> {verifyingOrderId === (clientDetails.order_id || clientDetails.payment_info?.order_id) ? "Checking Sifalo..." : "Live Verify with Sifalo Pay"}
                  </button>

                  {(clientDetails.payment_info?.payment_status || clientDetails.payment_status) !== "PAID" && (
                    <button
                      onClick={() => handleStatusChange(clientDetails.order_id || clientDetails.payment_info?.order_id, "PAID")}
                      style={{
                        background: "linear-gradient(135deg, #00d9ff, #00ffa6)",
                        border: "none",
                        color: "#0f172a",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <FaCheck /> Mark as PAID & Grant Access
                    </button>
                  )}

                  <button
                    onClick={() => setClientDetails(null)}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* TOP STATS ROW */}
            {activeTab === "dashboard" && (
              <section className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon dollar">$</div>
                  <div>
                    <p>WADARTA LACAGTA (USD)</p>
                    <h2>${stats.totalRevenueUSD.toLocaleString()}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon cash">SL</div>
                  <div>
                    <p>WADARTA CASH (SLSH)</p>
                    <h2>{stats.totalRevenueCash.toLocaleString()} <span style={{ fontSize: "13px" }}>SLSH</span></h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon users">👥</div>
                  <div>
                    <p>MACMIISHA DIIWAANGASHAN</p>
                    <h2>{stats.totalClients}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon active-c">⚡</div>
                  <div>
                    <p>LACAG BIXINTOODU GUULEYSATAY</p>
                    <h2>{stats.paidClients}</h2>
                  </div>
                </div>
              </section>
            )}

            {/* PAYMENTS SEARCH, FILTER & TABLE */}
            <section className="dashboard-section" style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ color: "#fff", margin: 0, fontSize: "20px" }}>Dhamaan Dalabyada &amp; Lacag Bixinta</h3>
                  <p style={{ color: "#8f9ca7", fontSize: "13px", marginTop: "4px" }}>Search by Order ID, Access Code, Customer Name, or Phone number</p>
                </div>

                <button
                  onClick={loadData}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px"
                  }}
                >
                  <FaSync /> Refresh
                </button>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: "1 1 280px", position: "relative" }}>
                  <FaSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8f9ca7" }} />
                  <input
                    type="text"
                    placeholder="Raadi Order ID, Access Code, Magac ama Tel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 38px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    background: "#0f1f23",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  <option value="ALL">Dhamaan Xaaladaha (All Status)</option>
                  <option value="PAID">PAID (La bixiyay)</option>
                  <option value="PENDING">PENDING (Sugaya)</option>
                  <option value="PAYMENT_REVIEW">PAYMENT_REVIEW (Hubin)</option>
                  <option value="FAILED">FAILED (Fashil)</option>
                </select>

                {/* Method Filter */}
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  style={{
                    background: "#0f1f23",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                >
                  <option value="ALL">Dhamaan Hababka (All Methods)</option>
                  <option value="Zaad">Zaad Service</option>
                  <option value="EVC Plus">EVC Plus</option>
                  <option value="Sahal">Sahal</option>
                  <option value="eDahab">eDahab</option>
                  <option value="Card">Mastercard/Visa</option>
                </select>
              </div>

              {/* PAYMENTS TABLE */}
              <div style={{ overflowX: "auto" }}>
                <table className="payments-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#8f9ca7", fontSize: "12px", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 16px" }}>Order ID</th>
                      <th style={{ padding: "14px 16px" }}>Macmiilka</th>
                      <th style={{ padding: "14px 16px" }}>Qorshaha</th>
                      <th style={{ padding: "14px 16px" }}>Lacagta</th>
                      <th style={{ padding: "14px 16px" }}>Habka</th>
                      <th style={{ padding: "14px 16px" }}>Access Code</th>
                      <th style={{ padding: "14px 16px" }}>Xaaladda</th>
                      <th style={{ padding: "14px 16px" }}>Taariikhda</th>
                      <th style={{ padding: "14px 16px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#8f9ca7" }}>
                          Waa la soo raryaa dalabyada... ⏳
                        </td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#8f9ca7" }}>
                          Wax lacag bixin ah lama helin.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#00d9ff", fontFamily: "monospace" }}>
                            {p.order_id}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: "bold", color: "#fff" }}>{p.customer_name}</div>
                            <div style={{ fontSize: "12px", color: "#8f9ca7" }}>WA: {p.whatsapp_phone}</div>
                            {p.payment_phone && p.payment_phone !== p.whatsapp_phone && (
                              <div style={{ fontSize: "11px", color: "#00ffa6" }}>Pay: {p.payment_phone}</div>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#fff" }}>
                            {p.plan_name || "—"}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#00ffa6" }}>
                            {p.currency === "USD" ? `$${p.amount}` : `${Number(p.amount).toLocaleString()} SLSH`}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#fff" }}>
                            {p.payment_method}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {p.access_code ? (
                              <span style={{
                                background: "rgba(0, 217, 255, 0.15)",
                                color: "#00d9ff",
                                padding: "3px 8px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                fontFamily: "monospace"
                              }}>
                                {p.access_code}
                              </span>
                            ) : (
                              <span style={{ color: "#64748b" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              className={
                                p.payment_status === "PAID"
                                  ? "admin-status-success"
                                  : p.payment_status === "PAYMENT_REVIEW"
                                  ? "status pending"
                                  : p.payment_status === "PENDING"
                                  ? "status pending"
                                  : "error"
                              }
                            >
                              <div></div>
                              {p.payment_status}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#94a3b8" }}>
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {/* LIVE SIFALO VERIFY BUTTON */}
                              <button
                                onClick={() => handleLiveSifaloVerify(p.order_id)}
                                disabled={verifyingOrderId === p.order_id}
                                style={{
                                  background: "rgba(0, 217, 255, 0.1)",
                                  border: "1px solid rgba(0, 217, 255, 0.3)",
                                  color: "#00d9ff",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                                title="Check real-time status with Sifalo Pay Gateway API"
                              >
                                <FaShieldAlt size={10} /> {verifyingOrderId === p.order_id ? "..." : "Sifalo"}
                              </button>

                              {/* FULL PROFILE BUTTON */}
                              <button
                                onClick={() => handleOpenProfile(p.order_id)}
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  border: "1px solid rgba(255,255,255,0.15)",
                                  color: "#fff",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  cursor: "pointer"
                                }}
                                title="Open full client questionnaire and payment profile"
                              >
                                Profile
                              </button>

                              {/* APPROVE BUTTON IF NOT PAID */}
                              {p.payment_status !== "PAID" && (
                                <button
                                  onClick={() => handleStatusChange(p.order_id, "PAID")}
                                  style={{
                                    background: "#00ffa6",
                                    color: "#0f172a",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                  }}
                                  title="Manually approve to PAID and grant access"
                                >
                                  <FaCheck size={10} /> Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;