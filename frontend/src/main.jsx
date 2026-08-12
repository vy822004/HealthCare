import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import axios from 'axios'

// Point all frontend API requests to the live Vercel Backend URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)