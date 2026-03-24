// =============================================================================
// MinderspPay — Amplitude Onboarding Tracking
// Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2
// =============================================================================
//
// INSTALACIÓN:
//   npm install @amplitude/analytics-browser
//
// USO:
//   1. Llamar initAmplitude() en main.tsx al arrancar la app
//   2. Importar las funciones track* en cada pantalla y llamarlas en los handlers
//
// =============================================================================

import * as amplitude from '@amplitude/analytics-browser';
import { Identify } from '@amplitude/analytics-browser';

// ─── Reemplaza con tu API Key real de Amplitude ─────────────────────────────
// Amplitude > Settings > Projects > tu proyecto > API Key
const AMPLITUDE_API_KEY = 'TU_AMPLITUDE_API_KEY_AQUI';

// ─── Inicialización ─────────────────────────────────────────────────────────
// Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2#initialize-the-sdk
export function initAmplitude(): void {
  amplitude.init(AMPLITUDE_API_KEY, {
    // Autocapture: captura automática sin código adicional
    // Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2#autocapture
    autocapture: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      attribution: true,
      fileDownloads: false,
      elementInteractions: false,
    },
    // Cambiar a amplitude.Types.LogLevel.Debug durante desarrollo
    // Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2#debugging
    logLevel: amplitude.Types.LogLevel.Warn,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function identifyUser(properties: Record<string, unknown>): void {
  const id = new Identify();
  Object.entries(properties).forEach(([key, value]) => {
    id.set(key, value as string | number | boolean);
  });
  amplitude.identify(id);
}

// Ref: https://amplitude.com/docs/get-started/identify-users
// userId debe tener mínimo 5 caracteres
export function setAmplitudeUserId(userId: string): void {
  if (userId && userId.length >= 5) {
    amplitude.setUserId(userId);
  }
}

// Ref: https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2#sending-events
export function resetAmplitudeUser(): void {
  amplitude.reset();
}

// =============================================================================
// EVENTOS DEL ONBOARDING
// =============================================================================
//
// | #  | Evento                     | Pantalla              | Trigger                              |
// |----|----------------------------|-----------------------|--------------------------------------|
// | 1  | onboarding_started         | Login                 | Clic "Regístrate gratis"             |
// | 2  | login_submitted            | Login                 | Clic "Iniciar sesión" / biométrica   |
// | 3  | phone_submitted            | RegisterPhone         | Clic "Continuar"                     |
// | 4  | personal_data_submitted    | RegisterData          | Clic "Continuar"                     |
// | 5  | kyc_document_viewed        | KycDoc                | Pantalla montada                     |
// | 6  | kyc_document_uploaded      | KycDoc                | Clic "Continuar"                     |
// | 7  | kyc_selfie_viewed          | KycSelfie             | Pantalla montada                     |
// | 8  | kyc_selfie_uploaded        | KycSelfie             | Clic "Continuar"                     |
// | 9  | kyc_validation_started     | KycReview             | Pantalla montada                     |
// | 10 | kyc_validation_result      | KycReview             | Clic "Simular validación exitosa"    |
// | 11 | pin_created                | PinCreate             | Clic "Confirmar PIN"                 |
// | 12 | onboarding_completed       | Welcome               | Pantalla montada                     |
// | 13 | onboarding_cta_clicked     | Welcome               | Clic "Ir a mi cuenta"                |
// =============================================================================

// ── LOGIN ────────────────────────────────────────────────────────────────────

export function trackOnboardingStarted(): void {
  amplitude.track('onboarding_started', {
    source: 'login_page',
  });
}

export function trackLoginSubmitted(method: 'credentials' | 'biometric'): void {
  amplitude.track('login_submitted', {
    method,
  });
}

// ── REGISTRO: Celular ────────────────────────────────────────────────────────

export function trackPhoneSubmitted(countryCode: string): void {
  amplitude.track('phone_submitted', {
    country_code: countryCode,
    step_number: 1,
    step_name: 'phone',
  });
}

// ── REGISTRO: Datos personales ───────────────────────────────────────────────

export function trackPersonalDataSubmitted(hasEmail: boolean, hasDni: boolean): void {
  amplitude.track('personal_data_submitted', {
    has_email: hasEmail,
    has_dni: hasDni,
    step_number: 2,
    step_name: 'personal_data',
  });
  identifyUser({
    registration_step: 'personal_data_completed',
    country: 'AR',
  });
}

// ── KYC: Documento ───────────────────────────────────────────────────────────

export function trackKycDocumentViewed(): void {
  amplitude.track('kyc_document_viewed', {
    step_number: 3,
    step_name: 'kyc_document',
  });
}

export function trackKycDocumentUploaded(side: 'front' | 'back'): void {
  amplitude.track('kyc_document_uploaded', {
    side,
    step_number: 3,
    step_name: 'kyc_document',
  });
}

// ── KYC: Selfie ──────────────────────────────────────────────────────────────

export function trackKycSelfieViewed(): void {
  amplitude.track('kyc_selfie_viewed', {
    step_number: 4,
    step_name: 'kyc_selfie',
  });
}

export function trackKycSelfieUploaded(): void {
  amplitude.track('kyc_selfie_uploaded', {
    step_number: 4,
    step_name: 'kyc_selfie',
  });
}

// ── KYC: Validación ──────────────────────────────────────────────────────────

export function trackKycValidationStarted(): void {
  amplitude.track('kyc_validation_started', {
    step_number: 5,
    step_name: 'kyc_validation',
  });
}

export function trackKycValidationResult(status: 'success' | 'failed' | 'manual_review'): void {
  amplitude.track('kyc_validation_result', {
    status,
    step_number: 5,
    step_name: 'kyc_validation',
  });
  identifyUser({
    kyc_status: status,
    registration_step: 'kyc_completed',
  });
}

// ── PIN ──────────────────────────────────────────────────────────────────────

export function trackPinCreated(): void {
  amplitude.track('pin_created', {
    step_number: 6,
    step_name: 'pin_creation',
  });
  identifyUser({
    registration_step: 'pin_created',
  });
}

// ── BIENVENIDA ───────────────────────────────────────────────────────────────

export function trackOnboardingCompleted(): void {
  amplitude.track('onboarding_completed', {
    step_number: 7,
    step_name: 'welcome',
  });
  identifyUser({
    registration_step: 'onboarding_completed',
    is_onboarded: true,
  });
}

export function trackOnboardingCtaClicked(): void {
  amplitude.track('onboarding_cta_clicked', {
    cta_text: 'ir_a_mi_cuenta',
  });
}
