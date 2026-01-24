module.exports = {
  apps: [
    {
      name: "varsagel",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3004",
        FORCE_VARSAGEL_DOMAIN: "true",
      },
    },
  ],
};

