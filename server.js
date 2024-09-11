const express = require("express");
const app = express();
require('dotenv').config();
const db = require('./db');

const PORT = process.env.PORT || 3000;

app.use(express.json());

const mainRouter = require('./routes/index')

// all api starts from:
// /api/v1/user ...
app.use("/api/v1", mainRouter);


app.listen(3000, ()=> {
    console.log("server listening at port 3000")
})
