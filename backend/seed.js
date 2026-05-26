/**
 * Idempotent seed: test users + sample catalog + a couple of orders.
 * Run after schema is created. Uses real bcrypt hashes.
 *
 * Usage:
 *   DB_HOST=localhost DB_PORT=5436 node backend/seed.js
 */

import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5436),
  user: process.env.DB_USER || 'recovery_admin',
  password: process.env.DB_PASSWORD || 'recovery_secret',
  database: process.env.DB_NAME || 'recovery_uz',
});

const TEST_USERS = [
  { login: 'admin@hdd-fixer.uz', password: 'admin123',    role: 'admin',    full_name: 'Акмаль Абдуллаев',     phone: '+998901234567', email: 'admin@hdd-fixer.uz' },
  { login: 'operator@test.uz',   password: 'operator123', role: 'operator', full_name: 'Озода Каримова',       phone: '+998909876543', email: 'operator@test.uz' },
  { login: 'master1@test.uz',    password: 'master123',   role: 'master',   full_name: 'Дониёр Юсупов',        phone: '+998931112233', email: 'master1@test.uz' },
  { login: 'master2@test.uz',    password: 'master123',   role: 'master',   full_name: 'Джасур Усманов',       phone: '+998934445566', email: 'master2@test.uz' },
  { login: 'client@test.uz',     password: 'client123',   role: 'client',   full_name: 'Нурбек Алимов',        phone: '+998998887766', email: 'client@test.uz' },
  { login: 'client2@test.uz',    password: 'client123',   role: 'client',   full_name: 'Фарход Рахимов',       phone: '+998912223344', email: 'client2@test.uz' },
];

const EQUIPMENTS = [
  ['Жесткий диск HDD 3.5"',       'Қаттиқ диск HDD 3.5"',     'Qattiq disk HDD 3.5"',     'Hard Drive HDD 3.5"'],
  ['Твердотельный накопитель SSD','Тезкор хотира SSD',        'Tezkor xotira SSD',        'Solid State Drive SSD'],
  ['Внешний жесткий диск',        'Ташқи қаттиқ диск',        'Tashqi qattiq disk',       'External HDD'],
  ['USB флэш-накопитель',         'USB флеш-хотира',          'USB flesh-xotira',         'USB flash drive'],
  ['Карта памяти SD/microSD',     'Хотира картаси SD/microSD','Xotira kartasi SD/microSD','Memory card SD/microSD'],
];

const ISSUES = [
  ['Не определяется в BIOS',        'BIOS-да аниқланмаяпти',         'BIOS-da aniqlanmayapti',         'Not detected in BIOS'],
  ['Стук внутри гермоблока',        'Гермоблок ичида тақиллаш',      'Germoblok ichida taqillash',     'Clicking sound inside HDA'],
  ['Случайное удаление файлов',     'Файлларнинг тасодифий ўчирилиши','Fayllarning tasodifiy o\'chirilishi','Accidental file deletion'],
  ['Логические ошибки файловой системы','Файл тизими хатолари','Fayl tizimi xatolari','File system errors'],
  ['Повреждение электроники (PCB)', 'Электроника шикасти (PCB)',     'Elektronika shikasti (PCB)',     'PCB damage'],
];

const SERVICES = [
  ['Восстановление данных с магнитных пластин','Магнит пластиналардан маълумотларни тиклаш','Magnit plastinalardan ma\'lumotlarni tiklash','Data recovery from magnetic platters'],
  ['Замена блока магнитных головок',           'Магнит каллаклар блокини алмаштириш',     'Magnit kallaklar blokini almashtirish',     'Heads stack assembly replacement'],
  ['Ремонт платы контроллера',                 'Контроллер платасини таъмирлаш',          'Kontroller platasini ta\'mirlash',          'PCB repair'],
  ['Восстановление логического раздела',       'Мантиқий бўлинмани тиклаш',               'Mantiqiy bo\'linmani tiklash',              'Logical partition recovery'],
];

async function ensureTable(name, columns, samples) {
  for (const s of samples) {
    const placeholders = columns.map((_, i) => `$${i + 1}::varchar`).join(',');
    await pool.query(
      `INSERT INTO ${name} (${columns.join(',')})
       SELECT ${placeholders}
       WHERE NOT EXISTS (SELECT 1 FROM ${name} WHERE name_rus = $1::varchar)`,
      s
    );
  }
}

async function seedUsers() {
  for (const u of TEST_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (login, password_hash, role, full_name, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (login) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role          = EXCLUDED.role,
             full_name     = EXCLUDED.full_name,
             phone         = EXCLUDED.phone,
             email         = EXCLUDED.email`,
      [u.login, hash, u.role, u.full_name, u.phone, u.email]
    );
  }
}

async function seedSampleOrder() {
  const { rows: clients }   = await pool.query(`SELECT id FROM users WHERE role='client'   ORDER BY created_at LIMIT 1`);
  const { rows: masters }   = await pool.query(`SELECT id FROM users WHERE role='master'   ORDER BY created_at LIMIT 1`);
  const { rows: equipments }= await pool.query(`SELECT id FROM equipments LIMIT 1`);
  const { rows: issues }    = await pool.query(`SELECT id FROM issues     LIMIT 1`);
  const { rows: services }  = await pool.query(`SELECT id FROM services   LIMIT 1`);

  if (!clients[0] || !equipments[0] || !issues[0]) return;

  const exists = await pool.query(`SELECT 1 FROM orders LIMIT 1`);
  if (exists.rows.length) return;

  const { rows: orderRows } = await pool.query(
    `INSERT INTO orders (client_id, status, total_price_uzs)
     VALUES ($1, 'diagnosing', 1500000) RETURNING id`,
    [clients[0].id]
  );
  await pool.query(
    `INSERT INTO order_details
       (order_id, serial_number, equipment_id, issue_id, service_id, attached_to, price_uzs)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [orderRows[0].id, 'WD-WCC7K4PZ9', equipments[0].id, issues[0].id, services[0]?.id || null, masters[0]?.id || null, 1500000]
  );
}

async function main() {
  console.log('🌱 Seeding database...');
  await seedUsers();
  console.log('  ✓ users');
  await ensureTable('equipments', ['name_rus','name_cyr','name_lat','name_eng'], EQUIPMENTS);
  console.log('  ✓ equipments');
  await ensureTable('issues',     ['name_rus','name_cyr','name_lat','name_eng'], ISSUES);
  console.log('  ✓ issues');
  await ensureTable('services',   ['name_rus','name_cyr','name_lat','name_eng'], SERVICES);
  console.log('  ✓ services');
  await seedSampleOrder();
  console.log('  ✓ sample order');
  console.log('✅ Seed complete');
  await pool.end();
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
