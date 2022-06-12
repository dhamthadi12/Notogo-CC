const { db } = require('../connection/database')

var rand = () => {
    return Math.random().toString(36).substr(2);
};

var generateToken = () => {
    return rand() + rand();
}

const register = (req, res) => {
    const { name, email, password } = req.body;
    db.query(
        `SELECT email FROM user_embedding where email = '${email}'`,
        (err, result, fields) => {
            // if (err) throw err;
            if (result.length != 0) {
                res.send({ 
                    error: true,
                    message: 'Email already exists' 
                });
            } else {
                db.query(
                    `INSERT INTO user_embedding (name, email, password) VALUES ('${name}', '${email}', '${password}')`,
                    (err, result, fields) => { }
                )
                db.query(
                    `SELECT user_id FROM user_embedding where email = '${email}'`,
                    (err, result, fields) => {
                        // if (err) throw err;
                        var token = generateToken();
                        db.query(
                            `INSERT INTO active_session VALUES (${result[0]['user_id']}, '${token}')`,
                            (err, result, fields) => { }
                        );
                        res.send({
                            error: false,
                            message: 'Account created',
                            user_id: result[0]['user_id'],
                            token: token
                        });
                        return;
                    }
                );
            }
        }
    );
}

const login = (req, res) => {
    const { email, password } = req.body;
    console.log(email)
    if (email == "") {
        res.send({
            error: true,
            message: "Email cannot be empty"
        });
        return;
    }
    db.query(
        `SELECT * FROM user_embedding WHERE email = '${email}'`,
        (err, result, fields) => {
            if (result.length == 0) {
                res.send({ 
                    error: true,
                    message: 'Email does not exist' 
            });
                return;
            }
            const user = result[0];
            if (password != user['password']) {
                res.send({ 
                    error: true,
                    message: 'Wrong password'
                 });
                return;
            }
            var token = generateToken();
            db.query(
                `INSERT INTO active_session VALUES (${user['user_id']}, '${token}')`,
                (err, result, fields) => { }
            );
            res.send({
                error: false,
                message: 'Logged in!',
                user_id: user['user_id'],
                token: token
            })
        }
    );
}

const logout = (req, res) => {
    const { token } = req.headers;
    db.query(
        `DELETE FROM active_session WHERE token = '${token}'`,
        (err, result, fields) => {
            res.send({ 
                error: false,
                message: 'Logout success'
            });
        }
    )
}


const authorizeToken = async (runQuery, token) => {
    id = await runQuery(`SELECT * FROM active_session WHERE token = '${token}'`);
    if (id.length == 0) return -1;
    return id[0]['user_id'];
}

module.exports = {
    register,
    login,
    logout,
    authorizeToken
}