'use strict'

const fetch = require('node-fetch');

// Exchange subscription key for access token.
const get_token = async (req, res, next) => {
    let key = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
    let region = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;
    let url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;
    let options = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': key
        }
    }
    let tokenRes = await fetch(url, options).catch(err => console.log(err));
    let token = await tokenRes.text();
    res.send(token);
}

// Get subscription region.
const get_region = (req, res, next) => {
    let subRegion = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;

    res.send(subRegion);
}

module.exports = { get_token, get_region }