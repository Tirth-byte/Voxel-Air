
import { COLORS, createGlassMaterial, createTextTexture } from './UITheme.js';

const THREE = window.THREE;

export class AirButton {
    constructor(scene, label = "MENU", onClick = null) {
        this.scene = scene;
        this.onClick = onClick;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Background Mesh (Rounded Square)
        const shape = new THREE.Shape();
        const w = 1.0;
        const h = 1.0;
        const r = 0.2;
        shape.moveTo(-w / 2 + r, -h / 2);
        shape.lineTo(w / 2 - r, -h / 2);
        shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        shape.lineTo(w / 2, h / 2 - r);
        shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        shape.lineTo(-w / 2 + r, h / 2);
        shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        shape.lineTo(-w / 2, -h / 2 + r);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

        const geometry = new THREE.ShapeGeometry(shape);
        this.material = createGlassMaterial(COLORS.WHITE, 0.4);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.group.add(this.mesh);

        // Border/Glow
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({ color: COLORS.LIGHT_BLUE, transparent: true, opacity: 0.5 })
        );
        this.group.add(edges);
        this.border = edges;

        // Label
        if (label) {
            const { texture, width, height } = createTextTexture(label, 64, '#00f0ff');
            const labelGeo = new THREE.PlaneGeometry(width * 0.015, height * 0.015);
            const labelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            this.labelMesh = new THREE.Mesh(labelGeo, labelMat);
            this.labelMesh.position.z = 0.02; // slightly in front
            this.group.add(this.labelMesh);
        }

        this.targetPos = new THREE.Vector3();
        this.isHovered = false;
        this.clickTimer = 0;
        this.coolDown = 0;

        this.visible = true;
    }

    updateVisuals(camera) {
        if (!this.visible) {
            this.group.visible = false;
            return;
        }
        this.group.visible = true;

        const offset = new THREE.Vector3(3.5, 0, -8);
        offset.applyMatrix4(camera.matrixWorld);

        this.targetPos.copy(offset);
        this.group.position.lerp(this.targetPos, 0.05);
        this.group.lookAt(camera.position); // Always face camera

        if (this.coolDown > 0) this.coolDown--;
    }

    checkInteraction(rightIndexTip, isPinching) {
        if (!this.visible || this.coolDown > 0) return false;

        let interacted = false;

        // Ensure accurate world position distance check
        // We use the group's current position (which is updated in animate, but reasonably close)
        const dist = this.group.position.distanceTo(rightIndexTip);

        if (dist < 1.2) {
            if (!this.isHovered) {
                this.isHovered = true;
                this.material.opacity = 0.6;
                this.border.material.color.setHex(COLORS.ACTIVE_GLOW);
                this.group.scale.setScalar(1.1);
            }

            if (isPinching) {
                if (this.clickTimer < 10) {
                    this.clickTimer++;
                } else {
                    if (this.onClick) this.onClick();
                    this.flash();
                    this.coolDown = 30;
                    interacted = true;
                }
            } else {
                this.clickTimer = 0;
            }
            interacted = true;
        } else {
            if (this.isHovered) {
                this.isHovered = false;
                this.material.opacity = 0.4;
                this.border.material.color.setHex(COLORS.LIGHT_BLUE);
                this.group.scale.setScalar(1.0);
            }
            this.clickTimer = 0;
        }
        return interacted;
    }

    flash() {
        this.material.color.setHex(COLORS.ACTIVE_GLOW);
        setTimeout(() => {
            this.material.color.setHex(COLORS.WHITE);
        }, 150);
    }
}
