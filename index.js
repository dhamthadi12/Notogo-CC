// Init express API
const cors = require("cors");
const express = require('express');
const app = express();
let corsOptions = {
    origin: "http://localhost:8081",
};
const port = parseInt(process.env.PORT) || 8080;
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send(`Hello ${name}!`);
});

app.listen(port, () => {
    console.log(`notogo-api: listening on port ${port}`);
});


// Account
const { register, login, logout } = require('./services/auth');
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);

const { profileDetails, profilePreferences, uploadProfilePhoto, profileHistory, favorites } = require('./services/profile')
app.get('/profile', profileDetails)
app.put('/profile/preferences', profilePreferences)
app.put('/profile/photo', uploadProfilePhoto)
app.get('/profile/history', profileHistory)
app.get('/profile/favorite', favorites)

const { allGoals, getGoal, addGoal, addGoalPhoto, doneGoal, deleteGoal, searchLocation } = require('./services/goals')
app.get('/goals', allGoals)
app.get('/goals/:goal_id', getGoal)
app.post('/goals/add', addGoal)
app.put('/goals/photo/:goal_id', addGoalPhoto)
app.post('/goals/done', doneGoal)
app.delete('/goals/delete', deleteGoal)
app.get('/location/search', searchLocation)


const { getRecommendations, likeRecommendation } = require('./services/recommendations')
app.get('/recommendations', getRecommendations)
app.put('/recommendations/like', likeRecommendation)