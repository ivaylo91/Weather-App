import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import Widget from './Widget.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch just because the user switched tabs — our visibilitychange
      // handler in App.tsx already handles this with a 10-min stale guard.
      refetchOnWindowFocus: false,
      // Don't retry on reconnect — avoids burst on flaky networks.
      refetchOnReconnect: false,
      // One retry is enough; the default of 3 triples the API load on errors.
      retry: 1,
    },
  },
})

const isWidget = window.location.hash === '#widget'
const cityParam = new URLSearchParams(window.location.search).get('city') ?? undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {isWidget ? <Widget /> : <App initialCity={cityParam} />}
    </QueryClientProvider>
  </StrictMode>,
)
