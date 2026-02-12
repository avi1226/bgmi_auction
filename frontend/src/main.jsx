import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error("Root element not found!");
} else {
    try {
        createRoot(rootElement).render(
          <StrictMode>
            <App />
          </StrictMode>,
        )
    } catch (e) {
        console.error("React render failed:", e);
        rootElement.innerHTML = `<div style="color:red; padding: 20px;">
           <h1>Application Crashed</h1>
           <pre>${e.message}</pre>
        </div>`;
    }
}
