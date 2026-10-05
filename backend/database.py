from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, scoped_session
from .config import Config
from .models import Base, Plan, AdminUser, Article, EmailSubscription, NotificationLog
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

    # 3. Seed initial Stitch published fitness articles if empty
    articles_count = db.query(Article).count()
    if articles_count == 0:
        sample_articles = [
            Article(
                id="art-hypertrophy-principles",
                title="The 5 Fundamental Hypertrophy Principles Most Lifters Ignore",
                slug="5-hypertrophy-principles-most-lifters-ignore",
                excerpt="A rigorous breakdown of progressive tension overload, systematic proximity to failure (RIR), volume tiering, and recovery mechanics required for elite muscle adaptation.",
                content="""Most intermediate trainees dramatically underestimate their true mechanical failure thresholds. When prescribed 2 Reps in Reserve (RIR), video analysis consistently confirms trainees are stopping 4 to 6 reps shy of true failure. Without targeted mechanical tension in the final voluntary contractions, high-threshold motor unit recruitment is negligible.

> "Hypertrophy isn't rewarded for effort spent in warm-up territory; it demands precision at the outer edge of structural fatigue."

### Key Physiological Rules:
* Calibrate your 0-2 RIR gauge using occasional AMRAP sets on safe, guided movements.
* Log rest periods as rigorously as load; metabolic clearance determines subsequent set motor unit recruitment.
* Prioritize lengthen-biased exercises to maximize mechanical stretch under active load.

### Coach Protocol Checkpoint
Prioritize 12-18 hard weekly working sets per muscle group across two distinct weekly exposures rather than catastrophic single-session volume dumping.

### Principle 01: Lengthened Overload vs Contractile Velocity
Mechanical tension generated at long muscle lengths elicits significantly higher hypertrophic signalling through titin kinase activation and focal adhesion kinase cascades compared to peak contraction squeezes.

### Principle 02: Systematic Proximity to Failure (RIR Calibration)
Stimulating reps occur primarily in the final 4-5 repetitions of a set taken within 0-2 RIR. Moving sets beyond this envelope without adequate recovery baseline generates disproportionate central nervous system fatigue.""",
                featured_image="/images/hero-1.jpg",
                category="Fitness",
                categories=["Fitness", "Workouts"],
                tags=["Hypertrophy", "Muscle Growth", "RIR", "Programming"],
                author="Coach Naasir",
                views=48210,
                status="published",
                published_at=datetime.now(timezone.utc)
            ),
            Article(
                id="art-zone-2-endurance",
                title="Zone 2 Endurance Protocols for Lifters",
                slug="zone-2-endurance-for-lifters",
                excerpt="How low-intensity mitochondrial conditioning enhances intra-set ATP recovery without blunting hypertrophic mTOR pathways.",
                content="""Low-intensity steady-state cardiovascular conditioning stimulates mitochondrial biogenesis in type I fibers and enhances systemic lactate clearance kinetics, directly improving recovery between high-intensity lifting sets.

### Mitochondria & Hypertrophy
Aerobic capacity determines how quickly phosphocreatine resynthesizes between heavy working sets. Trainees with poor aerobic baselines compromise total volume output.""",
                featured_image="/images/hero-3.jpg",
                category="Workouts",
                categories=["Workouts", "Fitness"],
                tags=["Cardio", "Zone 2", "Conditioning"],
                author="Coach Naasir",
                views=3892,
                status="published",
                published_at=datetime.now(timezone.utc)
            ),
            Article(
                id="art-protein-synthesis-threshold",
                title="Protein Synthesis Threshold & Leucine Trigger Guide",
                slug="protein-synthesis-threshold-guide",
                excerpt="Demystifying optimal daily protein distribution, essential amino acid thresholds, and peri-workout nutrient timing.",
                content="""Muscle protein synthesis (MPS) requires a minimum intracellular leucine concentration to trigger the mTORC1 signaling pathway.

### The Leucine Trigger
Consuming 3g of leucine per meal ensures complete saturation of the MPS cascade. Space your protein intakes across 4-5 meals throughout the day for optimal 24-hour nitrogen balance.""",
                featured_image="/images/img-3.jpg",
                category="Nutrition",
                categories=["Nutrition"],
                tags=["Protein", "Nutrition", "Diet"],
                author="Elena Vance",
                views=5140,
                status="published",
                published_at=datetime.now(timezone.utc)
            ),
            Article(
                id="art-intra-workout-carbs",
                title="Intra-Workout Carbohydrate Ratios for Elite Output",
                slug="intra-workout-carbohydrate-ratios",
                excerpt="Cluster dextrin vs maltodextrin protocols for maintaining blood glucose and delaying central fatigue during 90+ minute lifting sessions.",
                content="""Sustained high-volume resistance training depletes muscular glycogen. Targeted intra-workout carbohydrate ingestion prevents cortisol spikes and maintains maximal force output.""",
                featured_image="/images/img-4.jpg",
                category="Workouts",
                categories=["Workouts", "Nutrition"],
                tags=["Carbs", "Fuel", "Intra-Workout"],
                author="Coach Naasir",
                views=1420,
                status="draft",
                published_at=None
            )
        ]
        for a in sample_articles:
            db.add(a)
        db.commit()
        print("[DATABASE] Sample Stitch blog articles seeded successfully.")

def run_migrations(db):
    # Ensure missing columns in existing SQLite or Postgres tables are safely added
    migrations = [
        "ALTER TABLE questionnaires ADD COLUMN email VARCHAR(255);",
        "ALTER TABLE payments ADD COLUMN customer_email VARCHAR(255);",
        "ALTER TABLE plans ADD COLUMN active BOOLEAN DEFAULT 1;",
        "ALTER TABLE articles ADD COLUMN category VARCHAR(100) DEFAULT 'Fitness';",
        "ALTER TABLE articles ADD COLUMN categories JSON;",
        "ALTER TABLE articles ADD COLUMN tags JSON;",
        "ALTER TABLE articles ADD COLUMN author VARCHAR(100) DEFAULT 'Coach Naasir';",
        "ALTER TABLE articles ADD COLUMN views NUMERIC(10, 0) DEFAULT 0;"
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

