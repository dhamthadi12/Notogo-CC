const { runQuery } = require('../connection/database')
const { authorizeToken } = require('./auth')

const allGoals = async (req, res) => {
    const { token } = req.headers;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    var goals = await runQuery(`SELECT * FROM goal WHERE user_id = ${userId} AND done = 0`);
    res.send({
        error: false,
        result: goals
    })
}

const getGoal = async (req, res) => {
    const { token } = req.headers;
    const { goal_id } = req.params;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    var goals = await runQuery(`SELECT * FROM goal WHERE goal_id = ${goal_id} AND done = 0`);
    res.send({
        error: false,
        result: goals
    })
}

const addGoal = async (req, res) => {
    const { token } = req.headers;
    var { title, location_id, location_name, budget, date, category, note } = req.body;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    category = category.replaceAll("'", "''");
    location_id = location_id ? location_id : 'NULL'
    await runQuery(`INSERT INTO goal (user_id, title, image, location_id, location_name, budget, date, category, note) VALUES (${userId},'${title}',NULL,${location_id},'${location_name}',${budget},'${date}','${category}','${note}')`);

    var goal_id = (await runQuery(`SELECT goal_id FROM goal ORDER BY goal_id DESC LIMIT 1`))[0]['goal_id'];

    if (location_id != 'NULL') {
        console.log('masuk')
        var categories = (await runQuery(`SELECT category FROM wish_embedding WHERE location_id = ${location_id}`))[0]['category'].replaceAll("'", '"');
        var parsedCategories = JSON.parse(categories);

        parsedCategories.forEach(async (category) => {
            await runQuery(`INSERT INTO user_features (user_id, like_data, add_data, category, location, location_id) VALUES (${userId}, 0, 1, '${category}', '${location_name}', ${location_id})`);
        });
    }

    res.send({
        error: false,
        message: "Goal added!",
        goal_id: goal_id
    })
}

const addGoalPhoto = async (req, res) => {
    const { processFile, storage } = require('../connection/storage')
    const { format } = require('util')
    var bucket = storage.bucket("notogo-photos");
    const { goal_id } = req.params;

    try {
        await processFile(req, res);
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });
        blobStream.on("error", (err) => {
            res.status(500).send({ message: err.message });
        });
        blobStream.on("finish", async (data) => {
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
            try {
                // Make the file public
                await bucket.file(req.file.originalname).makePublic();
            } catch {
                return res.status(500).send({
                    error: true,
                    message:
                        `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
                    url: publicUrl,
                });
            }
            runQuery(`UPDATE goal SET image = '${publicUrl}' WHERE goal_id = ${goal_id}`)
            res.status(200).send({
                error: false,
                message: "Photo updated!"
            });
        });
        blobStream.end(req.file.buffer);
    } catch (err) {
        res.send({
            error: true,
            message: `Error: ${err}`
        })
    }
}

const doneGoal = async (req, res) => {
    const { token } = req.headers;
    var { goal_id } = req.body;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    await runQuery(`UPDATE goal SET done = 1 WHERE goal_id = ${goal_id}`);
    res.send({
        error: false,
        message: "Done set"
    })
}

const deleteGoal = async (req, res) => {
    const { token } = req.headers;
    var { goal_id } = req.body;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    await runQuery(`DELETE FROM goal WHERE goal_id = ${goal_id}`)
    res.send({
        error: false,
        message: 'Goal deleted'
    })
}

const searchLocation = async (req, res) => {
    var search = req.query.search;
    search = search.toUpperCase()

    var result = await runQuery(`SELECT location_id, location FROM wish_embedding WHERE location LIKE '%${search}%' AND category IS NOT NULL`);
    res.send({
        error: false,
        result: result
    })
}


module.exports = {
    allGoals,
    getGoal,
    addGoal,
    addGoalPhoto,
    doneGoal,
    deleteGoal,
    searchLocation
}