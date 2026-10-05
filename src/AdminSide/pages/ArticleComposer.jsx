import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  createArticle,
  updateArticle,
  getAdminArticles,
} from "../Services/AdminService";
import toast from "react-hot-toast";
import {
  FaBold, FaItalic, FaUnderline, FaHeading, FaListUl, FaListOl,
  FaCode, FaLink, FaImage, FaQuoteLeft, FaSave, FaEye, FaRocket,
  FaToggleOn, FaToggleOff, FaTag, FaTimes, FaPlus, FaEdit,
} from "react-icons/fa";
import "./ArticleComposer.css";

/* ─── tiny markdown inserter ─── */
function insertMarkdown(textarea, before, after = "") {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + selected + after;
  textarea.setRangeText(replacement, start, end, "select");
  textarea.focus();
}

/* ─── Telemetry bar sub-component ─── */
function TelemetryBar({ label, value, color = "#00d9ff" }) {
  return (
    <div className="ac-telemetry-bar">
      <span className="ac-tel-label">{label}</span>
      <div className="ac-tel-track">
        <div className="ac-tel-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="ac-tel-val" style={{ color }}>{value}%</span>
    </div>
  );
}

/* ─── Tag pill ─── */
function TagPill({ label, onRemove }) {
  return (
    <span className="ac-tag-pill">
      {label}
      <button onClick={onRemove} title="Remove tag"><FaTimes size={9} /></button>
    </span>
  );
}

/* ──────────────────────────────────────────────────── */
const ArticleComposer = ({ editingArticle = null, onClose }) => {
  /* form state */
  const [form, setForm] = useState({
    title: editingArticle?.title || "",
    slug: editingArticle?.slug || "",
    excerpt: editingArticle?.excerpt || "",
    content: editingArticle?.content || "",
    featured_image: editingArticle?.featured_image || "",
    status: editingArticle?.status || "draft",
    categories: editingArticle?.categories || [],
    tags: editingArticle?.tags || [],
    author: editingArticle?.author || "Coach Naasir",
    publish_timing: "immediate",
  });

  const [activeEditorTab, setActiveEditorTab] = useState("write"); // 'write' | 'preview'
  const [tagInput, setTagInput] = useState("");
  const [broadcastEnabled, setBroadcastEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [charCount, setCharCount] = useState(form.title.length);
  const [wordCount, setWordCount] = useState(0);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const textareaRef = useRef(null);
  const TITLE_MAX = 100;

  /* ── load recent deployments ── */
  useEffect(() => {
    (async () => {
      setLoadingRecent(true);
      const data = await getAdminArticles({ status: "all" });
      setRecentArticles(data.slice(0, 5));
      setLoadingRecent(false);
    })();
  }, []);

  /* ── word/char counters ── */
  useEffect(() => {
    setCharCount(form.title.length);
  }, [form.title]);

  useEffect(() => {
    const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [form.content]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  /* ── slug auto-gen from title ── */
  const handleTitleChange = (val) => {
    set("title", val);
    if (!editingArticle) {
      set("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  /* ── category toggle ── */
  const CATEGORIES = ["Workouts", "Fitness", "Nutrition", "Lifestyle"];
  const toggleCategory = (cat) => {
    set("categories", form.categories.includes(cat)
      ? form.categories.filter((c) => c !== cat)
      : [...form.categories, cat]);
  };

  /* ── tags ── */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  };
  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));

  /* ── markdown toolbar ── */
  const toolbar = [
    { icon: <FaBold />,      action: () => insertMarkdown(textareaRef.current, "**", "**"),    tip: "Bold" },
    { icon: <FaItalic />,    action: () => insertMarkdown(textareaRef.current, "_", "_"),       tip: "Italic" },
    { icon: <FaUnderline />, action: () => insertMarkdown(textareaRef.current, "<u>", "</u>"),  tip: "Underline" },
    { icon: <FaHeading />,   action: () => insertMarkdown(textareaRef.current, "## "),          tip: "H2" },
    { label: "H3",           action: () => insertMarkdown(textareaRef.current, "### "),         tip: "H3" },
    { icon: <FaListUl />,    action: () => insertMarkdown(textareaRef.current, "- "),           tip: "Bullet List" },
    { icon: <FaListOl />,    action: () => insertMarkdown(textareaRef.current, "1. "),          tip: "Ordered List" },
    { icon: <FaCode />,      action: () => insertMarkdown(textareaRef.current, "`", "`"),       tip: "Inline Code" },
    { icon: <FaLink />,      action: () => insertMarkdown(textareaRef.current, "[", "](url)"),  tip: "Link" },
    { icon: <FaImage />,     action: () => insertMarkdown(textareaRef.current, "![alt](", ")"), tip: "Image" },
    { icon: <FaQuoteLeft />, action: () => insertMarkdown(textareaRef.current, "> "),           tip: "Blockquote" },
  ];

  /* ── insert callout box ── */
  const insertCallout = () => {
    insertMarkdown(
      textareaRef.current,
      "\n\n> 📌 **Coach Protocol Checkpoint**\n> ",
      "\n\n"
    );
  };

  /* ── save draft ── */
  const handleSaveDraft = async () => {
    if (!form.title.trim()) { toast.error("Cinwaanka maqalka ayaa loo baahan yahay!"); return; }
    setSaving(true);
    const payload = { ...form, status: "draft", broadcast: false };
    const res = editingArticle
      ? await updateArticle(editingArticle.id, payload)
      : await createArticle(payload);
    setSaving(false);
    if (res.success) {
      toast.success("Qoraalka waxaa loo keydsaday sida musawwadda ✅");
      onClose?.("saved");
    } else {
      toast.error(res.error || "Keydsashadu waxay ku guuldareysatay");
    }
  };

  /* ── publish ── */
  const handlePublish = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Cinwaanka iyo qoraalka ayaa loo baahan yahay!");
      return;
    }
    setSaving(true);
    const payload = { ...form, status: "published", broadcast: broadcastEnabled };
    const res = editingArticle
      ? await updateArticle(editingArticle.id, payload)
      : await createArticle(payload);
    setSaving(false);
    if (res.success) {
      toast.success("Maqaalku waa la daabacay! 🚀");
      if (res.data?.notification_result?.dispatched > 0) {
        toast.success(`📧 ${res.data.notification_result.dispatched} subscriber ayaa la ogeysiiyay!`);
      }
      onClose?.("published");
    } else {
      toast.error(res.error || "Daabacaaduhu ku guuldareysatay");
    }
  };

  /* ── read time estimate ── */
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  /* ── simple markdown → html preview ── */
  const renderPreview = useCallback((md) => {
    return md
      .replace(/^### (.+)/gm, "<h3>$1</h3>")
      .replace(/^## (.+)/gm, "<h2>$1</h2>")
      .replace(/^# (.+)/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^> (.+)/gm, "<blockquote>$1</blockquote>")
      .replace(/^- (.+)/gm, "<li>$1</li>")
      .replace(/\n\n/g, "<br/><br/>");
  }, []);

  /* ── telemetry content score ── */
  const contentScore = Math.min(100, Math.round((wordCount / 800) * 100));
  const titleScore = form.title.length > 30 ? 100 : Math.round((form.title.length / 30) * 100);
  const excerptScore = form.excerpt.length > 80 ? 100 : Math.round((form.excerpt.length / 80) * 100);

  return (
    <div className="ac-root">
      {/* ── TOP BREADCRUMB BAR ── */}
      <div className="ac-topbar">
        <div className="ac-breadcrumb">
          <span className="ac-bc-link" onClick={() => onClose?.()}>Admin Dashboard</span>
          <span className="ac-bc-sep">›</span>
          <span className="ac-bc-link" onClick={() => onClose?.()}>Blog</span>
          <span className="ac-bc-sep">›</span>
          <span className="ac-bc-current">{editingArticle ? "Edit Article" : "Create New Article"}</span>
        </div>
        <div className="ac-topbar-right">
          <div className="ac-draft-badge">
            <span className="ac-dot-amber" />
            Draft {form.title ? "(Unsaved changes)" : ""}
          </div>
          <button className="ac-btn-ghost" onClick={handleSaveDraft} disabled={saving}>
            <FaSave size={13} /> Save Draft
          </button>
          <button className="ac-btn-ghost" title="Preview article">
            <FaEye size={13} /> Preview Article
          </button>
          <button className="ac-btn-primary" onClick={handlePublish} disabled={saving}>
            <FaRocket size={13} /> {saving ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </div>

      {/* ── PAGE TITLE ROW ── */}
      <div className="ac-page-heading">
        <h1 className="ac-page-title">
          {editingArticle ? <><FaEdit size={20} /> EDIT ARTICLE</> : "CREATE FITNESS ARTICLE"}
        </h1>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="ac-layout">
        {/* ────── LEFT COLUMN: EDITOR ────── */}
        <div className="ac-left">
          {/* Article Title */}
          <div className="ac-field-card">
            <div className="ac-field-header">
              <label className="ac-label">ARTICLE TITLE</label>
              <span className="ac-char-count">{charCount}/{TITLE_MAX} max</span>
            </div>
            <input
              className="ac-title-input"
              type="text"
              maxLength={TITLE_MAX}
              placeholder="The 5 Fundamental Hypertrophy Principles Most Lifters Ignore"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          {/* Short Excerpt */}
          <div className="ac-field-card">
            <div className="ac-field-header">
              <label className="ac-label">SHORT EXCERPT <span className="ac-label-sub">(CARD SNIPPET &amp; SEO SUMMARY)</span></label>
              <span className="ac-label-sub">Card &amp; Search snippet</span>
            </div>
            <textarea
              className="ac-excerpt-input"
              rows={3}
              placeholder="A rigorous breakdown of progressive tension overload, systematic proximity to failure (RIR), volume tarring, and recovery mechanics required for elite muscle adaptation."
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </div>

          {/* Editor Tabs + Toolbar */}
          <div className="ac-editor-card">
            <div className="ac-editor-topbar">
              <div className="ac-editor-tabs">
                <button
                  className={`ac-tab ${activeEditorTab === "write" ? "active" : ""}`}
                  onClick={() => setActiveEditorTab("write")}
                >Write</button>
                <button
                  className={`ac-tab ${activeEditorTab === "preview" ? "active" : ""}`}
                  onClick={() => setActiveEditorTab("preview")}
                >Live Preview</button>
              </div>
              <div className="ac-editor-meta">
                <span>⚡ {wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>Approx {readTime} min read</span>
              </div>
            </div>

            {/* Markdown Toolbar */}
            {activeEditorTab === "write" && (
              <div className="ac-toolbar">
                {toolbar.map((btn, i) => (
                  <button
                    key={i}
                    className="ac-toolbar-btn"
                    onClick={btn.action}
                    title={btn.tip}
                  >
                    {btn.icon || <span style={{ fontSize: "11px", fontWeight: 700 }}>{btn.label}</span>}
                  </button>
                ))}
                <div className="ac-toolbar-divider" />
                <button className="ac-toolbar-btn ac-callout-btn" onClick={insertCallout} title="Insert Callout Box">
                  ✦ Callout Box
                </button>
              </div>
            )}

            {/* Write Area */}
            {activeEditorTab === "write" ? (
              <textarea
                ref={textareaRef}
                className="ac-content-editor"
                rows={18}
                placeholder={"## 01. The Proximity Paradox: Stop Guessing RIR\n\nMost intermediate trainees dramatically underestimate their true mechanical failure thresholds...\n\n> 📌 **Coach Protocol Checkpoint**\n> Prioritise 12-18 hard working sets per muscle group..."}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
              />
            ) : (
              <div
                className="ac-preview-pane"
                dangerouslySetInnerHTML={{ __html: renderPreview(form.content) || "<p style='color:#4a5568'>Wax lama qorin weli...</p>" }}
              />
            )}
          </div>

          {/* Telemetry Visualization Preview */}
          <div className="ac-field-card ac-telemetry-card">
            <div className="ac-field-header">
              <label className="ac-label">EMBEDDED TELEMETRY VISUALIZATION PREVIEW</label>
              <span className="ac-telemetry-badge">✓ Validated Formula</span>
            </div>
            <div className="ac-tel-bars">
              <TelemetryBar label="Content Depth" value={contentScore} color="#00d9ff" />
              <TelemetryBar label="Title Quality" value={titleScore} color="#00ffa6" />
              <TelemetryBar label="Excerpt Score" value={excerptScore} color="#b48aff" />
            </div>
            {/* Phase Timeline */}
            <div className="ac-phase-timeline">
              {["1–4 Wk", "5–8 Wk", "Peak", "Deload"].map((phase, i) => (
                <div key={phase} className={`ac-phase-pill ${i === 2 ? "ac-phase-active" : ""}`}>
                  {phase}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Article Deployments */}
          <div className="ac-field-card">
            <div className="ac-field-header">
              <label className="ac-label">RECENT ARTICLE DEPLOYMENTS</label>
              <span className="ac-label-link">ARCHIVE LOG</span>
            </div>
            <div className="ac-recent-table-wrap">
              <table className="ac-recent-table">
                <thead>
                  <tr>
                    <th>ARTICLE SLUG</th>
                    <th>PRIMARY CATEGORY</th>
                    <th>AUTHOR</th>
                    <th>READERSHIP</th>
                    <th>DEPLOYMENT STATE</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRecent ? (
                    <tr><td colSpan={5} className="ac-table-empty">Loading recent deployments...</td></tr>
                  ) : recentArticles.length === 0 ? (
                    <tr><td colSpan={5} className="ac-table-empty">No articles yet.</td></tr>
                  ) : (
                    recentArticles.map((art) => (
                      <tr key={art.id}>
                        <td className="ac-slug-cell">{art.slug}</td>
                        <td className="ac-cat-cell">{art.categories?.[0] || "General"}</td>
                        <td>{art.author || "Coach Naasir"}</td>
                        <td className="ac-reads-cell">{(art.views || 0).toLocaleString()} views</td>
                        <td>
                          <span className={`ac-state-badge ${art.status === "published" ? "live" : art.status === "draft" ? "draft" : "sched"}`}>
                            {art.status === "published" ? "Live" : art.status === "draft" ? "Draft" : "Scheduled"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Autosave Footer */}
          <div className="ac-autosave-bar">
            <span className="ac-dot-green" />
            Autosave active &nbsp;·&nbsp; Last autosaved at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            &nbsp;·&nbsp; Sync latency: 28ms
            <div className="ac-footer-actions">
              <button className="ac-btn-ghost ac-sm" onClick={handleSaveDraft} disabled={saving}>SAVE DRAFT</button>
              <button className="ac-btn-primary ac-sm" onClick={handlePublish} disabled={saving}>
                {saving ? "..." : "PUBLISH NOW"}
              </button>
            </div>
          </div>
        </div>

        {/* ────── RIGHT SIDEBAR ────── */}
        <aside className="ac-sidebar">
          {/* Publishing Status */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-header">
              <span className="ac-sc-title">Publishing Status</span>
              <span className="ac-config-badge">CONFIG</span>
            </div>
            <div className="ac-live-state-row">
              <div>
                <div className="ac-sc-sub">Live State</div>
                <div className="ac-sc-muted">
                  {form.status === "published" ? "Currently live" : "Currently saved as draft"}
                </div>
              </div>
              <button
                className="ac-toggle-btn"
                onClick={() => set("status", form.status === "published" ? "draft" : "published")}
                title="Toggle publish state"
              >
                {form.status === "published"
                  ? <FaToggleOn size={28} color="#00ffa6" />
                  : <FaToggleOff size={28} color="#4a5568" />}
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-sub">VISIBILITY</div>
            <select
              className="ac-select"
              value="public"
              onChange={() => {}}
            >
              <option value="public">Public (No account required)</option>
              <option value="private">Private (Admin only)</option>
            </select>
          </div>

          {/* Publish Timing */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-sub">PUBLISH TIMING</div>
            <div className="ac-radio-group">
              {["immediate", "schedule"].map((opt) => (
                <label key={opt} className="ac-radio-label">
                  <input
                    type="radio"
                    name="publish_timing"
                    value={opt}
                    checked={form.publish_timing === opt}
                    onChange={() => set("publish_timing", opt)}
                  />
                  <span>{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Classification */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-sub">CATEGORY CLASSIFICATION</div>
            <div className="ac-cat-grid">
              {CATEGORIES.map((cat) => (
                <label key={cat} className={`ac-cat-checkbox ${form.categories.includes(cat) ? "checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    style={{ display: "none" }}
                  />
                  {form.categories.includes(cat) && <span className="ac-check-dot" />}
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Cover Visual */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-header">
              <span className="ac-sc-sub">COVER VISUAL</span>
              <span className="ac-sc-muted">1200 × 630px</span>
            </div>
            {form.featured_image && !imagePreviewError ? (
              <div className="ac-cover-wrap">
                <img
                  src={form.featured_image}
                  alt="Cover"
                  className="ac-cover-img"
                  onError={() => setImagePreviewError(true)}
                />
                <div className="ac-cover-meta">
                  <span className="ac-cover-filename">{form.featured_image.split("/").pop()}</span>
                  <button className="ac-cover-change" onClick={() => { set("featured_image", ""); setImagePreviewError(false); }}>
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="ac-cover-drop">
                <div className="ac-cover-drop-icon">☁</div>
                <div className="ac-cover-drop-text">Drag &amp; drop replacements here</div>
                <div className="ac-cover-drop-hint">PNG, JPG, GIF up to 5MB</div>
              </div>
            )}
            <input
              className="ac-input ac-mt-8"
              type="text"
              placeholder="/images/hero-1.jpg or https://..."
              value={form.featured_image}
              onChange={(e) => { set("featured_image", e.target.value); setImagePreviewError(false); }}
            />
          </div>

          {/* Author & Taxonomy */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-sub">AUTHOR &amp; TAXONOMY</div>
            <div className="ac-sc-sub ac-mt-8" style={{ fontSize: "10px", opacity: 0.6 }}>AUTHOR PROFILE</div>
            <div className="ac-author-row">
              <div className="ac-author-avatar">
                <img
                  src="/images/img-2.jpg"
                  alt="Coach"
                  onError={(e) => { e.target.src = "https://i.pravatar.cc/40?u=coach"; }}
                />
              </div>
              <div className="ac-author-info">
                <div className="ac-author-name">{form.author}</div>
                <div className="ac-author-role">Head of Conditioning</div>
              </div>
              <button className="ac-author-edit-btn" title="Change author"><FaEdit size={11} /></button>
            </div>

            <div className="ac-sc-sub ac-mt-16" style={{ fontSize: "10px", opacity: 0.6 }}>TAGS &amp; TAXONOMY</div>
            <div className="ac-tags-wrap">
              {form.tags.map((t) => (
                <TagPill key={t} label={t} onRemove={() => removeTag(t)} />
              ))}
              <div className="ac-tag-input-row">
                <input
                  className="ac-tag-input"
                  type="text"
                  placeholder="+ Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                />
                <button className="ac-tag-add-btn" onClick={addTag} title="Add tag">
                  <FaPlus size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Subscriber Dispatch */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-sub">SUBSCRIBER DISPATCH</div>
            <label className="ac-broadcast-row">
              <input
                type="checkbox"
                checked={broadcastEnabled}
                onChange={(e) => setBroadcastEnabled(e.target.checked)}
                className="ac-checkbox"
              />
              <div>
                <div className="ac-broadcast-label">Broadcast Notification</div>
                <div className="ac-broadcast-hint">Send instant notification email to newsletter subscriber fans upon publishing</div>
              </div>
            </label>
          </div>

          {/* Slug field */}
          <div className="ac-sidebar-card">
            <div className="ac-sc-sub">URL SLUG</div>
            <div className="ac-slug-display">
              /blog/<input
                className="ac-slug-input"
                type="text"
                value={form.slug}
                placeholder="auto-generated"
                onChange={(e) => set("slug", e.target.value)}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticleComposer;
