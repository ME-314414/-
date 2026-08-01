import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./Grainient.css";

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);
  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;
  float amplitude=uWarpAmplitude/max(uWarpStrength,0.001);
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*uWarpFrequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(uWarpFrequency*1.5)+warpTime)/(amplitude*0.5);
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  float blendX=(tuv*Rot(radians(uBlendAngle))).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  vec3 layer1=mix(uColor3,uColor2,S(edge0,edge1,blendX));
  vec3 layer2=mix(uColor2,uColor1,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(0.5-b+s,-0.3-b-s,tuv.y));
  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;
  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  o=vec4(clamp(col,0.0,1.0),1.0);
}
void main(){vec4 o=vec4(0.0);mainImage(o,gl_FragCoord.xy);fragColor=o;}
`;

const ctxMap = new WeakMap();

export default function Grainient({
  timeSpeed = 0.25, colorBalance = 0, warpStrength = 1, warpFrequency = 5,
  warpSpeed = 2, warpAmplitude = 50, blendAngle = 0, blendSoftness = 0.05,
  rotationAmount = 500, noiseScale = 2, grainAmount = 0.1, grainScale = 2,
  grainAnimated = false, contrast = 1.5, gamma = 1, saturation = 1,
  centerX = 0, centerY = 0, zoom = 0.9, color1 = "#FF9FFC",
  color2 = "#5227FF", color3 = "#B497CF", className = ""
}) {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isReady) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsReady(true);
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileRenderer = window.innerWidth <= 767;
    const dpr = mobileRenderer ? 0.65 : window.innerWidth >= 1440 ? 0.8 : Math.min(window.devicePixelRatio || 1, 1);
    const renderer = new Renderer({ webgl: 2, alpha: true, antialias: false, dpr });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    container.appendChild(canvas);
    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex, fragment, uniforms: {
      iTime:{value:0},iResolution:{value:new Float32Array([1,1])},uTimeSpeed:{value:.25},uColorBalance:{value:0},
      uWarpStrength:{value:1},uWarpFrequency:{value:5},uWarpSpeed:{value:2},uWarpAmplitude:{value:50},
      uBlendAngle:{value:0},uBlendSoftness:{value:.05},uRotationAmount:{value:500},uNoiseScale:{value:2},
      uGrainAmount:{value:.1},uGrainScale:{value:2},uGrainAnimated:{value:0},uContrast:{value:1.5},
      uGamma:{value:1},uSaturation:{value:1},uCenterOffset:{value:new Float32Array([0,0])},uZoom:{value:.9},
      uColor1:{value:new Float32Array([1,1,1])},uColor2:{value:new Float32Array([1,1,1])},uColor3:{value:new Float32Array([1,1,1])}
    }});
    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });
    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      program.uniforms.iResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.iResolution.value[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();
    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();
    let lastFrame = 0;
    const frameInterval = 1000 / (mobileRenderer ? 20 : 30);
    const loop = (t) => {
      raf=requestAnimationFrame(loop);
      if (t-lastFrame < frameInterval) return;
      lastFrame=t;
      program.uniforms.iTime.value=(t-t0)*.001;
      renderer.render({scene:mesh});
    };
    const tryStart = () => { if (!reducedMotion && isVisible && isPageVisible && raf===0) raf=requestAnimationFrame(loop); };
    const tryStop = () => { if (raf!==0){cancelAnimationFrame(raf);raf=0;} };
    const io = new IntersectionObserver(([entry]) => { isVisible=entry.isIntersecting;isVisible?tryStart():tryStop(); }, {threshold:0});
    io.observe(container);
    const onVisibility = () => { isPageVisible=!document.hidden;isPageVisible?tryStart():tryStop(); };
    document.addEventListener("visibilitychange",onVisibility);
    tryStart();
    return () => { tryStop();ro.disconnect();io.disconnect();document.removeEventListener("visibilitychange",onVisibility);ctxMap.delete(container);canvas.remove(); };
  }, [isReady]);

  useEffect(() => {
    const ctx = containerRef.current && ctxMap.get(containerRef.current);
    if (!ctx) return;
    const u=ctx.program.uniforms;
    u.uTimeSpeed.value=timeSpeed;u.uColorBalance.value=colorBalance;u.uWarpStrength.value=warpStrength;
    u.uWarpFrequency.value=warpFrequency;u.uWarpSpeed.value=warpSpeed;u.uWarpAmplitude.value=warpAmplitude;
    u.uBlendAngle.value=blendAngle;u.uBlendSoftness.value=blendSoftness;u.uRotationAmount.value=rotationAmount;
    u.uNoiseScale.value=noiseScale;u.uGrainAmount.value=grainAmount;u.uGrainScale.value=grainScale;
    u.uGrainAnimated.value=grainAnimated?1:0;u.uContrast.value=contrast;u.uGamma.value=gamma;
    u.uSaturation.value=saturation;u.uCenterOffset.value=new Float32Array([centerX,centerY]);u.uZoom.value=zoom;
    u.uColor1.value=new Float32Array(hexToRgb(color1));u.uColor2.value=new Float32Array(hexToRgb(color2));u.uColor3.value=new Float32Array(hexToRgb(color3));
  }, [isReady,timeSpeed,colorBalance,warpStrength,warpFrequency,warpSpeed,warpAmplitude,blendAngle,blendSoftness,rotationAmount,noiseScale,grainAmount,grainScale,grainAnimated,contrast,gamma,saturation,centerX,centerY,zoom,color1,color2,color3]);

  return <div ref={containerRef} className={`grainient-container ${className}`.trim()} />;
}
