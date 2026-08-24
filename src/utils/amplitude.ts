// =============================================================================
// MindersPay — Amplitude Tracking Plan gobernado
// Objetivo: enviar únicamente eventos de negocio aprobados y evitar PII.
// =============================================================================

import { Experiment } from '@amplitude/experiment-js-client';
import {
  generateUserIdFromPhone,
  persistUserId,
  getPersistedIdentity,
  clearPersistedIdentity,
  normalizePhoneToE164,
  isValidE164Phone,
} from './userId';

// ─── Configuración ───────────────────────────────────────────────────────────
const AMPLITUDE_API_KEY = '84ace0d2f36082f53ba6988af698a0b6';
const AMPLITUDE_DEPLOYMENT_KEY = 'client-e5i3wQyD63cEbl6DpKNbGDhq4sg3Xmfh';
const EVENT_SCHEMA_VERSION = '1.0.0';
const APP_VERSION = '0.0.0';
const SYNTHETIC_DATA = true;
const DEBUG_TRACKING = false;

// ─── Tipos mínimos del Unified SDK cargado desde index.html ─────────────────
type Primitive = string | number | boolean;
type EventProperties = Record<string, unknown>;

type AmplitudeIdentify = {
  set: (key: string, value: Primitive) => AmplitudeIdentify;
};

type AmplitudeGlobal = {
  Identify: new () => AmplitudeIdentify;
  init: (apiKey: string, options?: Record<string, unknown>) => unknown;
  add: (plugin: unknown) => unknown;
  track: (eventName: string, properties?: EventProperties) => unknown;
  identify: (identify: AmplitudeIdentify) => unknown;
  setUserId: (userId: string | undefined) => unknown;
  reset: () => unknown;
  getSessionId?: () => number | undefined;
  getUserId?: () => string | undefined;
  getDeviceId?: () => string | undefined;
};

declare global {
  interface Window {
    amplitude?: AmplitudeGlobal;
    sessionReplay?: {
      plugin: (options?: Record<string, unknown>) => unknown;
    };
    engagement?: {
      plugin: (options?: Record<string, unknown>) => unknown;
    };
  }
}

// ─── Catálogo de eventos permitido ──────────────────────────────────────────
const APPROVED_EVENTS = [
  // Onboarding y acceso
  'onboarding_started',
  'onboarding_completed',
  'onboarding_cta_clicked',
  'personal_data_submitted',
  'phone_submitted',
  'login_submitted',
  'activation_started',
  'pin_created',

  // KYC
  'kyc_document_viewed',
  'kyc_document_uploaded',
  'kyc_selfie_viewed',
  'kyc_selfie_uploaded',
  'kyc_validation_started',
  'kyc_validation_result',
  'kyc_error_shown',

  // Transferencias
  'transfer_started',
  'transfer_recipient_filled',
  'transfer_confirmed',
  'transfer_cancelled',
  'transfer_failed',
  'first_transaction_completed',

  // Pagos de servicios
  'pay_service_started',
  'pay_service_completed',

  // Crédito — candidatos canónicos
  'Credit Simulation Started',
  'Credit Simulation Completed',
  'Credit Application Started',
  'Credit Application Submitted',
  'Credit Application Approved',
  'Credit Application Rejected',
  'Credit Disbursed',

  // Inversión — candidatos canónicos
  'Investment Hub Viewed',
  'Investment Product Viewed',
  'Investment Account Opening Started',
  'Investment Account Opened',
  'Investment Simulation Started',
  'Investment Simulation Completed',
  'Investment Purchase Started',
  'Investment Purchase Completed',
  'Investment Purchase Failed',
] as const;

type ApprovedEventName = (typeof APPROVED_EVENTS)[number];
const APPROVED_EVENT_SET = new Set<string>(APPROVED_EVENTS);

const CREDIT_EVENTS = new Set<string>([
  'Credit Simulation Started',
  'Credit Simulation Completed',
  'Credit Application Started',
  'Credit Application Submitted',
  'Credit Application Approved',
  'Credit Application Rejected',
  'Credit Disbursed',
]);

const INVESTMENT_EVENTS = new Set<string>([
  'Investment Hub Viewed',
  'Investment Product Viewed',
  'Investment Account Opening Started',
  'Investment Account Opened',
  'Investment Simulation Started',
  'Investment Simulation Completed',
  'Investment Purchase Started',
  'Investment Purchase Completed',
  'Investment Purchase Failed',
]);

const CREDIT_PROPERTY_KEYS = new Set([
  'credit_product',
  'simulation_type',
  'application_status',
  'decision',
  'rejection_reason',
  'preapproved',
  'currency',
  'amount_band',
  'term_band',
  'channel',
  'platform',
  'app_version',
  'flow_id',
  'flow_name',
  'step_name',
  'step_order',
  'source_system',
  'event_schema_version',
  'synthetic_data',
  'screen_name',
  'session_id',
  'user_journey_id',
  'experiment_variant',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'product_area',
]);

const INVESTMENT_PROPERTY_KEYS = new Set([
  'investment_product',
  'investment_amount_band',
  'currency',
  'simulation_type',
  'investment_status',
  'failure_reason',
  'risk_profile_band',
  'term_band',
  'channel',
  'platform',
  'app_version',
  'flow_id',
  'flow_name',
  'step_name',
  'step_order',
  'source_system',
  'event_schema_version',
  'synthetic_data',
  'screen_name',
  'session_id',
  'user_journey_id',
  'experiment_variant',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'product_area',
]);

// ─── Estado interno ──────────────────────────────────────────────────────────
let amplitudeInitialized = false;
let experimentClient: ReturnType<typeof Experiment.initialize> | null = null;

const JOURNEY_STORAGE_KEY = 'minders_user_journey_id';
const FLOW_STORAGE_PREFIX = 'minders_amp_flow_';
const UTM_STORAGE_PREFIX = 'minders_amp_';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

type FlowState = {
  id: string;
  startedAt: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAmplitude(): AmplitudeGlobal | null {
  return window.amplitude ?? null;
}

function createId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

  return `${prefix}_${uuid}`;
}

function getScreenName(): string {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].trim();
  return hash || 'login';
}

function getOrCreateJourneyId(): string {
  try {
    const existing = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (existing) return existing;

    const created = createId('journey');
    localStorage.setItem(JOURNEY_STORAGE_KEY, created);
    return created;
  } catch {
    return createId('journey');
  }
}

function captureUtmContext(): EventProperties {
  const result: EventProperties = {};

  try {
    const params = new URLSearchParams(window.location.search);

    UTM_KEYS.forEach((key) => {
      const incoming = params.get(key)?.trim();
      const storageKey = `${UTM_STORAGE_PREFIX}${key}`;

      if (incoming) {
        sessionStorage.setItem(storageKey, incoming);
        result[key] = incoming;
        return;
      }

      const persisted = sessionStorage.getItem(storageKey);
      if (persisted) result[key] = persisted;
    });
  } catch {
    // El tracking nunca debe romper la aplicación por restricciones de storage.
  }

  return result;
}

function readFlow(flowName: string): FlowState | null {
  try {
    const raw = sessionStorage.getItem(`${FLOW_STORAGE_PREFIX}${flowName}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<FlowState>;
    if (typeof parsed.id === 'string' && typeof parsed.startedAt === 'number') {
      return { id: parsed.id, startedAt: parsed.startedAt };
    }
  } catch {
    // Se regenerará el flujo.
  }

  return null;
}

function startFlow(flowName: string): FlowState {
  const state: FlowState = {
    id: createId(flowName),
    startedAt: Date.now(),
  };

  try {
    sessionStorage.setItem(`${FLOW_STORAGE_PREFIX}${flowName}`, JSON.stringify(state));
  } catch {
    // Sin acción.
  }

  return state;
}

function getOrStartFlow(flowName: string): FlowState {
  return readFlow(flowName) ?? startFlow(flowName);
}

function clearFlow(flowName: string): void {
  try {
    sessionStorage.removeItem(`${FLOW_STORAGE_PREFIX}${flowName}`);
  } catch {
    // Sin acción.
  }
}

function flowContext(flowName: string, restart = false): EventProperties {
  const flow = restart ? startFlow(flowName) : getOrStartFlow(flowName);

  return {
    flow_id: flow.id,
    flow_name: flowName,
  };
}

function flowDurationSeconds(flowName: string): number | undefined {
  const flow = readFlow(flowName);
  if (!flow) return undefined;

  return Math.max(0, Math.round((Date.now() - flow.startedAt) / 1000));
}

function amountBand(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'unknown';
  if (amount <= 50) return '0_50';
  if (amount <= 100) return '51_100';
  if (amount <= 500) return '101_500';
  if (amount <= 1000) return '501_1000';
  if (amount <= 5000) return '1001_5000';

  return '5000_plus';
}

function cleanProperties(properties: EventProperties): EventProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;

      return true;
    })
  );
}

function commonProperties(): EventProperties {
  const amplitude = getAmplitude();

  return cleanProperties({
    event_schema_version: EVENT_SCHEMA_VERSION,
    channel: 'web',
    platform: 'web',
    app_version: APP_VERSION,
    screen_name: getScreenName(),
    synthetic_data: SYNTHETIC_DATA,
    session_id: amplitude?.getSessionId?.(),
    user_journey_id: getOrCreateJourneyId(),
    ...captureUtmContext(),
  });
}

function filterProperties(
  properties: EventProperties,
  allowedKeys: Set<string>
): EventProperties {
  return Object.fromEntries(
    Object.entries(cleanProperties(properties)).filter(([key]) =>
      allowedKeys.has(key)
    )
  );
}

function safeTrack(
  eventName: string,
  properties: EventProperties = {}
): void {
  // Barrera central:
  // cualquier evento que no esté en el tracking plan se descarta.
  if (!APPROVED_EVENT_SET.has(eventName)) {
    if (DEBUG_TRACKING) {
      console.info(`[MindersAmp] ⛔ Evento bloqueado: ${eventName}`);
    }

    return;
  }

  const amplitude = getAmplitude();

  if (!amplitude || !amplitudeInitialized) {
    if (DEBUG_TRACKING) {
      console.warn(
        `[MindersAmp] ⚠️ Amplitude no inicializado: ${eventName}`
      );
    }

    return;
  }

  const payload = cleanProperties({
    ...commonProperties(),
    ...properties,
  });

  try {
    if (DEBUG_TRACKING) {
      console.log(`[MindersAmp] 🔵 ${eventName}`, payload);
    }

    amplitude.track(eventName as ApprovedEventName, payload);
  } catch (error) {
    console.error(`[MindersAmp] 🔴 Error enviando ${eventName}`, error);
  }
}

function identifyUser(properties: Record<string, unknown>): void {
  const amplitude = getAmplitude();

  if (!amplitude || !amplitudeInitialized) return;

  const identify = new amplitude.Identify();

  Object.entries(properties).forEach(([key, value]) => {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      identify.set(key, value);
    }
  });

  amplitude.identify(identify);
}

function clearGovernedSessionState(): void {
  try {
    localStorage.removeItem(JOURNEY_STORAGE_KEY);

    Object.keys(sessionStorage)
      .filter(
        (key) =>
          key.startsWith(FLOW_STORAGE_PREFIX) ||
          key.startsWith(UTM_STORAGE_PREFIX)
      )
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Sin acción.
  }
}

// ─── Inicialización única ────────────────────────────────────────────────────
export function initAmplitude(): void {
  if (amplitudeInitialized) return;

  const amplitude = getAmplitude();

  if (!amplitude) {
    console.error(
      '[MindersAmp] No se encontró el Amplitude Unified SDK de index.html'
    );

    return;
  }

  try {
    // Conserva Session Replay,
    // pero evita generar Start/End Session forzados.
    if (window.sessionReplay?.plugin) {
      amplitude.add(
        window.sessionReplay.plugin({
          sampleRate: 1,
          forceSessionTracking: false,
        })
      );
    }

    // Conserva Guides & Surveys.
    if (window.engagement?.plugin) {
      amplitude.add(window.engagement.plugin());
    }

    // Sin Autocapture:
    // solo se envía el tracking explícito del contrato.
    //
    // Sin Remote Config:
    // evita que Autocapture pueda reactivarse desde UI.
    amplitude.init(AMPLITUDE_API_KEY, {
      fetchRemoteConfig: false,
      autocapture: false,
    });

    amplitudeInitialized = true;

    // Feature Experiment se conserva,
    // pero sin $exposure automático.
    experimentClient = Experiment.initialize(
      AMPLITUDE_DEPLOYMENT_KEY,
      {
        automaticExposureTracking: false,
      }
    );
  } catch (error) {
    console.error(
      '[MindersAmp] ❌ Error inicializando Amplitude',
      error
    );
  }
}

// ─── Feature Experiment ──────────────────────────────────────────────────────
export async function fetchFeatureVariants(): Promise<void> {
  if (!experimentClient) return;

  try {
    const amplitude = getAmplitude();

    const userId = amplitude?.getUserId?.();
    const deviceId = amplitude?.getDeviceId?.();

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

    await experimentClient.fetch(
      Object.keys(experimentUser).length > 0
        ? experimentUser
        : undefined
    );
  } catch (error) {
    console.error(
      '[MindersAmp] ❌ Error loading feature variants',
      error
    );
  }
}

export function getFeatureVariant(
  flagKey: string
): string | undefined {
  if (!experimentClient) return undefined;

  return experimentClient.variant(flagKey).value as
    | string
    | undefined;
}

// ─── Identidad ───────────────────────────────────────────────────────────────
export function setAmplitudeUserId(userId: string): void {
  const amplitude = getAmplitude();

  if (amplitude && userId.length >= 5) {
    amplitude.setUserId(userId);
  }
}

export function resetAmplitudeUser(): void {
  getAmplitude()?.reset();

  experimentClient?.clear();

  clearPersistedIdentity();
  clearGovernedSessionState();
}

/**
 * El teléfono solo se usa localmente para generar
 * un user_id determinístico.
 *
 * NO se envían:
 * - phone
 * - phone_digits
 * - phone_e164
 * - número crudo
 *
 * a Amplitude.
 */
export async function identifyUserByPhone(
  phone: string
): Promise<string | null> {
  if (!isValidE164Phone(phone)) {
    return null;
  }

  const phoneE164 = normalizePhoneToE164(phone);

  const userId =
    await generateUserIdFromPhone(phoneE164);

  getAmplitude()?.setUserId(userId);

  // El teléfono permanece únicamente en almacenamiento local
  // para conservar la lógica actual de identidad de Minders Pay.
  persistUserId(userId, phoneE164);

  // Refresca Feature Experiment con el identificador
  // seudonimizado, nunca con el teléfono.
  if (experimentClient) {
    const deviceId =
      getAmplitude()?.getDeviceId?.();

    void experimentClient.fetch({
      user_id: userId,
      ...(deviceId
        ? { device_id: deviceId }
        : {}),
    });
  }

  return userId;
}

export function restoreIdentity(): {
  userId: string | null;
  phone: string | null;
  phoneE164: string | null;
} {
  const {
    userId,
    phone,
    phoneE164,
  } = getPersistedIdentity();

  if (userId) {
    getAmplitude()?.setUserId(userId);
  }

  return {
    userId,
    phone,
    phoneE164,
  };
}

// =============================================================================
// ONBOARDING Y ACCESO
// =============================================================================

export function trackOnboardingStarted(): void {
  safeTrack('onboarding_started', {
    ...flowContext('onboarding', true),

    step_name: 'start',
    step_order: 0,

    source: 'login_page',
    entry_point: 'register_cta',

    account_type: 'personal',
    product_intent: 'digital_wallet',
    selected_goal: 'create_account',

    onboarding_variant: 'default',

    product_area: 'onboarding',
  });
}

export function trackLoginSubmitted(
  method: 'credentials' | 'biometric'
): void {
  safeTrack('login_submitted', {
    ...flowContext('login', true),

    step_name: 'login',
    step_order: 1,

    source: 'login_page',

    login_method: method,
    validation_status: 'success',
    retry_count: 0,

    product_area: 'access',
  });

  clearFlow('login');
}

export function trackPhoneSubmitted(
  countryCode: string
): void {
  const phoneCountryCode =
    /^\+\d{1,4}$/.test(countryCode.trim())
      ? countryCode.trim()
      : undefined;

  safeTrack('phone_submitted', {
    ...flowContext('onboarding'),

    step_name: 'phone',
    step_order: 1,

    validation_status: 'success',

    // Solo código de país.
    // Nunca el teléfono.
    phone_country_code: phoneCountryCode,

    retry_count: 0,

    product_area: 'onboarding',
  });
}

export function trackPersonalDataSubmitted(
  hasEmail: boolean,
  hasDni: boolean
): void {
  const missingFields =
    Number(!hasEmail) +
    Number(!hasDni);

  safeTrack('personal_data_submitted', {
    ...flowContext('onboarding'),

    step_name: 'personal_data',
    step_order: 2,

    validation_status:
      missingFields === 0
        ? 'success'
        : 'incomplete',

    fields_error_count: missingFields,
    retry_count: 0,

    product_area: 'onboarding',
  });

  identifyUser({
    registration_step:
      'personal_data_completed',
  });
}

export function trackPinCreated(): void {
  safeTrack('pin_created', {
    ...flowContext('onboarding'),

    step_name: 'pin_creation',
    step_order: 6,

    validation_status: 'success',
    retry_count: 0,

    product_area: 'onboarding',
  });

  identifyUser({
    registration_step: 'pin_created',
  });
}

export function trackOnboardingCompleted(): void {
  safeTrack('onboarding_completed', {
    ...flowContext('onboarding'),

    step_name: 'welcome',
    step_order: 7,

    completion_status: 'success',

    account_type: 'personal',
    product_intent: 'digital_wallet',

    time_to_complete_seconds:
      flowDurationSeconds('onboarding'),

    product_area: 'onboarding',
  });

  identifyUser({
    registration_step:
      'onboarding_completed',

    is_onboarded: true,
  });
}

export function trackOnboardingCtaClicked(): void {
  safeTrack('onboarding_cta_clicked', {
    ...flowContext('onboarding'),

    step_name: 'welcome',
    step_order: 7,

    cta_name: 'go_to_account',
    cta_position: 'welcome_primary',

    entry_point: 'onboarding_welcome',

    product_area: 'onboarding',
  });

  clearFlow('onboarding');
}

// =============================================================================
// KYC
// =============================================================================

export function trackKycDocumentViewed(): void {
  safeTrack('kyc_document_viewed', {
    ...flowContext('onboarding'),

    step_name: 'kyc_document',
    step_order: 3,

    kyc_stage: 'document',

    document_type:
      'identity_document',

    provider: 'demo_kyc',

    status: 'viewed',

    retry_count: 0,

    product_area: 'kyc',
  });
}

export function trackKycDocumentUploaded(
  side: 'front' | 'back'
): void {
  safeTrack('kyc_document_uploaded', {
    ...flowContext('onboarding'),

    step_name: 'kyc_document',
    step_order: 3,

    kyc_stage:
      side === 'front'
        ? 'document_front'
        : 'document_back',

    document_type:
      'identity_document',

    provider: 'demo_kyc',

    status: 'uploaded',

    retry_count: 0,

    product_area: 'kyc',
  });
}

export function trackKycSelfieViewed(): void {
  safeTrack('kyc_selfie_viewed', {
    ...flowContext('onboarding'),

    step_name: 'kyc_selfie',
    step_order: 4,

    kyc_stage: 'selfie',

    provider: 'demo_kyc',

    status: 'viewed',

    retry_count: 0,

    product_area: 'kyc',
  });
}

export function trackKycSelfieUploaded(): void {
  safeTrack('kyc_selfie_uploaded', {
    ...flowContext('onboarding'),

    step_name: 'kyc_selfie',
    step_order: 4,

    kyc_stage: 'selfie',

    provider: 'demo_kyc',

    status: 'uploaded',

    retry_count: 0,

    product_area: 'kyc',
  });
}

export function trackKycValidationStarted(): void {
  safeTrack('kyc_validation_started', {
    ...flowContext('onboarding'),

    step_name: 'kyc_validation',
    step_order: 5,

    kyc_stage: 'validation',

    provider: 'demo_kyc',

    status: 'started',

    retry_count: 0,

    product_area: 'kyc',
  });
}

export function trackKycValidationResult(
  status:
    | 'success'
    | 'failed'
    | 'manual_review'
): void {
  const mappedStatus =
    status === 'success'
      ? 'approved'
      : status === 'failed'
        ? 'rejected'
        : 'manual_review';

  safeTrack('kyc_validation_result', {
    ...flowContext('onboarding'),

    step_name: 'kyc_validation',
    step_order: 5,

    kyc_stage: 'validation',

    provider: 'demo_kyc',

    result: status,
    status: mappedStatus,

    reason:
      status === 'success'
        ? 'validation_passed'
        : 'validation_not_passed',

    retry_count: 0,

    product_area: 'kyc',
  });

  identifyUser({
    kyc_status: mappedStatus,
    registration_step: 'kyc_completed',
  });
}

export function trackKycErrorShown(
  errorCode: string,
  reason: string,
  retryCount = 0
): void {
  safeTrack('kyc_error_shown', {
    ...flowContext('onboarding'),

    step_name: 'kyc_validation',
    step_order: 5,

    kyc_stage: 'validation',

    provider: 'demo_kyc',

    result: 'error',
    status: 'failed',

    error_code: errorCode,
    reason,

    retry_count: retryCount,

    product_area: 'kyc',
  });
}

// =============================================================================
// ACTIVACIÓN
// =============================================================================

export function trackActivationStarted(): void {
  safeTrack('activation_started', {
    ...flowContext('activation'),

    step_name: 'dashboard_entry',
    step_order: 1,

    source: 'dashboard',

    activation_entry_point:
      'dashboard',

    phase: 'entry',

    account_status: 'active',
    account_type: 'personal',

    product_area: 'activation',
  });

  identifyUser({
    activation_phase: 'started',
  });
}

// =============================================================================
// TRANSFERENCIAS
// =============================================================================

export function trackTransferStarted(): void {
  const flow =
    flowContext('transfer', true);

  safeTrack('transfer_started', {
    ...flow,

    transfer_id: flow.flow_id,

    transfer_type: 'p2p',
    transfer_method: 'app',

    transaction_type: 'transfer',

    transfer_currency: 'USD',

    entry_point: 'transfer_screen',

    step_name: 'start',
    step_order: 1,

    source: 'dashboard',

    product_area: 'transfers',
  });
}

export function trackTransferRecipientFilled(
  method:
    | 'contact_selected'
    | 'manual_input'
): void {
  const flow =
    flowContext('transfer');

  safeTrack(
    'transfer_recipient_filled',
    {
      ...flow,

      transfer_id: flow.flow_id,

      recipient_type:
        method === 'contact_selected'
          ? 'saved_contact'
          : 'manual',

      is_saved_recipient:
        method === 'contact_selected',

      validation_status: 'success',

      retry_count: 0,

      step_name: 'recipient',
      step_order: 2,

      product_area: 'transfers',
    }
  );
}

export function trackTransferConfirmed(
  amount: number,
  _recipient: string
): void {
  const flow =
    flowContext('transfer');

  safeTrack('transfer_confirmed', {
    ...flow,

    transfer_id: flow.flow_id,

    transfer_type: 'p2p',
    transfer_method: 'app',

    transfer_currency: 'USD',

    // El monto crudo NO se envía.
    transfer_amount_band:
      amountBand(amount),

    transfer_fee_usd: 0,

    transaction_status: 'confirmed',

    confirmation_method: 'cta',

    step_name: 'confirmation',
    step_order: 3,

    product_area: 'transfers',
  });

  clearFlow('transfer');
}

export function trackTransferCancelled(
  cancelReason: string
): void {
  const flow =
    flowContext('transfer');

  safeTrack('transfer_cancelled', {
    ...flow,

    transfer_id: flow.flow_id,

    transfer_type: 'p2p',
    transfer_method: 'app',

    transaction_status: 'cancelled',

    cancel_reason: cancelReason,

    retry_count: 0,

    step_name: 'cancelled',
    step_order: 3,

    product_area: 'transfers',
  });

  clearFlow('transfer');
}

export function trackTransferFailed(
  failureReason: string,
  errorCode: string,
  retryCount = 0
): void {
  const flow =
    flowContext('transfer');

  safeTrack('transfer_failed', {
    ...flow,

    transfer_id: flow.flow_id,

    transfer_type: 'p2p',
    transfer_method: 'app',

    transaction_status: 'failed',

    failure_reason: failureReason,
    error_code: errorCode,

    retry_count: retryCount,

    step_name: 'confirmation',
    step_order: 3,

    product_area: 'transfers',
  });
}

export function trackFirstTransactionCompleted(
  type:
    | 'transfer'
    | 'pay_services'
    | 'mobile_topup',
  amount: number
): void {
  safeTrack(
    'first_transaction_completed',
    {
      ...flowContext('activation'),

      transaction_type: type,

      product_area:
        type === 'transfer'
          ? 'transfers'
          : type === 'pay_services'
            ? 'pay_services'
            : 'mobile_topup',

      transaction_currency: 'USD',

      // El monto crudo NO se envía.
      amount_band:
        amountBand(amount),

      completion_status: 'success',

      step_name:
        'first_transaction_completed',

      step_order: 2,
    }
  );

  identifyUser({
    activation_phase: 'activated',
    is_activated: true,

    activation_transaction_type:
      type,
  });
}

// =============================================================================
// PAGOS DE SERVICIOS
// =============================================================================

export function trackPayServiceStarted(): void {
  safeTrack('pay_service_started', {
    ...flowContext(
      'pay_service',
      true
    ),

    step_name: 'start',
    step_order: 1,

    phase: 'first_transaction',

    source: 'dashboard',

    source_screen: 'pay_services',

    product_area: 'pay_services',

    app_section: 'services',
  });
}

export function trackPayServiceCompleted(
  serviceName: string,
  amount: number
): void {
  const flow =
    flowContext('pay_service');

  safeTrack(
    'pay_service_completed',
    {
      ...flow,

      // Nombre del proveedor,
      // no referencia del usuario.
      service_provider: serviceName,

      // El monto crudo NO se envía.
      amount_bucket:
        amountBand(amount),

      currency: 'USD',

      payment_method:
        'minders_balance',

      payment_status: 'completed',

      completion_status: 'success',

      service_payment_id:
        flow.flow_id,

      step_name: 'completed',
      step_order: 4,

      product_area:
        'pay_services',
    }
  );

  clearFlow('pay_service');
}

// =============================================================================
// CRÉDITO E INVERSIÓN
//
// API canónica lista para ser utilizada.
//
// IMPORTANTE:
// No se disparan automáticamente todavía porque en el tracking plan
// estos eventos siguen marcados como "unexpected" / candidatos.
// Eso evita formalizar por accidente una semántica incorrecta.
// =============================================================================

export function trackCreditEvent(
  eventName:
    | 'Credit Simulation Started'
    | 'Credit Simulation Completed'
    | 'Credit Application Started'
    | 'Credit Application Submitted'
    | 'Credit Application Approved'
    | 'Credit Application Rejected'
    | 'Credit Disbursed',

  properties: EventProperties = {}
): void {
  if (!CREDIT_EVENTS.has(eventName)) {
    return;
  }

  const payload =
    filterProperties(
      {
        ...commonProperties(),

        ...flowContext('credit'),

        product_area: 'credit',

        ...properties,
      },
      CREDIT_PROPERTY_KEYS
    );

  safeTrack(
    eventName,
    payload
  );
}

export function trackInvestmentEvent(
  eventName:
    | 'Investment Hub Viewed'
    | 'Investment Product Viewed'
    | 'Investment Account Opening Started'
    | 'Investment Account Opened'
    | 'Investment Simulation Started'
    | 'Investment Simulation Completed'
    | 'Investment Purchase Started'
    | 'Investment Purchase Completed'
    | 'Investment Purchase Failed',

  properties: EventProperties = {}
): void {
  if (
    !INVESTMENT_EVENTS.has(eventName)
  ) {
    return;
  }

  const payload =
    filterProperties(
      {
        ...commonProperties(),

        ...flowContext('investment'),

        product_area: 'investment',

        ...properties,
      },
      INVESTMENT_PROPERTY_KEYS
    );

  safeTrack(
    eventName,
    payload
  );
}

// =============================================================================
// EVENTOS RETIRADOS DEL TRACKING PLAN
//
// Se mantienen exclusivamente las funciones para que las pantallas
// actuales no necesiten modificarse.
//
// Son NO-OP:
// NO generan eventos.
// NO generan Identify.
// NO envían datos a Amplitude.
// =============================================================================

export function trackBalanceViewed(
  _action: 'show' | 'hide'
): void {}

export function trackQuickActionTapped(
  _actionLabel: string,
  _destination: string
): void {}

export function trackCardViewed(): void {}

export function trackTopupStarted(): void {}

export function trackTopupChannelSelected(
  _channel:
    | 'bank_transfer'
    | 'cash'
): void {}

export function trackTopupCompleted(
  _amount: number,
  _channel: string
): void {}

export function trackMobileTopupStarted(): void {}

export function trackMobileTopupCompleted(
  _operator: string,
  _amount: number,
  _country: string
): void {}

export function trackMovementsViewed(): void {}

export function trackPocketCreated(
  _name: string,
  _goalAmount: number
): void {}

export function trackProfileViewed(): void {}
