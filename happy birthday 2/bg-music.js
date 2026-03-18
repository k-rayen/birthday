(function () {
    var MUSIC_KEY = 'birthdayMusicCurrentTime';
    var MUSIC_SRC = '../happy-birthday/music.mp3';

    function setupGlobalMusic() {
        var existing = document.getElementById('global-music');
        var audio = existing || document.createElement('audio');

        if (!existing) {
            audio.id = 'global-music';
            audio.loop = true;
            audio.autoplay = true;
            audio.preload = 'auto';
            audio.style.display = 'none';

            var source = document.createElement('source');
            source.src = MUSIC_SRC;
            source.type = 'audio/mpeg';
            audio.appendChild(source);
            document.body.appendChild(audio);
        }

        var savedTime = parseFloat(localStorage.getItem(MUSIC_KEY));
        if (!Number.isNaN(savedTime) && savedTime > 0) {
            audio.currentTime = savedTime;
        }

        var resumePromise = audio.play();
        if (resumePromise && typeof resumePromise.catch === 'function') {
            resumePromise.catch(function () {
                // Ignore autoplay errors; playback can start on user interaction.
            });
        }

        setInterval(function () {
            if (!audio.paused) {
                localStorage.setItem(MUSIC_KEY, String(audio.currentTime));
            }
        }, 1000);

        window.addEventListener('beforeunload', function () {
            localStorage.setItem(MUSIC_KEY, String(audio.currentTime));
        });

        document.addEventListener('click', function () {
            if (audio.paused) {
                audio.play().catch(function () {
                    // Keep silent on blocked playback.
                });
            }
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupGlobalMusic);
    } else {
        setupGlobalMusic();
    }
})();
