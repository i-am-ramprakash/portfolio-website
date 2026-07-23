import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type CharacterZone = "hero" | "about" | "capabilities" | "career" | "work" | "contact";

interface ProceduralCharacterProps {
  activeZone: CharacterZone;
  reducedMotion: boolean;
}

type Pose = { x: number; y: number; scale: number; rotation: number };
type RobotArm = { shoulder: THREE.Group; elbow: THREE.Group; wrist: THREE.Group };

const desktopPoses: Record<CharacterZone, Pose> = {
  hero: { x: 0, y: -1.72, scale: 0.98, rotation: 0 },
  about: { x: 3.12, y: -1.78, scale: 0.82, rotation: -0.24 },
  capabilities: { x: -3.16, y: -1.82, scale: 0.72, rotation: 0.3 },
  career: { x: 3.22, y: -2.02, scale: 0.64, rotation: -0.28 },
  work: { x: -3.24, y: -2.08, scale: 0.6, rotation: 0.3 },
  contact: { x: 3.08, y: -1.96, scale: 0.68, rotation: -0.24 },
};

const mobilePoses: Record<CharacterZone, Pose> = {
  hero: { x: 0, y: -2.12, scale: 0.68, rotation: 0 },
  about: { x: 1.45, y: -2.34, scale: 0.45, rotation: -0.33 },
  capabilities: { x: -1.48, y: -2.42, scale: 0.4, rotation: 0.38 },
  career: { x: 1.58, y: -2.48, scale: 0.36, rotation: -0.34 },
  work: { x: -1.52, y: -2.48, scale: 0.35, rotation: 0.36 },
  contact: { x: 1.42, y: -2.42, scale: 0.38, rotation: -0.28 },
};

const sectionGaze: Record<CharacterZone, { x: number; y: number }> = {
  hero: { x: 0, y: 0 },
  about: { x: 0.22, y: -0.03 },
  capabilities: { x: -0.24, y: -0.05 },
  career: { x: 0.2, y: 0.05 },
  work: { x: -0.24, y: 0 },
  contact: { x: 0.2, y: -0.02 },
};

const ProceduralCharacter = ({ activeZone, reducedMotion }: ProceduralCharacterProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef(activeZone);
  const reducedMotionRef = useRef(reducedMotion);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    zoneRef.current = activeZone;
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
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = window.innerWidth >= 800;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.55, 11.5);

    const root = new THREE.Group();
    scene.add(root);

    const armor = new THREE.MeshPhysicalMaterial({
      color: 0x1b1d20,
      metalness: 0.92,
      roughness: 0.3,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    });
    const armorDark = new THREE.MeshStandardMaterial({
      color: 0x070809,
      metalness: 0.9,
      roughness: 0.36,
    });
    const armorMid = new THREE.MeshPhysicalMaterial({
      color: 0x33363a,
      metalness: 0.9,
      roughness: 0.26,
      clearcoat: 0.3,
    });
    const armorEdge = new THREE.MeshStandardMaterial({
      color: 0x50545a,
      metalness: 0.95,
      roughness: 0.22,
    });
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0d0f,
      metalness: 0.72,
      roughness: 0.52,
    });
    const orangeMetal = new THREE.MeshStandardMaterial({
      color: 0xe94f00,
      emissive: 0x7a1600,
      emissiveIntensity: 0.35,
      metalness: 0.82,
      roughness: 0.24,
    });
    const orangeGlow = new THREE.MeshStandardMaterial({
      color: 0xffb05d,
      emissive: 0xff4b00,
      emissiveIntensity: 4,
      roughness: 0.14,
      metalness: 0.25,
    });
    const orangeGlass = new THREE.MeshPhysicalMaterial({
      color: 0xff7a19,
      emissive: 0xff3d00,
      emissiveIntensity: 2.9,
      metalness: 0.15,
      roughness: 0.08,
      transmission: 0.12,
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

    // Layered upper torso: a broad, faceted silhouette matching the social-preview robot.
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

      const accent = makePlate(0.04, 0.52, 0.025, orangeMetal);
      accent.position.set(side * 0.73, 0.2, 0.76);
      accent.rotation.z = side * 0.12;
      torso.add(accent);
    });

    // Concentric, orange chest reactor.
    const reactor = new THREE.Group();
    reactor.position.set(0, 0.04, 0.72);
    torso.add(reactor);
    addFrontCylinder(reactor, 0.39, 0.13, armorDark, 0, 12);
    const reactorOuter = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.055, 8, 12), armorEdge);
    reactorOuter.position.z = 0.09;
    reactor.add(reactorOuter);
    const reactorOrangeRing = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.04, 8, 20), orangeMetal);
    reactorOrangeRing.position.z = 0.125;
    reactor.add(reactorOrangeRing);
    const chestCore = addFrontCylinder(reactor, 0.17, 0.09, orangeGlass, 0.16, 12);
    const coreHex = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.07, 6), orangeGlow));
    coreHex.rotation.x = Math.PI / 2;
    coreHex.position.z = 0.225;
    reactor.add(coreHex);
    const reactorLight = new THREE.PointLight(0xff4d00, 5.5, 3.8);
    reactorLight.position.set(0, 0, 0.75);
    torso.add(reactorLight);

    // Armored waist and visible mechanical spine.
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

    // Short mechanical neck with illuminated collar segments.
    const neck = makeCylinder(0.22, 0.27, 0.42, jointMaterial, 12);
    neck.position.y = 2.02;
    root.add(neck);
    [-0.11, 0.11].forEach((offset) => {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 6, 18), offset > 0 ? orangeMetal : armorEdge);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 2.02 + offset;
      root.add(collar);
    });

    // Faceted helmet with temple housings, circular camera eyes, and a subtle mouth light.
    const head = new THREE.Group();
    head.position.y = 2.7;
    root.add(head);

    const helmet = applyShadow(new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 0), armor));
    helmet.scale.set(0.94, 1.03, 0.82);
    head.add(helmet);

    const crown = makePlate(0.58, 0.3, 0.12, armorMid);
    crown.position.set(0, 0.47, 0.31);
    crown.rotation.x = -0.28;
    head.add(crown);

    const facePlate = makePlate(0.9, 0.52, 0.12, armorMid);
    facePlate.position.set(0, -0.02, 0.59);
    head.add(facePlate);

    const chin = makePlate(0.55, 0.22, 0.18, armorDark);
    chin.position.set(0, -0.43, 0.48);
    chin.rotation.x = -0.2;
    head.add(chin);

    [-1, 1].forEach((side) => {
      const cheek = makePlate(0.25, 0.4, 0.11, armor);
      cheek.position.set(side * 0.42, -0.19, 0.56);
      cheek.rotation.z = side * 0.22;
      head.add(cheek);

      const temple = makeCylinder(0.24, 0.24, 0.18, armorDark, 18);
      temple.rotation.z = Math.PI / 2;
      temple.position.set(side * 0.69, 0.02, 0);
      head.add(temple);
      const templeRing = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.035, 8, 20), orangeMetal);
      templeRing.rotation.y = Math.PI / 2;
      templeRing.position.set(side * 0.79, 0.02, 0);
      head.add(templeRing);
    });

    const createEye = (side: -1 | 1) => {
      const eye = new THREE.Group();
      eye.position.set(side * 0.25, 0.07, 0.68);
      head.add(eye);
      addFrontCylinder(eye, 0.15, 0.07, armorDark, 0, 20);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.022, 8, 24), orangeMetal);
      rim.position.z = 0.055;
      eye.add(rim);
      const lens = addFrontCylinder(eye, 0.08, 0.045, orangeGlass, 0.075, 24);
      const pupil = addFrontCylinder(eye, 0.035, 0.025, orangeGlow, 0.108, 18);
      const eyeLight = new THREE.PointLight(0xff5e00, 0.8, 1.2);
      eyeLight.position.z = 0.35;
      eye.add(eyeLight);
      return { eye, lens, pupil };
    };

    const leftEye = createEye(-1);
    const rightEye = createEye(1);

    const brow = makePlate(0.56, 0.05, 0.035, armorDark);
    brow.position.set(0, 0.27, 0.68);
    head.add(brow);
    const browMark = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 3), orangeMetal));
    browMark.rotation.x = Math.PI / 2;
    browMark.rotation.z = Math.PI;
    browMark.position.set(0, 0.37, 0.68);
    head.add(browMark);

    const mouthLight = makePlate(0.25, 0.025, 0.025, orangeGlow);
    mouthLight.position.set(0, -0.29, 0.68);
    head.add(mouthLight);

    const antenna = makeCylinder(0.018, 0.025, 0.55, armorEdge, 8);
    antenna.position.set(-0.49, 0.63, 0);
    antenna.rotation.z = 0.08;
    head.add(antenna);
    const antennaTip = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), orangeGlow));
    antennaTip.position.set(-0.515, 0.91, 0);
    head.add(antennaTip);

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

      const forearm = makeCylinder(0.2, 0.27, 0.62, armor, 8);
      forearm.position.y = -0.48;
      elbow.add(forearm);
      const forearmGuard = makePlate(0.34, 0.42, 0.19, armorMid);
      forearmGuard.position.set(0, -0.45, 0.19);
      elbow.add(forearmGuard);

      const wrist = new THREE.Group();
      wrist.position.y = -0.88;
      elbow.add(wrist);
      const wristJoint = makeCylinder(0.13, 0.13, 0.16, orangeMetal, 12);
      wrist.add(wristJoint);
      const hand = makePlate(0.38, 0.3, 0.34, armor);
      hand.position.y = -0.22;
      wrist.add(hand);
      for (let finger = -1; finger <= 1; finger += 1) {
        const digit = makePlate(0.07, 0.2, 0.09, armorEdge);
        digit.position.set(finger * 0.1, -0.42, 0.02);
        wrist.add(digit);
      }
      return { shoulder, elbow, wrist };
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

    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.018, 8, 90),
      new THREE.MeshBasicMaterial({ color: 0xff5e00, transparent: true, opacity: 0.5 }),
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

    const ambient = new THREE.HemisphereLight(0xd7e0e8, 0x130500, 1.65);
    const key = new THREE.DirectionalLight(0xffd2b0, 3.2);
    key.position.set(4, 6, 6);
    key.castShadow = true;
    const orangeRim = new THREE.PointLight(0xff4d00, 18, 16);
    orangeRim.position.set(3.5, 2.5, 4);
    const coolRim = new THREE.PointLight(0x8aa3b8, 7, 14);
    coolRim.position.set(-4, 3, 1);
    const underGlow = new THREE.PointLight(0xff3d00, 6, 7);
    underGlow.position.set(0, -2.2, 2);
    scene.add(ambient, key, orangeRim, coolRim, underGlow);

    const pointer = new THREE.Vector2();
    let scrollVelocity = 0;
    let lastScroll = window.scrollY;
    let animationFrame = 0;
    let pageVisible = !document.hidden;
    let lastPointerActivity = Number.NEGATIVE_INFINITY;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      lastPointerActivity = performance.now();
    };
    const onPointerLeave = () => {
      lastPointerActivity = Number.NEGATIVE_INFINITY;
    };
    const onScroll = () => {
      scrollVelocity += (window.scrollY - lastScroll) * 0.002;
      lastScroll = window.scrollY;
    };
    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
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
      renderer.shadowMap.enabled = window.innerWidth >= 800;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    const clock = new THREE.Clock();
    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      if (!pageVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const zone = zoneRef.current;
      const viewportWidth = window.innerWidth;
      const basePose = (viewportWidth < 800 ? mobilePoses : desktopPoses)[zone];
      const compactDesktop = viewportWidth >= 800 && viewportWidth < 1180;
      const pose = compactDesktop
        ? { ...basePose, x: basePose.x * 0.72, scale: basePose.scale * 0.88 }
        : basePose;
      const motion = !reducedMotionRef.current;
      const idle = motion ? Math.sin(elapsed * 1.35) * 0.045 : 0;
      const breathe = motion ? Math.sin(elapsed * 1.6) * 0.008 : 0;

      root.position.x = THREE.MathUtils.damp(root.position.x, pose.x, 3.1, delta);
      root.position.y = THREE.MathUtils.damp(root.position.y, pose.y + idle, 3.1, delta);
      root.rotation.y = THREE.MathUtils.damp(root.rotation.y, pose.rotation + scrollVelocity, 3.5, delta);
      root.rotation.z = THREE.MathUtils.damp(
        root.rotation.z,
        motion ? Math.sin(elapsed * 0.72) * 0.008 : 0,
        3.5,
        delta,
      );
      root.scale.setScalar(THREE.MathUtils.damp(root.scale.x, pose.scale, 3.2, delta));
      torso.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
      torso.rotation.y = motion ? Math.sin(elapsed * 0.82) * 0.018 : 0;
      scrollVelocity = THREE.MathUtils.damp(scrollVelocity, 0, 6, delta);

      const pointerIsActive = motion && performance.now() - lastPointerActivity < 1800;
      const automaticGaze = sectionGaze[zone];
      const gazeX = pointerIsActive
        ? -pointer.x * 0.36
        : automaticGaze.x + (motion ? Math.sin(elapsed * 0.55) * 0.045 : 0);
      const gazeY = pointerIsActive
        ? -pointer.y * 0.17
        : automaticGaze.y + (motion ? Math.sin(elapsed * 0.8) * 0.018 : 0);
      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, gazeX, 11, delta);
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, gazeY, 11, delta);
      head.position.y = motion ? Math.sin(elapsed * 1.35 + 0.4) * 0.018 : 0;

      const pupilX = pointerIsActive ? -pointer.x * 0.025 : automaticGaze.x * 0.035;
      const pupilY = pointerIsActive ? pointer.y * 0.018 : -automaticGaze.y * 0.025;
      leftEye.pupil.position.x = THREE.MathUtils.damp(leftEye.pupil.position.x, pupilX, 14, delta);
      leftEye.pupil.position.y = THREE.MathUtils.damp(leftEye.pupil.position.y, pupilY, 14, delta);
      rightEye.pupil.position.x = THREE.MathUtils.damp(rightEye.pupil.position.x, pupilX, 14, delta);
      rightEye.pupil.position.y = THREE.MathUtils.damp(rightEye.pupil.position.y, pupilY, 14, delta);
      const blink = motion && Math.sin(elapsed * 0.72) > 0.985 ? 0.18 : 1;
      leftEye.lens.scale.y = blink;
      leftEye.pupil.scale.y = blink;
      rightEye.lens.scale.y = blink;
      rightEye.pupil.scale.y = blink;

      let leftShoulderTarget = motion ? -0.06 + Math.sin(elapsed * 0.85) * 0.025 : -0.06;
      let rightShoulderTarget = motion ? 0.06 - Math.sin(elapsed * 0.85) * 0.025 : 0.06;
      let leftElbowTarget = motion ? Math.sin(elapsed * 0.9) * 0.02 : 0;
      let rightElbowTarget = motion ? -Math.sin(elapsed * 0.9) * 0.02 : 0;
      let leftWristTarget = 0;
      let rightWristTarget = 0;
      let armDepth = motion ? Math.sin(elapsed * 0.7) * 0.018 : 0;

      const heroGreeting = zone === "hero" && motion && elapsed % 9 < 3.2;
      if (heroGreeting) {
        rightShoulderTarget = 1.82;
        rightElbowTarget = -0.52;
        rightWristTarget = Math.sin(elapsed * 6.5) * 0.5;
        armDepth = -0.12;
      } else if (zone === "about") {
        leftShoulderTarget = -1.08;
        leftElbowTarget = 0.48;
        leftWristTarget = -0.18;
        armDepth = 0.08;
      } else if (zone === "capabilities") {
        leftShoulderTarget = 0.38;
        rightShoulderTarget = 1.02;
        leftElbowTarget = motion ? Math.sin(elapsed * 7) * 0.14 - 0.42 : -0.42;
        rightElbowTarget = motion ? -Math.sin(elapsed * 7) * 0.14 - 0.62 : -0.62;
        leftWristTarget = motion ? Math.sin(elapsed * 7) * 0.1 : 0;
        rightWristTarget = motion ? -Math.sin(elapsed * 7) * 0.1 : 0;
        armDepth = -0.16;
      } else if (zone === "career") {
        leftShoulderTarget = -0.96;
        leftElbowTarget = 0.42;
        leftWristTarget = -0.12;
      } else if (zone === "work") {
        rightShoulderTarget = 1.06;
        rightElbowTarget = -0.46;
        rightWristTarget = 0.12;
        armDepth = -0.08;
      } else if (zone === "contact") {
        leftShoulderTarget = -2.05;
        leftElbowTarget = 0.46;
        leftWristTarget = motion ? Math.sin(elapsed * 5.4) * 0.48 : -0.12;
        armDepth = -0.1;
      }

      leftArm.shoulder.rotation.z = THREE.MathUtils.damp(
        leftArm.shoulder.rotation.z,
        leftShoulderTarget,
        5,
        delta,
      );
      rightArm.shoulder.rotation.z = THREE.MathUtils.damp(
        rightArm.shoulder.rotation.z,
        rightShoulderTarget,
        5,
        delta,
      );
      leftArm.elbow.rotation.z = THREE.MathUtils.damp(
        leftArm.elbow.rotation.z,
        leftElbowTarget,
        6,
        delta,
      );
      rightArm.elbow.rotation.z = THREE.MathUtils.damp(
        rightArm.elbow.rotation.z,
        rightElbowTarget,
        6,
        delta,
      );
      leftArm.shoulder.rotation.x = THREE.MathUtils.damp(
        leftArm.shoulder.rotation.x,
        armDepth,
        7,
        delta,
      );
      rightArm.shoulder.rotation.x = THREE.MathUtils.damp(
        rightArm.shoulder.rotation.x,
        -armDepth,
        7,
        delta,
      );
      leftArm.wrist.rotation.z = THREE.MathUtils.damp(
        leftArm.wrist.rotation.z,
        leftWristTarget,
        10,
        delta,
      );
      rightArm.wrist.rotation.z = THREE.MathUtils.damp(
        rightArm.wrist.rotation.z,
        rightWristTarget,
        6,
        delta,
      );
      leftLeg.rotation.x = motion ? Math.sin(elapsed * 1.2) * 0.014 : 0;
      rightLeg.rotation.x = motion ? -Math.sin(elapsed * 1.2) * 0.014 : 0;

      const hologramOpacity = zone === "capabilities" || zone === "work" ? 0.18 : 0;
      hologramMaterial.opacity = THREE.MathUtils.damp(hologramMaterial.opacity, hologramOpacity, 4, delta);
      const edgeMaterial = hologramEdges.material as THREE.LineBasicMaterial;
      edgeMaterial.opacity = THREE.MathUtils.damp(edgeMaterial.opacity, hologramOpacity * 3.2, 4, delta);
      hologram.rotation.y = motion ? Math.sin(elapsed * 0.7) * 0.08 : 0;
      chestCore.rotation.y += motion ? delta * 1.2 : 0;
      reactorOrangeRing.rotation.z -= motion ? delta * 0.2 : 0;
      reactorLight.intensity = 5.5 + (motion ? Math.sin(elapsed * 2.4) * 0.8 : 0);
      floorRing.rotation.z += motion ? delta * 0.15 : 0;
      particles.rotation.y += motion ? delta * 0.025 : 0;

      renderer.render(scene, camera);
    };
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
