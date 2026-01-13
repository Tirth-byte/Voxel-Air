
import { createTextTexture } from './UITheme.js';

const THREE = window.THREE;

export class BrandOverlay {
    constructor(camera) {
        this.camera = camera;

        // "Made by TIRTH" - Premium Style
        // Enhanced visibility: Higher opacity texture, scaled down in mesh
        // Using a slightly stronger white for "guaranteed visibility" against dark/video backgrounds
        const { texture, width, height } = createTextTexture("Made by TIRTH", 64, 'rgba(255, 255, 255, 0.8)', 'system-ui, -apple-system, sans-serif');

        // Use Sprite for better HUD-like behavior (always faces camera, easier 2D sizing)
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9, // Almost fully opaque to guarantee visibility
            depthTest: false, // Always on top
            depthWrite: false
        });

        this.sprite = new THREE.Sprite(mat);

        // Initial setup
        camera.add(this.sprite);
        this.updatePosition(window.innerWidth, window.innerHeight);

        // Auto-update on resize
        window.addEventListener('resize', () => {
            this.updatePosition(window.innerWidth, window.innerHeight);
        });
    }

    updatePosition(screenWidth, screenHeight) {
        // Calculate the visible height at distance z=-1
        // h = 2 * tan(fov/2) * dist
        // But for direct camera children with PerspectiveCamera, we need to be careful.
        // Let's use a fixed Z and basic trigonometry.

        const dist = 5; // Push it out a bit so it doesn't clip near plane
        const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
        const visibleWidth = visibleHeight * (screenWidth / screenHeight);

        // Scale sprite (maintain aspect ratio)
        // Texture width/height are relative. 
        // We want the text to be small. Say 3% of screen height.
        const targetHeight = visibleHeight * 0.03;
        const aspect = this.sprite.material.map.image.width / this.sprite.material.map.image.height;

        this.sprite.scale.set(targetHeight * aspect, targetHeight, 1);

        // Position Bottom Right
        // Right edge = visibleWidth / 2
        // Bottom edge = -visibleHeight / 2
        // Add margin
        const marginX = visibleWidth * 0.05;
        const marginY = visibleHeight * 0.05;

        this.sprite.position.set(
            (visibleWidth / 2) - marginX - (this.sprite.scale.x / 2),
            -(visibleHeight / 2) + marginY + (this.sprite.scale.y / 2),
            -dist
        );
    }
}
