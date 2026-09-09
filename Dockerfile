# syntax=docker/dockerfile:1

# ── Сборка ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Самостоятельный сайт лежит в корне домена, а не под /site/ внутри CRM.
ARG VITE_BASE=/
# Кнопки «Войти» и «Начать бесплатно» ведут в CRM абсолютным адресом.
ARG VITE_APP_URL=https://crm.gravityrpa.ru
# Пусто = тот же origin: /api/* и /public/* уводит наш nginx (deploy/nginx.conf).
ARG VITE_API_URL=
ENV VITE_BASE=$VITE_BASE VITE_APP_URL=$VITE_APP_URL VITE_API_URL=$VITE_API_URL

# npm run build = tsc -b && vite build. Сборка идёт на раннере GitHub, где
# памяти хватает, поэтому проверку типов не выносим (в отличие от CRM, где
# tsc падал по OOM прямо на сервере).
RUN npm run build

# ── Рантайм ───────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# ca-certificates — проверка сертификата crm.gravityrpa.ru при proxy_pass;
# curl — для HEALTHCHECK.
RUN apk add --no-cache ca-certificates curl

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Каталог кэша ответов CRM (см. proxy_cache_path). nginx -t на этапе сборки:
# ошибка в конфиге валит CI, а не прод.
RUN mkdir -p /var/cache/nginx/crm && nginx -t

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
