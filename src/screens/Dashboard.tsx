import React, { useState, useEffect, useRef } from 'react';

import { Screen, TransferData } from '../types';

import { useMovements } from '../context/MovementsContext';

import { formatUSD } from '../utils/format';

import {
  trackActivationStarted,
  trackBalanceViewed,
  trackQuickActionTapped,
} from '../utils/amplitude';

import { QuickTransferExperiment } from '../components/QuickTransferExperiment';

export function DashboardScreen({
  navigate,
}: {
  navigate: (
    screen: Screen,
    data?: TransferData
  ) => void;
}) {
  const [hideBalance, setHideBalance] = useState(false);

  const { transactions, balance } = useMovements();

  const hasTrackedMount = useRef(false);

  // ─────────────────────────────────────────────
  // Activation: track dashboard viewed (once)
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!hasTrackedMount.current) {
      trackActivationStarted();
      hasTrackedMount.current = true;
    }
  }, []);

  // ─────────────────────────────────────────────
  // Activation: track balance toggle
  // ─────────────────────────────────────────────

  const handleToggleBalance = () => {
    const newState = !hideBalance;

    setHideBalance(newState);

    trackBalanceViewed(
      newState ? 'hide' : 'show'
    );
  };

  // ─────────────────────────────────────────────
  // Activation: track quick action taps
  // ─────────────────────────────────────────────

  const handleQuickAction = (
    label: string,
    screen: Screen
  ) => {
    trackQuickActionTapped(
      label,
      screen
    );

    navigate(screen);
  };

  return (
    <div className="space-y-8">

      {/* =====================================================
          TOP SECTION: HERO + RENDIMIENTO
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Balance Card Hero */}

        <section className="col-span-1 lg:col-span-2 p-8 flex flex-col justify-between bg-gradient-to-br from-brand-orange/10 via-brand-sidebar to-brand-bg border border-brand-border rounded-[20px]">

          <div>

            <div className="flex items-center justify-between mb-2">

              <label className="text-[12px] font-medium text-brand-gray uppercase tracking-widest">
                Tu saldo total
              </label>

              <button
                onClick={handleToggleBalance}
                className="text-brand-gray hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      hideBalance
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    }
                  />
                </svg>
              </button>

            </div>

            <h1 className="text-4xl font-bold text-white tracking-tighter">
              {hideBalance
                ? '••••••••'
                : formatUSD(balance)}
            </h1>

            <p className="text-sm text-brand-gray mt-2">
              Saldo disponible en dólares
            </p>

          </div>

          <div className="mt-8 flex gap-3">

            <button
              onClick={() =>
                handleQuickAction(
                  'Transferir',
                  'transfer'
                )
              }
              className="bg-brand-orange hover:bg-orange-600 h-11 px-6 rounded-xl text-sm font-semibold text-white transition-colors"
            >
              Transferir
            </button>

            <button
              onClick={() =>
                handleQuickAction(
                  'Recargar',
                  'topup_channel'
                )
              }
              className="bg-transparent border-[1.5px] border-brand-orange text-brand-orange h-11 px-6 rounded-xl text-sm font-semibold hover:bg-brand-orange/10 transition-colors"
            >
              Recargar
            </button>

          </div>

        </section>

        {/* Rendimiento Card */}

        <section className="bg-brand-sidebar border border-brand-border rounded-[14px] p-6 flex flex-col shadow-lg">

          <h3 className="text-base font-semibold text-white mb-6">
            Tu rendimiento
          </h3>

          <div className="flex-1 flex flex-col justify-center">

            <div className="flex items-end justify-between mb-2">

              <span className="text-3xl font-bold text-green-400 font-mono">
                +12.5%
              </span>

              <span className="text-xs text-brand-gray">
                Este mes
              </span>

            </div>

            <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden mt-4">

              <div className="h-full bg-gradient-to-r from-brand-orange to-orange-400 w-[75%]" />

            </div>

            <p className="text-[11px] text-brand-gray mt-4 leading-relaxed">
              Has generado{' '}
              <span className="text-white font-medium">
                $42.30
              </span>{' '}
              en intereses este mes.
            </p>

          </div>

        </section>

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="flex flex-wrap gap-4">

        {[
          {
            icon: (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
            label: 'Cargar',
            screen: 'topup_channel' as Screen,
          },

          {
            icon: (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            ),
            label: 'Servicios',
            screen: 'pay_services' as Screen,
          },

          {
            icon: (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            label: 'Crédito',
            screen: 'credit_offer' as Screen,
          },

          {
            icon: (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            ),
            label: 'Celular',
            screen: 'mobile_topup' as Screen,
          },

          {
            icon: (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M5 12l4-4m-4 4l4 4"
                />
              </svg>
            ),
            label: 'Extraer',
            screen: 'transfer' as Screen,
          },

        ].map((item, i) => (

          <div
            key={i}
            className="flex flex-col items-center space-y-2"
          >

            <button
              onClick={() =>
                handleQuickAction(
                  item.label,
                  item.screen
                )
              }
              className="w-16 h-16 bg-brand-card border border-brand-border rounded-[14px] flex items-center justify-center text-brand-orange hover:bg-brand-border transition-colors"
            >
              {item.icon}
            </button>

            <span className="text-[11px] font-medium text-brand-gray">
              {item.label}
            </span>

          </div>

        ))}

      </section>

      {/* =====================================================
          FEATURE EXPERIMENT:
          QUICK TRANSFER

          Control:
          El componente devuelve null.

          Treatment:
          Se muestra la nueva funcionalidad.
      ===================================================== */}

      <QuickTransferExperiment
        navigate={navigate}
        balance={balance}
      />

      {/* =====================================================
          MIDDLE GRID: BOLSILLOS + TARJETA
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Bolsillos */}

        <section className="bg-brand-sidebar border border-brand-border rounded-[14px] p-6 shadow-lg">

          <div className="flex items-center justify-between mb-6">

            <h3 className="text-base font-semibold text-white">
              Tus Bolsillos
            </h3>

            <button
              onClick={() =>
                navigate('savings_hub')
              }
              className="text-brand-orange text-xs font-semibold"
            >
              Ver todos
            </button>

          </div>

          <div className="space-y-4">

            <div
              onClick={() =>
                navigate('pocket_detail')
              }
              className="flex items-center justify-between p-3 bg-brand-card rounded-xl border border-brand-border/40 cursor-pointer hover:border-brand-orange/50 transition-colors"
            >

              <div className="flex items-center">

                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center">
                  🏠
                </div>

                <div className="ml-3">

                  <p className="text-sm font-medium text-white">
                    Ahorro Alquiler
                  </p>

                  <p className="text-[11px] text-brand-gray">
                    Meta: {formatUSD(850)}
                  </p>

                </div>

              </div>

              <p className="text-sm font-bold text-white">
                {formatUSD(420)}
              </p>

            </div>

            <div
              onClick={() =>
                navigate('pocket_detail')
              }
              className="flex items-center justify-between p-3 bg-brand-card rounded-xl border border-brand-border/40 cursor-pointer hover:border-brand-orange/50 transition-colors"
            >

              <div className="flex items-center">

                <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">
                  ✈️
                </div>

                <div className="ml-3">

                  <p className="text-sm font-medium text-white">
                    Viaje Japón
                  </p>

                  <p className="text-[11px] text-brand-gray">
                    Meta: {formatUSD(2000)}
                  </p>

                </div>

              </div>

              <p className="text-sm font-bold text-white">
                {formatUSD(125)}
              </p>

            </div>

          </div>

        </section>

        {/* Tarjeta Virtual */}

        <section className="bg-brand-sidebar border border-brand-border rounded-[14px] p-6 relative overflow-hidden shadow-lg">

          <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl" />

          <h3 className="text-base font-semibold text-white mb-6">
            Tarjeta Minders Pay
          </h3>

          <div className="w-full aspect-[1.58/1] bg-gradient-to-br from-[#2D3139] to-[#151820] rounded-2xl border border-brand-border p-6 flex flex-col justify-between shadow-2xl mb-6">

            <div className="flex justify-between items-start">

              <div className="text-brand-orange font-bold italic text-lg">
                Minders{' '}
                <span className="text-white opacity-80">
                  Pay
                </span>
              </div>

              <svg
                className="w-10 h-10 opacity-60"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v1zm0-3.5c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5V7.5c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5V13z" />
              </svg>

            </div>

            <div>

              <p className="font-mono text-lg text-white tracking-[0.2em] mb-1">
                •••• •••• •••• 8245
              </p>

              <div className="flex justify-between items-end">

                <p className="text-[10px] text-brand-gray uppercase font-mono tracking-widest">
                  Maria Rodriguez
                </p>

                <p className="text-[10px] text-brand-gray font-mono">
                  11/27
                </p>

              </div>

            </div>

          </div>

          <div className="flex gap-2">

            <button className="flex-1 h-10 bg-brand-card border border-brand-border rounded-lg text-xs font-medium text-brand-gray hover:text-white transition-colors">
              Detalles
            </button>

            <button className="flex-1 h-10 bg-brand-card border border-brand-border rounded-lg text-xs font-medium text-brand-gray hover:text-white transition-colors">
              Bloquear
            </button>

          </div>

        </section>

      </div>

      {/* =====================================================
          BANNER CRÉDITO
      ===================================================== */}

      <section className="bg-brand-sidebar border border-brand-border border-l-4 border-l-brand-orange rounded-[14px] p-4 flex items-center justify-between shadow-lg">

        <div className="flex items-center">

          <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center mr-4">

            <svg
              className="w-6 h-6 text-brand-orange"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>

          </div>

          <div>

            <h4 className="text-sm font-bold text-white">
              ¡Crédito preaprobado de {formatUSD(5000)}!
            </h4>

            <p className="text-xs text-brand-gray">
              Acreditalo al instante y pagá en cuotas fijas.
            </p>

          </div>

        </div>

        <button
          onClick={() =>
            navigate('credit_offer')
          }
          className="bg-brand-orange hover:bg-orange-600 text-white h-9 px-4 rounded-lg text-xs font-bold transition-colors"
        >
          Ver oferta
        </button>

      </section>

      {/* =====================================================
          ÚLTIMOS MOVIMIENTOS
      ===================================================== */}

      <section className="space-y-4">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold text-white">
            Tus movimientos
          </h2>

          <button
            onClick={() =>
              navigate('movements')
            }
            className="text-brand-gray text-sm hover:text-white transition-colors"
          >
            Ver historial
          </button>

        </div>

        <div className="bg-brand-sidebar border border-brand-border rounded-[14px] overflow-hidden shadow-lg">

          {[
            {
              name: 'Supermercado Coto',
              desc: 'Hoy, 14:20 • Compra con tarjeta',
              amount: `−${formatUSD(42.80)}`,
              type: 'out',
              status: 'Aprobado',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              ),
            },

            {
              name: 'De: Juan Perez',
              desc: 'Ayer, 18:05 • Transferencia recibida',
              amount: `+${formatUSD(120)}`,
              type: 'in',
              status: 'Aprobado',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              ),
            },

            {
              name: 'Personal Pay',
              desc: '22 Ago, 09:12 • Recarga de servicios',
              amount: `−${formatUSD(5.40)}`,
              type: 'out',
              status: 'Aprobado',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              ),
            },

            {
              name: 'Starbucks Coffee',
              desc: '21 Ago, 10:45 • Compra con tarjeta',
              amount: `−${formatUSD(8.20)}`,
              type: 'out',
              status: 'Pendiente',
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              ),
            },

          ].map((tx, i) => (

            <div
              key={i}
              onClick={() =>
                navigate(
                  'transaction_detail'
                )
              }
              className="px-6 py-4 hover:bg-brand-card/40 transition-all border-b border-brand-border/30 flex items-center justify-between cursor-pointer"
            >

              <div className="flex items-center">

                <div
                  className={`w-9 h-9 bg-brand-card border border-brand-border rounded-full flex items-center justify-center mr-4 ${
                    tx.type === 'in'
                      ? 'text-green-400'
                      : 'text-brand-orange'
                  }`}
                >
                  {tx.icon}
                </div>

                <div>

                  <p className="text-sm font-semibold text-white">
                    {tx.name}
                  </p>

                  <p className="text-[11px] text-brand-gray">
                    {tx.desc}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p
                  className={`text-sm font-bold ${
                    tx.type === 'in'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {tx.amount}
                </p>

                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                    tx.status === 'Aprobado'
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-yellow-400/10 text-yellow-400'
                  }`}
                >
                  {tx.status}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}
