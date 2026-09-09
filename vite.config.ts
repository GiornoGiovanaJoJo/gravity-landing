import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Лендинг живёт на том же домене, что и CRM: сервер отдаёт его index.html с «/»,
 * а ассеты — с префикса /site/. Без своего base сборка положила бы файлы в
 * /assets/, где уже лежит бандл самой CRM, и они бы перетёрли друг друга.
 */
export default defineConfig({
  // Standalone-деплой на собственный домен (g-neuro.space) собирается с VITE_BASE=/.
  // Дефолт оставлен прежним, чтобы встраивание в CRM продолжало работать.
  base: process.env.VITE_BASE || '/site/',
  plugins: [react(), tailwindcss()],
  resolve: {
    // fileURLToPath, а не URL.pathname: на Windows второй даёт «/C:/…» и путь ломается.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5174,
    // В разработке запросы идут на бэкенд CRM напрямую — так лендинг работает
    // с тем же origin, что и в проде, и CORS вообще не участвует.
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/public': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
