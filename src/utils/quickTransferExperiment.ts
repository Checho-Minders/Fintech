import { Experiment } from '@amplitude/experiment-js-client';

// =============================================================================
// Minders Pay — Quick Transfer Feature Experiment
// =============================================================================

// Deployment utilizado actualmente por Minders Pay.
const AMPLITUDE_DEPLOYMENT_KEY =
  'client-e5i3wQyD63cEbl6DpKNbGDhq4sg3Xmfh';

// IMPORTANTE:
// Debe coincidir EXACTAMENTE con el Feature Flag Key
// creado dentro de Amplitude Experiment.
export const QUICK_TRANSFER_FLAG_KEY =
  'feature_quick-transfer';

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
  subtitle: 'Envía dinero a tus contactos frecuentes sin salir del inicio.',
  buttonText: 'Continuar',
  suggestedAmounts: [50, 100, 200],
};

// Experiment.initialize devuelve la instancia del SDK.
// Minders Pay ya inicializa Experiment en amplitude.ts.
// El SDK maneja la instancia de forma singleton.
const experimentClient = Experiment.initialize(
  AMPLITUDE_DEPLOYMENT_KEY,
  {
    // En el proyecto actual esta configuración está desactivada.
    // El exposure se enviará manualmente más abajo.
    automaticExposureTracking: false,
  }
);

// Evita enviar el mismo Exposure varias veces durante
// la misma carga de la aplicación.
const trackedExposures = new Set<string>();

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
    return fallback;
  }

  const payload = rawPayload as Record<string, unknown>;

  const suggestedAmounts = Array.isArray(
    payload.suggestedAmounts
  )
    ? payload.suggestedAmounts
        .filter(
          (value): value is number =>
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value > 0
        )
    : fallback.suggestedAmounts;

  return {
    enabled:
      typeof payload.enabled === 'boolean'
        ? payload.enabled
        : fallback.enabled,

    title:
      typeof payload.title === 'string' &&
      payload.title.trim()
        ? payload.title
        : fallback.title,

    subtitle:
      typeof payload.subtitle === 'string'
        ? payload.subtitle
        : fallback.subtitle,

    buttonText:
      typeof payload.buttonText === 'string' &&
      payload.buttonText.trim()
        ? payload.buttonText
        : fallback.buttonText,

    suggestedAmounts:
      suggestedAmounts.length > 0
        ? suggestedAmounts
        : fallback.suggestedAmounts,
  };
}

function trackExposureOnce(
  variant: string,
  userId?: string,
  deviceId?: string
): void {
  if (!variant) return;

  const identity =
    userId ||
    deviceId ||
    'anonymous';

  const exposureKey =
    `${identity}:${QUICK_TRANSFER_FLAG_KEY}:${variant}`;

  if (trackedExposures.has(exposureKey)) {
    return;
  }

  const amplitude = window.amplitude;

  if (!amplitude) {
    return;
  }

  amplitude.track('$exposure', {
    flag_key: QUICK_TRANSFER_FLAG_KEY,
    variant,
  });

  trackedExposures.add(exposureKey);
}

export async function loadQuickTransferExperiment():
  Promise<QuickTransferExperimentResult> {
  try {
    const amplitude = window.amplitude;

    const userId =
      amplitude?.getUserId?.();

    const deviceId =
      amplitude?.getDeviceId?.();

    const experimentUser: {
      user_id?: string;
      device_id?: string;
    } = {};

    if (userId) {
      experimentUser.user_id = userId;
    }

    if (deviceId) {
      experimentUser.device_id = deviceId;
    }

    // Remote Evaluation:
    // pregunta a Amplitude qué variante corresponde
    // al usuario actual.
    await experimentClient.fetch(
      Object.keys(experimentUser).length > 0
        ? experimentUser
        : undefined
    );

    const variant =
      experimentClient.variant(
        QUICK_TRANSFER_FLAG_KEY
      );

    const variantValue =
      (variant.value as string | undefined) ||
      'control';

    // Como el proyecto actual tiene
    // automaticExposureTracking:false,
    // registramos la exposición explícitamente.
    trackExposureOnce(
      variantValue,
      userId,
      deviceId
    );

    return {
      variant: variantValue,
      payload: normalizePayload(
        variant.payload,
        variantValue
      ),
    };
  } catch (error) {
    console.error(
      '[QuickTransferExperiment] Error cargando experimento',
      error
    );

    // Fail-safe:
    // si Experiment falla, mostramos CONTROL.
    return {
      variant: 'control',
      payload: DEFAULT_CONTROL_PAYLOAD,
    };
  }
}
