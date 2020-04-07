const fs = require('fs');
const fetch = require('node-fetch');
const xmlbuilder = require('xmlbuilder');
const { v1: uuidv1 } = require('uuid');

const text_to_speech = (req, res, next) => {
    // Declare query parameters.
    let token = req.query.token;
    let lang = req.query.lang;
    let voice = req.query.voice;
    let text = req.query.text;
    let style = req.query.style;

    let region = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;
    let filename = `${uuidv1()}.mp3`;
    let path = `public/${filename}`;
    let stream = fs.createWriteStream(path);

    console.log(path);
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xmlns', 'http://www.w3.org/2001/10/synthesis')
        .att('xmlns:mstts', 'https://www.w3.org/2001/mstts')
        .att('xml:lang', lang)
        .ele('voice')
        .att('name', voice)
        .ele('mstts:express-as')
        .att('style', style)
        .txt(text)
        .end();

    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    // For supported region for neural voices, please visit:
    // https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/regions#standard-and-neural-voices
    let url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    let options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'cache-control': 'no-cache',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    stream.on('finish', () => {
        console.log('stream end');

        res.send({ status: 'success', path: filename });
    });

    fetch(url, options)
        .then(res => res.body.pipe(stream))
        .catch(err => console.log(err));
}

const delete_file = (req, res, next) => {
    let path = req.query.path;
    
    // Check if the file exists in the current directory.
    fs.access(`public/${path}`, fs.constants.F_OK, (err) => {
        if (err) console.log(err);
        else {
            fs.unlink(`public/${path}`, (err) => {
                if (err) {
                    console.log(err);
                    res.json({
                        msg: 'Failed to delete the file',
                        path: path
                    });
                } else {
                    res.json({
                        msg: 'File deleted',
                        path: path
                    });
                }
            });
        }
    });
}

module.exports = { text_to_speech, delete_file }
