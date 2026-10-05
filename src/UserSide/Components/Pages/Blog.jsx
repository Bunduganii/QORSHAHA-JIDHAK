import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./Blog.css";
import { FaSearch, FaArrowRight, FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Newsletter State
  const [newsEmail, setNewsEmail] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API}/articles`);
        if (res.data) {
          setArticles(res.data);
        }
      } catch (err) {
        console.warn("Error fetching articles:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsEmail || !newsEmail.trim()) {
      toast.error("Fadlan geli email-kaaga!");
      return;
    }
    setNewsLoading(true);
    try {
      const res = await axios.post(`${API}/subscriptions`, { email: newsEmail.trim() });
      if (res.data?.success) {
        setNewsSuccess(true);
        toast.success(res.data.message || "Diiwaangelintaadu way guuleysatay! 🎉");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Khalad baa dhacay. Isku day mar kale.");
    } finally {
      setNewsLoading(false);
    }
  };

  // Filter logic
  const filtered = articles.filter((a) => {
    const matchesSearch =
      !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      (a.content && a.content.toLowerCase().includes(search.toLowerCase()));

    const cat = (a.category || "Fitness").toLowerCase();
    const matchesCategory =
      activeCategory === "all" ||
      cat === activeCategory.toLowerCase() ||
      (a.categories && a.categories.some((c) => c.toLowerCase() === activeCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  // Category counts
  const totalCount = articles.length;
  const countCategory = (catName) => {
    return articles.filter((a) => {
      const cat = (a.category || "Fitness").toLowerCase();
      return (
        cat === catName.toLowerCase() ||
        (a.categories && a.categories.some((c) => c.toLowerCase() === catName.toLowerCase()))
      );
    }).length;
  };

  const categories = [
    { key: "all", label: "DHAMAAN", count: totalCount },
    { key: "fitness", label: "FITNESS", count: countCategory("fitness") || 14 },
    { key: "cuntada", label: "CUNTADA", count: countCategory("nutrition") + countCategory("cuntada") || 12 },
    { key: "jimicsiga", label: "JIMICSIGA", count: countCategory("workouts") + countCategory("jimicsiga") || 15 },
    { key: "hab-nololeedka", label: "HAB-NOLOLEEDKA", count: countCategory("lifestyle") + countCategory("hab-nololeedka") || 7 },
  ];

  const featuredArticle = articles.find((a) => a.id === "art-hypertrophy-principles") || articles[0];
  const gridArticles = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 6);

  return (
    <>
      <Navbar />
      <div className="journal-page">
        {/* HEADER SECTION MATCHING STITCH IMAGE 1 */}
        <header className="journal-header">
          <div className="journal-top-badge">
            • CILMIGA JIMICSIGA • HAB-DHISKA PROTOCOLS
          </div>

          <div className="journal-header-grid">
            <div className="journal-title-box">
              <h1>
                PERFORMANCE <span>JOURNAL</span>
              </h1>
              <p>
                Cilmiga tababarka, xogta nafaqada, iyo qorshayaasha jimicsiga ee heerka caalami ee Coach Naasir.
              </p>
            </div>

            <div className="journal-stats-pills">
              <div className="journal-stat-pill">
                <span className="num cyan">{totalCount || 48}</span>
                <span className="label">ARTICLES</span>
              </div>
              <div className="journal-stat-pill">
                <span className="num green">04</span>
                <span className="label">CATEGORIES</span>
              </div>
              <div className="journal-stat-pill">
                <span className="num">⚡ 7d</span>
                <span className="label">CADENCE</span>
              </div>
            </div>
          </div>
        </header>

        {/* CATEGORY FILTER & SEARCH BAR */}
        <div className="journal-filter-row">
          <div className="category-pills">
            {categories.map((c) => (
              <button
                key={c.key}
                className={`cat-pill ${activeCategory === c.key ? "active" : ""}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label} <span className="count">({String(c.count).padStart(2, "0")})</span>
              </button>
            ))}
          </div>

          <div className="journal-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search protocols, hypertrophy, nutrition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* FEATURED HERO PROTOCOL CARD */}
        {featuredArticle && activeCategory === "all" && !search && (
          <div className="hero-protocol-card">
            <div className="hero-visual-pane">
              <img
                src={featuredArticle.featured_image || "/images/hero-1.jpg"}
                alt={featuredArticle.title}
                onError={(e) => {
                  e.target.src = "/images/hero-1.jpg";
                }}
              />
              <div className="hero-overlay-tags">
                <span className="badge-featured">FEATURED PROTOCOL</span>
                <span className="badge-cat">8 MIN READ</span>
              </div>
              <div className="hero-peer-review-badge">
                ✓ PEER-REVIEWED PROTOCOL
              </div>
            </div>

            <div className="hero-content-pane">
              <div>
                <div className="hero-read-meta">
                  <span>HYPERTROPHY ARCHITECTURE</span>
                  <span>•</span>
                  <span>{new Date(featuredArticle.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>

                <h2 className="hero-article-title">{featuredArticle.title}</h2>
                <p className="hero-article-excerpt">{featuredArticle.excerpt}</p>

                {/* Telemetry Mini Card */}
                <div className="telemetry-mini-card">
                  <div>
                    <div className="telemetry-label">VOLUME TIER</div>
                    <div className="telemetry-value">14–18 SETS</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="telemetry-label">RIR PROXIMITY</div>
                    <div className="telemetry-value">0–2 RIR</div>
                  </div>
                </div>
              </div>

              <div className="hero-footer-row">
                <div className="coach-author-pill">
                  <div className="coach-avatar-circle">CN</div>
                  <div className="coach-info-text">
                    <div className="name">{featuredArticle.author || "COACH NAASIR"}</div>
                    <div className="role">HEAD OF CONDITIONING</div>
                  </div>
                </div>

                <Link to={`/blog/${featuredArticle.slug}`} className="btn-read-solid-cyan">
                  AKHRI PROTOCOL-KA →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* RECENT DISPATCHES SECTION */}
        <div className="section-header-bar">
          <div className="section-title-cyan-bar">RECENT DISPATCHES / PROTOCOLS</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
            Showing {filtered.length} protocols
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            <p>Loading protocols... ⏳</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <h3>Wax maqaallo ah lama helin qaybtan.</h3>
            <p style={{ marginTop: "8px" }}>Fadlan dooro qayb kale ama tirtir qoraalka raadinta.</p>
          </div>
        ) : (
          <div className="dispatches-grid">
            {(activeCategory === "all" && !search ? gridArticles : filtered).map((art) => {
              const readTime = Math.max(3, Math.ceil((art.content ? art.content.split(" ").length : 300) / 180));
              return (
                <Link to={`/blog/${art.slug}`} key={art.id} className="dispatch-card">
                  <div className="dispatch-img-wrap">
                    <img
                      src={art.featured_image || "/images/hero-3.jpg"}
                      alt={art.title}
                      onError={(e) => {
                        e.target.src = "/images/hero-1.jpg";
                      }}
                    />
                    <div className="dispatch-card-cat">{art.category || "FITNESS"}</div>
                    <div className="dispatch-read-time">{readTime} MIN READ</div>
                  </div>

                  <div className="dispatch-content">
                    <div className="dispatch-meta-date">
                      {art.created_at ? new Date(art.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "OCT 2026"}
                    </div>
                    <h3 className="dispatch-title">{art.title}</h3>
                    <p className="dispatch-excerpt">{art.excerpt}</p>

                    <div className="dispatch-footer">
                      <div className="dispatch-author">
                        <div className="dispatch-author-badge">CN</div>
                        <span>{art.author || "COACH NAASIR"}</span>
                      </div>
                      <span className="dispatch-read-link">
                        AKHRI <FaArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* WEEKLY DISPATCH / NEWSLETTER CARD MATCHING STITCH IMAGE 1 & 4 */}
        <div className="weekly-dispatch-card">
          <div className="weekly-dispatch-inner">
            <div className="weekly-info-col">
              <span className="weekly-badge">DISPATCH INTAKE // 01</span>
              <h2>WEEKLY DISPATCH PROTOCOLS</h2>
              <p>
                Hel cilmiga jimicsiga, cuntada, iyo protocols-ka toos ugu dhaca email-kaaga toddobaad kasta adiga oo aan waxba lagaa qaadayn.
              </p>
            </div>

            <div className="weekly-action-col">
              <div className="weekly-fee-badge">
                <span className="fee-label">ANNUAL SUBSCRIPTION FEE</span>
                <span className="fee-val">$0.00</span> <span className="free">/ BILAASH</span>
              </div>

              {newsSuccess ? (
                <div style={{
                  background: "rgba(0,255,166,0.1)",
                  border: "1px solid #00ffa6",
                  padding: "14px 20px",
                  borderRadius: "8px",
                  color: "#00ffa6",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <FaCheckCircle /> Waad ku mahadsan tahay! Email-kaaga waa la diiwaangeliyay.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="weekly-input-group">
                  <input
                    type="email"
                    placeholder="ath.elite@domain.com"
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-read-solid-cyan"
                    disabled={newsLoading}
                    style={{ border: "none", cursor: newsLoading ? "not-allowed" : "pointer" }}
                  >
                    {newsLoading ? "..." : "SUBSCRIBE"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="weekly-trust-footer">
            <span>🛡️ 256-BIT ENCRYPTION</span>
            <span>⚡ CADENCE: WEEKLY DISPATCH</span>
            <span>📖 FORMAT: PEER-REVIEWED</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
