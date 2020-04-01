let express = require('express');
let router = express.Router();

let index = require('../controllers/index');

/* GET Azure Speech Service access token */
router.get('/token', index.get_token);

/* GET Azure Speech Service subscription region */
router.get('/sub-region', index.get_region);

module.exports = router;
