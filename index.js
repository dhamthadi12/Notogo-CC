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

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    db.query(
        `SELECT email FROM user_embedding where email = '${email}'`,
        (err, result, fields) => {
            // if (err) throw err;
            if (result.length != 0) {
                res.send({ message: 'Email already exists' });
            } else {
                db.query(
                    `INSERT INTO user_embedding (name, email, password) VALUES ('${name}', '${email}', '${password}')`,
                    (err, result, fields) => {
                        // if (err) throw err;
                    }
                )
                db.query(
                    `SELECT user_id FROM user_embedding where email = '${email}'`,
                    (err, result, fields) => {
                        // if (err) throw err;
                        res.send({
                            message: 'Account created',
                            user_id: result[0]['user_id']
                        });
                        return;
                    }
                );
            }
        }
    );
});



app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query(
        `SELECT * FROM user_embedding WHERE email = '${email}'`,
        (err, result, fields) => {
            if (result.length == 0) {
                res.send({ message: 'Email does not exist'});
                return;
            }
            const user = result[0];
            if (password != user['password']) {
                res.send({ message: 'Wrong password' });
                return;
            }
            res.send({
                message: 'Logged in!',
                user_id: user['user_id']
            })
        }
    );
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