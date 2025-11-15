module.exports = {
  apps: [
    {
      name: 'blog-admin-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/var/www/blog-admin', // Update this path to your deployment directory
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu', // Your server user
      host: 'your-server-ip', // Your server IP
      ref: 'origin/main',
      repo: 'your-git-repo', // Your git repository
      path: '/var/www/blog-admin',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
