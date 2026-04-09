// =============================================================================
// MinderspPay — Amplitude Tracking: Onboarding + Activación + Experiments
// Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2
// =============================================================================

import * as amplitude from '@amplitude/analytics-browser';
import { Identify } from '@amplitude/analytics-browser';
import { Experiment } from '@amplitude/experiment-js-client';

// ─── Claves de Amplitude ─────────────────────────────────────────────────────
const AMPLITUDE_API_KEY = '84ace0d2f36082f53ba6988af698a0b6';

// ✅ NUEVO: Deployment Key para Feature Experiment
// Cómo obtenerla: Amplitude → Experiment → Deployments → tu deployment → copia la clave
const AMPLITUDE_DEPLOYMENT_KEY = 'client-e5i3wQyD63cEbl6DpKNbGDhq4sg3Xmfh';

// ─── DEBUG: Cambiar a false cuando confirmes que los eventos llegan ───────────
const DEBUG_ACTIVATION = true;

// ─── Cliente de Feature Experiment ───────────────────────────────────────────
// Se inicializa en initAmplitude() y se usa con getFeatureVariant()
let experimentClient: ReturnType<typeof Experiment.initializeWithAmplitudeAnalytics> | null = null;

// ─── Inicialización ──────────────────────────────────────────────────────────
export function initAmplitude(): void {
  amplitude.init(AMPLITUDE_API_KEY, {
    autocapture: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      attribution: true,
      fileDownloads: false,
      elementInteractions: false,
    },
    logLevel: amplitude.Types.LogLevel.Debug,
  });

  // ✅ NUEVO: Inicializa Feature Experiment conectado a Analytics
  experimentClient = Experiment.initializeWithAmplitudeAnalytics(AMPLITUDE_DEPLOYMENT_KEY);

  if (DEBUG_ACTIVATION) {
    console.log('[MindersAmp] ✅ Amplitude + Feature Experiment initialized');
  }
}

// ─── Feature Experiment ──────────────────────────────────────────────────────
//
// USO: Llama fetchFeatureVariants() UNA vez al cargar la app (ya está en initAmplitude).
//      Luego usa getFeatureVariant('nombre-del-flag') en cualquier pantalla.
//
// EJEMPLO de uso en una pantalla:
//   const variant = getFeatureVariant('boton-color-test');
//   if (variant === 'verde') {
//     // muestra botón verde
//   } else {
//     // muestra botón original
//   }

export async function fetchFeatureVariants(): Promise<void> {
  if (!experimentClient) return;
  try {
    await experimentClient.fetch();
    if (DEBUG_ACTIVATION) {
      console.log('[MindersAmp] ✅ Feature variants loaded');
    }
  } catch (error) {
    console.error('[MindersAmp] ❌ Error loading feature variants', error);
  }
}

export function getFeatureVariant(flagKey: string): string | undefined {
  if (!experimentClient) return undefined;
  const variant = experimentClient.variant(flagKey);
  if (DEBUG_ACTIVATION) {
    console.log(`[MindersAmp] 🧪 Flag "${flagKey}" → variant: "${variant.value}"`);
  }
  return variant.value as string | undefined;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function identifyUser(properties: Record<string, unknown>): void {
  const id = new Identify();
  Object.entries(properties).forEach(([key, value]) => {
    id.set(key, value as string | number | boolean);
  });
  amplitude.identify(id);
}

function safeTrack(eventName: string, properties: Record<string, unknown>): void {
  try {
    if (DEBUG_ACTIVATION) {
      console.log(`[MindersAmp] 🔵 Sending: ${eventName}`, properties);
    }
    amplitude.track(eventName, properties);
  } catch (error) {
    console.error(`[MindersAmp] 🔴 FAILED: ${eventName}`, error);
  }
}

export function setAmplitudeUserId(userId: string): void {
  if (userId && userId.length >= 5) {
    amplitude.setUserId(userId);
  }
}

export function resetAmplitudeUser(): void {
  amplitude.reset();
}

// =============================================================================
// EVENTOS DEL ONBOARDING
// =============================================================================

export function trackOnboardingStarted(): void {
  amplitude.track('onboarding_started', { source: 'login_page' });
}

export function trackLoginSubmitted(method: 'credentials' | 'biometric'): void {
  amplitude.track('login_submitted', { method });
}

export function trackPhoneSubmitted(countryCode: string): void {
  amplitude.track('phone_submitted', {
    country_code: countryCode,
    step_number: 1,
    step_name: 'phone',
  });
}

export function trackPersonalDataSubmitted(hasEmail: boolean, hasDni: boolean): void {
  amplitude.track('personal_data_submitted', {
    has_email: hasEmail,
    has_dni: hasDni,
    step_number: 2,
    step_name: 'personal_data',
  });
  identifyUser({ registration_step: 'personal_data_completed', country: 'AR' });
}

export function trackKycDocumentViewed(): void {
  amplitude.track('kyc_document_viewed', { step_number: 3, step_name: 'kyc_document' });
}

export function trackKycDocumentUploaded(side: 'front' | 'back'): void {
  amplitude.track('kyc_document_uploaded', { side, step_number: 3, step_name: 'kyc_document' });
}

export function trackKycSelfieViewed(): void {
  amplitude.track('kyc_selfie_viewed', { step_number: 4, step_name: 'kyc_selfie' });
}

export function trackKycSelfieUploaded(): void {
  amplitude.track('kyc_selfie_uploaded', { step_number: 4, step_name: 'kyc_selfie' });
}

export function trackKycValidationStarted(): void {
  amplitude.track('kyc_validation_started', { step_number: 5, step_name: 'kyc_validation' });
}

export function trackKycValidationResult(status: 'success' | 'failed' | 'manual_review'): void {
  amplitude.track('kyc_validation_result', { status, step_number: 5, step_name: 'kyc_validation' });
  identifyUser({ kyc_status: status, registration_step: 'kyc_completed' });
}

export function trackPinCreated(): void {
  amplitude.track('pin_created', { step_number: 6, step_name: 'pin_creation' });
  identifyUser({ registration_step: 'pin_created' });
}

export function trackOnboardingCompleted(): void {
  amplitude.track('onboarding_completed', { step_number: 7, step_name: 'welcome' });
  identifyUser({ registration_step: 'onboarding_completed', is_onboarded: true });
}

export function trackOnboardingCtaClicked(): void {
  amplitude.track('onboarding_cta_clicked', { cta_text: 'ir_a_mi_cuenta' });
}

// =============================================================================
// EVENTOS DE ACTIVACIÓN
// =============================================================================

export function trackActivationStarted(): void {
  amplitude.track('activation_started', { source: 'dashboard', phase: 'entry' });
  identifyUser({ activation_phase: 'started' });
}

export function trackBalanceViewed(action: 'show' | 'hide'): void {
  amplitude.track('balance_viewed', { action, phase: 'exploration' });
}

export function trackQuickActionTapped(actionLabel: string, destination: string): void {
  amplitude.track('quick_action_tapped', { action_label: actionLabel, destination, phase: 'exploration' });
}

export function trackCardViewed(): void {
  amplitude.track('card_viewed', { phase: 'exploration' });
}

export function trackTopupStarted(): void {
  amplitude.track('topup_started', { phase: 'funding' });
}

export function trackTopupChannelSelected(channel: 'bank_transfer' | 'cash'): void {
  safeTrack('topup_channel_selected', { channel, phase: 'funding' });
}

export function trackTopupCompleted(amount: number, channel: string): void {
  safeTrack('topup_completed', { amount, channel, phase: 'funding' });
  identifyUser({ activation_phase: 'funded', has_funded: true, first_topup_amount: amount });
}

export function trackTransferStarted(): void {
  amplitude.track('transfer_started', { phase: 'first_transaction' });
}

export function trackTransferRecipientFilled(method: 'contact_selected' | 'manual_input'): void {
  amplitude.track('transfer_recipient_filled', { method, phase: 'first_transaction' });
}

export function trackTransferConfirmed(amount: number, recipient: string): void {
  amplitude.track('transfer_confirmed', { amount, recipient, phase: 'first_transaction' });
}

export function trackPayServiceStarted(): void {
  amplitude.track('pay_service_started', { phase: 'first_transaction' });
}

export function trackPayServiceCompleted(serviceName: string, amount: number): void {
  amplitude.track('pay_service_completed', { service_name: serviceName, amount, phase: 'first_transaction' });
}

export function trackMobileTopupStarted(): void {
  safeTrack('mobile_topup_started', { phase: 'first_transaction' });
}

export function trackMobileTopupCompleted(operator: string, amount: number, country: string): void {
  safeTrack('mobile_topup_completed', { operator, amount, country, phase: 'first_transaction' });
}

export function trackFirstTransactionCompleted(
  type: 'transfer' | 'pay_services' | 'mobile_topup',
  amount: number
): void {
  amplitude.track('first_transaction_completed', { transaction_type: type, amount, phase: 'aha_moment' });
  identifyUser({ activation_phase: 'activated', is_activated: true, activation_transaction_type: type });
}

export function trackMovementsViewed(): void {
  safeTrack('movements_viewed', { phase: 'engagement' });
}

export function trackPocketCreated(name: string, goalAmount: number): void {
  safeTrack('pocket_created', { pocket_name: name, goal_amount: goalAmount, phase: 'engagement' });
  identifyUser({ has_pocket: true });
}

export function trackProfileViewed(): void {
  safeTrack('profile_viewed', { phase: 'engagement' });
}
