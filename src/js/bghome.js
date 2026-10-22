/* WebGL fluid background animation. */
function fluidSimulation(canvas) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  let config = {
    SIM_RESOLUTION: 200,
    DYE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 0.958,
    VELOCITY_DISSIPATION: 0.96,
    PRESSURE_DISSIPATION: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 42,
    SPLAT_RADIUS: 0.22,
    SHADING: true,
    COLORFUL: true,
    PAUSED: false,
    BACK_COLOR: { r: 5, g: 11, b: 22 },
  };

  function pointerPrototype() {
    this.id = -1;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
  }
  let pointers = [new pointerPrototype()];

  const { gl, ext } = getWebGLContext(canvas);
  if (!gl) return function () {};
  if (/Mobi|Android/i.test(navigator.userAgent)) config.SHADING = false;
  if (!ext.supportLinearFiltering) config.SHADING = false;

  function getWebGLContext(canvas) {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };
    let gl = canvas.getContext("webgl2", params);
    const isWebGL2 = !!gl;
    if (!isWebGL2)
      gl =
        canvas.getContext("webgl", params) ||
        canvas.getContext("experimental-webgl", params);
    if (!gl) return {};
    let halfFloat, supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
    } else {
      halfFloat = gl.getExtension("OES_texture_half_float");
      supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
    }
    gl.clearColor(0, 0, 0, 1);
    const type = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    let rgba, rg, r;
    if (isWebGL2) {
      rgba = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      rg = getSupportedFormat(gl, gl.RG16F, gl.RG, type);
      r = getSupportedFormat(gl, gl.R16F, gl.RED, type);
    } else {
      rgba = rg = r = getSupportedFormat(gl, gl.RGBA, gl.RGBA, type);
    }
    return {
      gl,
      ext: {
        formatRGBA: rgba,
        formatRG: rg,
        formatR: r,
        halfFloatTexType: type,
        supportLinearFiltering,
      },
    };
  }
  function getSupportedFormat(gl, internalFormat, format, type) {
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case gl.R16F:
          return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        case gl.RG16F:
          return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
        default:
          return null;
      }
    }
    return { internalFormat, format };
  }
  function supportRenderTextureFormat(gl, internalFormat, format, type) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      4,
      4,
      0,
      format,
      type,
      null,
    );
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      t,
      0,
    );
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
  }

  class GLProgram {
    constructor(vs, fs) {
      this.uniforms = {};
      this.program = gl.createProgram();
      gl.attachShader(this.program, vs);
      gl.attachShader(this.program, fs);
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        throw gl.getProgramInfoLog(this.program);
      const n = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(this.program, i).name;
        this.uniforms[name] = gl.getUniformLocation(this.program, name);
      }
    }
    bind() {
      gl.useProgram(this.program);
    }
  }
  function compileShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw gl.getShaderInfoLog(s);
    return s;
  }
  const F = (src) => compileShader(gl.FRAGMENT_SHADER, src);

  const baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`,
  );
  const clearShader = F(`
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv; uniform sampler2D uTexture; uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`);
  const colorShader = F(`
    precision mediump float; uniform vec4 color;
    void main () { gl_FragColor = color; }`);
  const displayShader = F(`
    precision highp float; precision highp sampler2D;
    varying vec2 vUv; uniform sampler2D uTexture;
    void main () {
      vec3 C = texture2D(uTexture, vUv).rgb;
      float a = max(C.r, max(C.g, C.b));
      gl_FragColor = vec4(C, a);
    }`);
  const displayShadingShader = F(`
    precision highp float; precision highp sampler2D;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uTexture; uniform vec2 texelSize;
    void main () {
      vec3 L = texture2D(uTexture, vL).rgb;
      vec3 R = texture2D(uTexture, vR).rgb;
      vec3 T = texture2D(uTexture, vT).rgb;
      vec3 B = texture2D(uTexture, vB).rgb;
      vec3 C = texture2D(uTexture, vUv).rgb;
      float dx = length(R) - length(L);
      float dy = length(T) - length(B);
      vec3 n = normalize(vec3(dx, dy, length(texelSize)));
      vec3 l = vec3(0.0, 0.0, 1.0);
      float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
      C.rgb *= diffuse;
      float a = max(C.r, max(C.g, C.b));
      gl_FragColor = vec4(C, a);
    }`);
  const splatShader = F(`
    precision highp float; precision highp sampler2D;
    varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;
    uniform vec3 color; uniform vec2 point; uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }`);
  const advectionShader = F(`
    precision highp float; precision highp sampler2D;
    varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;
    uniform vec2 texelSize; uniform float dt; uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      gl_FragColor = dissipation * texture2D(uSource, coord);
      gl_FragColor.a = 1.0;
    }`);
  const divergenceShader = F(`
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }`);
  const curlShader = F(`
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }`);
  const vorticityShader = F(`
    precision highp float; precision highp sampler2D;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy;
      gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }`);
  const pressureShader = F(`
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
    }`);
  const gradientSubtractShader = F(`
    precision mediump float; precision mediump sampler2D;
    varying highp vec2 vUv, vL, vR, vT, vB; uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }`);

  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW,
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    return (d) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, d);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  let simWidth,
    simHeight,
    dyeWidth,
    dyeHeight,
    density,
    velocity,
    divergence,
    curl,
    pressure;

  const P = (fs) => new GLProgram(baseVertexShader, fs);
  const clearProgram = P(clearShader),
    colorProgram = P(colorShader);
  const displayProgram = P(displayShader),
    displayShadingProgram = P(displayShadingShader);
  const splatProgram = P(splatShader),
    advectionProgram = P(advectionShader);
  const divergenceProgram = P(divergenceShader),
    curlProgram = P(curlShader);
  const vorticityProgram = P(vorticityShader),
    pressureProgram = P(pressureShader);
  const gradienSubtractProgram = P(gradientSubtractShader);

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION),
      dyeRes = getResolution(config.DYE_RESOLUTION);
    simWidth = simRes.width;
    simHeight = simRes.height;
    dyeWidth = dyeRes.width;
    dyeHeight = dyeRes.height;
    const t = ext.halfFloatTexType,
      rgba = ext.formatRGBA,
      rg = ext.formatRG,
      r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    density =
      density == null
        ? createDoubleFBO(
            dyeWidth,
            dyeHeight,
            rgba.internalFormat,
            rgba.format,
            t,
            filtering,
          )
        : resizeDoubleFBO(
            density,
            dyeWidth,
            dyeHeight,
            rgba.internalFormat,
            rgba.format,
            t,
            filtering,
          );
    velocity =
      velocity == null
        ? createDoubleFBO(
            simWidth,
            simHeight,
            rg.internalFormat,
            rg.format,
            t,
            filtering,
          )
        : resizeDoubleFBO(
            velocity,
            simWidth,
            simHeight,
            rg.internalFormat,
            rg.format,
            t,
            filtering,
          );
    divergence = createFBO(
      simWidth,
      simHeight,
      r.internalFormat,
      r.format,
      t,
      gl.NEAREST,
    );
    curl = createFBO(
      simWidth,
      simHeight,
      r.internalFormat,
      r.format,
      t,
      gl.NEAREST,
    );
    pressure = createDoubleFBO(
      simWidth,
      simHeight,
      r.internalFormat,
      r.format,
      t,
      gl.NEAREST,
    );
  }
  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      w,
      h,
      0,
      format,
      type,
      null,
    );
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }
  function createDoubleFBO(w, h, i, f, t, p) {
    let a = createFBO(w, h, i, f, t, p),
      b = createFBO(w, h, i, f, t, p);
    return {
      get read() {
        return a;
      },
      set read(v) {
        a = v;
      },
      get write() {
        return b;
      },
      set write(v) {
        b = v;
      },
      swap() {
        const x = a;
        a = b;
        b = x;
      },
    };
  }
  function resizeFBO(target, w, h, i, f, t, p) {
    const n = createFBO(w, h, i, f, t, p);
    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, target.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, 1);
    blit(n.fbo);
    return n;
  }
  function resizeDoubleFBO(target, w, h, i, f, t, p) {
    target.read = resizeFBO(target.read, w, h, i, f, t, p);
    target.write = createFBO(w, h, i, f, t, p);
    return target;
  }

  initFramebuffers();
  let lastColorChangeTime = Date.now();
  let rafHandle = 0,
    destroyed = false;

  update();

  function update() {
    if (destroyed) return;
    resizeCanvas();
    input();
    if (!config.PAUSED) step(0.016);
    render(null);
    rafHandle = requestAnimationFrame(update);
  }

  function input() {
    for (let i = 0; i < pointers.length; i++) {
      const p = pointers[i];
      if (p.moved) {
        splat(p.x, p.y, p.dx, p.dy, p.color);
        p.moved = false;
      }
    }
    if (!config.COLORFUL) return;
    if (lastColorChangeTime + 100 < Date.now()) {
      lastColorChangeTime = Date.now();
      for (let i = 0; i < pointers.length; i++)
        pointers[i].color = generateColor();
    }
  }

  function step(dt) {
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, simWidth, simHeight);
    const ts = [1.0 / simWidth, 1.0 / simHeight];

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, ts[0], ts[1]);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl.fbo);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, ts[0], ts[1]);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write.fbo);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, ts[0], ts[1]);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence.fbo);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE_DISSIPATION);
    blit(pressure.write.fbo);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, ts[0], ts[1]);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write.fbo);
      pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, ts[0], ts[1]);
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uPressure,
      pressure.read.attach(0),
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uVelocity,
      velocity.read.attach(1),
    );
    blit(velocity.write.fbo);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, ts[0], ts[1]);
    const vId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, vId);
    gl.uniform1i(advectionProgram.uniforms.uSource, vId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      config.VELOCITY_DISSIPATION,
    );
    blit(velocity.write.fbo);
    velocity.swap();

    gl.viewport(0, 0, dyeWidth, dyeHeight);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1));
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      config.DENSITY_DISSIPATION,
    );
    blit(density.write.fbo);
    density.swap();
  }

  function render(target) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    const width = gl.drawingBufferWidth,
      height = gl.drawingBufferHeight;
    gl.viewport(0, 0, width, height);

    colorProgram.bind();
    const bc = config.BACK_COLOR;
    gl.uniform4f(
      colorProgram.uniforms.color,
      bc.r / 255,
      bc.g / 255,
      bc.b / 255,
      1,
    );
    blit(target);

    const program = config.SHADING ? displayShadingProgram : displayProgram;
    program.bind();
    if (config.SHADING)
      gl.uniform2f(program.uniforms.texelSize, 1.0 / width, 1.0 / height);
    gl.uniform1i(program.uniforms.uTexture, density.read.attach(0));
    blit(target);
  }

  function splat(x, y, dx, dy, color) {
    gl.viewport(0, 0, simWidth, simHeight);
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(
      splatProgram.uniforms.aspectRatio,
      canvas.width / canvas.height,
    );
    gl.uniform2f(
      splatProgram.uniforms.point,
      x / canvas.width,
      1.0 - y / canvas.height,
    );
    gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1.0);
    gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS / 100.0);
    blit(velocity.write.fbo);
    velocity.swap();

    gl.viewport(0, 0, dyeWidth, dyeHeight);
    gl.uniform1i(splatProgram.uniforms.uTarget, density.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(density.write.fbo);
    density.swap();
  }

  function resizeCanvas() {
    if (
      canvas.width != canvas.clientWidth ||
      canvas.height != canvas.clientHeight
    ) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      initFramebuffers();
    }
  }

  // Pointer data comes from window events (canvas sits behind content); passive, never preventDefault.
  function pointerPos(cx, cy) {
    const rect = canvas.getBoundingClientRect();
    return { x: cx - rect.left, y: cy - rect.top };
  }
  const teardown = [];
  function on(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    teardown.push(() => target.removeEventListener(type, handler, opts));
  }

  on(window, "mousemove", (e) => {
    const { x, y } = pointerPos(e.clientX, e.clientY);
    const p = pointers[0];
    if (!p.everMoved) {
      p.everMoved = true;
      p.x = x;
      p.y = y;
      p.down = true;
      return;
    }
    p.down = true;
    p.moved = true;
    p.dx = (x - p.x) * 5.0;
    p.dy = (y - p.y) * 5.0;
    p.x = x;
    p.y = y;
    p.color = generateColor();
  });
  on(
    window,
    "touchmove",
    (e) => {
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        if (i >= pointers.length) pointers.push(new pointerPrototype());
        const p = pointers[i];
        const { x, y } = pointerPos(touches[i].clientX, touches[i].clientY);
        p.down = true;
        p.moved = p.everMoved === true;
        p.everMoved = true;
        p.dx = (x - p.x) * 8.0;
        p.dy = (y - p.y) * 8.0;
        p.x = x;
        p.y = y;
      }
    },
    { passive: true },
  );
  on(
    window,
    "touchstart",
    (e) => {
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        if (i >= pointers.length) pointers.push(new pointerPrototype());
        const p = pointers[i];
        const { x, y } = pointerPos(touches[i].clientX, touches[i].clientY);
        p.id = touches[i].identifier;
        p.down = true;
        p.x = x;
        p.y = y;
        p.color = generateColor();
      }
    },
    { passive: true },
  );
  on(window, "mouseup", () => {
    pointers[0].down = false;
  });
  on(window, "touchend", (e) => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++)
      for (let j = 0; j < pointers.length; j++)
        if (touches[i].identifier == pointers[j].id) pointers[j].down = false;
  });

  return function destroy() {
    destroyed = true;
    if (rafHandle) cancelAnimationFrame(rafHandle);
    for (const off of teardown) off();
  };

  function generateColor() {
    // Electric cyan→blue→violet→magenta band, full brightness
    const h = 0.5 + Math.random() * 0.42;
    const c = HSVtoRGB(h, 0.95, 1.0);
    c.r *= 0.92;
    c.g *= 0.92;
    c.b *= 0.92;
    return c;
  }
  function HSVtoRGB(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6),
      f = h * 6 - i;
    const p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        ((r = v), (g = t), (b = p));
        break;
      case 1:
        ((r = q), (g = v), (b = p));
        break;
      case 2:
        ((r = p), (g = v), (b = t));
        break;
      case 3:
        ((r = p), (g = q), (b = v));
        break;
      case 4:
        ((r = t), (g = p), (b = v));
        break;
      case 5:
        ((r = v), (g = p), (b = q));
        break;
    }
    return { r, g, b };
  }
  function getResolution(resolution) {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (ar < 1) ar = 1.0 / ar;
    const max = Math.round(resolution * ar),
      min = Math.round(resolution);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }
}

