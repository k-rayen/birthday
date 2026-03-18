(function () {
    var MUSIC_KEY = 'birthdayMusicCurrentTime';

    function createPlayButton(audio) {
        if (document.getElementById('global-music-play-btn')) {
            return;
        }

        var btn = document.createElement('button');
        btn.id = 'global-music-play-btn';
        btn.textContent = 'Play Music';
        btn.style.position = 'fixed';
        btn.style.right = '16px';
        btn.style.bottom = '16px';
        btn.style.zIndex = '2147483647';
        btn.style.padding = '10px 14px';
        btn.style.border = 'none';
        btn.style.borderRadius = '999px';
        btn.style.background = 'linear-gradient(45deg, #ff69b4, #ff99cc)';
        btn.style.color = '#fff';
        btn.style.fontSize = '14px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 6px 18px rgba(255, 105, 180, 0.4)';

        btn.addEventListener('click', function () {
            audio.play().then(function () {
                btn.remove();
            }).catch(function () {
                // Keep button visible if playback still fails.
            });
        });

        document.body.appendChild(btn);
    }

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
                createPlayButton(audio);
            });
        }

        function persistTime() {
            if (!audio.paused) {
                localStorage.setItem(MUSIC_KEY, String(audio.currentTime));
            }
        }

        setInterval(persistTime, 1000);
        window.addEventListener('beforeunload', persistTime);

        function tryResume() {
            if (audio.paused) {
                audio.play().catch(function () {
                    createPlayButton(audio);
                });
            }
        }

        document.addEventListener('click', tryResume, { once: true });
        document.addEventListener('touchstart', tryResume, { once: true });
        document.addEventListener('keydown', tryResume, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSharedMusic);
    } else {
        initSharedMusic();
    }
})();
