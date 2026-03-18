(function () {
    var MUSIC_KEY = 'birthdayMusicCurrentTime';

    function getBasePath() {
        var pathParts = window.location.pathname.split('/').filter(Boolean);

        // GitHub Pages project site: /<repo>/...
        if (window.location.hostname.endsWith('github.io') && pathParts.length > 0) {
            return '/' + pathParts[0] + '/';
        }

        // Local server or custom host.
        return '/';
    }

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
        return new URL(getBasePath() + 'happy-birthday/music.mp3', window.location.origin).toString();
    }

    function showMusicError() {
        if (document.getElementById('global-music-error')) {
            return;
        }

        var error = document.createElement('div');
        error.id = 'global-music-error';
        error.textContent = 'Music error: file cannot be played on this browser.';
        error.style.position = 'fixed';
        error.style.left = '16px';
        error.style.bottom = '16px';
        error.style.zIndex = '2147483647';
        error.style.padding = '10px 14px';
        error.style.borderRadius = '10px';
        error.style.background = 'rgba(0, 0, 0, 0.75)';
        error.style.color = '#fff';
        error.style.fontSize = '13px';
        document.body.appendChild(error);
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

        audio.addEventListener('error', function () {
            showMusicError();
        });

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
                audio.muted = false;
                audio.volume = 1;
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
