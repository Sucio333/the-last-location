// ============================================================
//  CONFIGURACIÓN CENTRAL — The Last Location
// ============================================================
const CFG = {
    scUser:        'sucio333',
    scPlaylistUrl: 'https://soundcloud.com/sucio333/sets/333a1',
    soundcloudColor: '#05FF04',
    twitchChannel: 'thelastlocationcl',
    nextShow:      '',
    morphTexts:    ['THE LAST', 'LOCATION', 'THE LAST LOCATION'],
    shader: { hue: 98, speed: 6.4, noise: 0.2, warp: 0.1, zoom: 1.5, brightness: 0.9 },
};

// Carga config guardada en localStorage
try {
    const saved = JSON.parse(localStorage.getItem('tll_cfg') || '{}');
    Object.assign(CFG, saved);
} catch(e) {}
