// ============================================================
//  EFECTO MATRIX TEXT — The Last Location
// ============================================================

const MatrixText = (function () {
    const activeAnimations = new WeakMap();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@!?';
    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    function randomChar() {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function cancelExisting(element) {
        const current = activeAnimations.get(element);
        if (current) {
            activeAnimations.delete(element);
            if (current.rafId != null) {
                cancelAnimationFrame(current.rafId);
            }
            if (current.timerId != null) {
                clearInterval(current.timerId);
            }
        }
    }

    function applyMatrixEffect(element, finalText, options = {}) {
        if (!element) {
            return;
        }

        const duration = Math.max(200, Math.min(600, options.duration ?? 450));
        const startTime = performance.now();
        const text = String(finalText ?? '');
        const length = text.length;
        const baseDelay = Math.max(0, (duration * 0.1));
        const perCharDelay = (duration - baseDelay) / Math.max(1, length);

        cancelExisting(element);

        const animation = {
            rafId: null,
            timerId: null,
            finished: false,
            lastFrameTime: startTime,
        };

        // En mobile, usa un intervalo más largo (60ms) para evitar saturar el hilo principal
        // cuando hay muchas animaciones simultáneas (shader + gooey + matrix text).
        const frameInterval = isMobile ? 60 : 30;

        function renderFrame(now) {
            const elapsed = now - startTime;
            let output = '';
            let doneCount = 0;

            for (let index = 0; index < length; index += 1) {
                const letterDelay = baseDelay + index * perCharDelay;
                if (elapsed >= letterDelay) {
                    output += text[index];
                    doneCount += 1;
                } else {
                    output += randomChar();
                }
            }

            element.textContent = output;

            if (doneCount >= length) {
                cancelExisting(element);
                animation.finished = true;
            } else {
                // Usa RAF pero limita updates a cada frameInterval ms
                if (now - animation.lastFrameTime >= frameInterval) {
                    animation.lastFrameTime = now;
                    animation.rafId = requestAnimationFrame(renderFrame);
                } else {
                    animation.rafId = requestAnimationFrame(renderFrame);
                }
            }
        }

        activeAnimations.set(element, animation);
        renderFrame(startTime);
    }

    return {
        applyMatrixEffect,
        cancelExisting,
    };
})();

// Exponer función global simple para uso en otros scripts.
function applyMatrixEffect(element, finalText, options) {
    return MatrixText.applyMatrixEffect(element, finalText, options);
}
