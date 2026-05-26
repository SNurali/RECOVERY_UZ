/**
 * RECOVERY.UZ — Unified backend server
 * Real PostgreSQL + JWT auth + Telegram notifications.
 * Used identically on local and production.
 *
 * Required env (see .env.example):
 *   PORT, JWT_SECRET
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as telegram from './backend/src/telegram/bot.js';

const { Pool } = pg;

// ----------------------- Config -----------------------
const PORT       = Number(process.env.PORT || 3004);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 5436),
  user:     process.env.DB_USER     || 'recovery_admin',
  password: process.env.DB_PASSWORD || 'recovery_secret',
  database: process.env.DB_NAME     || 'recovery_uz',
  max: 10,
  idleTimeoutMillis: 30_000,
});
pool.on('error', err => console.error('[pg pool] error:', err));

// ----------------------- App -----------------------
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ----------------------- Auth middlewares -----------------------
function getToken(req) {
  const auth = req.headers.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}

function authRequired(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Не авторизован' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Сеанс истёк' });
  }
}

function authOptional(req, _res, next) {
  const token = getToken(req);
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch { /* ignore */ } }
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет доступа' });
    }
    next();
  };
}

// ----------------------- Helpers -----------------------
async function getUserById(userId) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, role, telegram, telegram_chat_id
     FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] || null;
}

async function loadOrderFull(orderId) {
  const orderResult = await pool.query(
    `SELECT o.*,
            u.full_name        AS client_full_name,
            u.phone            AS client_phone,
            u.email            AS client_email,
            u.telegram         AS client_telegram,
            u.telegram_chat_id AS client_telegram_chat_id
       FROM orders o
       LEFT JOIN users u ON u.id = o.client_id
      WHERE o.id = $1`,
    [orderId]
  );
  if (!orderResult.rows[0]) return null;
  const order = orderResult.rows[0];

  const detailsResult = await pool.query(
    `SELECT od.*,
       e.name_rus AS equipment_name_rus, e.name_cyr AS equipment_name_cyr, e.name_lat AS equipment_name_lat, e.name_eng AS equipment_name_eng,
       i.name_rus AS issue_name_rus,     i.name_cyr AS issue_name_cyr,     i.name_lat AS issue_name_lat,     i.name_eng AS issue_name_eng,
       s.name_rus AS service_name_rus,   s.name_cyr AS service_name_cyr,   s.name_lat AS service_name_lat,   s.name_eng AS service_name_eng,
       m.full_name AS master_name, m.phone AS master_phone
     FROM order_details od
     LEFT JOIN equipments e ON e.id = od.equipment_id
     LEFT JOIN issues     i ON i.id = od.issue_id
     LEFT JOIN services   s ON s.id = od.service_id
     LEFT JOIN users      m ON m.id = od.attached_to
     WHERE od.order_id = $1
     ORDER BY od.created_at`,
    [orderId]
  );

  return {
    id: order.id,
    order_date: order.created_at,
    status: order.status,
    price_approved_at: order.price_approved_at,
    price_rejected_at: order.price_rejected_at,
    rejection_reason:  order.rejection_reason,
    total_price_uzs:   Number(order.total_price_uzs || 0),
    total_paid_uzs:    Number(order.total_paid_uzs  || 0),
    public_tracking_token: order.public_tracking_token,
    guest_name:  order.guest_name,
    guest_phone: order.guest_phone,
    client: order.client_id ? {
      id:                order.client_id,
      full_name:         order.client_full_name,
      phone:             order.client_phone,
      email:             order.client_email,
      telegram:          order.client_telegram,
      telegram_chat_id:  order.client_telegram_chat_id,
    } : null,
    details: detailsResult.rows.map(d => ({
      id: d.id,
      serial_number: d.serial_number,
      notes:         d.notes,
      price_uzs:     Number(d.price_uzs || 0),
      attached_to:   d.attached_to,
      equipment: d.equipment_id ? { id: d.equipment_id, name_rus: d.equipment_name_rus, name_cyr: d.equipment_name_cyr, name_lat: d.equipment_name_lat, name_eng: d.equipment_name_eng } : null,
      issue:     d.issue_id     ? { id: d.issue_id,     name_rus: d.issue_name_rus,     name_cyr: d.issue_name_cyr,     name_lat: d.issue_name_lat,     name_eng: d.issue_name_eng     } : null,
      service:   d.service_id   ? { id: d.service_id,   name_rus: d.service_name_rus,   name_cyr: d.service_name_cyr,   name_lat: d.service_name_lat,   name_eng: d.service_name_eng   } : null,
      master:    d.attached_to  ? { id: d.attached_to,  full_name: d.master_name, phone: d.master_phone } : null,
    })),
  };
}

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

// ============================================================
// AUTH
// ============================================================

app.post('/v1/auth/login', async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) return res.status(400).json({ message: 'Введите логин и пароль' });

  try {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, phone, password_hash, role
         FROM users
        WHERE login = $1 OR email = $1 OR phone = $1
        LIMIT 1`,
      [login]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Неверный логин или пароль' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)   return res.status(401).json({ message: 'Неверный логин или пароль' });

    const { password_hash, ...userData } = user;
    res.json({ data: { user: userData, token: signToken(user) } });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/v1/auth/register', async (req, res) => {
  const { full_name, phone, email, password } = req.body || {};
  if (!full_name || !phone || !password) return res.status(400).json({ message: 'Заполните обязательные поля' });
  if (password.length < 6)               return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });

  try {
    const exists = await pool.query(
      `SELECT 1 FROM users WHERE login=$1 OR phone=$1 OR email=$2`,
      [phone, email || null]
    );
    if (exists.rows.length) return res.status(409).json({ message: 'Пользователь уже существует' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (login, password_hash, role, full_name, phone, email)
       VALUES ($1, $2, 'client', $3, $4, $5)
       RETURNING id, full_name, email, phone, role`,
      [email || phone, hash, full_name, phone, email || null]
    );
    res.status(201).json({ data: { user: rows[0], token: signToken(rows[0]), message: 'Регистрация успешна' } });
  } catch (err) {
    console.error('register:', err);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

app.post('/v1/auth/logout', (_req, res) => res.json({ message: 'ok' }));

app.get('/v1/users/me', authRequired, async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) return res.status(401).json({ message: 'Не авторизован' });
  res.json(user);
});

// ============================================================
// USERS
// ============================================================

app.get('/v1/users', authRequired, requireRoles('admin','operator'), async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, role, login FROM users ORDER BY created_at DESC`
  );
  res.json({ data: rows });
});

app.get('/v1/users/masters', authRequired, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, phone FROM users WHERE role='master' ORDER BY full_name`
  );
  res.json({ data: rows });
});

app.post('/v1/users', authRequired, requireRoles('admin'), async (req, res) => {
  const { full_name, login, password, role, phone, email } = req.body || {};
  if (!full_name || !login || !password || !role) return res.status(400).json({ message: 'Заполните обязательные поля' });
  if (!['admin','operator','master','client'].includes(role)) return res.status(400).json({ message: 'Неверная роль' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (login, password_hash, role, full_name, phone, email)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, full_name, email, phone, role`,
      [login, hash, role, full_name, phone || null, email || null]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error('create user:', err);
    if (err.code === '23505') return res.status(409).json({ message: 'Логин уже занят' });
    res.status(500).json({ message: 'Не удалось создать пользователя' });
  }
});

app.patch('/v1/users/:id', authRequired, requireRoles('admin'), async (req, res) => {
  const fields = [];
  const values = [];
  let i = 1;
  for (const k of ['full_name','phone','email','role']) {
    if (req.body[k] !== undefined) { fields.push(`${k} = $${i++}`); values.push(req.body[k]); }
  }
  if (!fields.length) return res.json({ data: await getUserById(req.params.id) });
  values.push(req.params.id);
  await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id = $${i}`, values);
  res.json({ data: await getUserById(req.params.id) });
});

// ============================================================
// CLIENTS (subset of users)
// ============================================================

app.get('/v1/clients', authRequired, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, full_name, phone, email, telegram, telegram_chat_id
     FROM users WHERE role='client' ORDER BY full_name`
  );
  res.json({ data: rows });
});

app.post('/v1/clients', authRequired, requireRoles('admin','operator'), async (req, res) => {
  const { full_name, phone, email, telegram_chat_id } = req.body || {};
  if (!full_name || !phone) return res.status(400).json({ message: 'ФИО и телефон обязательны' });
  try {
    const tempPassword = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(tempPassword, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (login, password_hash, role, full_name, phone, email, telegram_chat_id)
       VALUES ($1,$2,'client',$3,$4,$5,$6)
       RETURNING id, full_name, email, phone, telegram_chat_id`,
      [phone, hash, full_name, phone, email || null, telegram_chat_id || null]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Клиент с таким телефоном уже есть' });
    console.error('create client:', err);
    res.status(500).json({ message: 'Не удалось добавить клиента' });
  }
});

// ============================================================
// CATALOG: equipments / issues / services
// ============================================================

const CATALOGS = ['equipments', 'issues', 'services'];

for (const table of CATALOGS) {
  app.get(`/v1/${table}`, async (_req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY name_rus`);
    res.json({ data: rows });
  });

  app.post(`/v1/${table}`, authRequired, requireRoles('admin','operator'), async (req, res) => {
    const { name_rus, name_cyr, name_lat, name_eng } = req.body || {};
    if (!name_rus) return res.status(400).json({ message: 'Название обязательно' });
    const { rows } = await pool.query(
      `INSERT INTO ${table} (name_rus, name_cyr, name_lat, name_eng)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name_rus, name_cyr || name_rus, name_lat || name_rus, name_eng || name_rus]
    );
    res.status(201).json({ data: rows[0] });
  });

  app.patch(`/v1/${table}/:id`, authRequired, requireRoles('admin','operator'), async (req, res) => {
    const { name_rus, name_cyr, name_lat, name_eng } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE ${table} SET name_rus=COALESCE($1,name_rus),
                            name_cyr=COALESCE($2,name_cyr),
                            name_lat=COALESCE($3,name_lat),
                            name_eng=COALESCE($4,name_eng)
       WHERE id=$5 RETURNING *`,
      [name_rus, name_cyr, name_lat, name_eng, req.params.id]
    );
    res.json({ data: rows[0] });
  });

  app.delete(`/v1/${table}/:id`, authRequired, requireRoles('admin'), async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  });
}

// ============================================================
// ORDERS
// ============================================================

async function listOrders(req, res) {
  const isClient = req.user.role === 'client';
  const params   = isClient ? [req.user.userId] : [];
  const where    = isClient ? `WHERE client_id = $1` : '';
  const { rows } = await pool.query(
    `SELECT id FROM orders ${where} ORDER BY created_at DESC LIMIT 200`, params
  );
  const orders = await Promise.all(rows.map(r => loadOrderFull(r.id)));
  res.json({ data: orders.filter(Boolean) });
}

app.get('/v1/orders/list', authRequired, listOrders);
app.get('/v1/orders',      authRequired, listOrders);

app.get('/v1/orders/stats', authRequired, async (req, res) => {
  const active    = ['diagnosing','awaiting_approval','approved','in_repair','assigned','accepted','new'];
  const completed = ['completed','issued','ready_for_pickup'];

  const isClient = req.user.role === 'client';
  const clientFilter = isClient ? `AND client_id = $2` : '';
  const totalFilter  = isClient ? `WHERE client_id = $1` : '';
  const totalParams  = isClient ? [req.user.userId] : [];
  const activeParams = isClient ? [active,   req.user.userId] : [active];
  const doneParams   = isClient ? [completed,req.user.userId] : [completed];

  const [tot, act, don] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS c FROM orders ${totalFilter}`, totalParams),
    pool.query(`SELECT COUNT(*)::int AS c FROM orders WHERE status = ANY($1) ${clientFilter}`, activeParams),
    pool.query(`SELECT COUNT(*)::int AS c FROM orders WHERE status = ANY($1) ${clientFilter}`, doneParams),
  ]);
  res.json({ data: { total: tot.rows[0].c, in_repair: act.rows[0].c, completed_today: don.rows[0].c } });
});

app.get('/v1/orders/track/:token', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id FROM orders WHERE public_tracking_token = $1 OR id::text = $1 LIMIT 1`,
    [req.params.token]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Заказ не найден. Проверьте код.' });
  res.json({ data: await loadOrderFull(rows[0].id) });
});

app.get('/v1/orders/:id', authRequired, async (req, res) => {
  const order = await loadOrderFull(req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  if (req.user.role === 'client' && order.client?.id !== req.user.userId) {
    return res.status(403).json({ message: 'Нет доступа' });
  }
  res.json({ data: order });
});

app.get('/v1/orders/:id/allowed-transitions', authRequired, async (req, res) => {
  const { rows } = await pool.query(`SELECT status FROM orders WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Заказ не найден' });
  const transitions = {
    new: ['accepted','cancelled'],
    accepted: ['diagnosing'],
    diagnosing: ['awaiting_approval'],
    awaiting_approval: ['approved','cancelled'],
    approved: ['in_repair'],
    in_repair: ['completed'],
    completed: ['issued'],
  };
  res.json({ transitions: transitions[rows[0].status] || [] });
});

app.post('/v1/orders', authRequired, async (req, res) => {
  const details = req.body?.details;
  if (!Array.isArray(details) || !details.length) return res.status(400).json({ message: 'Нет позиций' });

  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const { rows: o } = await c.query(
      `INSERT INTO orders (client_id, status) VALUES ($1, 'new') RETURNING id`,
      [req.user.userId]
    );
    for (const d of details) {
      await c.query(
        `INSERT INTO order_details (order_id, equipment_id, issue_id, service_id, serial_number, notes)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [o[0].id, d.equipment_id || null, d.issue_id || null, d.service_id || null, d.serial_number || '', d.notes || null]
      );
    }
    await c.query('COMMIT');
    const newOrder = await loadOrderFull(o[0].id);
    telegram.notifyNewOrder(newOrder).catch(() => {});
    res.status(201).json({ data: newOrder });
  } catch (err) {
    await c.query('ROLLBACK').catch(()=>{});
    console.error('create order:', err);
    res.status(500).json({ message: 'Не удалось создать заказ' });
  } finally {
    c.release();
  }
});

// Guest order (no auth)
app.post('/v1/guest/orders', authOptional, async (req, res) => {
  const { client_name, phone, telegram: tg, notes } = req.body || {};
  // Accept either an array of details, or a single equipment_id/issue_id pair (legacy)
  const rawDetails = Array.isArray(req.body?.details)
    ? req.body.details
    : (req.body?.equipment_id || req.body?.issue_id)
      ? [{ equipment_id: req.body.equipment_id, issue_id: req.body.issue_id, notes }]
      : [];

  if (!client_name || !phone) return res.status(400).json({ message: 'Имя и телефон обязательны' });
  if (!rawDetails.length)     return res.status(400).json({ message: 'Добавьте хотя бы одно устройство' });

  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    // Find or create client
    const found = await c.query(`SELECT id FROM users WHERE phone = $1 AND role='client' LIMIT 1`, [phone]);
    let clientId = found.rows[0]?.id;
    if (!clientId) {
      const tempPassword = Math.random().toString(36).slice(-10);
      const hash = await bcrypt.hash(tempPassword, 10);
      const { rows: u } = await c.query(
        `INSERT INTO users (login, password_hash, role, full_name, phone, telegram)
         VALUES ($1,$2,'client',$3,$4,$5) RETURNING id`,
        [phone, hash, client_name, phone, tg || null]
      );
      clientId = u[0].id;
    } else if (tg) {
      await c.query(`UPDATE users SET telegram = $1, full_name = $2 WHERE id = $3`, [tg, client_name, clientId]);
    }

    const { rows: o } = await c.query(
      `INSERT INTO orders (client_id, guest_name, guest_phone, status)
       VALUES ($1,$2,$3,'new') RETURNING id`,
      [clientId, client_name, phone]
    );
    for (const d of rawDetails) {
      await c.query(
        `INSERT INTO order_details (order_id, equipment_id, issue_id, serial_number, notes)
         VALUES ($1,$2,$3,$4,$5)`,
        [o[0].id, d.equipment_id || null, d.issue_id || null, d.serial_number || '', d.notes || null]
      );
    }
    await c.query('COMMIT');

    const newOrder = await loadOrderFull(o[0].id);
    telegram.notifyGuestNewOrder(newOrder).catch(() => {});
    res.status(201).json({ data: newOrder });
  } catch (err) {
    await c.query('ROLLBACK').catch(()=>{});
    console.error('guest order:', err);
    res.status(500).json({ message: 'Не удалось создать заявку' });
  } finally {
    c.release();
  }
});

app.patch('/v1/orders/:id', authRequired, async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: 'Status required' });

  const before = await loadOrderFull(req.params.id);
  if (!before) return res.status(404).json({ message: 'Заказ не найден' });

  await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, req.params.id]);
  const order = await loadOrderFull(req.params.id);
  const actor = await getUserById(req.user.userId);

  telegram.notifyStatusChange(order, before.status, status, actor?.full_name).catch(()=>{});
  if (order.client?.telegram_chat_id) {
    telegram.notifyClientStatusChange(order.client.telegram_chat_id, order, status).catch(()=>{});
  }
  if (status === 'completed') {
    telegram.notifyOrderCompleted(order).catch(()=>{});
    if (order.client?.telegram_chat_id) {
      telegram.notifyClientOrderReady(order.client.telegram_chat_id, order).catch(()=>{});
    }
  }
  res.json({ data: order });
});

app.post('/v1/orders/:id/details/:detailId/assign', authRequired, requireRoles('admin','operator'), async (req, res) => {
  await pool.query(`UPDATE order_details SET attached_to = $1 WHERE id = $2`, [req.body.master_id, req.params.detailId]);
  const order  = await loadOrderFull(req.params.id);
  const master = await getUserById(req.body.master_id);
  telegram.notifyMasterAssigned(order, master).catch(()=>{});
  res.json({ data: order });
});

const handleSetPrice = async (req, res) => {
  const details = req.body?.details || [];
  for (const item of details) {
    await pool.query(`UPDATE order_details SET price_uzs = $1 WHERE id = $2`, [Number(item.price), item.detail_id]);
  }
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(price_uzs),0)::numeric AS total FROM order_details WHERE order_id = $1`,
    [req.params.id]
  );
  const total = Number(rows[0].total || 0);
  await pool.query(
    `UPDATE orders SET total_price_uzs = $1, status = CASE WHEN status IN ('diagnosing','new') THEN 'awaiting_approval' ELSE status END WHERE id = $2`,
    [total, req.params.id]
  );
  const order = await loadOrderFull(req.params.id);
  telegram.notifyPriceSet(order, total).catch(()=>{});
  if (order.client?.telegram_chat_id) {
    telegram.notifyClientPriceSet(order.client.telegram_chat_id, order, total).catch(()=>{});
  }
  res.json({ data: order });
};

app.post('/v1/orders/:id/set-price',    authRequired, requireRoles('admin','operator','master'), handleSetPrice);
app.post('/v1/orders/:id/update-price', authRequired, requireRoles('admin','operator','master'), handleSetPrice);

app.post('/v1/orders/:id/approve-price', authRequired, async (req, res) => {
  // Admin/operator can approve on behalf of client
  const allowedRoles = ['admin', 'operator', 'client'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Нет доступа' });
  }
  await pool.query(
    `UPDATE orders SET price_approved_at = NOW(), status = 'approved' WHERE id = $1`,
    [req.params.id]
  );
  const order = await loadOrderFull(req.params.id);
  telegram.notifyPriceApproved(order).catch(()=>{});
  res.json({ data: order });
});

app.post('/v1/orders/:id/reject-price', authRequired, async (req, res) => {
  await pool.query(
    `UPDATE orders SET price_rejected_at = NOW(), status = 'cancelled', rejection_reason = $1 WHERE id = $2`,
    [req.body?.reason || null, req.params.id]
  );
  const order = await loadOrderFull(req.params.id);
  telegram.notifyPriceRejected(order, req.body?.reason).catch(()=>{});
  res.json({ data: order });
});

app.post('/v1/orders/:id/close', authRequired, requireRoles('admin','operator'), async (req, res) => {
  await pool.query(
    `UPDATE orders SET status = 'issued', closed_at = NOW(), total_paid_uzs = total_price_uzs WHERE id = $1`,
    [req.params.id]
  );
  const order = await loadOrderFull(req.params.id);
  telegram.notifyOrderIssued(order).catch(()=>{});
  res.json({ data: order });
});

// Delete order (admin only) — for orders created by mistake
app.delete('/v1/orders/:id', authRequired, requireRoles('admin'), async (req, res) => {
  const { rows } = await pool.query(`SELECT id, status FROM orders WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Заказ не найден' });

  await pool.query(`DELETE FROM order_details WHERE order_id = $1`, [req.params.id]);
  await pool.query(`DELETE FROM orders WHERE id = $1`, [req.params.id]);
  res.json({ success: true, message: 'Заказ удалён' });
});

// ============================================================
// TELEGRAM webhook
// ============================================================

app.post('/v1/telegram/webhook', async (req, res) => {
  const findOrderById = async (orderId) => {
    const { rows } = await pool.query(`SELECT id, client_id FROM orders WHERE id::text = $1 LIMIT 1`, [orderId]);
    if (!rows[0]) return null;
    return await loadOrderFull(rows[0].id);
  };
  const saveClientChatId = async (clientId, chatId, username) => {
    await pool.query(
      `UPDATE users SET telegram_chat_id = $1, telegram = COALESCE($2, telegram) WHERE id = $3`,
      [chatId, username || null, clientId]
    );
  };

  try {
    if (req.body.message?.text?.startsWith('/start')) {
      const m = req.body.message;
      const chatId = String(m.chat.id);
      const args = m.text.split(' ');
      if (args.length > 1) {
        const order = await findOrderById(args[1]);
        if (order && order.client) {
          await saveClientChatId(order.client.id, chatId, m.from?.username);
          return res.json({
            method: 'sendMessage',
            chat_id: chatId,
            text: `✅ <b>Успешно!</b>\n\nТеперь вы будете получать уведомления по заказу #${args[1].slice(0,8).toUpperCase()}.`,
            parse_mode: 'HTML',
          });
        }
      }
      return res.json({
        method: 'sendMessage',
        chat_id: chatId,
        text: '👋 Добро пожаловать в RECOVERY.UZ! Воспользуйтесь ссылкой со страницы заказа, чтобы получать уведомления.',
        parse_mode: 'HTML',
      });
    }
  } catch (err) {
    console.error('telegram webhook:', err);
  }
  res.json({ ok: true });
});

// ============================================================
// HEALTH + ERROR HANDLER + START
// ============================================================

app.get('/v1/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', db: 'connected' }); }
  catch { res.status(500).json({ status: 'error', db: 'disconnected' }); }
});

// ============================================================
// STATIC FILES + SPA FALLBACK (production: serves dist/)
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Serve static assets with long cache (hashed filenames)
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

// Serve other static files (favicon, icons, etc.)
app.use(express.static(distPath, {
  index: false, // Don't auto-serve index.html for /
  maxAge: '1h',
}));

// SPA fallback: any non-API route serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`🚀 RECOVERY.UZ backend on http://localhost:${PORT}`);
  console.log(`🗄  Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5436}/${process.env.DB_NAME || 'recovery_uz'}`);
  console.log(`🤖 Telegram bot: ${telegram.isConfigured() ? '✅ Configured' : '⚠️  Not configured'}`);
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection OK');
  } catch (err) {
    console.error('❌ Cannot connect to DB:', err.message);
  }
});
