const mysql = require('mysql')
const db = mysql.createConnection({
    host: "localhost",
    user: "db_users",
    password: "db_pass",
    database: "db_name"
});
module.exports=db;