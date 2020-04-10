'use strict';

import { getToken } from './utils.js';

let token;
getToken().then((data) => token = data);

let synthLangOptions = document.getElementById('synthLanguageOptions');
let speakingStylesOptions = document.getElementById('speakingStylesOptions');
let synthInput = document.getElementById('synthInput');
let synthBtn = document.getElementById('synthBtn');
let audioPlayer = document.getElementById('audioPlayer');

// Change speaking style options according to output language.
synthLangOptions.addEventListener('change', () => {
    speakingStylesOptions.innerHTML = ''; // Clean up select options.
    let lang = synthLangOptions.value;
    let optionsMapping = {
        'en-US': ['neutral', 'newscast', 'customerservice', 'chat', 'cheerful', 'empathetic'],
        'zh-CN': ['neutral', 'newscast', 'customerservice', 'assistant', 'lyrical']
    };
    if (lang === 'en-US' || lang === 'zh-CN') {
        optionsMapping[lang].map((optionVal) => {
            let option = document.createElement('option');
            option.appendChild(document.createTextNode(optionVal));
            if (optionVal === 'neutral') option.value = '';
            else option.value = optionVal;
            speakingStylesOptions.appendChild(option);
        });
    }
});

// Execute a function when the user releases a key on the keyboard
synthInput.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    synthBtn.click();
  }
});

// Generate voice output based on custom options when clicking this button.
synthBtn.addEventListener('click', async () => {
    // For full language and voice support visit: https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support
    let languageMapping = {
        'en-US': 'en-US-AriaNeural',
        'zh-CN': 'zh-CN-XiaoxiaoNeural',
        'ja-JP': 'ja-JP-Ayumi-Apollo',
        'ko-KR': 'ko-KR-HeamiRUS',
        'es-ES': 'es-ES-Laura-Apollo',
        'fr-FR': 'fr-FR-Julie-Apollo',
    }
    let lang = synthLangOptions.value;
    let voice = languageMapping[`${lang}`];
    let style = speakingStylesOptions.value;
    let params = {
        token: token,
        lang: lang,
        voice: voice,
        text: synthInput.value,
        style: style
    }

    let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

    let res = await fetch(`/text-to-speech/synthesize?${queryString}`);
    res = await res.json();
    if (res.status === 'success') audioPlayer.setAttribute('src', res.path);
    else console.log('response err');
});

audioPlayer.addEventListener('ended', (event) => {
    let url = new URL(audioPlayer.src); // Contruct url to URL object.
    let path = url.pathname; // Only pathname is needed.

    deleteFile(`/text-to-speech/file?path=${path}`).then((res) => {
        console.log(res);

        audioPlayer.setAttribute('src', '');
    });
});

const deleteFile = async (url) => {
    const res = await fetch(url, {
        method: 'delete'
    });

    return await res.json();
}