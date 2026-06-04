import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import Widget from './Widget.tsx'

const queryClient = new QueryClient()
const isWidget = window.location.hash === '#widget'
const cityParam = new URLSearchParams(window.location.search).get('city') ?? undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {isWidget ? <Widget /> : <App initialCity={cityParam} />}
    </QueryClientProvider>
  </StrictMode>,
)
