const dotenv = require('dotenv');
const request = require('request');
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
// Requires fs to write synthesized speech to a file
const fs = require('fs');
// Requires xmlbuilder to build the SSML body
const xmlbuilder = require('xmlbuilder');

dotenv.config();

document.addEventListener("DOMContentLoaded", () => {
    let isRecog = false;
    let lastRecognizedSource = "";
    let lastRecognizedTarget = "";

    let languageMapping = {
        'en-US': { text: 'en', voice: 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)' },
        'ja-JP': { text: 'ja', voice: 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)' },
        'ko-KR': { text: 'ko', voice: 'Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)' },
        'es-ES': { text: 'es', voice: 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)' },
        'fr-FR': { text: 'fr', voice: 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)' }
    }

    // Starts continuous speech translation.
    speechTranslateBtn.addEventListener("click", () => {
        isRecog = !isRecog;

        let spinner = document.createElement("span");
        spinner.setAttribute("class", "spinner-grow spinner-grow-sm");
        spinner.setAttribute("role", "status");
        spinner.setAttribute("aria-hidden", "true");

        // Depending on browser security settings, the user may be prompted to allow microphone use. Using continuous recognition allows multiple
        // phrases to be recognized from a single use authorization.

        if (isRecog === true) {
            speechTranslateBtn.innerHTML = "";
            speechTranslateBtn.appendChild(spinner);

            lastRecognizedSource = "";
            lastRecognizedTarget = "";
            phraseDivSource.innerHTML = "";
            phraseDivTarget.innerHTML = "";

            // Only create new recognizer if not existed.
            if (!reco) {
                let audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
                let speechConfig;
                if (authorizationToken) {
                    speechConfig = SpeechSDK.SpeechTranslationConfig.fromAuthorizationToken(authorizationToken, regionOptions.value);
                } else {
                    if (key === "" || key === "YOUR_SPEECH_API_KEY") {
                        alert("Please enter your Cognitive Services Speech subscription key!");
                        return;
                    }
                    speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(key, regionOptions.value);
                }
                speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(key, regionOptions.value);

                // Set the source language.
                speechConfig.speechRecognitionLanguage = languageOptionsBank.value;

                // Defines the language(s) that speech should be translated to.
                // Multiple languages can be specified for text translation and will be returned in a map.
                speechConfig.addTargetLanguage(languageTargetOptionsBank.value);

                // // If voice output is requested, set the target voice.
                // // If multiple text translations were requested, only the first one added will have audio synthesised for it.
                // if (voiceOutput.checked) {
                //     voiceTargetOptions = "zh-TW-HanHanRUS";
                //     speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_TranslationVoice, voiceTargetOptions);
                // }

                reco = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);

                // Before beginning speech recognition, setup the callbacks to be invoked when an event occurs.

                // The event recognizing signals that an intermediate recognition result is received.
                // You will receive one or more recognizing events as a speech phrase is recognized, with each containing
                // more recognized speech. The event will contain the text for the recognition since the last phrase was recognized.
                // Both the source language text and the translation text(s) are available.
                reco.recognizing = function (s, e) {
                    let language = reco.targetLanguages[0];

                    phraseDivSource.innerHTML = lastRecognizedSource + e.result.text;
                    phraseDivTarget.innerHTML = lastRecognizedTarget + e.result.translations.get(language);
                };

                // The event recognized signals that a final recognition result is received.
                // This is the final event that a phrase has been recognized.
                // For continuous recognition, you will get one recognized event for each phrase recognized.
                // Both the source language text and the translation text(s) are available.
                reco.recognized = function (s, e) {
                    let language = reco.targetLanguages[0]

                    lastRecognizedSource += e.result.text + "\r\n";
                    lastRecognizedTarget += e.result.translations.get(language) + "\r\n";
                    phraseDivSource.innerHTML = lastRecognizedSource;
                    phraseDivTarget.innerHTML = lastRecognizedTarget;
                };

                // The event signals that the service has stopped processing speech.
                // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/translationrecognitioncanceledeventargs?view=azure-node-latest
                // This can happen for two broad classes of reasons.
                // 1. An error is encountered.
                //    In this case the .errorDetails property will contain a textual representation of the error.
                // 2. No additional audio is available.
                //    Caused by the input stream being closed or reaching the end of an audio file.
                reco.canceled = function (s, e) {
                };

                // Signals that a new session has started with the speech service
                reco.sessionStarted = function (s, e) {
                };

                // Signals the end of a session with the speech service.
                reco.sessionStopped = function (s, e) {
                    languageTargetOptions.disabled = false;
                };

                // Signals that the speech service has started to detect speech.
                reco.speechStartDetected = function (s, e) {
                    console.log(`Speech detected`);
                };

                // Signals that the speech service has detected that speech has stopped.
                reco.speechEndDetected = function (s, e) {
                    console.log(`Speech end detected`);
                };
            }


            reco.startContinuousRecognitionAsync();

            languageTargetOptions.disabled = true;
        } else {
            speechTranslateBtn.innerHTML = "Start Translation"
            languageTargetOptions.disabled = false;

            reco.stopContinuousRecognitionAsync(
                () => {
                    reco.close();
                    reco = undefined;
                },
                (err) => {
                    reco.close()
                    reco = undefined;
                }
            );
        }
    });

    bankEnterBtn.addEventListener("click", () => {
        let endpoint = process.env.TRANSLATOR_TEXT_ENDPOINT;
        let subscriptionKey = process.env.TRANSLATOR_TEXT_SUBSCRIPTION_KEY;
        let filename = uuidv4();

        let targetLang = languageMapping[`${languageOptionsBank.value}`].text;
        let options = {
            method: 'POST',
            baseUrl: endpoint,
            url: 'translate',
            qs: {
                'api-version': '3.0',
                'to': [`${targetLang}`]
            },
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            body: [{
                'text': bankEnterInput.value
            }],
            json: true,
        };

        request(options, async (err, res, body) => {
            if (err) {
                throw err;
            } else {
                let transText = body[0].translations[0].text

                console.log(transText);
                const accessToken = await getAccessToken(key);  // Use speech service key instead of text translator one
                textToSpeech(accessToken, transText);
            }
        });

        // Gets an access token.
        function getAccessToken(subscriptionKey) {
            let options = {
                method: 'POST',
                uri: 'https://eastasia.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey
                }
            }
            return rp(options);
        }

        // Make sure to update User-Agent with the name of your resource.
        // You can also change the voice and output formats. See:
        // https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
        function textToSpeech(accessToken, text) {
            let voice = languageMapping[`${languageOptionsBank.value}`].voice;
            // Create the SSML request.
            let xml_body = xmlbuilder.create('speak')
                .att('version', '1.0')
                .att('xml:lang', languageOptionsBank.value)
                .ele('voice')
                .att('xml:lang', languageOptionsBank.value)
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
                    'Authorization': 'Bearer ' + accessToken,
                    'cache-control': 'no-cache',
                    'User-Agent': 'MTCSpeechAPI',
                    'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
                    'Content-Type': 'application/ssml+xml'
                },
                body: body
            }

            let request = rp(options)
                .on('response', (response) => {
                    let audio;
                    let stream;
                    if (response.statusCode === 200) {
                        // let audioBlob = new Blob([data], { type: "audio/mpeg" });
                        // let audioURL = URL.createObjectURL(audioBlob);
                        stream = fs.createWriteStream(`${filename}.mp3`)
                        request.pipe(stream);

                        stream.on('finish', () => {
                            console.log('stream end');
                            if (!audio) {
                                audio = new Audio(`../${filename}.mp3`);
                                audio.addEventListener('ended', (event) => {
                                    console.log(event);
                                    fs.unlinkSync(`C:\\Users\\h1646\\repos\\ms-projects\\speech-service\\azure-speech-service-suite\\${filename}.mp3`);
                                });
                            } else {
                                audio.setAttribute('src', `C:\\Users\\h1646\\repos\\ms-projects\\speech-service\\azure-speech-service-suite\\${filename}.mp3`);
                            }

                            audio.play();
                        });
                    }
                });
        }
    });
});