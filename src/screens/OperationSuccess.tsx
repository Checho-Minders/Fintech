import React, { useEffect, useRef } from 'react';
import { Screen, TransferData } from '../types';
import { CheckCircle, Share2, Download, Home, Lock } from 'lucide-react';
import { useMovements } from '../context/MovementsContext';
import { formatUSD } from '../utils/format';
import {
  trackFirstTransactionCompleted,
  trackPayServiceCompleted,
  trackMobileTopupCompleted,
} from '../utils/amplitude';

export function OperationSuccessScreen({
  navigate,
  data,
}: {
  navigate: (s: Screen) => void;
  data?: TransferData;
}) {
  const { getLatestTransaction } = useMovements();
  const movement = getLatestTransaction();
  const hasTracked = useRef(false);

  const successType = data?.successType ?? 'transfer';

  const isPinSuccess = successType === 'pin';
  const isCreditSuccess = successType === 'credit';

  // Se conserva este valor para la UI.
  // Así no modificamos el comportamiento visual existente.
  const isTransferSuccess = successType === 'transfer';

  // Para Analytics exigimos que el tipo "transfer"
  // venga explícitamente informado.
  //
  // Esto evita que CDT, Market, InsuranceWizard o CardManage
  // sean clasificados como transferencias solo porque
  // OperationSuccess usa "transfer" como fallback visual.
  const isExplicitTransferSuccess =
    data?.successType === 'transfer';

  const isPayServicesSuccess =
    successType === 'pay_services';

  const isMobileTopupSuccess =
    successType === 'mobile_topup';

  const showReceipt =
    isTransferSuccess ||
    isPayServicesSuccess ||
    isMobileTopupSuccess;

  // ── Activation: track transaction completion + AHA MOMENT ──
  useEffect(() => {
    if (!hasTracked.current) {
      const amount = Number(
        movement?.amount ||
          data?.amount ||
          0
      );

      // Pago de servicios:
      // sí pertenece al tracking plan.
      if (isPayServicesSuccess) {
        trackPayServiceCompleted(
          data?.recipient || 'Servicio',
          amount
        );
      }

      // Esta función queda como NO-OP en amplitude.ts.
      // Se mantiene la llamada para no modificar
      // la lógica existente de esta pantalla.
      if (isMobileTopupSuccess) {
        trackMobileTopupCompleted(
          data?.recipient || 'Operador',
          amount,
          'CO'
        );
      }

      // ★ AHA MOMENT
      //
      // Solo se registra transferencia cuando el successType
      // fue informado explícitamente como "transfer".
      //
      // Así no contaminamos first_transaction_completed.
      if (
        isExplicitTransferSuccess ||
        isPayServicesSuccess ||
        isMobileTopupSuccess
      ) {
        const txType =
          isExplicitTransferSuccess
            ? 'transfer'
            : isPayServicesSuccess
              ? 'pay_services'
              : 'mobile_topup';

        trackFirstTransactionCompleted(
          txType,
          amount
        );
      }

      hasTracked.current = true;
    }
  }, []);

  const getOperationTitle = () => {
    if (isPayServicesSuccess) {
      return 'Pago de servicio';
    }

    if (isMobileTopupSuccess) {
      return 'Recarga móvil';
    }

    return 'Transferencia';
  };

  const getSuccessMessage = () => {
    if (isPinSuccess) {
      return '¡PIN actualizado con éxito!';
    }

    if (isCreditSuccess) {
      return '¡Crédito aprobado y desembolsado!';
    }

    if (isPayServicesSuccess) {
      return '¡Pago Exitoso!';
    }

    if (isMobileTopupSuccess) {
      return '¡Recarga Exitosa!';
    }

    return '¡Operación Exitosa!';
  };

  const getSuccessDescription = () => {
    if (isPinSuccess) {
      return 'Tu nuevo PIN ha sido guardado. Úsalo la próxima vez que realices un pago o retiro.';
    }

    if (isCreditSuccess) {
      return 'El dinero ya está disponible en tu cuenta Minders. Revisa tu saldo actualizado.';
    }

    if (isPayServicesSuccess) {
      return 'Tu pago de servicio se ha procesado correctamente.';
    }

    if (isMobileTopupSuccess) {
      return 'Tu recarga móvil se ha procesado correctamente.';
    }

    return 'Tu transacción se ha procesado correctamente.';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-[600px] mx-auto w-full gap-10 bg-[#0D0D0D]">

      {/* Success Animation & Header */}
      <div className="flex flex-col items-center text-center animate-fade-in-up">
        <div className="relative mb-8">
          <div
            className={`absolute inset-0 ${
              isPinSuccess
                ? 'bg-[#FF4500]/20'
                : 'bg-emerald-500/20'
            } rounded-full blur-2xl animate-pulse`}
          ></div>

          <div
            className={`w-32 h-32 rounded-full ${
              isPinSuccess
                ? 'bg-[#FF4500]/10'
                : 'bg-emerald-500/10'
            } flex items-center justify-center border-4 ${
              isPinSuccess
                ? 'border-[#FF4500]/30'
                : 'border-emerald-500/30'
            } relative z-10`}
          >
            {isPinSuccess ? (
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-[#FF4500] drop-shadow-[0_0_15px_rgba(255,69,0,0.5)]" />
                <Lock className="w-8 h-8 text-white absolute -bottom-2 -right-2 bg-[#0D0D0D] rounded-full p-1" />
              </div>
            ) : (
              <CheckCircle className="w-16 h-16 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            )}
          </div>
        </div>

        <h1 className="text-white text-4xl font-black tracking-tight mb-3">
          {getSuccessMessage()}
        </h1>

        <p className="text-brand-gray text-lg">
          {getSuccessDescription()}
        </p>
      </div>

      {/* Receipt Card */}
      {showReceipt && (
        <div
          className="w-full bg-brand-card border border-brand-border rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          {/* Decorative Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCA4TDkgMEwxMCAwTDIwIDhMMjAgMEwwIDBaIiBmaWxsPSIjZWM1YjEzIiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=')] opacity-50"></div>

          <div className="flex flex-col gap-6 pt-4">

            <div className="flex justify-between items-end border-b border-brand-border/50 pb-6">
              <div>
                <p className="text-brand-gray text-[10px] font-bold uppercase tracking-widest mb-1">
                  Monto Total
                </p>

                <p className="text-white text-4xl font-black tabular-nums">
                  {formatUSD(
                    Number(
                      movement?.amount ||
                        data?.amount ||
                        0
                    )
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-brand-gray text-[10px] font-bold uppercase tracking-widest mb-1">
                  Fecha y Hora
                </p>

                <p className="text-white font-medium">
                  {movement?.dateLabel ||
                    new Date().toLocaleDateString()}
                  ,{' '}
                  {movement?.timeLabel ||
                    new Date().toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-brand-gray text-[10px] font-bold uppercase tracking-widest mb-1">
                  Tipo de Operación
                </p>

                <p className="text-white font-medium">
                  {getOperationTitle()}
                </p>
              </div>

              <div>
                <p className="text-brand-gray text-[10px] font-bold uppercase tracking-widest mb-1">
                  Destino
                </p>

                <p className="text-white font-medium">
                  {movement?.recipientName ||
                    data?.recipient ||
                    'Destinatario'}
                </p>
              </div>

              <div>
                <p className="text-brand-gray text-[10px] font-bold uppercase tracking-widest mb-1">
                  Referencia
                </p>

                <p className="text-white font-mono text-sm">
                  {movement?.operationNumber ||
                    `#MP-${Math.floor(
                      Math.random() *
                        1000000000
                    )}`}
                </p>
              </div>

              <div>
                <p className="text-brand-gray text-[10px] font-bold uppercase tracking-widest mb-1">
                  Estado
                </p>

                <p className="text-emerald-500 font-bold flex items-center gap-1">
                  Aprobada
                  <CheckCircle className="w-3 h-3" />
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Edge */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCAwTDkgOEwxMCA4TDIwIDBMMjAgOEwwIDhaIiBmaWxsPSIjM2QzZDNkIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]"></div>
        </div>
      )}

      {/* Actions */}
      <div
        className="flex flex-col w-full gap-4 animate-fade-in-up"
        style={{ animationDelay: '300ms' }}
      >
        {showReceipt && (
          <div className="flex gap-4">
            <button className="flex-1 bg-brand-bg border border-brand-border hover:bg-brand-card text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group">
              <Share2 className="w-5 h-5 text-brand-gray group-hover:text-brand-orange transition-colors" />
              Compartir
            </button>

            <button className="flex-1 bg-brand-bg border border-brand-border hover:bg-brand-card text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group">
              <Download className="w-5 h-5 text-brand-gray group-hover:text-brand-orange transition-colors" />
              Descargar
            </button>
          </div>
        )}

        <button
          onClick={() =>
            navigate(
              isPinSuccess
                ? 'cards'
                : isCreditSuccess
                  ? 'dashboard'
                  : 'dashboard'
            )
          }
          className={`w-full ${
            isPinSuccess
              ? 'bg-[#FF4500] hover:bg-[#FF4500]/90'
              : 'bg-brand-orange hover:bg-brand-orange/90'
          } text-white font-black py-5 rounded-2xl shadow-xl ${
            isPinSuccess
              ? 'shadow-[#FF4500]/20'
              : 'shadow-brand-orange/20'
          } transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4`}
        >
          <Home className="w-6 h-6" />

          {isPinSuccess
            ? 'VOLVER A MIS TARJETAS'
            : isCreditSuccess
              ? 'VER MI SALDO'
              : 'VOLVER AL INICIO'}
        </button>
      </div>
    </div>
  );
}
