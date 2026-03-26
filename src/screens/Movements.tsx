import React, { useEffect, useRef } from 'react';
import { Screen, Movement } from '../types';
import { useMovements } from '../context/MovementsContext';
import { formatUSD } from '../utils/format';
import { trackMovementsViewed } from '../utils/amplitude';

export function MovementsScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { transactions } = useMovements();
  const ingresos = transactions.filter(m => m.type === 'transfer_in').reduce((acc, m) => acc + m.amount, 0);
  const egresos = transactions.filter(m => m.type === 'transfer_out' || m.type === 'purchase').reduce((acc, m) => acc + m.amount, 0);
  const balance = ingresos - egresos;
  const hasTracked = useRef(false);

  // ── Activation: track movements viewed ──
  useEffect(() => {
    if (!hasTracked.current) {
      trackMovementsViewed();
      hasTracked.current = true;
    }
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-white tracking-[-1px] leading-tight">Movimientos</h1>
          <p className="text-brand-gray mt-1">Sigue el control detallado de tus ingresos y egresos.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-11 px-4 bg-brand-card border border-brand-border text-brand-gray rounded-xl text-sm font-semibold hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Exportar
          </button>
          <button onClick={() => navigate('transfer')} className="h-11 px-6 bg-brand-orange hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors">Nueva transferencia</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-sidebar border border-brand-border rounded-[14px] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-brand-gray uppercase tracking-wider">Ingresos del mes</span>
            <div className="w-8 h-8 rounded-full bg-green-400/10 flex items-center justify-center text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10 5 5 5-5 M12 15V3"></path></svg>
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-green-400">{formatUSD(ingresos)}</p>
        </div>
        <div className="bg-brand-sidebar border border-brand-border rounded-[14px] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-brand-gray uppercase tracking-wider">Gastos del mes</span>
            <div className="w-8 h-8 rounded-full bg-red-400/10 flex items-center justify-center text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m17 14-5-5-5 5 M12 19V9"></path></svg>
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-red-400">{formatUSD(egresos)}</p>
        </div>
        <div className="bg-brand-sidebar border border-brand-border rounded-[14px] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-brand-gray uppercase tracking-wider">Balance total</span>
            <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatUSD(balance)}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gray">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.3-4.3"></path></svg>
          </span>
          <input type="text" placeholder="Buscar por comercio o concepto..." className="w-full h-11 bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 text-sm text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
          <button className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-brand-orange text-white whitespace-nowrap">Todo</button>
          <button className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-brand-card border border-brand-border text-brand-gray hover:text-white whitespace-nowrap">Ingresos</button>
          <button className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-brand-card border border-brand-border text-brand-gray hover:text-white whitespace-nowrap">Egresos</button>
          <button className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-brand-card border border-brand-border text-brand-gray hover:text-white whitespace-nowrap">Pendientes</button>
          <button className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-brand-card border border-brand-border text-brand-gray hover:text-white whitespace-nowrap flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18 M7 12h10 M10 18h4"></path></svg>
            Filtros
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-bold text-brand-gray uppercase tracking-[0.1em] mb-4">Movimientos Recientes</h3>
          <div className="bg-brand-sidebar border border-brand-border rounded-[14px] overflow-hidden shadow-lg">
            {transactions.map((item) => (
              <div key={item.id} onClick={() => navigate('transaction_detail')} className="flex items-center justify-between p-4 hover:bg-brand-card/50 transition-colors cursor-pointer border-b border-brand-border/30 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-brand-card flex items-center justify-center ${item.type === 'transfer_out' ? 'text-brand-orange' : item.type === 'transfer_in' ? 'text-green-400' : 'text-brand-gray'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20 m5-17l-5-3-5 3 m5 14l-5 3-5-3"></path><rect width="12" height="12" x="6" y="6" rx="2"></rect></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.recipientName}</h4>
                    <p className="text-xs text-brand-gray mt-0.5">{item.timeLabel} • {item.concept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-bold ${item.type === 'transfer_out' || item.type === 'purchase' ? 'text-red-400' : 'text-green-400'}`}>{item.formattedAmount}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-green-400/15 text-green-400 text-[11px] font-medium mt-1">{item.status === 'completed' ? 'Completado' : 'Pendiente'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
