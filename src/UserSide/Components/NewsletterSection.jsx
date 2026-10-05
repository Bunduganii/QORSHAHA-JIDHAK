import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPaperPlane, FaCheckCircle } from "react-icons/fa";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      toast.error("Fadlan geli email-kaaga!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/subscriptions", {
        email: email.trim()
      });
      if (res.data && res.data.success) {
        setSubscribed(true);
        toast.success(res.data.message || "Waad ku guuleysatay diiwaangelinta!");
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Khalad ayaa dhacay. Fadlan isku day mar kale.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section" style={{
      background: "linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 15, 29, 0.95) 100%)",
      border: "1px solid rgba(0, 217, 255, 0.15)",
      borderRadius: "16px",
      padding: "40px 24px",
      margin: "60px auto 40px",
      maxWidth: "800px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: "-50px",
        right: "-50px",
        width: "150px",
        height: "150px",
        background: "radial-gradient(circle, rgba(0, 255, 166, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />
      
      <span style={{
        color: "#00ffa6",
        fontSize: "13px",
        fontWeight: "700",
        letterSpacing: "2px",
        textTransform: "uppercase",
        display: "block",
        marginBottom: "8px"
      }}>
        STAY UPDATED
      </span>
      <h2 style={{ color: "#ffffff", fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>
        Hel Talooyin & Qoraallo Cusub Oo <span style={{ color: "#00d9ff" }}>Bilaash Ah</span>
      </h2>
      <p style={{ color: "#8f9ca7", fontSize: "15px", maxWidth: "520px", margin: "0 auto 24px", lineHeight: "1.6" }}>
        Enter your email to receive weekly workout advice, nutrition secrets, and new article updates directly from Coach Naasir.
      </p>

      {subscribed ? (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(0, 255, 166, 0.1)",
          border: "1px solid #00ffa6",
          padding: "12px 24px",
          borderRadius: "10px",
          color: "#00ffa6",
          fontWeight: "600"
        }}>
          <FaCheckCircle /> Waad ku mahadsan tahay ku biiristaada!
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              flex: "1 1 260px",
              padding: "14px 18px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 26px",
              background: "linear-gradient(135deg, #00d9ff, #00ffa6)",
              color: "#000000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.2s ease"
            }}
          >
            <FaPaperPlane /> {loading ? "Waa la dirayaa..." : "Subscribe"}
          </button>
        </form>
      )}
    </section>
  );
};

export default NewsletterSection;
