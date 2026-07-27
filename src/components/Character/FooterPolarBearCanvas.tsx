import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { BASE_MODEL_PATH, CHARACTER_CLIPS } from "./characterConfig";

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

const FooterPolarBearCanvas = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frameId = 0;
    let previousTime = performance.now();
    let mixer: THREE.AnimationMixer | null = null;
    let model: THREE.Group | null = null;
    let animationObject: THREE.Group | null = null;
    const abortController = new AbortController();
    const loader = new FBXLoader();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1.18, -1.18, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.replaceChildren(renderer.domElement);
    camera.position.set(0, 0, 10);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb4c7, 2.15));
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.35);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const loadFBX = async (path: string) => {
      const response = await fetch(`${baseUrl}models/${path}`, { signal: abortController.signal });
      if (!response.ok) throw new Error(`Unable to load ${path} (${response.status})`);
      return loader.parse(await response.arrayBuffer(), `${baseUrl}models/`);
    };

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      const aspect = width / height;
      camera.left = -1.18 * aspect;
      camera.right = 1.18 * aspect;
      camera.top = 1.18;
      camera.bottom = -1.18;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const render = (now: number) => {
      if (disposed) return;
      mixer?.update(Math.min((now - previousTime) / 1000, 0.1));
      previousTime = now;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const initialize = async () => {
      try {
        [model, animationObject] = await Promise.all([
          loadFBX(BASE_MODEL_PATH),
          loadFBX(CHARACTER_CLIPS.thankYouWave.path),
        ]);
        if (disposed) return;

        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 3.55 / Math.max(size.y, 1);
        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          1.08 - bounds.max.y * scale,
          -center.z * scale,
        );
        scene.add(model);

        const sourceClip = animationObject.animations[0];
        if (sourceClip) {
          const clip = sourceClip.clone();
          clip.tracks.forEach((track) => {
            track.name = track.name.replace(/.*mixamorig/i, "mixamorig");
          });
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.setEffectiveTimeScale(CHARACTER_CLIPS.thankYouWave.playbackRate);
          action.play();
        }
      } catch (error) {
        if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Unable to initialize the footer polar bear:", error);
        }
      }
    };

    frameId = window.requestAnimationFrame(render);
    void initialize();

    return () => {
      disposed = true;
      abortController.abort();
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mixer?.stopAllAction();
      if (model) {
        mixer?.uncacheRoot(model);
        disposeObject(model);
      }
      if (animationObject) disposeObject(animationObject);
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="footer-character-model" aria-hidden="true" />;
};

export default FooterPolarBearCanvas;
