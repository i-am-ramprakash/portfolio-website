import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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

    // Color palette for 3D Cartoon Polar Bear Mascot
    const furWhite = new THREE.MeshStandardMaterial({
      color: 0xf4f0ea,
      metalness: 0.08,
      roughness: 0.65,
    });
    const furMuzzle = new THREE.MeshStandardMaterial({
      color: 0xfffaf5,
      metalness: 0.04,
      roughness: 0.72,
    });
    const noseBlack = new THREE.MeshStandardMaterial({
      color: 0x121215,
      metalness: 0.5,
      roughness: 0.12,
    });
    const eyeBlack = new THREE.MeshStandardMaterial({
      color: 0x0c0c0e,
      emissive: 0x1a0d00,
      roughness: 0.1,
    });
    const glassesFrame = new THREE.MeshStandardMaterial({
      color: 0xe6a100,
      metalness: 0.92,
      roughness: 0.18,
      envMapIntensity: 1.5,
    });
    const glassesLens = new THREE.MeshPhysicalMaterial({
      color: 0xff6600,
      emissive: 0xcc3300,
      emissiveIntensity: 0.4,
      metalness: 0.12,
      roughness: 0.05,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1.0,
    });
    const scarfOrange = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      emissive: 0xaa2200,
      emissiveIntensity: 0.2,
      metalness: 0.15,
      roughness: 0.55,
    });
    const suitJacket = new THREE.MeshStandardMaterial({
      color: 0xede8e1,
      metalness: 0.18,
      roughness: 0.42,
    });
    const suitGold = new THREE.MeshStandardMaterial({
      color: 0xf5b000,
      metalness: 0.9,
      roughness: 0.2,
    });
    const innerEarMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d0c0,
      roughness: 0.8,
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
      segments = 16,
    ) => applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material));

    const makePlate = (
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
    ) => applyShadow(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material));

    // Warm rear backlight halo
    const backlight = new THREE.PointLight(0xff5500, 32, 18);
    backlight.position.set(0, 1.5, -2.0);
    scene.add(backlight);

    // Torso: Ivory suit jacket with gold buttons & lapels
    const torso = new THREE.Group();
    torso.position.y = 1.08;
    root.add(torso);

    const suitBody = markMajorShadow(
      new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 1), suitJacket),
    );
    suitBody.scale.set(1.06, 1.05, 0.76);
    torso.add(suitBody);

    for (let index = 0; index < 3; index += 1) {
      const button = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12), suitGold));
      button.rotation.x = Math.PI / 2;
      button.position.set(0, 0.25 - index * 0.28, 0.72);
      torso.add(button);
    }

    // Scarf: Wrapped warm orange scarf around neck
    const scarfGroup = new THREE.Group();
    scarfGroup.position.set(0, 1.98, 0);
    root.add(scarfGroup);

    const scarfMainRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.16, 12, 28), scarfOrange);
    scarfMainRing.rotation.x = Math.PI / 2;
    scarfGroup.add(scarfMainRing);

    const scarfSubRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.14, 10, 24), scarfOrange);
    scarfSubRing.rotation.x = Math.PI / 2 + 0.1;
    scarfSubRing.position.y = -0.12;
    scarfGroup.add(scarfSubRing);

    const scarfTail = makePlate(0.24, 0.65, 0.08, scarfOrange);
    scarfTail.position.set(0.22, -0.4, 0.46);
    scarfTail.rotation.z = -0.22;
    scarfGroup.add(scarfTail);

    // Head: Soft rounded polar bear head
    const head = new THREE.Group();
    head.position.y = 2.72;
    root.add(head);

    const bearHead = markMajorShadow(
      new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 2), furWhite),
    );
    bearHead.scale.set(1.05, 0.98, 0.94);
    head.add(bearHead);

    // Polar Bear Ears
    [-1, 1].forEach((side) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.58, 0.62, -0.05);
      head.add(earGroup);

      const outerEar = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), furWhite));
      outerEar.scale.set(1.0, 0.95, 0.45);
      earGroup.add(outerEar);

      const innerEar = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), innerEarMaterial));
      innerEar.scale.set(0.9, 0.85, 0.35);
      innerEar.position.z = 0.06;
      earGroup.add(innerEar);
    });

    // Muzzle & Snout
    const muzzle = applyShadow(new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), furMuzzle));
    muzzle.scale.set(0.95, 0.72, 0.9);
    muzzle.position.set(0, -0.15, 0.58);
    head.add(muzzle);

    const nose = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), noseBlack));
    nose.scale.set(1.2, 0.82, 0.9);
    nose.position.set(0, -0.08, 0.88);
    head.add(nose);

    // Eyes set behind glasses
    const createBearEye = (side: -1 | 1) => {
      const eye = new THREE.Group();
      eye.position.set(side * 0.28, 0.08, 0.66);
      head.add(eye);

      const pupil = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), eyeBlack));
      eye.add(pupil);

      return { eye, pupil };
    };

    const leftEye = createBearEye(-1);
    const rightEye = createBearEye(1);

    // Round Gold Wire Orange Sunglasses (Peek Gesture Target)
    const glassesPivot = new THREE.Group();
    glassesPivot.position.set(0, 0.09, 0.72);
    head.add(glassesPivot);

    [-1, 1].forEach((side) => {
      const frameRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.026, 12, 28), glassesFrame);
      frameRim.position.x = side * 0.3;
      glassesPivot.add(frameRim);

      const lens = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), glassesLens));
      lens.rotation.x = Math.PI / 2;
      lens.position.set(side * 0.3, 0, 0.01);
      glassesPivot.add(lens);
    });

    const bridge = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8), glassesFrame));
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.08, 0.02);
    glassesPivot.add(bridge);

    [-1, 1].forEach((side) => {
      const temple = makeCylinder(0.015, 0.015, 0.42, glassesFrame, 8);
      temple.rotation.x = Math.PI / 2;
      temple.position.set(side * 0.54, 0, -0.18);
      glassesPivot.add(temple);
    });

    // Arms & Paws with Suit Sleeves
    const createArm = (side: -1 | 1): RobotArm => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 1.04, 1.58, 0);
      root.add(shoulder);

      const shoulderCap = applyShadow(new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 12), suitJacket));
      shoulder.add(shoulderCap);

      const upper = makeCylinder(0.22, 0.18, 0.72, suitJacket, 12);
      markMajorShadow(upper);
      upper.position.y = -0.55;
      shoulder.add(upper);

      const elbow = new THREE.Group();
      elbow.position.y = -1.02;
      shoulder.add(elbow);

      const forearmTwistGroup = new THREE.Group();
      elbow.add(forearmTwistGroup);

      const forearm = makeCylinder(0.2, 0.26, 0.62, suitJacket, 12);
      markMajorShadow(forearm);
      forearm.position.y = -0.48;
      forearmTwistGroup.add(forearm);

      const sleeveGoldTrim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 18), suitGold);
      sleeveGoldTrim.rotation.x = Math.PI / 2;
      sleeveGoldTrim.position.y = -0.74;
      forearmTwistGroup.add(sleeveGoldTrim);

      const wrist = new THREE.Group();
      wrist.position.y = -0.88;
      forearmTwistGroup.add(wrist);

      const paw = applyShadow(new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 1), furWhite));
      paw.scale.set(1.1, 0.85, 1.0);
      paw.position.y = -0.18;
      wrist.add(paw);

      const fingers: THREE.Group[] = [];
      for (let finger = -1; finger <= 1; finger += 1) {
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(finger * 0.1, -0.32, 0.02);
        wrist.add(fingerGroup);

        const digit = makePlate(0.07, 0.18, 0.08, furWhite);
        digit.position.y = -0.08;
        fingerGroup.add(digit);
        fingers.push(fingerGroup);
      }
      return { shoulder, elbow, wrist, forearmTwistGroup, fingers };
    };

    const leftArm = createArm(-1);
    const rightArm = createArm(1);

    // Coffee Mug Accessory (Used in "About" Section)
    const coffeeMug = new THREE.Group();
    coffeeMug.position.set(-0.35, -0.12, 0.22);
    leftArm.wrist.add(coffeeMug);

    const mugBody = applyShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.32, 16), scarfOrange));
    coffeeMug.add(mugBody);
    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 8, 16), scarfOrange);
    mugHandle.position.set(-0.14, 0, 0);
    coffeeMug.add(mugHandle);
    coffeeMug.visible = false;

    // Holographic Tech Tablet Accessory (Used in "Toolkit" Section)
    const hologram = new THREE.Group();
    hologram.position.set(1.85, 1.25, 0.15);
    root.add(hologram);

    const hologramMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const hologramPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), hologramMaterial);
    hologram.add(hologramPanel);

    const hologramEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(hologramPanel.geometry),
      new THREE.LineBasicMaterial({ color: 0xffa866, transparent: true, opacity: 0 }),
    );
    hologram.add(hologramEdges);

    // Floor Ring Light
    const floorRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.45,
    });
    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.018, 8, 90),
      floorRingMaterial,
    );
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = -2.72;
    root.add(floorRing);

    // Ambient floating orange sparkles
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
        color: 0xff7722,
        size: 0.035,
        transparent: true,
        opacity: 0.45,
      }),
    );
    root.add(particles);

    // Studio lighting
    const ambient = new THREE.HemisphereLight(0x352015, 0x0c0603, 1.25);
    const key = new THREE.DirectionalLight(0xffaa77, 3.6);
    key.position.set(4, 6, 7);
    key.castShadow = true;

    const orangeRim = new THREE.PointLight(0xff5500, 30, 20);
    orangeRim.position.set(2.5, 3.8, -1.5);

    const frontFill = new THREE.PointLight(0xffebd8, 2.2, 12);
    frontFill.position.set(0, 1.5, 8);
    scene.add(ambient, key, orangeRim, frontFill);

    // Rigged 3D Polar Bear GLTF Loader
    let gltfModel: THREE.Object3D | null = null;
    let gltfMixer: THREE.AnimationMixer | null = null;
    let gltfHeadBone: THREE.Object3D | null = null;
    let gltfNeckBone: THREE.Object3D | null = null;

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/polar-bear.glb",
      (gltf) => {
        gltfModel = gltf.scene;
        gltfModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          const lowerName = child.name.toLowerCase();
          if (lowerName.includes("head") || lowerName.includes("spine006")) {
            gltfHeadBone = child;
          }
          if (lowerName.includes("neck") || lowerName.includes("spine005")) {
            gltfNeckBone = child;
          }
        });

        const bounds = new THREE.Box3().setFromObject(gltfModel);
        const size = new THREE.Vector3();
        bounds.getSize(size);
        const center = new THREE.Vector3();
        bounds.getCenter(center);

        if (size.y > 0) {
          const fitScale = 3.6 / size.y;
          gltfModel.scale.setScalar(fitScale);
          gltfModel.position.set(-center.x * fitScale, -center.y * fitScale + 1.8, -center.z * fitScale);
        }

        root.add(gltfModel);

        if (gltf.animations && gltf.animations.length > 0) {
          gltfMixer = new THREE.AnimationMixer(gltfModel);
          gltf.animations.forEach((clip) => {
            gltfMixer?.clipAction(clip).play();
          });
        }
      },
      undefined,
      (error) => {
        console.warn("GLTF Load note:", error);
      }
    );

    root.updateWorldMatrix(true, true);
    const modelBounds = new THREE.Box3();
    [torso, scarfGroup, head, leftArm.shoulder, rightArm.shoulder].forEach((part) =>
      modelBounds.expandByObject(part),
    );
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
      const baseAngle = Math.atan2(dy, dx);
      const shoulderMagnitude =
        baseAngle +
        side *
          Math.asin(
            THREE.MathUtils.clamp((lowerLength * Math.sin(elbowMagnitude)) / reach, -1, 1),
          );
      const rightForearmTwist = 1.28;
      arm.forearmTwistGroup.rotation.y = side * rightForearmTwist;
      return {
        shoulder: THREE.MathUtils.clamp(shoulderMagnitude - Math.PI / 2, -2.1, 0.4),
        elbow: side * THREE.MathUtils.clamp(Math.PI - elbowMagnitude, 0.15, 2.1),
      };
    };

    const pointingTargets = new Map<CharacterZone, HTMLElement>();
    (["about", "capabilities", "career", "work", "toolkit", "contact"] as CharacterZone[]).forEach(
      (targetZone) => {
        const element = document.querySelector<HTMLElement>(
          `[data-character-target="${targetZone}"]`,
        );
        if (element) pointingTargets.set(targetZone, element);
      },
    );

    let isPointerActive = false;
    let pointerResetTimer = 0;
    const onPointerMove = (event: PointerEvent) => {
      isPointerActive = true;
      window.clearTimeout(pointerResetTimer);
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = 1 - (event.clientY / window.innerHeight) * 2;
      pointerTarget.set(nx, ny);
      pointerResetTimer = window.setTimeout(() => {
        isPointerActive = false;
        pointerTarget.set(0, 0);
      }, 3500);
    };

    const onPointerLeave = () => {
      isPointerActive = false;
      pointerTarget.set(0, 0);
    };

    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const delta = now - lastScrollTime;
      if (delta > 0) {
        const rawDelta = (window.scrollY - lastScrollY) / delta;
        scrollVelocity = THREE.MathUtils.clamp(rawDelta, -50, 50);
        lastScrollY = window.scrollY;
        lastScrollTime = now;
      }
    };

    const smoothDampValue = (
      current: number,
      target: number,
      state: { pos: number; vel: number },
      smoothTime: number,
      dt: number,
    ) => {
      const omega = 2 / Math.max(smoothTime, 0.0001);
      const x = omega * dt;
      const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const change = current - target;
      const temp = (state.vel + omega * change) * dt;
      state.vel = (state.vel - omega * temp) * exp;
      state.pos = target + (change + temp) * exp;
      return state.pos;
    };

    const sp = {
      x: { pos: initialPose.x, vel: 0 },
      y: { pos: initialPose.y, vel: 0 },
      scale: { pos: initialPose.scale, vel: 0 },
      rotation: { pos: initialPose.rotation, vel: 0 },
      lShoulder: { pos: 0, vel: 0 },
      lElbow: { pos: 0, vel: 0 },
      rShoulder: { pos: 0, vel: 0 },
      rElbow: { pos: 0, vel: 0 },
      headX: { pos: 0, vel: 0 },
      headY: { pos: 0, vel: 0 },
      glassesPeek: { pos: 0, vel: 0 },
    };

    let fpsFrames = 0;
    let fpsStart = performance.now();
    let isRendering = true;

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

      const now = performance.now();
      const elapsed = clock.getElapsedTime();
      const deltaSeconds = Math.min(clock.getDelta(), 0.08);

      fpsFrames += 1;
      if (now - fpsStart >= 2000) {
        const averageFps = (fpsFrames * 1000) / (now - fpsStart);
        fpsFrames = 0;
        fpsStart = now;
        if (averageFps < 52 && qualityLevel > 0) {
          qualityLevel = (qualityLevel - 1) as QualityLevel;
          applyRendererQuality();
        }
      }

      const active = zoneRef.current;
      const motion = !reducedMotionRef.current && !motionPausedRef.current;
      const phase = transitionPhaseRef.current;

      if (active !== previousZone) {
        previousZone = active;
      }

      const poseSet = window.innerWidth < 900 ? mobilePoses : desktopPoses;
      const pose = poseSet[active];
      const fittedFrame = getFittedFrame(active, pose.scale);

      const targetX = getTargetX(active, pose.x, fittedFrame.scale);
      const targetY = fittedFrame.y + pose.y;
      const targetScale = fittedFrame.scale;
      const targetRotation = pose.rotation;

      if (!motion) {
        Object.values(sp).forEach((springState) => {
          springState.pos = 0;
          springState.vel = 0;
        });
        rootMotion.x.value = targetX;
        rootMotion.y.value = targetY;
        rootMotion.scale.value = targetScale;
        rootMotion.rotation.value = targetRotation;
      } else {
        rootMotion.x.value = smoothDampValue(rootMotion.x.value, targetX, sp.x, 0.24, deltaSeconds);
        rootMotion.y.value = smoothDampValue(rootMotion.y.value, targetY, sp.y, 0.24, deltaSeconds);
        rootMotion.scale.value = smoothDampValue(rootMotion.scale.value, targetScale, sp.scale, 0.26, deltaSeconds);
        rootMotion.rotation.value = smoothDampValue(rootMotion.rotation.value, targetRotation, sp.rotation, 0.22, deltaSeconds);
      }

      root.position.set(rootMotion.x.value, rootMotion.y.value, 0);
      root.scale.setScalar(rootMotion.scale.value);
      root.rotation.y = rootMotion.rotation.value;

      pointer.lerp(pointerTarget, motion ? 0.08 : 1);

      // Glasses Peek gesture (slides down nose on interaction)
      const targetGlassesPeek = isPointerActive || active === "hero" ? 1 : 0;
      sp.glassesPeek.pos = smoothDampValue(sp.glassesPeek.pos, targetGlassesPeek, sp.glassesPeek, 0.2, deltaSeconds);
      glassesPivot.position.y = 0.09 - sp.glassesPeek.pos * 0.08;
      glassesPivot.rotation.x = sp.glassesPeek.pos * 0.12;

      // Head & Eye Gaze Tracking
      head.getWorldPosition(projectedHead);
      projectedHead.project(camera);
      const gazeDeltaX = pointer.x - projectedHead.x;
      const gazeDeltaY = pointer.y - projectedHead.y;

      const pointerTrackingWeight = THREE.MathUtils.damp(0, 1, 4, deltaSeconds);
      const targetHeadY = THREE.MathUtils.clamp(gazeDeltaX * 0.45 * pointerTrackingWeight + sectionGaze[active].x, -0.42, 0.42);
      const targetHeadX = THREE.MathUtils.clamp(-gazeDeltaY * 0.3 * pointerTrackingWeight + sectionGaze[active].y, -0.28, 0.28);

      sp.headY.pos = smoothDampValue(sp.headY.pos, targetHeadY, sp.headY, 0.18, deltaSeconds);
      sp.headX.pos = smoothDampValue(sp.headX.pos, targetHeadX, sp.headX, 0.18, deltaSeconds);
      head.rotation.y = sp.headY.pos;
      head.rotation.x = sp.headX.pos;

      if (gltfMixer) {
        gltfMixer.update(deltaSeconds);
      }
      if (gltfHeadBone) {
        gltfHeadBone.rotation.y = THREE.MathUtils.lerp(gltfHeadBone.rotation.y, sp.headY.pos, 0.12);
        gltfHeadBone.rotation.x = THREE.MathUtils.lerp(gltfHeadBone.rotation.x, sp.headX.pos, 0.12);
      }
      if (gltfNeckBone) {
        gltfNeckBone.rotation.x = THREE.MathUtils.lerp(gltfNeckBone.rotation.x, sp.headX.pos * 0.4, 0.12);
      }

      pupilTarget.set(
        THREE.MathUtils.clamp(gazeDeltaX * 0.03, -0.035, 0.035),
        THREE.MathUtils.clamp(gazeDeltaY * 0.03, -0.035, 0.035),
      );
      if (pupilTarget.length() > 0.038) pupilTarget.setLength(0.038);
      leftEye.pupil.position.set(pupilTarget.x, pupilTarget.y, 0.065);
      rightEye.pupil.position.set(pupilTarget.x, pupilTarget.y, 0.065);

      // Arm Poses & Inverse Kinematics
      let leftShoulderTarget = 0;
      let leftElbowTarget = 0;
      let rightShoulderTarget = 0;
      let rightElbowTarget = 0;

      coffeeMug.visible = active === "about";
      hologramMaterial.opacity = active === "toolkit" ? 0.6 : 0;
      hologramEdges.material.opacity = active === "toolkit" ? 0.8 : 0;

      const timeSinceEntry = now - zoneEntryTimeRef.current;
      const gestureDuration: Record<CharacterZone, number> = {
        hero: 3600,
        about: 3200,
        capabilities: 3400,
        career: 3200,
        work: 3400,
        toolkit: 3200,
        contact: 3600,
      };

      const heroWaveTime = timeSinceEntry;
      const celebrationWaveActive = now - celebrationTimeRef.current < 2800;

      const travelEffect = motion && phase === "traveling";
      const delta = 1;
      const springClamped = THREE.MathUtils.clamp(scrollVelocity + delta * 0.002, -50, 50);

      if (celebrationWaveActive) {
        leftShoulderTarget = -1.65;
        leftElbowTarget = -0.9;
        rightShoulderTarget = 1.65;
        rightElbowTarget = 0.9;
      } else if (active === "hero" && heroWaveTime >= 250 && heroWaveTime < 3600) {
        const wave = Math.sin(elapsed * 4.8);
        rightShoulderTarget = 1.68;
        rightElbowTarget = 1.05 + wave * 0.07;
      } else if (pointingTargets.has(active) && timeSinceEntry < gestureDuration[active]) {
        const targetElement = pointingTargets.get(active);
        if (targetElement) {
          const solved = solvePointingPose(targetElement, rightArm, 1);
          rightShoulderTarget = solved.shoulder;
          rightElbowTarget = solved.elbow;
        }
      }

      const gestureProgress = THREE.MathUtils.clamp(timeSinceEntry / 1000, 0, 1);
      const gestureActive = gestureProgress * 6 - 15;
      if (phase === "neutral" || (phase === "traveling" && timeSinceEntry >= 850)) {
        const exitProgress = Math.min(1, Math.max(0, gestureActive));
        const gestureEntryBlend = 1;
        const blendResult = gestureEntryBlend * exitProgress;
        if (travelEffect && springClamped && blendResult) {
          // bounded travel blend
        }
      }

      sp.lShoulder.pos = smoothDampValue(sp.lShoulder.pos, leftShoulderTarget, sp.lShoulder, 0.22, deltaSeconds);
      sp.lElbow.pos = smoothDampValue(sp.lElbow.pos, leftElbowTarget, sp.lElbow, 0.22, deltaSeconds);
      sp.rShoulder.pos = smoothDampValue(sp.rShoulder.pos, rightShoulderTarget, sp.rShoulder, 0.22, deltaSeconds);
      sp.rElbow.pos = smoothDampValue(sp.rElbow.pos, rightElbowTarget, sp.rElbow, 0.22, deltaSeconds);

      shoulderEuler.set(0, 0, sp.lShoulder.pos);
      leftArm.shoulder.quaternion.slerp(leftShoulderTargetQuaternion.setFromEuler(shoulderEuler), 0.15);
      leftArm.elbow.rotation.z = THREE.MathUtils.clamp(sp.lElbow.pos, -2.5, 2.5);
      leftArm.wrist.rotation.z = THREE.MathUtils.clamp(sp.lElbow.pos * 0.2, -1.5, 1.5);
      // elbow.rotation.z = THREE.MathUtils.clamp(sp.lElbow.pos, -2.5, 2.5);
      // wrist.rotation.z = THREE.MathUtils.clamp(sp.lElbow.pos * 0.2, -1.5, 1.5);

      shoulderEuler.set(0, 0, sp.rShoulder.pos);
      rightArm.shoulder.quaternion.slerp(rightShoulderTargetQuaternion.setFromEuler(shoulderEuler), 0.15);
      rightArm.elbow.rotation.z = THREE.MathUtils.clamp(sp.rElbow.pos, -2.5, 2.5);
      rightArm.wrist.rotation.z = THREE.MathUtils.clamp(sp.rElbow.pos * 0.2, -1.5, 1.5);

      scarfTail.rotation.z = -0.22 + Math.sin(elapsed * 2.5) * 0.08 + scrollVelocity * 0.01;

      renderer.render(scene, camera);
    };

    let animationFrameId = 0;
    const animate = (time: number) => {
      if (!isRendering) return;
      const targetInterval = motionPausedRef.current ? 1000 / 12 : 1000 / 30;
      if (time - lastRenderedAt >= targetInterval) {
        lastRenderedAt = time;
        render();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRendering = false;
        if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      } else {
        isRendering = true;
        clock.start();
        lastRenderedAt = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`character-stage character-zone-${activeZone}`} aria-hidden="true">
      <div ref={mountRef} className="character-canvas" />
      {webglUnavailable && (
        <div className="character-fallback">
          <div className="fallback-face">
            <span className="fallback-glasses" />
            <i />
            <i />
          </div>
          <div className="fallback-body" />
          <div className="fallback-scarf" />
        </div>
      )}
    </div>
  );
};

export type { CharacterZone };
export default ProceduralCharacter;
