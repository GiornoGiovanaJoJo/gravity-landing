# gravity-landing

Лендинг студии **GNERO** и продукта **Gravity RPA** — React 19 + Vite + Tailwind v4.
Собственного бэкенда нет: контент, брендинг и приём заявок берутся у CRM Gravity RPA.

Прод: **https://g-neuro.space** (VPS Jino, Docker + nginx).

## Разработка

```bash
npm ci
npm run dev        # http://localhost:5174
```

Запросы `/api/*` и `/public/*` в dev проксируются на `http://localhost:4000` —
локально поднятый сервер CRM (`gravity-rpa-crm/server`). Без него сайт работает
на встроенном контенте из `src/content.ts`.

## Связь с Gravity RPA

Вся интеграция — в `src/lib/api.ts`. Ошибки намеренно проглатываются: если CRM
недоступна, страница остаётся на дефолтном контенте.

| Что | Запрос |
|---|---|
| Контент, отредактированный в админке платформы | `GET /api/public/landing` |
| Брендинг по текущему домену (`landingEnabled`) | `GET /api/public/branding?host=` |
| Отправка заявки через конструктор форм | `POST /api/public/forms/{slug}/submit` |
| Логотипы и аватары из админки | `GET /public/landing-media/:file` |

Контент редактируется в CRM: **/platform-admin → «Титульный сайт»**. Структура
документа описана в `src/types.ts` — это зеркало zod-схемы
`server/src/modules/landing/schema.ts` на стороне CRM.

Чтобы форма заявки заработала, в CRM нужно создать форму (раздел «Формы») с
полями `name`, `phone`, `email`, `comment` и вписать её slug в `brand.formSlug`
(в админке либо в `src/content.ts`). Без slug `submitLead` возвращает
`not-configured` и показывает контакты вместо отправки.

## Переменные окружения

Все три — **build-time**: вшиваются в бандл, менять без пересборки нельзя.

| Переменная | Пусто (по умолчанию) | Значение в проде |
|---|---|---|
| `VITE_BASE` | `/site/` — сборка встраивается в CRM, которая отдаёт `index.html` с `/`, а ассеты с `/site/` | `/` — сайт в корне своего домена |
| `VITE_APP_URL` | относительные `/login`, `/register` | `https://crm.gravityrpa.ru` |
| `VITE_API_URL` | тот же origin | пусто (запросы уводит nginx) |

## Сборка

```bash
npm run build                  # dist/ для встраивания в CRM (base=/site/)
VITE_BASE=/ npm run build      # dist/ для самостоятельного домена
```

## Деплой

Push в `main` → GitHub Actions:

1. `ci.yml` — `tsc -b && vite build` плюс сборка образа (заодно `nginx -t`).
2. `deploy.yml` — собирает образ с прод-значениями, `docker save | gzip`,
   передаёт по SSH на VPS, `docker load`, `docker compose up -d`, смоук-тест.

Образ не проходит через реестр намеренно: сервер российский, а Docker Hub
оттуда отдаёт `429` нестабильно. При `docker save` все слои, включая
`nginx:alpine`, едут внутри архива — серверу реестр не нужен вообще.

На сервере (`/opt/gravity-landing`) лежит `deploy/docker-compose.yml`; контейнер
слушает `:80`, TLS терминирует прокси Jino.

Откат:

```bash
ssh -p 49259 root@ffb2b3310f06.vps.myjino.ru
cd /opt/gravity-landing
docker tag gravity-landing:previous gravity-landing:latest
docker compose up -d
```

### Секреты и переменные репозитория

| Secret | Назначение |
|---|---|
| `VPS_HOST`, `VPS_USER`, `VPS_SSH_PORT` | доступ по SSH |
| `VPS_SSH_KEY` | приватный ed25519-ключ деплоя |
| `VPS_DEPLOY_PATH` | `/opt/gravity-landing` |

| Variable | Значение |
|---|---|
| `VITE_APP_URL` | `https://crm.gravityrpa.ru` |
| `SITE_HOST` | `g-neuro.space` |
| `SITE_IP` | `195.161.62.56` |

## nginx

`deploy/nginx.conf` — один `default_server`, принимающий любой `Host` (домен,
`www`, выделенный IP, техническое имя VPS). Помимо статики и SPA-fallback он:

- проксирует `/api/*` и `/public/*` в CRM, чтобы для браузера всё было одним
  origin и CORS не участвовал;
- кэширует публичные GET-ответы CRM на 60 секунд. Это не оптимизация:
  публичные эндпоинты CRM висят на общем лимитере (120 запросов в минуту на IP),
  а через прокси все посетители приходят с одного адреса — без кэша сайт выел бы
  лимит и уронил чужие вебхуки;
- уводит `/login` и `/register` в CRM — страховка на случай относительного
  редиректа из `src/App.tsx`.
