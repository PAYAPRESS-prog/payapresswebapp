// PM2 process manager config — optional alternative to hPanel Node.js manager
// Usage: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name:     'payapress-calc',
      script:   './server.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch:              false,
      max_memory_restart: '400M',
      error_file:  './logs/pm2-err.log',
      out_file:    './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
};
