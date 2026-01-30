import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route , Router } from 'react-router-dom'
import ScrollToTop from './StateManagement/ScrollToTop.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
       <ScrollToTop />
    <App />
    </BrowserRouter>
  </StrictMode>,
)
