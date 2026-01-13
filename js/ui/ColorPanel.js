
import { COLORS, createGlassMaterial } from './UITheme.js';

const THREE = window.THREE;

export class ColorPanel {
    constructor(scene, onColorSelect) {
        this.scene = scene;
        this.onColorSelect = onColorSelect;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Background Panel
        const bgGeo = new THREE.PlaneGeometry(5, 1.5);
        this.bgMat = createGlassMaterial(0x000000, 0.6);
        this.bg = new THREE.Mesh(bgGeo, this.bgMat);
        this.bg.position.z = -0.1;
        this.group.add(this.bg);

        // Swatches
        this.swatches = [];
        const colorList = [
            COLORS.WHITE, COLORS.LIGHT_BLUE, COLORS.CYAN,
            COLORS.PURPLE, COLORS.GREEN, COLORS.ORANGE
        ];

        const startX = -2.0;
        const spacing = 0.8;

        colorList.forEach((col, i) => {
            const sGeo = new THREE.CircleGeometry(0.25, 32);
            const sMat = new THREE.MeshBasicMaterial({ color: col });
            const mesh = new THREE.Mesh(sGeo, sMat);
            mesh.position.set(startX + (i * spacing), 0, 0.05);

            // Halo for selection
            const haloGeo = new THREE.RingGeometry(0.3, 0.35, 32);
            const haloMat = new THREE.MeshBasicMaterial({ color: COLORS.WHITE, transparent: true, opacity: 0 });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            mesh.add(halo);

            mesh.userData = { color: col, originalScale: 1, halo: halo };
            this.group.add(mesh);
            this.swatches.push(mesh);
        });

        this.group.visible = false;
        this.isOpen = false;
        this.scale = 0;
        this.coolDown = 0;
    }

    show(position) {
        this.isOpen = true;
        this.group.visible = true;
        // Position to the left of the button
        this.group.position.copy(position);
        this.group.position.x -= 3.5; // Shift left
        this.group.lookAt(this.scene.position); // Look at center generally, but easier to just look at camera
        this.scale = 0;
    }

    hide() {
        this.isOpen = false;
    }

    updateVisuals(camera) {
        if (!this.isOpen && this.scale <= 0.01) {
            this.group.visible = false;
            return;
        }

        const targetScale = this.isOpen ? 1 : 0;
        this.scale += (targetScale - this.scale) * 0.1;
        this.group.scale.setScalar(this.scale);
        this.group.lookAt(camera.position);

        // Always pulse hovered items slightly or rotate them? Nah, keep it static clean.

        if (this.coolDown > 0) this.coolDown--;
    }

    checkInteraction(rightIndexTip, isPinching) {
        if (!this.isOpen) return false;

        let interacted = false;

        if (rightIndexTip && this.coolDown <= 0) {
            let hoveredSwatch = null;

            for (const swatch of this.swatches) {
                const worldPos = new THREE.Vector3();
                swatch.getWorldPosition(worldPos);

                const dist = worldPos.distanceTo(rightIndexTip);
                if (dist < 0.4) {
                    hoveredSwatch = swatch;
                    break;
                }
            }

            // Reset all
            this.swatches.forEach(s => {
                s.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
                s.userData.halo.material.opacity = 0;
            });

            if (hoveredSwatch) {
                hoveredSwatch.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.2);
                hoveredSwatch.userData.halo.material.opacity = 1;
                interacted = true;

                if (isPinching) {
                    this.onColorSelect(hoveredSwatch.userData.color);
                    this.flash(hoveredSwatch);
                    this.coolDown = 20;
                }
            }
        }
        return interacted;
    }

    flash(swatch) {
        swatch.material.color.setHex(0xffffff);
        setTimeout(() => {
            swatch.material.color.setHex(swatch.userData.color);
        }, 100);
    }
}
