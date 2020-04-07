const fetch = require('node-fetch');

const get_token = (req, res, next) => {
    let key = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
    let region = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;
    let url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
    let options = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': key
        }
    }
    fetch(url, options)
        .then(res => res.text())
        .then(token => res.send(token))
        .catch(err => console.log(err));
}

const get_region = (req, res, next) => {
    let subRegion = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;

    res.send(subRegion);
}

module.exports = { get_token, get_region }