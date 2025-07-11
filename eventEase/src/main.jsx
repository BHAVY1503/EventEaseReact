import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // IMPORTANT
// import './index.css';     // Tailwind styles
// import './custom.css';    // Your overrides or custom styles
import 'mapbox-gl/dist/mapbox-gl.css';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>

  </StrictMode>,
)
