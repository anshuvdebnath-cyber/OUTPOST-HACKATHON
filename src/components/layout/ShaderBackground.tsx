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
 * Fragment shader inspired by the reference frosted metallic-rose wave texture:
 *  - Domain-warped organic liquid wave heightfield
 *  - High-frequency frosted micro-grain normal perturbation
 *  - Blinn-Phong + Fresnel physical specular lighting with glossiness = 0.8
 */
const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_dark;

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

  // Layered flowing silk wave heightfield
  float waveHeight(vec2 p, float t) {
    vec2 q = vec2(
      sin(p.x * 1.7 + t * 0.55 + cos(p.y * 1.4 - t * 0.35)),
      cos(p.y * 1.6 - t * 0.45 + sin(p.x * 1.3 + t * 0.4))
    );
    float w1 = sin(p.x * 2.4 + p.y * 1.9 + q.x * 1.6 + t * 0.7);
    float w2 = cos(p.x * 1.5 - p.y * 2.8 + q.y * 1.5 - t * 0.5);
    float w3 = sin((p.x + p.y) * 3.6 - t * 0.65) * 0.38;
    float n = noise(p * 2.4 + q * 0.65 + t * 0.2) * 0.65;
    return (w1 * 0.42 + w2 * 0.38 + w3 + n);
  }

  void main() {
    vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
    vec2 uv = (v_uv - 0.5) * aspect;
    vec2 mouseOffset = (u_mouse - 0.5) * 0.35;
    vec2 p = uv * 2.1 - mouseOffset;
    float t = u_time * 0.65;

    // Finite-difference wave gradient for physical surface normal
    float eps = 0.015;
    float h = waveHeight(p, t);
    float hx = waveHeight(p + vec2(eps, 0.0), t);
    float hy = waveHeight(p + vec2(0.0, eps), t);

    // High-frequency frosted glass micro-bump normal perturbation
    vec2 frostUv = v_uv * u_resolution * 0.28;
    float f0 = noise(frostUv);
    float fx = noise(frostUv + vec2(1.3, 0.0)) - f0;
    float fy = noise(frostUv + vec2(0.0, 1.3)) - f0;

    vec3 normal = normalize(vec3(
      -(hx - h) / eps * 0.55 - fx * 0.38,
      -(hy - h) / eps * 0.55 - fy * 0.38,
      1.0
    ));

    // View and animated light directions
    vec3 viewDir = normalize(vec3(-uv * 0.35, 1.0));
    vec3 lightDir1 = normalize(vec3(-0.45 + sin(t * 0.4) * 0.25, 0.55 + cos(t * 0.35) * 0.2, 0.85));
    vec3 lightDir2 = normalize(vec3(0.6, -0.45, 0.7));

    // Diffuse & Blinn-Phong specular with glossiness = 0.8
    float diff1 = max(dot(normal, lightDir1), 0.0);
    float diff2 = max(dot(normal, lightDir2), 0.0);
    float glossiness = 0.8;
    float shininess = mix(12.0, 76.0, glossiness);

    vec3 halfVec1 = normalize(lightDir1 + viewDir);
    vec3 halfVec2 = normalize(lightDir2 + viewDir);
    float spec1 = pow(max(dot(normal, halfVec1), 0.0), shininess) * glossiness;
    float spec2 = pow(max(dot(normal, halfVec2), 0.0), shininess * 0.6) * (glossiness * 0.55);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0) * glossiness;

    // Rich metallic rose / crimson / pearl palette from reference image
    vec3 deepCrimson = vec3(0.56, 0.07, 0.24);
    vec3 vibrantRose = vec3(0.85, 0.25, 0.46);
    vec3 warmBlush   = vec3(0.95, 0.56, 0.70);
    vec3 pearlPink   = vec3(0.99, 0.86, 0.91);

    float band = clamp(h * 0.5 + 0.5, 0.0, 1.0);
    vec3 baseColor = mix(deepCrimson, vibrantRose, smoothstep(0.05, 0.55, band));
    baseColor = mix(baseColor, warmBlush, smoothstep(0.45, 0.88, diff1 * 0.75 + band * 0.35));

    // Add frosted micro-sparkle and glossy specular highlights
    float microSparkle = smoothstep(0.62, 0.98, f0) * spec1 * 0.65;
    vec3 color = baseColor * (0.62 + 0.45 * diff1 + 0.22 * diff2);
    color += pearlPink * (spec1 * 0.95 + spec2 * 0.45 + fresnel * 0.35 + microSparkle);

    // Subtle dark-mode dimming so white monochrome glass text remains ultra-crisp
    color = mix(color, color * 0.58 + vec3(0.06, 0.01, 0.03), u_dark * 0.72);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
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
 * Full-viewport live WebGL shader canvas rendering the frosted liquid-rose wave motion.
 * Falls back gracefully when WebGL is unavailable (e.g. headless unit tests).
 */
export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const darkRef = useRef(theme === 'dark' ? 1 : 0);

  useEffect(() => {
    darkRef.current = theme === 'dark' ? 1 : 0;
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
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uDark = gl.getUniformLocation(program, 'u_dark');

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let currentDark = darkRef.current;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      gl?.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const onPointerMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / Math.max(window.innerWidth, 1);
      mouse.ty = 1.0 - e.clientY / Math.max(window.innerHeight, 1);
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let raf = 0;
    const start = performance.now();

    const render = (now: number) => {
      const elapsed = (now - start) * 0.001;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      currentDark += (darkRef.current - currentDark) * 0.08;

      gl?.uniform1f(uTime, elapsed);
      gl?.uniform2f(uRes, canvas.width, canvas.height);
      gl?.uniform2f(uMouse, mouse.x, mouse.y);
      gl?.uniform1f(uDark, currentDark);
      gl?.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 25% 20%, #f8a4c0 0%, #d43d6e 45%, #8c143c 100%)',
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full block" />
    </div>
  );
}

