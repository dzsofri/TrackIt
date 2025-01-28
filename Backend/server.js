require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DBHOST,
  user            : process.env.DBUSER,
  password        : process.env.DBPASS,
  database        : process.env.DBNAME
});

app.use(cors());
app.use(express.json());


app.listen(process.env.PORT, ()=>{
    console.log('Server: http://localhost:'+process.env.PORT);
});