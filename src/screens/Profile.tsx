import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../types';
import { Camera, CheckCircle, Shield, Key, Smartphone, LogOut, Trash2, ChevronRight, Edit3, Mail, Phone, User, X, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { trackProfileViewed } from '../utils/amplitude';

export function ProfileScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { user, updateUser, getInitials, getFullName } = useUser();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const hasTracked = useRef(false);

  // ── Activation: track profile viewed ──
  useEffect(() => {
    if (!hasTracked.current) {
      trackProfileViewed();
      hasTracked.current = true;
    }
  }, []);

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = (field: keyof typeof user) => {
    updateUser({ [field]: tempValue });
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const personalFields = [
    { id: 'firstName', label: 'Nombres', value: user.firstName, icon: <User className="w-4 h-4" /> },
    { id: 'lastName', label: 'Apellidos', value: user.lastName, icon: <User className="w-4 h-4" /> },
    { id: 'phone', label: 'Celular', value: user.phone, icon: <Phone className="w-4 h-4" />, mono: true },
    { id: 'email', label: 'Correo Electrónico', value: user.email, icon: <Mail className="w-4 h-4" />, verified: true },
  ];

  return (
    <div className="pt-8 pb-12 px-8 max-w-[1200px] mx-auto relative z-10">
      {/* Decorative Shapes */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-primary opacity-[0.06] blur-[80px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-brand-primary opacity-[0.04] blur-[80px] -z-10 pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Left Column (Avatar & Basic Info) */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-[88px] h-[88px] rounded-full border-2 border-brand-primary p-1 bg-brand-background overflow-hidden flex items-center justify-center shadow-xl">
              <div className="w-full h-full rounded-full bg-brand-elevated flex items-center justify-center text-brand-primary text-3xl font-bold border border-brand-border">
                {getInitials()}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-brand-primary p-2 rounded-full border-2 border-brand-background hover:bg-brand-hover transition-all shadow-lg active:scale-90">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{getFullName()}</h2>
            <p className="text-brand-gray text-sm mt-1">{user.email}</p>
          </div>
          <div className="bg-[#4ADE8020] text-emerald-500 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/30 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold tracking-wide uppercase">Identidad verificada</span>
          </div>
          <div className="w-full pt-4 border-t border-brand-border/50">
            <p className="text-[10px] text-brand-textTer uppercase font-bold text-left mb-4 px-2 tracking-widest">Nivel de Usuario</p>
            <div className="bg-brand-surface border border-brand-primary/30 bg-gradient-to-br from-[#FF5C1A05] to-transparent p-4 text-left rounded-[14px] shadow-lg">
              <p className="text-white text-xs font-semibold mb-1">Minders Pro</p>
              <div className="w-full bg-brand-border h-[6px] rounded-full mt-2 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-primary to-brand-hover h-full rounded-full w-[85%] transition-all duration-1000"></div>
              </div>
              <p className="text-[10px] text-brand-gray mt-2">Próximo nivel: Embajador</p>
            </div>
          </div>
        </section>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Datos Personales Card */}
          <section className="bg-brand-surface border border-brand-border rounded-[14px] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Datos personales</h3>
              <button className="text-brand-primary text-xs font-semibold hover:underline">Editar todo</button>
            </div>
            <div className="space-y-4">
              {personalFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between py-2 border-b border-brand-border/30 last:border-0">
                  <div className="flex-1 mr-4">
                    <span className="text-[12px] font-medium text-brand-gray uppercase tracking-widest block mb-0.5">{field.label}</span>
                    {editingField === field.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="bg-brand-elevated border border-brand-primary text-white text-sm rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave(field.id as keyof typeof user);
                            if (e.key === 'Escape') handleCancel();
                          }}
                        />
                        <button onClick={() => handleSave(field.id as keyof typeof user)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="p-1.5 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-white text-sm ${field.mono ? 'font-mono' : ''}`}>{field.value}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {field.verified && !editingField && (
                      <span className="bg-[#4ADE8015] text-emerald-500 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20 font-bold">VERIFICADO</span>
                    )}
                    {editingField !== field.id && (
                      <button 
                        onClick={() => handleEdit(field.id, field.value)}
                        className="text-brand-textTer hover:text-white transition-colors p-1"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seguridad Card */}
          <section className="bg-brand-surface border border-brand-border rounded-[14px] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Seguridad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Contraseña', desc: 'Actualizada hace 2 meses', action: 'Cambiar', icon: <Key className="w-5 h-5" /> },
                { title: 'PIN de Operación', desc: 'Activo para transferencias', action: 'Editar', icon: <Shield className="w-5 h-5" />, success: true },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between hover:border-brand-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-background flex items-center justify-center text-brand-primary border border-brand-border group-hover:border-brand-primary/50 transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className={`text-[11px] ${item.success ? 'text-emerald-500' : 'text-brand-textTer'}`}>{item.desc}</p>
                    </div>
                  </div>
                  <button className="text-brand-primary text-xs font-bold px-3 py-1 hover:bg-brand-primary/10 rounded-md transition-all">{item.action}</button>
                </div>
              ))}
              
              <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between hover:border-brand-primary/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-background flex items-center justify-center text-brand-primary border border-brand-border group-hover:border-brand-primary/50 transition-all">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Autenticación (2FA)</p>
                    <p className="text-[11px] text-brand-textTer">Google Authenticator / SMS</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <div className="w-9 h-5 bg-brand-primary rounded-full transition-colors relative">
                    <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1 transition-transform shadow-sm"></div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-between hover:border-brand-primary/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-background flex items-center justify-center text-brand-primary border border-brand-border group-hover:border-brand-primary/50 transition-all">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Huella / FaceID</p>
                    <p className="text-[11px] text-brand-textTer">Solo disponible en App móvil</p>
                  </div>
                </div>
                <span className="text-[10px] text-brand-textTer bg-brand-background px-2 py-0.5 rounded border border-brand-border font-bold uppercase tracking-widest">Bloqueado</span>
              </div>
            </div>
          </section>

          {/* KYC Status Card */}
          <section className="bg-brand-surface border border-brand-primary/50 ring-1 ring-brand-primary/20 rounded-[14px] p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-white">Nivel de Verificación (KYC)</h3>
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Recomendado</span>
            </div>
            <div className="space-y-4">
              {[
                { level: 'Nivel 1: Básico', desc: 'Correo y teléfono verificado. Límite: $5.000.000/mes.', status: 'Completado', done: true },
                { level: 'Nivel 2: Intermedio', desc: 'Identidad oficial (DNI) y Biometría. Límite: $50.000.000/mes.', status: 'Completado', done: true },
              ].map((kyc, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-brand-elevated/50 border border-brand-border/40 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-4 h-4 text-brand-background" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{kyc.level}</p>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{kyc.status}</span>
                    </div>
                    <p className="text-xs text-brand-textTer mt-0.5">{kyc.desc}</p>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-elevated border border-brand-primary/30 relative overflow-hidden group hover:border-brand-primary transition-all cursor-pointer shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary opacity-5 blur-2xl -mr-12 -mt-12 group-hover:opacity-10 transition-opacity"></div>
                <div className="w-6 h-6 rounded-full border-2 border-brand-primary/50 bg-brand-background flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Nivel 3: Corporativo / Pro</p>
                    <button className="text-[10px] text-brand-primary font-bold uppercase tracking-widest hover:underline">Iniciar validación</button>
                  </div>
                  <p className="text-xs text-brand-textTer mt-0.5">Prueba de domicilio y actividad económica. Sin límites transaccionales.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button className="h-11 px-6 bg-brand-elevated border border-brand-border text-brand-gray rounded-xl font-semibold text-sm hover:text-white transition-all shadow-lg">
              Cerrar Sesión en otros dispositivos
            </button>
            <button className="h-11 px-6 bg-transparent text-brand-danger border border-brand-danger/30 rounded-xl font-semibold text-sm hover:bg-brand-danger/10 transition-all flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
