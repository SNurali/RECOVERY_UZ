import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as telegram from './backend/src/telegram/bot.js';

const app = express();
const PORT = 3004;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers['x-forwarded-for'] || req.ip}`);
  next();
});

// Mock databases
const users = [
  { id: '1', login: 'admin@hdd-fixer.uz', password: 'admin123', role: 'admin', full_name: 'Акмаль Абдуллаев (Админ)', phone: '+998 90 123-45-67', email: 'admin@hdd-fixer.uz' },
  { id: '2', login: 'client@test.uz', password: 'client123', role: 'client', full_name: 'Нурбек Алимов', phone: '+998 99 888-77-66', email: 'client@test.uz', telegram_chat_id: '123456789' },
  { id: '3', login: 'operator@test.uz', password: 'operator123', role: 'operator', full_name: 'Озода Каримова', phone: '+998 90 987-65-43', email: 'operator@test.uz' },
  { id: '4', login: 'master1@test.uz', password: 'master123', role: 'master', full_name: 'Дониёр Юсупов', phone: '+998 93 111-22-33', email: 'master1@test.uz' },
  { id: '5', login: 'master2@test.uz', password: 'master123', role: 'master', full_name: 'Джасур Усманов', phone: '+998 93 444-55-66', email: 'master2@test.uz' },
  { id: '6', login: 'client2@test.uz', password: 'client123', role: 'client', full_name: 'Фарход Рахимов', phone: '+998 91 222-33-44', email: 'client2@test.uz', telegram_chat_id: null },
  { id: '7', login: 'client3@test.uz', password: 'client123', role: 'client', full_name: 'Дилноза Хасанова', phone: '+998 97 555-66-77', email: 'client3@test.uz', telegram_chat_id: '987654321' },
  { id: '8', login: 'client4@test.uz', password: 'client123', role: 'client', full_name: 'Бахтиёр Мирзаев', phone: '+998 94 777-88-99', email: null, telegram_chat_id: null }
];

const equipments = [
  { id: 'eq1', name_rus: 'Жесткий диск HDD 3.5"', name_cyr: 'Қаттиқ диск HDD 3.5"', name_lat: 'Qattiq disk HDD 3.5"', name_eng: 'Hard Drive HDD 3.5"' },
  { id: 'eq2', name_rus: 'Твердотельный накопитель SSD', name_cyr: 'Тезкор хотира SSD', name_lat: 'Tezkor xotira SSD', name_eng: 'Solid State Drive SSD' },
  { id: 'eq3', name_rus: 'Внешний жесткий диск', name_cyr: 'Ташқи қаттиқ диск', name_lat: 'Tashqi qattiq disk', name_eng: 'External HDD' }
];

const issues = [
  { id: 'iss1', name_rus: 'Не определяется в BIOS', name_cyr: 'BIOS-да аниқланмаяпти', name_lat: 'BIOS-da aniqlanmayapti', name_eng: 'Not detected in BIOS' },
  { id: 'iss2', name_rus: 'Стук внутри гермоблока', name_cyr: 'Гермоблок ичида тақиллаш', name_lat: 'Germoblok ichida taqillash', name_eng: 'Clicking sound inside HDA' },
  { id: 'iss3', name_rus: 'Случайное удаление файлов', name_cyr: 'Файлларнинг тасодифий ўчирилиши', name_lat: 'Fayllarning tasodifiy o\'chirilishi', name_eng: 'Accidental file deletion' }
];

const services = [
  { id: 'srv1', name_rus: 'Восстановление данных с магнитных пластин', name_cyr: 'Магнит пластиналардан маълумотларни тиклаш', name_lat: 'Magnit plastinalardan ma\'lumotlarni tiklash', name_eng: 'Data recovery from magnetic platters' },
  { id: 'srv2', name_rus: 'Замена блока магнитных головок', name_cyr: 'Магнит каллаклар блокини алмаштириш', name_lat: 'Magnit kallaklar blokini almashtirish', name_eng: 'Heads stack assembly replacement' },
  { id: 'srv3', name_rus: 'Ремонт платы контроллера', name_cyr: 'Контроллер платасини таъмирлаш', name_lat: 'Kontroller platasini ta\'mirlash', name_eng: 'PCB repair' }
];

const orders = [
  {
    id: 'ord1',
    order_date: new Date().toISOString(),
    status: 'diagnosing',
    price_approved_at: null,
    price_rejected_at: null,
    total_price_uzs: 1500000,
    total_paid_uzs: 0,
    client: users[1],
    details: [
      {
        id: 'det1',
        serial_number: 'WD-WCC7K4PZ9',
        equipment: equipments[0],
        issue: issues[0],
        service: services[0],
        price_uzs: 1500000,
        attached_to: '4',
        master: users[3]
      }
    ]
  },
  {
    id: 'ord2',
    order_date: new Date(Date.now() - 86400000).toISOString(),
    status: 'awaiting_approval',
    price_approved_at: null,
    price_rejected_at: null,
    total_price_uzs: 2500000,
    total_paid_uzs: 0,
    client: users[1],
    details: [
      {
        id: 'det2',
        serial_number: 'SN-SSD-970EVO',
        equipment: equipments[1],
        issue: issues[1],
        service: services[1],
        price_uzs: 2500000,
        attached_to: '5',
        master: users[4]
      }
    ]
  }
];

// Helper to check token / current user simulation
let currentUser = null; // No user logged in by default

// Auth endpoints
app.post('/v1/auth/login', (req, res) => {
  const { login, password } = req.body;
  const user = users.find(u => u.login === login && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }
  
  currentUser = user;
  const { password: _, ...userWithoutPassword } = user;
  res.json({ data: { user: userWithoutPassword, token: 'mock-jwt-token-' + user.id } });
});

app.post('/v1/auth/logout', (req, res) => {
  currentUser = null;
  res.json({ message: 'Logged out' });
});

// User endpoints
app.get('/v1/users/me', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  const { password: _, ...userWithoutPassword } = currentUser;
  res.json(userWithoutPassword);
});

app.get('/v1/users/masters', (req, res) => {
  const masters = users.filter(u => u.role === 'master');
  res.json({ data: masters });
});

app.get('/v1/users', (req, res) => {
  res.json({ data: users });
});

app.post('/v1/users', (req, res) => {
  const newUser = {
    id: String(users.length + 1),
    ...req.body
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user (change role, etc.)
app.patch('/v1/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }
  Object.assign(user, req.body);
  res.json({ data: user });
});

// Directory endpoints
app.get('/v1/equipments', (req, res) => {
  res.json({ data: equipments });
});

app.post('/v1/equipments', (req, res) => {
  const newEq = { id: 'eq' + (equipments.length + 1), ...req.body };
  equipments.push(newEq);
  res.status(201).json(newEq);
});

app.patch('/v1/equipments/:id', (req, res) => {
  const item = equipments.find(e => e.id === req.params.id);
  if (item) Object.assign(item, req.body);
  res.json(item);
});

app.delete('/v1/equipments/:id', (req, res) => {
  const index = equipments.findIndex(e => e.id === req.params.id);
  if (index !== -1) equipments.splice(index, 1);
  res.json({ success: true });
});

app.get('/v1/issues', (req, res) => {
  res.json({ data: issues });
});

app.post('/v1/issues', (req, res) => {
  const newIss = { id: 'iss' + (issues.length + 1), ...req.body };
  issues.push(newIss);
  res.status(201).json(newIss);
});

app.patch('/v1/issues/:id', (req, res) => {
  const item = issues.find(e => e.id === req.params.id);
  if (item) Object.assign(item, req.body);
  res.json(item);
});

app.delete('/v1/issues/:id', (req, res) => {
  const index = issues.findIndex(e => e.id === req.params.id);
  if (index !== -1) issues.splice(index, 1);
  res.json({ success: true });
});

app.get('/v1/services', (req, res) => {
  res.json({ data: services });
});

app.post('/v1/services', (req, res) => {
  const newSrv = { id: 'srv' + (services.length + 1), ...req.body };
  services.push(newSrv);
  res.status(201).json(newSrv);
});

app.patch('/v1/services/:id', (req, res) => {
  const item = services.find(e => e.id === req.params.id);
  if (item) Object.assign(item, req.body);
  res.json(item);
});

app.delete('/v1/services/:id', (req, res) => {
  const index = services.findIndex(e => e.id === req.params.id);
  if (index !== -1) services.splice(index, 1);
  res.json({ success: true });
});

// Clients endpoints
app.get('/v1/clients', (req, res) => {
  const clients = users.filter(u => u.role === 'client');
  res.json({ data: clients });
});

app.post('/v1/clients', (req, res) => {
  const newClient = {
    id: String(users.length + 1),
    role: 'client',
    ...req.body
  };
  users.push(newClient);
  res.status(201).json(newClient);
});

// Dashboard stats endpoint
app.get('/v1/orders/stats', (req, res) => {
  const activeStatuses = ['diagnosing', 'awaiting_approval', 'approved', 'in_repair'];
  const completedStatuses = ['completed', 'issued'];
  res.json({
    data: {
      total: orders.length,
      in_repair: orders.filter(o => activeStatuses.includes(o.status)).length,
      completed_today: orders.filter(o => completedStatuses.includes(o.status)).length
    }
  });
});

// List orders endpoint
app.get('/v1/orders/list', (req, res) => {
  // If current user is a client, only return their orders
  if (currentUser && currentUser.role === 'client') {
    const clientOrders = orders.filter(o => o.client?.id === currentUser.id);
    return res.json({ data: clientOrders });
  }
  res.json({ data: orders });
});

app.get('/v1/orders', (req, res) => {
  if (currentUser && currentUser.role === 'client') {
    const clientOrders = orders.filter(o => o.client?.id === currentUser.id);
    return res.json({ data: clientOrders });
  }
  res.json({ data: orders });
});

app.post('/v1/orders', (req, res) => {
  const { details } = req.body;
  const newOrder = {
    id: 'ord' + (orders.length + 1),
    order_date: new Date().toISOString(),
    status: 'new',
    price_approved_at: null,
    price_rejected_at: null,
    total_price_uzs: 0,
    total_paid_uzs: 0,
    client: currentUser?.role === 'client' ? currentUser : users.find(u => u.role === 'client'),
    details: details.map((d, idx) => ({
      id: 'det_' + Date.now() + '_' + idx,
      serial_number: d.serial_number || '',
      equipment: equipments.find(e => e.id === d.equipment_id) || equipments[0],
      issue: issues.find(i => i.id === d.issue_id) || issues[0],
      price_uzs: 0,
      attached_to: null,
      master: null
    }))
  };
  orders.push(newOrder);
  
  // Telegram notification
  telegram.notifyNewOrder(newOrder);
  
  res.status(201).json({ data: newOrder });
});

// Get order details
app.get('/v1/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }
  res.json({ data: order });
});

// Allowed status transitions
app.get('/v1/orders/:id/allowed-transitions', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }
  
  // Custom mock state machine transitions
  let transitions = [];
  if (order.status === 'new') transitions = ['accepted'];
  else if (order.status === 'accepted') transitions = ['diagnosing'];
  else if (order.status === 'diagnosing') transitions = ['awaiting_approval'];
  else if (order.status === 'awaiting_approval') transitions = ['approved'];
  else if (order.status === 'approved') transitions = ['in_repair'];
  else if (order.status === 'in_repair') transitions = ['completed'];
  
  res.json({ transitions });
});

// Update order status
app.patch('/v1/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }
  const fromStatus = order.status;
  order.status = req.body.status;
  
  // Telegram notifications
  telegram.notifyStatusChange(order, fromStatus, req.body.status, currentUser?.full_name);
  if (order.client?.telegram_chat_id) {
    telegram.notifyClientStatusChange(order.client.telegram_chat_id, order, req.body.status);
  }
  if (req.body.status === 'completed') {
    telegram.notifyOrderCompleted(order);
    if (order.client?.telegram_chat_id) {
      telegram.notifyClientOrderReady(order.client.telegram_chat_id, order);
    }
  }
  
  res.json({ data: order });
});

// Assign master to detail
app.post('/v1/orders/:id/details/:detailId/assign', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  
  const detail = order.details.find(d => d.id === req.params.detailId);
  if (!detail) return res.status(404).json({ message: 'Услуга не найдена' });
  
  const master = users.find(u => u.id === req.body.master_id);
  detail.attached_to = req.body.master_id;
  detail.master = master || null;
  
  // Telegram notification
  telegram.notifyMasterAssigned(order, master);
  
  res.json({ data: order });
});

// Set / Update price
const handleSetPrice = (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  
  const { details } = req.body;
  let total = 0;
  
  details.forEach((item) => {
    const detail = order.details.find(d => d.id === item.detail_id);
    if (detail) {
      detail.price_uzs = Number(item.price);
    }
  });

  order.details.forEach(d => {
    total += d.price_uzs || 0;
  });
  order.total_price_uzs = total;
  
  // Telegram notifications
  telegram.notifyPriceSet(order, total);
  if (order.client?.telegram_chat_id) {
    telegram.notifyClientPriceSet(order.client.telegram_chat_id, order, total);
  }
  
  res.json({ data: order });
};

app.post('/v1/orders/:id/set-price', handleSetPrice);
app.post('/v1/orders/:id/update-price', handleSetPrice);

// Client approve price
app.post('/v1/orders/:id/approve-price', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  
  order.price_approved_at = new Date().toISOString();
  order.status = 'approved';
  
  // Telegram notification
  telegram.notifyPriceApproved(order);
  
  res.json({ data: order });
});

// Client reject price
app.post('/v1/orders/:id/reject-price', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  
  order.price_rejected_at = new Date().toISOString();
  order.status = 'cancelled';
  
  // Telegram notification
  telegram.notifyPriceRejected(order, req.body.reason);
  
  res.json({ data: order });
});

// Close order
app.post('/v1/orders/:id/close', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });
  
  order.status = 'issued';
  order.total_paid_uzs = order.total_price_uzs;
  
  // Telegram notification
  telegram.notifyOrderIssued(order);
  
  res.json({ data: order });
});

// Track order by token
app.get('/v1/orders/track/:token', (req, res) => {
  const order = orders.find(o => o.id === req.params.token || o.id.toLowerCase() === req.params.token.toLowerCase());
  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден. Проверьте код отслеживания.' });
  }
  res.json({ data: order });
});

// Guest order creation (no auth required)
app.post('/v1/guest/orders', (req, res) => {
  const { client_name, phone, telegram: clientTelegram, equipment_id, issue_id, notes } = req.body;
  
  if (!client_name || !phone) {
    return res.status(400).json({ message: 'Имя и телефон обязательны' });
  }
  
  // Find or create guest client
  let guestClient = users.find(u => u.phone === phone && u.role === 'client');
  if (!guestClient) {
    guestClient = {
      id: String(users.length + 1),
      login: phone,
      password: 'guest123',
      role: 'client',
      full_name: client_name || 'Гость',
      phone: phone || '',
      email: null,
      telegram: clientTelegram || null,
      telegram_chat_id: null
    };
    users.push(guestClient);
  } else {
    // Update name and telegram if provided
    if (client_name) guestClient.full_name = client_name;
    if (clientTelegram) guestClient.telegram = clientTelegram;
  }
  
  const newOrder = {
    id: 'ord' + (orders.length + 1),
    order_date: new Date().toISOString(),
    status: 'new',
    price_approved_at: null,
    price_rejected_at: null,
    total_price_uzs: 0,
    total_paid_uzs: 0,
    client: guestClient,
    guest_name: client_name,
    guest_phone: phone,
    details: [{
      id: 'det_' + Date.now(),
      serial_number: '',
      equipment: equipments.find(e => e.id === equipment_id) || equipments[0],
      issue: issues.find(i => i.id === issue_id) || issues[0],
      notes: notes || '',
      price_uzs: 0,
      attached_to: null,
      master: null
    }]
  };
  orders.push(newOrder);
  
  // Telegram notification to admin group
  telegram.notifyNewOrder(newOrder);
  
  // If client has telegram_chat_id, notify them directly
  if (guestClient.telegram_chat_id) {
    const shortId = newOrder.id.slice(0, 8).toUpperCase();
    telegram.notifyClientStatusChange(guestClient.telegram_chat_id, newOrder, 'new');
  }
  
  res.status(201).json({ data: newOrder });
});

// Client register
app.post('/v1/auth/register', (req, res) => {
  const { full_name, phone, email, password } = req.body;
  
  if (users.find(u => u.login === phone || u.login === email)) {
    return res.status(409).json({ message: 'Пользователь с таким телефоном или email уже существует' });
  }
  
  const newUser = {
    id: String(users.length + 1),
    login: email || phone,
    password,
    role: 'client',
    full_name,
    phone,
    email: email || null,
    telegram_chat_id: null
  };
  users.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ data: { user: userWithoutPassword, message: 'Регистрация успешна' } });
});

// Create order without auth (guest creates, gets assigned to first client)
app.post('/v1/orders/guest', (req, res) => {
  const { client_name, phone, equipment_id, issue_id, notes } = req.body;
  
  // Find or create guest client
  let guestClient = users.find(u => u.phone === phone && u.role === 'client');
  if (!guestClient) {
    guestClient = {
      id: String(users.length + 1),
      login: phone,
      password: 'guest123',
      role: 'client',
      full_name: client_name || 'Гость',
      phone: phone || '',
      email: null,
      telegram_chat_id: null
    };
    users.push(guestClient);
  }
  
  const newOrder = {
    id: 'ord' + (orders.length + 1),
    order_date: new Date().toISOString(),
    status: 'new',
    price_approved_at: null,
    price_rejected_at: null,
    total_price_uzs: 0,
    total_paid_uzs: 0,
    client: guestClient,
    details: [{
      id: 'det_' + Date.now(),
      serial_number: '',
      equipment: equipments.find(e => e.id === equipment_id) || equipments[0],
      issue: issues.find(i => i.id === issue_id) || issues[0],
      notes: notes || '',
      price_uzs: 0,
      attached_to: null,
      master: null
    }]
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
});

// Telegram webhook endpoint
app.post('/v1/telegram/webhook', async (req, res) => {
  const result = await telegram.handleWebhook(
    req.body,
    (orderId) => orders.find(o => o.id === orderId),
    (clientId) => users.find(u => u.id === clientId),
    (client) => { /* client already mutated in-memory */ }
  );
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Mock backend server running on http://localhost:${PORT}`);
  console.log(`📝 Test credentials:`);
  console.log(`   Admin: admin@hdd-fixer.uz / admin123`);
  console.log(`   Client: client@test.uz / client123`);
  console.log(`   Operator: operator@test.uz / operator123`);
  console.log(`\n🤖 Telegram bot: ${telegram.isConfigured() ? '✅ Configured' : '⚠️  Not configured (set TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID)'}`);
});
