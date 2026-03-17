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
      env: { NODE_ENV: 'production', PORT: 3000 },
      out_file: '/tmp/pm2-frontend-out.log',
      error_file: '/tmp/pm2-frontend-error.log',
    },
    {
      name: 'xuanheng-strapi',
      cwd: '/home/ec2-user/xuanheng-website/cms',
      script: 'node_modules/.bin/strapi',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: { NODE_ENV: 'production' },
      out_file: '/tmp/pm2-strapi-out.log',
      error_file: '/tmp/pm2-strapi-error.log',
    }
  ]
};
