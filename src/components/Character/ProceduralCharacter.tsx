import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type CharacterZone = "hero" | "about" | "capabilities" | "career" | "work" | "contact";

interface ProceduralCharacterProps {
  activeZone: CharacterZone;
  reducedMotion: boolean;
}

const desktopPoses: Record<CharacterZone, { x: number; y: number; scale: number; rotation: number }> = {
  hero: { x: 0, y: -1.7, scale: 1.05, rotation: 0 },
  about: { x: 3.35, y: -1.75, scale: 0.88, rotation: -0.32 },
  capabilities: { x: -3.45, y: -1.8, scale: 0.76, rotation: 0.42 },
  career: { x: 3.75, y: -2.05, scale: 0.68, rotation: -0.4 },
  work: { x: -3.8, y: -2.1, scale: 0.62, rotation: 0.42 },
  contact: { x: 3.45, y: -1.95, scale: 0.72, rotation: -0.35 },
};

const mobilePoses: Record<CharacterZone, { x: number; y: number; scale: number; rotation: number }> = {
  hero: { x: 0, y: -2.15, scale: 0.72, rotation: 0 },
  about: { x: 1.45, y: -2.35, scale: 0.48, rotation: -0.35 },
  capabilities: { x: -1.5, y: -2.45, scale: 0.42, rotation: 0.4 },
  career: { x: 1.6, y: -2.5, scale: 0.38, rotation: -0.35 },
  work: { x: -1.55, y: -2.5, scale: 0.36, rotation: 0.38 },
  contact: { x: 1.45, y: -2.45, scale: 0.4, rotation: -0.3 },
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
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.5, 11);

    const root = new THREE.Group();
    scene.add(root);

    const orange = new THREE.MeshStandardMaterial({
      color: 0xff6500,
      roughness: 0.28,
      metalness: 0.72,
    });
    const orangeGlow = new THREE.MeshStandardMaterial({
      color: 0xff8a2b,
      emissive: 0xff4d00,
      emissiveIntensity: 2.4,
      roughness: 0.2,
      metalness: 0.4,
    });
    const graphite = new THREE.MeshStandardMaterial({
      color: 0x111218,
      roughness: 0.4,
      metalness: 0.8,
    });
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x160b05,
      emissive: 0xff5e00,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.65,
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.75, 0.78), graphite);
    torso.position.y = 1.15;
    root.add(torso);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.72, 0.08), screenMaterial);
    chest.position.set(0, 1.28, 0.43);
    root.add(chest);

    const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), orangeGlow);
    chestCore.position.set(0, 1.28, 0.52);
    root.add(chestCore);

    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.62, 0.46, 8), orange);
    waist.position.y = 0.06;
    root.add(waist);

    const head = new THREE.Group();
    head.position.y = 2.55;
    root.add(head);

    const helmet = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.9, 0.9), graphite);
    head.add(helmet);
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.93, 0.5, 0.06), screenMaterial);
    face.position.z = 0.48;
    head.add(face);

    const eyeGeometry = new THREE.BoxGeometry(0.23, 0.075, 0.04);
    const leftEye = new THREE.Mesh(eyeGeometry, orangeGlow);
    const rightEye = new THREE.Mesh(eyeGeometry, orangeGlow);
    leftEye.position.set(-0.25, 0.07, 0.53);
    rightEye.position.set(0.25, 0.07, 0.53);
    head.add(leftEye, rightEye);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.48, 8), orange);
    antenna.position.set(0.34, 0.65, 0);
    antenna.rotation.z = -0.15;
    head.add(antenna);
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), orangeGlow);
    antennaTip.position.set(0.38, 0.91, 0);
    head.add(antennaTip);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.38, 10), orange);
    neck.position.y = 2.02;
    root.add(neck);

    const createArm = (side: -1 | 1) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.91, 1.7, 0);
      root.add(shoulder);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 16), orange);
      cap.scale.x = 0.8;
      shoulder.add(cap);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.62, 6, 12), graphite);
      upper.position.y = -0.51;
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -1.02;
      shoulder.add(elbow);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), orange);
      elbow.add(joint);
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.55, 6, 12), graphite);
      forearm.position.y = -0.46;
      elbow.add(forearm);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.3), orange);
      hand.position.y = -0.9;
      elbow.add(hand);
      return { shoulder, elbow };
    };

    const leftArm = createArm(-1);
    const rightArm = createArm(1);

    const createLeg = (side: -1 | 1) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.36, -0.15, 0);
      root.add(hip);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.78, 6, 12), graphite);
      upper.position.y = -0.62;
      hip.add(upper);
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), orange);
      knee.position.y = -1.18;
      hip.add(knee);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.74, 6, 12), graphite);
      shin.position.y = -1.73;
      hip.add(shin);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.72), orange);
      foot.position.set(0, -2.25, 0.14);
      hip.add(foot);
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
    floorRing.position.y = -2.42;
    root.add(floorRing);

    const particlePositions = new Float32Array(75 * 3);
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
        size: 0.035,
        transparent: true,
        opacity: 0.52,
      }),
    );
    root.add(particles);

    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    const key = new THREE.PointLight(0xff6500, 26, 18);
    key.position.set(3, 4, 5);
    const fill = new THREE.PointLight(0x596cff, 14, 16);
    fill.position.set(-4, 2, 3);
    scene.add(ambient, key, fill);

    const pointer = new THREE.Vector2();
    let scrollVelocity = 0;
    let lastScroll = window.scrollY;
    let animationFrame = 0;
    let pageVisible = !document.hidden;

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
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
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
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
      const isMobile = window.innerWidth < 800;
      const pose = (isMobile ? mobilePoses : desktopPoses)[zone];
      const motion = !reducedMotionRef.current;
      const idle = motion ? Math.sin(elapsed * 1.4) * 0.055 : 0;

      root.position.x = THREE.MathUtils.damp(root.position.x, pose.x, 3.1, delta);
      root.position.y = THREE.MathUtils.damp(root.position.y, pose.y + idle, 3.1, delta);
      root.rotation.y = THREE.MathUtils.damp(
        root.rotation.y,
        pose.rotation + scrollVelocity,
        3.5,
        delta,
      );
      root.scale.setScalar(THREE.MathUtils.damp(root.scale.x, pose.scale, 3.2, delta));
      scrollVelocity = THREE.MathUtils.damp(scrollVelocity, 0, 6, delta);

      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, motion ? pointer.x * 0.28 : 0, 5, delta);
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, motion ? pointer.y * 0.12 : 0, 5, delta);
      const blink = motion && Math.sin(elapsed * 0.72) > 0.985 ? 0.08 : 1;
      leftEye.scale.y = blink;
      rightEye.scale.y = blink;

      let leftShoulderTarget = 0.08;
      let rightShoulderTarget = -0.08;
      let leftElbowTarget = 0;
      let rightElbowTarget = 0;
      if (zone === "about") {
        rightShoulderTarget = -1.2;
        rightElbowTarget = -0.75;
      } else if (zone === "capabilities") {
        leftShoulderTarget = -0.7;
        rightShoulderTarget = 0.7;
        leftElbowTarget = motion ? Math.sin(elapsed * 8) * 0.2 - 0.7 : -0.7;
        rightElbowTarget = motion ? -Math.sin(elapsed * 8) * 0.2 + 0.7 : 0.7;
      } else if (zone === "work") {
        leftShoulderTarget = -1.02;
        leftElbowTarget = -0.8;
      } else if (zone === "contact") {
        rightShoulderTarget = -2.35;
        rightElbowTarget = motion ? Math.sin(elapsed * 5) * 0.38 - 0.45 : -0.45;
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
      leftLeg.rotation.x = motion ? Math.sin(elapsed * 1.2) * 0.018 : 0;
      rightLeg.rotation.x = motion ? -Math.sin(elapsed * 1.2) * 0.018 : 0;

      const hologramOpacity = zone === "capabilities" || zone === "work" ? 0.19 : 0;
      hologramMaterial.opacity = THREE.MathUtils.damp(
        hologramMaterial.opacity,
        hologramOpacity,
        4,
        delta,
      );
      const edgeMaterial = hologramEdges.material as THREE.LineBasicMaterial;
      edgeMaterial.opacity = THREE.MathUtils.damp(edgeMaterial.opacity, hologramOpacity * 3.2, 4, delta);
      hologram.rotation.y = motion ? Math.sin(elapsed * 0.7) * 0.08 : 0;
      chestCore.rotation.y += motion ? delta * 1.4 : 0;
      floorRing.rotation.z += motion ? delta * 0.15 : 0;
      particles.rotation.y += motion ? delta * 0.025 : 0;

      renderer.render(scene, camera);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
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
