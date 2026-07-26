import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {
  BASE_MODEL_PATH,
  CHARACTER_CLIPS,
  CORE_CLIPS,
  SECTION_SCENES,
  clipsForSection,
  toCharacterSection,
  type CharacterSection,
  type ClipAsset,
  type ClipKey,
} from "./characterConfig";

interface PolarBear3DCanvasProps {
  activeSection: string;
  reducedMotion?: boolean;
}

type LoadState = "loading" | "ready" | "failed";

interface ResolvedAnchor {
  position: THREE.Vector3;
  rotation: number;
  scale: number;
}

interface ActiveMotion {
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromRotation: number;
  toRotation: number;
  fromScale: number;
  toScale: number;
  fromOpacity: number;
  toOpacity: number;
  startedAt: number;
  duration: number;
  scrollStartY: number;
  scrollDistance: number;
  fallbackDelay: number;
  finish: (completed: boolean) => void;
}

interface MaterialState {
  material: THREE.Material;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}

const SECTION_ORDER: CharacterSection[] = [
  "home",
  "about",
  "capabilities",
  "career",
  "work",
  "toolkit",
  "contact",
  "footer",
];

const smoothstep = (value: number) => {
  const progress = THREE.MathUtils.clamp(value, 0, 1);
  return progress * progress * (3 - 2 * progress);
};

const disposeObject = (root: THREE.Object3D) => {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!material) return;
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
};

const normalizeClip = (source: THREE.AnimationClip, neutralizeHorizontalRootMotion = false) => {
  const clip = source.clone();
  clip.tracks.forEach((track) => {
    track.name = track.name.replace(/.*mixamorig/i, "mixamorig");
  });
  if (!neutralizeHorizontalRootMotion) return clip;

  const hipsPosition = clip.tracks.find(
    (track) => track.name.toLowerCase() === "mixamorighips.position",
  );
  if (!hipsPosition || hipsPosition.times.length < 2) return clip;

  const values = hipsPosition.values;
  const times = hipsPosition.times;
  const finalOffset = (times.length - 1) * 3;
  const driftX = values[finalOffset] - values[0];
  const driftZ = values[finalOffset + 2] - values[2];
  const firstTime = times[0];
  const duration = times[times.length - 1] - firstTime || 1;

  times.forEach((time, index) => {
    const progress = (time - firstTime) / duration;
    values[index * 3] -= driftX * progress;
    values[index * 3 + 2] -= driftZ * progress;
  });
  return clip;
};

const PolarBear3DCanvas = ({ activeSection, reducedMotion = false }: PolarBear3DCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef(toCharacterSection(activeSection));
  const reducedMotionRef = useRef(reducedMotion);
  const sectionHandlerRef = useRef<(section: CharacterSection) => void>(() => undefined);
  const motionPreferenceHandlerRef = useRef<(isReduced: boolean) => void>(() => undefined);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    const section = toCharacterSection(activeSection);
    activeSectionRef.current = section;
    sectionHandlerRef.current(section);
  }, [activeSection]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    motionPreferenceHandlerRef.current(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let ready = false;
    let pageVisible = !document.hidden;
    let frameId = 0;
    let lastFrameTime = performance.now();
    let viewportWidth = 1;
    let viewportHeight = 1;
    let visibleWidth = 1;
    let visibleHeight = 1;
    let baseScale = 1;
    let characterOpacity = 1;
    let currentSection: CharacterSection = activeSectionRef.current;
    let requestedSection: CharacterSection = activeSectionRef.current;
    let sequenceVersion = 0;
    let activeMotion: ActiveMotion | null = null;
    let currentAction: THREE.AnimationAction | null = null;
    let currentClip: ClipKey | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let wrapper: THREE.Group | null = null;
    let modelRoot: THREE.Group | null = null;
    let workstation: THREE.Group | null = null;
    let groundShadow: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial> | null = null;

    const materialStates: MaterialState[] = [];
    const actions = new Map<ClipKey, THREE.AnimationAction>();
    const clipPromises = new Map<ClipKey, Promise<THREE.AnimationAction | null>>();
    const cancellationHandlers = new Set<() => void>();
    const abortController = new AbortController();
    const loader = new FBXLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

    const createWorkstation = () => {
      const group = new THREE.Group();
      group.name = "workstation";

      const createMaterial = (color: number, roughness = 0.72) => {
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness: 0.06,
          transparent: true,
        });
        materialStates.push({ material, opacity: 1, transparent: true, depthWrite: true });
        return material;
      };
      const orange = createMaterial(0xe46a2b, 0.62);
      const white = createMaterial(0xf5f5f3, 0.78);
      const dark = createMaterial(0x171717, 0.48);

      const addBox = (
        size: [number, number, number],
        position: [number, number, number],
        material: THREE.Material,
        rotation: [number, number, number] = [0, 0, 0],
        parent: THREE.Group = group,
      ) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        parent.add(mesh);
        return mesh;
      };

      // Chair: a visible tall back and angled orange seat supporting the bear's pelvis.
      // Its own perspective keeps all four legs attached to the seat corners.
      const chair = new THREE.Group();
      chair.position.set(0.0, 0.0, -0.55);
      chair.rotation.y = 0.0;
      group.add(chair);
      // Seat pad
      addBox([1.82, 0.22, 1.32], [0.0, -1.72, 0.0], orange, [0.04, 0, 0], chair);
      // Backrest — shorter and reclined slightly
      addBox([1.72, 1.82, 0.22], [0.0, -0.58, -0.62], orange, [0.08, 0, 0], chair);
      const chairLegPositions: [number, number, number][] = [
        [-0.72, -2.72, -0.52],
        [0.72, -2.72, -0.52],
        [-0.72, -2.72, 0.48],
        [0.72, -2.72, 0.48],
      ];
      chairLegPositions.forEach((position) => {
        addBox([0.15, 1.82, 0.15], position, orange, [0, 0, 0], chair);
      });

      // Rotate and shift the complete desk so the bear's forward leg sits below it.
      const desk = new THREE.Group();
      desk.position.set(0.0, -0.72, 1.42);
      desk.rotation.y = 0.0;
      group.add(desk);
      // Desktop surface (thick orange frame + white top)
      addBox([3.0, 0.18, 1.52], [0.0, 0.0, 0.0], orange, [0, 0, 0], desk);
      addBox([3.02, 0.05, 1.54], [0.0, 0.10, 0.0], white, [0, 0, 0], desk);
      const deskLegPositions: [number, number, number][] = [
        [-1.32, -1.68, -0.62],
        [1.32, -1.68, -0.62],
        [-1.32, -1.68, 0.62],
        [1.32, -1.68, 0.62],
      ];
      deskLegPositions.forEach((position) => {
        addBox([0.16, 3.36, 0.16], position, orange, [0, 0, 0], desk);
      });
      // Cross-brace between back legs
      addBox([2.48, 0.12, 0.14], [0.0, -1.18, -0.62], white, [0, 0, 0], desk);

      // Laptop sitting on the desk — a solid base and a properly hinged screen lid.
      const laptop = new THREE.Group();
      laptop.position.set(0.0, 0.14, -0.08);
      laptop.rotation.y = 0.0;
      desk.add(laptop);
      // Laptop base (keyboard deck) — flat on the desk surface
      addBox([1.72, 0.10, 1.12], [0.0, 0.0, 0.0], white, [0, 0, 0], laptop);
      // Front bezel accent (closest to bear, -Z edge)
      addBox([1.72, 0.10, 0.04], [0.0, 0.0, -0.54], orange, [0, 0, 0], laptop);
      // Keyboard inlay (center of base)
      addBox([1.42, 0.02, 0.58], [0.0, 0.06, 0.06], dark, [0, 0, 0], laptop);
      // Trackpad (between keyboard and front edge, closer to bear)
      addBox([0.48, 0.02, 0.24], [0.0, 0.06, -0.30], dark, [0, 0, 0], laptop);
      // Screen lid — hinged at back edge of base (+Z side), tilted back ~20° from vertical.
      // Hinge at z=+0.56, half-height=0.54, angle=0.35 rad:
      //   center y = 0.54·cos(0.35) ≈ 0.51
      //   center z = 0.56 + 0.54·sin(0.35) ≈ 0.74
      addBox([1.68, 1.08, 0.06], [0.0, 0.51, 0.74], orange, [0.35, 0, 0], laptop);
      // Screen display (inner face, facing the bear)
      addBox([1.44, 0.86, 0.02], [0.0, 0.51, 0.72], dark, [0.35, 0, 0], laptop);

      return group;
    };

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const assetUrl = (path: string) => `${baseUrl}models/${path}`;

    const loadFBX = async (path: string) => {
      const response = await fetch(assetUrl(path), { signal: abortController.signal });
      if (!response.ok) throw new Error(`Unable to load ${path} (${response.status})`);
      return loader.parse(await response.arrayBuffer(), `${baseUrl}models/`);
    };

    const loadClip = (key: ClipKey) => {
      const loaded = actions.get(key);
      if (loaded) return Promise.resolve(loaded);
      const pending = clipPromises.get(key);
      if (pending) return pending;

      const promise = (async () => {
        if (!mixer) return null;
        let animationObject: THREE.Group | null = null;
        try {
          const config: ClipAsset = CHARACTER_CLIPS[key];
          animationObject = await loadFBX(config.path);
          if (disposed || animationObject.animations.length === 0) return null;
          const clip = normalizeClip(
            animationObject.animations[0],
            config.neutralizeHorizontalRootMotion,
          );
          const action = mixer.clipAction(clip);
          actions.set(key, action);
          return action;
        } catch (error) {
          if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) {
            console.warn(`Unable to load character animation ${key}:`, error);
          }
          return null;
        } finally {
          if (animationObject) disposeObject(animationObject);
        }
      })();
      clipPromises.set(key, promise);
      return promise;
    };

    const ensureClips = async (keys: ClipKey[]) => {
      await Promise.allSettled(keys.map(loadClip));
    };

    const preloadSectionClips = async () => {
      await ensureClips(CORE_CLIPS);
      for (const section of SECTION_ORDER) {
        if (disposed) return;
        await ensureClips(clipsForSection(section));
        await new Promise<void>((resolve) => window.setTimeout(resolve, 100));
      }
    };

    const updateViewport = () => {
      viewportWidth = container.clientWidth || window.innerWidth;
      viewportHeight = container.clientHeight || window.innerHeight;
      camera.aspect = viewportWidth / Math.max(viewportHeight, 1);
      camera.updateProjectionMatrix();
      renderer?.setSize(viewportWidth, viewportHeight, false);
      renderer?.setPixelRatio(Math.min(window.devicePixelRatio, viewportWidth <= 820 ? 1.25 : 1.65));

      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      visibleHeight = 2 * Math.tan(verticalFov / 2) * camera.position.z;
      visibleWidth = visibleHeight * camera.aspect;
    };

    const resolveAnchor = (section: CharacterSection): ResolvedAnchor => {
      const compact = viewportWidth <= 820;
      const layouts: Record<CharacterSection, {
        x: number;
        y: number;
        scale: number;
        rotation?: number;
        mobileX?: number;
        mobileY?: number;
        mobileScale?: number;
        mobileRotation?: number;
      }> = {
        home: {
          x: 0.28,
          y: -0.44,
          scale: 2.50,
          rotation: -0.34,
          mobileX: 0.26,
          mobileY: -0.4,
          mobileScale: 0.72,
          mobileRotation: -0.12,
        },
        about: {
          x: 0.34,
          y: 0.04,
          scale: 1.14,
          rotation: -0.82,
          mobileX: 0.28,
          mobileY: -0.18,
          mobileScale: 0.58,
          mobileRotation: -0.5,
        },
        capabilities: {
          x: -0.34,
          y: -0.02,
          scale: 1.14,
          rotation: 0.82,
          mobileX: -0.28,
          mobileY: -0.23,
          mobileScale: 0.58,
          mobileRotation: 0.5,
        },
        career: {
          x: 0.34,
          y: -0.02,
          scale: 1.14,
          rotation: -0.82,
          mobileX: 0.28,
          mobileY: -0.23,
          mobileScale: 0.58,
          mobileRotation: -0.5,
        },
        work: {
          x: -0.34,
          y: 0.20,
          scale: 1.14,
          rotation: 0.82,
          mobileX: -0.28,
          mobileY: -0.01,
          mobileScale: 0.58,
          mobileRotation: 0.5,
        },
        toolkit: {
          x: 0.34,
          y: -0.02,
          scale: 1.14,
          rotation: -0.82,
          mobileX: 0.28,
          mobileY: -0.23,
          mobileScale: 0.58,
          mobileRotation: -0.5,
        },
        contact: {
          x: -0.34,
          y: -0.02,
          scale: 1.14,
          rotation: 0.82,
          mobileX: -0.28,
          mobileY: -0.23,
          mobileScale: 0.58,
          mobileRotation: 0.5,
        },
        footer: {
          x: 0.3,
          y: -0.02,
          scale: 1.14,
          rotation: -0.5,
          mobileX: 0.26,
          mobileY: -0.23,
          mobileScale: 0.58,
          mobileRotation: -0.35,
        },
      };
      const layout = layouts[section];
      return {
        position: new THREE.Vector3(
          visibleWidth * (compact ? layout.mobileX ?? Math.sign(layout.x) * 0.31 : layout.x),
          visibleHeight * (compact ? layout.mobileY ?? -0.3 : layout.y),
          0,
        ),
        rotation: compact ? layout.mobileRotation ?? layout.rotation ?? 0 : layout.rotation ?? 0,
        scale: baseScale * (compact ? layout.mobileScale ?? 0.39 : layout.scale),
      };
    };

    const resolveHeroScrollAnchor = () => {
      const anchor = resolveAnchor("home");
      const hero = document.getElementById("home");
      if (!hero) return anchor;

      const heroRect = hero.getBoundingClientRect();
      const heroScroll = THREE.MathUtils.clamp(-heroRect.top, 0, heroRect.height);
      anchor.position.y += (heroScroll / Math.max(viewportHeight, 1)) * visibleHeight;
      return anchor;
    };

    const resolveNarrativeScrollAnchor = (section: CharacterSection) => {
      const anchor = resolveAnchor(section);
      const sectionElement = document.getElementById(section);
      if (!sectionElement) return anchor;

      const sectionRect = sectionElement.getBoundingClientRect();
      const contentRects = [...sectionElement.querySelectorAll<HTMLElement>("[data-character-anchor]")]
        .map((element) => element.getBoundingClientRect());
      const canvasRect = container.getBoundingClientRect();
      const contentTop = contentRects.length
        ? Math.min(...contentRects.map((rect) => rect.top))
        : sectionRect.top;
      const contentBottom = contentRects.length
        ? Math.max(...contentRects.map((rect) => rect.bottom))
        : sectionRect.bottom;
      const sectionCenter = (contentTop + contentBottom) / 2;
      const stageCenter = canvasRect.top + viewportHeight / 2;
      const sectionCenterOffset = sectionCenter - stageCenter;
      anchor.position.y -=
        (sectionCenterOffset / Math.max(viewportHeight, 1)) * visibleHeight;
      return anchor;
    };

    const resolveSectionAnchor = (section: CharacterSection) => {
      if (section === "home") return resolveHeroScrollAnchor();
      return resolveNarrativeScrollAnchor(section);
    };

    const setCharacterOpacity = (opacity: number) => {
      characterOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
      materialStates.forEach((state) => {
        const shouldBeTransparent = state.transparent || characterOpacity < 0.999;
        if (state.material.transparent !== shouldBeTransparent) {
          state.material.transparent = shouldBeTransparent;
          state.material.needsUpdate = true;
        }
        state.material.opacity = state.opacity * characterOpacity;
        state.material.depthWrite = characterOpacity >= 0.999 ? state.depthWrite : false;
      });
      if (groundShadow) groundShadow.material.opacity = 0.14 * characterOpacity;
    };

    const applyTransform = (anchor: ResolvedAnchor, opacity = characterOpacity) => {
      if (!wrapper) return;
      wrapper.position.copy(anchor.position);
      wrapper.rotation.y = anchor.rotation;
      wrapper.scale.setScalar(anchor.scale);
      setCharacterOpacity(opacity);
      if (workstation) {
        const layoutScale = anchor.scale / Math.max(baseScale, Number.EPSILON);
        workstation.visible = requestedSection === "work" && characterOpacity > 0.001;
        workstation.position.copy(anchor.position);
        workstation.rotation.y = anchor.rotation;
        workstation.scale.setScalar(layoutScale);
      }
      if (groundShadow) {
        groundShadow.visible = requestedSection !== "home";
        groundShadow.position.set(anchor.position.x, anchor.position.y - anchor.scale * 0.48, -0.18);
        groundShadow.scale.set(anchor.scale * 0.82, anchor.scale * 0.2, 1);
      }
    };

    const cancelSequence = () => {
      sequenceVersion += 1;
      [...cancellationHandlers].forEach((cancel) => cancel());
      cancellationHandlers.clear();
      activeMotion = null;
    };

    const isCurrent = (token: number) => !disposed && token === sequenceVersion;

    const startAction = (key: ClipKey, loop: boolean, fade = 0.36) => {
      const action = actions.get(key);
      if (!action) return null;
      if (currentAction === action && currentClip === key && loop && action.isRunning()) return action;

      const config: ClipAsset = CHARACTER_CLIPS[key];
      const previous = currentAction;
      action.reset();
      action.enabled = true;
      action.paused = false;
      action.clampWhenFinished = !loop;
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      const playbackRate = config.desiredDuration
        ? action.getClip().duration / config.desiredDuration
        : config.playbackRate ?? 1;
      action.setEffectiveTimeScale(THREE.MathUtils.clamp(playbackRate, 0.72, 1.6));
      action.setEffectiveWeight(1);
      action.play();
      if (previous && previous !== action) previous.fadeOut(fade);
      action.fadeIn(fade);
      currentAction = action;
      currentClip = key;
      container.dataset.characterClip = key;
      return action;
    };

    const playLoop = (key: ClipKey, fade = 0.36) => startAction(key, true, fade);

    const playOneShot = (key: ClipKey, token: number, fade = 0.36) =>
      new Promise<boolean>((resolve) => {
        if (!mixer || !isCurrent(token)) {
          resolve(false);
          return;
        }
        const action = startAction(key, false, fade);
        if (!action) {
          resolve(false);
          return;
        }

        let settled = false;
        const cleanup = () => {
          mixer?.removeEventListener("finished", handleFinished);
          cancellationHandlers.delete(cancel);
        };
        const finish = (completed: boolean) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(completed);
        };
        const handleFinished = (event: { action: THREE.AnimationAction }) => {
          if (event.action === action) finish(isCurrent(token));
        };
        const cancel = () => finish(false);
        cancellationHandlers.add(cancel);
        mixer.addEventListener("finished", handleFinished);
      });

    const playSectionAnimation = async (section: CharacterSection, token: number, fade = 0.36) => {
      const sectionScene = SECTION_SCENES[section];
      await ensureClips(clipsForSection(section));
      if (!isCurrent(token)) return;
      const config: ClipAsset = CHARACTER_CLIPS[sectionScene.clip];
      if (config.loop) {
        playLoop(sectionScene.clip, fade);
        return;
      }
      const completed = await playOneShot(sectionScene.clip, token, fade);
      if (completed && isCurrent(token)) playLoop(sectionScene.fallback, 0.42);
    };

    const tweenTo = (
      target: ResolvedAnchor,
      targetOpacity: number,
      duration: number,
      token: number,
      scrollDistance: number,
    ) => new Promise<boolean>((resolve) => {
      if (!wrapper || !isCurrent(token)) {
        resolve(false);
        return;
      }
      let settled = false;
      const finish = (completed: boolean) => {
        if (settled) return;
        settled = true;
        cancellationHandlers.delete(cancel);
        if (activeMotion?.finish === finish) activeMotion = null;
        resolve(completed);
      };
      const cancel = () => finish(false);
      cancellationHandlers.add(cancel);
      activeMotion = {
        fromPosition: wrapper.position.clone(),
        toPosition: target.position.clone(),
        fromRotation: wrapper.rotation.y,
        toRotation: target.rotation,
        fromScale: wrapper.scale.x,
        toScale: target.scale,
        fromOpacity: characterOpacity,
        toOpacity: targetOpacity,
        startedAt: performance.now(),
        duration,
        scrollStartY: window.scrollY,
        scrollDistance: Math.max(scrollDistance, 1),
        fallbackDelay: 0.16,
        finish,
      };
    });

    const runReducedSection = async (section: CharacterSection, token: number) => {
      await ensureClips([SECTION_SCENES[section].fallback]);
      if (!isCurrent(token)) return;
      currentSection = section;
      applyTransform(resolveSectionAnchor(section), 1);
      playLoop(SECTION_SCENES[section].fallback, 0);
    };

    const runSectionTransition = async (section: CharacterSection, token: number) => {
      await ensureClips([...CORE_CLIPS, ...clipsForSection(section)]);
      if (!wrapper || !isCurrent(token)) return;
      if (reducedMotionRef.current) {
        await runReducedSection(section, token);
        return;
      }

      const target = resolveSectionAnchor(section);
      const currentIndex = SECTION_ORDER.indexOf(currentSection);
      const targetIndex = SECTION_ORDER.indexOf(section);
      const switchingBetweenAdjacentSections = Math.abs(currentIndex - targetIndex) === 1;
      const exitSide = wrapper.position.x >= 0 ? 1 : -1;
      const destinationSide = target.position.x >= 0 ? 1 : -1;
      const exitAnchor: ResolvedAnchor = {
        position: new THREE.Vector3(visibleWidth * exitSide * 0.48, visibleHeight * -0.3, 0),
        rotation: exitSide > 0 ? Math.PI / 2 : -Math.PI / 2,
        scale: wrapper.scale.x,
      };
      const entryAnchor: ResolvedAnchor = {
        position: new THREE.Vector3(visibleWidth * destinationSide * 0.48, visibleHeight * -0.3, 0),
        rotation: destinationSide > 0 ? -Math.PI / 2 : Math.PI / 2,
        scale: target.scale,
      };

      playLoop("runLoop", 0.28);
      if (
        !switchingBetweenAdjacentSections &&
        !(await tweenTo(exitAnchor, 0, 0.58, token, viewportHeight * 0.14))
      ) return;
      applyTransform(entryAnchor, 0);
      if (!(await tweenTo(target, 1, 0.64, token, viewportHeight * 0.14))) return;
      currentSection = section;
      container.dataset.characterSettled = section;
      await playSectionAnimation(section, token);
    };

    const requestSection = (section: CharacterSection, force = false) => {
      requestedSection = section;
      if (!ready) return;
      if (!force && currentSection === section && !activeMotion) return;
      const currentIndex = SECTION_ORDER.indexOf(currentSection);
      const targetIndex = SECTION_ORDER.indexOf(section);
      if (Math.abs(currentIndex - targetIndex) === 1) setCharacterOpacity(0);
      container.dataset.characterDestination = section;
      cancelSequence();
      const token = sequenceVersion;
      void runSectionTransition(section, token);
    };

    const handleSectionBoundaryScroll = () => {
      const requestedIndex = SECTION_ORDER.indexOf(requestedSection);
      if (requestedIndex < 0) return;
      const characterStageTop = container.getBoundingClientRect().top;
      const nextSection = SECTION_ORDER[requestedIndex + 1];
      const nextElement = nextSection ? document.getElementById(nextSection) : null;
      const currentElement = document.getElementById(requestedSection);

      if (
        nextSection &&
        nextElement &&
        nextElement.getBoundingClientRect().top <= characterStageTop + 24
      ) {
        requestSection(nextSection);
      } else if (
        requestedIndex > 0 &&
        currentElement &&
        currentElement.getBoundingClientRect().top >= window.innerHeight
      ) {
        requestSection(SECTION_ORDER[requestedIndex - 1]);
      }
    };

    const updateMotion = (now: number) => {
      if (!activeMotion || !wrapper) return;
      const motion = activeMotion;
      const elapsed = (now - motion.startedAt) / 1000;
      const timedProgress = Math.max(elapsed - motion.fallbackDelay, 0) / motion.duration;
      const scrollProgress = Math.abs(window.scrollY - motion.scrollStartY) / motion.scrollDistance;
      const rawProgress = THREE.MathUtils.clamp(Math.max(timedProgress, scrollProgress), 0, 1);
      const progress = smoothstep(rawProgress);
      applyTransform({
        position: new THREE.Vector3().lerpVectors(motion.fromPosition, motion.toPosition, progress),
        rotation: THREE.MathUtils.lerp(motion.fromRotation, motion.toRotation, progress),
        scale: THREE.MathUtils.lerp(motion.fromScale, motion.toScale, progress),
      }, THREE.MathUtils.lerp(motion.fromOpacity, motion.toOpacity, progress));
      if (rawProgress >= 1) motion.finish(true);
    };

    const syncSectionToScroll = () => {
      if (!ready || activeMotion) return;
      applyTransform(resolveSectionAnchor(requestedSection), 1);
    };

    const configureSectionClip = () => {
      if (!renderer) return;
      renderer.setScissorTest(false);
      renderer.clear(true, true, true);

      if (activeMotion) return;
      const section = document.getElementById(requestedSection);
      if (!section) return;
      const canvasRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const localTop = THREE.MathUtils.clamp(sectionRect.top - canvasRect.top, 0, viewportHeight);
      const localBottom = THREE.MathUtils.clamp(sectionRect.bottom - canvasRect.top, 0, viewportHeight);
      const clipHeight = localBottom - localTop;
      if (clipHeight <= 0) return;

      renderer.setScissor(
        0,
        Math.round(viewportHeight - localBottom),
        Math.round(viewportWidth),
        Math.round(clipHeight),
      );
      renderer.setScissorTest(true);
    };

    const render = (now: number) => {
      if (disposed) return;
      const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;
      if (mixer && !reducedMotionRef.current) mixer.update(delta);
      updateMotion(now);
      syncSectionToScroll();
      configureSectionClip();
      renderer?.render(scene, camera);
      if (pageVisible) frameId = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      updateViewport();
      if (!ready) return;
      cancelSequence();
      currentSection = requestedSection;
      applyTransform(resolveSectionAnchor(requestedSection), 1);
      const token = sequenceVersion;
      void playSectionAnimation(requestedSection, token);
    };

    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible && !frameId) {
        lastFrameTime = performance.now();
        frameId = window.requestAnimationFrame(render);
      } else if (!pageVisible && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const initialize = async () => {
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute("aria-hidden", "true");
        container.replaceChildren(renderer.domElement);
        camera.position.set(0, 0, 10);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb4c7, 2.15));
        const keyLight = new THREE.DirectionalLight(0xfffaed, 2.35);
        keyLight.position.set(6, 10, 8);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.25);
        rimLight.position.set(-6, 4, -5);
        scene.add(rimLight);
        workstation = createWorkstation();
        workstation.visible = false;
        scene.add(workstation);
        updateViewport();

        modelRoot = await loadFBX(BASE_MODEL_PATH);
        if (disposed) return;
        const bounds = new THREE.Box3().setFromObject(modelRoot);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        modelRoot.position.sub(center);
        baseScale = 5.8 / (Math.max(size.x, size.y, size.z) || 1);
        modelRoot.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            if (!material || materialStates.some((state) => state.material === material)) return;
            materialStates.push({
              material,
              opacity: material.opacity,
              transparent: material.transparent,
              depthWrite: material.depthWrite,
            });
          });
        });

        wrapper = new THREE.Group();
        wrapper.visible = false;
        wrapper.add(modelRoot);
        scene.add(wrapper);
        groundShadow = new THREE.Mesh(
          new THREE.CircleGeometry(0.5, 32),
          new THREE.MeshBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.14, depthWrite: false }),
        );
        groundShadow.visible = false;
        scene.add(groundShadow);
        mixer = new THREE.AnimationMixer(modelRoot);

        await ensureClips(clipsForSection(activeSectionRef.current));
        if (disposed) return;
        ready = true;
        currentSection = activeSectionRef.current;
        requestedSection = activeSectionRef.current;
        applyTransform(resolveSectionAnchor(currentSection), 1);
        const token = sequenceVersion;
        await playSectionAnimation(currentSection, token, 0);
        if (disposed || !isCurrent(token)) return;
        mixer.update(0);
        wrapper.visible = true;
        setLoadState("ready");
        void preloadSectionClips();
      } catch (error) {
        if (disposed || (error instanceof DOMException && error.name === "AbortError")) return;
        console.error("Unable to initialize the polar bear character:", error);
        setLoadState("failed");
      }
    };

    sectionHandlerRef.current = (section) => {
      if (section === requestedSection) return;
      const requestedIndex = SECTION_ORDER.indexOf(requestedSection);
      const incomingIndex = SECTION_ORDER.indexOf(section);
      if (Math.abs(requestedIndex - incomingIndex) === 1) {
        handleSectionBoundaryScroll();
        return;
      }
      requestSection(section);
    };
    motionPreferenceHandlerRef.current = () => requestSection(requestedSection, true);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleSectionBoundaryScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    frameId = window.requestAnimationFrame(render);
    void initialize();
    handleSectionBoundaryScroll();

    return () => {
      disposed = true;
      ready = false;
      sectionHandlerRef.current = () => undefined;
      motionPreferenceHandlerRef.current = () => undefined;
      abortController.abort();
      cancelSequence();
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleSectionBoundaryScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mixer?.stopAllAction();
      if (modelRoot) {
        mixer?.uncacheRoot(modelRoot);
        disposeObject(modelRoot);
      }
      if (workstation) disposeObject(workstation);
      groundShadow?.geometry.dispose();
      groundShadow?.material.dispose();
      scene.clear();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div className={`character-canvas character-canvas-${loadState}`}>
      <div ref={containerRef} className="character-canvas-host" />
      <div className="character-signature-loader" aria-hidden="true">
        <div className="signature-loader-content">
          <svg className="signature-loader-mark" viewBox="0 0 132 102" role="presentation">
            <g className="signature-loader-outline">
              <circle cx="38" cy="35" r="20" />
              <circle cx="94" cy="35" r="20" />
              <path d="M58 34 C65 29 69 29 74 34" />
              <path d="M18 31 L7 25 M114 31 L125 25" />
              <path d="M29 70 C46 82 84 82 103 69 C96 84 87 93 67 96 C48 93 37 84 29 70 Z" />
            </g>
            <g className="signature-loader-glasses">
              <circle className="signature-loader-line signature-loader-lens-left" cx="38" cy="35" r="20" pathLength="100" />
              <circle className="signature-loader-line signature-loader-lens-right" cx="94" cy="35" r="20" pathLength="100" />
              <path className="signature-loader-line signature-loader-bridge" d="M58 34 C65 29 69 29 74 34" pathLength="100" />
              <path className="signature-loader-line signature-loader-arm" d="M18 31 L7 25 M114 31 L125 25" pathLength="100" />
            </g>
            <path
              className="signature-loader-line signature-loader-scarf"
              d="M29 70 C46 82 84 82 103 69 C96 84 87 93 67 96 C48 93 37 84 29 70 Z"
              pathLength="100"
            />
          </svg>
          <span>The engineer is getting ready.</span>
        </div>
      </div>
      {loadState === "failed" && (
        <div className="character-static-fallback" aria-hidden="true">Polar bear</div>
      )}
    </div>
  );
};

export default PolarBear3DCanvas;
