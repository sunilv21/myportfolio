"use client"

import { useEffect, useRef } from "react"

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_mouseStrength;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // FBM (Fractal Brownian Motion)
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = uv * aspect;

    float t = u_time * 0.15;

    // Mouse influence
    vec2 mouse = u_mouse * aspect;
    float mouseDist = length(p - mouse);
    float mouseInfluence = u_mouseStrength * smoothstep(0.5, 0.0, mouseDist);

    // Domain warping - distort the coordinates using noise
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.4),
      fbm(p + vec2(5.2, 1.3) + t * 0.3)
    );

    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.2),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.25)
    );

    // Add mouse distortion to the warping
    r += mouseInfluence * vec2(
      sin(mouseDist * 8.0 - u_time * 2.0),
      cos(mouseDist * 6.0 - u_time * 1.5)
    ) * 0.3;

    float f = fbm(p + 4.0 * r);

    // Color palette - vibrant with orange/amber accent glow
    vec3 darkBase = vec3(0.03, 0.03, 0.05);
    vec3 deepOrange = vec3(0.8, 0.2, 0.0);
    vec3 amber = vec3(1.0, 0.55, 0.1);
    vec3 hotOrange = vec3(1.0, 0.4, 0.0);
    vec3 darkGreen = vec3(0.0, 0.3, 0.15);

    vec3 color = darkBase;
    color = mix(color, deepOrange, clamp(f * f * 1.5, 0.0, 1.0) * 0.6);
    color = mix(color, amber, clamp(length(q) * 0.8, 0.0, 1.0) * 0.4);
    color = mix(color, darkGreen, clamp(r.x * 0.6, 0.0, 1.0) * 0.35);
    color = mix(color, hotOrange, clamp(pow(f, 3.0) * 2.0, 0.0, 1.0) * 0.5);

    // Mouse glow
    float mouseGlow = smoothstep(0.4, 0.0, mouseDist) * u_mouseStrength;
    color += amber * mouseGlow * 0.32;

    // Subtle vignette
    float vignette = 1.0 - smoothstep(0.4, 1.3, length(uv - 0.5) * 1.4);
    color *= mix(0.8, 1.0, vignette);

    // Overall brightness
    color *= 0.84;

    gl_FragColor = vec4(color, 1.0);
  }
`

export function ShaderDistortion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const mouseStrengthRef = useRef(0)
  const targetStrengthRef = useRef(0)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    })
    if (!gl) {
      console.warn("WebGL not supported")
      return
    }

    // Compile shaders
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vertShader || !fragShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Full-screen quad
    const posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniforms
    const uTime = gl.getUniformLocation(program, "u_time")
    const uResolution = gl.getUniformLocation(program, "u_resolution")
    const uMouse = gl.getUniformLocation(program, "u_mouse")
    const uMouseStrength = gl.getUniformLocation(program, "u_mouseStrength")

    // Resize handling
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    // Mouse handling - listen on window so canvas doesn't block clicks
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: 1.0 - (e.clientY - rect.top) / rect.height, // flip Y for GL
      }
      targetStrengthRef.current = 1.0
    }

    const handleMouseLeave = () => {
      targetStrengthRef.current = 0
    }

    // Touch handling
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (touch.clientX - rect.left) / rect.width,
        y: 1.0 - (touch.clientY - rect.top) / rect.height,
      }
      targetStrengthRef.current = 1.0
    }

    const handleTouchEnd = () => {
      targetStrengthRef.current = 0
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("touchend", handleTouchEnd)

    const startTime = performance.now()

    const render = () => {
      const time = (performance.now() - startTime) / 1000

      // Smooth mouse strength transition
      mouseStrengthRef.current += (targetStrengthRef.current - mouseStrengthRef.current) * 0.05

      gl.uniform1f(uTime, time)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(uMouseStrength, mouseStrengthRef.current)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      cancelAnimationFrame(animationRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vertShader)
      gl.deleteShader(fragShader)
      gl.deleteBuffer(posBuffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
