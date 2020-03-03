document.addEventListener("DOMContentLoaded", () => {
    // Starts continuous speech translation.
    sdkStartContinousTranslationBtn.addEventListener("click", function () {
        let lastRecognized = "";
        phraseDiv2.innerHTML = "";
        statusDiv2.innerHTML = "";

        // If an audio file was specified, use it. Else use the microphone.
        // Depending on browser security settings, the user may be prompted to allow microphone use. Using continuous recognition allows multiple
        // phrases to be recognized from a single use authorization.
        let audioConfig = audioFileValid ? SpeechSDK.AudioConfig.fromWavFileInput(audioFile) : SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        let speechConfig;
        if (token) {
            speechConfig = SpeechSDK.SpeechTranslationConfig.fromAuthorizationToken(token, regionOptions.value);
        } else {
            if (key === "" || key === "YOUR_SPEECH_API_KEY") {
                alert("Please enter your Cognitive Services Speech subscription key!");
                return;
            }
            speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(key, regionOptions.value);
        }

        // Set the source language.
        speechConfig.speechRecognitionLanguage = languageOptions.value;

        // Defines the language(s) that speech should be translated to.
        // Multiple languages can be specified for text translation and will be returned in a map.
        speechConfig.addTargetLanguage(languageTargetOptions.value);

        // If voice output is requested, set the target voice.
        // If multiple text translations were requested, only the first one added will have audio synthesised for it.
        if (voiceOutput.checked) {
            if (languageTargetOptions.value === "en") {
                voiceTargetOptions = "en-US-ZiraRUS";
            } else if (languageTargetOptions.value === "zh-Hant") {
                voiceTargetOptions = "zh-TW-HanHanRUS";
            } else if (languageTargetOptions.value === "ja") {
                voiceTargetOptions = "ja-JP-Ayumi-Apollo";
            } else if (languageTargetOptions.value = "ko") {
                voiceTargetOptions = "ko-KR-HeamiRUS";
            }
            
            speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_TranslationVoice, voiceTargetOptions);
        }

        reco = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);

        // If Phrases are specified, include them.
        if (phrases !== "") {
            let phraseListGrammar = SpeechSDK.PhraseListGrammar.fromRecognizer(reco);
            phraseListGrammar.addPhrase(phrases.value.split(";"));
        }

        // Before beginning speech recognition, setup the callbacks to be invoked when an event occurs.

        // The event recognizing signals that an intermediate recognition result is received.
        // You will receive one or more recognizing events as a speech phrase is recognized, with each containing
        // more recognized speech. The event will contain the text for the recognition since the last phrase was recognized.
        // Both the source language text and the translation text(s) are available.
        reco.recognizing = function (s, e) {
            statusDiv2.innerHTML += "(recognizing) Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + " Translations:";

            // let language = languageTargetOptions.value.split("(")[1].substring(0, 2);  This will cause not finding the key problem.
            let language = reco.targetLanguages[0]

            statusDiv2.innerHTML += " [" + language + "] " + e.result.translations.get(language);
            statusDiv2.innerHTML += "\r\n";

            phraseDiv2.innerHTML = lastRecognized + e.result.translations.get(language);
        };

        // The event recognized signals that a final recognition result is received.
        // This is the final event that a phrase has been recognized.
        // For continuous recognition, you will get one recognized event for each phrase recognized.
        // Both the source language text and the translation text(s) are available.
        reco.recognized = function (s, e) {
            statusDiv2.innerHTML += "(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + " Translations:";

            // let language = languageTargetOptions.value.split("(")[1].substring(0, 2);
            let language = reco.targetLanguages[0]

            statusDiv2.innerHTML += " [" + language + "] " + e.result.translations.get(language);
            statusDiv2.innerHTML += "\r\n";

            lastRecognized += e.result.translations.get(language) + "\r\n";
            phraseDiv2.innerHTML = lastRecognized;
        };

        // The event signals that the service has stopped processing speech.
        // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/translationrecognitioncanceledeventargs?view=azure-node-latest
        // This can happen for two broad classes of reasons.
        // 1. An error is encountered.
        //    In this case the .errorDetails property will contain a textual representation of the error.
        // 2. No additional audio is available.
        //    Caused by the input stream being closed or reaching the end of an audio file.
        reco.canceled = function (s, e) {
            statusDiv2.innerHTML += "(cancel) Reason: " + SpeechSDK.CancellationReason[e.reason] + "\r\n";
        };

        // Signals an audio payload of synthesized speech is ready for playback.
        // If the event result contains valid audio, it's reason will be ResultReason.SynthesizingAudio
        // Once a complete phrase has been synthesized, the event will be called with ResultReason.SynthesizingAudioComplete and a 0 byte audio payload.
        reco.synthesizing = function (s, e) {
            // window.console.log(s.audioConfig.privSource.privStreams);
            // console.log(e.result.audio)

            let audioSize = e.result.audio === undefined ? 0 : e.result.audio.byteLength;

            statusDiv2.innerHTML += "(synthesizing) Reason: " + SpeechSDK.ResultReason[e.result.reason] + " " + audioSize + " bytes\r\n";

            if (e.result.audio && soundContext) {
                let source = soundContext.createBufferSource();
                soundContext.decodeAudioData(e.result.audio, function (newBuffer) {
                    source.buffer = newBuffer;
                    source.connect(soundContext.destination);
                    source.start(0);
                });
            }
        };

        // Signals that a new session has started with the speech service
        reco.sessionStarted = function (s, e) {
            statusDiv2.innerHTML += "(sessionStarted) SessionId: " + e.sessionId + "\r\n";
        };

        // Signals the end of a session with the speech service.
        reco.sessionStopped = function (s, e) {
            languageTargetOptions.disabled = false;
            sdkStartContinousTranslationBtn.disabled = false;
            sdkStopContinousTranslationBtn.disabled = true;

            statusDiv2.innerHTML += "(sessionStopped) SessionId: " + e.sessionId + "\r\n";
        };

        // Signals that the speech service has started to detect speech.
        reco.speechStartDetected = function (s, e) {
            statusDiv2.innerHTML += "(speechStartDetected) SessionId: " + e.sessionId + "\r\n";
        };

        // Signals that the speech service has detected that speech has stopped.
        reco.speechEndDetected = function (s, e) {
            statusDiv2.innerHTML += "(speechEndDetected) SessionId: " + e.sessionId + "\r\n";
        };

        reco.startContinuousRecognitionAsync();

        languageTargetOptions.disabled = true;
        sdkStartContinousTranslationBtn.disabled = true;
        sdkStopContinousTranslationBtn.disabled = false;
    });

    sdkStopContinousTranslationBtn.addEventListener("click", function () {
        languageTargetOptions.disabled = false;
        sdkStartContinousTranslationBtn.disabled = false;
        sdkStopContinousTranslationBtn.disabled = true;

        reco.stopContinuousRecognitionAsync(
            function () {
                reco.close();
                reco = undefined;
            },
            function (err) {
                reco.close();
                reco = undefined;
            }
        );
    });
});