(function () {
    var MUSIC_KEY = 'birthdayMusicCurrentTime';

    function resolveMusicSrc() {
        // Build a stable URL from where shared-music.js is actually served.
        // Works for both local server (/) and GitHub Pages (/repo-name/).
        var script = document.currentScript;
        if (script && script.src) {
            var scriptUrl = new URL(script.src, window.location.href);
            var basePath = scriptUrl.pathname.replace(/\/shared-music\.js$/, '/');
            return scriptUrl.origin + basePath + 'happy-birthday/music.mp3';
        }

        // Fallback for older browser behavior.
        return new URL('happy-birthday/music.mp3', window.location.origin + '/').toString();
    }

    function initSharedMusic() {
        var audio = document.getElementById('global-music');

        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'global-music';
            audio.src = resolveMusicSrc();
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
