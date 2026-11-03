#!/bin/sh
# nginx раздаёт статику и проксирует /blog/* и /sitemap.xml на blog-server
# (server/blog-server.mjs, localhost-only) — оба процесса в одном контейнере,
# отдельного сервиса в docker-compose ради этого заводить незачем.
#
# Падение blog-server не должно требовать ручного вмешательства: страница
# блога на минуту станет недоступна и появится снова, а не будет лежать до
# следующего деплоя. nginx — на переднем плане и держит контейнер живым;
# healthcheck контейнера (deploy/nginx.conf: /healthz) проверяет только его.
set -e

(
  while true; do
    node /app/server/blog-server.mjs || echo 'blog-server упал, перезапуск через 2с' >&2
    sleep 2
  done
) &

exec nginx -g 'daemon off;'
