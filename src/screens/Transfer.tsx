import React, { useState, useEffect, useRef } from 'react';
import { Screen, TransferData } from '../types';
import { Plus, X, Check } from 'lucide-react';
import { useMovements } from '../context/MovementsContext';
import { formatUSD } from '../utils/format';
import {
  trackTransferStarted,
  trackTransferRecipientFilled,
  trackTransferConfirmed,
} from '../utils/amplitude';

export function TransferScreen({ navigate }: { navigate: (s: Screen, d?: TransferData) => void }) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const { balance } = useMovements();
  const hasTrackedMount = useRef(false);
  const hasTrackedRecipient = useRef(false);
  const [contacts, setContacts] = useState([
    { name: 'Mamá.', initials: 'MA', color: 'bg-blue-500' },
    { name: 'Papá', initials: 'PA', color: 'bg-purple-500' },
    { name: 'Abuela', initials: 'AB', color: 'bg-green-500' },
    { name: 'Hijo', initials: 'HI', color: 'bg-pink-500' },
    { name: 'Alquiler', initials: 'AL', color: 'bg-oranje-500' },
    { name: 'Novi@', initials: 'NO', color: 'bg-red-500' },
  ]);

  // ── Activation: track transfer flow started ──
  useEffect(() => {
    if (!hasTrackedMount.current) {
      trackTransferStarted();
      hasTrackedMount.current = true;
    }
  }, []);

  // ── Activation: track recipient filled (once, when recipient has value) ──
  const handleSelectContact = (contactName: string) => {
    setRecipient(contactName);
    if (!hasTrackedRecipient.current) {
      trackTransferRecipientFilled('contact_selected');
      hasTrackedRecipient.current = true;
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && recipient) {
      // Track recipient filled if it was typed manually and not yet tracked
      if (!hasTrackedRecipient.current) {
        trackTransferRecipientFilled('manual_input');
        hasTrackedRecipient.current = true;
      }
      navigate('transfer_confirm', { amount, recipient });
    }
  };

  const handleAddContact = () => {
    if (newContactName && newContactPhone) {
      setContacts([...contacts, { 
        name: newContactName, 
        initials: newContactName.substring(0, 2).toUpperCase(), 
        color: 'bg-gray-500' 
      }]);
      setRecipient(newContactName);
      if (!hasTrackedRecipient.current) {
        trackTransferRecipientFilled('contact_selected');
        hasTrackedRecipient.current = true;
      }
      setNewContactName('');
      setNewContactPhone('');
      setShowModal(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <nav className="mb-8">
        <button onClick={() => navigate('dashboard')} className="inline-flex items-center text-brand-gray hover:text-white transition-colors gap-2 text-sm font-medium">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver al inicio
        </button>
      </nav>

      <header className="mb-8">
        <h1 className="text-[32px] font-bold text-white tracking-[-1px] leading-tight mb-2">Transferir dinero</h1>
        <p className="text-brand-gray">Envía dinero al instante a cualquier cuenta bancaria o billetera virtual.</p>
      </header>

      <div className="bg-brand-sidebar border border-brand-border rounded-[20px] p-6 md:p-8 shadow-xl">
        <form onSubmit={handleContinue} className="space-y-8">
          
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-brand-gray uppercase tracking-widest block">¿Cuánto quieres enviar?</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-brand-gray">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full h-16 bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 text-3xl font-bold text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all placeholder:text-brand-gray/50"
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-gray">Disponible: <span className="text-white font-medium">{formatUSD(balance)}</span></span>
              <button type="button" onClick={() => setAmount(balance.toString())} className="text-brand-orange font-semibold hover:underline">Usar todo</button>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-brand-gray uppercase tracking-widest block">¿A quién le envías?</label>
            <div className="relative">
              <input 
                type="text" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nombre, CBU, CVU o Alias" 
                className="w-full h-14 bg-brand-card border border-brand-border rounded-xl px-4 text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-orange p-2 hover:bg-brand-orange/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>
          </div>

          {/* Recent Contacts */}
          <div>
            <label className="text-[11px] font-bold text-brand-gray uppercase tracking-widest block mb-4">Contactos recientes</label>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              <button 
                type="button"
                onClick={() => setShowModal(true)}
                className="flex flex-col items-center gap-2 min-w-[72px] group"
              >
                <div className="w-14 h-14 rounded-full bg-brand-card flex items-center justify-center text-brand-orange font-bold text-lg border-2 border-brand-border group-hover:border-brand-orange transition-all shadow-lg">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs text-brand-gray group-hover:text-white transition-colors truncate w-full text-center">Agregar</span>
              </button>
              {contacts.map((contact, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => handleSelectContact(contact.name)}
                  className="flex flex-col items-center gap-2 min-w-[72px] group"
                >
                  <div className={`w-14 h-14 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-lg border-2 border-transparent group-hover:border-white transition-all shadow-lg`}>
                    {contact.initials}
                  </div>
                  <span className="text-xs text-brand-gray group-hover:text-white transition-colors truncate w-full text-center">{contact.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!amount || !recipient}
            className="w-full h-14 bg-brand-orange hover:bg-orange-600 disabled:bg-brand-card disabled:text-brand-gray disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 disabled:shadow-none mt-8"
          >
            Continuar
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </form>
      </div>

      {/* Modal Add Contact */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-sidebar border border-brand-border w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">Agregar Contacto</h2>
            <input className="w-full bg-brand-card border border-brand-border rounded-lg p-3 text-white mb-4" placeholder="Nombre" value={newContactName} onChange={e => setNewContactName(e.target.value)} />
            <input className="w-full bg-brand-card border border-brand-border rounded-lg p-3 text-white mb-6" placeholder="Número de celular" type="tel" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-brand-card text-white p-3 rounded-lg">Cancelar</button>
              <button onClick={handleAddContact} className="flex-1 bg-brand-primary text-white p-3 rounded-lg flex items-center justify-center gap-2"><Check className="w-4 h-4" />Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TransferConfirmScreen({ navigate, data }: { navigate: (s: Screen, d?: TransferData) => void, data?: TransferData }) {

  // ── Activation: track transfer confirmed on CTA click ──
  const handleConfirm = () => {
    trackTransferConfirmed(
      Number(data?.amount || 0),
      data?.recipient || 'Destinatario'
    );
    navigate('operation_success', {
      amount: data?.amount || '0',
      recipient: data?.recipient || 'Destinatario',
      successType: 'transfer',
    });
  };

  return (
    <div className="max-w-[500px] mx-auto">
      <nav className="mb-8">
        <button onClick={() => navigate('transfer')} className="inline-flex items-center text-brand-gray hover:text-white transition-colors gap-2 text-sm font-medium">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver a editar
        </button>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-[32px] font-bold text-white tracking-[-1px] leading-tight mb-2">Confirma el envío</h1>
        <p className="text-brand-gray">Revisa que los datos sean correctos antes de confirmar.</p>
      </header>

      <div className="bg-brand-sidebar border border-brand-border rounded-[20px] p-6 md:p-8 shadow-xl mb-8">
        <div className="text-center mb-8 pb-8 border-b border-brand-border/50">
          <p className="text-sm text-brand-gray mb-2">Monto a transferir</p>
          <h2 className="text-5xl font-bold text-white tracking-tighter">{formatUSD(Number(data?.amount || 0))}</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-gray">Para</span>
            <div className="text-right">
              <p className="text-sm font-bold text-white">{data?.recipient || 'Destinatario'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-gray">Concepto</span>
            <button className="text-sm font-semibold text-brand-orange hover:underline flex items-center gap-1">
              Varios
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} className="w-full h-14 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20">
        Confirmar y enviar
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </button>
    </div>
  );
}
