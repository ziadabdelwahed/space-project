window.onerror = function (msg) {
    alert("ERROR: " + msg);
};

import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

import { createGalaxyBackground } from './scene.js';
import { createBlackHole } from './blackhole.js';
import { createSolarSystem } from './planets.js';
import { setupRaycaster } from './controls.js';

// --- التهيئة الأولية ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050510);

const light = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 25);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.2;

document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Post Processing ---
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);

bloomPass.threshold = 0.1;
bloomPass.strength = 1.2;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableZoom = true;
controls.enablePan = true;
controls.maxPolarAngle = Math.PI;
controls.minDistance = 5;
controls.maxDistance = 120;

// --- Scene Objects ---
createGalaxyBackground(scene);
const blackHoleGroup = createBlackHole(scene);
const planets = createSolarSystem(scene);

setupRaycaster(camera, renderer.domElement, [...planets, blackHoleGroup], (name, desc) => {
    document.getElementById('object-name').textContent = name;
    document.getElementById('object-desc').textContent = desc;
});

// --- Animation ---
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (planets) {
        planets.forEach(p => p.update());
    }

    if (blackHoleGroup.userData.update) {
        blackHoleGroup.userData.update();
    }

    composer.render();
}

animate();

// --- Resize ---
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
