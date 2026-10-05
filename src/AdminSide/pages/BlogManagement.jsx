import React, { useState, useEffect } from "react";
import { getAdminArticles, deleteArticle, updateArticle } from "../Services/AdminService";
import toast from "react-hot-toast";
import ArticleComposer from "./ArticleComposer";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaGlobe, FaFileAlt,
} from "react-icons/fa";

/* ─── Neon Telemetry bar ─── */
function MetricCard({ label, value, sub, color = "#00d9ff", pct }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${color}22`,
        borderRadius: "12px",
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span style={{ fontSize: "10px", color: color, fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        {label}
      </span>
      <h3 style={{ fontSize: "28px", color: "#ffffff", marginTop: "6px", fontWeight: 900 }}>{value}</h3>
      {sub && <div style={{ fontSize: "11px", color: "#4a5568", marginTop: "3px" }}>{sub}</div>}
      {pct != null && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
          </div>
        </div>
      )}
      {/* corner glow */}
      <div style={{
        position: "absolute", right: "-10px", top: "-10px",
        width: "60px", height: "60px",
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}

const BlogManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* composer mode */
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await getAdminArticles({ q: search, status: statusFilter });
      setArticles(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArticles(); }, [search, statusFilter]);

  const openCreate = () => { setEditingArticle(null); setComposerOpen(true); };
  const openEdit   = (art) => { setEditingArticle(art); setComposerOpen(true); };

  const handleComposerClose = (reason) => {
    setComposerOpen(false);
    setEditingArticle(null);
    if (reason === "saved" || reason === "published") loadArticles();
  };

  const handleDelete = async (articleId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const res = await deleteArticle(articleId);
    if (res.success) { toast.success("Article deleted."); loadArticles(); }
    else toast.error(res.error || "Failed to delete.");
  };

  const handleToggleStatus = async (art) => {
    const newStatus = art.status === "published" ? "draft" : "published";
    const res = await updateArticle(art.id, { status: newStatus });
    if (res.success) {
      toast.success(`Article set to ${newStatus}.`);
      if (res.data?.notification_result?.dispatched > 0) {
        toast.success(`📧 ${res.data.notification_result.dispatched} subscribers notified!`);
      }
      loadArticles();
    } else toast.error(res.error || "Failed to update.");
  };

  /* ── if composer is open, render it full-screen in place ── */
  if (composerOpen) {
    return (
      <ArticleComposer
        editingArticle={editingArticle}
        onClose={handleComposerClose}
      />
    );
  }

  /* stats */
  const publishedCount = articles.filter(a => a.status === "published").length;
  const draftCount = articles.filter(a => a.status === "draft").length;
  const totalReads = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  return (
    <div className="blog-management-section">

      {/* ── HEADER ── */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: "22px", color: "#ffffff", fontWeight: 900, letterSpacing: "0.5px" }}>
            BLOG &amp; CONTENT MANAGEMENT
          </h2>
          <p style={{ color: "#6b7b88", fontSize: "12px", marginTop: 4, letterSpacing: "0.5px" }}>
            PERFORMANCE JOURNAL · ARTICLE DEPLOYMENT CENTER
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 20px",
            background: "linear-gradient(135deg, #00d9ff, #00ffa6)",
            color: "#020d14", border: "none", borderRadius: "10px",
            fontWeight: 800, fontSize: "13px", cursor: "pointer",
            letterSpacing: "0.3px",
          }}
        >
          <FaPlus /> New Article
        </button>
      </div>

      {/* ── METRIC CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <MetricCard label="Total Articles" value={articles.length} sub="All-time deployments" color="#00d9ff" pct={Math.min(100, articles.length * 2)} />
        <MetricCard label="Published & Live" value={publishedCount} sub="Active on site" color="#00ffa6" pct={articles.length ? Math.round((publishedCount / articles.length) * 100) : 0} />
        <MetricCard label="Draft Pipeline" value={draftCount} sub="Awaiting publish" color="#ffc107" pct={articles.length ? Math.round((draftCount / articles.length) * 100) : 0} />
        <MetricCard label="Total Article Reads" value={totalReads.toLocaleString()} sub="Cumulative readership" color="#b48aff" pct={Math.min(100, Math.round(totalReads / 50))} />
      </div>

      {/* ── SEARCH + FILTER BAR ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <div style={{ flex: "1 1 260px", position: "relative" }}>
          <FaSearch style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#4a5568" }} />
          <input
            type="text"
            placeholder="Search by title, slug or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px 10px 36px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              color: "#e2eaf2", fontSize: 13, outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["all", "published", "draft"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: "12px", fontWeight: 700,
                textTransform: "capitalize", cursor: "pointer",
                border: statusFilter === st ? "1px solid #00d9ff" : "1px solid rgba(255,255,255,0.1)",
                background: statusFilter === st ? "rgba(0,217,255,0.12)" : "transparent",
                color: statusFilter === st ? "#00d9ff" : "#6b7b88",
                letterSpacing: "0.3px",
              }}
            >
              {st === "all" ? `All (${articles.length})` : st === "published" ? `Live (${publishedCount})` : `Draft (${draftCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── ARTICLES TABLE ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#4a5568" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
          Loading articles...
        </div>
      ) : articles.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "50px 20px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 14, border: "1px dashed rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
          <p style={{ color: "#6b7b88", fontSize: 14 }}>No articles found.</p>
          <button
            onClick={openCreate}
            style={{
              marginTop: 14, padding: "10px 20px",
              background: "linear-gradient(135deg, #00d9ff, #00ffa6)",
              color: "#020d14", border: "none", borderRadius: 8,
              fontWeight: 800, fontSize: 13, cursor: "pointer",
            }}
          >
            Create First Article
          </button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{
                textAlign: "left",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                color: "#4a5568", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px",
              }}>
                <th style={{ padding: "12px 14px" }}>Article</th>
                <th style={{ padding: "12px 14px" }}>Slug</th>
                <th style={{ padding: "12px 14px" }}>Category</th>
                <th style={{ padding: "12px 14px" }}>Status</th>
                <th style={{ padding: "12px 14px" }}>Reads</th>
                <th style={{ padding: "12px 14px" }}>Date</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr
                  key={art.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,217,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={art.featured_image || "/images/hero-1.jpg"}
                        alt={art.title}
                        style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        onError={(e) => { e.target.src = "/images/hero-1.jpg"; }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: "#ffffff", fontSize: 13 }}>{art.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7b88", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {art.excerpt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px", fontSize: 12, color: "#00d9ff", fontFamily: "monospace" }}>
                    /blog/{art.slug}
                  </td>
                  <td style={{ padding: "14px", fontSize: 12, color: "#c8d4dc" }}>
                    {art.categories?.[0] || "General"}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 9px", borderRadius: 5, fontSize: 10, fontWeight: 800,
                      letterSpacing: "0.5px",
                      background: art.status === "published" ? "rgba(0,255,166,0.1)" : "rgba(255,193,7,0.1)",
                      color: art.status === "published" ? "#00ffa6" : "#ffc107",
                      border: art.status === "published" ? "1px solid rgba(0,255,166,0.3)" : "1px solid rgba(255,193,7,0.3)",
                    }}>
                      {art.status === "published" ? "LIVE" : "DRAFT"}
                    </span>
                  </td>
                  <td style={{ padding: "14px", fontSize: 12, color: "#00ffa6", fontWeight: 700 }}>
                    {(art.views || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "14px", fontSize: 11, color: "#4a5568" }}>
                    {art.created_at ? new Date(art.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "14px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      {art.status === "published" && (
                        <a
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "5px 9px", background: "rgba(0,255,166,0.07)",
                            borderRadius: 6, color: "#00ffa6", textDecoration: "none",
                            border: "1px solid rgba(0,255,166,0.2)",
                          }}
                          title="View live"
                        >
                          <FaEye size={12} />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleStatus(art)}
                        style={{
                          padding: "5px 9px",
                          background: art.status === "published" ? "rgba(255,193,7,0.08)" : "rgba(0,255,166,0.08)",
                          border: art.status === "published" ? "1px solid rgba(255,193,7,0.3)" : "1px solid rgba(0,255,166,0.3)",
                          borderRadius: 6,
                          color: art.status === "published" ? "#ffc107" : "#00ffa6",
                          cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: "0.3px",
                        }}
                        title={art.status === "published" ? "Move to Draft" : "Publish Now"}
                      >
                        {art.status === "published" ? "DRAFT" : "PUBLISH"}
                      </button>
                      <button
                        onClick={() => openEdit(art)}
                        style={{
                          padding: "5px 9px", background: "rgba(0,217,255,0.07)",
                          border: "1px solid rgba(0,217,255,0.2)",
                          borderRadius: 6, color: "#00d9ff", cursor: "pointer",
                        }}
                        title="Edit Article"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id, art.title)}
                        style={{
                          padding: "5px 9px", background: "rgba(255,77,79,0.07)",
                          border: "1px solid rgba(255,77,79,0.2)",
                          borderRadius: 6, color: "#ff4d4f", cursor: "pointer",
                        }}
                        title="Delete"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
