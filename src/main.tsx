import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAmplitude } from './utils/amplitude';

// Inicializar Amplitude antes de montar la app
// Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2#initialize-the-sdk
initAmplitude();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
