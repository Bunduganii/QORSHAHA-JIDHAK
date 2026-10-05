from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, scoped_session
from .config import Config
from .models import Base, Plan, AdminUser, Article, EmailSubscription
import hashlib
from datetime import datetime, timezone

engine = create_engine(
    Config.DATABASE_URL,
    echo=False,
    pool_pre_ping=True
)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def seed_defaults(db):
    # 1. Seed default fitness plans if empty
    existing_plans_count = db.query(Plan).count()
    if existing_plans_count == 0:
        default_plans = [
            Plan(
                id="plan-standard",
                name="Standard Plan",
                tier="Standard",
                price=10.00,
                price_cash=100000.00,
                currency="USD",
                duration="1 Bishii",
                description="Qorshe aasaasi ah oo kugu hagaya dhismaha jidhka iyo jimicsiga saxda ah.",
                features=[
                    "Qorshe Jimicsi oo Gaar ah",
                    "Talooyin Cunto oo Aasaasi ah",
                    "Hagid 24/7 ah oo WhatsApp ah"
                ],
                popular=False
            ),
            Plan(
                id="plan-premium",
                name="Premium Elite",
                tier="VIP Elite",
                price=20.00,
                price_cash=200000.00,
                currency="USD",
                duration="1 Bishii",
                description="Qorshe dhameystiran oo ay ku jiraan tababar joogto ah, cunto la qorsheeyey iyo dabagal maalinle ah.",
                features=[
                    "Qorshe Jimicsi & Cunto Khaas ah",
                    "Xisaabinta Kalooriyada & Makros-ka",
                    "Wadahadal toos ah Coach Naasir",
                    "Dabagal Todobaadle ah & Isbedel Joogto ah"
                ],
                popular=True
            ),
            Plan(
                id="plan-vip-transformation",
                name="VIP Transformation",
                tier="VIP 3-Months",
                price=50.00,
                price_cash=500000.00,
                currency="USD",
                duration="3 Bilood",
                description="Isbedel buuxa oo 90 maalmood ah oo leh daryeel joogto ah iyo tababar heer caalami ah.",
                features=[
                    "90-Maalmood Protocol Buuxa",
                    "Customized Workout & Diet Plan",
                    "VIP Call & Coaching 1-on-1",
                    "Dammaanad qaad Natiijo"
                ],
                popular=False
            )
        ]
        for p in default_plans:
            db.add(p)
        db.commit()
        print("[DATABASE] Default fitness plans seeded successfully.")

    # 2. Seed default Admin User if not exists
    admin = db.query(AdminUser).filter_by(email="qorshahjidhka@gmail.com").first()
    if not admin:
        default_admin = AdminUser(
            id="admin-primary",
            email="qorshahjidhka@gmail.com",
            password_hash=hash_password("admin12345"),
            full_name="Coach Naasir",
            role="admin"
        )
        db.add(default_admin)
        db.commit()
        print("[DATABASE] Default admin user created (qorshahjidhka@gmail.com).")

    # 3. Seed initial published fitness articles if empty
    articles_count = db.query(Article).count()
    if articles_count == 0:
        sample_articles = [
            Article(
                id="art-cunto-jimicsi-2026",
                title="Sida Loo Qorsheeyo Cunto Caafimaad Leh Oo Jidhka Dhisaysa",
                slug="sida-loo-qorsheeyo-cunto-caafimaad-leh",
                excerpt="Baro sida loo kala saaro Protein-ka, Carbs-ka, iyo Fats-ka si aad u hesho natiijo degdeg ah oo joogto ah.",
                content="""Dhismaha jidhku wuxuu 70% ku xidhan yahay cuntada aad cunto maalin kasta. Hadii aad jimicsi adag samayso adigoon cuntada hagaajin, natiijadaadu waxay noqonaysaa mid aad u gaabis ah.

### 1. Muhiimada Protein-ka
Protein-ku waa dhisaha ugu weyn ee murqaha. Isku day inaad hesho ugu yaraan 1.6g ilaa 2.2g oo protein ah halkii kiiloogaraam oo miisaankaaga ah. Cuntooyinka qaniga ku ah protein-ka waxaa ka mid ah:
- Hilibka digaagga iyo xoolaha
- Ukunta (gaar ahaan jaallaha iyo cadaanka)
- Kalluunka
- Digirta iyo digir-caddaanka

### 2. Carbohydrates iyo Tamar
Ha ka cabsan carbohydrates-ka! Jirkaagu wuxuu u baahan yahay tamar uu ku jimicsado. Dooro complex carbs sida bariiska buniga ah, boorashka (oats), iyo baradhada macaan.

### 3. Biyo Badan Cab
Biyuhu waxay caawiyaan dheef-shiidka iyo soo kabashada murqaha. Cab ugu yaraan 3 ilaa 4 litir oo biyo ah maalin kasta.""",
                featured_image="/images/hero-1.jpg",
                status="published",
                published_at=datetime.now(timezone.utc)
            ),
            Article(
                id="art-dhismaha-murqaha-degdeg",
                title="5 Khalad Oo Ka Hortaga In Murqahaagu Koraan",
                slug="5-khalad-oo-ka-hortaga-dhismaha-murqaha",
                excerpt="Ogow khaladaadka ugu badan ee dadku galaan marka ay gym-ka galaan iyo sida looga fogaado.",
                content="""Marka dad badani bilaabaan jimicsiga, waxay filayaan natiijooyin degdeg ah, laakiin khaladaad yaryar ayaa ka joojin kara guusha.

### Khaladka 1: Hurdo La'aan iyo Nasasho La'aan
Murquhu ma koraan markaad gym-ka ku jirto — waxay koraan markaad huruddo oo aad nasanayso. U hurud 7-8 saacadood habeen kasta.

### Khaladka 2: Miisaan Culus oo Foom Xun (Ego Lifting)
Jimicsi ku samee qaab sax ah (proper form) intii aad qaadi lahayd culeys aadan xakameyn karin oo dhaawac kugu keeni kara.

### Khaladka 3: Joogteyn La'aan (Inconsistency)
Jimicsiga ugu fiican waa midka aad joogtaysid. 3-4 maalmood oo toddobaad kasta ah ayaa ku filan haddii aad si joogto ah u waddo.""",
                featured_image="/images/hero-3.jpg",
                status="published",
                published_at=datetime.now(timezone.utc)
            )
        ]
        for a in sample_articles:
            db.add(a)
        db.commit()
        print("[DATABASE] Sample blog articles seeded successfully.")

def run_migrations(db):
    # Ensure missing columns in existing SQLite or Postgres tables are safely added
    migrations = [
        "ALTER TABLE questionnaires ADD COLUMN email VARCHAR(255);",
        "ALTER TABLE payments ADD COLUMN customer_email VARCHAR(255);",
        "ALTER TABLE plans ADD COLUMN active BOOLEAN DEFAULT 1;"
    ]
    for sql in migrations:
        try:
            db.execute(text(sql))
            db.commit()
        except Exception:
            db.rollback()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_migrations(db)
        seed_defaults(db)
    finally:
        db.close()
