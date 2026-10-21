import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initMetrika } from './lib/metrika'
import { StoreProvider } from './lib/store'
import { captureUtm } from './lib/utm'
import './index.css'

// До первого рендера: метки кампании должны сохраниться раньше, чем человек
// уйдёт по якорю и потеряет их из адресной строки.
captureUtm()

// Счётчик — здесь, а не в компоненте страницы: главная и страница продукта
// делят одну точку входа, и визит должен считаться на любой из них. Переходы
// между ними — обычная перезагрузка документа, поэтому досылать просмотры
// вручную не нужно: init отправит хит сам.
initMetrika()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
