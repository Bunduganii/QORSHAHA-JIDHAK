import React, { useState, useEffect } from "react";
import { getSubscribers, getAllCollectedEmails } from "../Services/AdminService";
import toast from "react-hot-toast";
import { FaEnvelope, FaUserCheck, FaSearch, FaFilter, FaDownload, FaUsers } from "react-icons/fa";

const EmailManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("all"); // 'all' or 'subscribers'
  const [allEmailsData, setAllEmailsData] = useState({ total_count: 0, emails: [] });
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === "all") {
        const data = await getAllCollectedEmails({ q: search, source: sourceFilter });
        setAllEmailsData(data);
      } else {
        const subs = await getSubscribers({ q: search });
        setSubscribers(subs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load email records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab, search, sourceFilter]);

  const handleExportCSV = () => {
    const listToExport = activeSubTab === "all" ? allEmailsData.emails : subscribers;
    if (!listToExport || listToExport.length === 0) {
      toast.error("No data to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeSubTab === "all") {
      csvContent += "Email,Name,WhatsApp,Source,Date,Is_Subscriber\n";
      listToExport.forEach(row => {
        csvContent += `"${row.email}","${row.name || ''}","${row.whatsapp || ''}","${row.source || ''}","${row.date || ''}","${row.is_subscriber ? 'Yes' : 'No'}"\n`;
      });
    } else {
      csvContent += "Email,Status,Subscribed_At\n";
      listToExport.forEach(row => {
        csvContent += `"${row.email}","${row.status}","${row.subscribed_at || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `qorshaha_${activeSubTab}_emails_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded! 📥");
  };

  return (
    <div className="email-management-section">
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", color: "#ffffff", fontWeight: "800" }}>Email &amp; Subscriptions</h2>
          <p style={{ color: "#8f9ca7", fontSize: "14px", marginTop: "4px" }}>
            Manage newsletter subscribers and view all customer emails collected across the platform.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            background: "rgba(0, 217, 255, 0.1)",
            border: "1px solid rgba(0, 217, 255, 0.3)",
            color: "#00d9ff",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <FaDownload /> Export to CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "14px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveSubTab("all")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: activeSubTab === "all" ? "linear-gradient(135deg, #00d9ff, #00ffa6)" : "rgba(255, 255, 255, 0.05)",
            color: activeSubTab === "all" ? "#000000" : "#8f9ca7",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaUsers /> All Emails Entered by Users
        </button>

        <button
          onClick={() => setActiveSubTab("subscribers")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: activeSubTab === "subscribers" ? "linear-gradient(135deg, #00d9ff, #00ffa6)" : "rgba(255, 255, 255, 0.05)",
            color: activeSubTab === "subscribers" ? "#000000" : "#8f9ca7",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaEnvelope /> Subscribed Emails
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ flex: "1 1 260px", position: "relative" }}>
          <FaSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#8f9ca7" }} />
          <input
            type="text"
            placeholder={activeSubTab === "all" ? "Search by email, name, or phone..." : "Search subscriber email..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {activeSubTab === "all" && (
          <div style={{ display: "flex", gap: "8px" }}>
            {["all", "Questionnaire", "Subscription", "Payment"].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: sourceFilter === src ? "1px solid #00ffa6" : "1px solid rgba(255, 255, 255, 0.1)",
                  background: sourceFilter === src ? "rgba(0, 255, 166, 0.15)" : "transparent",
                  color: sourceFilter === src ? "#00ffa6" : "#8f9ca7",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                {src === "all" ? "All Sources" : src}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tables */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#8f9ca7" }}>Loading emails... ⏳</div>
      ) : activeSubTab === "all" ? (
        allEmailsData.emails.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <p style={{ color: "#8f9ca7" }}>No collected emails found matching your filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="payments-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#8f9ca7", fontSize: "12px", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 16px" }}>Email Address</th>
                  <th style={{ padding: "14px 16px" }}>Customer Name</th>
                  <th style={{ padding: "14px 16px" }}>WhatsApp Phone</th>
                  <th style={{ padding: "14px 16px" }}>Collection Source</th>
                  <th style={{ padding: "14px 16px" }}>Date Collected</th>
                  <th style={{ padding: "14px 16px" }}>Newsletter Status</th>
                </tr>
              </thead>
              <tbody>
                {allEmailsData.emails.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "16px", fontWeight: "700", color: "#00d9ff" }}>
                      {row.email}
                    </td>
                    <td style={{ padding: "16px", color: "#ffffff" }}>
                      {row.name || "—"}
                    </td>
                    <td style={{ padding: "16px", color: "#8f9ca7" }}>
                      {row.whatsapp || "—"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#ffffff"
                      }}>
                        {row.source}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#8f9ca7" }}>
                      {row.date ? new Date(row.date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {row.is_subscriber ? (
                        <span style={{ color: "#00ffa6", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          ✓ Subscribed
                        </span>
                      ) : (
                        <span style={{ color: "#8f9ca7", fontSize: "12px" }}>Unsubscribed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        subscribers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <p style={{ color: "#8f9ca7" }}>No newsletter subscribers found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="payments-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#8f9ca7", fontSize: "12px", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 16px" }}>Subscribed Email</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px" }}>Subscription Date</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "16px", fontWeight: "700", color: "#00ffa6" }}>
                      {sub.email}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: sub.status === "subscribed" ? "rgba(0, 255, 166, 0.1)" : "rgba(255, 77, 79, 0.1)",
                        color: sub.status === "subscribed" ? "#00ffa6" : "#ff4d4f"
                      }}>
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#8f9ca7" }}>
                      {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default EmailManagement;
