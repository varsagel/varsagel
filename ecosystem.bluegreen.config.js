module.exports = {
  apps: [
    {
      name: "varsagel-blue",
      cwd: "/var/www/varsagel-blue",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3004",
        FORCE_VARSAGEL_DOMAIN: "true",
      },
    },
    {
      name: "varsagel-green",
      cwd: "/var/www/varsagel-green",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3005",
        FORCE_VARSAGEL_DOMAIN: "true",
      },
    },
  ],
};
