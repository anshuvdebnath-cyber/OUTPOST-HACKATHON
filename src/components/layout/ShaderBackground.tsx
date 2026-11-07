import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/**
 * Optical Refracted Fluted-Glass WebGL Fragment Shader:
 *  - Faithfully reproduces the reeded-glass reference photo:
 *    * Vertical cylindrical glass ribs with physical Snell's refraction
 *    * Crisp vertical specular pinstripe & groove seam highlights
 *    * Tapered luminous caustic beams channeled vertically through each flute
 *    * Chromatic dispersion & soft multi-sample frosted blur
 *  - Dual-mode:
 *    * Light Mode: Rich periwinkle blue, soft lavender, icy aqua & glowing champagne sunlight beam
 *    * Night Mode: Deep abyssal teal, forest emerald & brilliant mint-jade light beam
 */
const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_dark;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Light Mode scene: Periwinkle blue, lavender, icy aqua & glowing champagne-peach sunlight
  vec3 sampleLightScene(vec2 p, float t) {
    // Flowing diagonal light waves behind the glass
    float w1 = sin(p.x * 2.8 + p.y * 2.2 - t * 0.75 + sin(p.y * 2.4 + t * 0.45) * 0.55);
    float w2 = cos(p.x * 2.2 - p.y * 2.6 + t * 0.62);

    // Warm champagne sunlight beam pouring diagonally from top right
    float sunBeam = exp(-pow((p.x * 0.72 + p.y * 0.78 - 0.92 + sin(p.y * 2.2 - t * 0.65) * 0.22) * 2.2, 2.0));
    float softFill = exp(-pow((p.x * 0.65 - p.y * 0.55 - 0.2 + cos(p.x * 2.0 + t * 0.5) * 0.2) * 2.4, 2.0));

    vec3 periwinkleDeep = vec3(0.32, 0.47, 0.82);
    vec3 lavender       = vec3(0.58, 0.68, 0.90);
    vec3 icyAqua        = vec3(0.70, 0.88, 0.91);
    vec3 champagneWarm  = vec3(1.00, 0.90, 0.78);
    vec3 pureLight      = vec3(0.98, 0.99, 1.00);

    vec3 col = mix(periwinkleDeep, lavender, smoothstep(-0.75, 0.75, w1 * 0.65 + (p.x - 0.35) * 0.7));
    col = mix(col, icyAqua, smoothstep(-0.25, 0.85, (p.x - 0.2) * 1.2 + w2 * 0.4));
    col = mix(col, champagneWarm, clamp(sunBeam * 1.05 + softFill * 0.35, 0.0, 1.0));
    col = mix(col, pureLight, smoothstep(0.65, 0.98, sunBeam) * 0.45);
    return col;
  }

  // Night Mode scene: Deep teal-sapphire, rich forest emerald & brilliant mint-jade beam
  vec3 sampleDarkScene(vec2 p, float t) {
    float w1 = sin(p.x * 2.6 + p.y * 2.0 - t * 0.72 + cos(p.y * 2.2 + t * 0.5) * 0.55);
    float w2 = cos(p.x * 2.4 - p.y * 2.4 + t * 0.6);

    float mintBeam = exp(-pow((p.x * 0.75 + p.y * 0.72 - 0.88 + sin(p.y * 2.4 - t * 0.62) * 0.24) * 2.3, 2.0));
    float tealFill = exp(-pow((p.x * 0.7 - p.y * 0.5 - 0.15 + cos(p.x * 2.2 + t * 0.52) * 0.22) * 2.5, 2.0));

    vec3 deepAbyss      = vec3(0.01, 0.10, 0.17);
    vec3 forestPine     = vec3(0.02, 0.21, 0.15);
    vec3 richEmerald    = vec3(0.04, 0.48, 0.33);
    vec3 vibrantJade    = vec3(0.16, 0.76, 0.51);
    vec3 mintHighlight  = vec3(0.82, 0.98, 0.87);

    vec3 col = mix(deepAbyss, forestPine, smoothstep(-0.7, 0.7, w2 + p.x * 0.45));
    col = mix(col, richEmerald, smoothstep(-0.55, 0.7, w1 * 0.65 + (p.x - 0.25) * 0.7));
    col = mix(col, vibrantJade, clamp(mintBeam * 0.95 + tealFill * 0.4, 0.0, 1.0));
    col = mix(col, mintHighlight, smoothstep(0.6, 0.98, mintBeam) * 0.52);
    return col;
  }

  vec3 sampleBackdrop(vec2 p, float t, float darkMix) {
    return mix(sampleLightScene(p, t), sampleDarkScene(p, t), darkMix);
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 1.15;

    // Number of vertical fluted cylindrical reeds (matching the reference photo density)
    float fluteWidth = clamp(u_resolution.x / 26.0, 32.0, 52.0);
    float strips = floor(u_resolution.x / fluteWidth);
    float stripPos = uv.x * strips;
    // Local coordinate inside each cylindrical flute: -1.0 (left seam) to +1.0 (right seam)
    float x = fract(stripPos) * 2.0 - 1.0;

    // True physical cylindrical glass lens profile & normal vector
    float r = x * 0.94;
    float arc = sqrt(max(0.001, 1.0 - r * r));
    vec3 normal = normalize(vec3(r * 1.35, 0.0, arc));

    // Snell's-law refraction through crown glass (IOR = 1.52)
    vec3 incident = vec3(0.0, 0.0, -1.0);
    vec3 refr = refract(incident, normal, 1.0 / 1.52);

    // Refracted UV displacement: horizontal lens magnification & slight vertical tilt
    vec2 refractShift = vec2(refr.x * 0.082, refr.x * 0.024);

    // Multi-tap frosted sampling with RGB chromatic dispersion inside the glass flute
    vec2 dispersion = vec2(refr.x * 0.0055, 0.0);
    float jitter = (hash(gl_FragCoord.xy) - 0.5) * 0.003;

    vec3 accum = vec3(0.0);
    const int TAPS = 5;
    for (int i = -2; i <= 2; i++) {
      float fi = float(i) * 0.005 + jitter;
      vec2 sampleUv = uv + refractShift + vec2(fi * 0.35, fi * 1.1);

      float cr = sampleBackdrop(sampleUv + dispersion, t, u_dark).r;
      float cg = sampleBackdrop(sampleUv, t, u_dark).g;
      float cb = sampleBackdrop(sampleUv - dispersion, t, u_dark).b;
      accum += vec3(cr, cg, cb);
    }
    vec3 refractedColor = accum / float(TAPS);

    // Optical Caustic channeling: the cylindrical lens concentrates passing light waves into vertical bars
    float waveLuma = dot(refractedColor, vec3(0.299, 0.587, 0.114));
    float lensCore = exp(-pow(x * 1.7, 2.0));
    float causticBar = lensCore * smoothstep(0.35, 0.95, waveLuma) * 0.38;

    // Distinct vertical specular pinstripe along the bevel curve (exact look of reference image)
    float pinstripe = exp(-pow((x - 0.28) * 11.0, 2.0));
    float pinstripeSecondary = exp(-pow((x + 0.35) * 16.0, 2.0)) * 0.35;
    float specHighlight = (pinstripe + pinstripeSecondary) * (0.35 + 0.65 * waveLuma);

    // Seam groove shading and edge rim light between adjacent glass flutes
    float seamEdge = smoothstep(0.0, 0.14, 1.0 - abs(x));
    float grooveShadow = mix(0.85, 1.0, seamEdge);
    float grooveGlint = exp(-pow((abs(x) - 0.94) * 22.0, 2.0)) * 0.28;

    // Transmittance depth across the glass flute (slightly richer at the sides, luminous in center)
    float lensProfile = mix(0.92, 1.04, arc);

    vec3 specColor = mix(vec3(1.0, 0.98, 0.94), vec3(0.84, 0.99, 0.91), u_dark);
    vec3 finalColor = refractedColor * lensProfile * grooveShadow
                    + refractedColor * causticBar
                    + specColor * (specHighlight * 0.42 + grooveGlint);

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Full-viewport non-interactive WebGL refracted fluted-glass background.
 * Smoothly cross-dissolves between Light Mode and Night Mode shaders.
 */
export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const darkTargetRef = useRef(theme === 'dark' ? 1 : 0);

  useEffect(() => {
    darkTargetRef.current = theme === 'dark' ? 1 : 0;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' }) ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uDark = gl.getUniformLocation(program, 'u_dark');

    let currentDark = darkTargetRef.current;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      gl?.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    window.addEventListener('resize', resize, { passive: true });

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      const elapsed = (now - start) * 0.001;

      const blendRate = 1 - Math.exp(-dt * 4.5);
      currentDark += (darkTargetRef.current - currentDark) * blendRate;

      gl?.uniform1f(uTime, elapsed);
      gl?.uniform2f(uRes, canvas.width, canvas.height);
      gl?.uniform1f(uDark, currentDark);
      gl?.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-700"
      style={{
        background:
          theme === 'dark'
            ? 'linear-gradient(135deg, #04202c 0%, #074e3a 55%, #0e6b4c 100%)'
            : 'linear-gradient(135deg, #7492d2 0%, #bfe2e5 55%, #fae6cf 100%)',
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
