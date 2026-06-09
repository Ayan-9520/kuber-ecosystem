module.exports = {
  apps: [
    {
      name: 'kuberone-api',
      script: './dist/server.js',
      cwd: './apps/backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
      },
      env_uat: {
        NODE_ENV: 'production',
        APP_ENV: 'uat',
      },
      env_production: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
      },
    },
  ],
};
