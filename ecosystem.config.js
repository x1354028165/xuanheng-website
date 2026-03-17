module.exports = {
  apps: [
    {
      name: 'xuanheng-frontend',
      cwd: '/home/ec2-user/xuanheng-website/frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: '/tmp/pm2-frontend.log',
      error_file: '/tmp/pm2-frontend-error.log',
      out_file: '/tmp/pm2-frontend-out.log',
    }
  ]
};
