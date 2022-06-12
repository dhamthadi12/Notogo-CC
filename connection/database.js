// Init db connection
const mysql = require('mysql');
const util = require("util");
const key = require('../keys/database-key')
const db = mysql.createConnection(key);
const runQuery = util.promisify(db.query).bind(db);


db.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
});

module.exports = { db, runQuery }