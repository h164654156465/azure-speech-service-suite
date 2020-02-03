var express = require('express');
var router = express.Router();

let index = require('../controllers/index');

/* GET home page. */
router.get('/', index.get_index);
router.get('/token', index.get_token);

module.exports = router;
