document.addEventListener('DOMContentLoaded', () => {
    // --- Particle Animation ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1; // Size between 1 and 4
            this.speedX = Math.random() * 1 - 0.5; // Random horizontal movement
            this.speedY = Math.random() * 1 - 0.5; // Random vertical movement
            // Theme colors: Brown (#5D4037) and Blue (#64B5F6) with transparency
            const colors = ['rgba(93, 64, 55, 0.3)', 'rgba(100, 181, 246, 0.3)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around screen
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000; // Density
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }

    init();
    animate();

    // Resize event
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    // --- Background Music Logic ---
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = musicBtn.querySelector('i');
    const musicSpan = musicBtn.querySelector('span');

    let isPlaying = false;

    function toggleMusic() {
        if (isPlaying) {
            music.pause();
            musicIcon.classList.remove('ri-pause-line');
            musicIcon.classList.add('ri-music-2-line');
            musicBtn.classList.remove('playing');
            musicSpan.textContent = "Play Music";
        } else {
            music.play().then(() => {
                musicIcon.classList.remove('ri-music-2-line');
                musicIcon.classList.add('ri-pause-line');
                musicBtn.classList.add('playing');
                musicSpan.textContent = "Pause Music";
            }).catch(error => {
                console.log("Autoplay prevented:", error);
            });
        }
        isPlaying = !isPlaying;
    }

    musicBtn.addEventListener('click', toggleMusic);

    // Attempt Autoplay on first interaction (if blocked initially)
    document.addEventListener('click', function initAudio() {
        if (!isPlaying) {
            music.play().then(() => {
                isPlaying = true;
                musicIcon.classList.remove('ri-music-2-line');
                musicIcon.classList.add('ri-pause-line');
                musicBtn.classList.add('playing');
                musicSpan.textContent = "Pause Music";
            }).catch(() => { });
        }
        document.removeEventListener('click', initAudio);
    }, { once: true });

    // Try to autoplay on load (might be blocked)
    music.volume = 0.5; // Set volume to 50%
    music.play().then(() => {
        isPlaying = true;
        musicIcon.classList.remove('ri-music-2-line');
        musicIcon.classList.add('ri-pause-line');
        musicBtn.classList.add('playing');
        musicSpan.textContent = "Pause Music";
    }).catch(() => {
        console.log("Autoplay blocked. Waiting for user interaction.");
    });

    // Scroll Indicator Logic
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        scrollDown.addEventListener('click', () => {
            const gallery = document.querySelector('.soundtrack-section');
            if (gallery) {
                gallery.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
