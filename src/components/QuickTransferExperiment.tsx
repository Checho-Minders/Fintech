import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';

import {
  Screen,
  TransferData,
} from '../types';

import { formatUSD } from '../utils/format';

import {
  loadQuickTransferExperiment,
  QuickTransferPayload,
} from '../utils/quickTransferExperiment';

type Props = {
  navigate: (
    screen: Screen,
    data?: TransferData
  ) => void;

  balance: number;
};

const CONTACTS = [
  'Mamá.',
  'Papá',
  'Abuela',
  'Alquiler',
];

export function QuickTransferExperiment({
  navigate,
  balance,
}: Props) {
  const [variant, setVariant] =
    useState<string | null>(null);

  const [config, setConfig] =
    useState<QuickTransferPayload | null>(
      null
    );

  const [recipient, setRecipient] =
    useState('');

  const [amount, setAmount] =
    useState('');

  const [error, setError] =
    useState('');

  useEffect(() => {
    let mounted = true;

    async function loadExperiment() {
      const result =
        await loadQuickTransferExperiment();

      if (!mounted) return;

      setVariant(result.variant);
      setConfig(result.payload);
    }

    void loadExperiment();

    return () => {
      mounted = false;
    };
  }, []);

  // Mientras Amplitude responde no mostramos nada.
  // Así evitamos "flash" de Treatment.
  if (!variant || !config) {
    return null;
  }

  // ==========================================================
  // CONTROL
  // ==========================================================
  //
  // El dashboard queda EXACTAMENTE como estaba.
  //
  // ==========================================================
  if (
    variant !== 'treatment' ||
    !config.enabled
  ) {
    return null;
  }

  // ==========================================================
  // TREATMENT
  // ==========================================================

  const numericAmount =
    Number(amount);

  const amountIsValid =
    Number.isFinite(numericAmount) &&
    numericAmount > 0;

  const canContinue =
    recipient.trim().length > 0 &&
    amountIsValid &&
    numericAmount <= balance;

  const handleSuggestedAmount = (
    suggestedAmount: number
  ) => {
    setAmount(
      suggestedAmount.toString()
    );

    setError('');
  };

  const handleContinue = () => {
    setError('');

    if (!recipient) {
      setError(
        'Selecciona un destinatario.'
      );
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(
        'Ingresa un monto válido.'
      );
      return;
    }

    if (numericAmount > balance) {
      setError(
        'El monto supera tu saldo disponible.'
      );
      return;
    }

    // IMPORTANTE:
    //
    // No procesamos la transferencia aquí.
    //
    // Reutilizamos el flujo existente:
    //
    // Dashboard
    //   ↓
    // Quick Transfer
    //   ↓
    // transfer_confirm
    //   ↓
    // trackTransferConfirmed()
    //   ↓
    // operation_success

    navigate(
      'transfer_confirm',
      {
        amount:
          numericAmount.toString(),

        recipient,
      }
    );
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-r
        from-brand-orange/10
        via-brand-sidebar
        to-brand-sidebar
        border
        border-brand-orange/30
        rounded-[18px]
        p-5
        md:p-6
        shadow-xl
      "
    >
      {/* Decorative background */}
      <div
        className="
          absolute
          -right-16
          -top-16
          w-52
          h-52
          bg-brand-orange/10
          rounded-full
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          xl:flex-row
          xl:items-center
          gap-5
        "
      >
        {/* Header */}

        <div
          className="
            xl:w-[280px]
            shrink-0
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-2
            "
          >
            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-brand-orange/15
                border
                border-brand-orange/30
                flex
                items-center
                justify-center
                text-brand-orange
              "
            >
              <Zap
                className="w-5 h-5"
              />
            </div>

            <span
              className="
                px-2
                py-1
                rounded-full
                bg-brand-orange/15
                text-brand-orange
                text-[10px]
                font-bold
                uppercase
                tracking-wider
              "
            >
              Nueva
            </span>
          </div>

          <h3
            className="
              text-white
              text-lg
              font-bold
              tracking-tight
            "
          >
            {config.title}
          </h3>

          {config.subtitle && (
            <p
              className="
                text-brand-gray
                text-xs
                mt-1
                leading-relaxed
              "
            >
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Form */}

        <div
          className="
            flex-1
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-[1.15fr_1fr_auto]
            gap-3
            items-end
          "
        >
          {/* Recipient */}

          <div className="space-y-2">
            <label
              className="
                block
                text-[10px]
                text-brand-gray
                font-bold
                uppercase
                tracking-widest
              "
            >
              Destino
            </label>

            <select
              value={recipient}
              onChange={(event) => {
                setRecipient(
                  event.target.value
                );

                setError('');
              }}
              className="
                w-full
                h-12
                bg-brand-card
                border
                border-brand-border
                rounded-xl
                px-4
                text-sm
                text-white
                outline-none
                focus:border-brand-orange
                focus:ring-1
                focus:ring-brand-orange
                transition-all
              "
            >
              <option value="">
                Seleccionar contacto
              </option>

              {CONTACTS.map(
                (contact) => (
                  <option
                    key={contact}
                    value={contact}
                  >
                    {contact}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Amount */}

          <div className="space-y-2">
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <label
                className="
                  text-[10px]
                  text-brand-gray
                  font-bold
                  uppercase
                  tracking-widest
                "
              >
                Monto
              </label>

              <span
                className="
                  text-[10px]
                  text-brand-gray
                "
              >
                Disponible:{' '}
                <span
                  className="
                    text-white
                    font-medium
                  "
                >
                  {formatUSD(balance)}
                </span>
              </span>
            </div>

            <div className="relative">
              <span
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-brand-gray
                  font-bold
                "
              >
                $
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => {
                  setAmount(
                    event.target.value
                  );

                  setError('');
                }}
                placeholder="0.00"
                className="
                  w-full
                  h-12
                  bg-brand-card
                  border
                  border-brand-border
                  rounded-xl
                  pl-9
                  pr-4
                  text-white
                  font-semibold
                  outline-none
                  focus:border-brand-orange
                  focus:ring-1
                  focus:ring-brand-orange
                  transition-all
                  placeholder:text-brand-gray/50
                "
              />
            </div>
          </div>

          {/* CTA */}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="
              h-12
              px-6
              rounded-xl
              bg-brand-orange
              hover:bg-orange-600
              disabled:bg-brand-card
              disabled:text-brand-gray
              disabled:cursor-not-allowed
              text-white
              text-sm
              font-bold
              transition-all
              flex
              items-center
              justify-center
              gap-2
              whitespace-nowrap
            "
          >
            <Send
              className="w-4 h-4"
            />

            {config.buttonText}

            <ArrowRight
              className="w-4 h-4"
            />
          </button>
        </div>
      </div>

      {/* Suggested amounts */}

      <div
        className="
          relative
          z-10
          mt-4
          xl:ml-[300px]
          flex
          flex-wrap
          items-center
          gap-2
        "
      >
        <span
          className="
            text-[10px]
            uppercase
            tracking-wider
            text-brand-gray
            font-semibold
            mr-1
          "
        >
          Montos rápidos
        </span>

        {config.suggestedAmounts.map(
          (suggestedAmount) => (
            <button
              key={suggestedAmount}
              type="button"
              onClick={() =>
                handleSuggestedAmount(
                  suggestedAmount
                )
              }
              className={`
                h-8
                px-3
                rounded-lg
                border
                text-xs
                font-semibold
                transition-all

                ${
                  Number(amount) ===
                  suggestedAmount
                    ? `
                      bg-brand-orange/15
                      border-brand-orange
                      text-brand-orange
                    `
                    : `
                      bg-brand-card
                      border-brand-border
                      text-brand-gray
                      hover:border-brand-orange/50
                      hover:text-white
                    `
                }
              `}
            >
              {formatUSD(
                suggestedAmount
              )}
            </button>
          )
        )}

        {error && (
          <span
            className="
              text-xs
              text-red-400
              ml-2
            "
          >
            {error}
          </span>
        )}
      </div>
    </section>
  );
}
