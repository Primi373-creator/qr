const { Sequelize } = require("sequelize");
const DB_URL = process.env.DATABASE_URL || "";

module.exports = {
  PORT: process.env.PORT || 3067,
  ADMIN_KEY: process.env.ADMIN_KEY || "C-iph3r",
  DATABASE: new Sequelize(DB_URL, {
    dialect: "postgres",
    ssl: true,
    protocol: "postgres",
    dialectOptions: {
      native: true,
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  }),
};
