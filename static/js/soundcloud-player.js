// ============================================================
//  REPRODUCTOR SOUND CLOUD — The Last Location
// ============================================================

(function () {
    const playerShell = document.querySelector('[data-soundcloud-player]');
    if (!playerShell) {
        return;
    }

    const iframe = document.getElementById('soundcloud-iframe');
    const toggleButton = document.getElementById('sc-toggle');
    const backButton = document.getElementById('sc-back');
    const forwardButton = document.getElementById('sc-forward');
    const prevButton = document.getElementById('sc-prev');
    const nextButton = document.getElementById('sc-next');
    const playlistLabel = document.getElementById('sc-playlist-label');
    const titleElement = document.getElementById('sc-title');
    const statusElement = document.getElementById('sc-status');
    const currentTimeElement = document.getElementById('sc-current-time');
    const durationElement = document.getElementById('sc-duration');
    const progressFill = document.getElementById('sc-progress-fill');
    const volumeSlider = document.getElementById('sc-volume');
    const muteButton = document.getElementById('sc-mute');
    const volumeValue = document.getElementById('sc-volume-value');

    let widget = null;
    let isPlaying = false;
    let isReady = false;
    let currentTrackTitle = null;
    let currentTrackDuration = 0;
    let currentVolume = 100;
    let lastVolume = 100;
    let isMuted = false;

    function formatTime(milliseconds) {
        if (!Number.isFinite(milliseconds) || milliseconds < 0) {
            return '00:00.000';
        }

        const totalSeconds = Math.floor(milliseconds / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const millis = Math.floor(milliseconds % 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }

    function updateStatus(message) {
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    function updateTrackTitle(title) {
        if (!titleElement) {
            return;
        }

        const normalizedTitle = String(title || 'Pista sin título');
        if (normalizedTitle === currentTrackTitle) {
            return;
        }

        currentTrackTitle = normalizedTitle;
        applyMatrixEffect(titleElement, normalizedTitle, { duration: 420 });
    }

    function updateProgress(position, duration) {
        if (currentTimeElement) {
            currentTimeElement.textContent = formatTime(position);
        }

        if (durationElement) {
            durationElement.textContent = formatTime(duration);
        }

        if (progressFill) {
            const ratio = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;
            progressFill.style.width = `${ratio}%`;
        }
    }

    function updateDuration(duration) {
        currentTrackDuration = duration;
        if (durationElement) {
            durationElement.textContent = formatTime(duration);
        }
    }

    function updateLoadProgress(loadedProgress) {
        if (!progressFill) {
            return;
        }

        const ratio = Math.min(Math.max(loadedProgress * 100, 0), 100);
        progressFill.style.width = `${ratio}%`;
    }

    function updateVolumeControls(volume) {
        currentVolume = Math.min(100, Math.max(0, Math.round(volume)));
        if (volumeSlider) {
            volumeSlider.value = currentVolume;
        }

        if (volumeValue) {
            volumeValue.textContent = String(currentVolume);
        }

        if (muteButton) {
            muteButton.textContent = currentVolume === 0 ? '🔇' : '🔊';
            muteButton.setAttribute('aria-label', currentVolume === 0 ? 'Activar sonido' : 'Silenciar');
        }
    }

    function setWidgetVolume(volume) {
        if (!widget || !isReady) {
            return;
        }

        const normalized = Math.min(100, Math.max(0, Math.round(volume)));
        widget.setVolume(normalized);
        updateVolumeControls(normalized);
    }

    function setControlsEnabled(enabled) {
        if (toggleButton) {
            toggleButton.disabled = !enabled;
        }
        if (backButton) {
            backButton.disabled = !enabled;
        }
        if (forwardButton) {
            forwardButton.disabled = !enabled;
        }
        if (prevButton) {
            prevButton.disabled = !enabled;
        }
        if (nextButton) {
            nextButton.disabled = !enabled;
        }
    }

    function seekBy(deltaMs) {
        if (!widget || !isReady) {
            updateStatus('Esperando widget');
            return;
        }

        widget.getPosition(function (position) {
            const target = Math.max(0, position + deltaMs);
            widget.seekTo(target);
        });
    }

    function bindWidgetEvents() {
        if (!widget) {
            return;
        }

        widget.bind(SC.Widget.Events.READY, function () {
            isReady = true;
            setControlsEnabled(true);
            applyMatrixEffect(statusElement, 'Listo para reproducir', { duration: 360 });

            widget.getCurrentSound(function (sound) {
                if (sound) {
                    updateTrackTitle(sound.title);
                }
            });

            widget.getDuration(function (duration) {
                updateDuration(duration);
                updateProgress(0, duration);
            });

            setWidgetVolume(currentVolume);
        });

        widget.bind(SC.Widget.Events.PLAY, function () {
            isPlaying = true;
            if (toggleButton) {
                toggleButton.textContent = '❚❚';
            }
            applyMatrixEffect(statusElement, 'Reproduciendo', { duration: 360 });

            widget.getCurrentSound(function (sound) {
                if (sound) {
                    updateTrackTitle(sound.title);
                }
            });

            widget.getDuration(function (duration) {
                updateDuration(duration);
            });
        });

        widget.bind(SC.Widget.Events.PAUSE, function () {
            isPlaying = false;
            if (toggleButton) {
                toggleButton.textContent = '▶';
            }
            applyMatrixEffect(statusElement, 'Pausado', { duration: 360 });
        });

        widget.bind(SC.Widget.Events.FINISH, function () {
            isPlaying = false;
            if (toggleButton) {
                toggleButton.textContent = '▶';
            }
            updateStatus('Finalizado');
            updateProgress(0, 0);
        });

        widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (event) {
            const duration = Number.isFinite(event.duration) && event.duration > 0
                ? event.duration
                : currentTrackDuration;
            updateProgress(event.currentPosition, duration);
        });

        widget.bind(SC.Widget.Events.LOAD_PROGRESS, function (event) {
            updateLoadProgress(event.loadedProgress);
        });

        widget.bind(SC.Widget.Events.ERROR, function () {
            updateStatus('No se pudo cargar');
        });
    }

    function attachWidget() {
        if (!iframe || !window.SC || !window.SC.Widget) {
            return;
        }

        widget = window.SC.Widget(iframe);
        bindWidgetEvents();

        if (playlistLabel) {
            applyMatrixEffect(playlistLabel, playlistLabel.textContent.trim(), { duration: 420 });
        }
    }

    toggleButton?.addEventListener('click', function () {
        if (!isReady || !widget) {
            updateStatus('Esperando widget');
            return;
        }

        if (isPlaying) {
            widget.pause();
        } else {
            widget.play();
        }
    });

    volumeSlider?.addEventListener('input', function (event) {
        if (!event.target) {
            return;
        }

        const value = Number(event.target.value);
        if (!Number.isFinite(value)) {
            return;
        }

        if (value === 0) {
            isMuted = true;
            lastVolume = currentVolume;
        } else {
            isMuted = false;
            lastVolume = value;
        }

        setWidgetVolume(value);
    });

    muteButton?.addEventListener('click', function () {
        if (!isReady || !widget) {
            updateStatus('Esperando widget');
            return;
        }

        if (isMuted || currentVolume === 0) {
            const restored = lastVolume > 0 ? lastVolume : 100;
            isMuted = false;
            setWidgetVolume(restored);
        } else {
            lastVolume = currentVolume;
            isMuted = true;
            setWidgetVolume(0);
        }
    });

    backButton?.addEventListener('click', function () {
        seekBy(-15000);
    });

    forwardButton?.addEventListener('click', function () {
        seekBy(15000);
    });

    prevButton?.addEventListener('click', function () {
        if (!widget || !isReady) {
            updateStatus('Esperando widget');
            return;
        }

        widget.prev(function () {
            updateStatus('Pista anterior');
        });
    });

    nextButton?.addEventListener('click', function () {
        if (!widget || !isReady) {
            updateStatus('Esperando widget');
            return;
        }

        widget.next(function () {
            updateStatus('Siguiente pista');
        });
    });

    setControlsEnabled(false);

    if (window.SC && window.SC.Widget) {
        attachWidget();
    } else {
        window.addEventListener('load', attachWidget);
    }
})();
