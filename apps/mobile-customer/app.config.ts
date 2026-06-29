import { existsSync } from 'node:fs';

import type { ExpoConfig } from 'expo/config';

type AppEnv = 'development' | 'qa' | 'staging' | 'production';

const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as AppEnv;

const API_URLS: Record<AppEnv, string> = {
  development: process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '',
  qa: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://qa-api.kuberone.com/api/v1',
  staging: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://staging-api.kuberone.com/api/v1',
  production: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.kuberone.com/api/v1',
};

const PACKAGE_IDS: Record<AppEnv, string> = {
  development: 'com.kuberone.customer.debug',
  qa: 'com.kuberone.customer.qa',
  staging: 'com.kuberone.customer.staging',
  production: 'com.kuberone.customer',
};

const VERSION_CODE: Record<AppEnv, number> = {
  development: 10003,
  qa: 10002,
  staging: 10001,
  production: 10000,
};

const config: ExpoConfig = {
  name: APP_ENV === 'production' ? 'KuberOne' : `KuberOne (${APP_ENV})`,
  slug: 'kuberone-customer',
  scheme: 'kuberone',
  version: '1.0.0',
  jsEngine: 'hermes',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#071A1F',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: PACKAGE_IDS[APP_ENV],
    buildNumber: String(VERSION_CODE[APP_ENV]),
    config: { usesNonExemptEncryption: false },
    ...(APP_ENV === 'production'
      ? { associatedDomains: ['applinks:kuberone.com', 'applinks:www.kuberone.com'] }
      : {}),
    ...(existsSync(process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist')
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist' }
      : {}),
    infoPlist: {
      NSCameraUsageDescription:
        'KuberOne uses the camera to capture KYC documents and loan-related photos for verification.',
      NSPhotoLibraryUsageDescription:
        'KuberOne accesses your photo library so you can upload identity and income documents.',
      NSPhotoLibraryAddUsageDescription:
        'KuberOne can save document copies to your photo library when you choose to export them.',
      NSMicrophoneUsageDescription:
        'KuberOne uses the microphone for Voice AI loan assistance and support calls.',
      UIBackgroundModes: ['remote-notification'],
      ITSAppUsesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
    },
  },
  android: {
    package: PACKAGE_IDS[APP_ENV],
    versionCode: VERSION_CODE[APP_ENV],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#071A1F',
    },
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'RECORD_AUDIO',
      'POST_NOTIFICATIONS',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
    ],
    ...(existsSync(process.env.GOOGLE_SERVICES_JSON ?? './google-services.json')
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json' }
      : {}),
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'kuberone' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: { favicon: './assets/favicon.png', bundler: 'metro' },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: '35.0.0',
          enableProguardInReleaseBuilds: APP_ENV === 'production' || APP_ENV === 'staging',
          enableShrinkResourcesInReleaseBuilds: APP_ENV === 'production',
          useLegacyPackaging: false,
          extraProguardRules: `
            -keep class com.facebook.hermes.** { *; }
            -keep class com.facebook.react.** { *; }
          `,
        },
        ios: { useFrameworks: 'static' },
      },
    ],
  ],
  extra: {
    appEnv: APP_ENV,
    apiBaseUrl: API_URLS[APP_ENV],
    eas: { projectId: process.env.EAS_PROJECT_ID_CUSTOMER },
    privacyPolicyUrl: 'https://kuberone.com/privacy',
    termsUrl: 'https://kuberone.com/terms',
    crashReporting: process.env.EXPO_PUBLIC_CRASH_REPORTING !== 'false' && APP_ENV !== 'development',
    analyticsEnabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true' || APP_ENV === 'production',
    certificatePinning: APP_ENV === 'production',
    rootDetection: APP_ENV === 'production',
    openAiEnabled: !!process.env.EXPO_PUBLIC_OPENAI_ENABLED,
    fcmEnabled: process.env.EXPO_PUBLIC_FCM_ENABLED !== 'false',
  },
};

export default config;
