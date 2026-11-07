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
 * Dual-Mode Optical Fluted-Glass WebGL Fragment Shader:
 *  - The vertical glass reeds are nearly invisible on their own; they manifest
 *    through cylindrical Snell refraction, subtle RGB lens dispersion, and
 *    wave-coupled specular highlights (glossiness = 0.8) as the colour waves
 *    glide behind them.
 *  - Wave speed increased slightly (u_time * 1.38) for fluid organic motion.
 */
const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_dark;

  // Light Mode: Periwinkle blue + icy seafoam-aqua + warm champagne sunlight waves
  vec3 sampleLightWave(vec2 uv, float t) {
    float w1 = sin(uv.x * 2.7 - uv.y * 2.2 + t * 0.58);
    float w2 = cos(uv.x * 2.0 + uv.y * 2.9 - t * 0.48);
    float w3 = sin((uv.x * 1.6 + uv.y * 1.9) * 2.3 - t * 0.62);

    vec3 deepPeriwinkle = vec3(0.38, 0.53, 0.84);
    vec3 softPeriwinkle = vec3(0.67, 0.75, 0.93);
    vec3 icyAqua        = vec3(0.74, 0.90, 0.92);
    vec3 warmChampagne  = vec3(0.99, 0.89, 0.77);
    vec3 pearlLight     = vec3(0.96, 0.98, 1.00);

    vec3 col = mix(deepPeriwinkle, icyAqua, smoothstep(-0.75, 0.75, w1 * 0.65 + (uv.x - 0.48) * 0.85));
    col = mix(col, softPeriwinkle, smoothstep(0.05, 0.92, (1.0 - uv.y) * 0.75 + w2 * 0.3));
    float sunCrest = smoothstep(0.12, 0.86, w3 * 0.52 + uv.x * 0.42 + uv.y * 0.36);
    col = mix(col, warmChampagne, sunCrest * 0.82);
    col = mix(col, pearlLight, smoothstep(0.5, 0.98, w2 * 0.5 + 0.5) * 0.32);
    return col;
  }

  // Night Mode: Deep abyssal teal + rich forest emerald + luminous mint-jade waves
  vec3 sampleDarkWave(vec2 uv, float t) {
    float w1 = sin(uv.x * 2.5 + uv.y * 1.9 - t * 0.55);
    float w2 = cos(uv.x * 3.0 - uv.y * 2.2 + t * 0.46);
    float crest = sin((uv.x * 2.1 - uv.y * 1.4) * 2.1 + t * 0.60);

    vec3 abyssTeal     = vec3(0.01, 0.13, 0.21);
    vec3 deepPine      = vec3(0.02, 0.23, 0.17);
    vec3 richEmerald   = vec3(0.04, 0.49, 0.34);
    vec3 vibrantJade   = vec3(0.15, 0.74, 0.51);
    vec3 champagneMint = vec3(0.80, 0.97, 0.86);

    vec3 col = mix(abyssTeal, deepPine, smoothstep(-0.1, 0.7, uv.x + w1 * 0.28));
    col = mix(col, richEmerald, smoothstep(-0.55, 0.65, w1 * 0.58 + w2 * 0.45));
    col = mix(col, vibrantJade, smoothstep(0.12, 0.88, crest * 0.5 + 0.5) * 0.78);
    col = mix(col, champagneMint, pow(clamp(crest * 0.5 + 0.5, 0.0, 1.0), 3.6) * 0.52);
    return col;
  }

  vec3 sampleScene(vec2 uv, float t, float darkMix) {
    return mix(sampleLightWave(uv, t), sampleDarkWave(uv, t), darkMix);
  }

  void main() {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 uv = v_uv;
    // Slightly faster wave speed for more fluid motion
    float t = u_time * 1.38;

    // Optical cylindrical fluted glass geometry
    float fluteCount = floor(clamp(u_resolution.x / 24.0, 28.0, 74.0));
    float flutePhase = uv.x * fluteCount * 6.2831853;

    // Subtle organic wave undulation along the lens axis
    float waveBend = sin(uv.y * 3.4 - t * 0.52 + cos(uv.x * 3.8 + t * 0.4) * 0.5) * 0.28;
    float fluteSin = sin(flutePhase + waveBend);
    float fluteCos = cos(flutePhase + waveBend);

    // Cylindrical glass surface normal (transparent lens curvature)
    vec3 normal = normalize(vec3(
      fluteSin * 0.62,
      cos(uv.y * 3.14159 - t * 0.45) * 0.06,
      1.0
    ));

    // Optical Snell refraction through the clear glass slide:
    // Each reed bends the underlying wave horizontally & vertically, with subtle RGB dispersion
    float iorStrength = 0.068 / max(aspect * 0.55, 0.75);
    vec2 refractOffset = vec2(
      normal.x * iorStrength + sin(uv.y * 5.0 - t * 0.7) * 0.008 * fluteSin,
      normal.y * 0.028 + fluteCos * 0.012 * sin(uv.x * 4.0 + t * 0.5)
    );

    // Subtle chromatic dispersion across the lens edge (red/green/blue bend slightly differently)
    vec2 disp = vec2(fluteSin * 0.0032, 0.0);
    vec3 colR = sampleScene(uv + refractOffset + disp, t, u_dark);
    vec3 colG = sampleScene(uv + refractOffset, t, u_dark);
    vec3 colB = sampleScene(uv + refractOffset - disp, t, u_dark);
    vec3 refractedWave = vec3(colR.r, colG.g, colB.b);

    // Wave-coupled lighting: the glass itself is nearly invisible, so specular & Fresnel
    // reflections are driven by the local wave luminance and wave slope behind the glass
    vec3 unrefracted = sampleScene(uv, t, u_dark);
    float waveLuma = dot(refractedWave, vec3(0.299, 0.587, 0.114));
    float waveContrast = length(refractedWave - unrefracted);

    vec3 viewDir  = vec3(0.0, 0.0, 1.0);
    vec3 lightDir = normalize(vec3(0.38 + sin(t * 0.35) * 0.22, 0.42 + cos(t * 0.28) * 0.15, 0.88));
    vec3 halfVec  = normalize(lightDir + viewDir);

    float glossiness = 0.8;
    float shininess  = 72.0;
    float spec = pow(max(dot(normal, halfVec), 0.0), shininess) * glossiness;
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5) * glossiness;

    // Extremely subtle depth modulation (0.965 to 1.025) so flutes are invisible until they bend a wave
    float subtleDepth = mix(0.968, 1.024, fluteCos * 0.5 + 0.5);
    float waveCatch = smoothstep(0.25, 0.85, waveLuma) * (0.45 + waveContrast * 3.2);

    vec3 specTint = mix(vec3(1.0, 0.98, 0.94), vec3(0.84, 0.99, 0.91), u_dark);
    vec3 finalCol = refractedWave * subtleDepth
                  + specTint * (spec * 0.24 * waveCatch + fresnel * 0.11 * waveCatch);

    gl_FragColor = vec4(clamp(finalCol, 0.0, 1.0), 1.0);
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
 * Full-viewport non-interactive WebGL fluted-glass wave background.
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
