
import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const PARTICLE_COUNT = 8000;
    const PARTICLE_SIZE = 3.5;
    const TRANSITION_SPEED = 0.05;

    // --- 3D Scene Setup ---
    let camera, scene, renderer, particles, geometry, material;
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    // Shape positions
    let currentShapePositions = [];
    let transformPositions = [];
    const shapes = {
        sphere: [],
        heart: [],
        flower: [],
        saturn: []
    };

    // Tracking State
    let isHandDetected = false;
    let handOpenness = 1.0;
    let smoothedOpenness = 1.0;

    initThreeJS();
    // Don't init MediaPipe immediately. Wait for user interaction.
    initPermissionModal();
    animateThreeJS();
    initMusicPlayer();
    initScrollLogic();
    initUIControls();

    function initPermissionModal() {
        const modal = document.getElementById('camera-modal');
        const btn = document.getElementById('enable-camera-btn');
        const statusSpan = document.getElementById('hand-status');

        if (!modal || !btn) {
            // If elements missing, maybe fallback to auto init?
            console.warn("Camera Modal not found, trying auto-init");
            initMediaPipe();
            return;
        }

        btn.addEventListener('click', async () => {
            btn.textContent = "Requesting...";
            btn.disabled = true;

            try {
                // Determine constraint
                const constraints = { video: { width: 640, height: 480 } };

                // Request stream to trigger permission prompt
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                // If successful:
                console.log("Permission granted");
                stream.getTracks().forEach(track => track.stop()); // Stop this stream, MediaPipe will start its own

                // Hide Modal
                modal.classList.add('hidden');

                // Start MediaPipe
                statusSpan.textContent = "Starting Camera...";
                initMediaPipe();

            } catch (err) {
                console.error("Camera permission denied or error:", err);
                btn.textContent = "Permission Failed / Try Again";
                btn.disabled = false;
                statusSpan.textContent = "Camera Blocked";
                statusSpan.style.color = "red";
                alert("Camera access is required for the hand gesture features. Please allow access in your browser settings and try again.");
            }
        });
    }

    function initThreeJS() {
        const div = document.createElement('div');
        div.id = 'three-container';
        div.style.position = 'fixed';
        div.style.top = '0';
        div.style.left = '0';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.zIndex = '-1';
        div.style.pointerEvents = 'none';
        document.body.prepend(div);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 600;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xFDFBF7, 0.001);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        div.appendChild(renderer.domElement);

        generateShapes();

        // Initial Particles
        transformPositions = shapes.sphere;
        currentShapePositions = new Float32Array(shapes.sphere);

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(currentShapePositions), 3));

        const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

        material = new THREE.PointsMaterial({
            size: PARTICLE_SIZE,
            color: 0x64B5F6,
            map: sprite,
            alphaTest: 0.5,
            transparent: true,
            sizeAttenuation: true,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        document.addEventListener('pointermove', onPointerMove);
        window.addEventListener('resize', onWindowResize);
    }

    function generateShapes() {
        // 1. Sphere
        const radius = 250;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
            const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
            shapes.sphere.push(
                radius * Math.cos(theta) * Math.sin(phi),
                radius * Math.sin(theta) * Math.sin(phi),
                radius * Math.cos(phi)
            );
        }

        // 2. Heart
        const heartScale = 15;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const t = Math.random() * Math.PI * 2;
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            let z = (Math.random() - 0.5) * 10;
            shapes.heart.push(
                (x * heartScale) + (Math.random() - 0.5) * 15,
                (y * heartScale) + (Math.random() - 0.5) * 15,
                (z * heartScale) + (Math.random() - 0.5) * 15
            );
        }

        // 3. Flower
        const flowerScale = 180;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const k = 4;
            const r = Math.cos(k * theta) * Math.sin(phi) * flowerScale + (Math.random() * 50);
            shapes.flower.push(
                r * Math.cos(theta),
                r * Math.sin(theta),
                r * Math.cos(phi) * 0.5
            );
        }

        // 4. Saturn
        const planetRadius = 140;
        const ringInner = 180;
        const ringOuter = 340;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (i < PARTICLE_COUNT * 0.4) {
                const phi = Math.acos(-1 + (2 * i) / (PARTICLE_COUNT * 0.4));
                const theta = Math.sqrt((PARTICLE_COUNT * 0.4) * Math.PI) * phi;
                shapes.saturn.push(
                    planetRadius * Math.cos(theta) * Math.sin(phi),
                    planetRadius * Math.sin(theta) * Math.sin(phi),
                    planetRadius * Math.cos(phi)
                );
            } else {
                const angle = Math.random() * Math.PI * 2;
                const dist = ringInner + Math.random() * (ringOuter - ringInner);
                shapes.saturn.push(
                    Math.cos(angle) * dist,
                    (Math.random() - 0.5) * 8,
                    Math.sin(angle) * dist
                );
            }
        }
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onPointerMove(event) {
        if (event.isPrimary === false) return;
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function animateThreeJS() {
        requestAnimationFrame(animateThreeJS);

        // 1. Hand Tracking Openness
        let targetOpenness = 1.0;
        if (isHandDetected) {
            targetOpenness = handOpenness;
        } else {
            const time = Date.now() * 0.001;
            targetOpenness = 0.8 + Math.sin(time) * 0.2;
        }
        smoothedOpenness += (targetOpenness - smoothedOpenness) * 0.1;

        // 2. Scale Effect
        const scale = 0.4 + (smoothedOpenness * 1.4);
        particles.scale.setScalar(scale);

        // 3. Rotation & Logic
        particles.rotation.y += 0.001;
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // 4. Morphing
        const positionsAttribute = geometry.attributes.position;
        const currentPos = positionsAttribute.array;

        let needsUpdate = false;
        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
            const target = transformPositions[i];
            const diff = target - currentPos[i];
            if (Math.abs(diff) > 0.01) {
                currentPos[i] += diff * TRANSITION_SPEED;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            positionsAttribute.needsUpdate = true;
        }

        renderer.render(scene, camera);
    }

    // --- MediaPipe Logic (Robust Global) ---
    function initMediaPipe() {
        const videoElement = document.getElementById('video-input');
        const statusSpan = document.getElementById('hand-status');

        if (typeof window.Hands === 'undefined' || typeof window.Camera === 'undefined') {
            console.error("MediaPipe scripts failed to load.");
            statusSpan.textContent = "Error: Libs not loaded.";
            statusSpan.style.color = "red";
            return;
        }

        const hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                isHandDetected = true;
                statusSpan.textContent = "Hand Detected";
                statusSpan.style.color = "green";

                const landmarks = results.multiHandLandmarks[0];
                const wrist = landmarks[0];
                const tips = [4, 8, 12, 16, 20];
                let totalDist = 0;
                tips.forEach(idx => {
                    const tip = landmarks[idx];
                    const d = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
                    totalDist += d;
                });

                const avgDist = totalDist / 5;
                let normalized = (avgDist - 0.15) / (0.55 - 0.15);
                handOpenness = Math.max(0, Math.min(1, normalized));
            } else {
                isHandDetected = false;
                statusSpan.textContent = "Show Hand...";
                statusSpan.style.color = "";
            }
        });

        const camera = new window.Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        camera.start()
            .then(() => {
                console.log("Camera started");
                statusSpan.textContent = "Camera Active";
            })
            .catch(err => {
                console.error("Camera failed", err);
                statusSpan.textContent = "Camera Error";
                statusSpan.style.color = "red";
            });
    }

    // --- UI Controls ---
    function initUIControls() {
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shape = e.target.getAttribute('data-shape');
                if (shapes[shape]) {
                    transformPositions = shapes[shape];
                    document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });

        const picker = document.getElementById('particle-color');
        if (picker) {
            picker.addEventListener('input', (e) => {
                if (material) material.color.set(e.target.value);
            });
        }
    }

    // --- Music & Scroll ---
    function initMusicPlayer() {
        const music = document.getElementById('bg-music');
        const musicBtn = document.getElementById('music-toggle');
        const musicIcon = musicBtn ? musicBtn.querySelector('i') : null;
        const musicSpan = musicBtn ? musicBtn.querySelector('span') : null;
        let isPlaying = false;

        function toggleMusic() {
            if (isPlaying) {
                music.pause();
                if (musicIcon) {
                    musicIcon.classList.remove('ri-pause-line');
                    musicIcon.classList.add('ri-music-2-line');
                }
                if (musicBtn) musicBtn.classList.remove('playing');
                if (musicSpan) musicSpan.textContent = "Play Music";
            } else {
                music.play().then(() => {
                    if (musicIcon) {
                        musicIcon.classList.remove('ri-music-2-line');
                        musicIcon.classList.add('ri-pause-line');
                    }
                    if (musicBtn) musicBtn.classList.add('playing');
                    if (musicSpan) musicSpan.textContent = "Pause Music";
                }).catch(error => console.log("Autoplay prevented:", error));
            }
            isPlaying = !isPlaying;
        }

        if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

        // Attempt Autoplay
        document.addEventListener('click', function initAudio() {
            if (!isPlaying && music) {
                music.play().then(() => {
                    isPlaying = true;
                    if (musicIcon) {
                        musicIcon.classList.remove('ri-music-2-line');
                        musicIcon.classList.add('ri-pause-line');
                    }
                    if (musicBtn) musicBtn.classList.add('playing');
                    if (musicSpan) musicSpan.textContent = "Pause Music";
                }).catch(() => { });
            }
            document.removeEventListener('click', initAudio);
        }, { once: true });
    }

    function initScrollLogic() {
        const scrollDown = document.querySelector('.scroll-down');
        if (scrollDown) {
            scrollDown.addEventListener('click', () => {
                const gallery = document.querySelector('.soundtrack-section');
                if (gallery) {
                    gallery.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

});
