module.exports = {
  apps: [
    {
      name: 'varsagel',
      script: 'server.js',
      instances: 1, // server.js handles its own ports 80/443, better to run single instance or use a proxy
      exec_mode: 'fork', // server.js might not be cluster-safe with manual port 80/443 binding
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        FORCE_VARSAGEL_DOMAIN: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        FORCE_VARSAGEL_DOMAIN: 'true'
      },
      // Logging configuration
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      restart_delay: 4000, // 4 seconds delay between restarts
      max_restarts: 10, // Maximum restart attempts
      min_uptime: '10s', // Minimum uptime to be considered successful
      
      // Monitoring
      watch: false, // Disable file watching in production
      ignore_watch: ['node_modules', 'logs', 'public', '.git'],
      
      // Advanced options
      kill_timeout: 5000, // 5 seconds to gracefully shutdown
      listen_timeout: 8000, // 8 seconds to wait for listen
      
      // Auto restart on file changes (development only)
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        interval: 1000
      }
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/varsagel.git',
      path: '/var/www/varsagel',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get update && apt-get install -y git nodejs npm',
      'post-setup': 'npm install -g pm2'
    }
  }
};