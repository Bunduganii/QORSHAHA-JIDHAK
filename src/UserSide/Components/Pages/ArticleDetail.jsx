import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import NewsletterSection from "../NewsletterSection";
import "./Blog.css";
import { FaArrowLeft, FaCalendarAlt, FaUserCheck, FaShareAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/articles/${slug}`);
        if (res.data) {
          setArticle(res.data);
        }
      } catch (err) {
        console.warn("Article fetch error:", err.message);
        toast.error("Maqaalka lama helin.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link-ga maqaalka waa la koobiyeeyay!");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="article-detail-page" style={{ textAlign: "center", padding: "140px 20px" }}>
          <h2>Waa la soo raryaa maqaalka... ⏳</h2>
        </div>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="article-detail-page" style={{ textAlign: "center", padding: "140px 20px" }}>
          <h2>Maqaalka lama helin.</h2>
          <p style={{ marginTop: "12px", color: "#8f9ca7" }}>Waxaa laga yaabaa in meesha laga saaray ama link-ga uu qaldan yahay.</p>
          <Link to="/blog" className="read-btn" style={{ marginTop: "24px", display: "inline-flex" }}>
            <FaArrowLeft /> Ku noqo Qoraallada
          </Link>
        </div>
      </>
    );
  }

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("so-SO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Dhawaan";

  // Simple parser to render paragraphs and headings nicely from markdown/plain text
  const renderFormattedContent = (contentStr) => {
    if (!contentStr) return null;
    const paragraphs = contentStr.split("\n\n");
    return paragraphs.map((p, idx) => {
      const trimmed = p.trim();
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx}>{trimmed.replace("### ", "")}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx}>{trimmed.replace("## ", "")}</h2>;
      }
      if (trimmed.startsWith("# ")) {
        return <h2 key={idx}>{trimmed.replace("# ", "")}</h2>;
      }
      if (trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").map(li => li.replace(/^[-\*]\s+/, ""));
        return (
          <ul key={idx}>
            {items.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        );
      }
      return <p key={idx}>{trimmed}</p>;
    });
  };

  return (
    <>
      <Navbar />
      <div className="article-detail-page">
        <Link to="/blog" className="back-link">
          <FaArrowLeft size={13} /> Ku noqo dhamaan maqaallada
        </Link>

        <h1 className="article-detail-title">{article.title}</h1>

        <div className="article-author-bar">
          <img
            src="/images/img-2.jpg"
            alt="Coach Naasir"
            className="author-avatar"
            onError={(e) => { e.target.src = "/images/main-logo.png"; }}
          />
          <div className="author-info" style={{ flex: 1 }}>
            <h4>Coach Naasir</h4>
            <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaCalendarAlt size={11} color="#00ffa6" /> {formattedDate}
            </p>
          </div>

          <button
            onClick={handleShare}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#00d9ff",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            <FaShareAlt size={12} /> Share
          </button>
        </div>

        {article.featured_image && (
          <img
            src={article.featured_image}
            alt={article.title}
            className="article-featured-img"
            onError={(e) => { e.target.src = "/images/hero-1.jpg"; }}
          />
        )}

        <div className="article-body-content">
          {renderFormattedContent(article.content)}
        </div>

        {/* Newsletter Section */}
        <NewsletterSection />
      </div>
    </>
  );
};

export default ArticleDetail;
