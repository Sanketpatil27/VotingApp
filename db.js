const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('connected to mongoDB');
})

db.on('error', (err) => {
    console.log('connection error: ', err);
})

db.on('disconnected', (err) => {
    console.log('Mongodb disconnected!');
})


module.exports = db;