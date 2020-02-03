var rp = require('request-promise');

exports.get_index = function (req, res, next) {
    res.render('index');
}

exports.get_token = function (req, res, next) {
    key = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
    let options = {
        method: 'POST',
        uri: 'https://eastasia.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
        headers: {
            'Ocp-Apim-Subscription-Key': key
        }
    }
    rp(options)
        .then(function (token) {
            res.send(token);
        }).catch(function (err) {
            console.log(err)
        });
}