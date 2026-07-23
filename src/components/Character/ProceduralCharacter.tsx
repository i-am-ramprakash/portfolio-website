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
  motionPaused: boolean;
  celebrationSignal: number;
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
  hero: { x: 0, y: 0, scale: 0.8, rotation: 0 },
  about: { x: 3.6, y: 0, scale: 0.72, rotation: -0.18 },
  capabilities: { x: -3.6, y: 0, scale: 0.7, rotation: 0.2 },
  career: { x: -3.8, y: 0, scale: 0.68, rotation: 0.22 },
  work: { x: 3.7, y: 0, scale: 0.66, rotation: -0.2 },
  toolkit: { x: 3.45, y: 0, scale: 0.6, rotation: -0.16 },
  contact: { x: -2.8, y: 0, scale: 0.76, rotation: 0.16 },
};

const mobilePoses: Record<CharacterZone, Pose> = {
  hero: { x: 0, y: 0, scale: 0.72, rotation: 0 },
  about: { x: 1.5, y: 0, scale: 0.56, rotation: -0.28 },
  capabilities: { x: -1.5, y: 0, scale: 0.52, rotation: 0.3 },
  career: { x: -1.6, y: 0, scale: 0.5, rotation: 0.3 },
  work: { x: 1.5, y: 0, scale: 0.5, rotation: -0.28 },
  toolkit: { x: -0.8, y: 0, scale: 0.5, rotation: 0.1 },
  contact: { x: -1.4, y: 0, scale: 0.52, rotation: 0.26 },
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

const ProceduralCharacter = ({
  activeZone,
  reducedMotion,
  motionPaused,
  celebrationSignal,
}: ProceduralCharacterProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef(activeZone);
  const reducedMotionRef = useRef(reducedMotion);
  const motionPausedRef = useRef(motionPaused);
  const celebrationTimeRef = useRef(Number.NEGATIVE_INFINITY);
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
    motionPausedRef.current = motionPaused;
  }, [motionPaused]);

  useEffect(() => {
    if (celebrationSignal > 0) celebrationTimeRef.current = performance.now();
  }, [celebrationSignal]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    type QualityLevel = 0 | 1 | 2;
    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const processorCount = navigator.hardwareConcurrency || 4;
    let qualityLevel: QualityLevel =
      deviceMemory >= 8 && processorCount >= 8 ? 2 : deviceMemory >= 4 ? 1 : 0;
    if (window.innerWidth < 900 && qualityLevel === 2) qualityLevel = 1;
    const qualityDpr = [1, 1.15, 1.5] as const;

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityDpr[qualityLevel]));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = qualityLevel > 0 && window.innerWidth >= 900;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 10.5);

    const root = new THREE.Group();
    scene.add(root);

    // Dark charcoal armor matching og-image-orange.jpg — faceted dark panels with silver metallic sheen on edges
    const armor = new THREE.MeshStandardMaterial({
      color: 0x929ba4,
      metalness: 0.78,
      roughness: 0.3,
      envMapIntensity: 1.2,
    });
    const armorDark = new THREE.MeshStandardMaterial({
      color: 0x252b31,
      metalness: 0.76,
      roughness: 0.38,
    });
    const armorMid = new THREE.MeshStandardMaterial({
      color: 0x5f6973,
      metalness: 0.74,
      roughness: 0.32,
    });
    // Silver-tinted edge highlight — catches the orange rim as white-silver specular
    const armorEdge = new THREE.MeshStandardMaterial({
      color: 0xd7dde2,
      metalness: 0.86,
      roughness: 0.16,
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
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      return mesh;
    };
    const markMajorShadow = (mesh: THREE.Mesh) => {
      mesh.userData.majorShadow = true;
      mesh.castShadow = renderer.shadowMap.enabled;
      mesh.receiveShadow = renderer.shadowMap.enabled;
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

    // Torso: Faceted chest armor with seams matching og-image-orange.jpg
    const torso = new THREE.Group();
    torso.position.y = 1.08;
    root.add(torso);

    const ribCage = markMajorShadow(
      new THREE.Mesh(new THREE.DodecahedronGeometry(1.03, 0), armor),
    );
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

    const helmet = markMajorShadow(
      new THREE.Mesh(new THREE.DodecahedronGeometry(0.74, 0), armor),
    );
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
      markMajorShadow(upper);
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
      markMajorShadow(forearm);
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
      markMajorShadow(thigh);
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
      markMajorShadow(shin);
      shin.position.y = -0.55;
      knee.add(shin);
      const shinGuard = makePlate(0.32, 0.56, 0.16, armorMid);
      shinGuard.position.set(0, -0.52, 0.22);
      knee.add(shinGuard);

      const ankle = makeCylinder(0.13, 0.13, 0.17, orangeMetal, 10);
      ankle.position.y = -1;
      knee.add(ankle);
      const foot = makePlate(0.5, 0.28, 0.75, armor);
      markMajorShadow(foot);
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
    // Fill light from front — makes silver edges visible as silver/white specular
    const frontFill = new THREE.PointLight(0xffe8d0, 2.5, 12);
    frontFill.position.set(0, 1.5, 8);
    scene.add(ambient, key, orangeRim, frontFill);

    root.updateWorldMatrix(true, true);
    const modelBounds = new THREE.Box3();
    [
      torso,
      spine,
      waist,
      beltCore,
      neckGroup,
      head,
      leftArm.shoulder,
      rightArm.shoulder,
      leftLeg,
      rightLeg,
    ].forEach((part) => modelBounds.expandByObject(part));
    const modelHeight = Math.max(modelBounds.max.y - modelBounds.min.y, 0.001);
    const modelWidth = Math.max(modelBounds.max.x - modelBounds.min.x, 0.001);
    const modelCenterY = (modelBounds.max.y + modelBounds.min.y) / 2;
    let navbarSafeBottom = 0;

    const updateCameraFit = () => {
      const navbarBottom =
        document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().bottom ?? 0;
      navbarSafeBottom = navbarBottom;
    };

    const getFittedFrame = (zone: CharacterZone, desiredScale: number) => {
      const viewportHeight = window.innerHeight;
      const sectionSafeTop =
        zone === "work"
          ? viewportHeight * 0.3
          : zone === "toolkit"
            ? viewportHeight * 0.34
            : 0;
      const safeTop = Math.max(navbarSafeBottom + 60, sectionSafeTop);
      const safeBottom = viewportHeight - 32;
      const worldHeight =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) *
        Math.abs(camera.position.z);
      const maximumScale =
        (worldHeight * ((safeBottom - safeTop) / viewportHeight) * 0.96) / modelHeight;
      const worldWidth = worldHeight * camera.aspect;
      const maximumHorizontalScale = (worldWidth * 0.92) / (modelWidth + 1.6);
      const scale = Math.min(desiredScale, maximumScale, maximumHorizontalScale);
      const safeCenterPx = (safeTop + safeBottom) / 2;
      const safeCenterNdcY = 1 - (safeCenterPx / viewportHeight) * 2;
      const centerY = camera.position.y + safeCenterNdcY * (worldHeight / 2);
      return { scale, y: centerY - modelCenterY * scale };
    };

    const screenFractionForZone: Record<CharacterZone, number> = {
      hero: 0.5,
      about: 0.8,
      capabilities: 0.2,
      career: 0.2,
      work: 0.82,
      toolkit: 0.8,
      contact: 0.22,
    };
    const getTargetX = (zone: CharacterZone, fallbackX: number, scale: number) => {
      const worldHeight =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) *
        Math.abs(camera.position.z);
      const worldWidth = worldHeight * camera.aspect;
      const desiredX =
        window.innerWidth < 900
          ? fallbackX
          : (screenFractionForZone[zone] * 2 - 1) * (worldWidth / 2);
      const maximumX = Math.max(worldWidth / 2 - (modelWidth * scale) / 2 - 0.08, 0);
      return THREE.MathUtils.clamp(desiredX, -maximumX, maximumX);
    };

    const applyRendererQuality = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityDpr[qualityLevel]));
      renderer.shadowMap.enabled = qualityLevel > 0 && window.innerWidth >= 900;
      key.castShadow = renderer.shadowMap.enabled;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.majorShadow) {
          object.castShadow = renderer.shadowMap.enabled;
          object.receiveShadow = renderer.shadowMap.enabled;
        }
      });
    };

    updateCameraFit();
    applyRendererQuality();
    const initialPose = (window.innerWidth < 900 ? mobilePoses : desktopPoses).hero;
    const initialFrame = getFittedFrame("hero", initialPose.scale);
    const initialScale = initialFrame.scale;
    root.position.set(
      getTargetX("hero", initialPose.x, initialScale),
      initialFrame.y + initialPose.y,
      0,
    );
    root.scale.setScalar(initialScale);
    root.rotation.y = initialPose.rotation;
    const rootMotion = {
      x: { value: 0 },
      y: { value: 0 },
      scale: { value: 0 },
      rotation: { value: 0 },
    };

    const pointerTarget = new THREE.Vector2();
    const pointer = new THREE.Vector2();
    const projectedHead = new THREE.Vector3();
    const pupilTarget = new THREE.Vector2();
    const projectedShoulder = new THREE.Vector3();
    const targetWorld = new THREE.Vector3();
    const rayDirection = new THREE.Vector3();
    const shoulderEuler = new THREE.Euler();
    const leftShoulderTargetQuaternion = new THREE.Quaternion();
    const rightShoulderTargetQuaternion = new THREE.Quaternion();
    type PointingPose = { shoulder: number; elbow: number };

    const screenPointToRoot = (screenX: number, screenY: number) => {
      targetWorld
        .set(
          (screenX / window.innerWidth) * 2 - 1,
          1 - (screenY / window.innerHeight) * 2,
          0.5,
        )
        .unproject(camera);
      rayDirection.copy(targetWorld).sub(camera.position).normalize();
      const distanceToPlane = -camera.position.z / rayDirection.z;
      targetWorld.copy(camera.position).addScaledVector(rayDirection, distanceToPlane);
      return root.worldToLocal(targetWorld);
    };

    const solvePointingPose = (
      targetElement: HTMLElement,
      arm: RobotArm,
      side: -1 | 1,
    ): PointingPose => {
      const rect = targetElement.getBoundingClientRect();
      arm.shoulder.getWorldPosition(projectedShoulder);
      projectedShoulder.project(camera);
      const shoulderScreenX = ((projectedShoulder.x + 1) / 2) * window.innerWidth;
      const targetScreenX =
        shoulderScreenX < rect.left
          ? rect.left + Math.min(36, rect.width * 0.2)
          : shoulderScreenX > rect.right
            ? rect.right - Math.min(36, rect.width * 0.2)
            : rect.left + rect.width / 2;
      const target = screenPointToRoot(
        targetScreenX,
        rect.top + Math.min(rect.height * 0.55, 80),
      );
      const dx = target.x - side * 1.04;
      const dy = target.y - 1.58;
      const upperLength = 1.02;
      const lowerLength = 0.88;
      const reach = THREE.MathUtils.clamp(
        Math.hypot(dx, dy),
        Math.abs(upperLength - lowerLength) + 0.02,
        upperLength + lowerLength - 0.02,
      );
      const elbowMagnitude = Math.acos(
        THREE.MathUtils.clamp(
          (reach * reach - upperLength * upperLength - lowerLength * lowerLength) /
            (2 * upperLength * lowerLength),
          -1,
          1,
        ),
      );
      const elbow = side === 1 ? -elbowMagnitude : elbowMagnitude;
      const targetAngle = Math.atan2(dx, -dy);
      const shoulder =
        targetAngle -
        Math.atan2(
          lowerLength * Math.sin(elbow),
          upperLength + lowerLength * Math.cos(elbow),
        );
      return {
        shoulder: THREE.MathUtils.clamp(shoulder, -2.15, 2.15),
        elbow: THREE.MathUtils.clamp(elbow, -1.4, 1.4),
      };
    };
    let scrollVelocity = 0;
    let lastScroll = window.scrollY;
    let animationFrame = 0;
    let isRendering = false;
    let lastPointerActivity = Number.NEGATIVE_INFINITY;
    let pointerTrackingWeight = 0;
    let frameTimeTotal = 0;
    let frameTimeSamples = 0;
    const pointingTargets = new Map<CharacterZone, HTMLElement>();
    (["about", "capabilities", "career", "work", "toolkit", "contact"] as CharacterZone[])
      .forEach((targetZone) => {
        const target = document.querySelector<HTMLElement>(
          `[data-character-target="${targetZone}"]`,
        );
        if (target) pointingTargets.set(targetZone, target);
      });

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
    type SmoothVelocity = { value: number };
    const smoothDampValue = (
      current: number,
      target: number,
      velocity: SmoothVelocity,
      smoothTime: number,
      dt: number,
      maxSpeed: number,
    ) => {
      const safeTime = Math.max(0.0001, smoothTime);
      const omega = 2 / safeTime;
      const step = omega * dt;
      const decay = 1 / (1 + step + 0.48 * step * step + 0.235 * step * step * step);
      const maximumChange = maxSpeed * safeTime;
      const change = THREE.MathUtils.clamp(
        current - target,
        -maximumChange,
        maximumChange,
      );
      const adjustedTarget = current - change;
      const temporary = (velocity.value + omega * change) * dt;
      velocity.value = (velocity.value - omega * temporary) * decay;
      const output = adjustedTarget + (change + temporary) * decay;
      if ((target - current > 0) === (output > target)) {
        velocity.value = 0;
        return target;
      }
      return output;
    };
    // Apply an impulse (velocity kick) to a spring
    const kick = (s: Sp, impulse: number) => { s.vel += impulse; };
    // ─────────────────────────────────────────────────────────────────────────

    const onPointerMove = (event: PointerEvent) => {
      if (
        window.innerWidth < 900 ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) return;
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -(event.clientY / window.innerHeight) * 2 + 1;

      pointerTarget.set(nx, ny);
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
      updateCameraFit();
      applyRendererQuality();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    let previousZone = zoneRef.current;
    let lastRenderedAt = 0;
    const clock = new THREE.Clock();
    const render = () => {
      if (document.hidden) {
        isRendering = false;
        return;
      }
      isRendering = true;
      animationFrame = window.requestAnimationFrame(render);

      const frameNow = performance.now();
      const frameInterval =
        reducedMotionRef.current || motionPausedRef.current
          ? 1000 / 12
          : window.innerWidth < 900
            ? 1000 / 30
            : 0;
      if (frameInterval && frameNow - lastRenderedAt < frameInterval) return;
      lastRenderedAt = frameNow;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      if (elapsed > 2) {
        frameTimeTotal += delta;
        frameTimeSamples += 1;
        if (frameTimeSamples >= 120) {
          const averageFps = frameTimeSamples / frameTimeTotal;
          if (averageFps < 52 && qualityLevel > 0) {
            qualityLevel = qualityLevel === 2 ? 1 : 0;
            applyRendererQuality();
          }
          frameTimeTotal = 0;
          frameTimeSamples = 0;
        }
      }
      const zone = zoneRef.current;
      const viewportWidth = window.innerWidth;
      const basePose = (viewportWidth < 900 ? mobilePoses : desktopPoses)[zone];
      const compactDesktop = viewportWidth >= 900 && viewportWidth < 1180;
      const poseScale = compactDesktop ? basePose.scale * 0.92 : basePose.scale;
      const fittedFrame = getFittedFrame(zone, poseScale);
      const targetScale = fittedFrame.scale;
      const fallbackX = compactDesktop ? basePose.x * 0.72 : basePose.x;
      const targetX = getTargetX(zone, fallbackX, targetScale);
      const targetY = fittedFrame.y + basePose.y;

      const motion = !reducedMotionRef.current && !motionPausedRef.current;
      const now = performance.now();
      const timeSinceEntry = now - zoneEntryTimeRef.current;
      const timeSinceCelebration = now - celebrationTimeRef.current;
      let phase = transitionPhaseRef.current;
      if (zone !== previousZone) {
        previousZone = zone;
        phase = "traveling";
        transitionPhaseRef.current = phase;
      }
      if (!motion) {
        scrollVelocity = 0;
        Object.values(sp).forEach((springState) => {
          springState.pos = 0;
          springState.vel = 0;
        });
        phase = "gesture";
        transitionPhaseRef.current = phase;
      } else if (phase === "neutral") {
        phase = "traveling";
        transitionPhaseRef.current = phase;
      } else if (phase === "traveling" && timeSinceEntry >= 850) {
        phase = "gesture";
        transitionPhaseRef.current = phase;
      }
      // Slow breathing idle oscillation
      const idle  = motion ? Math.sin(elapsed * 1.35) * 0.045 : 0;
      const breathe = motion ? Math.sin(elapsed * 1.6) * 0.008 : 0;

      // ── Root pose ─────────────────────────────────────────────────────────
      if (!motion) {
        root.position.x = targetX;
        root.position.y = targetY;
        root.scale.setScalar(targetScale);
        rootMotion.x.value = 0;
        rootMotion.y.value = 0;
        rootMotion.scale.value = 0;
        rootMotion.rotation.value = 0;
      } else {
        root.position.x = smoothDampValue(
          root.position.x,
          targetX,
          rootMotion.x,
          0.38,
          delta,
          14,
        );
        root.position.y = smoothDampValue(
          root.position.y,
          targetY + idle,
          rootMotion.y,
          0.42,
          delta,
          12,
        );
        root.scale.setScalar(
          smoothDampValue(
            root.scale.x,
            targetScale,
            rootMotion.scale,
            0.46,
            delta,
            1.8,
          ),
        );
      }
      const torsoSpring = springClamped(sp.torso, 0, 14, 7.5, delta, 0.3, 1.5);
      root.rotation.y = motion
        ? smoothDampValue(
            root.rotation.y,
            basePose.rotation + scrollVelocity + torsoSpring * 0.18,
            rootMotion.rotation,
            0.34,
            delta,
            1.2,
          )
        : basePose.rotation;
      // Torso breathe + spring sway
      torso.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
      torso.rotation.y = motion ? Math.sin(elapsed * 0.82) * 0.018 : 0;
      scrollVelocity = THREE.MathUtils.damp(scrollVelocity, 0, 6, delta);

      // ── Head: FIX — bob AROUND base y=2.7, never overwrite it ─────────────
      pointer.lerp(pointerTarget, 1 - Math.exp(-18 * delta));
      const pointerIsActive = motion && performance.now() - lastPointerActivity < 1800;
      pointerTrackingWeight = THREE.MathUtils.damp(
        pointerTrackingWeight,
        pointerIsActive ? 1 : 0,
        5,
        delta,
      );
      root.updateWorldMatrix(true, true);
      head.getWorldPosition(projectedHead);
      projectedHead.project(camera);
      const gazeDeltaX = pointer.x - projectedHead.x;
      const gazeDeltaY = pointer.y - projectedHead.y;
      const automaticGaze = sectionGaze[zone];
      const automaticGazeX =
        automaticGaze.x + (motion ? Math.sin(elapsed * 0.55) * 0.045 : 0);
      const automaticGazeY =
        automaticGaze.y + (motion ? Math.sin(elapsed * 0.8) * 0.018 : 0);
      const gazeX = THREE.MathUtils.lerp(
        automaticGazeX,
        THREE.MathUtils.clamp(gazeDeltaX * 0.45, -0.42, 0.42),
        pointerTrackingWeight,
      );
      const gazeY = THREE.MathUtils.lerp(
        automaticGazeY,
        THREE.MathUtils.clamp(-gazeDeltaY * 0.2, -0.22, 0.22),
        pointerTrackingWeight,
      );

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
      pupilTarget.set(
        THREE.MathUtils.lerp(automaticGaze.x * 0.035, gazeDeltaX * 0.038, pointerTrackingWeight),
        THREE.MathUtils.lerp(-automaticGaze.y * 0.025, gazeDeltaY * 0.03, pointerTrackingWeight),
      );
      if (pupilTarget.length() > 0.038) pupilTarget.setLength(0.038);
      leftEye.pupil.position.x = THREE.MathUtils.damp(
        leftEye.pupil.position.x,
        pupilTarget.x,
        18,
        delta,
      );
      leftEye.pupil.position.y = THREE.MathUtils.damp(
        leftEye.pupil.position.y,
        pupilTarget.y,
        18,
        delta,
      );
      rightEye.pupil.position.x = THREE.MathUtils.damp(
        rightEye.pupil.position.x,
        pupilTarget.x,
        18,
        delta,
      );
      rightEye.pupil.position.y = THREE.MathUtils.damp(
        rightEye.pupil.position.y,
        pupilTarget.y,
        18,
        delta,
      );
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

      const gestureDuration: Record<CharacterZone, number> = {
        hero: 4100,
        about: 2700,
        capabilities: 2500,
        career: 2400,
        work: 2700,
        toolkit: 2700,
        contact: 3400,
      };
      const gestureActive =
        motion && phase === "gesture" && timeSinceEntry < gestureDuration[zone];
      const heroWaveTime = timeSinceEntry;
      const heroGreeting =
        zone === "hero" && gestureActive && heroWaveTime >= 250 && heroWaveTime < 3600;
      const celebrationWaveActive =
        zone === "contact" && motion && timeSinceCelebration >= 0 && timeSinceCelebration < 2800;
      const contactWaveActive =
        zone === "contact" &&
        ((gestureActive && timeSinceEntry > 350) || celebrationWaveActive);
      if (heroGreeting) {
        const wave = Math.sin((heroWaveTime - 250) * 0.014);
        rightShoulderTarget = 1.68;
        rightElbowTarget = 1.05 + wave * 0.07;
        rightWristTarget = wave * 0.22;
        armDepth = -0.14;
      } else if (zone === "about" && gestureActive) {
        leftShoulderTarget = -1.08; leftElbowTarget = 0.48;
        leftWristTarget = -0.18; armDepth = 0.08;
      } else if (zone === "capabilities" && gestureActive) {
        rightShoulderTarget = 0.95; rightElbowTarget = -0.52;
        rightWristTarget = 0.12; armDepth = -0.1;
      } else if (zone === "career" && gestureActive) {
        rightShoulderTarget = 0.82; rightElbowTarget = -0.42;
        rightWristTarget = 0.1; armDepth = -0.07;
      } else if (zone === "work" && gestureActive) {
        leftShoulderTarget = -0.78; leftElbowTarget = 0.4;
        leftWristTarget = -0.12; armDepth = 0.08;
      } else if (zone === "toolkit" && gestureActive) {
        leftShoulderTarget = -0.55; leftElbowTarget = 0.35;
        leftWristTarget = -0.08;
        rightShoulderTarget = 0.48; rightElbowTarget = -0.3;
        rightWristTarget = 0.06; armDepth = -0.04;
      } else if (zone === "contact" && contactWaveActive) {
        const wave = contactWaveActive
          ? Math.sin(
              ((celebrationWaveActive ? timeSinceCelebration : timeSinceEntry) - 350) *
                0.014,
            )
          : 0;
        rightShoulderTarget = 1.68;
        rightElbowTarget = 1.05 + wave * 0.07;
        rightWristTarget = contactWaveActive ? wave * 0.22 : 0.08;
        armDepth = -0.14;
      }

      const pointingTarget = pointingTargets.get(zone);
      if (pointingTarget && gestureActive && zone === "about") {
        const pointingPose = solvePointingPose(pointingTarget, leftArm, -1);
        leftShoulderTarget = pointingPose.shoulder;
        leftElbowTarget = pointingPose.elbow;
        leftWristTarget = 0;
        armDepth = 0.06;
      } else if (
        pointingTarget &&
        gestureActive &&
        (zone === "capabilities" || zone === "career" || zone === "toolkit")
      ) {
        const pointingPose = solvePointingPose(pointingTarget, rightArm, 1);
        rightShoulderTarget = pointingPose.shoulder;
        rightElbowTarget = pointingPose.elbow;
        rightWristTarget = 0;
        armDepth = -0.06;
      } else if (pointingTarget && gestureActive && zone === "work") {
        const pointingPose = solvePointingPose(pointingTarget, leftArm, -1);
        leftShoulderTarget = pointingPose.shoulder;
        leftElbowTarget = pointingPose.elbow;
        leftWristTarget = 0;
        armDepth = 0.06;
      }

      const gestureProgress = motion
        ? THREE.MathUtils.clamp((timeSinceEntry - 180) / 620, 0, 1)
        : 1;
      const gestureEntryBlend =
        gestureProgress *
        gestureProgress *
        gestureProgress *
        (gestureProgress * (gestureProgress * 6 - 15) + 10);
      const exitProgress = THREE.MathUtils.clamp(
        (gestureDuration[zone] - timeSinceEntry) / 550,
        0,
        1,
      );
      const gestureBlend =
        celebrationWaveActive
          ? 1
          : gestureEntryBlend * exitProgress;
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

      shoulderEuler.set(
        THREE.MathUtils.clamp(armDepth + lsx * 0.35, -0.6, 0.6),
        0,
        THREE.MathUtils.clamp(leftShoulderTarget + lsz * 0.55, -2.3, 2.3),
      );
      leftShoulderTargetQuaternion.setFromEuler(shoulderEuler);
      leftArm.shoulder.quaternion.slerp(
        leftShoulderTargetQuaternion,
        1 - Math.exp(-8 * delta),
      );
      shoulderEuler.set(
        THREE.MathUtils.clamp(-armDepth + rsx * 0.35, -0.6, 0.6),
        0,
        THREE.MathUtils.clamp(rightShoulderTarget + rsz * 0.55, -2.3, 2.3),
      );
      rightShoulderTargetQuaternion.setFromEuler(shoulderEuler);
      rightArm.shoulder.quaternion.slerp(
        rightShoulderTargetQuaternion,
        1 - Math.exp(-8 * delta),
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
        leftForearmTwist = -0.5;
      }
      if (heroGreeting || contactWaveActive) {
        const waveClock = heroGreeting
          ? heroWaveTime - 250
          : (celebrationWaveActive ? timeSinceCelebration : timeSinceEntry) - 350;
        rightFingerCurl = 0.04;
        rightForearmTwist = 1.28 + Math.sin(waveClock * 0.014) * 0.08;
      } else if (zone === "capabilities" || zone === "career") {
        rightFingerCurl = 0.04;
        rightForearmTwist = 0.5;
      }
      if (zone === "toolkit") {
        leftFingerCurl = 0.08;
        rightFingerCurl = 0.04;
        leftForearmTwist = -0.08;
        rightForearmTwist = 0.5;
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

    zoneEntryTimeRef.current = performance.now();
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
