const uuidv1 = require('uuid/v1');

document.addEventListener("DOMContentLoaded", () => {
    // Starts continuous speech recognition.
    startConversationBtn.addEventListener("click", function () {
        // phraseDiv.innerHTML = "";
        // statusDiv.innerHTML = "";
        let lastRecognized = "";
        let messageId = null;

        // If an audio file was specified, use it. Else use the microphone.
        // Depending on browser security settings, the user may be prompted to allow microphone use. Using continuous recognition allows multiple
        // phrases to be recognized from a single use authorization.
        let audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

        let speechConfig;
        if (authorizationToken) {
            speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(authorizationToken, regionOptions.value);
        } else {
            if (key === "" || key === "YOUR_SPEECH_API_KEY") {
                alert("Please enter your Cognitive Services Speech subscription key!");
                return;
            }
            speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, regionOptions.value);
        }

        speechConfig.speechRecognitionLanguage = languageOptions.value;
        reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // Before beginning speech recognition, setup the callbacks to be invoked when an event occurs.

        // The event recognizing signals that an intermediate recognition result is received.
        // You will receive one or more recognizing events as a speech phrase is recognized, with each containing
        // more recognized speech. The event will contain the text for the recognition since the last phrase was recognized.
        reco.recognizing = function (s, e) {
            // window.console.log(e);
            console.log("(recognizing) Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text);
            // document.getElementById(e.sessionId).getElementsByTagName("p")[0].innerHTML = e.result.text;
        };

        // The event recognized signals that a final recognition result is received.
        // This is the final event that a phrase has been recognized.
        // For continuous recognition, you will get one recognized event for each phrase recognized.
        reco.recognized = function (s, e) {
            // window.console.log(e);

            // Indicates that recognizable speech was not detected, and that recognition is done.
            if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
                let noMatchDetail = SpeechSDK.NoMatchDetails.fromResult(e.result);
                console.log("(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " NoMatchReason: " + SpeechSDK.NoMatchReason[noMatchDetail.reason] + "\r\n");
            } else {
                console.log("(recognized)  Reason: " + SpeechSDK.ResultReason[e.result.reason] + " Text: " + e.result.text + "\r\n");
            }

            lastRecognized = e.result.text;
            document.getElementById(messageId).getElementsByTagName("p")[0].innerHTML += lastRecognized;
        };

        // The event signals that the service has stopped processing speech.
        // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
        // This can happen for two broad classes of reasons.
        // 1. An error is encountered.
        //    In this case the .errorDetails property will contain a textual representation of the error.
        // 2. No additional audio is available.
        //    Caused by the input stream being closed or reaching the end of an audio file.
        reco.canceled = function (s, e) {
            // window.console.log(e);

            console.log("(cancel) Reason: " + SpeechSDK.CancellationReason[e.reason]);
            if (e.reason === SpeechSDK.CancellationReason.Error) {
                console.log(": " + e.errorDetails);
            }
        };

        // Signals that a new session has started with the speech service
        reco.sessionStarted = function (s, e) {
            // window.console.log(e);
            console.log("(sessionStarted) SessionId: " + e.sessionId);
        };

        // Signals the end of a session with the speech service.
        reco.sessionStopped = function (s, e) {
            // window.console.log(e);
            console.log("(sessionStopped) SessionId: " + e.sessionId);
            startConversationBtn.disabled = false;
            stopConversationBtn.disabled = true;
        };

        // Signals that the speech service has started to detect speech.
        reco.speechStartDetected = function (s, e) {
            console.log("(speechStartDetected) SessionId: " + e.sessionId);
            lastRecognized = "";
            messageId = uuidv1();
            document.getElementById("chat-message-list").innerHTML += `
                <li id=${messageId} class="left clearfix">
                    <span class="chat-img pull-left">
                        <img src="https://bootdey.com/img/Content/user_3.jpg" alt="User Avatar">
                    </span>
                    <div class="chat-body clearfix">
                    <div class="header">
                        <strong class="primary-font">John Doe</strong>
                        <small class="pull-right text-muted"><i class="fa fa-clock-o"></i> 12 mins ago</small>
                    </div>
                        <p>
                        </p>
                    </div>
                </li>`;
        };

        // Signals that the speech service has detected that speech has stopped.
        reco.speechEndDetected = function (s, e) {
            // window.console.log(e);
            console.log("(speechEndDetected) SessionId: " + e.sessionId);
        };

        // Starts recognition
        reco.startContinuousRecognitionAsync();

        startConversationBtn.disabled = true;
        stopConversationBtn.disabled = false;
    });

    // Stops recognition and disposes of resources.
    stopConversationBtn.addEventListener("click", function () {
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

        startConversationBtn.disabled = false;
        stopConversationBtn.disabled = true;
    });
});
