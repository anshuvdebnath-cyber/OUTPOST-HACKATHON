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
 * True Physical Refracted Fluted-Glass WebGL Fragment Shader:
 *  - Straight parallel cylindrical glass lenses (fract(uv.x * strips))
 *  - Uses GLSL physical Snell's law `refract(I, N, eta)` (crown glass IOR = 1.52)
 *    with multi-tap frosted blur and RGB chromatic dispersion to slice, bend,
 *    and refract the animated diagonal colour waves behind the glass panel.
 *  - Dual-mode:
 *      Light mode (u_dark = 0): Periwinkle blue, icy aqua-mint & warm champagne-peach beam
 *      Night mode (u_dark = 1): Deep sapphire-teal, forest emerald & luminous mint-jade beam
 */
const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_dark;

  // Smooth procedural hash for subtle frosted diffusion inside the glass
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Light Mode underlying flowing wave scene (matches light reference image)
  vec3 sampleLightScene(vec2 p, float t) {
    // Flowing diagonal waves behind the glass
    float wave1 = sin(p.x * 3.2 + p.y * 2.4 - t * 0.85 + sin(p.y * 2.0 + t * 0.5) * 0.6);
    float wave2 = cos(p.x * 2.4 - p.y * 2.8 + t * 0.68);
    float ribbon = exp(-pow((p.x * 0.85 + p.y * 0.75 - 0.82 + sin(p.y * 2.6 - t * 0.75) * 0.28) * 2.4, 2.0));
    float ribbon2 = exp(-pow((p.x * 0.7 - p.y * 0.65 - 0.15 + cos(p.x * 2.2 + t * 0.6) * 0.25) * 2.6, 2.0));

    vec3 deepPeriwinkle = vec3(0.35, 0.49, 0.80);
    vec3 lavenderBlue   = vec3(0.64, 0.71, 0.90);
    vec3 seafoamAqua    = vec3(0.72, 0.89, 0.90);
    vec3 champagneGlow  = vec3(1.00, 0.89, 0.76);
    vec3 icyWhite       = vec3(0.96, 0.99, 1.00);

    vec3 col = mix(deepPeriwinkle, lavenderBlue, smoothstep(-0.8, 0.8, wave1));
    col = mix(col, seafoamAqua, smoothstep(-0.3, 0.85, (p.x - 0.25) * 1.4 + wave2 * 0.45));
    col = mix(col, champagneGlow, clamp(ribbon * 0.95 + ribbon2 * 0.45, 0.0, 1.0));
    col = mix(col, icyWhite, smoothstep(0.55, 1.0, wave2 * 0.5 + 0.5) * 0.35);
    return col;
  }

  // Night Mode underlying flowing wave scene (matches dark green reference image)
  vec3 sampleDarkScene(vec2 p, float t) {
    float wave1 = sin(p.x * 3.0 + p.y * 2.2 - t * 0.82 + cos(p.y * 2.4 + t * 0.55) * 0.65);
    float wave2 = cos(p.x * 2.6 - p.y * 2.5 + t * 0.64);
    float beam1 = exp(-pow((p.x * 0.9 + p.y * 0.6 - 0.78 + sin(p.y * 2.8 - t * 0.72) * 0.3) * 2.5, 2.0));
    float beam2 = exp(-pow((p.x * 0.75 - p.y * 0.55 - 0.1 + cos(p.x * 2.5 + t * 0.58) * 0.26) * 2.8, 2.0));

    vec3 deepAbyss    = vec3(0.01, 0.11, 0.18);
    vec3 darkForest   = vec3(0.02, 0.22, 0.16);
    vec3 richEmerald  = vec3(0.04, 0.50, 0.34);
    vec3 luminousJade = vec3(0.18, 0.78, 0.53);
    vec3 mintHighlight = vec3(0.84, 0.99, 0.89);

    vec3 col = mix(deepAbyss, darkForest, smoothstep(-0.7, 0.7, wave2 + p.x * 0.5));
    col = mix(col, richEmerald, smoothstep(-0.6, 0.75, wave1 * 0.7 + (p.x - 0.2) * 0.8));
    col = mix(col, luminousJade, clamp(beam2 * 0.85 + smoothstep(0.1, 0.9, wave1) * 0.55, 0.0, 1.0));
    col = mix(col, mintHighlight, clamp(beam1 * 0.88, 0.0, 1.0));
    return col;
  }

  vec3 sampleBackdrop(vec2 p, float t, float darkMix) {
    return mix(sampleLightScene(p, t), sampleDarkScene(p, t), darkMix);
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 1.15;

    // Number of vertical cylindrical glass strips across the viewport
    float strips = floor(clamp(u_resolution.x / 28.0, 26.0, 64.0));
    float stripPos = uv.x * strips;
    // Local coordinate inside each cylindrical flute: -1.0 (left edge) to +1.0 (right edge)
    float localX = fract(stripPos) * 2.0 - 1.0;

    // Smooth cylindrical lens profile & 3D surface normal
    float curvature = 0.86;
    float nx = localX * curvature;
    float nz = sqrt(max(0.05, 1.0 - nx * nx));
    vec3 normal = normalize(vec3(nx, 0.0, nz));

    // Physical Snell's-law refraction of the incident eye ray through crown glass (IOR = 1.52)
    vec3 incident = vec3(0.0, 0.0, -1.0);
    float eta = 1.0 / 1.52;
    vec3 refracted = refract(incident, normal, eta);

    // Refracted UV displacement: bends both horizontally across the flute and diagonally along the wave
    vec2 refractShift = vec2(
      refracted.x * 0.14,
      refracted.x * 0.095 + (1.0 - nz) * 0.04
    );

    // Multi-tap frosted refraction sampling + RGB chromatic dispersion inside the glass
    vec2 dispersion = vec2(refracted.x * 0.009, refracted.x * 0.004);
    float jitter = (hash(gl_FragCoord.xy) - 0.5) * 0.004;

    vec3 accum = vec3(0.0);
    const int TAPS = 5;
    for (int i = -2; i <= 2; i++) {
      float fi = float(i) * 0.0065 + jitter;
      vec2 sampleUv = uv + refractShift + vec2(fi * 0.6, fi * 1.4);

      float r = sampleBackdrop(sampleUv + dispersion, t, u_dark).r;
      float g = sampleBackdrop(sampleUv, t, u_dark).g;
      float b = sampleBackdrop(sampleUv - dispersion, t, u_dark).b;
      accum += vec3(r, g, b);
    }
    vec3 refractedColor = accum / float(TAPS);

    // Physical Fresnel & cylindrical specular reflection (glossiness = 0.8)
    // Coupled to the refracted wave luminance so the glass itself stays transparent
    float waveLuma = dot(refractedColor, vec3(0.299, 0.587, 0.114));
    vec3 lightDir = normalize(vec3(-0.52, 0.25, 0.82));
    vec3 viewDir  = vec3(0.0, 0.0, 1.0);
    vec3 halfVec  = normalize(lightDir + viewDir);

    float glossiness = 0.8;
    float spec = pow(max(dot(normal, halfVec), 0.0), 64.0) * glossiness;
    float fresnel = pow(1.0 - nz, 3.2) * glossiness;

    // Soft cylindrical internal transmittance (slightly deeper at flute seam, brighter at lens apex)
    float transmittance = mix(0.90, 1.04, nz);
    // Antialiased micro-seam between adjacent glass cylinders
    float seam = smoothstep(0.0, 0.06, 1.0 - abs(localX));
    transmittance *= mix(0.92, 1.0, seam);

    vec3 specColor = mix(vec3(1.0, 0.97, 0.92), vec3(0.82, 0.99, 0.90), u_dark);
    vec3 finalColor = refractedColor * transmittance
                    + specColor * (spec * (0.18 + 0.32 * waveLuma) + fresnel * 0.12 * waveLuma);

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
