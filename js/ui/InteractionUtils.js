
const THREE = window.THREE;

export const OBSERVER_FRAME_SIZE = 12; // Matches approximate grid area

export function createWorkspaceFrame() {
    // Elegant, thin boundary box
    const geometry = new THREE.BoxGeometry(OBSERVER_FRAME_SIZE, OBSERVER_FRAME_SIZE * 0.6, OBSERVER_FRAME_SIZE);
    const edges = new THREE.EdgesGeometry(geometry);

    const material = new THREE.LineBasicMaterial({
        color: 0x00FF88, // Matches brand
        transparent: true,
        opacity: 0.15, // Very subtle, barely there
        linewidth: 1,
        depthWrite: false
    });

    const lines = new THREE.LineSegments(edges, material);
    lines.position.y = 0; // Center it? Or maybe Align bottom?
    // Grid logic usually puts 0,0,0 at center of floor. 
    // If we want it to frame the workspace, let's just center it for now.

    return lines;
}

export function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) { /* Safari */
        el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) { /* IE11 */
        el.msRequestFullscreen();
    }
}
