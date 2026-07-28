// ============================================================
//  TEXTO CIRCULAR — The Last Location
// ============================================================

(function () {
    const svg = document.querySelector('.circular-text');
    const path = document.getElementById('circlePath');

    if (!svg || !path) {
        return;
    }

    function updateCircle() {
        const parentWidth = svg.parentElement ? svg.parentElement.clientWidth : 260;
        const size = Math.min(Math.max(parentWidth * 0.85, 220), 320);
        const radius = (size / 2) - 18;
        const center = size / 2;

        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        path.setAttribute('d', `M${center},${center} m-${radius},0 a${radius},${radius} 0 1,1 ${radius * 2},0 a${radius},${radius} 0 1,1 -${radius * 2},0`);
    }

    window.addEventListener('resize', updateCircle);
    updateCircle();
})();
