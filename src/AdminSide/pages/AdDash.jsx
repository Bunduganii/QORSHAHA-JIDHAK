import { useState, useEffect, useCallback } from "react";
import "./../pages/admin-dash.css";
import { getDashboardStats, getPayments, getCoachClientByAccessCode, updatePaymentStatus } from "../Services/AdminService";
import UploadPlan from "./UploadPlan";
import BlogManagement from "./BlogManagement";
import EmailManagement from "./EmailManagement";
import toast from "react-hot-toast";
import { FaSearch, FaKey, FaUserCheck, FaTimes, FaCheck, FaSync, FaChartLine, FaMoneyBillWave, FaEnvelope, FaNewspaper, FaDumbbell } from "react-icons/fa";

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
            {/* COACH ACCESS CODE MODAL DETAILS */}
            {clientDetails && (
              <div style={{
                background: "rgba(0, 217, 255, 0.05)",
                border: "1px solid #00d9ff",
                borderRadius: "14px",
                padding: "24px",
                marginBottom: "28px",
                position: "relative"
              }}>
                <button
                  onClick={() => setClientDetails(null)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "16px",
                    background: "transparent",
                    border: "none",
                    color: "#8f9ca7",
                    fontSize: "18px",
                    cursor: "pointer"
                  }}
                >
                  <FaTimes />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <FaUserCheck color="#00ffa6" size={24} />
                  <h3 style={{ color: "#fff", margin: 0 }}>Macmiilka: {clientDetails.customer_name}</h3>
                  <span style={{
                    background: clientDetails.payment_status === "PAID" ? "rgba(0, 255, 166, 0.15)" : "rgba(255, 193, 7, 0.15)",
                    color: clientDetails.payment_status === "PAID" ? "#00ffa6" : "#ffc107",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    Status: {clientDetails.payment_status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#8f9ca7", textTransform: "uppercase" }}>Access Code</span>
                    <p style={{ fontSize: "16px", fontWeight: "bold", color: "#00d9ff", margin: "4px 0 0" }}>{clientDetails.access_code}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#8f9ca7", textTransform: "uppercase" }}>WhatsApp Number</span>
                    <p style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", margin: "4px 0 0" }}>{clientDetails.whatsapp_phone}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#8f9ca7", textTransform: "uppercase" }}>Payment Phone</span>
                    <p style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", margin: "4px 0 0" }}>{clientDetails.payment_phone || "—"}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#8f9ca7", textTransform: "uppercase" }}>Plan Selected</span>
                    <p style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", margin: "4px 0 0" }}>{clientDetails.plan_name}</p>
                  </div>
                </div>

                {clientDetails.questionnaire && (
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "10px" }}>
                    <h4 style={{ color: "#00ffa6", fontSize: "14px", marginBottom: "10px" }}>QORSHAHA JIDHKA — XOGTA SU'AALAHA MACMIILKA:</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", fontSize: "13px" }}>
                      <div><strong style={{ color: "#8f9ca7" }}>Goal:</strong> {clientDetails.questionnaire.goal || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Gender:</strong> {clientDetails.questionnaire.gender || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Email:</strong> {clientDetails.questionnaire.email || "—"}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Weight:</strong> {clientDetails.questionnaire.weight} {clientDetails.questionnaire.unit}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Height:</strong> {clientDetails.questionnaire.height} {clientDetails.questionnaire.height_unit}</div>
                      <div><strong style={{ color: "#8f9ca7" }}>Challenge:</strong> {clientDetails.questionnaire.challenge || "—"}</div>
                    </div>
                  </div>
                )}
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
                          <td style={{ padding: "14px 16px" }}>
                            {p.payment_status === "PAYMENT_REVIEW" && (
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
                                title="Mark as PAID and grant access"
                              >
                                <FaCheck /> Approve
                              </button>
                            )}
                            {p.access_code && (
                              <button
                                onClick={() => {
                                  setCoachCodeInput(p.access_code);
                                  getCoachClientByAccessCode(p.access_code).then((res) => {
                                    if (res.success) setClientDetails(res.data);
                                  });
                                }}
                                style={{
                                  background: "rgba(0,217,255,0.1)",
                                  border: "1px solid #00d9ff",
                                  color: "#00d9ff",
                                  borderRadius: "4px",
                                  padding: "3px 8px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  marginLeft: "4px"
                                }}
                                title="View full questionnaire and details"
                              >
                                Details
                              </button>
                            )}
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