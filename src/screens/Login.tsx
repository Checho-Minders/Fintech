import React from 'react';
import { Screen } from '../types';
import { trackOnboardingStarted, trackLoginSubmitted } from '../utils/amplitude';

export function LoginScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <div className="absolute w-[300px] h-[300px] bg-brand-orange/5 blur-[120px] -top-20 -right-20 rounded-full pointer-events-none"></div>
      
      <aside className="hidden md:flex md:w-[42%] bg-brand-sidebar border-r border-brand-border flex-col justify-between p-12 relative z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Minders<span className="text-brand-orange">Pay</span></h2>
        </div>
        <div className="max-w-sm">
          <h1 className="text-[38px] font-bold leading-[1.2] tracking-[-1.5px] text-white mb-8">Cada inicio de sesión, tu dinero más seguro.</h1>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center shrink-0 text-brand-orange">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">PIN + Biometría</h4>
                <p className="text-brand-gray text-xs mt-1">Acceso ultra seguro con reconocimiento facial o huella digital.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center shrink-0 text-brand-orange">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Autenticación 2FA</h4>
                <p className="text-brand-gray text-xs mt-1">Doble capa de protección para todas tus transacciones críticas.</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-brand-gray text-[11px]">Tu dinero, en control total. © 2026 Minders Pay LATAM.</p>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px]">
          <div className="md:hidden flex items-center gap-1 text-xl font-bold tracking-tight mb-12 text-white">
            Minders<span className="text-brand-orange">Pay</span>
          </div>
          <header className="mb-10">
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Bienvenido de nuevo</h1>
            <p className="text-brand-gray text-sm">Ingresa tus datos para acceder a tu panel financiero.</p>
          </header>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); trackLoginSubmitted('credentials'); navigate('dashboard'); }}>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">Celular o Email</label>
              <input type="text" placeholder="Ej: +54 9 11 2345-6789" className="w-full h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">Contraseña</label>
                <a href="#" className="text-brand-orange text-xs font-medium hover:underline">¿La olvidaste?</a>
              </div>
              <input type="password" placeholder="••••••••" className="w-full h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" />
            </div>
            <button type="submit" className="w-full h-11 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
              Iniciar sesión
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 border-b border-brand-border"></div>
              <span className="text-brand-gray text-xs font-medium">o</span>
              <div className="flex-1 border-b border-brand-border"></div>
            </div>
            <button type="button" onClick={() => { trackLoginSubmitted('biometric'); navigate('dashboard'); }} className="w-full h-11 bg-brand-card border border-brand-border hover:border-brand-gray text-brand-gray hover:text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.22 0 2.383.218 3.46.616m.835 3.193a10.047 10.047 0 011.104 1.991m-6.577 4.076l1.22-.999c.83-.68 2.02-.603 2.754.17l.01.01a2.123 2.123 0 01.437 1.252 2.226 2.226 0 01-.368 1.328l-1.246 1.664m-2.858-4.145l1.274-1.274a2 2 0 012.828 0l1.274 1.274m-2.222 4.746a2 2 0 01-2.828 0l-1.274-1.274"></path></svg>
              Acceder con biométrica
            </button>
          </form>
          <footer className="mt-12 text-center">
            <p className="text-brand-gray text-sm">
              ¿No tienes una cuenta? <a href="#" onClick={(e) => { e.preventDefault(); trackOnboardingStarted(); navigate('register_phone'); }} className="text-brand-orange font-semibold hover:underline ml-1">Regístrate gratis</a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
