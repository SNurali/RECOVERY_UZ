-- ============================================================
-- RECOVERY.UZ — Unified database schema
-- One source of truth for local AND production
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------- USERS -----------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login            VARCHAR(255) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(50)  NOT NULL CHECK (role IN ('admin','operator','master','client')),
    full_name        VARCHAR(255) NOT NULL,
    phone            VARCHAR(50),
    email            VARCHAR(255),
    telegram         VARCHAR(255),
    telegram_chat_id VARCHAR(64),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ----------------------- CATALOGS -----------------------
CREATE TABLE IF NOT EXISTS equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_rus VARCHAR(255) NOT NULL,
    name_cyr VARCHAR(255) NOT NULL,
    name_lat VARCHAR(255) NOT NULL,
    name_eng VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_rus VARCHAR(255) NOT NULL,
    name_cyr VARCHAR(255) NOT NULL,
    name_lat VARCHAR(255) NOT NULL,
    name_eng VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_rus VARCHAR(255) NOT NULL,
    name_cyr VARCHAR(255) NOT NULL,
    name_lat VARCHAR(255) NOT NULL,
    name_eng VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------- ORDERS -----------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_name             VARCHAR(255),
    guest_phone            VARCHAR(50),
    status                 VARCHAR(50) NOT NULL DEFAULT 'new',
    price_approved_at      TIMESTAMPTZ,
    price_rejected_at      TIMESTAMPTZ,
    rejection_reason       TEXT,
    total_price_uzs        NUMERIC(14,2) DEFAULT 0,
    total_paid_uzs         NUMERIC(14,2) DEFAULT 0,
    public_tracking_token  VARCHAR(64) UNIQUE DEFAULT encode(gen_random_bytes(8),'hex'),
    closed_at              TIMESTAMPTZ,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_token     ON orders(public_tracking_token);

-- ----------------------- ORDER DETAILS -----------------------
CREATE TABLE IF NOT EXISTS order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
    serial_number VARCHAR(255),
    equipment_id UUID REFERENCES equipments(id) ON DELETE SET NULL,
    issue_id     UUID REFERENCES issues(id)     ON DELETE SET NULL,
    service_id   UUID REFERENCES services(id)   ON DELETE SET NULL,
    notes        TEXT,
    price_uzs    NUMERIC(14,2) DEFAULT 0,
    attached_to  UUID REFERENCES users(id)      ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_details_order_id   ON order_details(order_id);
CREATE INDEX IF NOT EXISTS idx_order_details_attached   ON order_details(attached_to);

-- ----------------------- AUTO-UPDATE updated_at -----------------------
CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at  ON users;
CREATE TRIGGER users_updated_at  BEFORE UPDATE ON users  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
