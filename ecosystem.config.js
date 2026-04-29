module.exports = {
  apps: [
    {
      name:         'unitygirl-frontend',
      cwd:          '/var/www/unity_style_girl/frontend',
      script:       'node_modules/.bin/next',
      args:         'start',
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV:              'production',
        PORT:                  3000,
        NEXT_PUBLIC_API_URL:   'https://api.unitygirlstyle.com.br/api/v1',
      },
    },
  ],
}
