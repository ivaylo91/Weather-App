import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import Widget from './Widget.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
})

const hash = window.location.hash            // e.g. '#widget' or '#widget&size=lg'
const hashParams = new URLSearchParams(hash.slice(1).replace(/^widget/, ''))
const isWidget = hash.startsWith('#widget')
const widgetSize = (hashParams.get('size') ?? 'md') as 'sm' | 'md' | 'lg'
const cityParam = new URLSearchParams(window.location.search).get('city') ?? undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {isWidget ? <Widget size={widgetSize} /> : <App initialCity={cityParam} />}
    </QueryClientProvider>
  </StrictMode>,
)
