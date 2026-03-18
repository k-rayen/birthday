(function () {
    var MUSIC_KEY = 'birthdayMusicCurrentTime';
    var MUSIC_SRC = '/happy-birthday/music.mp3';

    function initSharedMusic() {
        var audio = document.getElementById('global-music');

        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'global-music';
            audio.src = MUSIC_SRC;
            audio.loop = true;
            audio.preload = 'auto';
            audio.autoplay = true;
            audio.style.display = 'none';
            document.body.appendChild(audio);
        }

        var savedTime = parseFloat(localStorage.getItem(MUSIC_KEY));
        if (!Number.isNaN(savedTime) && savedTime >= 0) {
            audio.currentTime = savedTime;
        }

        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                // Autoplay may be blocked until first user interaction.
            });
        }

        function persistTime() {
            if (!audio.paused) {
                localStorage.setItem(MUSIC_KEY, String(audio.currentTime));
            }
        }

        setInterval(persistTime, 1000);
        window.addEventListener('beforeunload', persistTime);

        document.addEventListener('click', function () {
            if (audio.paused) {
                audio.play().catch(function () {
                    // Ignore blocked playback errors.
                });
            }
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSharedMusic);
    } else {
        initSharedMusic();
    }
})();
