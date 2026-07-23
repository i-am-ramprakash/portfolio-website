import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type CharacterZone =
  | "hero"
  | "about"
  | "capabilities"
  | "career"
  | "work"
  | "toolkit"
  | "contact";

interface ProceduralCharacterProps {
  activeZone: CharacterZone;
  reducedMotion: boolean;
}

type Pose = { x: number; y: number; scale: number; rotation: number };
type RobotArm = {
  shoulder: THREE.Group;
  elbow: THREE.Group;
  wrist: THREE.Group;
  forearmTwistGroup: THREE.Group;
  fingers: THREE.Group[];
};

const desktopPoses: Record<CharacterZone, Pose> = {
  hero: { x: 0, y: -0.2, scale: 1.08, rotation: 0 },
  about: { x: 3.6, y: -0.28, scale: 0.96, rotation: -0.22 },
  capabilities: { x: -3.6, y: -0.3, scale: 0.92, rotation: 0.26 },
  career: { x: -3.8, y: -0.32, scale: 0.88, rotation: 0.28 },
  work: { x: 3.7, y: -0.35, scale: 0.86, rotation: -0.26 },
  toolkit: { x: -1.8, y: -0.25, scale: 0.88, rotation: 0.12 },
  contact: { x: -2.8, y: -0.3, scale: 0.9, rotation: 0.2 },
};

const mobilePoses: Record<CharacterZone, Pose> = {
  hero: { x: 0, y: -0.45, scale: 0.72, rotation: 0 },
  about: { x: 1.5, y: -0.5, scale: 0.56, rotation: -0.28 },
  capabilities: { x: -1.5, y: -0.52, scale: 0.52, rotation: 0.3 },
  career: { x: -1.6, y: -0.55, scale: 0.5, rotation: 0.3 },
  work: { x: 1.5, y: -0.55, scale: 0.5, rotation: -0.28 },
  toolkit: { x: -0.8, y: -0.42, scale: 0.5, rotation: 0.1 },
  contact: { x: -1.4, y: -0.5, scale: 0.52, rotation: 0.26 },
};

const sectionGaze: Record<CharacterZone, { x: number; y: number }> = {
  hero: { x: 0, y: 0 },
  about: { x: -0.22, y: -0.03 },
  capabilities: { x: 0.24, y: -0.05 },
  career: { x: 0.2, y: 0.05 },
  work: { x: -0.24, y: 0 },
  toolkit: { x: 0.15, y: 0 },
  contact: { x: 0.18, y: -0.02 },
};

const ProceduralCharacter = ({ activeZone, reducedMotion }: ProceduralCharacterProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef(activeZone);
  const reducedMotionRef = useRef(reducedMotion);
  const zoneEntryTimeRef = useRef(performance.now());
  const transitionPhaseRef = useRef<"gesture" | "neutral" | "traveling">("gesture");
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    if (activeZone !== zoneRef.current) transitionPhaseRef.current = "neutral";
    zoneRef.current = activeZone;
    zoneEntryTimeRef.current = performance.now();
  }, [activeZone]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = window.innerWidth >= 800;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 10.5);

    const root = new THREE.Group();
    scene.add(root);

    // Dark charcoal armor matching og-image-orange.jpg — faceted dark panels with silver metallic sheen on edges
    const armor = new THREE.MeshPhysicalMaterial({
      color: 0x1c2025,
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    });
    const armorDark = new THREE.MeshStandardMaterial({
      color: 0x0a0c0e,
      metalness: 0.9,
      roughness: 0.35,
    });
    const armorMid = new THREE.MeshPhysicalMaterial({
      color: 0x22272d,
      metalness: 0.88,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    });
    // Silver-tinted edge highlight — catches the orange rim as white-silver specular
    const armorEdge = new THREE.MeshStandardMaterial({
      color: 0x8a9299,
      metalness: 0.98,
      roughness: 0.08,
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x070809,
      metalness: 0.85,
      roughness: 0.48,
    });
    const orangeMetal = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      emissive: 0xcc2200,
      emissiveIntensity: 1.0,
      metalness: 0.72,
      roughness: 0.16,
    });
    const orangeGlow = new THREE.MeshStandardMaterial({
      color: 0xff9944,
      emissive: 0xff5500,
      emissiveIntensity: 7.0,
      roughness: 0.05,
      metalness: 0.08,
    });
    const pupilGlow = new THREE.MeshStandardMaterial({
      color: 0xffee99,
      emissive: 0xff8800,
      emissiveIntensity: 10,
      roughness: 0.03,
    });
    const orangeGlass = new THREE.MeshPhysicalMaterial({
      color: 0xff6600,
      emissive: 0xff4400,
      emissiveIntensity: 5.5,
      metalness: 0.04,
      roughness: 0.03,
      transmission: 0.08,
      thickness: 0.5,
      clearcoat: 1,
    });

    const applyShadow = (mesh: THREE.Mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const makeCylinder = (
      radiusTop: number,
      radiusBottom: number,
      height: number,
      material: THREE.Material,
      segments = 12,
    ) => applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material));

    const makePlate = (
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
    ) => applyShadow(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material));

    const addFrontCylinder = (
      parent: THREE.Object3D,
      radius: number,
      depth: number,
      material: THREE.Material,
      z: number,
      segments = 24,
    ) => {
      const mesh = makeCylinder(radius, radius, depth, material, segments);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = z;
      parent.add(mesh);
      return mesh;
    };

    // Strong orange backlight halo behind robot — matches the orange glow in og-image-orange.jpg
    const backlight = new THREE.PointLight(0xff4d00, 32, 18);
    backlight.position.set(0, 1.5, -2.0);
    scene.add(backlight);
    const backlightWide = new THREE.PointLight(0xff3300, 20, 22);
    backlightWide.position.set(0, 0.5, -1.8);
    scene.add(backlightWide);

    // Torso: Faceted chest armor with seams matching og-image-orange.jpg
    const torso = new THREE.Group();
    torso.position.y = 1.08;
    root.add(torso);

    const ribCage = applyShadow(new THREE.Mesh(new THREE.DodecahedronGeometry(1.03, 0), armor));
    ribCage.scale.set(1.08, 1.04, 0.72);
    torso.add(ribCage);

    const sternum = makePlate(0.72, 1.35, 0.16, armorMid);
    sternum.position.set(0, 0.02, 0.7);
    sternum.rotation.z = Math.PI / 4;
    torso.add(sternum);

    const leftChestPlate = makePlate(0.74, 0.78, 0.13, armorMid);
    leftChestPlate.position.set(-0.51, 0.31, 0.66);
    leftChestPlate.rotation.z = -0.18;
    torso.add(leftChestPlate);
    const rightChestPlate = leftChestPlate.clone();
    rightChestPlate.position.x = 0.51;
    rightChestPlate.rotation.z = 0.18;
    torso.add(rightChestPlate);

    [-1, 1].forEach((side) => {
      const lowerPlate = makePlate(0.48, 0.52, 0.1, armor);
      lowerPlate.position.set(side * 0.45, -0.5, 0.65);
      lowerPlate.rotation.z = side * 0.2;
      torso.add(lowerPlate);

      // Orange power conduit seams running along chest plates
      const accent = makePlate(0.035, 0.55, 0.03, orangeMetal);
      accent.position.set(side * 0.73, 0.2, 0.76);
      accent.rotation.z = side * 0.12;
      torso.add(accent);

      const chestSeam = makePlate(0.025, 0.6, 0.02, orangeGlow);
      chestSeam.position.set(side * 0.38, 0.42, 0.74);
      chestSeam.rotation.z = side * -0.28;
      torso.add(chestSeam);
    });

    // Octagonal glowing chest reactor core (exact match to og-image-orange.jpg)
    const reactor = new THREE.Group();
    reactor.position.set(0, 0.04, 0.72);
    torso.add(reactor);

    // Octagonal outer housing
    const reactorHousing = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 8), armorDark));
    reactorHousing.rotation.x = Math.PI / 2;
    reactor.add(reactorHousing);

    const reactorOuter = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 8, 8), armorEdge);
    reactorOuter.position.z = 0.09;
    reactor.add(reactorOuter);

    const reactorOrangeRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 8, 8), orangeMetal);
    reactorOrangeRing.position.z = 0.125;
    reactor.add(reactorOrangeRing);

    const chestCore = addFrontCylinder(reactor, 0.18, 0.09, orangeGlass, 0.16, 8);
    const coreOctagon = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8), pupilGlow));
    coreOctagon.rotation.x = Math.PI / 2;
    coreOctagon.position.z = 0.225;
    reactor.add(coreOctagon);

    const reactorLight = new THREE.PointLight(0xff4d00, 16, 5.5);
    reactorLight.position.set(0, 0, 0.75);
    torso.add(reactorLight);

    // Armored waist and mechanical spine
    const spine = makeCylinder(0.26, 0.34, 0.55, jointMaterial, 12);
    spine.position.y = 0.02;
    root.add(spine);
    for (let index = 0; index < 3; index += 1) {
      const spineRing = new THREE.Mesh(new THREE.TorusGeometry(0.3 - index * 0.015, 0.028, 6, 16), armorEdge);
      spineRing.rotation.x = Math.PI / 2;
      spineRing.position.y = 0.2 - index * 0.19;
      root.add(spineRing);
    }
    const waist = makeCylinder(0.48, 0.62, 0.38, armor, 8);
    waist.position.y = -0.28;
    root.add(waist);
    const beltCore = makePlate(0.38, 0.22, 0.17, orangeMetal);
    beltCore.position.set(0, -0.25, 0.55);
    root.add(beltCore);

    // Detailed mechanical neck: central column wrapped by 4 vertical pistons & glowing collar rings
    const neckGroup = new THREE.Group();
    neckGroup.position.y = 2.02;
    root.add(neckGroup);

    const neckCenter = makeCylinder(0.2, 0.25, 0.44, jointMaterial, 12);
    neckGroup.add(neckCenter);

    [-1, 1].forEach((side) => {
      [-1, 1].forEach((frontBack) => {
        const piston = makeCylinder(0.038, 0.038, 0.42, armorEdge, 8);
        piston.position.set(side * 0.15, 0, frontBack * 0.12);
        neckGroup.add(piston);
      });
    });

    [-0.12, 0.12].forEach((offset) => {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 6, 18), offset > 0 ? orangeMetal : armorEdge);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = offset;
      neckGroup.add(collar);
    });

    // Helmet & Face: Faceted dome, inverted triangle ▼, large ear discs, circular camera eyes
    const head = new THREE.Group();
    head.position.y = 2.7;
    root.add(head);

    const helmet = applyShadow(new THREE.Mesh(new THREE.DodecahedronGeometry(0.74, 0), armor));
    helmet.scale.set(0.96, 1.04, 0.84);
    head.add(helmet);

    const crown = makePlate(0.6, 0.32, 0.12, armorMid);
    crown.position.set(0, 0.48, 0.31);
    crown.rotation.x = -0.28;
    head.add(crown);

    const facePlate = makePlate(0.92, 0.54, 0.12, armorMid);
    facePlate.position.set(0, -0.02, 0.6);
    head.add(facePlate);

    const chin = makePlate(0.55, 0.22, 0.18, armorDark);
    chin.position.set(0, -0.43, 0.48);
    chin.rotation.x = -0.2;
    head.add(chin);

    // Forehead downward-pointing glowing orange inverted triangle ▼ (exact match to og-image-orange.jpg)
    const foreheadTriangleGeo = new THREE.ConeGeometry(0.068, 0.085, 3);
    const foreheadTriangle = applyShadow(new THREE.Mesh(foreheadTriangleGeo, orangeGlow));
    foreheadTriangle.rotation.x = Math.PI / 2;
    foreheadTriangle.rotation.z = Math.PI; // Point triangle downward ▼
    foreheadTriangle.position.set(0, 0.36, 0.69);
    head.add(foreheadTriangle);

    // Large circular Ear / Temple housings with dual concentric glowing rings (exact match to og-image-orange.jpg)
    [-1, 1].forEach((side) => {
      const cheek = makePlate(0.25, 0.4, 0.11, armor);
      cheek.position.set(side * 0.42, -0.19, 0.56);
      cheek.rotation.z = side * 0.22;
      head.add(cheek);

      const earHousing = new THREE.Group();
      earHousing.position.set(side * 0.72, 0.03, 0.02);
      head.add(earHousing);

      const templeBase = makeCylinder(0.27, 0.27, 0.18, armorDark, 24);
      templeBase.rotation.z = Math.PI / 2;
      earHousing.add(templeBase);

      const templeOuterRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 24), orangeMetal);
      templeOuterRing.rotation.y = Math.PI / 2;
      templeOuterRing.position.x = side * 0.095;
      earHousing.add(templeOuterRing);

      const templeInnerCap = makeCylinder(0.15, 0.15, 0.21, armorEdge, 20);
      templeInnerCap.rotation.z = Math.PI / 2;
      earHousing.add(templeInnerCap);

      const templeInnerRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 20), orangeGlow);
      templeInnerRing.rotation.y = Math.PI / 2;
      templeInnerRing.position.x = side * 0.11;
      earHousing.add(templeInnerRing);
    });

    // Circular camera eyes set in dark recessed sockets
    const createEye = (side: -1 | 1) => {
      const eye = new THREE.Group();
      eye.position.set(side * 0.26, 0.07, 0.68);
      head.add(eye);

      addFrontCylinder(eye, 0.16, 0.07, armorDark, 0, 24);
      const outerRim = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.024, 8, 24), orangeMetal);
      outerRim.position.z = 0.055;
      eye.add(outerRim);

      const lens = addFrontCylinder(eye, 0.088, 0.045, orangeGlass, 0.075, 24);
      const pupil = addFrontCylinder(eye, 0.042, 0.028, pupilGlow, 0.11, 20);

      const eyeLight = new THREE.PointLight(0xff6600, 3.5, 2.2);
      eyeLight.position.z = 0.35;
      eye.add(eyeLight);
      return { eye, lens, pupil };
    };

    const leftEye = createEye(-1);
    const rightEye = createEye(1);

    const brow = makePlate(0.58, 0.05, 0.035, armorDark);
    brow.position.set(0, 0.26, 0.69);
    head.add(brow);

    const mouthLight = makePlate(0.24, 0.025, 0.025, orangeGlow);
    mouthLight.position.set(0, -0.29, 0.68);
    head.add(mouthLight);

    // Single sleek antenna on top-RIGHT of helmet (exact match to og-image-orange.jpg)
    const antenna = makeCylinder(0.018, 0.026, 0.62, armorEdge, 8);
    antenna.position.set(0.44, 0.68, 0);
    antenna.rotation.z = -0.07;
    head.add(antenna);
    const antennaTip = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 12), orangeGlow));
    antennaTip.position.set(0.46, 1.0, 0);
    head.add(antennaTip);

    // Robot arms with layered pauldrons & glowing joint rings
    const createArm = (side: -1 | 1): RobotArm => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 1.04, 1.58, 0);
      root.add(shoulder);

      const shoulderJoint = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 12), jointMaterial));
      shoulder.add(shoulderJoint);
      const shoulderRing = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.06, 8, 18), orangeMetal);
      shoulderRing.rotation.y = Math.PI / 2;
      shoulderRing.position.x = side * 0.02;
      shoulder.add(shoulderRing);
      const shoulderCap = applyShadow(new THREE.Mesh(new THREE.DodecahedronGeometry(0.44, 0), armor));
      shoulderCap.scale.set(1.1, 0.72, 0.78);
      shoulderCap.position.set(side * 0.14, 0.08, 0);
      shoulder.add(shoulderCap);

      const upper = makeCylinder(0.22, 0.18, 0.72, armorMid, 8);
      upper.position.y = -0.55;
      shoulder.add(upper);
      const upperAccent = makePlate(0.06, 0.5, 0.05, orangeMetal);
      upperAccent.position.set(side * 0.18, -0.54, 0.18);
      shoulder.add(upperAccent);

      const elbow = new THREE.Group();
      elbow.position.y = -1.02;
      shoulder.add(elbow);
      const elbowJoint = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), jointMaterial));
      elbow.add(elbowJoint);
      const elbowRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 6, 14), orangeMetal);
      elbowRing.rotation.x = Math.PI / 2;
      elbow.add(elbowRing);

      const forearmTwistGroup = new THREE.Group();
      elbow.add(forearmTwistGroup);

      const forearm = makeCylinder(0.2, 0.27, 0.62, armor, 8);
      forearm.position.y = -0.48;
      forearmTwistGroup.add(forearm);
      const forearmGuard = makePlate(0.34, 0.42, 0.19, armorMid);
      forearmGuard.position.set(0, -0.45, 0.19);
      forearmTwistGroup.add(forearmGuard);

      const wrist = new THREE.Group();
      wrist.position.y = -0.88;
      forearmTwistGroup.add(wrist);
      const wristJoint = makeCylinder(0.13, 0.13, 0.16, orangeMetal, 12);
      wrist.add(wristJoint);
      const hand = makePlate(0.38, 0.3, 0.34, armor);
      hand.position.y = -0.22;
      wrist.add(hand);
      const fingers: THREE.Group[] = [];
      for (let finger = -1; finger <= 1; finger += 1) {
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(finger * 0.1, -0.32, 0.02);
        wrist.add(fingerGroup);
        const digit = makePlate(0.065, 0.2, 0.085, armorEdge);
        digit.position.y = -0.1;
        fingerGroup.add(digit);
        const tip = makePlate(0.055, 0.1, 0.075, armorMid);
        tip.position.y = -0.22;
        fingerGroup.add(tip);
        fingers.push(fingerGroup);
      }
      return { shoulder, elbow, wrist, forearmTwistGroup, fingers };
    };

    const leftArm = createArm(-1);
    const rightArm = createArm(1);

    const createLeg = (side: -1 | 1) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.39, -0.35, 0);
      root.add(hip);

      const hipJoint = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), jointMaterial));
      hip.add(hipJoint);
      const thigh = makeCylinder(0.26, 0.2, 0.85, armorMid, 8);
      thigh.position.y = -0.62;
      hip.add(thigh);
      const thighPlate = makePlate(0.33, 0.55, 0.16, armor);
      thighPlate.position.set(0, -0.56, 0.22);
      hip.add(thighPlate);

      const knee = new THREE.Group();
      knee.position.y = -1.15;
      hip.add(knee);
      const kneeJoint = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), jointMaterial));
      knee.add(kneeJoint);
      const kneePlate = applyShadow(new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), orangeMetal));
      kneePlate.scale.set(0.78, 0.9, 0.55);
      kneePlate.position.z = 0.23;
      knee.add(kneePlate);

      const shin = makeCylinder(0.2, 0.25, 0.78, armor, 8);
      shin.position.y = -0.55;
      knee.add(shin);
      const shinGuard = makePlate(0.32, 0.56, 0.16, armorMid);
      shinGuard.position.set(0, -0.52, 0.22);
      knee.add(shinGuard);

      const ankle = makeCylinder(0.13, 0.13, 0.17, orangeMetal, 10);
      ankle.position.y = -1;
      knee.add(ankle);
      const foot = makePlate(0.5, 0.28, 0.75, armor);
      foot.position.set(0, -1.18, 0.17);
      knee.add(foot);
      const toe = makePlate(0.42, 0.12, 0.22, orangeMetal);
      toe.position.set(0, -1.18, 0.58);
      knee.add(toe);
      return hip;
    };

    const leftLeg = createLeg(-1);
    const rightLeg = createLeg(1);

    const hologram = new THREE.Group();
    hologram.position.set(1.9, 1.25, 0.15);
    root.add(hologram);
    const hologramMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const hologramPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.32), hologramMaterial);
    hologram.add(hologramPanel);
    const hologramEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(hologramPanel.geometry),
      new THREE.LineBasicMaterial({ color: 0xff9a4f, transparent: true, opacity: 0 }),
    );
    hologram.add(hologramEdges);

    const floorRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5e00,
      transparent: true,
      opacity: 0.5,
    });
    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.018, 8, 90),
      floorRingMaterial,
    );
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = -2.72;
    root.add(floorRing);

    const particlePositions = new Float32Array(65 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      particlePositions[index] = (Math.random() - 0.5) * 6;
      particlePositions[index + 1] = (Math.random() - 0.5) * 7;
      particlePositions[index + 2] = (Math.random() - 0.5) * 3;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xff7a22,
        size: 0.03,
        transparent: true,
        opacity: 0.4,
      }),
    );
    root.add(particles);

    // Ambient: slightly warm dark — body stays near-black, silver edges catch specular
    const ambient = new THREE.HemisphereLight(0x241510, 0x060402, 1.1);
    // Key light: warm orange-white from front-right top — illuminates silver facet edges
    const key = new THREE.DirectionalLight(0xffa060, 3.8);
    key.position.set(4, 6, 7);
    key.castShadow = true;
    // Strong orange rim — the dramatic halo visible in reference
    const orangeRim = new THREE.PointLight(0xff5500, 32, 20);
    orangeRim.position.set(2.5, 3.8, -1.5);
    // Secondary rim from opposite side — subtle
    const coolRim = new THREE.PointLight(0x602010, 6, 14);
    coolRim.position.set(-3.5, 2, 0.5);
    // Under glow — floor-bounce orange
    const underGlow = new THREE.PointLight(0xff4400, 16, 10);
    underGlow.position.set(0, -1.6, 2.8);
    // Fill light from front — makes silver edges visible as silver/white specular
    const frontFill = new THREE.PointLight(0xffe8d0, 2.5, 12);
    frontFill.position.set(0, 1.5, 8);
    scene.add(ambient, key, orangeRim, coolRim, underGlow, frontFill);

    const pointer = new THREE.Vector2();
    let scrollVelocity = 0;
    let lastScroll = window.scrollY;
    let animationFrame = 0;
    let isRendering = false;
    let lastPointerActivity = Number.NEGATIVE_INFINITY;

    // ── Spring / gravity physics state ───────────────────────────────────────
    // Each spring: { pos, vel } — pos is displacement from rest, vel is velocity
    type Sp = { pos: number; vel: number };
    const mkSp = (): Sp => ({ pos: 0, vel: 0 });
    const sp = {
      headX:   mkSp(), headY:   mkSp(),
      torso:   mkSp(),
      lShoulderZ: mkSp(), rShoulderZ: mkSp(),
      lShoulderX: mkSp(), rShoulderX: mkSp(),
      lElbow: mkSp(),   rElbow: mkSp(),
      lWrist: mkSp(),   rWrist: mkSp(),
      lLeg:   mkSp(),   rLeg:   mkSp(),
    };
    // Integrate a spring toward target, returns new pos
    const springClamped = (
      s: Sp,
      target: number,
      stiffness: number,
      damping: number,
      dt: number,
      maxPosition: number,
      maxVelocity: number,
    ): number => {
      const err = s.pos - target;
      s.vel += (-stiffness * err - damping * s.vel) * dt;
      s.vel = THREE.MathUtils.clamp(s.vel, -maxVelocity, maxVelocity);
      s.pos += s.vel * dt;
      s.pos = THREE.MathUtils.clamp(s.pos, -maxPosition, maxPosition);
      return s.pos;
    };
    // Apply an impulse (velocity kick) to a spring
    const kick = (s: Sp, impulse: number) => { s.vel += impulse; };
    // ─────────────────────────────────────────────────────────────────────────

    const onPointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -(event.clientY / window.innerHeight) * 2 + 1;

      // Velocity of pointer movement
      const dvx = nx - pointer.x;
      const dvy = ny - pointer.y;
      const speed = Math.sqrt(dvx * dvx + dvy * dvy);

      if (speed > 0.004 && !reducedMotionRef.current) {
        // Scale impulse — faster swipe = bigger kick
        const imp = Math.min(speed * 6, 0.8);
        // Head wobbles toward swipe direction
        kick(sp.headX, -dvx * imp * 1.8);
        kick(sp.headY, dvy * imp * 1.2);
        // Torso sway
        kick(sp.torso, dvx * imp * 0.5);
        // Arms react — left/right based on which side of screen
        if (nx < 0) {
          kick(sp.lShoulderZ, -imp * 0.55);
          kick(sp.lElbow, imp * 0.4);
          kick(sp.lWrist, imp * 0.8);
        } else {
          kick(sp.rShoulderZ, imp * 0.55);
          kick(sp.rElbow, -imp * 0.4);
          kick(sp.rWrist, -imp * 0.8);
        }
        // Legs subtle sway
        kick(sp.lLeg, dvy * imp * 0.18);
        kick(sp.rLeg, -dvy * imp * 0.18);
      }

      pointer.x = nx;
      pointer.y = ny;
      lastPointerActivity = performance.now();
    };
    const onPointerLeave = () => {
      lastPointerActivity = Number.NEGATIVE_INFINITY;
    };
    const onScroll = () => {
      const rawDelta = window.scrollY - lastScroll;
      const delta = THREE.MathUtils.clamp(rawDelta, -50, 50);
      lastScroll = window.scrollY;
      if (reducedMotionRef.current) {
        scrollVelocity = 0;
        Object.values(sp).forEach((springState) => {
          springState.pos = 0;
          springState.vel = 0;
        });
        return;
      }
      scrollVelocity = THREE.MathUtils.clamp(
        scrollVelocity + delta * 0.002,
        -0.18,
        0.18,
      );
      kick(sp.torso, delta * 0.0015);
      kick(sp.headY, -delta * 0.001);
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setWebglUnavailable(true);
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    let previousZone = zoneRef.current;
    let transitionStartX = root.position.x;
    let transitionStartY = root.position.y;
    let transitionStartScale = root.scale.x;
    const clock = new THREE.Clock();
    const render = () => {
      if (document.hidden) {
        isRendering = false;
        return;
      }
      isRendering = true;
      animationFrame = window.requestAnimationFrame(render);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const zone = zoneRef.current;
      const viewportWidth = window.innerWidth;
      const basePose = (viewportWidth < 900 ? mobilePoses : desktopPoses)[zone];
      const compactDesktop = viewportWidth >= 900 && viewportWidth < 1180;
      const targetScale = compactDesktop ? basePose.scale * 0.88 : basePose.scale;
      const targetX = compactDesktop ? basePose.x * 0.72 : basePose.x;

      const motion = !reducedMotionRef.current;
      const now = performance.now();
      const timeSinceEntry = now - zoneEntryTimeRef.current;
      let phase = transitionPhaseRef.current;
      if (zone !== previousZone) {
        transitionStartX = root.position.x;
        transitionStartY = root.position.y;
        transitionStartScale = root.scale.x;
        previousZone = zone;
      }
      if (!motion) {
        scrollVelocity = 0;
        Object.values(sp).forEach((springState) => {
          springState.pos = 0;
          springState.vel = 0;
        });
        phase = "gesture";
        transitionPhaseRef.current = phase;
      } else if (phase === "neutral" && timeSinceEntry >= 280) {
        phase = "traveling";
        transitionPhaseRef.current = phase;
      } else if (phase === "traveling" && timeSinceEntry >= 700) {
        phase = "gesture";
        transitionPhaseRef.current = phase;
      }
      // Slow breathing idle oscillation
      const idle  = motion ? Math.sin(elapsed * 1.35) * 0.045 : 0;
      const breathe = motion ? Math.sin(elapsed * 1.6) * 0.008 : 0;

      // ── Root pose ─────────────────────────────────────────────────────────
      if (!motion) {
        root.position.x = targetX;
        root.position.y = basePose.y;
        root.scale.setScalar(targetScale);
      } else if (phase === "neutral") {
        root.position.x = transitionStartX;
        root.position.y = transitionStartY;
        root.scale.setScalar(transitionStartScale);
      } else if (phase === "traveling") {
        const progress = THREE.MathUtils.clamp((timeSinceEntry - 280) / 420, 0, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        root.position.x = THREE.MathUtils.lerp(transitionStartX, targetX, easedProgress);
        root.position.y = THREE.MathUtils.lerp(
          transitionStartY,
          basePose.y + idle,
          easedProgress,
        );
        root.scale.setScalar(
          THREE.MathUtils.lerp(transitionStartScale, targetScale, easedProgress),
        );
      } else {
        root.position.x = THREE.MathUtils.damp(root.position.x, targetX, 3.1, delta);
        root.position.y = THREE.MathUtils.damp(
          root.position.y,
          basePose.y + idle,
          3.1,
          delta,
        );
        root.scale.setScalar(
          THREE.MathUtils.damp(root.scale.x, targetScale, 3.2, delta),
        );
      }
      const torsoSpring = springClamped(sp.torso, 0, 14, 7.5, delta, 0.3, 1.5);
      root.rotation.y = THREE.MathUtils.damp(
        root.rotation.y,
        basePose.rotation + scrollVelocity + torsoSpring * 0.18,
        3.5, delta,
      );
      // Torso breathe + spring sway
      torso.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
      torso.rotation.y = motion ? Math.sin(elapsed * 0.82) * 0.018 : 0;
      scrollVelocity = THREE.MathUtils.damp(scrollVelocity, 0, 6, delta);

      // ── Head: FIX — bob AROUND base y=2.7, never overwrite it ─────────────
      const pointerIsActive = motion && performance.now() - lastPointerActivity < 1800;
      const automaticGaze = sectionGaze[zone];
      const gazeX = pointerIsActive
        ? pointer.x * 0.36
        : automaticGaze.x + (motion ? Math.sin(elapsed * 0.55) * 0.045 : 0);
      const gazeY = pointerIsActive
        ? -pointer.y * 0.17
        : automaticGaze.y + (motion ? Math.sin(elapsed * 0.8) * 0.018 : 0);

      // Spring physics add on top of gaze target
      const headSpX = springClamped(sp.headX, 0, 16, 8, delta, 0.45, 2);
      const headSpY = springClamped(sp.headY, 0, 16, 8, delta, 0.45, 2);
      head.rotation.y = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(head.rotation.y, gazeX + headSpX * 0.4, 7, delta),
        -0.55,
        0.55,
      );
      head.rotation.x = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(head.rotation.x, gazeY + headSpY * 0.25, 7, delta),
        -0.35,
        0.35,
      );
      // ⚠️ CRITICAL: add to base y=2.7, never zero it out
      const headBob = motion ? Math.sin(elapsed * 1.35 + 0.4) * 0.018 : 0;
      head.position.y = 2.7 + headBob + headSpY * 0.04;

      // ── Eyes & blink ──────────────────────────────────────────────────────
      const pupilX = pointerIsActive ? pointer.x * 0.025 : automaticGaze.x * 0.035;
      const pupilY = pointerIsActive ? pointer.y * 0.018 : -automaticGaze.y * 0.025;
      leftEye.pupil.position.x  = THREE.MathUtils.damp(leftEye.pupil.position.x,  pupilX, 14, delta);
      leftEye.pupil.position.y  = THREE.MathUtils.damp(leftEye.pupil.position.y,  pupilY, 14, delta);
      rightEye.pupil.position.x = THREE.MathUtils.damp(rightEye.pupil.position.x, pupilX, 14, delta);
      rightEye.pupil.position.y = THREE.MathUtils.damp(rightEye.pupil.position.y, pupilY, 14, delta);
      const blink = motion && Math.sin(elapsed * 0.72) > 0.985 ? 0.18 : 1;
      leftEye.lens.scale.y  = blink; leftEye.pupil.scale.y  = blink;
      rightEye.lens.scale.y = blink; rightEye.pupil.scale.y = blink;

      // ── Arm targets (zone-based) ───────────────────────────────────────────
      let leftShoulderTarget  = motion ? -0.06 + Math.sin(elapsed * 0.85) * 0.025 : -0.06;
      let rightShoulderTarget = motion ?  0.06 - Math.sin(elapsed * 0.85) * 0.025 :  0.06;
      let leftElbowTarget  = motion ? Math.sin(elapsed * 0.9) * 0.02 : 0;
      let rightElbowTarget = motion ? -Math.sin(elapsed * 0.9) * 0.02 : 0;
      let leftWristTarget = 0, rightWristTarget = 0;
      let armDepth = motion ? Math.sin(elapsed * 0.7) * 0.018 : 0;

      const heroGreeting =
        zone === "hero" && motion && phase === "gesture" && timeSinceEntry < 3200;
      const contactWaveActive =
        zone === "contact" && motion && phase === "gesture" && timeSinceEntry > 400;
      if (heroGreeting) {
        rightShoulderTarget = 0.92; rightElbowTarget = -0.38;
        rightWristTarget = Math.sin(elapsed * 6.5) * 0.28; armDepth = -0.1;
      } else if (zone === "about") {
        leftShoulderTarget = -1.08; leftElbowTarget = 0.48;
        leftWristTarget = -0.18; armDepth = 0.08;
      } else if (zone === "capabilities") {
        rightShoulderTarget = 0.95; rightElbowTarget = -0.52;
        rightWristTarget = 0.12; armDepth = -0.1;
      } else if (zone === "career") {
        rightShoulderTarget = 0.82; rightElbowTarget = -0.42;
        rightWristTarget = 0.1; armDepth = -0.07;
      } else if (zone === "work") {
        leftShoulderTarget = -0.78; leftElbowTarget = 0.4;
        leftWristTarget = -0.12; armDepth = 0.08;
      } else if (zone === "toolkit") {
        leftShoulderTarget = -0.55; leftElbowTarget = 0.35;
        leftWristTarget = -0.08;
        rightShoulderTarget = 0.48; rightElbowTarget = -0.3;
        rightWristTarget = 0.06; armDepth = -0.04;
      } else if (zone === "contact") {
        rightShoulderTarget = 0.92; rightElbowTarget = -0.38;
        rightWristTarget = contactWaveActive ? Math.sin(elapsed * 5.4) * 0.28 : 0.08;
        armDepth = -0.1;
      }

      const gestureBlend =
        phase === "gesture"
          ? timeSinceEntry < 700
            ? 1
            : THREE.MathUtils.clamp((timeSinceEntry - 700) / 400, 0, 1)
          : 0;
      const leftShoulderRest = -0.06;
      const rightShoulderRest = 0.06;
      leftShoulderTarget = THREE.MathUtils.lerp(
        leftShoulderRest,
        leftShoulderTarget,
        gestureBlend,
      );
      rightShoulderTarget = THREE.MathUtils.lerp(
        rightShoulderRest,
        rightShoulderTarget,
        gestureBlend,
      );
      leftElbowTarget *= gestureBlend;
      rightElbowTarget *= gestureBlend;
      leftWristTarget *= gestureBlend;
      rightWristTarget *= gestureBlend;
      armDepth *= gestureBlend;

      const torsoCounterLean = !motion
        ? 0
        : rightShoulderTarget > 0.7
          ? 0.045
          : leftShoulderTarget < -0.7
            ? -0.045
            : 0;
      root.rotation.z = THREE.MathUtils.damp(
        root.rotation.z,
        (motion ? Math.sin(elapsed * 0.72) * 0.008 : 0) + torsoCounterLean,
        3.5,
        delta,
      );

      // ── Physics springs added on top of zone targets ───────────────────────
      const lsz = springClamped(sp.lShoulderZ, 0, 20, 8, delta, 0.55, 2.5);
      const rsz = springClamped(sp.rShoulderZ, 0, 20, 8, delta, 0.55, 2.5);
      const lsx = springClamped(sp.lShoulderX, 0, 18, 7.5, delta, 0.4, 2);
      const rsx = springClamped(sp.rShoulderX, 0, 18, 7.5, delta, 0.4, 2);
      const lez = springClamped(sp.lElbow, 0, 22, 8, delta, 0.45, 2);
      const rez = springClamped(sp.rElbow, 0, 22, 8, delta, 0.45, 2);
      const lwz = springClamped(sp.lWrist, 0, 26, 8, delta, 0.35, 1.8);
      const rwz = springClamped(sp.rWrist, 0, 26, 8, delta, 0.35, 1.8);
      const llx = springClamped(sp.lLeg, 0, 18, 7, delta, 0.2, 1);
      const rlx = springClamped(sp.rLeg, 0, 18, 7, delta, 0.2, 1);

      // Gravity droop on arms — forearms hang naturally
      const gravityDroop = motion ? 0.06 : 0;

      leftArm.shoulder.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          leftArm.shoulder.rotation.z,
          leftShoulderTarget + lsz * 0.55,
          5,
          delta,
        ),
        -2.3,
        2.3,
      );
      rightArm.shoulder.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          rightArm.shoulder.rotation.z,
          rightShoulderTarget + rsz * 0.55,
          5,
          delta,
        ),
        -2.3,
        2.3,
      );
      leftArm.elbow.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          leftArm.elbow.rotation.z,
          leftElbowTarget + lez * 0.45 + gravityDroop,
          6,
          delta,
        ),
        -1.4,
        1.4,
      );
      rightArm.elbow.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          rightArm.elbow.rotation.z,
          rightElbowTarget + rez * 0.45 - gravityDroop,
          6,
          delta,
        ),
        -1.4,
        1.4,
      );
      leftArm.shoulder.rotation.x = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          leftArm.shoulder.rotation.x,
          armDepth + lsx * 0.35,
          7,
          delta,
        ),
        -0.6,
        0.6,
      );
      rightArm.shoulder.rotation.x = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          rightArm.shoulder.rotation.x,
          -armDepth + rsx * 0.35,
          7,
          delta,
        ),
        -0.6,
        0.6,
      );
      leftArm.wrist.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          leftArm.wrist.rotation.z,
          leftWristTarget + lwz * 0.7,
          8,
          delta,
        ),
        -0.65,
        0.65,
      );
      rightArm.wrist.rotation.z = THREE.MathUtils.clamp(
        THREE.MathUtils.damp(
          rightArm.wrist.rotation.z,
          rightWristTarget + rwz * 0.7,
          8,
          delta,
        ),
        -0.65,
        0.65,
      );

      // Legs — subtle sway with spring
      let leftFingerCurl = 0.14;
      let rightFingerCurl = 0.14;
      let leftForearmTwist = 0;
      let rightForearmTwist = 0;
      if (zone === "about" || zone === "work") {
        leftFingerCurl = 0.06;
        leftForearmTwist = -0.12;
      }
      if (
        heroGreeting ||
        contactWaveActive ||
        zone === "capabilities" ||
        zone === "career"
      ) {
        rightFingerCurl = 0.04;
        rightForearmTwist = 0.14;
      }
      if (zone === "toolkit") {
        leftFingerCurl = 0.08;
        rightFingerCurl = 0.08;
        leftForearmTwist = -0.08;
        rightForearmTwist = 0.08;
      }
      leftFingerCurl *= gestureBlend;
      rightFingerCurl *= gestureBlend;
      leftForearmTwist *= gestureBlend;
      rightForearmTwist *= gestureBlend;
      leftArm.fingers.forEach((finger) => {
        finger.rotation.x = THREE.MathUtils.damp(
          finger.rotation.x,
          leftFingerCurl,
          6,
          delta,
        );
      });
      rightArm.fingers.forEach((finger) => {
        finger.rotation.x = THREE.MathUtils.damp(
          finger.rotation.x,
          rightFingerCurl,
          6,
          delta,
        );
      });
      leftArm.forearmTwistGroup.rotation.y = THREE.MathUtils.damp(
        leftArm.forearmTwistGroup.rotation.y,
        leftForearmTwist,
        5,
        delta,
      );
      rightArm.forearmTwistGroup.rotation.y = THREE.MathUtils.damp(
        rightArm.forearmTwistGroup.rotation.y,
        rightForearmTwist,
        5,
        delta,
      );

      const baseL = motion ? Math.sin(elapsed * 1.2) * 0.014 : 0;
      const baseR = motion ? -Math.sin(elapsed * 1.2) * 0.014 : 0;
      leftLeg.rotation.x  = baseL + llx * 0.12;
      rightLeg.rotation.x = baseR + rlx * 0.12;

      // ── FX ────────────────────────────────────────────────────────────────
      const hologramOpacity =
        phase === "gesture" &&
        timeSinceEntry > 600 &&
        (zone === "capabilities" || zone === "work" || zone === "toolkit")
          ? 0.18
          : 0;
      hologramMaterial.opacity = THREE.MathUtils.damp(hologramMaterial.opacity, hologramOpacity, 4, delta);
      const edgeMaterial = hologramEdges.material as THREE.LineBasicMaterial;
      edgeMaterial.opacity = THREE.MathUtils.damp(edgeMaterial.opacity, hologramOpacity * 3.2, 4, delta);
      hologram.rotation.y = motion ? Math.sin(elapsed * 0.7) * 0.08 : 0;
      chestCore.rotation.y += motion ? delta * 1.2 : 0;
      reactorOrangeRing.rotation.z -= motion ? delta * 0.2 : 0;
      reactorLight.intensity = 16 + (motion ? Math.sin(elapsed * 2.4) * 2.5 : 0);
      floorRing.rotation.z  += motion ? delta * 0.15 : 0;
      const travelEffect = motion && phase === "traveling";
      const floorRingScale = travelEffect
        ? 1 + Math.abs(Math.sin(timeSinceEntry * 0.015)) * 0.25
        : 1;
      floorRing.scale.setScalar(
        THREE.MathUtils.damp(floorRing.scale.x, floorRingScale, 8, delta),
      );
      floorRingMaterial.opacity = THREE.MathUtils.damp(
        floorRingMaterial.opacity,
        travelEffect ? 0.82 : 0.5,
        8,
        delta,
      );
      particles.rotation.y  += motion ? delta * 0.025 : 0;

      renderer.render(scene, camera);
    };

    const onVisibilityChange = () => {
      if (!document.hidden && !isRendering) {
        render();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`character-stage character-zone-${activeZone}`} aria-hidden="true">
      <div ref={mountRef} className="character-canvas" />
      {webglUnavailable && (
        <div className="character-fallback">
          <span className="fallback-antenna" />
          <span className="fallback-face">
            <i />
            <i />
          </span>
          <span className="fallback-body" />
        </div>
      )}
    </div>
  );
};

export type { CharacterZone };
export default ProceduralCharacter;
