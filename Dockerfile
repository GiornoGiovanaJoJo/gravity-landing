# syntax=docker/dockerfile:1

# ── Сборка ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Самостоятельный сайт лежит в корне домена, а не под /site/ внутри CRM.
ARG VITE_BASE=/
# Кнопки «Войти» и «Попробовать» ведут в кабинет G-Neuro абсолютным адресом.
# Это брендовый хост компании, а не общий вход платформы: посетитель сайта
# студии должен попадать в её пространство, а не на титульную crm.gravityrpa.ru.
ARG VITE_APP_URL=https://g-neuro.gravityrpa.ru
# Пусто = тот же origin: /api/* и /public/* уводит наш nginx (deploy/nginx.conf).
ARG VITE_API_URL=
# Счётчик Яндекс.Метрики. Номер живёт здесь, а не в переменных репозитория: он
# выдан сайту один раз и меняется не чаще смены домена, а вот отсутствие его в
# сборке заметно только по пустой статистике — то есть сильно позже деплоя.
ARG VITE_YM_ID=113678401
ENV VITE_BASE=$VITE_BASE VITE_APP_URL=$VITE_APP_URL VITE_API_URL=$VITE_API_URL VITE_YM_ID=$VITE_YM_ID

# npm run build = tsc -b && vite build. Сборка идёт на раннере GitHub, где
# памяти хватает, поэтому проверку типов не выносим (в отличие от CRM, где
# tsc падал по OOM прямо на сервере).
RUN npm run build

# ── Рантайм ───────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# ca-certificates — проверка сертификата crm.gravityrpa.ru при proxy_pass;
# curl — для HEALTHCHECK; nodejs — для blog-server.mjs (рендерит /blog/* на
# лету, см. deploy/start.sh): блог должен показывать статью сразу после
# публикации в CRM, а не после следующего передеплоя сайта.
RUN apk add --no-cache ca-certificates curl nodejs

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/start.sh /start.sh
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/server /app/server
COPY --from=build /app/node_modules/marked /app/node_modules/marked

ENV DIST_DIR=/usr/share/nginx/html \
    BLOG_SERVER_PORT=8787 \
    BLOG_API_URL=https://crm.gravityrpa.ru/api/public/blog \
    SITE_URL=https://g-neuro.space \
    VITE_BASE=/

# Каталог кэша ответов CRM (см. proxy_cache_path). nginx -t на этапе сборки:
# ошибка в конфиге валит CI, а не прод.
RUN mkdir -p /var/cache/nginx/crm && chmod +x /start.sh && nginx -t

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1/healthz || exit 1

CMD ["/start.sh"]
