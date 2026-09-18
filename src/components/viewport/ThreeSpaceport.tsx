import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  NasaAsset,
  VisualizationMode,
  SpatialView,
  SpacecraftComponent,
} from '../../types';
import {
  buildJwst,
  buildIss,
  buildPerseverance,
  buildHubble,
  buildApolloLm,
  buildEarthGlobe,
  BuiltAsset,
} from './ThreeAssetBuilder';
import { soundManager } from '../../utils/sound';

interface ThreeSpaceportProps {
  currentAsset: NasaAsset;
  visualizationMode: VisualizationMode;
  spatialView: SpatialView;
  explodedRatio: number; // 0.0 to 1.0
  selectedComponentId: string | null;
  onSelectComponent: (component: SpacecraftComponent | null) => void;
  simulationPlaying: boolean;
  simulationSpeed: number; // 1, 10, 100, 1000
  onFpsUpdate?: (fps: number, drawCalls: number, triangles: number) => void;
  isLanding?: boolean;
}

export const ThreeSpaceport: React.FC<ThreeSpaceportProps> = ({
  currentAsset,
  visualizationMode,
  spatialView,
  explodedRatio,
  selectedComponentId,
  onSelectComponent,
  simulationPlaying,
  simulationSpeed,
  onFpsUpdate,
  isLanding = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number>(0);

  // Asset references
  const currentBuiltAssetRef = useRef<BuiltAsset | null>(null);
  const assetContainerRef = useRef<THREE.Group | null>(null);
  const earthUpdateRef = useRef<((delta: number) => void) | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);

  // Camera animation interpolation state
  const cameraState = useRef({
    currentPos: new THREE.Vector3(0, 5, 20),
    targetPos: new THREE.Vector3(0, 3, 16),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isUserInteracting: false,
    orbitTheta: 0.8,
    orbitPhi: 1.2,
    orbitRadius: 18,
    panOffset: new THREE.Vector3(0, 0, 0),
  });

  // Mouse interaction state
  const mouseState = useRef({
    isPointerDown: false,
    button: 0,
    lastX: 0,
    lastY: 0,
  });

  const [hoveredCompName, setHoveredCompName] = useState<string | null>(null);

  // Dynamic 3D-to-2D projected pins for Exploded View
  interface ComponentPin {
    id: string;
    name: string;
    subsystem: string;
    temperatureC: number;
    screenX: number;
    screenY: number;
    analyticalColor: string;
  }
  const [componentPins, setComponentPins] = useState<ComponentPin[]>([]);

  // Keep references to latest state for the 60-120 FPS render loop
  const currentAssetRef = useRef(currentAsset);
  currentAssetRef.current = currentAsset;
  const explodedRatioRef = useRef(explodedRatio);
  explodedRatioRef.current = explodedRatio;
  const selectedComponentIdRef = useRef(selectedComponentId);
  selectedComponentIdRef.current = selectedComponentId;
  const isLandingRef = useRef(isLanding);
  isLandingRef.current = isLanding;

  // -------------------------------------------------------------
  // 1. SCENE INITIALIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.0035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2500
    );
    camera.position.set(0, 5, 22);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting (NASA Deep Space Rig)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambientLight);

    // Primary Directional Sunlight
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.4);
    sunLight.position.set(45, 30, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Deep-space subtle blue rim light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-40, -15, -30);
    scene.add(rimLight);

    // Deep Starfield (3,000 points)
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfde68a),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 250 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Background Earth & Atmosphere
    const earthObj = buildEarthGlobe();
    earthObj.earthGroup.position.set(-65, -25, -120);
    scene.add(earthObj.earthGroup);
    earthUpdateRef.current = earthObj.update;
    earthGroupRef.current = earthObj.earthGroup;

    // Asset Container Group
    const assetContainer = new THREE.Group();
    assetContainer.name = 'ACTIVE_ASSET_CONTAINER';
    scene.add(assetContainer);
    assetContainerRef.current = assetContainer;

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation & Render Loop with FPS Counter
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 0.5) {
        const currentFps = Math.round((frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
        if (onFpsUpdate && renderer) {
          onFpsUpdate(currentFps, renderer.info.render.calls, renderer.info.render.triangles);
        }
      }

      // Earth rotation update
      if (earthUpdateRef.current) {
        earthUpdateRef.current(delta);
      }

      // Starfield subtle cosmic drift
      starField.rotation.y += delta * 0.001;

      // Spacecraft orbital idle drift or simulation propagation
      if (assetContainerRef.current) {
        if (simulationPlaying) {
          const simRate = 0.05 * (simulationSpeed === 1 ? 1 : simulationSpeed === 10 ? 2.5 : simulationSpeed === 100 ? 6 : 14);
          assetContainerRef.current.rotation.y += delta * simRate;
        } else if (!cameraState.current.isUserInteracting) {
          assetContainerRef.current.rotation.y += delta * 0.02;
        }
      }

      // Smooth Camera Interpolation
      const cs = cameraState.current;
      if (!cs.isUserInteracting) {
        cs.currentPos.lerp(cs.targetPos, 0.06);
        cs.currentLookAt.lerp(cs.targetLookAt, 0.06);
        camera.position.copy(cs.currentPos);
        camera.lookAt(cs.currentLookAt);
      } else {
        // Orbit update when user is dragging
        const cx = cs.panOffset.x + cs.orbitRadius * Math.sin(cs.orbitPhi) * Math.sin(cs.orbitTheta);
        const cy = cs.panOffset.y + cs.orbitRadius * Math.cos(cs.orbitPhi);
        const cz = cs.panOffset.z + cs.orbitRadius * Math.sin(cs.orbitPhi) * Math.cos(cs.orbitTheta);
        camera.position.set(cx, cy, cz);
        camera.lookAt(cs.panOffset);
        cs.currentPos.copy(camera.position);
        cs.currentLookAt.copy(cs.panOffset);
      }

      // Calculate 3D-to-2D projected positions for Exploded View Component Labels
      if (frameCount % 2 === 0) {
        if (explodedRatioRef.current > 0.05 && currentBuiltAssetRef.current && camera && container && !isLandingRef.current) {
          const rect = container.getBoundingClientRect();
          const newPins: ComponentPin[] = [];
          const built = currentBuiltAssetRef.current;

          currentAssetRef.current.components.forEach((comp) => {
            const meshes = built.componentMeshes.get(comp.id);
            if (meshes && meshes.length > 0) {
              const center = new THREE.Vector3();
              meshes.forEach((m) => {
                const wp = new THREE.Vector3();
                m.getWorldPosition(wp);
                center.add(wp);
              });
              center.divideScalar(meshes.length);

              const proj = center.clone().project(camera);
              // In front of camera and inside screen viewport bounds
              if (proj.z > -1.0 && proj.z < 1.0) {
                const sx = (proj.x * 0.5 + 0.5) * rect.width;
                const sy = (-(proj.y * 0.5) + 0.5) * rect.height;
                if (sx >= 20 && sx <= rect.width - 20 && sy >= 20 && sy <= rect.height - 20) {
                  newPins.push({
                    id: comp.id,
                    name: comp.name,
                    subsystem: comp.subsystem,
                    temperatureC: comp.temperatureC,
                    analyticalColor: comp.analyticalColor || '#38bdf8',
                    screenX: Math.round(sx),
                    screenY: Math.round(sy),
                  });
                }
              }
            }
          });
          setComponentPins(newPins);
        } else if (componentPins.length > 0) {
          setComponentPins([]);
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // -------------------------------------------------------------
  // 2. LOAD/SWITCH NASA SPACECRAFT ASSET
  // -------------------------------------------------------------
  useEffect(() => {
    const container = assetContainerRef.current;
    if (!container) return;

    // Clear existing asset
    while (container.children.length > 0) {
      container.remove(container.children[0]);
    }

    let built: BuiltAsset;
    switch (currentAsset.id) {
      case 'jwst':
        built = buildJwst(currentAsset.components);
        break;
      case 'iss':
        built = buildIss(currentAsset.components);
        break;
      case 'perseverance':
        built = buildPerseverance(currentAsset.components);
        break;
      case 'hubble':
        built = buildHubble(currentAsset.components);
        break;
      case 'apollo-lm':
        built = buildApolloLm(currentAsset.components);
        break;
      default:
        built = buildJwst(currentAsset.components);
        break;
    }

    built.rootGroup.scale.setScalar(currentAsset.modelScale);
    container.add(built.rootGroup);
    currentBuiltAssetRef.current = built;

    // Update camera orbit distance
    cameraState.current.orbitRadius = currentAsset.defaultCameraDistance;

    // Reset rotation
    container.rotation.set(0, 0, 0);

    // Trigger sound
    soundManager.playModeTransition();
  }, [currentAsset.id]);

  // -------------------------------------------------------------
  // 3. EXPLODED VIEW INTERPOLATION
  // -------------------------------------------------------------
  useEffect(() => {
    const built = currentBuiltAssetRef.current;
    if (!built) return;

    built.baseTransforms.forEach((base, mesh) => {
      const explodeOffset: THREE.Vector3 = mesh.userData.explodeOffset;
      if (explodeOffset) {
        // Calculate new target position: base + offset * ratio
        const targetX = base.pos.x + explodeOffset.x * explodedRatio;
        const targetY = base.pos.y + explodeOffset.y * explodedRatio;
        const targetZ = base.pos.z + explodeOffset.z * explodedRatio;
        mesh.position.set(targetX, targetY, targetZ);
      }
    });
  }, [explodedRatio]);

  // -------------------------------------------------------------
  // 4. ARTIFACT LAB SHADER / VISUALIZATION MODE SWITCHER
  // -------------------------------------------------------------
  useEffect(() => {
    const built = currentBuiltAssetRef.current;
    if (!built) return;

    built.baseTransforms.forEach((_base, mesh) => {
      const defaultMat = mesh.userData.defaultMaterial;
      const analyticalColor = mesh.userData.analyticalColor || '#38bdf8';
      const tempC = mesh.userData.temperatureC ?? -100;

      switch (visualizationMode) {
        case 'REALISTIC':
          mesh.material = defaultMat;
          break;

        case 'WIREFRAME':
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.75,
          });
          break;

        case 'XRAY':
          mesh.material = new THREE.ShaderMaterial({
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                vec3 viewDir = normalize(-vPosition);
                float edge = 1.0 - abs(dot(vNormal, viewDir));
                float glow = pow(edge, 2.2);
                gl_FragColor = vec4(0.12, 0.65, 0.95, 0.45 * glow + 0.12);
              }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          break;

        case 'INFRARED':
          // False color infrared gradient
          mesh.material = new THREE.ShaderMaterial({
            vertexShader: `
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vNormal;
              void main() {
                float intensity = clamp(dot(vNormal, vec3(0.5, 0.8, 0.5)), 0.0, 1.0);
                // IR color gradient: blue -> purple -> magenta -> yellow -> white
                vec3 col = mix(vec3(0.1, 0.0, 0.4), vec3(0.85, 0.1, 0.4), intensity);
                if (intensity > 0.6) {
                  col = mix(col, vec3(1.0, 0.9, 0.2), (intensity - 0.6) * 2.5);
                }
                gl_FragColor = vec4(col, 1.0);
              }
            `,
          });
          break;

        case 'THERMAL':
          // Kelvin temperature map
          // Normalizes temp (-250C to +150C)
          const normT = Math.min(Math.max((tempC + 250) / 400, 0), 1);
          let thermalHex = 0x0284c7; // Cryo blue
          if (normT > 0.75) thermalHex = 0xef4444; // Hot red
          else if (normT > 0.5) thermalHex = 0xf59e0b; // Warm amber
          else if (normT > 0.3) thermalHex = 0x10b981; // Green
          else if (normT > 0.15) thermalHex = 0x06b6d4; // Cyan

          mesh.material = new THREE.MeshStandardMaterial({
            color: thermalHex,
            roughness: 0.3,
            metalness: 0.5,
            emissive: thermalHex,
            emissiveIntensity: 0.25,
          });
          break;

        case 'ANALYTICAL':
          // Colored by subsystem
          mesh.material = new THREE.MeshStandardMaterial({
            color: analyticalColor,
            roughness: 0.4,
            metalness: 0.6,
            emissive: analyticalColor,
            emissiveIntensity: 0.2,
          });
          break;
      }
    });

    soundManager.playModeTransition();
  }, [visualizationMode]);

  // -------------------------------------------------------------
  // 5. SPATIAL VIEW CAMERA CONTROLLER
  // -------------------------------------------------------------
  useEffect(() => {
    const cs = cameraState.current;
    const dist = currentAsset.defaultCameraDistance;

    switch (spatialView) {
      case 'EARTH':
        // Pull way back to show Earth and spacecraft together
        cs.targetPos.set(-25, 20, 70);
        cs.targetLookAt.set(-30, -5, -40);
        break;

      case 'ORBIT':
        // Polar/overhead mechanical view
        cs.targetPos.set(0, dist * 1.8, dist * 0.3);
        cs.targetLookAt.set(0, 0, 0);
        break;

      case 'MISSION':
        // Isometric survey angle
        cs.targetPos.set(dist * 1.2, dist * 0.8, dist * 1.2);
        cs.targetLookAt.set(0, 0, 0);
        break;

      case 'SPACECRAFT':
        // Direct central close view
        cs.targetPos.set(0, dist * 0.25, dist * 1.05);
        cs.targetLookAt.set(0, 0, 0);
        break;

      case 'COMPONENT':
        // Zoom closer onto active component or origin
        cs.targetPos.set(0, dist * 0.15, dist * 0.65);
        cs.targetLookAt.set(0, 0, 0);
        break;
    }
  }, [spatialView, currentAsset]);

  // -------------------------------------------------------------
  // 6. RAYCASTING & COMPONENT INTERACTION
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    mouseState.current.isPointerDown = true;
    mouseState.current.button = e.button;
    mouseState.current.lastX = e.clientX;
    mouseState.current.lastY = e.clientY;
    cameraState.current.isUserInteracting = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    if (mouseState.current.isPointerDown) {
      const dx = e.clientX - mouseState.current.lastX;
      const dy = e.clientY - mouseState.current.lastY;
      mouseState.current.lastX = e.clientX;
      mouseState.current.lastY = e.clientY;

      const cs = cameraState.current;
      if (mouseState.current.button === 0) {
        // Orbit rotation
        cs.orbitTheta -= dx * 0.008;
        cs.orbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cs.orbitPhi - dy * 0.008));
      } else if (mouseState.current.button === 2) {
        // Pan
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();

        const up = new THREE.Vector3().copy(camera.up).normalize();
        cs.panOffset.addScaledVector(right, -dx * 0.015);
        cs.panOffset.addScaledVector(up, dy * 0.015);
      }
      return;
    }

    // Hover raycast for scientific tooltips
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    if (assetContainerRef.current) {
      const hits = raycaster.intersectObjects(assetContainerRef.current.children, true);
      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        if (hitMesh.userData && hitMesh.userData.componentName) {
          setHoveredCompName(hitMesh.userData.componentName);
          return;
        }
      }
    }
    setHoveredCompName(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = Math.abs(e.clientX - mouseState.current.lastX);
    const dy = Math.abs(e.clientY - mouseState.current.lastY);

    // If small motion, treat as click
    if (dx < 5 && dy < 5 && mouseState.current.button === 0) {
      performClickRaycast(e.clientX, e.clientY);
    }

    mouseState.current.isPointerDown = false;
    // Release interaction lock after short delay to let user observe current perspective
    setTimeout(() => {
      cameraState.current.isUserInteracting = false;
    }, 1500);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cs = cameraState.current;
    cs.isUserInteracting = true;
    cs.orbitRadius = Math.max(3, Math.min(120, cs.orbitRadius + e.deltaY * 0.02));
    setTimeout(() => {
      cs.isUserInteracting = false;
    }, 1500);
  };

  const performClickRaycast = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera || !assetContainerRef.current) return;

    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const hits = raycaster.intersectObjects(assetContainerRef.current.children, true);
    if (hits.length > 0) {
      const hitMesh = hits[0].object as THREE.Mesh;
      const compId = hitMesh.userData.componentId;
      if (compId) {
        const found = currentAsset.components.find((c) => c.id === compId);
        if (found) {
          onSelectComponent(found);
          soundManager.playClick();
          return;
        }
      }
    }
    // Clicked into empty space
    onSelectComponent(null);
  };

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    const cs = cameraState.current;
    const dist = currentAsset.defaultCameraDistance;
    cs.orbitRadius = dist;
    cs.orbitTheta = 0.8;
    cs.orbitPhi = 1.2;
    cs.panOffset.set(0, 0, 0);
    cs.targetPos.set(0, dist * 0.3, dist);
    cs.targetLookAt.set(0, 0, 0);
    cs.isUserInteracting = false;
    soundManager.playClick();
  }, [currentAsset]);

  return (
    <div
      ref={containerRef}
      id="spaceport-3d-viewport"
      className="relative w-full h-full cursor-grab active:cursor-grabbing outline-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Subtle hover callout pill */}
      {hoveredCompName && !isLanding && componentPins.length === 0 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 px-3 py-1.5 rounded-md glass-panel-accent text-xs font-mono-sci text-cyan-300 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>INSPECT: {hoveredCompName}</span>
        </div>
      )}

      {/* Floating Exploded View Component Name Labels with Pinned Cards */}
      {!isLanding && componentPins.map((pin) => {
        const isSelected = selectedComponentId === pin.id;
        const comp = currentAsset.components.find((c) => c.id === pin.id);

        return (
          <div
            key={pin.id}
            className="absolute z-20 pointer-events-auto cursor-pointer transition-transform duration-100 ease-out group"
            style={{
              left: `${pin.screenX}px`,
              top: `${pin.screenY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (comp) {
                onSelectComponent(comp);
                soundManager.playClick();
              }
            }}
          >
            {/* Target Reticle Pin */}
            <div className="relative flex items-center justify-center">
              <span
                className={`absolute w-7 h-7 rounded-full opacity-60 animate-ping`}
                style={{ backgroundColor: isSelected ? '#38bdf8' : pin.analyticalColor }}
              />
              <span
                className="w-3 h-3 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125"
                style={{ backgroundColor: pin.analyticalColor }}
              />

              {/* Floating Glassmorphic Component Card */}
              <div
                className={`absolute left-5 top-[-22px] whitespace-nowrap px-2.5 py-1.5 rounded-xl backdrop-blur-xl border transition-all duration-150 shadow-2xl flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-400 shadow-cyan-950/60 scale-105'
                    : 'bg-slate-950/85 border-slate-700/60 group-hover:border-cyan-400 group-hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-bold font-mono-sci border"
                    style={{
                      backgroundColor: `${pin.analyticalColor}25`,
                      color: pin.analyticalColor,
                      borderColor: `${pin.analyticalColor}60`,
                    }}
                  >
                    {pin.subsystem}
                  </span>
                  <span className="text-xs font-bold font-mono-sci text-slate-100 group-hover:text-cyan-300">
                    {pin.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono-sci text-slate-400">
                  <span>
                    TEMP:{' '}
                    <strong className={pin.temperatureC < 0 ? 'text-sky-300' : 'text-amber-300'}>
                      {pin.temperatureC > 0 ? `+${pin.temperatureC}` : pin.temperatureC}°C
                    </strong>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-400 font-semibold group-hover:underline">CLICK TO INSPECT</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Floating 3D Navigation Controls Overlay */}
      {!isLanding && (
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
          <button
            id="btn-reset-camera"
            onClick={handleResetCamera}
            className="px-3 py-1.5 rounded glass-panel-subtle hover:glass-panel-accent text-xs font-mono-sci text-slate-300 hover:text-cyan-300 transition-all border border-slate-700/50 hover:border-cyan-500/40 flex items-center gap-1.5 active:scale-95"
            title="Reset to default mission angle"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            RESET CAMERA
          </button>

          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded glass-panel-subtle text-[11px] font-mono-sci text-slate-400 border border-slate-800">
            <span>L-DRAG: ORBIT</span>
            <span className="text-slate-600">|</span>
            <span>R-DRAG: PAN</span>
            <span className="text-slate-600">|</span>
            <span>SCROLL: ZOOM</span>
          </div>
        </div>
      )}
    </div>
  );
};
