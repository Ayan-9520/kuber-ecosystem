module.exports = {
  apps: [
    {
      name: 'kuberone-api',
      script: './apps/backend/dist/server.js',
      cwd: '/opt/kuberone',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_uat: {
        NODE_ENV: 'production',
        APP_ENV: 'uat',
      },
      env_production: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
      },
      error_file: '/var/log/kuberone/api-error.log',
      out_file: '/var/log/kuberone/api-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
