import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAmplitude, fetchFeatureVariants } from './utils/amplitude';

// Inicializar Amplitude
initAmplitude();

// Cargar los feature flags ANTES de montar la app
fetchFeatureVariants().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
