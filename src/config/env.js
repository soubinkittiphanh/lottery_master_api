const config = {
  port: process.env.PORT || 8081,
  nodeEnv: process.env.NODE_ENV || "development",
  host: process.env.HOST || "localhost",
  actksecret:'e3848b9bd2e3eee522325953aafc118ed017c811cc93fae99a4b2f5ba3506e0e217636b3b509055900cb1da7594b0ce6c7192907213291818a4fdc89bf605ce8',
  rfTkSecret:'e3848b9bd2e3eee522325953aafc118ed017c811cc93fae99a4b2f5ba3506e0e217636b3b509055900cb1da7',
  db: {
    host: "mariadb-34248-0.cloudclusters.net",
    user: "soubin",
    password: "SDAT@3480",
    database: "lottery_master_production",
    port: 34248,
  },
};

module.exports = config;
