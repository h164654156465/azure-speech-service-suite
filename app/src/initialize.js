const SpeechSDK = require("microsoft-cognitiveservices-speech-sdk");
let phraseDiv, statusDiv;
let phraseDiv2, statusDiv2;
let key, authorizationToken, appId, phrases;
let regionOptions;
let languageOptions, inputSource, filePicker;
let recognizer;

let reco;
let sdkStartContinousRecognitionBtn, sdkStopContinousRecognitionBtn;
let sdkStartContinousTranslationBtn, sdkStopContinousTranslationBtn;
let sdkStartRecognizeOnceAsyncBtn, sdkStopRecognizeOnceAsyncBtn, languageTargetOptions, voiceOutput;
let sdkIntentStartRecognizeOnceAsyncBtn, sdkIntentStopRecognizeOnceAsyncBtn;
let speechTranslateBtn;
let bankEnterBtn;
let audioFile, audioFileValid;
let bankEnterInput;
let audio;

let soundContext = undefined;
try {
    let AudioContext = window.AudioContext // our preferred impl
        || window.webkitAudioContext       // fallback, mostly when on Safari
        || false;                          // could not find.

    if (AudioContext) {
        soundContext = new AudioContext();
    } else {
        alert("Audio context not supported");
    }
}
catch (e) {
    window.console.log("no sound context found, no audio output. " + e);
}

document.addEventListener("DOMContentLoaded", function () {
    createBtn = document.getElementById("createBtn");
    sdkStartRecognizeOnceAsyncBtn = document.getElementById("speechsdkStartRecognizeOnceAsync");
    sdkStopRecognizeOnceAsyncBtn = document.getElementById("speechsdkStopRecognizeOnceAsync");
    sdkStartContinousRecognitionBtn = document.getElementById("speechsdkStartContinuousRecognition");
    sdkStopContinousRecognitionBtn = document.getElementById("speechsdkStopContinuousRecognition");
    sdkStartTranslationOnceBtn = document.getElementById("speechsdkStartTranslationOnce");
    sdkStopTranslationOnceBtn = document.getElementById("speechsdkStopTranslationOnce");
    sdkStartContinousTranslationBtn = document.getElementById("speechsdkStartContinuousTranslation");
    sdkStopContinousTranslationBtn = document.getElementById("speechsdkStopContinuousTranslation");
    sdkIntentStartRecognizeOnceAsyncBtn = document.getElementById("speechsdkIntentStartRecognizeOnceAsync");
    sdkIntentStopRecognizeOnceAsyncBtn = document.getElementById("speechsdkIntentStopRecognizeOnceAsync");
    startConversationBtn = document.getElementById("startConversationBtn");
    stopConversationBtn = document.getElementById("stopConversationBtn");
    speechTranslateBtn = document.getElementById("speechTranslateBtn");
    bankEnterBtn = document.getElementById("bankEnterBtn");
    phraseDiv = document.getElementById("phraseDiv");
    statusDiv = document.getElementById("statusDiv");
    phraseDiv2 = document.getElementById("phraseDiv2");
    statusDiv2 = document.getElementById("statusDiv2");
    phraseDivSource = document.getElementById("phraseDivSource");  // For used in bank translation
    phraseDivTarget = document.getElementById("phraseDivTarget");  // For used in bank translation
    key = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY
    appId = document.getElementById("appId");
    phrases = document.getElementById("phrases");
    languageOptions = document.getElementById("languageOptions");
    languageTargetOptions = document.getElementById("languageTargetOptions");
    languageOptionsBank = document.getElementById("languageOptionsBank");
    languageTargetOptionsBank = document.getElementById("languageTargetOptionsBank");
    // voiceTargetOptions = document.getElementById("voiceTargetOptions");
    voiceOutput = document.getElementById("voiceOutput");
    regionOptions = document.getElementById("regionOptions");
    inputSource = document.getElementById("inputSource");
    filePicker = document.getElementById('filePicker');
    inputSource2 = document.getElementById('inputSource2');
    filePicker2 = document.getElementById('filePicker2');
    bankEnterInput = document.getElementById("bankEnterInput");

    // On document load resolve the Speech SDK dependency
    if (SpeechSDK) {
        document.getElementById('content').style.display = 'block';
        document.getElementById('warning').style.display = 'none';
    }

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

    inputSource2.addEventListener("change", function () {
        audioFileValid = inputSource2.value === "File";

        if (inputSource2.value === "File") {
            filePicker2.click();
            return;
        }
    });

    filePicker2.addEventListener("change", function () {
        audioFile = filePicker2.files[0];
    });
});