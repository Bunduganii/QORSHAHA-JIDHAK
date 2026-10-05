import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import NewsletterSection from "../NewsletterSection";
import "./Blog.css";
import { FaArrowRight, FaCalendarAlt, FaSearch } from "react-icons/fa";

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/articles");
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

  const filtered = articles.filter((a) => {
    const term = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <Navbar />
      <div className="blog-page">
        <div className="blog-header">
          <span className="blog-tag">WARAR & TALOOYIN</span>
          <h1>
            Qoraallada <span>Fitness-ka & Caafimaadka</span>
          </h1>
          <p>
            Baro talooyinka ugu dambeeyay ee cuntada, dhismaha murqaha, iyo jimicsiga saxda ah ee Coach Naasir.
          </p>

          {/* Search Box */}
          <div style={{ maxWidth: "460px", margin: "28px auto 0", position: "relative" }}>
            <FaSearch style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#8f9ca7" }} />
            <input
              type="text"
              placeholder="Raadi maqaal (e.g. Cunto, Muruq, Jimicsi)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 18px 12px 42px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8f9ca7" }}>
            <h2>Waa la soo raryaa maqaallada... ⏳</h2>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8f9ca7" }}>
            <h3>Ma jiraan maqaallo hadda la helay.</h3>
            <p style={{ marginTop: "8px" }}>Fadlan dib u soo booqo dhawaan!</p>
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map((article) => {
              const formattedDate = article.published_at
                ? new Date(article.published_at).toLocaleDateString("so-SO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                : "Dhawaan";

              return (
                <Link
                  to={`/blog/${article.slug}`}
                  key={article.id}
                  className="article-card"
                >
                  <div className="article-img-wrap">
                    <img
                      src={article.featured_image || "/images/hero-1.jpg"}
                      alt={article.title}
                      onError={(e) => {
                        e.target.src = "/images/hero-1.jpg";
                      }}
                    />
                  </div>
                  <div className="article-content-box">
                    <div className="article-meta">
                      <FaCalendarAlt size={12} color="#00ffa6" />
                      <span>{formattedDate}</span>
                      <span className="dot"></span>
                      <span>Coach Naasir</span>
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>
                    <span className="read-btn">
                      Akhri Maqaalka <FaArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Stay Updated Subscription Section */}
        <NewsletterSection />
      </div>
    </>
  );
};

export default Blog;
