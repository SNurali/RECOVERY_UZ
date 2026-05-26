# RECOVERY.UZ Deploy Ready Checklist

## Что подготовлено

- Гостевая страница переработана как лендинг Recovery.uz.
- Добавлены реальные фото и фоновые изображения с сайта заказчика.
- Добавлены scroll-анимации секций через `framer-motion`.
- Мобильная версия усилена: компактный hero, CTA на всю ширину, адаптивная статистика.
- Добавлены SEO meta-теги, Open Graph, Twitter card, canonical и JSON-LD `LocalBusiness`.
- Новые секции гостевой страницы переведены на `ru`, `uz-lat`, `uz-cyr`, `en`.

## Локальная проверка перед деплоем

```bash
npm run build
npm test -- --run
```

## Локальный запуск

```bash
npm run db:up
npm run server
npm run dev
```

Frontend:

```text
http://localhost:5173/
```

Backend health:

```bash
curl http://localhost:3004/v1/health
```

## Деплой на сервер

Подключение выполняется через WireGuard VPN. После подключения:

```bash
cd /home/yoyo/RECOVERY_UZ
git pull origin main
npm install
npm run build
pm2 restart all
```

## Проверка после деплоя

```bash
pm2 list
pm2 logs recovery-api --lines 50
pm2 logs recovery-web --lines 50
curl http://localhost:3004/v1/health
```

В браузере проверить:

- Главная страница открывается как гостевой лендинг.
- Кнопка бесплатной диагностики ведет на `/guest/new-order`.
- Форма отслеживания принимает токен.
- Переключение языка меняет новые секции.
- Мобильная версия выглядит корректно на ширинах `375px`, `414px`, `768px`.

## Важное перед публикацией

- В репозитории есть документация с чувствительными данными. Перед публичным push желательно удалить секреты из markdown-файлов и ротировать токены/пароли.
- Если на production виден старый интерфейс, проверить cache headers, активный JS bundle в DevTools и перезапуск `recovery-web`.
