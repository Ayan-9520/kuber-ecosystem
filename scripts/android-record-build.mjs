#!/usr/bin/env node
/** Record mobile build to API webhook */
const payload = {
  app: process.env.MOBILE_APP ?? 'customer',
  buildType: process.env.BUILD_TYPE ?? 'apk',
  environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'production',
  versionName: process.env.VERSION_NAME ?? '1.0.0',
  versionCode: Number(process.env.VERSION_CODE ?? 10000),
  status: process.env.BUILD_STATUS ?? 'SUCCESS',
  artifactUrl: process.env.ARTIFACT_URL,
  commitSha: process.env.GITHUB_SHA,
  branch: process.env.GITHUB_REF_NAME,
};

const apiUrl = process.env.MOBILE_WEBHOOK_BACKEND ?? process.env.API_BASE_URL;
const secret = process.env.MOBILE_WEBHOOK_SECRET;

if (apiUrl && secret) {
  const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/mobile/builds/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-mobile-webhook-secret': secret },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    console.log('Mobile build recorded');
    process.exit(0);
  }
}

console.log('Build payload:', JSON.stringify(payload, null, 2));
