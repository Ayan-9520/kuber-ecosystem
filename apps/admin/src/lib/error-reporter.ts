import { errorTrackingService } from '@/services/error-tracking.service';

export function reportClientError(error: Error, context?: {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}) {
  void errorTrackingService.capture({
    source: 'CRM',
    category: context?.component ? 'COMPONENT_ERROR' : 'PAGE_CRASH',
    errorType: error.name,
    message: error.message,
    stackTrace: error.stack,
    module: context?.component ?? 'crm-admin',
    browser: navigator.userAgent,
    appVersion: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    metadata: { ...context?.metadata, action: context?.action, url: window.location.href },
  }).catch(() => {
    // silent — error reporting must not crash the app
  });
}
