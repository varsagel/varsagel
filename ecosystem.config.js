module.exports = {
  apps: [
    {
      name: "varsagel",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "development",
        FORCE_VARSAGEL_DOMAIN: "false",
        PORT: "3000"
      },
    },
  ],
};
