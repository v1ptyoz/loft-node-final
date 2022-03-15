const mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on('connected', ()=>{
    console.log('Connected to Mongo');
});


mongoose.connection.on('error', (err)=>{
    console.log(`Error: ${err}`);
})

mongoose.connection.on('disconected', ()=>{
    console.log('Disconnected from Mongo');
})

module.exports = mongoose
