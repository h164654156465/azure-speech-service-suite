let express = require('express');
let router = express.Router();

let index = require('../controllers/index');

/* GET home page. */
router.get('/', index.get_index);

/* GET Azure Speech Service access token */
router.get('/token', index.get_token);

/* GET Request to Azure Speech Service to do text to speech */
router.get('/text-to-speech', index.text_to_speech);

module.exports = router;
