import re
import uuid
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from ..database import SessionLocal
from ..models import Article, EmailSubscription
from ..services.email_service import EmailService

articles_bp = Blueprint("articles", __name__, url_prefix="/api/articles")

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or str(uuid.uuid4())[:8]

@articles_bp.route("", methods=["GET"])
def get_articles():
    status = request.args.get("status")
    search = request.args.get("q", "").strip().lower()

    db = SessionLocal()
    try:
        query = db.query(Article)
        
        # If public request without status=all, only show published articles
        if status != "all":
            query = query.filter(Article.status == "published")
        
        if search:
            query = query.filter(
                (Article.title.ilike(f"%{search}%")) |
                (Article.excerpt.ilike(f"%{search}%"))
            )

        articles = query.order_by(Article.created_at.desc()).all()
        return jsonify([a.to_dict() for a in articles]), 200
    finally:
        db.close()

@articles_bp.route("/<slug_or_id>", methods=["GET"])
def get_article(slug_or_id):
    db = SessionLocal()
    try:
        article = db.query(Article).filter(
            (Article.slug == slug_or_id) | (Article.id == slug_or_id)
        ).first()

        if not article:
            return jsonify({"error": "Article not found"}), 404

        return jsonify(article.to_dict()), 200
    finally:
        db.close()

@articles_bp.route("", methods=["POST"])
def create_article():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "Article content is required"}), 400

    excerpt = (data.get("excerpt") or "").strip()
    if not excerpt:
        # Generate short excerpt from content
        plain_text = re.sub(r"[#*`_]", "", content)
        excerpt = (plain_text[:160] + "...") if len(plain_text) > 160 else plain_text

    slug = (data.get("slug") or "").strip()
    if not slug:
        slug = slugify(title)
    else:
        slug = slugify(slug)

    status = (data.get("status") or "draft").lower()
    if status not in ["draft", "published"]:
        status = "draft"

    featured_image = data.get("featured_image") or "/images/hero-1.jpg"

    db = SessionLocal()
    try:
        # Ensure slug uniqueness
        existing = db.query(Article).filter_by(slug=slug).first()
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:4]}"

        now = datetime.now(timezone.utc)
        article = Article(
            id=f"art-{uuid.uuid4().hex[:8]}",
            title=title,
            slug=slug,
            excerpt=excerpt,
            content=content,
            featured_image=featured_image,
            status=status,
            published_at=now if status == "published" else None
        )
        db.add(article)
        db.commit()
        db.refresh(article)

        # If published immediately, notify active subscribers
        notification_res = None
        if status == "published":
            subscribers = db.query(EmailSubscription).filter_by(status="subscribed").all()
            if subscribers:
                sub_list = [s.to_dict() for s in subscribers]
                notification_res = EmailService.notify_subscribers_about_article(sub_list, article.to_dict())

        res_data = article.to_dict()
        if notification_res:
            res_data["notification_result"] = notification_res

        return jsonify(res_data), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@articles_bp.route("/<article_id>", methods=["PUT"])
def update_article(article_id):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        article = db.query(Article).filter_by(id=article_id).first()
        if not article:
            return jsonify({"error": "Article not found"}), 404

        was_draft = (article.status == "draft")

        if "title" in data and data["title"].strip():
            article.title = data["title"].strip()
        if "slug" in data and data["slug"].strip():
            new_slug = slugify(data["slug"])
            # Check duplicate
            other = db.query(Article).filter(Article.slug == new_slug, Article.id != article.id).first()
            if not other:
                article.slug = new_slug
        if "excerpt" in data:
            article.excerpt = data["excerpt"].strip()
        if "content" in data and data["content"].strip():
            article.content = data["content"].strip()
        if "featured_image" in data:
            article.featured_image = data["featured_image"]
        if "status" in data:
            new_status = data["status"].lower()
            if new_status in ["draft", "published"]:
                article.status = new_status
                if new_status == "published" and not article.published_at:
                    article.published_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(article)

        # Notify subscribers if transitioned from draft to published
        notification_res = None
        if was_draft and article.status == "published":
            subscribers = db.query(EmailSubscription).filter_by(status="subscribed").all()
            if subscribers:
                sub_list = [s.to_dict() for s in subscribers]
                notification_res = EmailService.notify_subscribers_about_article(sub_list, article.to_dict())

        res_data = article.to_dict()
        if notification_res:
            res_data["notification_result"] = notification_res

        return jsonify(res_data), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@articles_bp.route("/<article_id>", methods=["DELETE"])
def delete_article(article_id):
    db = SessionLocal()
    try:
        article = db.query(Article).filter_by(id=article_id).first()
        if not article:
            return jsonify({"error": "Article not found"}), 404

        db.delete(article)
        db.commit()
        return jsonify({"success": True, "message": "Article deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
