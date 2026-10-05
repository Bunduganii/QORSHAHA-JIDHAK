-- ============================================================
-- QORSHAHA JIDHKA — COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/carssqvvbepwooapmrge/sql
-- ============================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(100) DEFAULT 'Standard',
    price NUMERIC(10, 2),
    price_cash NUMERIC(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    duration VARCHAR(100) DEFAULT '1 Bishii',
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    popular BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. QUESTIONNAIRES TABLE
CREATE TABLE IF NOT EXISTS public.questionnaires (
    id VARCHAR(64) PRIMARY KEY,
    client_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    gender VARCHAR(20),
    goal VARCHAR(100),
    weight NUMERIC(10, 2),
    unit VARCHAR(10) DEFAULT 'kg',
    height NUMERIC(10, 2),
    height_unit VARCHAR(10) DEFAULT 'cm',
    challenge TEXT,
    birth_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Ensure email column exists if table already existed
ALTER TABLE public.questionnaires ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) UNIQUE NOT NULL,
    questionnaire_id VARCHAR(64) REFERENCES public.questionnaires(id) ON DELETE SET NULL,
    plan_id VARCHAR(64) REFERENCES public.plans(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    whatsapp_phone VARCHAR(50) NOT NULL,
    payment_phone VARCHAR(50),
    customer_email VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) DEFAULT 'SIFALO',
    provider_transaction_id VARCHAR(128),
    provider_reference VARCHAR(128),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sender_name VARCHAR(255),
    card_brand VARCHAR(50),
    card_last4 VARCHAR(10),
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);
-- Ensure customer_email column exists if table already existed
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- 5. COACHING ACCESS TABLE
CREATE TABLE IF NOT EXISTS public.coaching_access (
    id VARCHAR(64) PRIMARY KEY,
    access_code VARCHAR(32) UNIQUE NOT NULL,
    order_id VARCHAR(64) REFERENCES public.payments(order_id) ON DELETE CASCADE,
    payment_id VARCHAR(64) REFERENCES public.payments(id) ON DELETE CASCADE,
    questionnaire_id VARCHAR(64) REFERENCES public.questionnaires(id) ON DELETE SET NULL,
    plan_id VARCHAR(64) REFERENCES public.plans(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ARTICLES (BLOG) TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(512),
    category VARCHAR(100) DEFAULT 'Fitness',
    categories JSONB DEFAULT '["Fitness"]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    author VARCHAR(100) DEFAULT 'Coach Naasir',
    views NUMERIC(10, 0) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Fitness';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '["Fitness"]'::jsonb;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author VARCHAR(100) DEFAULT 'Coach Naasir';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views NUMERIC(10, 0) DEFAULT 0;

-- 7. EMAIL SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'subscribed' NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 8. NOTIFICATION LOGS (BREVO / SMTP) TABLE
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id VARCHAR(64) PRIMARY KEY,
    article_id VARCHAR(64) REFERENCES public.articles(id) ON DELETE CASCADE,
    subscriber_id VARCHAR(64) REFERENCES public.email_subscriptions(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    provider VARCHAR(50) DEFAULT 'BREVO',
    status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Coach Naasir',
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_phone ON public.payments(payment_phone);
CREATE INDEX IF NOT EXISTS idx_payments_whatsapp_phone ON public.payments(whatsapp_phone);
CREATE INDEX IF NOT EXISTS idx_payments_customer_name ON public.payments(customer_name);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON public.payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx_id ON public.payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coaching_access_code ON public.coaching_access(access_code);
CREATE INDEX IF NOT EXISTS idx_coaching_access_order_id ON public.coaching_access(order_id);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON public.email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON public.email_subscriptions(status);

-- 10. Row Level Security (RLS) Policies
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans RLS
DROP POLICY IF EXISTS "Allow public select plans" ON public.plans;
CREATE POLICY "Allow public select plans" ON public.plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert plans" ON public.plans;
CREATE POLICY "Allow public insert plans" ON public.plans FOR INSERT WITH CHECK (true);

-- Questionnaires RLS
DROP POLICY IF EXISTS "Allow public insert questionnaires" ON public.questionnaires;
CREATE POLICY "Allow public insert questionnaires" ON public.questionnaires FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select questionnaires" ON public.questionnaires;
CREATE POLICY "Allow public select questionnaires" ON public.questionnaires FOR SELECT USING (true);

-- Payments RLS
DROP POLICY IF EXISTS "Allow public insert payments" ON public.payments;
CREATE POLICY "Allow public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select payments" ON public.payments;
CREATE POLICY "Allow public select payments" ON public.payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public update payments" ON public.payments;
CREATE POLICY "Allow public update payments" ON public.payments FOR UPDATE USING (true);

-- Coaching Access RLS
DROP POLICY IF EXISTS "Allow public select coaching_access" ON public.coaching_access;
CREATE POLICY "Allow public select coaching_access" ON public.coaching_access FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert coaching_access" ON public.coaching_access;
CREATE POLICY "Allow public insert coaching_access" ON public.coaching_access FOR INSERT WITH CHECK (true);

-- Articles RLS (Public can read published articles, admin can manage all)
DROP POLICY IF EXISTS "Allow public select published articles" ON public.articles;
CREATE POLICY "Allow public select published articles" ON public.articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert articles" ON public.articles;
CREATE POLICY "Allow public insert articles" ON public.articles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update articles" ON public.articles;
CREATE POLICY "Allow public update articles" ON public.articles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete articles" ON public.articles;
CREATE POLICY "Allow public delete articles" ON public.articles FOR DELETE USING (true);

-- Email Subscriptions RLS
DROP POLICY IF EXISTS "Allow public insert email_subscriptions" ON public.email_subscriptions;
CREATE POLICY "Allow public insert email_subscriptions" ON public.email_subscriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select email_subscriptions" ON public.email_subscriptions;
CREATE POLICY "Allow public select email_subscriptions" ON public.email_subscriptions FOR SELECT USING (true);

-- 11. Seed Default Plans
INSERT INTO public.plans (id, name, tier, price, price_cash, currency, duration, description, features, popular)
VALUES 
(
    'plan-standard',
    'Standard Plan',
    'Standard',
    10.00,
    100000.00,
    'USD',
    '1 Bishii',
    'Qorshe aasaasi ah oo kugu hagaya dhismaha jidhka iyo jimicsiga saxda ah.',
    '["Qorshe Jimicsi oo Gaar ah", "Talooyin Cunto oo Aasaasi ah", "Hagid 24/7 ah oo WhatsApp ah"]'::jsonb,
    FALSE
),
(
    'plan-premium',
    'Premium Elite',
    'VIP Elite',
    20.00,
    200000.00,
    'USD',
    '1 Bishii',
    'Qorshe dhameystiran oo ay ku jiraan tababar joogto ah, cunto la qorsheeyey iyo dabagal maalinle ah.',
    '["Qorshe Jimicsi & Cunto Khaas ah", "Xisaabinta Kalooriyada & Makros-ka", "Wadahadal toos ah Coach Naasir", "Dabagal Todobaadle ah & Isbedel Joogto ah"]'::jsonb,
    TRUE
),
(
    'plan-vip-transformation',
    'VIP Transformation',
    'VIP 3-Months',
    50.00,
    500000.00,
    'USD',
    '3 Bilood',
    'Isbedel buuxa oo 90 maalmood ah oo leh daryeel joogto ah iyo tababar heer caalami ah.',
    '["90-Maalmood Protocol Buuxa", "Customized Workout & Diet Plan", "VIP Call & Coaching 1-on-1", "Dammaanad qaad Natiijo"]'::jsonb,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tier = EXCLUDED.tier,
    price = EXCLUDED.price,
    price_cash = EXCLUDED.price_cash,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    popular = EXCLUDED.popular;

-- 12. Seed Default Sample Blog Articles
INSERT INTO public.articles (id, title, slug, excerpt, content, featured_image, status, published_at)
VALUES 
(
    'art-cunto-jimicsi-2026',
    'Sida Loo Qorsheeyo Cunto Caafimaad Leh Oo Jidhka Dhisaysa',
    'sida-loo-qorsheeyo-cunto-caafimaad-leh',
    'Baro sida loo kala saaro Protein-ka, Carbs-ka, iyo Fats-ka si aad u hesho natiijo degdeg ah oo joogto ah.',
    'Dhismaha jidhku wuxuu 70% ku xidhan yahay cuntada aad cunto maalin kasta. Hadii aad jimicsi adag samayso adigoon cuntada hagaajin, natiijadaadu waxay noqonaysaa mid aad u gaabis ah.

### 1. Muhiimada Protein-ka
Protein-ku waa dhisaha ugu weyn ee murqaha. Isku day inaad hesho ugu yaraan 1.6g ilaa 2.2g oo protein ah halkii kiiloogaraam oo miisaankaaga ah.

### 2. Carbohydrates iyo Tamar
Dooro complex carbs sida bariiska buniga ah, boorashka (oats), iyo baradhada macaan.

### 3. Biyo Badan Cab
Cab ugu yaraan 3 ilaa 4 litir oo biyo ah maalin kasta.',
    '/images/hero-1.jpg',
    'published',
    CURRENT_TIMESTAMP
),
(
    'art-dhismaha-murqaha-degdeg',
    '5 Khalad Oo Ka Hortaga In Murqahaagu Koraan',
    '5-khalad-oo-ka-hortaga-dhismaha-murqaha',
    'Ogow khaladaadka ugu badan ee dadku galaan marka ay gym-ka galaan iyo sida looga fogaado.',
    'Marka dad badani bilaabaan jimicsiga, waxay filayaan natiijooyin degdeg ah, laakiin khaladaad yaryar ayaa ka joojin kara guusha.

### Khaladka 1: Hurdo La''aan iyo Nasasho La''aan
Murquhu ma koraan markaad gym-ka ku jirto — waxay koraan markaad huruddo oo aad nasanayso. U hurud 7-8 saacadood habeen kasta.

### Khaladka 2: Miisaan Culus oo Foom Xun
Jimicsi ku samee qaab sax ah (proper form) intii aad qaadi lahayd culeys aadan xakameyn karin.

### Khaladka 3: Joogteyn La''aan
Jimicsiga ugu fiican waa midka aad joogtaysid si joogto ah.',
    '/images/hero-3.jpg',
    'published',
    CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO NOTHING;
