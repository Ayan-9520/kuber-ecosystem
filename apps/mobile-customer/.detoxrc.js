/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: { $0: 'jest', config: 'e2e/jest.config.js' },
    jest: { setupTimeout: 120000 },
  },
  apps: {
    'customer.ios': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/KuberOneCustomer.app',
      build:
        'xcodebuild -workspace ios/KuberOneCustomer.xcworkspace -scheme KuberOneCustomer -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'customer.android': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
  },
  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 14' } },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' },
    },
  },
  configurations: {
    'ios.sim': { device: 'simulator', app: 'customer.ios' },
    'android.emu': { device: 'emulator', app: 'customer.android' },
  },
};
