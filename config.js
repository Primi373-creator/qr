const { Sequelize } = require("sequelize");
const DB_URL = process.env.DATABASE_URL || "";

module.exports = {
  SESSION_ID: process.env.SESSION_ID || "01A_L_P_H_A_24_04_18_5A9H_I9_U5gd", //your ssid to run bot
  PORT: process.env.PORT || 3067,
  ADMIN_KEY: process.env.ADMIN_KEY || "C-iph3r",
  DATABASE: DB_URL
    ? new Sequelize(DB_URL, {
        dialect: "postgres",
        ssl: true,
        protocol: "postgres",
        dialectOptions: {
          native: true,
          ssl: { require: true, rejectUnauthorized: false },
        },
        logging: false,
      })
    : new Sequelize({
        dialect: "sqlite",
        storage: "./database.db",
        logging: false,
      }),
};
