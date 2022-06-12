const { runQuery } = require('../connection/database')
const { authorizeToken } = require('./auth')


const profileDetails = async (req, res) => {
    const { token } = req.headers;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    var profileData = (await runQuery(`SELECT user_id, name, email, photo FROM user_embedding WHERE user_id = ${userId}`))[0];
    var favoriteCount = (await runQuery(`SELECT COUNT(*) AS favorite_count FROM user_features WHERE id IN (SELECT MIN(id) FROM user_features WHERE location_id <= 120 AND user_id = ${userId} AND like_data = 1 GROUP BY location_id)`))[0]
    // var favoriteCount = (await runQuery(`SELECT COUNT(*) AS favorite_count FROM user_features WHERE user_id = ${userId} AND like_data = 1`))[0];
    var goalCount = (await runQuery(`SELECT COUNT(*) AS goal_count FROM goal WHERE user_id = ${userId} AND done = 0`))[0];
    var historyCount = (await runQuery(`SELECT COUNT(*) AS history_count FROM goal WHERE user_id = ${userId} AND done = 1`))[0];

    result = Object.assign({}, profileData, favoriteCount, goalCount, historyCount);
    res.send({
        error: false,
        result: result
    })
}


const profilePreferences = async (req, res) => {
    const { token } = req.headers;
    const { preference_ids } = req.body;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    const categoryDict = require('../data/categories')
    preference_ids.forEach(async (id) => {
        var categoryName = categoryDict[id]['name']
        await runQuery(`INSERT INTO user_features (user_id, like_data, add_data, category, location, location_id) VALUES (${userId}, 1, 0, '${categoryName}', '${categoryName}', ${id})`)
    })

    res.send({
        error: false,
        message: "Preferences added"
    })
}


const uploadProfilePhoto = async (req, res) => {
    const { processFile, storage } = require('../connection/storage')
    const { format } = require('util')
    var bucket = storage.bucket("notogo-profile-photos");

    try {
        const { token } = req.headers;
        const userId = await authorizeToken(runQuery, token);

        if (userId == -1) {
            res.send({
                error: true,
                message: 'Invalid/expired token'
            })
            return;
        }

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
            runQuery(`UPDATE user_embedding SET photo = '${publicUrl}' WHERE user_id = ${userId}`)
            res.status(200).send({
                error: false,
                message: "Profile updated!"
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


const profileHistory = async (req, res) => {
    const { token } = req.headers;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    var goals = await runQuery(`SELECT * FROM goal WHERE user_id = ${userId} AND done = 1`);
    res.send({
        error: false,
        result: goals
    })
}


const favorites = async (req, res) => {
    const { token } = req.headers;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }
    var goalsUnique = await runQuery(`SELECT location_id FROM user_features WHERE location_id <= 120 AND user_id = ${userId} AND like_data = 1 GROUP BY location_id`)
    const locationDict = require('../data/locations')
    var favoritesArr = []
    goalsUnique.forEach((id) => {
        favoritesArr.push(locationDict[id['location_id']])
    })

    res.send({
        error: false,
        result: favoritesArr
    })
}


module.exports = {
    profileDetails,
    profilePreferences,
    uploadProfilePhoto,
    profileHistory,
    favorites,
}