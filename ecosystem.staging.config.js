module.exports = {
  apps: [
    {
      name: "varsagel-staging",
      script: "server.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "3006",
        FORCE_VARSAGEL_DOMAIN: "true",
        CANONICAL_URL: "https://staging.varsagel.com",
        NEXT_PUBLIC_SITE_URL: "https://staging.varsagel.com"
      },
    },
  ],
};
