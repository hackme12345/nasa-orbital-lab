import * as THREE from 'three';
import { SpacecraftComponent } from '../../types';

export interface BuiltAsset {
  rootGroup: THREE.Group;
  componentMeshes: Map<string, THREE.Mesh[]>;
  baseTransforms: Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>;
}

// Procedural textures generator for authentic scientific materials
function createSolarCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep dark blue solar background
  ctx.fillStyle = '#061325';
  ctx.fillRect(0, 0, 512, 512);

  // Photovoltaic cell grid lines
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;

  const gridSize = 32;
  for (let x = 0; x < 512; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Silver busbar conductors
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(128, 0); ctx.lineTo(128, 512);
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(384, 0); ctx.lineTo(384, 512);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createFoilBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Multi-scale wrinkled Kapton foil creases
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 3 + Math.random() * 18;
    const val = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine angular creases
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 70; i++) {
    const x1 = Math.random() * 512;
    const y1 = Math.random() * 512;
    const len = 20 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#1f2937';
  for (let x = 0; x < 128; x += 16) {
    for (let y = 0; y < 128; y += 16) {
      if ((x / 16 + y / 16) % 2 === 0) {
        ctx.fillRect(x, y, 16, 16);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

const solarTexture = createSolarCellTexture();
const foilBumpTexture = createFoilBumpTexture();
const carbonFiberTexture = createCarbonFiberTexture();

// Helper to tag meshes for exploded view and component picking
function tagMesh(
  mesh: THREE.Mesh,
  component: SpacecraftComponent,
  componentMeshes: Map<string, THREE.Mesh[]>,
  baseTransforms: Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>
) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData = {
    componentId: component.id,
    componentName: component.name,
    subsystem: component.subsystem,
    explodeOffset: new THREE.Vector3(...component.explodeOffset),
    analyticalColor: component.analyticalColor,
    temperatureC: component.temperatureC,
    defaultMaterial: mesh.material,
  };

  baseTransforms.set(mesh, {
    pos: mesh.position.clone(),
    rot: mesh.rotation.clone(),
    scale: mesh.scale.clone(),
  });

  if (!componentMeshes.has(component.id)) {
    componentMeshes.set(component.id, []);
  }
  componentMeshes.get(component.id)!.push(mesh);
}

// -------------------------------------------------------------
// 1. JAMES WEBB SPACE TELESCOPE (JWST) BUILDER - HIGH-END PBR
// -------------------------------------------------------------
export function buildJwst(components: SpacecraftComponent[]): BuiltAsset {
  const root = new THREE.Group();
  root.name = 'JWST_ROOT';
  const componentMeshes = new Map<string, THREE.Mesh[]>();
  const baseTransforms = new Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>();

  const compMap = new Map(components.map((c) => [c.id, c]));

  // Physically Based Rendering (PBR) Materials
  // 1. Vapor-Deposited Pure Gold Mirrors (100nm gold layer over beryllium)
  const goldMirrorMat = new THREE.MeshStandardMaterial({
    color: 0xffd215,
    metalness: 0.98,
    roughness: 0.035,
    bumpMap: foilBumpTexture,
    bumpScale: 0.0006,
  });

  // Beryllium substrate backing structure
  const berylliumBackingMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.85,
    roughness: 0.45,
  });

  // 2. High-Temperature Kapton Sunshield - Solar Facing (Layer 1)
  const kaptonSunFacingMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Rich amber polyimide
    metalness: 0.88,
    roughness: 0.22,
    bumpMap: foilBumpTexture,
    bumpScale: 0.035,
    side: THREE.DoubleSide,
  });

  // 3. Cryogenic Kapton Sunshield - Cold Side (Layer 5) & Intermediate Aluminum
  const kaptonColdSideMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.94,
    roughness: 0.18,
    bumpMap: foilBumpTexture,
    bumpScale: 0.025,
    side: THREE.DoubleSide,
  });

  const aluminumFoilMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
    bumpMap: foilBumpTexture,
    bumpScale: 0.03,
    side: THREE.DoubleSide,
  });

  // 4. Spacecraft High-Modulus Carbon Fiber Composite (Backplane & Tripod)
  const carbonStrutMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    map: carbonFiberTexture,
    metalness: 0.3,
    roughness: 0.65,
  });

  // 5. Spacecraft Bus & Gold MLI (Multi-Layer Insulation)
  const busMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.88,
    roughness: 0.25,
  });

  const goldMliMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    metalness: 0.9,
    roughness: 0.3,
    bumpMap: foilBumpTexture,
    bumpScale: 0.04,
  });

  // 6. Photovoltaic Solar Array
  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTexture,
    metalness: 0.65,
    roughness: 0.2,
  });

  // =========================================================================
  // A. PRIMARY MIRROR ASSEMBLY (18 Authentic Hexagonal Gold Segments)
  // =========================================================================
  const primComp = compMap.get('primary-mirror');
  if (primComp) {
    // Hexagonal geometry with chamfered bevels
    // Radius of circumscribed circle ~0.76m gives flat-to-flat ~1.32m
    const hexRadius = 0.76;
    const hexHeight = 0.08;
    const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius * 0.98, hexHeight, 6);
    hexGeo.rotateX(Math.PI / 2);

    // Beryllium backing pad
    const padGeo = new THREE.CylinderGeometry(hexRadius * 0.85, hexRadius * 0.9, 0.08, 6);
    padGeo.rotateX(Math.PI / 2);

    // Exact geometric positions for the 18 segments in a honeycomb ring:
    // Distance between centers: D = sqrt(3) * 0.762 ~= 1.32
    const D = 1.34;
    const hexPositions: [number, number][] = [
      // Inner Ring (6 segments)
      [D * Math.cos(0), D * Math.sin(0)],
      [D * Math.cos(Math.PI / 3), D * Math.sin(Math.PI / 3)],
      [D * Math.cos((2 * Math.PI) / 3), D * Math.sin((2 * Math.PI) / 3)],
      [D * Math.cos(Math.PI), D * Math.sin(Math.PI)],
      [D * Math.cos((4 * Math.PI) / 3), D * Math.sin((4 * Math.PI) / 3)],
      [D * Math.cos((5 * Math.PI) / 3), D * Math.sin((5 * Math.PI) / 3)],

      // Outer Ring - 6 Corner Hexagons (distance 2*D)
      [2 * D * Math.cos(0), 2 * D * Math.sin(0)],
      [2 * D * Math.cos(Math.PI / 3), 2 * D * Math.sin(Math.PI / 3)],
      [2 * D * Math.cos((2 * Math.PI) / 3), 2 * D * Math.sin((2 * Math.PI) / 3)],
      [2 * D * Math.cos(Math.PI), 2 * D * Math.sin(Math.PI)],
      [2 * D * Math.cos((4 * Math.PI) / 3), 2 * D * Math.sin((4 * Math.PI) / 3)],
      [2 * D * Math.cos((5 * Math.PI) / 3), 2 * D * Math.sin((5 * Math.PI) / 3)],

      // Outer Ring - 6 Edge-Center Hexagons (distance sqrt(3)*D at 30 deg offsets)
      [Math.sqrt(3) * D * Math.cos(Math.PI / 6), Math.sqrt(3) * D * Math.sin(Math.PI / 6)],
      [Math.sqrt(3) * D * Math.cos(Math.PI / 2), Math.sqrt(3) * D * Math.sin(Math.PI / 2)],
      [Math.sqrt(3) * D * Math.cos((5 * Math.PI) / 6), Math.sqrt(3) * D * Math.sin((5 * Math.PI) / 6)],
      [Math.sqrt(3) * D * Math.cos((7 * Math.PI) / 6), Math.sqrt(3) * D * Math.sin((7 * Math.PI) / 6)],
      [Math.sqrt(3) * D * Math.cos((3 * Math.PI) / 2), Math.sqrt(3) * D * Math.sin((3 * Math.PI) / 2)],
      [Math.sqrt(3) * D * Math.cos((11 * Math.PI) / 6), Math.sqrt(3) * D * Math.sin((11 * Math.PI) / 6)],
    ];

    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(0, 1.35, 0.4);

    hexPositions.forEach(([x, y]) => {
      // 1. Golden Optical Mirror Face
      const segMesh = new THREE.Mesh(hexGeo, goldMirrorMat);
      segMesh.position.set(x, y, 0);
      mirrorGroup.add(segMesh);
      tagMesh(segMesh, primComp, componentMeshes, baseTransforms);

      // 2. Beryllium Substrate Backing & Actuator Triad
      const padMesh = new THREE.Mesh(padGeo, berylliumBackingMat);
      padMesh.position.set(x, y, -0.07);
      mirrorGroup.add(padMesh);
      tagMesh(padMesh, primComp, componentMeshes, baseTransforms);

      // 3. Actuator pin mounts
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 6);
      pinGeo.rotateX(Math.PI / 2);
      for (let p = 0; p < 3; p++) {
        const pinAngle = (p * 2 * Math.PI) / 3;
        const pinMesh = new THREE.Mesh(pinGeo, busMat);
        pinMesh.position.set(x + 0.3 * Math.cos(pinAngle), y + 0.3 * Math.sin(pinAngle), -0.2);
        mirrorGroup.add(pinMesh);
        tagMesh(pinMesh, primComp, componentMeshes, baseTransforms);
      }
    });

    // Central Baffle Cone / Cassegrain Light Tube (Center opening)
    const baffleGeo = new THREE.CylinderGeometry(0.55, 0.48, 0.85, 24, 1, true);
    baffleGeo.rotateX(Math.PI / 2);
    const baffleMesh = new THREE.Mesh(baffleGeo, carbonStrutMat);
    baffleMesh.position.set(0, 0, 0.25);
    mirrorGroup.add(baffleMesh);
    tagMesh(baffleMesh, primComp, componentMeshes, baseTransforms);

    // Primary Mirror Backplane Support Structure (PMSS)
    const backplaneGeo = new THREE.CylinderGeometry(3.6, 3.4, 0.25, 6);
    backplaneGeo.rotateX(Math.PI / 2);
    const backplaneMesh = new THREE.Mesh(backplaneGeo, carbonStrutMat);
    backplaneMesh.position.set(0, 0, -0.32);
    mirrorGroup.add(backplaneMesh);
    tagMesh(backplaneMesh, primComp, componentMeshes, baseTransforms);

    root.add(mirrorGroup);
  }

  // =========================================================================
  // B. SECONDARY MIRROR ASSEMBLY & DEPLOYABLE TRIPOD
  // =========================================================================
  const secComp = compMap.get('secondary-mirror');
  if (secComp) {
    const secGroup = new THREE.Group();
    secGroup.position.set(0, 1.35, 4.6);

    // Secondary Reflector (Convex Circular Gold Mirror)
    const secMirrorGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.1, 24);
    secMirrorGeo.rotateX(Math.PI / 2);
    const secMirrorMesh = new THREE.Mesh(secMirrorGeo, goldMirrorMat);
    secMirrorMesh.position.set(0, 0, 0);
    secGroup.add(secMirrorMesh);
    tagMesh(secMirrorMesh, secComp, componentMeshes, baseTransforms);

    // Secondary Mirror Support Hub & Baffle ring
    const secHubGeo = new THREE.CylinderGeometry(0.5, 0.48, 0.18, 24);
    secHubGeo.rotateX(Math.PI / 2);
    const secHubMesh = new THREE.Mesh(secHubGeo, carbonStrutMat);
    secHubMesh.position.set(0, 0, -0.1);
    secGroup.add(secHubMesh);
    tagMesh(secHubMesh, secComp, componentMeshes, baseTransforms);

    // 3 Deployable Carbon-Composite Struts meeting at the hub
    const tripodAngles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
    tripodAngles.forEach((ang) => {
      const baseX = 2.65 * Math.cos(ang);
      const baseY = 1.35 + 2.65 * Math.sin(ang);
      const baseZ = 0.4;

      const pStart = new THREE.Vector3(baseX, baseY, baseZ);
      const pEnd = new THREE.Vector3(0, 1.35, 4.5);
      const dir = new THREE.Vector3().subVectors(pEnd, pStart);
      const len = dir.length();

      const strutGeo = new THREE.CylinderGeometry(0.045, 0.045, len, 12);
      const strutMesh = new THREE.Mesh(strutGeo, carbonStrutMat);
      strutMesh.position.copy(pStart).addScaledVector(dir, 0.5);
      strutMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      root.add(strutMesh);
      tagMesh(strutMesh, secComp, componentMeshes, baseTransforms);

      // Strut Hinge Mechanism
      const hingeGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const hingeMesh = new THREE.Mesh(hingeGeo, busMat);
      hingeMesh.position.copy(pStart).addScaledVector(dir, 0.5);
      root.add(hingeMesh);
      tagMesh(hingeMesh, secComp, componentMeshes, baseTransforms);
    });

    root.add(secGroup);
  }

  // =========================================================================
  // C. DETAILED 5-LAYER CONTOURED KAPTON SUNSHIELD
  // =========================================================================
  const sunComp = compMap.get('sunshield');
  if (sunComp) {
    // Authentic Kite Contour with tension curvature (21.2m long x 14.2m wide)
    const createContouredKiteGeometry = (layerIdx: number): THREE.BufferGeometry => {
      // 2D Shape Profile of the JWST Sunshield
      const shape = new THREE.Shape();
      const lengthScale = 1.0 - layerIdx * 0.025;
      const widthScale = 1.0 - layerIdx * 0.025;

      const tipFront = 7.6 * lengthScale;
      const tipAft = -6.8 * lengthScale;
      const midPort = -4.9 * widthScale;
      const midStbd = 4.9 * widthScale;
      const waistPort = -3.6 * widthScale;
      const waistStbd = 3.6 * widthScale;

      shape.moveTo(0, tipFront);
      shape.bezierCurveTo(2.5 * widthScale, 5.0 * lengthScale, midStbd, 3.2 * lengthScale, midStbd, 1.2 * lengthScale);
      shape.bezierCurveTo(midStbd, -1.0 * lengthScale, waistStbd, -4.5 * lengthScale, 0, tipAft);
      shape.bezierCurveTo(waistPort, -4.5 * lengthScale, midPort, -1.0 * lengthScale, midPort, 1.2 * lengthScale);
      shape.bezierCurveTo(midPort, 3.2 * lengthScale, -2.5 * widthScale, 5.0 * lengthScale, 0, tipFront);

      const shapeGeo = new THREE.ShapeGeometry(shape, 24);
      shapeGeo.rotateX(Math.PI / 2);

      // Apply 3D Billow Curvature: Center dips down under tension, tips bend gracefully
      const posAttr = shapeGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        // Curvature formula: parabolic sag in center, upturn at extremities
        const distFromCenter = Math.sqrt(x * x + z * z);
        const sag = -0.32 * Math.cos(Math.min(distFromCenter / 7.0, 1.57)) + (layerIdx * 0.03);
        posAttr.setY(i, sag);
      }
      shapeGeo.computeVertexNormals();
      return shapeGeo;
    };

    // Construct 5 discrete tensioned layers
    for (let layer = 0; layer < 5; layer++) {
      const layerGeo = createContouredKiteGeometry(layer);
      // Layer 0 is facing the cold telescope side; Layer 4 is facing the blazing Sun
      const mat = layer === 0
        ? kaptonColdSideMat
        : layer === 4
        ? kaptonSunFacingMat
        : aluminumFoilMat;

      const layerMesh = new THREE.Mesh(layerGeo, mat);
      // Standoff spacing between layers (~0.18m vacuum insulation gaps)
      const yLayer = -0.45 - layer * 0.18;
      layerMesh.position.set(0, yLayer, 0);
      root.add(layerMesh);
      tagMesh(layerMesh, sunComp, componentMeshes, baseTransforms);
    }

    // Deployable Telescoping Mid-Booms (Port & Starboard graphite spreader masts)
    const boomGeo = new THREE.CylinderGeometry(0.09, 0.07, 10.4, 16);
    boomGeo.rotateZ(Math.PI / 2);
    const boomMesh = new THREE.Mesh(boomGeo, busMat);
    boomMesh.position.set(0, -0.85, 1.2);
    root.add(boomMesh);
    tagMesh(boomMesh, sunComp, componentMeshes, baseTransforms);

    // Forward & Aft Unitized Pallet Structures (UPS)
    const palletGeo = new THREE.BoxGeometry(2.4, 0.35, 1.2);
    const fwdPallet = new THREE.Mesh(palletGeo, busMat);
    fwdPallet.position.set(0, -0.75, 4.2);
    root.add(fwdPallet);
    tagMesh(fwdPallet, sunComp, componentMeshes, baseTransforms);

    const aftPallet = new THREE.Mesh(palletGeo, busMat);
    aftPallet.position.set(0, -0.75, -4.0);
    root.add(aftPallet);
    tagMesh(aftPallet, sunComp, componentMeshes, baseTransforms);

    // Tension Spreader Cables along rim
    const cableMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, opacity: 0.6, transparent: true });
    const cablePoints = [
      new THREE.Vector3(0, -0.7, 7.4),
      new THREE.Vector3(5.1, -0.85, 1.2),
      new THREE.Vector3(0, -0.7, -6.6),
      new THREE.Vector3(-5.1, -0.85, 1.2),
      new THREE.Vector3(0, -0.7, 7.4),
    ];
    const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePoints);
    const cableLine = new THREE.Line(cableGeo, cableMat);
    root.add(cableLine);
  }

  // =========================================================================
  // D. INTEGRATED SCIENCE INSTRUMENT MODULE (ISIM) & CRYO RADIATOR
  // =========================================================================
  const isimComp = compMap.get('isim');
  if (isimComp) {
    const isimGroup = new THREE.Group();
    isimGroup.position.set(0, 1.35, -1.05);

    // Main Carbon-Fiber ISIM Truss Bay
    const isimBoxGeo = new THREE.BoxGeometry(2.6, 2.0, 1.8);
    const isimMesh = new THREE.Mesh(isimBoxGeo, carbonStrutMat);
    isimGroup.add(isimMesh);
    tagMesh(isimMesh, isimComp, componentMeshes, baseTransforms);

    // Gold/Silver MLI Thermal Blanket Sheaths
    const mliGeo = new THREE.BoxGeometry(2.4, 1.8, 1.6);
    const mliMesh = new THREE.Mesh(mliGeo, goldMliMat);
    mliMesh.position.set(0, 0, 0.1);
    isimGroup.add(mliMesh);
    tagMesh(mliMesh, isimComp, componentMeshes, baseTransforms);

    // Instrument Optics Compartments:
    // 1. NIRCam Pod
    const nircamGeo = new THREE.BoxGeometry(0.8, 0.7, 0.6);
    const nircamMesh = new THREE.Mesh(nircamGeo, busMat);
    nircamMesh.position.set(-0.6, 0.3, 0.4);
    isimGroup.add(nircamMesh);
    tagMesh(nircamMesh, isimComp, componentMeshes, baseTransforms);

    // 2. NIRSpec Pod
    const nirspecGeo = new THREE.BoxGeometry(0.9, 0.8, 0.7);
    const nirspecMesh = new THREE.Mesh(nirspecGeo, busMat);
    nirspecMesh.position.set(0.6, -0.2, 0.4);
    isimGroup.add(nirspecMesh);
    tagMesh(nirspecMesh, isimComp, componentMeshes, baseTransforms);

    // 3. MIRI Cryogenic Radiator Panel (Angled to dark sky)
    const radGeo = new THREE.BoxGeometry(2.1, 1.4, 0.08);
    const radMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Deep cryogenic sapphire radiator coating
      metalness: 0.95,
      roughness: 0.12,
    });
    const radMesh = new THREE.Mesh(radGeo, radMat);
    radMesh.position.set(0, 1.45, -0.6);
    radMesh.rotation.x = -0.38;
    isimGroup.add(radMesh);
    tagMesh(radMesh, isimComp, componentMeshes, baseTransforms);

    // Helium Cryocooler Feed Lines to MIRI
    const pipeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8);
    const pipeMesh = new THREE.Mesh(pipeGeo, busMat);
    pipeMesh.position.set(0.4, 0.8, -0.2);
    pipeMesh.rotation.x = -0.3;
    isimGroup.add(pipeMesh);
    tagMesh(pipeMesh, isimComp, componentMeshes, baseTransforms);

    root.add(isimGroup);
  }

  // =========================================================================
  // E. SPACECRAFT BUS & AVIONICS
  // =========================================================================
  const busComp = compMap.get('spacecraft-bus');
  if (busComp) {
    const busGroup = new THREE.Group();
    busGroup.position.set(0, -2.0, -0.8);

    // Hexagonal Spacecraft Chassis
    const busBodyGeo = new THREE.CylinderGeometry(1.45, 1.55, 1.35, 6);
    const busBodyMesh = new THREE.Mesh(busBodyGeo, busMat);
    busGroup.add(busBodyMesh);
    tagMesh(busBodyMesh, busComp, componentMeshes, baseTransforms);

    // Multi-Layer Insulation Foil Covers
    const foilGeo = new THREE.BoxGeometry(1.6, 0.9, 1.8);
    const foilMesh = new THREE.Mesh(foilGeo, goldMliMat);
    foilMesh.position.set(0, 0, 0);
    busGroup.add(foilMesh);
    tagMesh(foilMesh, busComp, componentMeshes, baseTransforms);

    // Gimbaled High-Gain Deep Space Network Antenna Dish (0.6m parabolic reflector)
    const dishGeo = new THREE.SphereGeometry(0.68, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const dishMesh = new THREE.Mesh(dishGeo, busMat);
    dishMesh.position.set(1.55, 0.2, -1.4);
    dishMesh.rotation.x = Math.PI / 2.8;
    dishMesh.rotation.z = -0.4;
    busGroup.add(dishMesh);
    tagMesh(dishMesh, busComp, componentMeshes, baseTransforms);

    // Antenna Sub-Reflector Feed Horn
    const feedGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
    const feedMesh = new THREE.Mesh(feedGeo, busMat);
    feedMesh.position.set(1.55, 0.35, -1.6);
    feedMesh.rotation.x = Math.PI / 2.8;
    busGroup.add(feedMesh);
    tagMesh(feedMesh, busComp, componentMeshes, baseTransforms);

    // Star Tracker Optical Hoods (2 conical shades)
    for (let st = 0; st < 2; st++) {
      const stGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.3, 12, 1, true);
      const stMesh = new THREE.Mesh(stGeo, carbonStrutMat);
      stMesh.position.set(-1.45, 0.3 - st * 0.4, 0.4);
      stMesh.rotation.z = -Math.PI / 2.5;
      busGroup.add(stMesh);
      tagMesh(stMesh, busComp, componentMeshes, baseTransforms);
    }

    root.add(busGroup);
  }

  // =========================================================================
  // F. ARTICULATED SOLAR POWER ARRAY
  // =========================================================================
  const solarComp = compMap.get('solar-array');
  if (solarComp) {
    const solarGroup = new THREE.Group();
    solarGroup.position.set(0, -2.65, -3.2);
    solarGroup.rotation.x = 0.52; // Tilted towards Sun

    // 5-panel articulated photovoltaic array wing
    const panelWingGeo = new THREE.BoxGeometry(1.8, 0.05, 4.4);
    const panelMesh = new THREE.Mesh(panelWingGeo, solarMat);
    solarGroup.add(panelMesh);
    tagMesh(panelMesh, solarComp, componentMeshes, baseTransforms);

    // Honeycomb Substrate Backing Frame
    const backingGeo = new THREE.BoxGeometry(1.84, 0.03, 4.44);
    const backingMesh = new THREE.Mesh(backingGeo, busMat);
    backingMesh.position.set(0, -0.04, 0);
    solarGroup.add(backingMesh);
    tagMesh(backingMesh, solarComp, componentMeshes, baseTransforms);

    // Array Hinge & Power Umbilical Boom
    const boomGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12);
    boomGeo.rotateX(Math.PI / 2);
    const arrayBoom = new THREE.Mesh(boomGeo, busMat);
    arrayBoom.position.set(0, 0, 2.6);
    solarGroup.add(arrayBoom);
    tagMesh(arrayBoom, solarComp, componentMeshes, baseTransforms);

    root.add(solarGroup);
  }

  return { rootGroup: root, componentMeshes, baseTransforms };
}

// -------------------------------------------------------------
// 2. INTERNATIONAL SPACE STATION (ISS) BUILDER
// -------------------------------------------------------------
export function buildIss(components: SpacecraftComponent[]): BuiltAsset {
  const root = new THREE.Group();
  root.name = 'ISS_ROOT';
  const componentMeshes = new Map<string, THREE.Mesh[]>();
  const baseTransforms = new Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>();

  const compMap = new Map(components.map((c) => [c.id, c]));

  // Materials
  const metalModuleMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.88,
    roughness: 0.28,
  });

  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.7,
    roughness: 0.5,
  });

  const solarWingMat = new THREE.MeshStandardMaterial({
    map: solarTexture,
    metalness: 0.65,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });

  const radiatorMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.3,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  const windowCupolaMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.85,
  });

  // A. Integrated Truss Structure (109m representation)
  const trussComp = compMap.get('iss-truss');
  if (trussComp) {
    const trussGeo = new THREE.BoxGeometry(22, 0.8, 0.8);
    const mainTruss = new THREE.Mesh(trussGeo, trussMat);
    mainTruss.position.set(0, 0, 0);
    root.add(mainTruss);
    tagMesh(mainTruss, trussComp, componentMeshes, baseTransforms);

    // Cross braces & joints
    for (let x = -10; x <= 10; x += 2.5) {
      const ribGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 8);
      const rib = new THREE.Mesh(ribGeo, trussMat);
      rib.position.set(x, 0, 0);
      root.add(rib);
      tagMesh(rib, trussComp, componentMeshes, baseTransforms);
    }
  }

  // B. Solar Array Wings (8 wings: 4 on port, 4 on starboard)
  const solarComp = compMap.get('iss-solar-wings');
  if (solarComp) {
    const wingGeo = new THREE.BoxGeometry(1.8, 0.06, 7.5);
    const xOffsets = [-9.5, -7.5, 7.5, 9.5];

    xOffsets.forEach((xPos) => {
      // Forward array
      const wingFwd = new THREE.Mesh(wingGeo, solarWingMat);
      wingFwd.position.set(xPos, 0, 4.4);
      root.add(wingFwd);
      tagMesh(wingFwd, solarComp, componentMeshes, baseTransforms);

      // Aft array
      const wingAft = new THREE.Mesh(wingGeo, solarWingMat);
      wingAft.position.set(xPos, 0, -4.4);
      root.add(wingAft);
      tagMesh(wingAft, solarComp, componentMeshes, baseTransforms);
    });
  }

  // C. US Destiny Lab & Central Habitation Modules
  const destinyComp = compMap.get('iss-destiny-lab');
  if (destinyComp) {
    const cylGeo = new THREE.CylinderGeometry(0.9, 0.9, 4.2, 24);
    cylGeo.rotateX(Math.PI / 2);
    const destiny = new THREE.Mesh(cylGeo, metalModuleMat);
    destiny.position.set(0, -1.0, 1.8);
    root.add(destiny);
    tagMesh(destiny, destinyComp, componentMeshes, baseTransforms);

    // Node 2 (Harmony)
    const nodeGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.8, 24);
    nodeGeo.rotateX(Math.PI / 2);
    const node2 = new THREE.Mesh(nodeGeo, metalModuleMat);
    node2.position.set(0, -1.0, 4.6);
    root.add(node2);
    tagMesh(node2, destinyComp, componentMeshes, baseTransforms);

    // Airlock Quest
    const airlockGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 16);
    const quest = new THREE.Mesh(airlockGeo, metalModuleMat);
    quest.position.set(1.4, -1.0, 1.8);
    root.add(quest);
    tagMesh(quest, destinyComp, componentMeshes, baseTransforms);
  }

  // D. Columbus (ESA) & Kibo (JAXA) Modules
  const colComp = compMap.get('iss-columbus-kibo');
  if (colComp) {
    // Columbus (Starboard)
    const colGeo = new THREE.CylinderGeometry(0.85, 0.85, 3.2, 20);
    colGeo.rotateZ(Math.PI / 2);
    const columbus = new THREE.Mesh(colGeo, metalModuleMat);
    columbus.position.set(2.4, -1.0, 4.6);
    root.add(columbus);
    tagMesh(columbus, colComp, componentMeshes, baseTransforms);

    // Kibo (Port) with Exposed Facility
    const kiboGeo = new THREE.CylinderGeometry(0.88, 0.88, 4.2, 20);
    kiboGeo.rotateZ(Math.PI / 2);
    const kibo = new THREE.Mesh(kiboGeo, metalModuleMat);
    kibo.position.set(-2.8, -1.0, 4.6);
    root.add(kibo);
    tagMesh(kibo, colComp, componentMeshes, baseTransforms);

    // Kibo porch platform
    const porchGeo = new THREE.BoxGeometry(1.6, 0.4, 2.0);
    const porch = new THREE.Mesh(porchGeo, trussMat);
    porch.position.set(-5.4, -1.0, 4.6);
    root.add(porch);
    tagMesh(porch, colComp, componentMeshes, baseTransforms);
  }

  // E. Cupola Observation Dome
  const cupolaComp = compMap.get('iss-cupola');
  if (cupolaComp) {
    const cupolaBaseGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.6, 7);
    const cupolaMesh = new THREE.Mesh(cupolaBaseGeo, metalModuleMat);
    cupolaMesh.position.set(0, -2.1, 3.4);
    root.add(cupolaMesh);
    tagMesh(cupolaMesh, cupolaComp, componentMeshes, baseTransforms);

    // Seven windows
    const windowGeo = new THREE.SphereGeometry(0.5, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    const windowMesh = new THREE.Mesh(windowGeo, windowCupolaMat);
    windowMesh.position.set(0, -2.4, 3.4);
    windowMesh.rotation.x = Math.PI;
    root.add(windowMesh);
    tagMesh(windowMesh, cupolaComp, componentMeshes, baseTransforms);
  }

  // F. Thermal Control Radiators
  const radComp = compMap.get('iss-radiators');
  if (radComp) {
    const radGeo = new THREE.BoxGeometry(0.08, 4.8, 3.2);
    const radLeft = new THREE.Mesh(radGeo, radiatorMat);
    radLeft.position.set(-3.6, 0, -2.8);
    root.add(radLeft);
    tagMesh(radLeft, radComp, componentMeshes, baseTransforms);

    const radRight = new THREE.Mesh(radGeo, radiatorMat);
    radRight.position.set(3.6, 0, -2.8);
    root.add(radRight);
    tagMesh(radRight, radComp, componentMeshes, baseTransforms);
  }

  return { rootGroup: root, componentMeshes, baseTransforms };
}

// -------------------------------------------------------------
// 3. MARS PERSEVERANCE ROVER BUILDER
// -------------------------------------------------------------
export function buildPerseverance(components: SpacecraftComponent[]): BuiltAsset {
  const root = new THREE.Group();
  root.name = 'PERSEVERANCE_ROOT';
  const componentMeshes = new Map<string, THREE.Mesh[]>();
  const baseTransforms = new Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>();

  const compMap = new Map(components.map((c) => [c.id, c]));

  // Materials
  const roverBodyMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.5,
    roughness: 0.4,
  });

  const goldMmrtgMat = new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    metalness: 0.85,
    roughness: 0.3,
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.4,
  });

  const mastMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.7,
    roughness: 0.3,
  });

  const opticLensMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.95,
    roughness: 0.1,
  });

  // A. Rover Warm Electronics Box (Chassis)
  const chassisComp = compMap.get('rover-chassis');
  if (chassisComp) {
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.0, 3.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, roverBodyMat);
    bodyMesh.position.set(0, 0.4, 0);
    root.add(bodyMesh);
    tagMesh(bodyMesh, chassisComp, componentMeshes, baseTransforms);

    // Top deck plate with instrument mounts
    const deckGeo = new THREE.BoxGeometry(2.2, 0.08, 3.0);
    const deckMesh = new THREE.Mesh(deckGeo, roverBodyMat);
    deckMesh.position.set(0, 0.94, 0);
    root.add(deckMesh);
    tagMesh(deckMesh, chassisComp, componentMeshes, baseTransforms);
  }

  // B. Multi-Mission Radioisotope Thermoelectric Generator (MMRTG)
  const mmrtgComp = compMap.get('rover-mmrtg');
  if (mmrtgComp) {
    const mmrtgCyl = new THREE.CylinderGeometry(0.45, 0.45, 1.2, 16);
    mmrtgCyl.rotateX(Math.PI / 2);
    const mmrtgMesh = new THREE.Mesh(mmrtgCyl, goldMmrtgMat);
    mmrtgMesh.position.set(0, 0.85, -2.0);
    root.add(mmrtgMesh);
    tagMesh(mmrtgMesh, mmrtgComp, componentMeshes, baseTransforms);

    // 8 radial cooling fins
    for (let f = 0; f < 8; f++) {
      const ang = (f * Math.PI) / 4;
      const finGeo = new THREE.BoxGeometry(0.04, 0.45, 1.1);
      const finMesh = new THREE.Mesh(finGeo, goldMmrtgMat);
      finMesh.position.set(0.55 * Math.cos(ang), 0.85 + 0.55 * Math.sin(ang), -2.0);
      finMesh.rotation.z = ang;
      root.add(finMesh);
      tagMesh(finMesh, mmrtgComp, componentMeshes, baseTransforms);
    }
  }

  // C. Remote Sensing Mast (SuperCam & Mastcam-Z)
  const mastComp = compMap.get('rover-mast');
  if (mastComp) {
    // Mast column
    const colGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 12);
    const mastCol = new THREE.Mesh(colGeo, mastMat);
    mastCol.position.set(0.65, 1.8, 1.0);
    root.add(mastCol);
    tagMesh(mastCol, mastComp, componentMeshes, baseTransforms);

    // SuperCam optical head
    const headGeo = new THREE.BoxGeometry(0.55, 0.35, 0.45);
    const headMesh = new THREE.Mesh(headGeo, mastMat);
    headMesh.position.set(0.65, 2.7, 1.0);
    root.add(headMesh);
    tagMesh(headMesh, mastComp, componentMeshes, baseTransforms);

    // Laser & camera lens
    const lensGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    lensGeo.rotateX(Math.PI / 2);
    const lensMesh = new THREE.Mesh(lensGeo, opticLensMat);
    lensMesh.position.set(0.65, 2.7, 1.25);
    root.add(lensMesh);
    tagMesh(lensMesh, mastComp, componentMeshes, baseTransforms);
  }

  // D. Robotic Arm & PIXL/SHERLOC Turret
  const armComp = compMap.get('rover-arm');
  if (armComp) {
    // Shoulder & bicep
    const bicepGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
    const bicep = new THREE.Mesh(bicepGeo, mastMat);
    bicep.position.set(-0.7, 0.8, 1.8);
    bicep.rotation.x = 0.5;
    root.add(bicep);
    tagMesh(bicep, armComp, componentMeshes, baseTransforms);

    // Forearm
    const foreGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8);
    const fore = new THREE.Mesh(foreGeo, mastMat);
    fore.position.set(-0.7, 0.4, 2.4);
    fore.rotation.x = 1.1;
    root.add(fore);
    tagMesh(fore, armComp, componentMeshes, baseTransforms);

    // Instrument Turret (PIXL, SHERLOC, Coring Drill)
    const turretGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 12);
    const turret = new THREE.Mesh(turretGeo, goldMmrtgMat);
    turret.position.set(-0.7, 0.1, 2.9);
    root.add(turret);
    tagMesh(turret, armComp, componentMeshes, baseTransforms);
  }

  // E. Rocker-Bogie Suspension & 6 Cleated Wheels
  const mobComp = compMap.get('rover-mobility');
  if (mobComp) {
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 18);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPos: [number, number, number][] = [
      // Left side
      [-1.6, -0.4, 1.4],
      [-1.7, -0.4, 0.0],
      [-1.6, -0.4, -1.4],
      // Right side
      [1.6, -0.4, 1.4],
      [1.7, -0.4, 0.0],
      [1.6, -0.4, -1.4],
    ];

    wheelPos.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      root.add(wheel);
      tagMesh(wheel, mobComp, componentMeshes, baseTransforms);

      // Cleat grooves
      const rimGeo = new THREE.TorusGeometry(0.38, 0.02, 6, 18);
      rimGeo.rotateY(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, goldMmrtgMat);
      rim.position.set(wx, wy, wz);
      root.add(rim);
      tagMesh(rim, mobComp, componentMeshes, baseTransforms);
    });

    // Rocker-bogie tubes
    const rockerGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8);
    rockerGeo.rotateX(Math.PI / 2);
    const rockerLeft = new THREE.Mesh(rockerGeo, mastMat);
    rockerLeft.position.set(-1.45, 0.0, 0.0);
    root.add(rockerLeft);
    tagMesh(rockerLeft, mobComp, componentMeshes, baseTransforms);

    const rockerRight = new THREE.Mesh(rockerGeo, mastMat);
    rockerRight.position.set(1.45, 0.0, 0.0);
    root.add(rockerRight);
    tagMesh(rockerRight, mobComp, componentMeshes, baseTransforms);
  }

  // F. Ingenuity Helicopter Underbelly Mount
  const ingComp = compMap.get('rover-ingenuity');
  if (ingComp) {
    const copterBodyGeo = new THREE.BoxGeometry(0.3, 0.25, 0.3);
    const copterBody = new THREE.Mesh(copterBodyGeo, goldMmrtgMat);
    copterBody.position.set(0, -0.2, 0.2);
    root.add(copterBody);
    tagMesh(copterBody, ingComp, componentMeshes, baseTransforms);

    // Coaxial rotors
    const rotorGeo = new THREE.BoxGeometry(1.2, 0.02, 0.1);
    const rotor1 = new THREE.Mesh(rotorGeo, mastMat);
    rotor1.position.set(0, 0.0, 0.2);
    root.add(rotor1);
    tagMesh(rotor1, ingComp, componentMeshes, baseTransforms);

    const rotor2 = new THREE.Mesh(rotorGeo, mastMat);
    rotor2.position.set(0, 0.1, 0.2);
    rotor2.rotation.y = Math.PI / 2;
    root.add(rotor2);
    tagMesh(rotor2, ingComp, componentMeshes, baseTransforms);
  }

  return { rootGroup: root, componentMeshes, baseTransforms };
}

// -------------------------------------------------------------
// 4. HUBBLE SPACE TELESCOPE BUILDER
// -------------------------------------------------------------
export function buildHubble(components: SpacecraftComponent[]): BuiltAsset {
  const root = new THREE.Group();
  root.name = 'HUBBLE_ROOT';
  const componentMeshes = new Map<string, THREE.Mesh[]>();
  const baseTransforms = new Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>();

  const compMap = new Map(components.map((c) => [c.id, c]));

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.15,
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.92,
    roughness: 0.25,
    bumpMap: foilBumpTexture,
    bumpScale: 0.015,
  });

  const solarMat = new THREE.MeshStandardMaterial({
    map: solarTexture,
    metalness: 0.7,
    roughness: 0.2,
    side: THREE.DoubleSide,
  });

  // A. Aperture Door & Forward Tube
  const apComp = compMap.get('hst-aperture-door');
  if (apComp) {
    const fwdGeo = new THREE.CylinderGeometry(1.3, 1.3, 3.8, 32, 1, true);
    const fwdMesh = new THREE.Mesh(fwdGeo, shellMat);
    fwdMesh.position.set(0, 2.2, 0);
    root.add(fwdMesh);
    tagMesh(fwdMesh, apComp, componentMeshes, baseTransforms);

    // Open aperture door disc
    const doorGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.08, 32);
    const doorMesh = new THREE.Mesh(doorGeo, shellMat);
    doorMesh.position.set(0, 4.15, 1.1);
    doorMesh.rotation.x = -Math.PI / 4;
    root.add(doorMesh);
    tagMesh(doorMesh, apComp, componentMeshes, baseTransforms);
  }

  // B. 2.4m Primary Mirror assembly
  const mirComp = compMap.get('hst-primary-mirror');
  if (mirComp) {
    const mirGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32);
    const mirMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.98, roughness: 0.05 });
    const mirMesh = new THREE.Mesh(mirGeo, mirMat);
    mirMesh.position.set(0, 0.4, 0);
    root.add(mirMesh);
    tagMesh(mirMesh, mirComp, componentMeshes, baseTransforms);
  }

  // C. Solar Array Wings
  const solComp = compMap.get('hst-solar-wings');
  if (solComp) {
    const wingGeo = new THREE.BoxGeometry(0.8, 4.8, 0.05);
    const wingLeft = new THREE.Mesh(wingGeo, solarMat);
    wingLeft.position.set(-3.2, 0, 0);
    root.add(wingLeft);
    tagMesh(wingLeft, solComp, componentMeshes, baseTransforms);

    const wingRight = new THREE.Mesh(wingGeo, solarMat);
    wingRight.position.set(3.2, 0, 0);
    root.add(wingRight);
    tagMesh(wingRight, solComp, componentMeshes, baseTransforms);
  }

  // D. Aft Instruments Shroud
  const aftComp = compMap.get('hst-aft-instruments');
  if (aftComp) {
    const aftGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.2, 32);
    const aftMesh = new THREE.Mesh(aftGeo, goldFoilMat);
    aftMesh.position.set(0, -2.0, 0);
    root.add(aftMesh);
    tagMesh(aftMesh, aftComp, componentMeshes, baseTransforms);

    // High gain antennas
    const dishGeo = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dishLeft = new THREE.Mesh(dishGeo, shellMat);
    dishLeft.position.set(-2.2, -1.0, 0);
    dishLeft.rotation.z = Math.PI / 3;
    root.add(dishLeft);
    tagMesh(dishLeft, aftComp, componentMeshes, baseTransforms);
  }

  return { rootGroup: root, componentMeshes, baseTransforms };
}

// -------------------------------------------------------------
// 5. APOLLO LUNAR MODULE (LM-5) BUILDER
// -------------------------------------------------------------
export function buildApolloLm(components: SpacecraftComponent[]): BuiltAsset {
  const root = new THREE.Group();
  root.name = 'APOLLO_LM_ROOT';
  const componentMeshes = new Map<string, THREE.Mesh[]>();
  const baseTransforms = new Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler; scale: THREE.Vector3 }>();

  const compMap = new Map(components.map((c) => [c.id, c]));

  const foilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.94,
    roughness: 0.28,
    bumpMap: foilBumpTexture,
    bumpScale: 0.02,
  });

  const ascentMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.4,
  });

  const rocketBellMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.3,
  });

  // A. Descent Stage (Octagonal Kapton Foil)
  const desComp = compMap.get('lm-descent-stage');
  if (desComp) {
    const octGeo = new THREE.CylinderGeometry(2.1, 2.1, 1.4, 8);
    const octMesh = new THREE.Mesh(octGeo, foilMat);
    octMesh.position.set(0, 0, 0);
    root.add(octMesh);
    tagMesh(octMesh, desComp, componentMeshes, baseTransforms);

    // Descent engine rocket bell
    const bellGeo = new THREE.ConeGeometry(0.9, 1.2, 20, 1, true);
    const bellMesh = new THREE.Mesh(bellGeo, rocketBellMat);
    bellMesh.position.set(0, -1.2, 0);
    root.add(bellMesh);
    tagMesh(bellMesh, desComp, componentMeshes, baseTransforms);
  }

  // B. Ascent Stage & Cockpit
  const ascComp = compMap.get('lm-ascent-stage');
  if (ascComp) {
    const cabinGeo = new THREE.BoxGeometry(2.3, 1.8, 2.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, ascentMat);
    cabinMesh.position.set(0, 1.6, 0);
    root.add(cabinMesh);
    tagMesh(cabinMesh, ascComp, componentMeshes, baseTransforms);

    // Triangular window forward cockpit
    const noseGeo = new THREE.BoxGeometry(1.6, 1.2, 0.8);
    const noseMesh = new THREE.Mesh(noseGeo, foilMat);
    noseMesh.position.set(0, 1.5, 1.3);
    root.add(noseMesh);
    tagMesh(noseMesh, ascComp, componentMeshes, baseTransforms);

    // Overhead docking tunnel
    const dockGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 16);
    const dockMesh = new THREE.Mesh(dockGeo, ascentMat);
    dockMesh.position.set(0, 2.7, 0);
    root.add(dockMesh);
    tagMesh(dockMesh, ascComp, componentMeshes, baseTransforms);
  }

  // C. 4× Truss Landing Legs & Footpads
  const legComp = compMap.get('lm-landing-gear');
  if (legComp) {
    const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    legAngles.forEach((ang) => {
      const x = 3.6 * Math.cos(ang);
      const z = 3.6 * Math.sin(ang);

      // Primary strut
      const p0 = new THREE.Vector3(1.5 * Math.cos(ang), 0.2, 1.5 * Math.sin(ang));
      const p1 = new THREE.Vector3(x, -1.8, z);
      const dir = new THREE.Vector3().subVectors(p1, p0);
      const len = dir.length();

      const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, len, 8);
      const strut = new THREE.Mesh(strutGeo, foilMat);
      strut.position.copy(p0).addScaledVector(dir, 0.5);
      strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      root.add(strut);
      tagMesh(strut, legComp, componentMeshes, baseTransforms);

      // Dish footpad
      const padGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 16);
      const pad = new THREE.Mesh(padGeo, ascentMat);
      pad.position.set(x, -1.8, z);
      root.add(pad);
      tagMesh(pad, legComp, componentMeshes, baseTransforms);
    });
  }

  // D. Reaction Control System (RCS) Quads
  const rcsComp = compMap.get('lm-rcs-quads');
  if (rcsComp) {
    const rcsAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    rcsAngles.forEach((ang) => {
      const outX = 1.9 * Math.cos(ang);
      const outZ = 1.9 * Math.sin(ang);

      const clusterGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const cluster = new THREE.Mesh(clusterGeo, rocketBellMat);
      cluster.position.set(outX, 1.6, outZ);
      root.add(cluster);
      tagMesh(cluster, rcsComp, componentMeshes, baseTransforms);
    });
  }

  return { rootGroup: root, componentMeshes, baseTransforms };
}

// -------------------------------------------------------------
// 6. PLANETARY EARTH & MOON SYSTEM BUILDER
// -------------------------------------------------------------
export function buildEarthGlobe(): { earthGroup: THREE.Group; update: (delta: number) => void } {
  const earthGroup = new THREE.Group();
  earthGroup.name = 'EARTH_SYSTEM';

  // Procedural Earth surface canvas texture
  const earthCanvas = document.createElement('canvas');
  earthCanvas.width = 1024;
  earthCanvas.height = 512;
  const ctx = earthCanvas.getContext('2d')!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0c2340');
  oceanGrad.addColorStop(0.5, '#07162c');
  oceanGrad.addColorStop(1, '#0c2340');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Continents silhouette representation
  ctx.fillStyle = '#1e3a29';
  // North/South America
  ctx.beginPath();
  ctx.ellipse(280, 200, 90, 60, 0.2, 0, Math.PI * 2);
  ctx.ellipse(320, 360, 50, 90, 0.4, 0, Math.PI * 2);
  // Eurasia / Africa
  ctx.ellipse(580, 190, 110, 70, -0.1, 0, Math.PI * 2);
  ctx.ellipse(560, 300, 60, 90, 0.1, 0, Math.PI * 2);
  // Australia
  ctx.ellipse(820, 360, 45, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ice caps
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 1024, 25);
  ctx.fillRect(0, 485, 1024, 27);

  const earthTexture = new THREE.CanvasTexture(earthCanvas);

  // Earth Sphere
  const earthGeo = new THREE.SphereGeometry(18, 64, 64);
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.65,
    metalness: 0.1,
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthGroup.add(earthMesh);

  // Clouds Sphere
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 1024;
  cloudCanvas.height = 512;
  const cctx = cloudCanvas.getContext('2d')!;
  cctx.clearRect(0, 0, 1024, 512);
  cctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * 1024;
    const cy = 60 + Math.random() * 380;
    const cr = 20 + Math.random() * 50;
    cctx.beginPath();
    cctx.arc(cx, cy, cr, 0, Math.PI * 2);
    cctx.fill();
  }
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  const cloudGeo = new THREE.SphereGeometry(18.25, 48, 48);
  const cloudMat = new THREE.MeshStandardMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  earthGroup.add(cloudMesh);

  // Atmospheric Fresnel Glow
  const atmosGeo = new THREE.SphereGeometry(19.4, 48, 48);
  const atmosMat = new THREE.ShaderMaterial({
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
        float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
        gl_FragColor = vec4(0.22, 0.64, 0.98, 1.0) * intensity * 1.8;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
  });
  const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
  earthGroup.add(atmosMesh);

  // Orbital Trajectory Circles (LEO, GEO, Lunar Transfer)
  const leoCurve = new THREE.EllipseCurve(0, 0, 24, 24, 0, 2 * Math.PI, false, 0);
  const leoPoints = leoCurve.getPoints(120);
  const leoGeo = new THREE.BufferGeometry().setFromPoints(leoPoints.map((p) => new THREE.Vector3(p.x, 0, p.y)));
  const leoMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
  const leoLine = new THREE.Line(leoGeo, leoMat);
  leoLine.rotation.x = Math.PI / 4;
  earthGroup.add(leoLine);

  return {
    earthGroup,
    update: (delta: number) => {
      earthMesh.rotation.y += delta * 0.02;
      cloudMesh.rotation.y += delta * 0.028;
    },
  };
}
