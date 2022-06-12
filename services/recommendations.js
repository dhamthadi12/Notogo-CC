const { runQuery } = require('../connection/database')
const { authorizeToken } = require('./auth')

const getRecommendations = async (req, res) => {
    const http = require('axios')
    const { token } = req.headers;
    const userId = await authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    var rc = (await http.post('https://notogo-ml-api-ob4n4z3o4q-et.a.run.app/recommend', { user_id: userId }))['data']['result']
    rc = JSON.parse(rc.replaceAll("'", "").replaceAll('b', '').replaceAll("\\n", '').replaceAll(' ', ','))
    
    await runQuery(`DELETE FROM recommendation WHERE user_id = ${userId}`);
    await runQuery(`
        INSERT INTO recommendation (user_id, wish1, wish2, wish3, wish4, wish5, wish6, wish7, wish8, wish9, wish10, wish11, wish12, wish13, wish14, wish15, wish16, wish17, wish18, wish19, wish20)
        VALUES (${userId}, ${rc[0]}, ${rc[1]}, ${rc[2]}, ${rc[3]}, ${rc[4]}, ${rc[5]}, ${rc[6]}, ${rc[7]}, ${rc[8]}, ${rc[9]}, ${rc[10]}, ${rc[11]}, ${rc[12]}, ${rc[13]}, ${rc[14]}, ${rc[15]}, ${rc[16]}, ${rc[17]}, ${rc[18]}, ${rc[19]})
    `)

    const recommendation_ids = (await runQuery(`SELECT * FROM recommendation WHERE user_id = ${userId}`))[0]
    const locations = require('../data/locations')
    var recommendations = []
    for (let i = 1; i <= 20; i++) {
        var location_id = parseInt(recommendation_ids[`wish${i}`])
        if (location_id > 120) continue
        recommendations.push(locations[location_id])
    }

    res.send({
        error: false,
        result: recommendations
    })
}

const likeRecommendation = async (req, res) => {
    const { token } = req.headers;
    const { location_id } = req.body
    const userId = await authService.authorizeToken(runQuery, token);

    if (userId == -1) {
        res.send({
            error: true,
            message: 'Invalid/expired token'
        })
        return;
    }

    const locations = require('./data/locations')
    const location = locations[location_id]
    const location_name = location['location']
    const categories = location['category']
    console.log(location_name)
    console.log(categories)

    categories.forEach(async (category) => {
        await runQuery(`INSERT INTO user_features (user_id, like_data, add_data, category, location, location_id) VALUES (${userId}, 1, 0, '${category}', '${location_name}', ${location_id})`)
    })

    res.send({
        error: false,
        message: 'Location liked'
    })
}

module.exports = {
    getRecommendations,
    likeRecommendation
}