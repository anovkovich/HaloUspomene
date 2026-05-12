"use client";

import { useEffect, useRef } from "react";

interface GreenScreenVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  /** Min G channel (0..1) for a pixel to be considered green. */
  greenThreshold?: number;
  /** How much greener than R/B (1.0 = equal). */
  greenRatio?: number;
  /** Soft falloff width — partial alpha between [ratio, ratio + falloff]. */
  falloff?: number;
  /** Optional CSS transform applied to the canvas (e.g. "scaleX(-1)"). */
  canvasTransform?: string;
  /** Video playback rate (1 = native speed, 2 = double speed). */
  playbackRate?: number;
}

const VS = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const FS = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_threshold;
uniform float u_ratio;
uniform float u_falloff;

void main() {
  vec4 color = texture2D(u_image, v_texCoord);
  float r = color.r;
  float g = color.g;
  float b = color.b;

  if (g < u_threshold) {
    gl_FragColor = color;
    return;
  }

  float maxRB = max(r, b);
  if (maxRB < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float ratio = g / maxRB;
  float outRatio = u_ratio + u_falloff;

  if (ratio >= outRatio) {
    gl_FragColor = vec4(0.0);
    return;
  }

  if (ratio > u_ratio) {
    float t = (ratio - u_ratio) / u_falloff;
    float newAlpha = 1.0 - t;
    float avg = (r + b) * 0.5;
    float newG = mix(g, avg, t);
    gl_FragColor = vec4(r, newG, b, newAlpha);
    return;
  }

  gl_FragColor = color;
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function GreenScreenVideo({
  src,
  className,
  style,
  greenThreshold = 0.3,
  greenRatio = 1.15,
  falloff = 0.25,
  canvasTransform,
  playbackRate = 1,
}: GreenScreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    video.playbackRate = playbackRate;

    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      alpha: true,
      antialias: true,
    }) as WebGLRenderingContext | null;
    if (!gl) {
      console.warn("WebGL not available — dove will not be chroma-keyed.");
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // Full-screen quad
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    // Flip Y to match video orientation (WebGL is bottom-up by default)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
      gl.STATIC_DRAW,
    );
    const aUV = gl.getAttribLocation(prog, "a_texCoord");
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

    // Texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uThreshold = gl.getUniformLocation(prog, "u_threshold");
    const uRatio = gl.getUniformLocation(prog, "u_ratio");
    const uFalloff = gl.getUniformLocation(prog, "u_falloff");
    gl.uniform1f(uThreshold, greenThreshold);
    gl.uniform1f(uRatio, greenRatio);
    gl.uniform1f(uFalloff, falloff);

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let animId = 0;
    let alive = true;

    function render() {
      if (!alive || !gl || !video || !canvas) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth)
          canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight)
          canvas.height = video.videoHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        try {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video,
          );
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        } catch {
          // Video frame not yet decodable — try next tick
        }
      }
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(animId);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(uvBuf);
      gl.deleteTexture(tex);
    };
  }, [greenThreshold, greenRatio, falloff, playbackRate]);

  return (
    <div className={className} style={style}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          transform: canvasTransform,
        }}
      />
    </div>
  );
}
