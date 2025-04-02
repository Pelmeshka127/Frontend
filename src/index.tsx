import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/index.css'
import App from './modules/app/App.tsx'
import UsersList from './modules/api/getinfo.tsx'

// Создаём QueryClient
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UsersList />
    </QueryClientProvider>
  </React.StrictMode>
)
