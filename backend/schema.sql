-- ============================================================
-- QORSHAHA JIDHKA — COMPLETE POSTGRESQL / PGADMIN 4 DDL SCHEMA
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plans (
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

CREATE TABLE IF NOT EXISTS questionnaires (
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

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) UNIQUE NOT NULL,
    questionnaire_id VARCHAR(64) REFERENCES questionnaires(id) ON DELETE SET NULL,
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS coaching_access (
    id VARCHAR(64) PRIMARY KEY,
    access_code VARCHAR(32) UNIQUE NOT NULL,
    order_id VARCHAR(64) REFERENCES payments(order_id) ON DELETE CASCADE,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    questionnaire_id VARCHAR(64) REFERENCES questionnaires(id) ON DELETE SET NULL,
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(512),
    status VARCHAR(30) DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'subscribed' NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) DEFAULT 'Coach Naasir',
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
