const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export default {
  expo: {
    name: 'KuberOne',
    slug: 'kuberone-customer',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'kuberone',
    userInterfaceStyle: 'dark',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#071A1F',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kuberfinserve.kuberone.customer',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#071A1F',
      },
      package: 'com.kuberfinserve.kuberone.customer',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'kuberone' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    extra: {
      apiBaseUrl: API_BASE_URL,
      appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    },
  },
};
