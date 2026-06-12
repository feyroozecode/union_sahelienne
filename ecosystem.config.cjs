module.exports = {
  apps: [{
    name: 'union-sahelienne-api',
    script: 'dist/src/main.js',
    cwd: '/var/www/union_sahelienne',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
