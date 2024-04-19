const express = require('express');
const path = require('path');
const config = require('./config');
const bodyParser = require("body-parser");
const { DATABASE } = require('./config');
const app = express();
const __path = process.cwd();
const PORT = config.PORT;

console.log("Syncing Database");
DATABASE.sync().then(() => {
    console.log("Database Synced Successfully");
}).catch(err => {
    console.error("Error syncing database:", err);
    process.exit(1);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__path, 'public')));

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, '/public/pair.html'));
});

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__path, '/public/qr.html'));
});

const pairRoutes = require('./routes/pair');
app.use('/code', pairRoutes);

const qrRoutes = require('./routes/qr');
app.use('/scan', qrRoutes);

const sessionRoutes = require('./routes/session');
app.use('/', sessionRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, '/public/index.html'));
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});

module.exports = app;
