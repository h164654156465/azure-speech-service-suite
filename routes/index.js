let express = require('express');
let router = express.Router();

let index = require('../controllers/index');

/* GET Azure Speech Service access token */
router.get('/token', index.get_token);

module.exports = router;
