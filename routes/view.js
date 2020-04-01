let express = require('express');
let router = express.Router();

/* GET redirect to speech to text tab */
router.get('/', (req, res) => {
    res.redirect('speech-to-text');
});

/* GET speech to text tab */
router.get('/speech-to-text', (req, res) => {
    res.render('stt', { sttTab: 'active' });
});

/* GET speech translation tab */
router.get('/speech-translation', (req, res) => {
    res.render('sts', { stsTab: 'active' });
});

/* GET text to speech tab */
router.get('/text-to-speech', (req, res) => {
    res.render('tts', { ttsTab: 'active' });
});

/* GET setting tab */
router.get('/setting', (req, res) => {
    res.render('setting', { settingTab: 'active' });
});

module.exports = router;