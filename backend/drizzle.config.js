require('dotenv').config();
const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  schema: '../shared/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  out: './drizzle',
  verbose: true,
  strict: true,
});