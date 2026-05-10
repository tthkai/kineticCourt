import React from 'react'
import { createRoot } from 'react-dom/client'
import AppRoot from './AppRoot.jsx' 
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  </React.StrictMode>,
)
