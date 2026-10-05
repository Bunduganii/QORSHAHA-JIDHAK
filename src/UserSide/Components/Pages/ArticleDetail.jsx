import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./Blog.css";
import { FaArrowLeft, FaShareAlt, FaCheckCircle, FaQuoteLeft, FaClock, FaCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Newsletter
  const [newsEmail, setNewsEmail] = useState("");
  const [newsSuccess, setNewsSuccess] = useState(false);

  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/articles/${slug}`);
        if (res.data) {
          setArticle(res.data);
        }
        // Fetch related articles
        const relRes = await axios.get(`${API}/articles`);
        if (relRes.data) {
          setRelatedArticles(relRes.data.filter((a) => a.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        console.warn("Article fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link-ga maqaalka waa la koobiyeeyay!");
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsEmail || !newsEmail.trim()) return;
    try {
      const res = await axios.post(`${API}/subscriptions`, { email: newsEmail.trim() });
      if (res.data?.success) {
        setNewsSuccess(true);
        toast.success(res.data.message || "Waad ku guuleysatay diiwaangelinta!");
      }
    } catch {
      toast.error("Khalad baa dhacay. Isku day mar kale.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="journal-page" style={{ textAlign: "center", padding: "160px 20px" }}>
          <h2>Loading protocol data... ⏳</h2>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="journal-page" style={{ textAlign: "center", padding: "160px 20px" }}>
          <h2>Maqaalka lama helin.</h2>
          <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>
            Waxaa laga yaabaa in meesha laga saaray ama link-ga uu qaldan yahay.
          </p>
          <Link to="/blog" className="btn-read-solid-cyan" style={{ marginTop: "24px" }}>
            <FaArrowLeft /> Ku noqo Journal-ka
          </Link>
        </div>
      </>
    );
  }

  const readTime = Math.max(4, Math.ceil((article.content ? article.content.split(" ").length : 600) / 180));
  const publishDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "OCTOBER 2026";

  return (
    <>
      <Navbar />
      <div className="journal-page">
        <div className="article-detail-container">
          {/* BREADCRUMBS MATCHING STITCH IMAGE 3 */}
          <nav className="article-breadcrumbs">
            <Link to="/">HOME</Link>
            <span>/</span>
            <Link to="/blog">JOURNAL</Link>
            <span>/</span>
            <span style={{ color: "var(--cyan-neon)" }}>{article.category?.toUpperCase() || "HYPERTROPHY PROTOCOLS"}</span>
          </nav>

          {/* ARTICLE TITLE & ABSTRACT */}
          <h1 className="article-headline-main">{article.title}</h1>
          <p className="article-sub-abstract">{article.excerpt}</p>

          {/* AUTHOR & METADATA BAR */}
          <div className="detail-author-row">
            <div className="coach-author-pill">
              <div className="coach-avatar-circle">CN</div>
              <div className="coach-info-text">
                <div className="name">{article.author || "COACH NAASIR"}</div>
                <div className="role">HEAD OF CONDITIONING • {publishDate.toUpperCase()} • {readTime} MIN READ</div>
              </div>
            </div>

            <button
              onClick={handleShare}
              style={{
                background: "rgba(0,217,255,0.08)",
                border: "1px solid var(--border-cyan)",
                borderRadius: "8px",
                color: "var(--cyan-neon)",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaShareAlt /> SHARE PROTOCOL
            </button>
          </div>

          {/* FEATURED COVER IMAGE WITH CAPTION FIG 01.1 */}
          <div style={{ marginBottom: "36px" }}>
            <img
              src={article.featured_image || "/images/hero-1.jpg"}
              alt={article.title}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "480px",
                objectFit: "cover",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
                display: "block",
              }}
              onError={(e) => {
                e.target.src = "/images/hero-1.jpg";
              }}
            />
            <p style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "8px",
              letterSpacing: "0.5px",
              fontFamily: "monospace"
            }}>
              FIG 01.1 — Mechanical tension profiles across extended fiber lengths under high velocity eccentric phases.
            </p>
          </div>

          {/* KEY TAKEAWAYS CALLOUT BOX */}
          <div className="key-takeaways-box">
            <div className="key-takeaways-title">
              ⚡ KEY TAKEAWAYS // XOGTA MUHIIMKA AH
            </div>
            <ul>
              <li><strong>01. Mechanical Tension:</strong> Generating tension at extended muscle lengths elicits up to 2.4x higher myofibrillar growth signalling.</li>
              <li><strong>02. RIR Calibration:</strong> Systematic proximity to failure (0–2 RIR) is non-negotiable for high-threshold motor unit recruitment.</li>
              <li><strong>03. Frequency & Volume:</strong> Volume tiering of 12–18 sets per muscle group split across 2 weekly exposures maximizes fractional protein synthesis rates.</li>
            </ul>
          </div>

          {/* PRINCIPLE 01 SECTION */}
          <span className="principle-tag">PRINCIPLE 01 // OVERLOAD PROTOCOL</span>
          <h2 className="principle-title">The Proximity Paradox: Stop Guessing RIR</h2>
          <p style={{ color: "#d1d9e6", fontSize: "15px", lineHeight: "1.75", marginBottom: "20px" }}>
            Most intermediate trainees dramatically underestimate their true mechanical failure thresholds. When prescribed 2 Reps in Reserve (RIR), video analysis consistently confirms trainees are stopping 4 to 6 reps shy of true failure. Without targeted mechanical tension in the final voluntary contractions, high-threshold motor unit recruitment is negligible.
          </p>

          {/* COMPARATIVE PARAMETER BOXES */}
          <div className="comparative-grid">
            <div className="param-box">
              <h4>Lengthened Overload</h4>
              <p>Active stretch under loaded conditions. Stimulates titin kinase cascades and delivers maximum mechanical tension across targeted sarcomeres.</p>
            </div>
            <div className="param-box">
              <h4>Contractile Velocity</h4>
              <p>Concentric speed output and peak contraction squeezes. Generates high motor unit recruitment but with lower structural hypertrophic micro-trauma.</p>
            </div>
          </div>

          {/* BIG SOMALI BLOCKQUOTE CARD */}
          <div className="quote-card-somali">
            <div className="quote-icon-large">
              <FaQuoteLeft />
            </div>
            <div className="quote-text-somali">
              "Daalka waa la abuuri karaa si sahlan. Laakiin koritaanka dhabta ahi wuxuu u baahan yahay kicinta saxda ah ee unugyada muruqa iyo qorshe xisaabsan."
            </div>
            <div className="quote-author-somali">
              — COACH NAASIR, HEAD OF CONDITIONING
            </div>
          </div>

          {/* PRINCIPLE 02 SECTION */}
          <span className="principle-tag">PRINCIPLE 02 // PERIODIZATION PROTOCOL</span>
          <h2 className="principle-title">Volume Tiering & Hypertrophy Microcycles</h2>
          <p style={{ color: "#d1d9e6", fontSize: "15px", lineHeight: "1.75", marginBottom: "24px" }}>
            Progressive overload cannot be sustained linearly without planned volume tiers and strategic deload cadences. The table below represents the periodization model utilized across our 12-week high performance coaching client roster.
          </p>

          {/* SCIENTIFIC PROTOCOL SCHEDULE DATA TABLE */}
          <div className="protocol-table-wrap">
            <table className="protocol-table">
              <thead>
                <tr>
                  <th>PHASE</th>
                  <th>FOCUS</th>
                  <th>INTENSITY</th>
                  <th>VOLUME TIER</th>
                  <th>DELOAD CADENCE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="highlight">Phase 01 (Wk 1–4)</td>
                  <td>Base Hypertrophy</td>
                  <td>70–75% 1RM</td>
                  <td>12–14 Sets/Wk</td>
                  <td>Week 5 (40% Vol)</td>
                </tr>
                <tr>
                  <td className="highlight">Phase 02 (Wk 5–8)</td>
                  <td>Mechanical Overload</td>
                  <td>75–82% 1RM</td>
                  <td>14–16 Sets/Wk</td>
                  <td>Week 9 (40% Vol)</td>
                </tr>
                <tr>
                  <td className="highlight">Phase 03 (Wk 9–11)</td>
                  <td>Peak Volume Accumulation</td>
                  <td>80–85% 1RM</td>
                  <td style={{ color: "var(--green-neon)", fontWeight: "800" }}>16–18 Sets/Wk (Peak)</td>
                  <td>Week 12 (Full Reset)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* RELATED ARTICLES 3-CARD GRID */}
          <div style={{ marginTop: "60px", marginBottom: "20px" }}>
            <div className="section-title-cyan-bar" style={{ marginBottom: "24px" }}>
              DISPATCHES RELEVANT TO THIS PROTOCOL
            </div>

            <div className="dispatches-grid">
              {relatedArticles.map((art) => (
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
                  </div>
                  <div className="dispatch-content">
                    <h4 className="dispatch-title" style={{ fontSize: "14px" }}>{art.title}</h4>
                    <p className="dispatch-excerpt" style={{ fontSize: "12px", WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {art.excerpt}
                    </p>
                    <div className="dispatch-footer">
                      <span className="dispatch-author">{art.author || "Coach Naasir"}</span>
                      <span className="dispatch-read-link">AKHRI →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* BOTTOM NEWSLETTER CTA */}
          <div className="weekly-dispatch-card" style={{ marginTop: "40px" }}>
            <div className="weekly-dispatch-inner">
              <div className="weekly-info-col">
                <span className="weekly-badge">DISPATCH INTAKE // 01</span>
                <h2>WEEKLY DISPATCH PROTOCOLS</h2>
                <p>Hel cilmiga jimicsiga, cuntada, iyo protocols-ka toos ugu dhaca email-kaaga toddobaad kasta.</p>
              </div>

              <div className="weekly-action-col">
                {newsSuccess ? (
                  <div style={{ color: "#00ffa6", fontWeight: "700" }}>
                    <FaCheckCircle /> Waad ku mahadsan tahay ku biiristaada!
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
                    <button type="submit" className="btn-read-solid-cyan" style={{ border: "none" }}>
                      SUBSCRIBE
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleDetail;
