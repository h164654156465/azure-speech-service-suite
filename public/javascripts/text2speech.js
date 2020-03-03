document.addEventListener("DOMContentLoaded", () => {
    synthBtn.addEventListener('click', () => {
        let languageMapping = {
            'en-US': 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)',
            'ja-JP': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)',
            'ko-KR': 'Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)',
            'es-ES': 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
            'fr-FR': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)',
        }
        let lang = synthLangOptions.value;
        let voice = languageMapping[`${lang}`];
        let params = {
            token: token,
            lang: lang,
            voice: voice,
            text: synthInput.value
        }

        var queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

        fetch(`/text-to-speech?${queryString}`)
            .then((res) => {
                return res.json();
            }).then((res) => {
                if (res.status == 'success') {
                    audioPlayer.setAttribute('src', res.path);
                    audioPlayer.addEventListener('ended', (event) => {
                        deleteFile(`/text-to-speech/file?path=${res.path}`).then((res) => {
                            console.log(res);

                            audioPlayer.setAttribute('src', '');
                        });
                    });
                } else {
                    console.log('response err');
                }
            });
    });

    let deleteFile = async (url) => {
        const res = await fetch(url, {
            method: 'delete'
        });

        return await res.json();
    }
});