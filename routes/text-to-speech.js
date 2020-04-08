'use strict';

let express = require('express');
let router = express.Router();

let tts = require('../controllers/text-to-speech');

/* GET Request to Azure Speech Service to do text to speech */
router.get('/synthesize', tts.text_to_speech);

/* DELETE Request to delete the audio file in public */
router.delete('/file', tts.delete_file);

module.exports = router;