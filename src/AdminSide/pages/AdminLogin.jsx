import React, { useState } from "react";
import "./../pages/Admin.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../Supabase";

const AdminLogin = () => {
  const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  setLoading(false);

  if (error) {
    alert("Email ama password waa khalad");
    return;
  }

  if (data.user) {
    if (
      data.user.email ===
      "qorshahjidhka@gmail.com"
    ) {
      navigate("/admin-dashboard");
        setSuccess(true);
    } 
    else {
      alert("Ma lihid ogolaansho admin.");

      await supabase.auth.signOut();
    }
  }
};

  return (
    <div className="admin-wrapper">
      {/* LEFT SIDE */}
      <div className="admin-left">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600"
          alt="fitness"
        />

        <div className="overlay"></div>
        <div className="grain"></div>

        <div className="left-content">
          <h1>
            COACH <span>NASIR</span>
          </h1>

          <div className="left-info">
            <div>
              <p>Xarunta Cilmi Baarista</p>
              <span>Hargeisa • Somalilnad </span>
            </div>
          </div>
        </div>

        <div className="top-stats">
          <p>AMNIGA: FIRFIRCOON</p>
          <p>XAWAARE: 0.002MS</p>
          <p>XIRIIRKA: AES-256</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <main className="admin-right">
        <header className="admin-header">
          <div>
            <div className="mini-line"></div>

            <h2>
              COACH <span>NASIR</span>
            </h2>
          </div>

          <div className="status-live">
            <span></span>
            <p>Nidaam Firfircoon</p>
          </div>
        </header>

        <div className="form-area">
          <div className="title-box">
            <h3>Gelitaanka Maamulka</h3>

            <p>
              Kaliya shaqaalaha maamulka ayaa geli kara nidaamkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-box">
              <label>AQOONSIGA MAAMULKA</label>

              <input
                type="text"
                placeholder="Geli magaca admin-ka"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Email ka admin ka"
              />
            </div>

            <div className="input-box">
              <label>FURAHA SIRTA</label>

              <input
                type="password"
                placeholder="••••••••••"
                required
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Password ka admin"
              />
            </div>

            <div className="btn-area">
            <button
  type="submit"
  className={`login-btn ${loading ? "loading" : ""}`}
  disabled={loading}
>
  {loading ? (
    <>
      <span className="spinner"></span>
      <span>La xaqiijinayaa...</span>
    </>
  ) : success ? (
    <>
      <span>Gelitaan La Oggolaaday</span>
      <span>✓</span>
    </>
  ) : (
    <>
      <span>Gal Maamulka</span>
      <span>→</span>
    </>
  )}
</button>

              <a href="#">Ma ilowday furaha?</a>
            </div>
          </form>
        </div>

        <footer className="admin-footer">
          <div className="footer-left">
            <div className="footer-item">
              <span>🔒</span>
              <p>Nidaam Amni v4.2</p>
            </div>

            <div className="footer-item">
              <span>✔</span>
              <p>Nidaamku Wuu Shaqaynayaa</p>
            </div>
          </div>

          <div className="footer-right">
            <p>© 2026 COACH NASIR</p>
            <span>HARGEISA HQ</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLogin;