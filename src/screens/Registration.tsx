import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import { useUser } from '../context/UserContext';
import {
  trackPhoneSubmitted,
  trackPersonalDataSubmitted,
  trackKycDocumentViewed,
  trackKycDocumentUploaded,
  trackKycSelfieViewed,
  trackKycSelfieUploaded,
  trackKycValidationStarted,
  trackKycValidationResult,
  trackPinCreated,
  trackOnboardingCompleted,
  trackOnboardingCtaClicked,
  setAmplitudeUserId,
} from '../utils/amplitude';

export function RegisterPhoneScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [phone, setPhone] = useState('');
  const { updateUser } = useUser();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ phone: `+54 9 ${phone}` });
    trackPhoneSubmitted('+54 9');
    navigate('register_data');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <div className="absolute w-[300px] h-[300px] bg-brand-orange/5 blur-[120px] -top-20 -right-20 rounded-full pointer-events-none"></div>
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px]">
          <nav className="mb-8">
            <button onClick={() => navigate('login')} className="inline-flex items-center text-brand-gray hover:text-white transition-colors gap-2 text-sm font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Volver al login
            </button>
          </nav>
          
          <header className="mb-10">
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Comencemos</h1>
            <p className="text-brand-gray text-sm">Ingresa tu número de celular para crear tu cuenta en Minders Pay.</p>
          </header>
          
          <form className="space-y-6" onSubmit={handleContinue}>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">Celular</label>
              <div className="flex gap-2">
                <div className="w-24 h-12 bg-brand-card border border-brand-border rounded-xl flex items-center justify-center text-white font-medium">
                  +54 9
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11 2345-6789" 
                  className="flex-1 h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" 
                  autoFocus
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={!phone}
              className="w-full h-11 bg-brand-orange hover:bg-orange-600 disabled:bg-brand-card disabled:text-brand-gray disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Continuar
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export function RegisterDataScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dni: ''
  });

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    trackPersonalDataSubmitted(!!formData.email, !!formData.dni);
    navigate('kyc_doc');
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.dni;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <div className="absolute w-[300px] h-[300px] bg-brand-orange/5 blur-[120px] -top-20 -right-20 rounded-full pointer-events-none"></div>
      
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px]">
          <nav className="mb-8">
            <button onClick={() => navigate('register_phone')} className="inline-flex items-center text-brand-gray hover:text-white transition-colors gap-2 text-sm font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Atrás
            </button>
          </nav>
          
          <header className="mb-10">
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Tus datos</h1>
            <p className="text-brand-gray text-sm">Completa tu información personal tal como aparece en tu DNI.</p>
          </header>
          
          <form className="space-y-6" onSubmit={handleContinue}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">Nombre</label>
                <input 
                  type="text" 
                  placeholder="María" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">Apellido</label>
                <input 
                  type="text" 
                  placeholder="Rodríguez" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">Email</label>
              <input 
                type="email" 
                placeholder="maria@ejemplo.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-brand-gray uppercase tracking-[0.06em]">DNI</label>
              <input 
                type="text" 
                placeholder="12.345.678" 
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full h-12 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={!isFormValid}
              className="w-full h-11 bg-brand-orange hover:bg-orange-600 disabled:bg-brand-card disabled:text-brand-gray disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-8"
            >
              Continuar
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export function KycDocScreen({ navigate }: { navigate: (s: Screen) => void }) {
  useEffect(() => {
    trackKycDocumentViewed();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px] text-center">
          <header className="mb-10">
            <div className="w-20 h-20 bg-brand-card border border-brand-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="h-10 w-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            </div>
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Verifica tu identidad</h1>
            <p className="text-brand-gray text-sm">Necesitamos una foto del frente y dorso de tu DNI para cumplir con las regulaciones financieras.</p>
          </header>
          
          <div className="bg-brand-sidebar border border-brand-border rounded-2xl p-6 mb-8">
            <div className="aspect-[1.58/1] bg-brand-card border-2 border-dashed border-brand-gray/30 rounded-xl flex flex-col items-center justify-center text-brand-gray hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer group">
              <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-sm font-medium">Tomar foto del frente</span>
            </div>
          </div>
          
          <button onClick={() => { trackKycDocumentUploaded('front'); navigate('kyc_selfie'); }} className="w-full h-11 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
            Continuar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </main>
    </div>
  );
}

export function KycSelfieScreen({ navigate }: { navigate: (s: Screen) => void }) {
  useEffect(() => {
    trackKycSelfieViewed();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px] text-center">
          <header className="mb-10">
            <div className="w-20 h-20 bg-brand-card border border-brand-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg className="h-10 w-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Ahora, una selfie</h1>
            <p className="text-brand-gray text-sm">Asegúrate de estar en un lugar bien iluminado y de que tu rostro se vea claramente.</p>
          </header>
          
          <div className="bg-brand-sidebar border border-brand-border rounded-2xl p-6 mb-8">
            <div className="w-48 h-48 mx-auto bg-brand-card border-2 border-dashed border-brand-gray/30 rounded-full flex flex-col items-center justify-center text-brand-gray hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer group">
              <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-sm font-medium">Tomar selfie</span>
            </div>
          </div>
          
          <button onClick={() => { trackKycSelfieUploaded(); navigate('kyc_review'); }} className="w-full h-11 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
            Continuar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </main>
    </div>
  );
}

export function KycReviewScreen({ navigate }: { navigate: (s: Screen) => void }) {
  useEffect(() => {
    trackKycValidationStarted();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px] text-center">
          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-orange/30">
              <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
          </div>
          
          <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Validando identidad</h1>
          <p className="text-brand-gray text-sm mb-8">Estamos verificando tus datos. Esto tomará solo unos segundos.</p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm font-medium">Documento escaneado</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-sm font-medium">Selfie procesada</span>
            </div>
            <div className="flex items-center gap-3 text-brand-gray">
              <div className="w-5 h-5 border-2 border-brand-gray border-t-brand-orange rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Verificando en bases de datos...</span>
            </div>
          </div>
          
          <button onClick={() => { trackKycValidationResult('success'); navigate('pin_create'); }} className="w-full mt-12 h-11 bg-brand-card hover:bg-brand-border border border-brand-border text-white rounded-xl font-semibold text-sm transition-all">
            Simular validación exitosa
          </button>
        </div>
      </main>
    </div>
  );
}

export function PinCreateScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [pin, setPin] = useState('');

  const handleKeyPress = (key: string | number) => {
    if (key === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(prev => prev + key);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg overflow-hidden">
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[440px] text-center">
          <header className="mb-10">
            <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Crea tu PIN</h1>
            <p className="text-brand-gray text-sm">Este PIN de 4 dígitos protegerá tu cuenta y tus transferencias.</p>
          </header>
          
          <div className="flex justify-center gap-3 mb-12">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-12 h-14 bg-brand-sidebar border ${pin.length > i ? 'border-brand-orange' : 'border-brand-border'} rounded-xl flex items-center justify-center text-2xl text-white font-bold transition-all`}>
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, i) => (
              <button 
                key={i} 
                onClick={() => key !== '' && handleKeyPress(key)}
                className={`h-14 rounded-full flex items-center justify-center text-xl font-medium ${key === '' ? 'invisible' : 'bg-brand-card hover:bg-brand-border text-white transition-colors active:scale-95'}`}
              >
                {key === 'del' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg> : key}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => { trackPinCreated(); navigate('welcome'); }} 
            disabled={pin.length < 4}
            className="w-full h-11 bg-brand-orange hover:bg-orange-600 disabled:bg-brand-card disabled:text-brand-gray disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            Confirmar PIN
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </main>
    </div>
  );
}

export function WelcomeScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { user } = useUser();

  useEffect(() => {
    // Setear userId con el celular del usuario (o email si preferís)
    if (user.phone) {
      setAmplitudeUserId(`user_${user.phone.replace(/\s+/g, '')}`);
    }
    trackOnboardingCompleted();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[480px] text-center relative z-10">
        <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-orange/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">¡Hola, {user.firstName}!</h1>
        <p className="text-brand-gray text-lg mb-12">Tu cuenta de Minders Pay está lista para usar. Comienza a disfrutar de todas las ventajas de tu nueva billetera.</p>
        
        <button onClick={() => { trackOnboardingCtaClicked(); navigate('dashboard'); }} className="w-full h-14 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-brand-orange/20">
          Ir a mi cuenta
        </button>
      </div>
    </div>
  );
}
