// ============================================================
//  GOOEY TEXT MORPHING
//  Depende de: config.js (CFG.morphTexts)
// ============================================================
(function initGooey() {
    const wrapper = document.getElementById('gooey-wrapper');
    if (!wrapper) return;

    let curIdx = 0, nextIdx = 1, morphing = false;
    let morphInterval = null;

    // Reutiliza elementos existentes o los crea.
    const existingEls = Array.from(wrapper.querySelectorAll('.gooey-text'));
    const els = existingEls.length === CFG.morphTexts.length
        ? existingEls.map((el, i) => {
            el.style.opacity = i === 0 ? '1' : '0';
            return el;
          })
        : CFG.morphTexts.map((txt, i) => {
            const el = document.createElement('div');
            el.className   = 'gooey-text';
            el.textContent = txt;
            el.style.opacity = i === 0 ? '1' : '0';
            wrapper.appendChild(el);
            return el;
          });

    function morph() {
        if (morphing) return;
        morphing = true;
        const from  = els[curIdx];
        const to    = els[nextIdx];
        const start = performance.now();
        const dur   = 1100;

        function step(now) {
            const p    = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            from.style.opacity = String(1 - ease);
            to.style.opacity   = String(ease);
            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                curIdx   = nextIdx;
                nextIdx  = (nextIdx + 1) % els.length;
                morphing = false;
            }
        }
        requestAnimationFrame(step);
    }

    function startMorphLoop() {
        if (morphInterval) {
            clearInterval(morphInterval);
        }
        morph();
        morphInterval = setInterval(morph, 3000);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden && morphInterval) {
            clearInterval(morphInterval);
            morphInterval = null;
            return;
        }

        if (!morphInterval) {
            startMorphLoop();
        }
    });

    startMorphLoop();
})();
