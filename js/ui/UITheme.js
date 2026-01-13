
const THREE = window.THREE;

export const COLORS = {
    // "Apple-style" Premium Green (Holographic/Cyber but clean)
    // Using a Spring Green / Mint variant that glows well against dark backgrounds
    VOXEL_GREEN: 0x00FF88,

    // UI Colors
    TEXT_MAIN: 0xffffff,
    TEXT_SUBTLE: 0xaaaaaa,

    GLASS_BG: 0x000000,
    GLASS_BORDER: 0xffffff
};

export function createPremiumVoxelMaterial() {
    // Holographic Glass Look
    // Physical material gives better "glass" feel if we had env map, but without it, it's dull.
    // We will use specialized Phong with custom settings for that "Apple AR" look.

    const mat = new THREE.MeshPhongMaterial({
        color: COLORS.VOXEL_GREEN,
        emissive: 0x003311, // Deep green glow from inside
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.15, // Very sheer
        shininess: 100,
        specular: 0xffffff, // Sharp highlights
        side: THREE.FrontSide, // Optimization
        flatShading: false
    });

    return mat;
}

export function createPremiumWireframeMaterial() {
    return new THREE.LineBasicMaterial({
        color: 0xccffdd, // Whitish green
        transparent: true,
        opacity: 0.3, // Subtle
        linewidth: 1, // Note: WebGL limitation often locks this to 1
        depthWrite: false // Helps with transparency blending
    });
}

export function createTextTexture(text, fontSize = 32, color = 'white', font = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // High DPI scaling
    const scale = 2;
    ctx.font = `300 ${fontSize * scale}px ${font}`; // 300 = Light weight

    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(fontSize * scale * 1.5);

    canvas.width = textWidth + 20;
    canvas.height = textHeight + 20;

    // Reset after resize
    ctx.font = `300 ${fontSize * scale}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Slight shadow for readability against video
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;

    return { texture: tex, width: canvas.width / (100 * scale), height: canvas.height / (100 * scale) };
}
