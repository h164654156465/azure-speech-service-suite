const rp = require('request-promise');

const get_index = (req, res, next) => {
    res.render('index');
}

const get_token = (req, res, next) => {
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

module.exports = { get_index, get_token }