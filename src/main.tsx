import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { StoreProvider } from './lib/store'
import { captureUtm } from './lib/utm'
import './index.css'

// До первого рендера: метки кампании должны сохраниться раньше, чем человек
// уйдёт по якорю и потеряет их из адресной строки.
captureUtm()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
