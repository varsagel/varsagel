module.exports = {
  apps: [
    {
      name: "varsagel",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        FORCE_VARSAGEL_DOMAIN: "true",
        PORT: "3004"
      },
    },
  ],
};
