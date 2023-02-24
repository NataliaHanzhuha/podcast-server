const express = require("express");
const {postBooks, getVideosInfo} = require("./middleware");
const router = express.Router();

router
    .get('/', (req, res) => {res.send('its working')})
    .get('/playlist', getVideosInfo)
    .post('/books', postBooks)

module.exports = router;