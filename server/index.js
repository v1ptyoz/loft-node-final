const express = require('express');
const path = require('path');
const app = express();
const http = require('http');

const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, '../build')));
app.use(express.static(path.join(__dirname, 'upload')))

require('./models/connection');

require('./auth/passport')

app.use('/api', require('./routes'));

app.use('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'))
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
})