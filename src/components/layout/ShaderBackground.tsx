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
 * Dual-Mode Fluted / Reeded Glass WebGL Fragment Shader:
 *  - Non-interactive (purely autonomous time-driven wave motion)
 *  - Light mode (u_dark = 0): Periwinkle blue, icy seafoam-aqua, warm champagne sunlight
 *  - Night mode (u_dark = 1): Deep sapphire-teal, rich forest emerald, luminous mint-jade
 *  - Vertical cylindrical glass flutes refract the underlying wave field with 0.8 specular glossiness
 */
const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_dark;

  // Smooth procedural noise for subtle glass grain
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Light Mode: Periwinkle blue + icy aqua-mint + warm champagne sunlight wave field
  vec3 sampleLightPalette(vec2 uv, float t) {
    float w1 = sin(uv.x * 2.6 - uv.y * 2.1 + t * 0.45);
    float w2 = cos(uv.x * 1.9 + uv.y * 2.8 - t * 0.38);
    float diag = sin((uv.x * 1.4 + uv.y * 1.8) * 2.2 - t * 0.5);

    vec3 periwinkle = vec3(0.42, 0.56, 0.84);
    vec3 softLavender = vec3(0.72, 0.77, 0.93);
    vec3 icyAqua    = vec3(0.75, 0.90, 0.92);
    vec3 champagne  = vec3(0.99, 0.89, 0.78);
    vec3 pearlWhite = vec3(0.95, 0.98, 1.00);

    vec3 col = mix(periwinkle, icyAqua, smoothstep(-0.7, 0.7, w1 * 0.6 + (uv.x - 0.5) * 0.9));
    col = mix(col, softLavender, smoothstep(0.1, 0.9, (1.0 - uv.y) * 0.8 + w2 * 0.25));
    float sunBand = smoothstep(0.18, 0.85, diag * 0.5 + uv.x * 0.45 + uv.y * 0.35);
    col = mix(col, champagne, sunBand * 0.78);
    col = mix(col, pearlWhite, smoothstep(0.55, 0.98, w2 * 0.5 + 0.5) * 0.35);
    return col;
  }

  // Night Mode: Deep teal-sapphire + rich forest emerald + luminous mint-jade wave field
  vec3 sampleDarkPalette(vec2 uv, float t) {
    float w1 = sin(uv.x * 2.4 + uv.y * 1.7 - t * 0.42);
    float w2 = cos(uv.x * 3.1 - uv.y * 2.0 + t * 0.36);
    float crest = sin((uv.x * 2.0 - uv.y * 1.3) * 2.0 + t * 0.48);

    vec3 abyssTeal     = vec3(0.02, 0.14, 0.22);
    vec3 deepPine      = vec3(0.02, 0.24, 0.18);
    vec3 richEmerald   = vec3(0.05, 0.48, 0.34);
    vec3 vibrantJade   = vec3(0.16, 0.72, 0.50);
    vec3 champagneMint = vec3(0.78, 0.96, 0.84);

    vec3 col = mix(abyssTeal, deepPine, smoothstep(0.0, 0.65, uv.x + w1 * 0.22));
    col = mix(col, richEmerald, smoothstep(-0.5, 0.65, w1 * 0.55 + w2 * 0.45));
    col = mix(col, vibrantJade, smoothstep(0.15, 0.88, crest * 0.5 + 0.5) * 0.75);
    col = mix(col, champagneMint, pow(clamp(crest * 0.5 + 0.5, 0.0, 1.0), 4.0) * 0.48);
    return col;
  }

  void main() {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 uv = v_uv;
    float t = u_time;

    // Vertical fluted / reeded glass geometry
    float fluteCount = floor(clamp(u_resolution.x / 26.0, 24.0, 68.0));
    float fluteCoord = uv.x * fluteCount * 6.2831853;

    // Subtle organic wave modulation along the vertical reeds
    float waveShift = sin(uv.y * 4.2 - t * 0.55 + sin(uv.x * 5.0 + t * 0.35) * 0.6) * 0.35;
    float fluteSin = sin(fluteCoord + waveShift);
    float fluteCos = cos(fluteCoord + waveShift);

    // Fine frosted micro-grain on the glass surface
    float grain = (noise(uv * u_resolution * 0.35) - 0.5) * 0.06;

    // Cylindrical glass normal for each vertical flute
    vec3 normal = normalize(vec3(fluteSin * 0.78 + grain, sin(uv.y * 3.14159 - t * 0.4) * 0.08, 1.0));

    // Refract UV through the cylindrical fluted lens
    vec2 refractedUv = uv + vec2(normal.x * (0.045 / max(aspect * 0.6, 0.8)), normal.y * 0.02);

    // Sample both light and dark wave fields and crossfade smoothly via u_dark
    vec3 lightCol = sampleLightPalette(refractedUv, t);
    vec3 darkCol  = sampleDarkPalette(refractedUv, t);
    vec3 baseCol  = mix(lightCol, darkCol, u_dark);

    // Physical Blinn-Phong + Fresnel lighting with glossiness = 0.8
    vec3 viewDir  = vec3(0.0, 0.0, 1.0);
    vec3 lightDir = normalize(vec3(0.42 + sin(t * 0.3) * 0.15, 0.38, 0.85));
    vec3 halfVec  = normalize(lightDir + viewDir);

    float glossiness = 0.8;
    float shininess  = 58.0;
    float spec = pow(max(dot(normal, halfVec), 0.0), shininess) * glossiness;
    float rim  = pow(1.0 - abs(fluteCos), 3.0) * 0.28;
    float shadow = mix(0.84, 1.06, fluteCos * 0.5 + 0.5);

    vec3 specTint = mix(vec3(1.0, 0.97, 0.92), vec3(0.82, 0.99, 0.90), u_dark);
    vec3 finalCol = baseCol * shadow + specTint * (spec * 0.55 + rim * mix(0.45, 0.25, u_dark));

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
 * Smoothly cross-dissolves between the Light Mode (periwinkle/aqua/champagne) and
 * Night Mode (deep teal/emerald/mint) shaders whenever the theme changes.
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

      // Exponentially damped interpolation for silky-smooth light/dark mode transition
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
