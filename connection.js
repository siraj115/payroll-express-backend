const { sutando, Model } = require('sutando');
const Cryptr = require("cryptr");
require("dotenv").config({ path: `./.env.dev` });
const cryptr = new Cryptr(process.env.SECRET_KEY);

console.log(process.env.DB_NAME)
console.log(process.env.SQL_SERVER)
console.log(process.env.SQL_SERVER_PORT)
console.log(process.env.SQL_USER)

sutando.addConnection({
  client: 'mysql2',
  connection: {
    host : process.env.SQL_SERVER,
    port : process.env.SQL_SERVER_PORT,
    user : process.env.SQL_USER,
    password : process.env.SQL_USER_PASSWORD,
    database : process.env.DB_NAME
  },
});
const db = sutando.connection()
module.exports = {db}