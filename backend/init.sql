-- Initialize database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operator', 'master', 'client')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    telegram_chat_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment types
CREATE TABLE IF NOT EXISTS equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_rus VARCHAR(255) NOT NULL,
    name_cyr VARCHAR(255) NOT NULL,
    name_lat VARCHAR(255) NOT NULL,
    name_eng VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issue types
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_rus VARCHAR(255) NOT NULL,
    name_cyr VARCHAR(255) NOT NULL,
    name_lat VARCHAR(255) NOT NULL,
    name_eng VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service types
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_rus VARCHAR(255) NOT NULL,
    name_cyr VARCHAR(255) NOT NULL,
    name_lat VARCHAR(255) NOT NULL,
    name_eng VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    price_approved_at TIMESTAMP,
    price_rejected_at TIMESTAMP,
    total_price_uzs DECIMAL(12, 2) DEFAULT 0,
    total_paid_uzs DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order details
CREATE TABLE IF NOT EXISTS order_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    serial_number VARCHAR(255),
    equipment_id UUID REFERENCES equipments(id),
    issue_id UUID REFERENCES issues(id),
    service_id UUID REFERENCES services(id),
    notes TEXT,
    price_uzs DECIMAL(12, 2) DEFAULT 0,
    master_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_details_order_id ON order_details(order_id);
CREATE INDEX idx_order_details_master_id ON order_details(master_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (login, password_hash, role, full_name, phone, email)
VALUES (
    'admin@hdd-fixer.uz',
    '$2b$10$rKZLvVZqXhqVqVqVqVqVqOqVqVqVqVqVqVqVqVqVqVqVqVqVqVqVq',
    'admin',
    'Администратор',
    '+998 90 123-45-67',
    'admin@hdd-fixer.uz'
) ON CONFLICT (login) DO NOTHING;

-- Insert sample equipment
INSERT INTO equipments (name_rus, name_cyr, name_lat, name_eng) VALUES
    ('Жесткий диск HDD 3.5"', 'Қаттиқ диск HDD 3.5"', 'Qattiq disk HDD 3.5"', 'Hard Drive HDD 3.5"'),
    ('Твердотельный накопитель SSD', 'Тезкор хотира SSD', 'Tezkor xotira SSD', 'Solid State Drive SSD'),
    ('Внешний жесткий диск', 'Ташқи қаттиқ диск', 'Tashqi qattiq disk', 'External HDD')
ON CONFLICT DO NOTHING;

-- Insert sample issues
INSERT INTO issues (name_rus, name_cyr, name_lat, name_eng) VALUES
    ('Не определяется в BIOS', 'BIOS-да аниқланмаяпти', 'BIOS-da aniqlanmayapti', 'Not detected in BIOS'),
    ('Стук внутри гермоблока', 'Гермоблок ичида тақиллаш', 'Germoblok ichida taqillash', 'Clicking sound inside HDA'),
    ('Случайное удаление файлов', 'Файлларнинг тасодифий ўчирилиши', 'Fayllarning tasodifiy o''chirilishi', 'Accidental file deletion')
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (name_rus, name_cyr, name_lat, name_eng) VALUES
    ('Восстановление данных с магнитных пластин', 'Магнит пластиналардан маълумотларни тиклаш', 'Magnit plastinalardan ma''lumotlarni tiklash', 'Data recovery from magnetic platters'),
    ('Замена блока магнитных головок', 'Магнит каллаклар блокини алмаштириш', 'Magnit kallaklar blokini almashtirish', 'Heads stack assembly replacement'),
    ('Ремонт платы контроллера', 'Контроллер платасини таъмирлаш', 'Kontroller platasini ta''mirlash', 'PCB repair')
ON CONFLICT DO NOTHING;
