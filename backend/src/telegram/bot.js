/**
 * Telegram Bot Service for RECOVERY.UZ
 * 
 * Sends notifications to:
 * 1. Admin/operator group chat (all order events)
 * 2. Client personal chat (status updates, price notifications)
 * 
 * Environment variables:
 *   TELEGRAM_BOT_TOKEN - Bot token from @BotFather
 *   TELEGRAM_CHAT_ID   - Admin group chat ID
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const API_URL = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : '';

function isConfigured(chatId) {
  return !!(BOT_TOKEN && (chatId || ADMIN_CHAT_ID));
}

async function sendMessage(text, chatId = ADMIN_CHAT_ID, parseMode = 'HTML') {
  if (!isConfigured(chatId)) {
    console.warn('[Telegram] Bot not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error(`[Telegram] API error: ${data.description}`);
      return false;
    }

    console.log(`[Telegram] Message sent to chat: ${chatId}`);
    return true;
  } catch (error) {
    console.error('[Telegram] Failed to send message:', error.message);
    return false;
  }
}

// ===== STATUS HELPERS =====

function getStatusEmoji(status) {
  const emojis = {
    new: '🆕', accepted: '📋', diagnosing: '🔍',
    awaiting_approval: '⏳', approved: '✅', in_repair: '🔧',
    completed: '🎉', issued: '📦', cancelled: '🚫',
  };
  return emojis[status] || '📋';
}

function getStatusLabel(status) {
  const labels = {
    new: 'Новый', accepted: 'Принят', diagnosing: 'Диагностика',
    awaiting_approval: 'Ожидает согласования', approved: 'Одобрен',
    in_repair: 'В ремонте', completed: 'Готов к выдаче',
    issued: 'Выдан', cancelled: 'Отменён',
  };
  return labels[status] || status;
}

// ===== ADMIN NOTIFICATIONS =====

async function notifyNewOrder(order) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const client = order.client;
  const details = order.details || [];

  let detailsText = '';
  for (const d of details) {
    detailsText += `\n  • ${d.equipment?.name_rus || 'Оборудование'} — ${d.issue?.name_rus || 'Неисправность'}`;
  }

  const text = `
🆕 <b>НОВЫЙ ЗАКАЗ</b> #${shortId}

👤 <b>Клиент:</b> ${client?.full_name || 'Не указан'}
📱 <b>Телефон:</b> ${client?.phone || 'Не указан'}

📦 <b>Оборудование:</b>${detailsText || '\n  Не указано'}

📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}

⚠️ <b>Требуется назначение мастера!</b>
`.trim();

  await sendMessage(text);
}

async function notifyStatusChange(order, fromStatus, toStatus, actorName) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const emoji = getStatusEmoji(toStatus);

  const text = `
${emoji} <b>СТАТУС ИЗМЕНЁН</b> #${shortId}

📋 ${getStatusLabel(fromStatus)} → <b>${getStatusLabel(toStatus)}</b>
👤 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}
${actorName ? `🔧 <b>Изменил:</b> ${actorName}` : ''}
`.trim();

  await sendMessage(text);
}

async function notifyPriceSet(order, totalPrice) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
💰 <b>ЦЕНА УСТАНОВЛЕНА</b> #${shortId}

💵 <b>Сумма:</b> ${Number(totalPrice).toLocaleString('ru-RU')} UZS
👤 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}

⏳ <b>Ожидает согласования клиента</b>
`.trim();

  await sendMessage(text);
}

async function notifyPriceApproved(order) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
✅ <b>ЦЕНА ОДОБРЕНА</b> #${shortId}

💵 <b>Сумма:</b> ${Number(order.total_price_uzs || 0).toLocaleString('ru-RU')} UZS
👤 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}

🚀 <b>Можно начинать ремонт!</b>
`.trim();

  await sendMessage(text);
}

async function notifyPriceRejected(order, reason) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
❌ <b>ЦЕНА ОТКЛОНЕНА</b> #${shortId}

👤 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}
📝 <b>Причина:</b> ${reason || 'Не указана'}

🔄 <b>Требуется пересмотр цены</b>
`.trim();

  await sendMessage(text);
}

async function notifyMasterAssigned(order, master) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
👨‍🔧 <b>МАСТЕР НАЗНАЧЕН</b> #${shortId}

👤 <b>Мастер:</b> ${master?.full_name || 'Не указан'}
📱 <b>Телефон:</b> ${master?.phone || 'Не указан'}
📋 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}
`.trim();

  await sendMessage(text);
}

async function notifyOrderCompleted(order) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
🎉 <b>ЗАКАЗ ГОТОВ</b> #${shortId}

👤 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}
📱 <b>Телефон:</b> ${order.client?.phone || 'Не указан'}
💰 <b>Сумма:</b> ${Number(order.total_price_uzs || 0).toLocaleString('ru-RU')} UZS

📞 <b>Свяжитесь с клиентом для выдачи!</b>
`.trim();

  await sendMessage(text);
}

async function notifyOrderIssued(order) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
📦 <b>ЗАКАЗ ВЫДАН</b> #${shortId}

👤 <b>Клиент:</b> ${order.client?.full_name || 'Не указан'}
💰 <b>Итого:</b> ${Number(order.total_price_uzs || 0).toLocaleString('ru-RU')} UZS

✅ <b>Заказ закрыт!</b>
`.trim();

  await sendMessage(text);
}

// ===== CLIENT PERSONAL NOTIFICATIONS =====

async function notifyClientStatusChange(clientChatId, order, newStatus) {
  if (!clientChatId || !isConfigured(clientChatId)) return;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const emoji = getStatusEmoji(newStatus);

  const text = `
${emoji} <b>Обновление заказа #${shortId}</b>

Статус: <b>${getStatusLabel(newStatus)}</b>

Следите за статусом на сайте.
`.trim();

  await sendMessage(text, clientChatId);
}

async function notifyClientPriceSet(clientChatId, order, price) {
  if (!clientChatId || !isConfigured(clientChatId)) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
💰 <b>Стоимость работ по заказу #${shortId}</b>

💵 <b>Сумма:</b> ${Number(price).toLocaleString('ru-RU')} UZS

Пожалуйста, подтвердите стоимость на сайте.
`.trim();

  await sendMessage(text, clientChatId);
}

async function notifyClientOrderReady(clientChatId, order) {
  if (!clientChatId || !isConfigured(clientChatId)) return;

  const shortId = order.id.slice(0, 8).toUpperCase();

  const text = `
🎉 <b>Ваш заказ #${shortId} готов!</b>

Работы завершены. Вы можете забрать оборудование в любое рабочее время.
`.trim();

  await sendMessage(text, clientChatId);
}

// ===== WEBHOOK HANDLER =====

async function handleWebhook(update, findOrderById, findClientById, saveClient) {
  try {
    if (update.message?.text?.startsWith('/start')) {
      const message = update.message;
      const chatId = message.chat.id.toString();
      const args = message.text.split(' ');

      if (args.length > 1) {
        const orderId = args[1];
        const order = findOrderById ? findOrderById(orderId) : null;

        if (order && order.client) {
          // Link telegram chat to client
          order.client.telegram_chat_id = chatId;
          if (message.from?.username) {
            order.client.telegram = message.from.username;
          }
          if (saveClient) saveClient(order.client);

          return {
            method: 'sendMessage',
            chat_id: chatId,
            text: `✅ <b>Успешно!</b>\n\nТеперь вы будете получать уведомления по заказу #${orderId.slice(0, 8).toUpperCase()} прямо здесь.`,
            parse_mode: 'HTML',
          };
        }
      }

      return {
        method: 'sendMessage',
        chat_id: chatId,
        text: '👋 <b>Добро пожаловать в RECOVERY.UZ!</b>\n\nЧтобы получать уведомления, воспользуйтесь ссылкой со страницы вашего заказа.',
        parse_mode: 'HTML',
      };
    }
  } catch (error) {
    console.error('[Telegram] Webhook error:', error.message);
  }

  return { ok: true };
}

async function notifyGuestNewOrder(order) {
  if (!isConfigured()) return;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const clientName = order.client?.full_name || order.guest_name || 'Гость';
  const clientPhone = order.client?.phone || order.guest_phone || 'Не указан';
  const clientTelegram = order.client?.telegram || '';
  const details = order.details || [];

  let detailsText = '';
  for (const d of details) {
    detailsText += `\n  • ${d.equipment?.name_rus || 'Оборудование'} — ${d.issue?.name_rus || 'Неисправность'}`;
    if (d.notes) detailsText += `\n    📝 ${d.notes}`;
  }

  const text = `
🆕 <b>НОВЫЙ ЗАКАЗ (гость)</b> #${shortId}

👤 <b>Клиент:</b> ${clientName}
📱 <b>Телефон:</b> ${clientPhone}
${clientTelegram ? `💬 <b>Telegram:</b> @${clientTelegram.replace('@', '')}` : ''}

📦 <b>Оборудование:</b>${detailsText || '\n  Не указано'}

📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}

⚠️ <b>Требуется назначение мастера!</b>
`.trim();

  await sendMessage(text);
}

export {
  sendMessage,
  isConfigured,
  notifyNewOrder,
  notifyGuestNewOrder,
  notifyStatusChange,
  notifyPriceSet,
  notifyPriceApproved,
  notifyPriceRejected,
  notifyMasterAssigned,
  notifyOrderCompleted,
  notifyOrderIssued,
  notifyClientStatusChange,
  notifyClientPriceSet,
  notifyClientOrderReady,
  handleWebhook,
};
