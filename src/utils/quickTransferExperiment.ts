import {
  Experiment,
  LogLevel,
} from '@amplitude/experiment-js-client';

// =============================================================================
// MINDERS PAY
// Feature Experiment — Quick Transfer
// =============================================================================
//
// Arquitectura:
//
// Amplitude Analytics
//       │
//       │ user_id / device_id
//       ▼
// Amplitude Experiment
//       │
//       │ feature_quick-transfer
//       ▼
// ┌─────────────┬─────────────┐
// │   control   │  treatment  │
// └─────────────┴─────────────┘
//
// CONTROL:
//   Quick Transfer no aparece.
//
// TREATMENT:
//   Quick Transfer aparece y utiliza el payload enviado desde Amplitude.
//
// =============================================================================


// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * IMPORTANTE:
 *
 * Esta key DEBE ser exactamente la Client Deployment Key
 * del deployment de Amplitude que está asociado al experimento
 * "Feature_Quick transfer".
 *
 * Verificar en:
 *
 * Amplitude
 * → Experiment
 * → Deployments
 * → minders_pay
 *
 */
const AMPLITUDE_DEPLOYMENT_KEY =
  'client-e5i3wQyD63cEbl6DpKNbGDhq4sg3Xmfh';


/**
 * Debe coincidir EXACTAMENTE con:
 *
 * Amplitude
 * → Feature_Quick transfer
 * → Delivery
 * → Feature Flag
 */
export const QUICK_TRANSFER_FLAG_KEY =
  'feature_quick-transfer';


/**
 * Creamos una instancia independiente.
 *
 * Esto evita compartir accidentalmente el singleton
 * que actualmente utiliza amplitude.ts.
 */
const EXPERIMENT_INSTANCE_NAME =
  'minders-pay-quick-transfer';


// =============================================================================
// TIPOS
// =============================================================================

export type QuickTransferPayload = {
  enabled: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  suggestedAmounts: number[];
};


export type QuickTransferExperimentResult = {
  variant: string;
  payload: QuickTransferPayload;
};


// =============================================================================
// PAYLOADS DE SEGURIDAD
// =============================================================================

const DEFAULT_CONTROL_PAYLOAD: QuickTransferPayload = {
  enabled: false,
  title: 'Transferencia rápida',
  subtitle: '',
  buttonText: 'Continuar',
  suggestedAmounts: [50, 100, 200],
};


const DEFAULT_TREATMENT_PAYLOAD: QuickTransferPayload = {
  enabled: true,
  title: 'Transferencia rápida',
  subtitle:
    'Envía dinero a tus contactos frecuentes sin salir del inicio.',
  buttonText: 'Continuar',
  suggestedAmounts: [50, 100, 200],
};


// =============================================================================
// TIPOS MÍNIMOS DE AMPLITUDE ANALYTICS
// =============================================================================

type ExperimentExposure = {
  flag_key: string;
  variant: string;
};


// =============================================================================
// USER PROVIDER
// =============================================================================
//
// Experiment debe evaluar EXACTAMENTE el mismo usuario
// que Amplitude Analytics.
//
// La documentación de Amplitude recomienda mantener sincronizada
// la identidad entre Analytics y Experiment.
//
// =============================================================================

const userProvider = {
  getUser() {
    const amplitude = window.amplitude;

    return {
      user_id:
        amplitude?.getUserId?.(),

      device_id:
        amplitude?.getDeviceId?.(),
    };
  },
};


// =============================================================================
// EXPOSURE PROVIDER
// =============================================================================
//
// Cuando variant() es consultado, Experiment registrará automáticamente
// el $exposure utilizando Amplitude Analytics.
//
// Esto es necesario para que Amplitude pueda saber:
// "este usuario realmente experimentó Treatment".
//
// =============================================================================

const exposureTrackingProvider = {
  track(exposure: ExperimentExposure) {

    const amplitude = window.amplitude;

    if (!amplitude) {

      console.warn(
        '[QuickTransfer Experiment] Amplitude Analytics no está disponible para registrar exposure.'
      );

      return;
    }

    amplitude.track(
      '$exposure',
      {
        flag_key:
          exposure.flag_key,

        variant:
          exposure.variant,
      }
    );
  },
};


// =============================================================================
// CLIENTE EXPERIMENT
// =============================================================================
//
// Inicialización lazy.
//
// No inicializamos durante la carga del módulo.
// Esperamos hasta que realmente necesitemos evaluar el experimento.
//
// =============================================================================

let experimentClient:
  ReturnType<typeof Experiment.initialize> | null =
  null;


function getExperimentClient() {

  if (experimentClient) {
    return experimentClient;
  }

  experimentClient =
    Experiment.initialize(
      AMPLITUDE_DEPLOYMENT_KEY,
      {
        /**
         * MUY IMPORTANTE:
         *
         * Evita reutilizar el singleton default que actualmente
         * crea amplitude.ts.
         */
        instanceName:
          EXPERIMENT_INSTANCE_NAME,


        /**
         * Mantiene Analytics y Experiment utilizando
         * la misma identidad.
         */
        userProvider,


        /**
         * Permite que variant() registre automáticamente
         * $exposure.
         */
        exposureTrackingProvider,


        automaticExposureTracking:
          true,


        /**
         * Durante la configuración del POC dejamos Debug activo.
         *
         * Esto permite ver claramente en Chrome Console
         * qué está haciendo Experiment.
         */
        logLevel:
          LogLevel.Debug,
      }
    );


  return experimentClient;
}


// =============================================================================
// NORMALIZACIÓN DEL PAYLOAD
// =============================================================================

function normalizePayload(
  rawPayload: unknown,
  variant: string
): QuickTransferPayload {

  const fallback =
    variant === 'treatment'
      ? DEFAULT_TREATMENT_PAYLOAD
      : DEFAULT_CONTROL_PAYLOAD;


  if (
    !rawPayload ||
    typeof rawPayload !== 'object' ||
    Array.isArray(rawPayload)
  ) {

    console.warn(
      '[QuickTransfer Experiment] Payload inexistente o inválido. Usando fallback.',
      {
        variant,
        rawPayload,
      }
    );

    return fallback;
  }


  const payload =
    rawPayload as Record<string, unknown>;


  const suggestedAmounts =
    Array.isArray(
      payload.suggestedAmounts
    )
      ? payload.suggestedAmounts.filter(
          (
            value
          ): value is number =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value > 0
        )
      : fallback.suggestedAmounts;


  return {

    enabled:
      typeof payload.enabled ===
      'boolean'
        ? payload.enabled
        : fallback.enabled,


    title:
      typeof payload.title ===
        'string' &&
      payload.title.trim()
        ? payload.title
        : fallback.title,


    subtitle:
      typeof payload.subtitle ===
      'string'
        ? payload.subtitle
        : fallback.subtitle,


    buttonText:
      typeof payload.buttonText ===
        'string' &&
      payload.buttonText.trim()
        ? payload.buttonText
        : fallback.buttonText,


    suggestedAmounts:
      suggestedAmounts.length > 0
        ? suggestedAmounts
        : fallback.suggestedAmounts,
  };
}


// =============================================================================
// CARGAR FEATURE EXPERIMENT
// =============================================================================

export async function loadQuickTransferExperiment():
  Promise<QuickTransferExperimentResult> {

  const amplitude =
    window.amplitude;


  // ---------------------------------------------------------------------------
  // 1. IDENTIDAD
  // ---------------------------------------------------------------------------

  const userId =
    amplitude?.getUserId?.();


  const deviceId =
    amplitude?.getDeviceId?.();


  console.info(
    '[QuickTransfer Experiment] Identidad usada para evaluación:',
    {
      user_id:
        userId,

      device_id:
        deviceId,
    }
  );


  if (
    !userId &&
    !deviceId
  ) {

    console.error(
      '[QuickTransfer Experiment] No existe User ID ni Device ID. Experiment no puede evaluar al usuario.'
    );


    return {
      variant: 'control',
      payload:
        DEFAULT_CONTROL_PAYLOAD,
    };
  }


  // ---------------------------------------------------------------------------
  // 2. CREAR / OBTENER CLIENTE
  // ---------------------------------------------------------------------------

  const client =
    getExperimentClient();


  try {

    // -------------------------------------------------------------------------
    // 3. ELIMINAR VARIANTES ANTERIORES
    // -------------------------------------------------------------------------
    //
    // Durante testing queremos evitar que quede una asignación anterior
    // almacenada en localStorage.
    //
    // En un producto real podríamos eliminar este clear().
    //
    // -------------------------------------------------------------------------

    client.clear();


    // -------------------------------------------------------------------------
    // 4. REMOTE EVALUATION
    // -------------------------------------------------------------------------
    //
    // Amplitude recomienda volver a ejecutar fetch()
    // después de un cambio significativo de identidad,
    // por ejemplo después del login.
    //
    // Le enviamos explícitamente User ID + Device ID.
    //
    // -------------------------------------------------------------------------

    await client.fetch(
      {
        ...(userId
          ? {
              user_id:
                userId,
            }
          : {}),

        ...(deviceId
          ? {
              device_id:
                deviceId,
            }
          : {}),
      }
    );


    // -------------------------------------------------------------------------
    // 5. DEBUG: TODAS LAS VARIANTES
    // -------------------------------------------------------------------------

    const allVariants =
      client.all();


    console.info(
      '[QuickTransfer Experiment] Variantes devueltas por Amplitude:',
      allVariants
    );


    // -------------------------------------------------------------------------
    // 6. OBTENER QUICK TRANSFER
    // -------------------------------------------------------------------------

    const variant =
      client.variant(
        QUICK_TRANSFER_FLAG_KEY
      );


    console.info(
      '[QuickTransfer Experiment] Resultado de feature_quick-transfer:',
      {
        value:
          variant.value,

        payload:
          variant.payload,
      }
    );


    // -------------------------------------------------------------------------
    // 7. AMPLITUDE NO DEVOLVIÓ EL FLAG
    // -------------------------------------------------------------------------

    if (!variant.value) {

      console.error(
        [
          '[QuickTransfer Experiment] ❌ Amplitude NO devolvió',
          QUICK_TRANSFER_FLAG_KEY,
          '',
          'Verifica:',
          '1. que el experimento tenga seleccionado el deployment minders_pay;',
          '2. que la deployment key del código coincida con ese deployment;',
          '3. que Test Instrumentation esté activo;',
          '4. que este User ID esté asignado a Treatment.',
        ].join('\n')
      );


      return {
        variant: 'control',
        payload:
          DEFAULT_CONTROL_PAYLOAD,
      };
    }


    // -------------------------------------------------------------------------
    // 8. CONTROL
    // -------------------------------------------------------------------------

    if (
      variant.value ===
      'control'
    ) {

      console.info(
        '[QuickTransfer Experiment] Usuario asignado a CONTROL.'
      );


      return {
        variant:
          'control',

        payload:
          normalizePayload(
            variant.payload,
            'control'
          ),
      };
    }


    // -------------------------------------------------------------------------
    // 9. TREATMENT
    // -------------------------------------------------------------------------

    if (
      variant.value ===
      'treatment'
    ) {

      const payload =
        normalizePayload(
          variant.payload,
          'treatment'
        );


      console.info(
        '[QuickTransfer Experiment] ✅ Usuario asignado a TREATMENT.',
        payload
      );


      return {
        variant:
          'treatment',

        payload,
      };
    }


    // -------------------------------------------------------------------------
    // 10. VARIANTE DESCONOCIDA
    // -------------------------------------------------------------------------

    console.warn(
      '[QuickTransfer Experiment] Variante desconocida:',
      variant.value
    );


    return {
      variant:
        String(
          variant.value
        ),

      payload:
        normalizePayload(
          variant.payload,
          String(
            variant.value
          )
        ),
    };

  } catch (error) {

    console.error(
      '[QuickTransfer Experiment] ❌ Error ejecutando Remote Evaluation:',
      error
    );


    return {
      variant:
        'control',

      payload:
        DEFAULT_CONTROL_PAYLOAD,
    };
  }
}
