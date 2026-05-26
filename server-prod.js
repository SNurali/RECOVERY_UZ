/**
 * Production server for RECOVERY.UZ
 * - Real PostgreSQL backend
 * - JWT authentication
 * - Telegram bot integration
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as telegram from './backend/src/telegram/bot.js';

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'recovery-uz-jwt-secret-change-in-production';

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5436,
  user: process.env.DB_USER || 'hdd_fixer',
  password: process.env.DB_PASSWORD || 'hdd_fixer_secret',
  database: process.env.DB_NAME || 'hdd_fixer_db',
});

pool.on('error', (err) => {
  console.error('Postgres pool error:', err);
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// JWT auth middleware
const authRequired = (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Не авторизован' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Сеанс истёк' });
  }
};

const authOptional = (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
};

// Helper to get user with role
async function getUserById(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.telegram, r.name_eng AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [userId]
  );
  return rows[0] || null;
}

// ==================== AUTH ====================

app.post('/v1/auth/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ message: 'Введите логин и пароль' });

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, r.name_eng AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1 OR u.phone = $1`,
      [login]
    );
    const user = rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Неверный логин или пароль' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...userData } = user;
    res.json({ data: { user: userData, token } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/v1/auth/register', async (req, res) => {
  const { full_name, phone, email, password } = req.body;
  if (!full_name || !phone || !password) {
    return res.status(400).json({ message: 'Заполните обязательные поля' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
  }

  try {
    const exists = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR phone = $2`,
      [email || null, phone]
    );
    if (exists.rows.length) {
      return res.status(409).json({ message: 'Пользователь уже существует' });
    }

    const clientRole = await pool.query(`SELECT id FROM roles WHERE name_eng = 'client'`);
    const roleId = clientRole.rows[0]?.id;
    if (!roleId) return res.status(500).json({ message: 'Роль не найдена' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone`,
      [full_name, email || null, phone, hash, roleId]
    );
    const newUser = { ...rows[0], role: 'client' };
    const token = jwt.sign({ userId: newUser.id, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ data: { user: newUser, token, message: 'Регистрация успешна' } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

app.post('/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.get('/v1/users/me', authRequired, async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) return res.status(401).json({ message: 'Не авторизован' });
  res.json(user);
});

// ==================== USERS ====================

app.get('/v1/users', authRequired, async (req, res) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Нет доступа' });
  }
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, r.name_eng AS role
     FROM users u JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC`
  );
  res.json({ data: rows });
});

app.get('/v1/users/masters', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.phone FROM users u
     JOIN roles r ON r.id = u.role_id WHERE r.name_eng = 'master'
     ORDER BY u.full_name`
  );
  res.json({ data: rows });
});

app.post('/v1/users', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Только админ' });
  const { full_name, login, password, role, phone, email } = req.body;
  try {
    const roleRow = await pool.query(`SELECT id FROM roles WHERE name_eng = $1`, [role]);
    if (!roleRow.rows[0]) return res.status(400).json({ message: 'Неверная роль' });
    const hash = password ? await bcrypt.hash(password, 10) : null;
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone`,
      [full_name, email || login, phone, hash, roleRow.rows[0].id]
    );
    res.status(201).json({ data: { ...rows[0], role } });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Не удалось создать' });
  }
});

app.patch('/v1/users/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Только админ' });
  const { role } = req.body;
  if (role) {
    const roleRow = await pool.query(`SELECT id FROM roles WHERE name_eng = $1`, [role]);
    if (!roleRow.rows[0]) return res.status(400).json({ message: 'Неверная роль' });
    await pool.query(`UPDATE users SET role_id = $1 WHERE id = $2`, [roleRow.rows[0].id, req.params.id]);
  }
  const user = await getUserById(req.params.id);
  res.json({ data: user });
});

// ==================== CLIENTS ====================

app.get('/v1/clients', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.phone, u.email, u.telegram,
            (SELECT telegram_chat_id FROM clients WHERE c_user_id = u.id LIMIT 1) AS telegram_chat_id
     FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name_eng = 'client'
     ORDER BY u.full_name`
  ).catch(async () => {
    return await pool.query(
      `SELECT u.id, u.full_name, u.phone, u.email, u.telegram
       FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name_eng = 'client'
       ORDER BY u.full_name`
    );
  });
  res.json({ data: rows });
});

app.post('/v1/clients', authRequired, async (req, res) => {
  const { full_name, phone, email, telegram_chat_id } = req.body;
  try {
    const roleRow = await pool.query(`SELECT id FROM roles WHERE name_eng = 'client'`);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, phone, role_id)
       VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, phone`,
      [full_name, email || null, phone, roleRow.rows[0].id]
    );
    res.status(201).json({ data: { ...rows[0], telegram_chat_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось добавить клиента' });
  }
});

// ==================== CATALOG ====================

for (const table of ['equipments', 'issues', 'services']) {
  app.get(`/v1/${table}`, async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY name_rus`);
    res.json({ data: rows });
  });

  app.post(`/v1/${table}`, authRequired, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Только админ' });
    const { name_rus, name_cyr, name_lat, name_eng } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO ${table} (name_rus, name_cyr, name_lat, name_eng) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name_rus, name_cyr || name_rus, name_lat || name_rus, name_eng || name_rus]
    );
    res.status(201).json({ data: rows[0] });
  });

  app.patch(`/v1/${table}/:id`, authRequired, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Только админ' });
    const { name_rus, name_cyr, name_lat, name_eng } = req.body;
    const { rows } = await pool.query(
      `UPDATE ${table} SET name_rus=$1, name_cyr=$2, name_lat=$3, name_eng=$4 WHERE id=$5 RETURNING *`,
      [name_rus, name_cyr, name_lat, name_eng, req.params.id]
    );
    res.json({ data: rows[0] });
  });

  app.delete(`/v1/${table}/:id`, authRequired, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Только админ' });
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  });
}

// ==================== ORDERS ====================

async function loadOrderFull(orderId) {
  const orderResult = await pool.query(
    `SELECT o.*, u.full_name AS client_full_name, u.phone AS client_phone, u.email AS client_email, u.telegram
     FROM orders o LEFT JOIN users u ON u.id = o.client_id WHERE o.id = $1`,
    [orderId]
  );
  if (!orderResult.rows[0]) return null;
  const order = orderResult.rows[0];

  const detailsResult = await pool.query(
    `SELECT od.*,
       e.name_rus AS equipment_name_rus, e.name_cyr AS equipment_name_cyr, e.name_lat AS equipment_name_lat, e.name_eng AS equipment_name_eng,
       i.name_rus AS issue_name_rus, i.name_cyr AS issue_name_cyr, i.name_lat AS issue_name_lat, i.name_eng AS issue_name_eng,
       s.name_rus AS service_name_rus, s.name_cyr AS service_name_cyr, s.name_lat AS service_name_lat, s.name_eng AS service_name_eng,
       m.full_name AS master_name, m.phone AS master_phone
     FROM order_details od
     LEFT JOIN equipments e ON e.id = od.equipment_id
     LEFT JOIN issues i ON i.id = od.issue_id
     LEFT JOIN services s ON s.id = od.service_id
     LEFT JOIN users m ON m.id = od.attached_to
     WHERE od.order_id = $1`,
    [orderId]
  );

  return {
    id: order.id,
    order_date: order.created_at || order.order_date,
    status: order.status,
    price_approved_at: order.price_approved_at,
    price_rejected_at: order.price_rejected_at,
    total_price_uzs: Number(order.total_price_uzs),
    total_paid_uzs: Number(order.total_paid_uzs),
    public_tracking_token: order.public_tracking_token,
    client: order.client_id ? {
      id: order.client_id,
      full_name: order.client_full_name,
      phone: order.client_phone,
      email: order.client_email,
      telegram: order.telegram,
    } : null,
    details: detailsResult.rows.map(d => ({
      id: d.id,
      serial_number: d.serial_number,
      price_uzs: Number(d.price_uzs || 0),
      attached_to: d.attached_to,
      equipment: d.equipment_id ? { id: d.equipment_id, name_rus: d.equipment_name_rus, name_cyr: d.equipment_name_cyr, name_lat: d.equipment_name_lat, name_eng: d.equipment_name_eng } : null,
      issue: d.issue_id ? { id: d.issue_id, name_rus: d.issue_name_rus, name_cyr: d.issue_name_cyr, name_lat: d.issue_name_lat, name_eng: d.issue_name_eng } : null,
      service: d.service_id ? { id: d.service_id, name_rus: d.service_name_rus, name_cyr: d.service_name_cyr, name_lat: d.service_name_lat, name_eng: d.service_name_eng } : null,
      master: d.attached_to ? { id: d.attached_to, full_name: d.master_name, phone: d.master_phone } : null,
    })),
  };
}

app.get('/v1/orders/list', authRequired, async (req, res) => {
  let query = `SELECT id FROM orders ORDER BY created_at DESC LIMIT 100`;
  let params = [];
  if (req.user.role === 'client') {
    query = `SELECT id FROM orders WHERE client_id = $1 ORDER BY created_at DESC`;
    params = [req.user.userId];
  }
  const { rows } = await pool.query(query, params);
  const orders = await Promise.all(rows.map(r => loadOrderFull(r.id)));
  res.json({ data: orders.filter(Boolean) });
});

app.get('/v1/orders', authRequired, async (req, res) => {
  // alias
  return app._router.handle({ ...req, url: '/v1/orders/list' }, res);
});

app.get('/v1/orders/stats', authRequired, async (req, res) => {
  const active = ['diagnosing', 'awaiting_approval', 'approved', 'in_repair', 'assigned', 'accepted'];
  const completed = ['completed', 'issued', 'ready_for_pickup'];

  let totalQ = `SELECT COUNT(*)::int AS c FROM orders`;
  let activeQ = `SELECT COUNT(*)::int AS c FROM orders WHERE status = ANY($1)`;
  let doneQ = `SELECT COUNT(*)::int AS c FROM orders WHERE status = ANY($1)`;
  let totalP = [], activeP = [active], doneP = [completed];

  if (req.user.role === 'client') {
    totalQ += ` WHERE client_id = $1`;
    activeQ += ` AND client_id = $2`;
    doneQ += ` AND client_id = $2`;
    totalP = [req.user.userId];
    activeP = [active, req.user.userId];
    doneP = [completed, req.user.userId];
  }

  const [tot, act, don] = await Promise.all([
    pool.query(totalQ, totalP),
    pool.query(activeQ, activeP),
    pool.query(doneQ, doneP),
  ]);

  res.json({ data: { total: tot.rows[0].c, in_repair: act.rows[0].c, completed_today: don.rows[0].c } });
});

app.get('/v1/orders/:id', authRequired, async (req, res) => {
  const order = await loadOrderFull(req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  if (req.user.role === 'client' && order.client?.id !== req.user.userId) {
    return res.status(403).json({ message: 'Нет доступа' });
  }
  res.json({ data: order });
});

app.post('/v1/orders', authRequired, async (req, res) => {
  const { details } = req.body;
  if (!details?.length) return res.status(400).json({ message: 'Нет позиций' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (client_id, status) VALUES ($1, 'new') RETURNING id`,
      [req.user.userId]
    );
    const orderId = orderRows[0].id;
    for (const d of details) {
      await client.query(
        `INSERT INTO order_details (order_id, equipment_id, issue_id, serial_number) VALUES ($1, $2, $3, $4)`,
        [orderId, d.equipment_id, d.issue_id, d.serial_number || '']
      );
    }
    await client.query('COMMIT');
    const newOrder = await loadOrderFull(orderId);
    telegram.notifyNewOrder(newOrder);
    res.status(201).json({ data: newOrder });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Не удалось создать заказ' });
  } finally {
    client.release();
  }
});

app.get('/v1/orders/:id/allowed-transitions', authRequired, async (req, res) => {
  const { rows } = await pool.query(`SELECT status FROM orders WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Заказ не найден' });
  const transitions = {
    new: ['accepted', 'cancelled'],
    accepted: ['diagnosing'],
    diagnosing: ['awaiting_approval'],
    awaiting_approval: ['approved', 'cancelled'],
    approved: ['in_repair'],
    in_repair: ['completed'],
    completed: ['issued'],
  };
  res.json({ transitions: transitions[rows[0].status] || [] });
});

app.patch('/v1/orders/:id', authRequired, async (req, res) => {
  const { status } = req.body;
  const orderBefore = await loadOrderFull(req.params.id);
  if (!orderBefore) return res.status(404).json({ message: 'Заказ не найден' });
  await pool.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [status, req.params.id]);
  const order = await loadOrderFull(req.params.id);
  const actor = await getUserById(req.user.userId);
  telegram.notifyStatusChange(order, orderBefore.status, status, actor?.full_name);
  res.json({ data: order });
});

app.post('/v1/orders/:id/details/:detailId/assign', authRequired, async (req, res) => {
  await pool.query(`UPDATE order_details SET attached_to = $1 WHERE id = $2`, [req.body.master_id, req.params.detailId]);
  const order = await loadOrderFull(req.params.id);
  const master = await getUserById(req.body.master_id);
  telegram.notifyMasterAssigned(order, master);
  res.json({ data: order });
});

const handleSetPrice = async (req, res) => {
  const { details } = req.body;
  let total = 0;
  for (const item of details) {
    await pool.query(`UPDATE order_details SET price_uzs = $1 WHERE id = $2`, [item.price, item.detail_id]);
  }
  const { rows } = await pool.query(`SELECT SUM(price_uzs)::numeric AS total FROM order_details WHERE order_id = $1`, [req.params.id]);
  total = Number(rows[0].total || 0);
  await pool.query(`UPDATE orders SET total_price_uzs = $1 WHERE id = $2`, [total, req.params.id]);
  const order = await loadOrderFull(req.params.id);
  telegram.notifyPriceSet(order, total);
  res.json({ data: order });
};

app.post('/v1/orders/:id/set-price', authRequired, handleSetPrice);
app.post('/v1/orders/:id/update-price', authRequired, handleSetPrice);

app.post('/v1/orders/:id/approve-price', authRequired, async (req, res) => {
  await pool.query(`UPDATE orders SET price_approved_at = NOW(), status = 'approved' WHERE id = $1`, [req.params.id]);
  const order = await loadOrderFull(req.params.id);
  telegram.notifyPriceApproved(order);
  res.json({ data: order });
});

app.post('/v1/orders/:id/reject-price', authRequired, async (req, res) => {
  await pool.query(`UPDATE orders SET price_rejected_at = NOW(), status = 'cancelled' WHERE id = $1`, [req.params.id]);
  const order = await loadOrderFull(req.params.id);
  telegram.notifyPriceRejected(order, req.body.reason);
  res.json({ data: order });
});

app.post('/v1/orders/:id/close', authRequired, async (req, res) => {
  await pool.query(`UPDATE orders SET status = 'issued', closed_at = NOW(), total_paid_uzs = total_price_uzs WHERE id = $1`, [req.params.id]);
  const order = await loadOrderFull(req.params.id);
  telegram.notifyOrderIssued(order);
  res.json({ data: order });
});

// Public order tracking (no auth)
app.get('/v1/orders/track/:token', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id FROM orders WHERE public_tracking_token = $1 OR id::text = $1 LIMIT 1`,
    [req.params.token]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Заказ не найден. Проверьте код.' });
  const order = await loadOrderFull(rows[0].id);
  res.json({ data: order });
});

// Telegram webhook
app.post('/v1/telegram/webhook', async (req, res) => {
  const result = await telegram.handleWebhook(req.body, null, null, null);
  res.json(result);
});

// Health check
app.get('/v1/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Production server running on http://localhost:${PORT}`);
  console.log(`🗄  Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5436}/${process.env.DB_NAME || 'hdd_fixer_db'}`);
  console.log(`🤖 Telegram bot: ${telegram.isConfigured() ? '✅ Configured' : '⚠️  Not configured'}`);
});
