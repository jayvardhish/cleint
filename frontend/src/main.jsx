import { StrictMode } from 'react'
console.log("main.jsx script execution started");
import { createRoot } from 'react-dom/client'
import './index.css'
import 'katex/dist/katex.min.css'
import App from './App.jsx'

window.addEventListener('error', (event) => {
  console.error('GLOBAL ERROR CAUGHT:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('GLOBAL PROMISE REJECTION:', event.reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
