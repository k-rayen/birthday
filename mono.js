(function () {
    var greetingText = "Hey You Know What! You're the most adorable human i ever met!";
    var greetingEl = document.getElementById('typed-greeting');
    var app = document.getElementById('app');
    var loader = document.getElementById('loader');
    var bgMusic = document.getElementById('bg-music');
    var reasonBtn = document.getElementById('reason-btn');
    var reasonCounter = document.getElementById('reason-counter');
    var reasonsContainer = document.getElementById('reasons-container');
    var goodbyeBtn = document.querySelector('.goodbye-btn');
    var customCursor = document.querySelector('.custom-cursor');

    var reasons = [
        { text: "You're such a kind and wonderful person, and I feel lucky to share such a good bond with you.", emoji: "🌟" },
        { text: "May your day be filled with love, laughter, and endless joy.", emoji: "💗" },
        { text: "Wishing you success, happiness, and everything your heart desires.", emoji: "💕" },
        { text: "Stay the amazing girl you are - always spreading positivity around. Have the happiest year ahead!", emoji: "🌟" }
    ];

    var reasonIndex = 0;

    function showStep(stepId) {
        document.querySelectorAll('.step').forEach(function (step) {
            step.classList.remove('is-active');
        });
        var next = document.getElementById(stepId);
        if (next) {
            next.classList.add('is-active');
            next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Trigger confetti when reaching memories
        if (stepId === 'step-memories') {
            triggerConfetti();
        }
    }

    function typeGreeting() {
        var i = 0;
        greetingEl.textContent = '';
        var timer = setInterval(function () {
            greetingEl.textContent += greetingText.charAt(i);
            i += 1;
            if (i >= greetingText.length) {
                clearInterval(timer);
            }
        }, 45);
    }

    function startMusic() {
        bgMusic.muted = false;
        bgMusic.volume = 1;
        bgMusic.play().catch(function () {
            // Ignore autoplay restriction warnings.
        });
    }

    function addReasonCard(reason) {
        var card = document.createElement('div');
        card.className = 'reason-card';
        card.textContent = reason.emoji + ' ' + reason.text;
        reasonsContainer.appendChild(card);
        if (window.gsap) {
            gsap.from(card, { opacity: 0, y: 24, duration: 0.35, ease: 'power2.out' });
        }
    }

    function triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(function () {
                confetti({
                    particleCount: 50,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }, 300);
        }
    }

    // Track mouse for custom cursor
    if (customCursor) {
        document.addEventListener('mousemove', function (e) {
            customCursor.style.left = (e.clientX - 15) + 'px';
            customCursor.style.top = (e.clientY - 15) + 'px';
        });
    }

    document.getElementById('play').addEventListener('click', function () {
        startMusic();
        loader.classList.add('is-hidden');
        app.classList.remove('is-hidden');
        showStep('step-intro');
        typeGreeting();
    });

    document.getElementById('next-page').addEventListener('click', function () {
        showStep('step-wish');
    });

    document.getElementById('to-reasons').addEventListener('click', function () {
        showStep('step-reasons');
    });

    reasonBtn.addEventListener('click', function () {
        if (reasonIndex < reasons.length) {
            addReasonCard(reasons[reasonIndex]);
            reasonCounter.textContent = 'Reason ' + (reasonIndex + 1) + ' of ' + reasons.length;
            reasonIndex += 1;
            if (reasonIndex === reasons.length) {
                reasonBtn.textContent = 'Enter Our Storylane 💫';
            }
            return;
        }
        showStep('step-memories');
    });

    if (goodbyeBtn) {
        goodbyeBtn.addEventListener('click', function () {
            triggerConfetti();
            alert('Thank you for celebrating with me! 💖');
        });
    }
})();
