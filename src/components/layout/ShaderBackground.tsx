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
    // Flowing diagonal organic waves behind the glass with distinct optical bands
    float w1 = sin(p.x * 3.4 + p.y * 2.8 - t * 0.85 + sin(p.y * 3.0 + t * 0.55) * 0.65);
    float w2 = cos(p.x * 2.8 - p.y * 3.2 + t * 0.68 + cos(p.x * 2.2 - t * 0.45) * 0.50);
    float ribbon = sin((p.x * 1.15 + p.y * 0.95) * 5.2 - t * 0.90 + w1 * 0.55);

    // Warm golden-champagne sunlight beam pouring diagonally from upper right
    float sunAxis = p.x * 0.76 + p.y * 0.82 - 0.92 + sin(p.y * 2.6 - t * 0.70) * 0.22;
    float sunBeam = exp(-pow(sunAxis * 2.35, 2.0));
    float secondaryRay = exp(-pow((p.x * 0.82 + p.y * 0.65 - 0.58 + cos(p.y * 3.2 + t * 0.6) * 0.18) * 3.4, 2.0));
    float peachGlow = exp(-pow((p.x * 0.68 - p.y * 0.48 - 0.12 + cos(p.x * 2.2 + t * 0.52) * 0.24) * 2.4, 2.0));

    // Reference-matched chromatic palette from media_1794043339478_8e37b37c.jpg
    vec3 cobaltDeep     = vec3(0.22, 0.37, 0.78); // Deep refractive blue shadow
    vec3 periwinkleDeep = vec3(0.31, 0.47, 0.85); // Left vibrant cornflower/periwinkle
    vec3 lavenderLilac  = vec3(0.68, 0.72, 0.91); // Center soft pastel lilac
    vec3 icyAqua        = vec3(0.70, 0.89, 0.92); // Bottom right icy seafoam aqua
    vec3 deepAquaShadow = vec3(0.30, 0.45, 0.59); // Refractive shadow trough on right
    vec3 champagneWarm  = vec3(1.00, 0.90, 0.76); // Upper right warm champagne/peach
    vec3 pureLight      = vec3(1.00, 0.98, 0.95); // High-luminance core flare

    // Blend base cobalt & periwinkle into lavender/lilac with wave ribbons
    vec3 col = mix(cobaltDeep, periwinkleDeep, smoothstep(-0.75, 0.35, w1));
    col = mix(col, lavenderLilac, smoothstep(-0.35, 0.70, w1 * 0.55 + ribbon * 0.25 + (p.x - 0.26) * 0.85));

    // Blend into cool icy aqua & deep slate shadow troughs at lower right
    float aquaWeight = smoothstep(-0.05, 0.90, (p.x - 0.22) * 1.15 - (p.y - 0.58) * 0.75 + w2 * 0.38);
    vec3 aquaBand = mix(deepAquaShadow, icyAqua, smoothstep(-0.55, 0.55, ribbon * 0.65 + w2 * 0.45));
    col = mix(col, aquaBand, aquaWeight * 0.88);

    // Overlay warm champagne sunlight flare & secondary caustic ray streaming from upper right
    float warmLight = clamp(sunBeam * 1.12 + secondaryRay * 0.48 + peachGlow * 0.30, 0.0, 1.0);
    col = mix(col, champagneWarm, warmLight);
    col = mix(col, pureLight, smoothstep(0.62, 0.98, sunBeam + secondaryRay * 0.35) * 0.58);
    return col;
  }

  // Night Mode scene: Deep teal-sapphire, rich forest emerald & brilliant mint-jade beam
  vec3 sampleDarkScene(vec2 p, float t) {
    float w1 = sin(p.x * 3.2 + p.y * 2.6 - t * 0.82 + cos(p.y * 2.8 + t * 0.52) * 0.60);
    float w2 = cos(p.x * 2.6 - p.y * 2.9 + t * 0.65);
    float ribbon = sin((p.x * 1.1 + p.y * 0.9) * 5.0 - t * 0.85 + w1 * 0.50);

    float mintBeam = exp(-pow((p.x * 0.75 + p.y * 0.74 - 0.88 + sin(p.y * 2.6 - t * 0.68) * 0.24) * 2.35, 2.0));
    float secondaryMint = exp(-pow((p.x * 0.80 + p.y * 0.60 - 0.54 + cos(p.y * 3.0 + t * 0.58) * 0.18) * 3.3, 2.0));
    float tealFill = exp(-pow((p.x * 0.70 - p.y * 0.50 - 0.15 + cos(p.x * 2.2 + t * 0.52) * 0.22) * 2.5, 2.0));

    vec3 deepAbyss      = vec3(0.01, 0.09, 0.16);
    vec3 forestPine     = vec3(0.02, 0.22, 0.16);
    vec3 richEmerald    = vec3(0.04, 0.50, 0.34);
    vec3 vibrantJade    = vec3(0.18, 0.79, 0.53);
    vec3 mintHighlight  = vec3(0.84, 0.99, 0.89);

    vec3 col = mix(deepAbyss, forestPine, smoothstep(-0.7, 0.65, w2 + ribbon * 0.3 + p.x * 0.45));
    col = mix(col, richEmerald, smoothstep(-0.55, 0.68, w1 * 0.60 + ribbon * 0.25 + (p.x - 0.24) * 0.75));
    col = mix(col, vibrantJade, clamp(mintBeam * 1.0 + secondaryMint * 0.45 + tealFill * 0.38, 0.0, 1.0));
    col = mix(col, mintHighlight, smoothstep(0.58, 0.98, mintBeam + secondaryMint * 0.3) * 0.56);
    return col;
  }

  vec3 sampleBackdrop(vec2 p, float t, float darkMix) {
    return mix(sampleLightScene(p, t), sampleDarkScene(p, t), darkMix);
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * 1.18;

    // Balanced fluted-glass reed density (~68-85 reeds across desktop, ~26-34 on mobile)
    float fluteWidth = clamp(u_resolution.x / 76.0, 14.0, 23.0);
    float strips = floor(u_resolution.x / fluteWidth);
    float stripPos = uv.x * strips;
    // Local coordinate inside each cylindrical flute: -1.0 (left seam) to +1.0 (right seam)
    float x = fract(stripPos) * 2.0 - 1.0;

    // Physical convex cylindrical lens surface normal:
    // Each reed curves steeply from -1 to +1, acting as a real cylindrical magnifying/refracting rod
    float r = x * 0.94;
    float arc = sqrt(max(0.02, 1.0 - r * r));
    // Subtle vertical undulation in the glass thickness so refraction shimmers organically
    float ny = sin(uv.y * 4.5 - t * 0.65 + floor(stripPos) * 0.37) * 0.08;
    vec3 normal = normalize(vec3(r * 1.38, ny, arc));

    // Wavelength-dependent Snell's Law refraction (Crown/Flint Glass dispersion: IOR Red=1.49, Green=1.52, Blue=1.55)
    vec3 incident = vec3(0.0, 0.0, -1.0);
    vec3 refrR = refract(incident, normal, 1.0 / 1.49);
    vec3 refrG = refract(incident, normal, 1.0 / 1.52);
    vec3 refrB = refract(incident, normal, 1.0 / 1.55);

    // Physical optical stand-off distance between the fluted glass plane and the background wave plane:
    // Each cylindrical lens bends rays across a wide ~8.5% slice of the backdrop, creating the
    // unmistakable stepped/scalloped optical magnification and compression inside every single reed!
    float glassStandOff = 0.085;
    vec2 offsetR = (refrR.xy / max(abs(refrR.z), 0.18)) * vec2(glassStandOff, glassStandOff * 0.48);
    vec2 offsetG = (refrG.xy / max(abs(refrG.z), 0.18)) * vec2(glassStandOff, glassStandOff * 0.48);
    vec2 offsetB = (refrB.xy / max(abs(refrB.z), 0.18)) * vec2(glassStandOff, glassStandOff * 0.48);

    // Multi-tap frosted glassmorphism diffusion along the refracted ray
    float jitter = (hash(gl_FragCoord.xy) - 0.5) * 0.0022;
    vec3 accum = vec3(0.0);
    const int TAPS = 5;
    for (int i = -2; i <= 2; i++) {
      float fi = float(i) * 0.0034 + jitter;
      // Frosted anisotropic spread (stronger vertically along the reed grain, crisp horizontally)
      vec2 blurStep = vec2(fi * 0.25, fi * 1.15);

      float cr = sampleBackdrop(uv + offsetR + blurStep, t, u_dark).r;
      float cg = sampleBackdrop(uv + offsetG + blurStep, t, u_dark).g;
      float cb = sampleBackdrop(uv + offsetB + blurStep, t, u_dark).b;
      accum += vec3(cr, cg, cb);
    }
    vec3 refractedColor = accum / float(TAPS);

    // Secondary internal reflection inside the glass cylinder (Fresnel bounce near the curved reed edges)
    float cosTheta = clamp(dot(-incident, normal), 0.0, 1.0);
    float fresnel = pow(1.0 - cosTheta, 3.2);
    vec2 internalReflectUv = uv - offsetG * 0.65 + vec2(0.0, 0.015);
    vec3 internalReflectColor = sampleBackdrop(internalReflectUv, t, u_dark);
    refractedColor = mix(refractedColor, internalReflectColor, fresnel * 0.26);

    // Optical Caustic Focusing:
    // Convex cylindrical reeds focus bright background waves into tapered vertical caustic spindles
    float waveLuma = dot(refractedColor, vec3(0.299, 0.587, 0.114));
    float lensCore = exp(-pow((x + 0.12) * 1.85, 2.0));
    float vSpindle = 0.68 + 0.32 * sin(uv.y * 14.0 - t * 0.55 + floor(stripPos) * 0.45);
    float causticFocus = lensCore * smoothstep(0.38, 0.92, waveLuma) * vSpindle * 0.16;

    // Calibrated 0.75 Glossiness Specular Lighting on the cylindrical glass surface
    vec3 lightDir = normalize(vec3(-0.38, 0.62, 0.68));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float nDotH = max(dot(normal, halfVec), 0.0);
    float glossiness = 0.75;
    float specular = pow(nDotH, 52.0) * glossiness;

    // Fine vertical specular pinstripe & delicate seam groove between reeds
    float ridgePinstripe = exp(-pow((x - 0.22) * 7.8, 2.0)) * 0.09 * (0.35 + 0.65 * waveLuma);
    float seamEdge = smoothstep(0.0, 0.22, 1.0 - abs(x));
    float grooveShadow = mix(0.962, 1.0, seamEdge);
    float grooveGlint = exp(-pow((abs(x) - 0.93) * 19.0, 2.0)) * 0.055;

    // Cylindrical glass transmittance curve (thicker center vs angled edges)
    float lensTransmittance = mix(0.968, 1.022, arc);

    vec3 specColor = mix(vec3(1.0, 0.98, 0.95), vec3(0.85, 0.99, 0.92), u_dark);
    vec3 finalColor = refractedColor * lensTransmittance * grooveShadow
                    + refractedColor * causticFocus
                    + specColor * (specular * 0.15 + ridgePinstripe + grooveGlint);

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
