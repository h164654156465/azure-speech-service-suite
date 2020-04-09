'use strict';

import { getToken, getRegion } from './utils.js';

let token, subRegion;
getToken().then((data) => token = data);
getRegion().then((data) => subRegion = data);

let SpeechSDK;
let inputSource = document.getElementById("inputSource");
let filePicker = document.getElementById('filePicker');
let audioFile, audioFileValid;
let languageOptions = document.getElementById("languageOptions");
let sdkStartRecognizeOnceAsyncBtn = document.getElementById("speechsdkStartRecognizeOnceAsync");
let sdkStopRecognizeOnceAsyncBtn = document.getElementById("speechsdkStopRecognizeOnceAsync");
let sdkStartContinousRecognitionBtn = document.getElementById("speechsdkStartContinuousRecognition");
let sdkStopContinousRecognitionBtn = document.getElementById("speechsdkStopContinuousRecognition");
let phrases = document.getElementById("phrases");
let phraseDiv = document.getElementById("phraseDiv");
let statusDiv = document.getElementById("statusDiv");
let reco;

if (!!window.SpeechSDK) SpeechSDK = window.SpeechSDK;

inputSource.addEventListener("change", function () {
    audioFileValid = inputSource.value === "File";

    if (inputSource.value === "File") {
        filePicker.click();
        return;
    }
});

filePicker.addEventListener("change", function () {
    audioFile = filePicker.files[0];
});

// Demonstrates recognizing a single spoken phrase.
sdkStartRecognizeOnceAsyncBtn.addEventListener("click", function () {
    phraseDiv.innerHTML = "";
    statusDiv.innerHTML = "";

    // If an audio file was specified, use it. Else use the microphone.
    // Depending on browser security settings, the user may be prompted to allow microphone use. Using continuous recognition allows multiple
    // phrases to be recognized from a single use authorization.
    let audioConfig = audioFileValid ? SpeechSDK.AudioConfig.fromWavFileInput(audioFile) : SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    let speechConfig;
    if (token) {
        speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, subRegion);
    } else console.log('token is not found');

    speechConfig.speechRecognitionLanguage = languageOptions.value;
    reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    // If Phrase are specified, include them.
    if (phrases !== "") {
        let phraseListGrammar = SpeechSDK.PhraseListGrammar.fromRecognizer(reco);
        phraseListGrammar.addPhrase(phrases.value.split(";"));
    }

    // Before beginning speech recognition, setup the callbacks to be invoked when an event occurs.

    // The event recognizing signals that an intermediate recognition result is received.
    // You will receive one or more recognizing events as a speech phrase is recognized, with each containing
    // more recognized speech. The event will contain the text for the recognition since the last phrase was recognized.
    reco.recognizing = function (s, e) {
        statusDiv.innerHTML += "(recognizing) Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + "\r\n";
        phraseDiv.innerHTML = e.result.text;
    };

    // The event signals that the service has stopped processing speech.
    // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
    // This can happen for two broad classes or reasons.
    // 1. An error is encountered.
    //    In this case the .errorDetails property will contain a textual representation of the error.
    // 2. No additional audio is available.
    //    Caused by the input stream being closed or reaching the end of an audio file.
    reco.canceled = function (s, e) {
        statusDiv.innerHTML += "(cancel) Reason: " + SpeechSDK.CancellationReason[e.reason];
        if (e.reason === SpeechSDK.CancellationReason.Error) {
            statusDiv.innerHTML += ": " + e.errorDetails;
        }
        statusDiv.innerHTML += "\r\n";
    };

    // The event recognized signals that a final recognition result is received.
    // This is the final event that a phrase has been recognized.
    // For continuous recognition, you will get one recognized event for each phrase recognized.
    reco.recognized = function (s, e) {
        // Indicates that recognizable speech was not detected, and that recognition is done.
        if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
            let noMatchDetail = SpeechSDK.NoMatchDetails.fromResult(e.result);
            statusDiv.innerHTML += "(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " NoMatchReason: " + SpeechSDK.NoMatchReason[noMatchDetail.reason] + "\r\n";
        } else {
            statusDiv.innerHTML += "(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + "\r\n";
        }
    };

    // Signals that a new session has started with the speech service
    reco.sessionStarted = function (s, e) {
        statusDiv.innerHTML += "(sessionStarted) SessionId: " + e.sessionId + "\r\n";
    };

    // Signals the end of a session with the speech service.
    reco.sessionStopped = function (s, e) {
        statusDiv.innerHTML += "(sessionStopped) SessionId: " + e.sessionId + "\r\n";
        sdkStartContinousRecognitionBtn.disabled = false;
        sdkStopContinousRecognitionBtn.disabled = true;
    };

    // Signals that the speech service has started to detect speech.
    reco.speechStartDetected = function (s, e) {
        statusDiv.innerHTML += "(speechStartDetected) SessionId: " + e.sessionId + "\r\n";
    };

    // Signals that the speech service has detected that speech has stopped.
    reco.speechEndDetected = function (s, e) {
        statusDiv.innerHTML += "(speechEndDetected) SessionId: " + e.sessionId + "\r\n";
    };

    // Note: this is how you can process the result directly
    //       rather then subscribing to the recognized
    //       event
    // The continuation below shows how to get the same data from the final result as you'd get from the
    // events above.
    reco.recognizeOnceAsync(
        function (result) {
            statusDiv.innerHTML += "(continuation) Reason: " + SpeechSDK.ResultReason[result.reason];
            switch (result.reason) {
                case SpeechSDK.ResultReason.RecognizedSpeech:
                    statusDiv.innerHTML += " Text: " + result.text;
                    break;
                case SpeechSDK.ResultReason.NoMatch:
                    let noMatchDetail = SpeechSDK.NoMatchDetails.fromResult(result);
                    statusDiv.innerHTML += " NoMatchReason: " + SpeechSDK.NoMatchReason[noMatchDetail.reason];
                    break;
                case SpeechSDK.ResultReason.Canceled:
                    let cancelDetails = SpeechSDK.CancellationDetails.fromResult(result);
                    statusDiv.innerHTML += " CancellationReason: " + SpeechSDK.CancellationReason[cancelDetails.reason];

                    if (cancelDetails.reason === SpeechSDK.CancellationReason.Error) {
                        statusDiv.innerHTML += ": " + cancelDetails.errorDetails;
                    }
                    break;
            }
            statusDiv.innerHTML += "\r\n";
            phraseDiv.innerHTML = result.text + "\r\n";
            sdkStopRecognizeOnceAsyncBtn.click();
        },
        function (err) {
            window.console.log(err);
            phraseDiv.innerHTML += "ERROR: " + err;
            sdkStopRecognizeOnceAsyncBtn.click();
        }
    );

    sdkStartRecognizeOnceAsyncBtn.disabled = true;
    sdkStopRecognizeOnceAsyncBtn.disabled = false;
});

sdkStopRecognizeOnceAsyncBtn.addEventListener("click", function () {
    sdkStartRecognizeOnceAsyncBtn.disabled = false;
    sdkStopRecognizeOnceAsyncBtn.disabled = true;

    reco.close();
    reco = undefined;
});

// Starts continuous speech recognition.
sdkStartContinousRecognitionBtn.addEventListener("click", function () {
    phraseDiv.innerHTML = "";
    statusDiv.innerHTML = "";
    let lastRecognized = "";

    // If an audio file was specified, use it. Else use the microphone.
    // Depending on browser security settings, the user may be prompted to allow microphone use. Using continuous recognition allows multiple
    // phrases to be recognized from a single use authorization.
    let audioConfig = audioFileValid ? SpeechSDK.AudioConfig.fromWavFileInput(audioFile) : SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    let speechConfig;
    if (token) {
        speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, subRegion);
    } else console.log('token is not found');

    speechConfig.speechRecognitionLanguage = languageOptions.value;
    reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    // Before beginning speech recognition, setup the callbacks to be invoked when an event occurs.

    // The event recognizing signals that an intermediate recognition result is received.
    // You will receive one or more recognizing events as a speech phrase is recognized, with each containing
    // more recognized speech. The event will contain the text for the recognition since the last phrase was recognized.
    reco.recognizing = function (s, e) {
        statusDiv.innerHTML += "(recognizing) Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + "\r\n";
        phraseDiv.innerHTML = lastRecognized + e.result.text;
    };

    // The event recognized signals that a final recognition result is received.
    // This is the final event that a phrase has been recognized.
    // For continuous recognition, you will get one recognized event for each phrase recognized.
    reco.recognized = function (s, e) {
        // Indicates that recognizable speech was not detected, and that recognition is done.
        if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
            let noMatchDetail = SpeechSDK.NoMatchDetails.fromResult(e.result);
            statusDiv.innerHTML += "(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " NoMatchReason: " + SpeechSDK.NoMatchReason[noMatchDetail.reason] + "\r\n";
        } else {
            statusDiv.innerHTML += "(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + "\r\n";
        }

        lastRecognized += e.result.text + "\r\n";
        phraseDiv.innerHTML = lastRecognized;
    };

    // The event signals that the service has stopped processing speech.
    // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
    // This can happen for two broad classes of reasons.
    // 1. An error is encountered.
    //    In this case the .errorDetails property will contain a textual representation of the error.
    // 2. No additional audio is available.
    //    Caused by the input stream being closed or reaching the end of an audio file.
    reco.canceled = function (s, e) {
        statusDiv.innerHTML += "(cancel) Reason: " + SpeechSDK.CancellationReason[e.reason];
        if (e.reason === SpeechSDK.CancellationReason.Error) {
            statusDiv.innerHTML += ": " + e.errorDetails;
        }
        statusDiv.innerHTML += "\r\n";
    };

    // Signals that a new session has started with the speech service
    reco.sessionStarted = function (s, e) {
        statusDiv.innerHTML += "(sessionStarted) SessionId: " + e.sessionId + "\r\n";
    };

    // Signals the end of a session with the speech service.
    reco.sessionStopped = function (s, e) {
        statusDiv.innerHTML += "(sessionStopped) SessionId: " + e.sessionId + "\r\n";
        sdkStartContinousRecognitionBtn.disabled = false;
        sdkStopContinousRecognitionBtn.disabled = true;
    };

    // Signals that the speech service has started to detect speech.
    reco.speechStartDetected = function (s, e) {
        statusDiv.innerHTML += "(speechStartDetected) SessionId: " + e.sessionId + "\r\n";
    };

    // Signals that the speech service has detected that speech has stopped.
    reco.speechEndDetected = function (s, e) {
        statusDiv.innerHTML += "(speechEndDetected) SessionId: " + e.sessionId + "\r\n";
    };

    // Starts recognition
    reco.startContinuousRecognitionAsync();

    sdkStartContinousRecognitionBtn.disabled = true;
    sdkStopContinousRecognitionBtn.disabled = false;
});

// Stops recognition and disposes of resources.
sdkStopContinousRecognitionBtn.addEventListener("click", function () {
    reco.stopContinuousRecognitionAsync(
        function () {
            reco.close();
            reco = undefined;
        },
        function (err) {
            reco.close();
            reco = undefined;
        });

    sdkStartContinousRecognitionBtn.disabled = false;
    sdkStopContinousRecognitionBtn.disabled = true;
});