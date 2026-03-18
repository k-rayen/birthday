(function () {
    var MUSIC_TIME_KEY = 'birthdayMusicCurrentTime';
    var MUSIC_STAMP_KEY = 'birthdayMusicTimestamp';
    var MUSIC_ENABLED_KEY = 'birthdayMusicEnabled';

    function getBasePath() {
        var pathParts = window.location.pathname.split('/').filter(Boolean);

        // GitHub Pages project site: /<repo>/...
        if (window.location.hostname.endsWith('github.io') && pathParts.length > 0) {
            return '/' + pathParts[0] + '/';
        }

        // Local server or custom host.
        return '/';
    }

    function resolveMusicSrc() {
        return new URL(getBasePath() + 'happy-birthday/music.mp3', window.location.origin).toString();
    }

    function getAdjustedResumeTime() {
        var savedTime = parseFloat(localStorage.getItem(MUSIC_TIME_KEY));
        var savedStamp = parseInt(localStorage.getItem(MUSIC_STAMP_KEY), 10);

        if (Number.isNaN(savedTime) || savedTime < 0) {
            return 0;
        }

        if (!Number.isNaN(savedStamp) && savedStamp > 0) {
            var elapsed = (Date.now() - savedStamp) / 1000;
            if (elapsed > 0) {
                return savedTime + elapsed;
            }
        }

        return savedTime;
    }

    function setResumeTime(audio, time) {
        if (!(time > 0)) {
            return;
        }

        var applyTime = function () {
            try {
                if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
                    audio.currentTime = time % audio.duration;
                } else {
                    audio.currentTime = time;
                }
            } catch (e) {
                // Ignore seek timing errors while metadata is loading.
            }
        };

        if (audio.readyState >= 1) {
            applyTime();
        } else {
            audio.addEventListener('loadedmetadata', applyTime, { once: true });
        }
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
            // Keep UI clean; log only for debugging.
            console.warn('Music playback error for:', audio.src);
        });

        setResumeTime(audio, getAdjustedResumeTime());

        function persistTime() {
            if (!audio.paused) {
                localStorage.setItem(MUSIC_TIME_KEY, String(audio.currentTime));
                localStorage.setItem(MUSIC_STAMP_KEY, String(Date.now()));
            }
        }

        setInterval(persistTime, 250);
        window.addEventListener('beforeunload', persistTime);

        // Expose for page scripts before navigation.
        window.persistBirthdayMusic = persistTime;

        function attemptPlay() {
            audio.muted = false;
            audio.volume = 1;

            var p = audio.play();
            if (p && typeof p.then === 'function') {
                p.then(function () {
                    localStorage.setItem(MUSIC_ENABLED_KEY, '1');
                    persistTime();
                }).catch(function () {
                    // Browser policy may still wait for user interaction.
                });
            }
        }

        // Public function used by the CTA click to start music explicitly.
        window.startBirthdayMusic = function () {
            localStorage.setItem(MUSIC_ENABLED_KEY, '1');
            attemptPlay();
        };

        // Continue automatically on next pages after first explicit start.
        if (localStorage.getItem(MUSIC_ENABLED_KEY) === '1') {
            attemptPlay();
        }

        function resumeIfEnabled() {
            if (localStorage.getItem(MUSIC_ENABLED_KEY) === '1') {
                attemptPlay();
            }
        }

        // If autoplay is blocked after a page load, resume on first interaction.
        document.addEventListener('click', resumeIfEnabled, { passive: true });
        document.addEventListener('touchstart', resumeIfEnabled, { passive: true });
        document.addEventListener('keydown', resumeIfEnabled);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') {
                resumeIfEnabled();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSharedMusic);
    } else {
        initSharedMusic();
    }
})();
