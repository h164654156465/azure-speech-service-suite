

exports.get_index = function (req, res, next) {
    res.render('index');
}

exports.get_subKey = function (req, res, next) {
    key = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
    res.send(key);
}