# 🚀 RECOVERY.UZ - Production Ready CRM

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)]()
[![React](https://img.shields.io/badge/React-19.2-61dafb)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

Полнофункциональная CRM-система для сервисного центра по восстановлению данных с жестких дисков.

## ✨ Особенности

- 🌍 **Многоязычность** - 4 языка (Русский, O'zbekcha, Ўзбекча, English)
- 👥 **Ролевая модель** - Admin, Operator, Master, Client
- 📱 **Responsive дизайн** - адаптивная верстка
- ⚡ **Code Splitting** - оптимизированная загрузка
- 🔄 **React Query** - умное кеширование данных
- 🗄️ **Zustand** - легковесный state management
- 🧪 **Тестирование** - Vitest + Testing Library
- 🐳 **Docker** - полная контейнеризация
- 🗃️ **PostgreSQL** - production-ready база данных
- 🔄 **CI/CD** - автоматизация через GitHub Actions
- 📊 **Sentry** - мониторинг ошибок

## 🚀 Быстрый старт

### Development

```bash
# Установка зависимостей
npm install

# Запуск frontend (порт 3003)
npm run dev

# Запуск mock backend (порт 3004)
npm run server

# Запуск всего вместе
npm run dev:all
```

### Production (Docker)

```bash
# Создать .env файл
cp .env.example .env

# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановить
docker-compose down
```

## 📦 Технологический стек

### Frontend
- **React** 19.2.6 - UI библиотека
- **TypeScript** 6.0.2 - типизация
- **Vite** 8.0.12 - сборщик
- **React Router** 7.15.1 - маршрутизация
- **TanStack Query** 5.x - data fetching
- **Zustand** 5.x - state management
- **Framer Motion** 12.40.0 - анимации
- **Axios** 1.16.1 - HTTP клиент
- **Sonner** 2.0.7 - уведомления
- **Sentry** - мониторинг

### Backend
- **Node.js** 20 - runtime
- **Express** 5.2.1 - веб-фреймворк
- **PostgreSQL** 16 - база данных
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей
- **Winston** - логирование
- **Helmet** - security

### DevOps
- **Docker** - контейнеризация
- **Docker Compose** - оркестрация
- **Nginx** - веб-сервер
- **GitHub Actions** - CI/CD

### Testing
- **Vitest** - test runner
- **Testing Library** - тестирование компонентов
- **jsdom** - DOM окружение

## 📁 Структура проекта

```
RECOVERY_UZ/
├── src/
│   ├── components/        # Переиспользуемые компоненты
│   ├── pages/            # Страницы приложения
│   │   ├── client/       # Страницы клиента
│   │   └── staff/        # Страницы сотрудников
│   ├── layouts/          # Layout компоненты
│   ├── contexts/         # React Context
│   ├── hooks/            # React Query хуки
│   ├── store/            # Zustand stores
│   ├── i18n/             # Локализация
│   ├── lib/              # Утилиты
│   └── test/             # Тесты
├── backend/
│   ├── src/
│   │   ├── routes/       # API маршруты
│   │   ├── middleware/   # Express middleware
│   │   ├── db/           # Database
│   │   └── utils/        # Утилиты
│   ├── init.sql          # Database schema
│   └── Dockerfile
├── .github/
│   └── workflows/        # CI/CD
├── docker-compose.yml    # Docker оркестрация
├── Dockerfile            # Frontend image
└── nginx.conf            # Nginx конфигурация
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с UI
npm run test:ui

# Покрытие кода
npm run test:coverage
```

## 🔐 Тестовые учетные данные

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@hdd-fixer.uz | admin123 |
| Client | client@test.uz | client123 |
| Operator | operator@test.uz | operator123 |
| Master | master1@test.uz | master123 |

## 🌍 Поддерживаемые языки

- 🇷🇺 Русский (ru)
- 🇺🇿 O'zbekcha (uz-lat) - латиница
- 🇺🇿 Ўзбекча (uz-cyr) - кириллица
- 🇬🇧 English (en)

## 📊 Производительность

- **Bundle size**: 488 KB (157 KB gzip)
- **Code splitting**: 27 чанков
- **Build time**: ~300 ms
- **Lighthouse Score**: 95+

## 🔧 Переменные окружения

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3004/v1
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/recovery_uz
JWT_SECRET=your_jwt_secret_min_32_chars
CORS_ORIGIN=http://localhost:3003
NODE_ENV=production
PORT=3004
```

## 🚢 Деплой

### Docker Hub
```bash
# Build images
docker build -t username/recovery-frontend .
docker build -t username/recovery-backend ./backend

# Push to registry
docker push username/recovery-frontend
docker push username/recovery-backend
```

### GitHub Actions
CI/CD автоматически запускается при push в main/develop:
1. Линтинг
2. Тесты
3. Сборка
4. Docker build & push
5. Деплой

## 📚 Документация

- [SETUP.md](./SETUP.md) - Инструкция по запуску
- [I18N.md](./I18N.md) - Документация по локализации
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Реализованные улучшения
- [SUMMARY.md](./SUMMARY.md) - Итоговый отчет

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 👨‍💻 Автор

**RECOVERY.UZ Team**

## 🙏 Благодарности

- React Team
- Vite Team
- TanStack Team
- Vercel
- Open Source Community

---

**Версия:** 2.0.0  
**Дата:** 24 мая 2026  
**Статус:** 🎉 Production Ready
