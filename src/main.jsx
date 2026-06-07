
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A2235',
            color: '#E2E8F0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Manrope, sans-serif',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#1A2235' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#1A2235' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
