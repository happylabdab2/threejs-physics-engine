//importing three js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.171.0/+esm'

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Pointer lock variables
let isPointerLocked = false;
let rotationSpeed = 0.002; // Adjust sensitivity

// Create a Euler for camera rotation
const cameraEuler = new THREE.Euler(0, 0, 0, 'YXZ'); // YXZ for proper FPS-style rotations

// Clamp settings
const pitchLimit = Math.PI / 2.5; // ±72 degrees
const rollLimit = Math.PI / 4; // ±45 degrees

// Add event listener to enable pointer lock on click
renderer.domElement.addEventListener("click", async () => {
    if (!isPointerLocked) {
        try {
            await renderer.domElement.requestPointerLock();
        } catch (error) {
            console.error("Pointer lock failed:", error);
        }
    }
});

// Handle pointer lock changes
document.addEventListener("pointerlockchange", () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
    if (!isPointerLocked) {
        console.log("Pointer lock released.");
    }
});

// Mouse movement handler
document.addEventListener("mousemove", (event) => {
    if (isPointerLocked) {
        cameraEuler.y -= event.movementX * rotationSpeed; // Adjust yaw (horizontal)
        cameraEuler.x -= event.movementY * rotationSpeed; // Adjust pitch (vertical)

        // Clamp pitch and roll
        cameraEuler.x = THREE.MathUtils.clamp(cameraEuler.x, -pitchLimit, pitchLimit);
        cameraEuler.z = THREE.MathUtils.clamp(cameraEuler.z, -rollLimit, rollLimit);
    }
});

// Update camera orientation
function updateCameraRotation() {
    camera.setRotationFromEuler(cameraEuler); // Apply Euler rotation to the camera
}

// Movement variables
const movementSpeed = 0.1;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Event listeners for key presses
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// C U B E
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

let angle = 0;
let speed = 0.02;
let aplitude = 2;

//loop
function animate() {

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    cube.position.y = 2 + Math.sin(angle) * aplitude;
    angle += speed;

    updateCameraRotation(); // Update the camera based on mouse movement

    //  Movement stuff
    // Reset direction
    direction.set(0, 0, 0);

    // Update movement direction based on keys
    if (keys['KeyW'] || keys['ArrowUp']) direction.z -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) direction.z += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) direction.x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) direction.x += 1;

    // Normalize direction to maintain consistent speed
    direction.normalize();

    // Move the camera
    velocity.copy(direction).applyQuaternion(camera.quaternion).multiplyScalar(movementSpeed);
    camera.position.add(velocity);


    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);