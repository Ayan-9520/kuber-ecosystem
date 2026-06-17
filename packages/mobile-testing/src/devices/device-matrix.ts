export type DeviceClass = 'phone-small' | 'phone-medium' | 'phone-large' | 'tablet' | 'ipad';

export interface DeviceProfile {
  id: string;
  platform: 'android' | 'ios';
  class: DeviceClass;
  width: number;
  height: number;
  label: string;
}

/** Firebase Test Lab / Appium / Detox device matrix. */
export const DEVICE_MATRIX: DeviceProfile[] = [
  { id: 'pixel_4', platform: 'android', class: 'phone-small', width: 393, height: 830, label: 'Pixel 4' },
  { id: 'pixel_7', platform: 'android', class: 'phone-medium', width: 412, height: 915, label: 'Pixel 7' },
  { id: 'pixel_7_pro', platform: 'android', class: 'phone-large', width: 412, height: 892, label: 'Pixel 7 Pro' },
  { id: 'galaxy_tab_s7', platform: 'android', class: 'tablet', width: 800, height: 1280, label: 'Galaxy Tab S7' },
  { id: 'iphone_se', platform: 'ios', class: 'phone-small', width: 375, height: 667, label: 'iPhone SE' },
  { id: 'iphone_14', platform: 'ios', class: 'phone-medium', width: 390, height: 844, label: 'iPhone 14' },
  { id: 'iphone_14_pro_max', platform: 'ios', class: 'phone-large', width: 430, height: 932, label: 'iPhone 14 Pro Max' },
  { id: 'ipad_air', platform: 'ios', class: 'ipad', width: 820, height: 1180, label: 'iPad Air' },
];

export function deviceCoveragePercent(platforms: ('android' | 'ios')[]): number {
  const classes = new Set(DEVICE_MATRIX.filter((d) => platforms.includes(d.platform)).map((d) => d.class));
  const totalClasses = new Set(DEVICE_MATRIX.map((d) => d.class)).size;
  return Math.round((classes.size / totalClasses) * 1000) / 10;
}
