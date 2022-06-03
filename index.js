// Init db connection
const mysql = require('mysql');
const db = mysql.createConnection({
    host: "34.101.251.5",
    user: "root",
    password: "1234",
    database: "notogo",
});

db.connect(function (err) {
    if (err) throw err;
    console.log("Database connected!");
});


// Init express API
const express = require('express');
const app = express();
const port = parseInt(process.env.PORT) || 8080;
app.use(express.json());

app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send(`Hello ${name}!`);
});

app.listen(port, () => {
    console.log(`notogo-api: listening on port ${port}`);
});




// Account
const authService = require('./services/auth');

app.post('/register', (req, res) => {
    authService.register(db, req, res);
});

app.post('/login', (req, res) => {
    authService.login(db, req, res);
})

app.post('/logout', (req, res) => {
    authService.logout(db, req, res);
})

app.get('/profile/:userId', (req, res) => {
    const { userId } = req.params;
    db.query(
        `SELECT * FROM user_embedding WHERE user_id = ${userId}`,
        (err, result, fields) => {
            if (err) throw err;
            res.send(result[0]);
        }
    )
})


// Recommendation
app.get('/recommendation/:userId', (req, res) => {
    const { userId } = req.params;
    res.send();
})


// bucket list
app.get('/goal/:goalId', (req, res) => {
    const { goalId } = req.params;
    db.query(
        `SELECT * FROM wish_features WHERE location_id = ${goalId}`,
        (err, result, fields) => {
            if (err) throw err;
            res.send(result[0]);
        }
    )
})