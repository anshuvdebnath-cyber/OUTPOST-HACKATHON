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
 *    * Vertical cylindrical glass ribs with physical Snell's law refraction
 *    * Natural fluted reed density (~16 reeds on mobile, ~36-44 on desktop)
 *    * Tapered luminous caustic needles channeled vertically through each flute
 *    * Calibrated 0.75 specular glossiness on cylindrical lens ridges
 *    * Chromatic dispersion & soft multi-sample frosted diffusion
 *  - Dual-mode:
 *    * Light Mode: Rich periwinkle/cornflower blue, pastel lavender/lilac, icy aqua & glowing champagne sunlight flare
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

  // Light Mode scene: Periwinkle blue, lilac lavender, icy aqua & glowing champagne sunlight flare
  vec3 sampleLightScene(vec2 p, float t) {
    // Flowing diagonal organic waves behind the glass
    float w1 = sin(p.x * 2.6 + p.y * 2.1 - t * 0.72 + sin(p.y * 2.4 + t * 0.45) * 0.52);
    float w2 = cos(p.x * 2.1 - p.y * 2.5 + t * 0.58 + cos(p.x * 1.8 - t * 0.38) * 0.42);

    // Warm golden-champagne sunlight beam pouring diagonally from upper right
    float sunBeam = exp(-pow((p.x * 0.74 + p.y * 0.82 - 0.94 + sin(p.y * 2.2 - t * 0.6) * 0.2) * 2.1, 2.0));
    float peachGlow = exp(-pow((p.x * 0.68 - p.y * 0.45 - 0.12 + cos(p.x * 2.0 + t * 0.48) * 0.22) * 2.3, 2.0));

    // Reference-matched chromatic palette from media_1794043339478_8e37b37c.jpg
    vec3 periwinkleDeep = vec3(0.28, 0.44, 0.83); // Left vibrant cornflower/periwinkle
    vec3 periwinkleSoft = vec3(0.42, 0.56, 0.88); // Mid-left transition
    vec3 lavenderLilac  = vec3(0.68, 0.71, 0.90); // Center soft pastel lilac
    vec3 icyAqua        = vec3(0.68, 0.86, 0.90); // Bottom right icy seafoam aqua
    vec3 deepAquaShadow = vec3(0.34, 0.48, 0.60); // Low contrast shadow on right
    vec3 champagneWarm  = vec3(1.00, 0.91, 0.79); // Upper right warm champagne/peach
    vec3 pureLight      = vec3(0.99, 0.98, 0.96); // High-luminance core flare

    // Blend base periwinkle into lavender/lilac
    vec3 col = mix(periwinkleDeep, periwinkleSoft, smoothstep(-0.8, 0.4, w1));
    col = mix(col, lavenderLilac, smoothstep(-0.3, 0.75, w1 * 0.6 + (p.x - 0.28) * 0.8));

    // Blend into cool icy aqua at lower right
    float aquaWeight = smoothstep(0.0, 0.95, (p.x - 0.25) * 1.1 - (p.y - 0.6) * 0.7 + w2 * 0.35);
    col = mix(col, mix(deepAquaShadow, icyAqua, smoothstep(-0.4, 0.6, w2)), aquaWeight * 0.85);

    // Overlay warm champagne sunlight flare streaming from upper right
    col = mix(col, champagneWarm, clamp(sunBeam * 1.08 + peachGlow * 0.32, 0.0, 1.0));
    col = mix(col, pureLight, smoothstep(0.68, 0.98, sunBeam) * 0.52);
    return col;
  }

  // Night Mode scene: Deep teal-sapphire, rich forest emerald & brilliant mint-jade beam
  vec3 sampleDarkScene(vec2 p, float t) {
    float w1 = sin(p.x * 2.5 + p.y * 2.0 - t * 0.70 + cos(p.y * 2.2 + t * 0.48) * 0.52);
    float w2 = cos(p.x * 2.3 - p.y * 2.3 + t * 0.58);

    float mintBeam = exp(-pow((p.x * 0.75 + p.y * 0.72 - 0.88 + sin(p.y * 2.4 - t * 0.62) * 0.24) * 2.3, 2.0));
    float tealFill = exp(-pow((p.x * 0.70 - p.y * 0.50 - 0.15 + cos(p.x * 2.2 + t * 0.52) * 0.22) * 2.5, 2.0));

    vec3 deepAbyss      = vec3(0.01, 0.10, 0.17);
    vec3 forestPine     = vec3(0.02, 0.21, 0.15);
    vec3 richEmerald    = vec3(0.04, 0.48, 0.33);
    vec3 vibrantJade    = vec3(0.16, 0.76, 0.51);
    vec3 mintHighlight  = vec3(0.82, 0.98, 0.87);

    vec3 col = mix(deepAbyss, forestPine, smoothstep(-0.7, 0.7, w2 + p.x * 0.45));
    col = mix(col, richEmerald, smoothstep(-0.55, 0.7, w1 * 0.65 + (p.x - 0.25) * 0.7));
    col = mix(col, vibrantJade, clamp(mintBeam * 0.95 + tealFill * 0.40, 0.0, 1.0));
    col = mix(col, mintHighlight, smoothstep(0.60, 0.98, mintBeam) * 0.52);
    return col;
  }

  vec3 sampleBackdrop(vec2 p, float t, float darkMix) {
    return mix(sampleLightScene(p, t), sampleDarkScene(p, t), darkMix);
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 1.15;

    // Physical fluted glass rib geometry calibrated to reference photo:
    // ~16-20 reeds on mobile portrait, ~36-44 reeds on desktop
    float fluteWidth = clamp(u_resolution.x / 38.0, 22.0, 48.0);
    float strips = floor(u_resolution.x / fluteWidth);
    float stripPos = uv.x * strips;
    // Local normalized flute coordinate: -1.0 (left groove seam) to +1.0 (right groove seam)
    float x = fract(stripPos) * 2.0 - 1.0;

    // Cylindrical lens surface profile & surface normal
    float r = x * 0.92;
    float arc = sqrt(max(0.001, 1.0 - r * r));
    vec3 normal = normalize(vec3(r * 1.25, 0.0, arc));

    // Physical Snell's-law refraction through soda-lime/borosilicate crown glass (IOR = 1.52)
    vec3 incident = vec3(0.0, 0.0, -1.0);
    vec3 refr = refract(incident, normal, 1.0 / 1.52);

    // Horizontal refractive ray displacement across each cylinder
    vec2 refractShift = vec2(refr.x * (1.35 / strips), refr.x * 0.004);

    // Subtle chromatic dispersion along the lens curve
    vec2 dispersion = vec2(refr.x * 0.0022, 0.0);
    float jitter = (hash(gl_FragCoord.xy) - 0.5) * 0.0025;

    // Multi-tap frosted blur sampling behind the glass
    vec3 accum = vec3(0.0);
    const int TAPS = 5;
    for (int i = -2; i <= 2; i++) {
      float fi = float(i) * 0.0032 + jitter;
      vec2 sampleUv = uv + refractShift + vec2(fi * 0.20, fi * 0.85);

      float cr = sampleBackdrop(sampleUv + dispersion, t, u_dark).r;
      float cg = sampleBackdrop(sampleUv, t, u_dark).g;
      float cb = sampleBackdrop(sampleUv - dispersion, t, u_dark).b;
      accum += vec3(cr, cg, cb);
    }
    vec3 refractedColor = accum / float(TAPS);

    // Vertical tapered caustic needles: light focusing through cylindrical reeds
    // Notice in the reference how the flutes channel light into vertical spindle/needle caustics
    float waveLuma = dot(refractedColor, vec3(0.299, 0.587, 0.114));
    float lensCore = exp(-pow(x * 1.6, 2.0));
    // Vertical modulation creates the tapering spindle caustics seen in the reference
    float vCausticMod = 0.70 + 0.30 * sin(uv.y * 18.0 - t * 0.45 + stripPos * 0.35);
    float causticNeedle = lensCore * smoothstep(0.40, 0.92, waveLuma) * vCausticMod * 0.24;

    // Surface lighting with exact 0.75 glossiness parameter:
    // Directional light from upper-right reflecting on the cylindrical glass ribs
    vec3 lightDir = normalize(vec3(-0.35, 0.65, 0.68));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float nDotH = max(dot(normal, halfVec), 0.0);
    // Glossiness of 0.75 corresponds to specular exponent ~52.0 and reflection coefficient 0.75
    float glossiness = 0.75;
    float specular = pow(nDotH, 52.0) * glossiness;

    // Fine vertical specular pinstripe highlight along each reed ridge
    float ridgePinstripe = exp(-pow((x - 0.20) * 7.5, 2.0)) * 0.18 * (0.35 + 0.65 * waveLuma);

    // Seam grooves between reeds: subtle shadowed recess and glass seam glint
    float seamEdge = smoothstep(0.0, 0.22, 1.0 - abs(x));
    float grooveShadow = mix(0.94, 1.0, seamEdge);
    float grooveGlint = exp(-pow((abs(x) - 0.94) * 20.0, 2.0)) * 0.10;

    // Lens transmittance profile
    float lensProfile = mix(0.96, 1.03, arc);

    vec3 specColor = mix(vec3(1.0, 0.98, 0.94), vec3(0.85, 0.99, 0.92), u_dark);
    vec3 finalColor = refractedColor * lensProfile * grooveShadow
                    + refractedColor * causticNeedle
                    + specColor * (specular * 0.32 + ridgePinstripe + grooveGlint * 0.16);

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
