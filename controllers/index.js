const fs = require('fs');
const rp = require('request-promise');
const request = require('request');
const xmlbuilder = require('xmlbuilder');
const uuidv1 = require('uuid/v1');

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

const text_to_speech = (req, res, next) => {
    let token = req.query.token;
    let lang = req.query.lang;
    let voice = req.query.voice;
    let text = req.query.text;
    let filename = `${uuidv1()}.mp3`;
    let path = `public/${filename}`;
    let stream = fs.createWriteStream(path);

    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', lang)
        .ele('voice')
        .att('xml:lang', lang)
        .att('name', voice)
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://eastasia.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + token,
            'cache-control': 'no-cache',
            'User-Agent': 'MTCSpeechAPI',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    stream.on('finish', () => {
        console.log('stream end');

        res.send({ status: 'success', path: filename });
    });

    request(options).pipe(stream);
}

module.exports = { get_index, get_token, text_to_speech }