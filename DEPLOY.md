# 🚀 RECOVERY.UZ — Инструкция по деплою

## Сервер
- **IP:** 195.158.24.137
- **Домен:** hddfix.uz
- **GitHub:** https://github.com/SNurali/RECOVERY_UZ

---

## Быстрый деплой на сервер

### 1. Подключиться к серверу
```bash
ssh yoyo@195.158.24.137
```

### 2. Клонировать новый проект
```bash
cd /home/yoyo
git clone https://github.com/SNurali/RECOVERY_UZ.git
cd RECOVERY_UZ
```

### 3. Установить зависимости
```bash
npm install --production
```

### 4. Создать .env файл
```bash
cat > .env << 'EOF'
# Telegram Bot
TELEGRAM_BOT_TOKEN=8759863943:AAHncy4_UyPHiidyTTLp5e2F9bFJCRTYqfI
TELEGRAM_CHAT_ID=-1003765182373

# API
VITE_API_URL=http://hddfix.uz:3004/v1
NODE_ENV=production
EOF
```

### 5. Собрать фронтенд
```bash
npm run build
```

### 6. Запустить сервер (PM2)
```bash
# Установить PM2 если нет
npm install -g pm2

# Запустить бэкенд
pm2 start server.js --name recovery-api

# Раздать фронтенд через nginx или serve
npm install -g serve
pm2 start "serve -s dist -l 3003" --name recovery-web

# Сохранить конфигурацию PM2
pm2 save
pm2 startup
```

### 7. Настроить Nginx (если нужно)
```nginx
# /etc/nginx/sites-available/recovery-uz
server {
    listen 80;
    server_name hddfix.uz;

    # Frontend
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /v1/ {
        proxy_pass http://localhost:3004/v1/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/recovery-uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Обновление

```bash
cd /home/yoyo/RECOVERY_UZ
git pull origin main
npm install --production
npm run build
pm2 restart all
```

---

## Порты

| Сервис | Порт |
|--------|------|
| Frontend (Vite build / serve) | 3003 |
| Backend API (server.js) | 3004 |

---

## Проверка

```bash
# API
curl http://localhost:3004/v1/orders/stats

# Frontend
curl http://localhost:3003

# Telegram test
curl -X POST http://localhost:3004/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin@hdd-fixer.uz","password":"admin123"}'
```

---

## Тестовые учётные данные

| Роль | Логин | Пароль |
|------|-------|--------|
| Админ | admin@hdd-fixer.uz | admin123 |
| Клиент | client@test.uz | client123 |
| Оператор | operator@test.uz | operator123 |
| Мастер | master1@test.uz | master123 |
