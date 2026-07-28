// ============================================================
//  WEBGL — LIQUID CRYSTAL SHADER
//  Depende de: config.js (CFG.shader)
// ============================================================
(function initShader() {
    const lcCanvas = document.getElementById('liquid-canvas');
    const gl = lcCanvas.getContext('webgl') || lcCanvas.getContext('experimental-webgl');

    if (!gl) {
        console.warn('WebGL no disponible');
        return;
    }

    // Detección de dispositivo touch y capacidad de hardware
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isTouchDevice ? 1.0 : 1.75);

    // Detección opcional de gama baja (pocos núcleos CPU = móvil de entrada)
    // Reduce renderScale aún más si tiene <= 2 núcleos (ej. Android gama baja)
    const hardwareCores = navigator.hardwareConcurrency || 4;
    const isLowEndDevice = isTouchDevice && hardwareCores <= 2;

    // renderScale: 0.45 en mobile normal, 0.3 en móvil de gama baja
    const renderScale = isLowEndDevice ? 0.3 : (isTouchDevice ? 0.45 : 1);

    const VS = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;

    const FS = `
    precision highp float;
    uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse;
    uniform float u_hue,u_speed,u_noise,u_warp,u_zoom,u_brightness;
    uniform int u_isMobile;
    vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.0+2.0*fract(sin(p)*43758.5453);}
    float gnoise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(dot(hash2(i),f),dot(hash2(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(hash2(i+vec2(0,1)),f-vec2(0,1)),dot(hash2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);}
    float fbm(vec2 p){float v=0.0,a=0.5;int max_iter=u_isMobile==1?2:6;for(int i=0;i<6;i++){if(i>=max_iter)break;v+=a*gnoise(p);p*=2.0;a*=0.5;}return v;}
    vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);}
    void main(){
      vec2 uv=(2.0*gl_FragCoord.xy-u_res)/min(u_res.x,u_res.y)*u_zoom;
      vec2 m=(2.0*u_mouse-u_res)/min(u_res.x,u_res.y)*u_zoom;
      float md=length(uv-m),mw=exp(-md*2.2)*0.38,t=u_time*u_speed*0.25,ns=1.2+u_noise*2.5,wp=u_warp*1.8;
      vec2 q=vec2(fbm(uv*ns+t),fbm(uv*ns+vec2(5.2,1.3)+t));
      vec2 r=vec2(fbm(uv*ns+wp*q+vec2(1.7,9.2)+0.15*t),fbm(uv*ns+wp*q+vec2(8.3,2.8)+0.13*t));
      r.x+=mw*gnoise(uv*4.0+t); r.y+=mw*gnoise(uv*4.0-t);
      float f=fbm(uv*ns+wp*r+t*0.4),level=f*0.5+0.5,blob=smoothstep(0.42,0.58,level+mw*0.12);
      vec3 col=hsv2rgb(vec3(u_hue/360.0,1.0,blob*u_brightness));
      gl_FragColor=vec4(col,1.0);
    }`;

    function mkShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const U = {
        time:       gl.getUniformLocation(prog, 'u_time'),
        res:        gl.getUniformLocation(prog, 'u_res'),
        mouse:      gl.getUniformLocation(prog, 'u_mouse'),
        hue:        gl.getUniformLocation(prog, 'u_hue'),
        speed:      gl.getUniformLocation(prog, 'u_speed'),
        noise:      gl.getUniformLocation(prog, 'u_noise'),
        warp:       gl.getUniformLocation(prog, 'u_warp'),
        zoom:       gl.getUniformLocation(prog, 'u_zoom'),
        brightness: gl.getUniformLocation(prog, 'u_brightness'),
        isMobile:   gl.getUniformLocation(prog, 'u_isMobile'),
    };

    let mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    function resizeGL() {
        const viewportWidth = Math.max(1, Math.floor(window.innerWidth));
        const viewportHeight = Math.max(1, Math.floor(window.innerHeight));
        const renderWidth = Math.max(1, Math.floor(viewportWidth * renderScale * dpr));
        const renderHeight = Math.max(1, Math.floor(viewportHeight * renderScale * dpr));

        lcCanvas.width = renderWidth;
        lcCanvas.height = renderHeight;
        lcCanvas.style.width = '100vw';
        lcCanvas.style.height = '100vh';
        gl.viewport(0, 0, lcCanvas.width, lcCanvas.height);
    }
    window.addEventListener('resize', resizeGL);
    resizeGL();

    const t0 = performance.now();
    const sp = CFG.shader;

    function renderGL() {
        const t = (performance.now() - t0) * 0.001;
        gl.uniform1f(U.time, t);
        gl.uniform2f(U.res, lcCanvas.width, lcCanvas.height);
        gl.uniform2f(U.mouse, mouse.x, lcCanvas.height - mouse.y);
        gl.uniform1f(U.hue,        sp.hue);
        gl.uniform1f(U.speed,      sp.speed);
        gl.uniform1f(U.noise,      sp.noise);
        gl.uniform1f(U.warp,       sp.warp);
        gl.uniform1f(U.zoom,       sp.zoom);
        gl.uniform1f(U.brightness, sp.brightness);
        gl.uniform1i(U.isMobile,   isTouchDevice ? 1 : 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(renderGL);
    }
    renderGL();
})();
