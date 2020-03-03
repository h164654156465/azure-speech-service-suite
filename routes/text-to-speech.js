var express = require('express');
var router = express.Router();

let tts = require('../controllers/text-to-speech');

/* GET Request to Azure Speech Service to do text to speech */
router.get('/', tts.text_to_speech);

module.exports = router;