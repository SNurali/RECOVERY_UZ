# RECOVERY.UZ - Инструкция по запуску

## Проблемы решены ✅

1. ✅ Backend сервер создан и запущен на порту 3004
2. ✅ Исправлено предупреждение autocomplete в форме логина
3. ✅ API endpoints работают корректно

## Запуск проекта

### 1. Backend сервер (порт 3004)

```bash
cd /home/mrnurali/RECOVERY_UZ
node server.js
```

Или в фоновом режиме:
```bash
setsid node server.js > server.log 2>&1 < /dev/null &
```

### 2. Frontend (порт 3003)

```bash
npm run dev -- --port 3003
```

### 3. Запустить всё одной командой

```bash
npm run dev:all
```

## Тестовые учетные данные

### Администратор
- **Email:** admin@hdd-fixer.uz
- **Пароль:** admin123

### Клиент
- **Email:** client@test.uz
- **Пароль:** client123

### Сотрудник
- **Email:** staff@test.uz
- **Пароль:** staff123

## API Endpoints

- `POST /v1/auth/login` - Вход в систему
- `POST /v1/auth/logout` - Выход
- `GET /v1/users/me` - Получить текущего пользователя
- `GET /v1/orders` - Список заказов
- `POST /v1/orders` - Создать заказ
- `GET /v1/orders/:id` - Получить заказ по ID

## Проверка работы

```bash
# Проверить backend
curl http://localhost:3004/v1/users/me

# Проверить login
curl -X POST http://localhost:3004/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin@hdd-fixer.uz","password":"admin123"}'
```

## Управление сервером

### Остановить backend
```bash
pkill -f "node server.js"
```

### Проверить статус
```bash
ps aux | grep "node server.js"
lsof -i :3004
```

### Просмотр логов
```bash
tail -f server.log
```

## Текущий статус

✅ Backend запущен (PID: 45147)
✅ Frontend доступен на http://localhost:3003
✅ API доступен на http://localhost:3004

## Следующие шаги

1. Откройте http://localhost:3003 в браузере
2. Войдите используя тестовые данные
3. Ошибка `ERR_CONNECTION_REFUSED` больше не должна появляться
4. Предупреждение autocomplete исправлено

## Файлы проекта

- `server.js` - Mock backend сервер
- `src/lib/api.ts` - Axios конфигурация (порт 3004)
- `src/pages/LoginPage.tsx` - Форма входа (исправлен autocomplete)
- `package.json` - Добавлены скрипты `server` и `dev:all`
