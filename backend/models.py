import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    tier = Column(String(100), default="Standard")
    price = Column(Numeric(10, 2), nullable=True, default=0.0)
    price_cash = Column(Numeric(15, 2), nullable=True)
    currency = Column(String(10), default="USD")
    duration = Column(String(100), default="1 Bishii")
    description = Column(Text, nullable=True)
    features = Column(JSON, default=list)
    popular = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    payments = relationship("Payment", back_populates="plan")
    coaching_records = relationship("CoachingAccess", back_populates="plan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "tier": self.tier,
            "price": float(self.price) if self.price is not None else 0.0,
            "price_cash": float(self.price_cash) if self.price_cash is not None else None,
            "currency": self.currency,
            "duration": self.duration,
            "description": self.description,
            "features": self.features or [],
            "popular": self.popular,
            "active": self.active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Questionnaire(Base):
    __tablename__ = "questionnaires"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    client_id = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    whatsapp = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    gender = Column(String(20), nullable=True)
    goal = Column(String(100), nullable=True)
    weight = Column(Numeric(10, 2), nullable=True)
    unit = Column(String(10), default="kg")
    height = Column(Numeric(10, 2), nullable=True)
    height_unit = Column(String(10), default="cm")
    challenge = Column(Text, nullable=True)
    birth_date = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    payments = relationship("Payment", back_populates="questionnaire")
    coaching_records = relationship("CoachingAccess", back_populates="questionnaire")

    def to_dict(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "name": self.name,
            "whatsapp": self.whatsapp,
            "email": self.email,
            "gender": self.gender,
            "goal": self.goal,
            "weight": float(self.weight) if self.weight is not None else None,
            "unit": self.unit,
            "height": float(self.height) if self.height is not None else None,
            "height_unit": self.height_unit,
            "challenge": self.challenge,
            "birth_date": self.birth_date,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    order_id = Column(String(64), unique=True, nullable=False, index=True)
    questionnaire_id = Column(String(64), ForeignKey("questionnaires.id"), nullable=True)
    plan_id = Column(String(64), ForeignKey("plans.id"), nullable=True)
    customer_name = Column(String(255), nullable=False, index=True)
    whatsapp_phone = Column(String(50), nullable=False, index=True)
    payment_phone = Column(String(50), nullable=True, index=True)
    customer_email = Column(String(255), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="USD")
    payment_method = Column(String(50), nullable=False)
    provider = Column(String(50), default="SIFALO")
    provider_transaction_id = Column(String(128), nullable=True, index=True)
    provider_reference = Column(String(128), nullable=True)
    payment_status = Column(String(30), default="PENDING", nullable=False, index=True)
    sender_name = Column(String(255), nullable=True)
    card_brand = Column(String(50), nullable=True)
    card_last4 = Column(String(10), nullable=True)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime(timezone=True), nullable=True)

    questionnaire = relationship("Questionnaire", back_populates="payments")
    plan = relationship("Plan", back_populates="payments")
    coaching_access = relationship(
        "CoachingAccess",
        back_populates="payment",
        foreign_keys="CoachingAccess.payment_id",
        uselist=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "questionnaire_id": self.questionnaire_id,
            "plan_id": self.plan_id,
            "customer_name": self.customer_name,
            "whatsapp_phone": self.whatsapp_phone,
            "payment_phone": self.payment_phone,
            "customer_email": self.customer_email,
            "amount": float(self.amount) if self.amount is not None else 0.0,
            "currency": self.currency,
            "payment_method": self.payment_method,
            "provider": self.provider,
            "provider_transaction_id": self.provider_transaction_id,
            "provider_reference": self.provider_reference,
            "payment_status": self.payment_status,
            "sender_name": self.sender_name,
            "card_brand": self.card_brand,
            "card_last4": self.card_last4,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "plan_name": self.plan.name if self.plan else None,
            "access_code": self.coaching_access.access_code if self.coaching_access else None
        }

class CoachingAccess(Base):
    __tablename__ = "coaching_access"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    access_code = Column(String(32), unique=True, nullable=False, index=True)
    order_id = Column(String(64), nullable=False, index=True)
    payment_id = Column(String(64), ForeignKey("payments.id"), nullable=False)
    questionnaire_id = Column(String(64), ForeignKey("questionnaires.id"), nullable=True)
    plan_id = Column(String(64), ForeignKey("plans.id"), nullable=True)
    status = Column(String(30), default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    payment = relationship("Payment", back_populates="coaching_access", foreign_keys=[payment_id])
    questionnaire = relationship("Questionnaire", back_populates="coaching_records")
    plan = relationship("Plan", back_populates="coaching_records")

    def to_dict(self):
        return {
            "id": self.id,
            "access_code": self.access_code,
            "order_id": self.order_id,
            "payment_id": self.payment_id,
            "questionnaire_id": self.questionnaire_id,
            "plan_id": self.plan_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "customer_name": self.payment.customer_name if self.payment else (self.questionnaire.name if self.questionnaire else None),
            "whatsapp_phone": self.payment.whatsapp_phone if self.payment else (self.questionnaire.whatsapp if self.questionnaire else None),
            "payment_phone": self.payment.payment_phone if self.payment else None,
            "plan_name": self.plan.name if self.plan else None,
            "payment_status": self.payment.payment_status if self.payment else None,
            "payment_method": self.payment.payment_method if self.payment else None,
            "paid_at": self.payment.paid_at.isoformat() if (self.payment and self.payment.paid_at) else None,
            "questionnaire": self.questionnaire.to_dict() if self.questionnaire else None
        }

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    featured_image = Column(String(512), nullable=True)
    status = Column(String(30), default="draft", nullable=False, index=True)  # 'draft' or 'published'
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "content": self.content,
            "featured_image": self.featured_image,
            "status": self.status,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class EmailSubscription(Base):
    __tablename__ = "email_subscriptions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(String(30), default="subscribed", nullable=False)  # 'subscribed' or 'unsubscribed'
    subscribed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    unsubscribed_at = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "status": self.status,
            "subscribed_at": self.subscribed_at.isoformat() if self.subscribed_at else None,
            "unsubscribed_at": self.unsubscribed_at.isoformat() if self.unsubscribed_at else None
        }

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Coach Naasir")
    role = Column(String(50), default="admin")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
