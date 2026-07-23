import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        let character: THREE.Object3D;
        const processGLTF = async (gltf: GLTF) => {
          character = gltf.scene;
          await renderer.compileAsync(character, camera, scene);
          character.traverse((child: any) => {
            if (child.isMesh) {
              const mesh = child as THREE.Mesh;
              child.castShadow = true;
              child.receiveShadow = true;
              mesh.frustumCulled = true;
            }
          });
          resolve(gltf);
          setCharTimeline(character, camera);
          setAllTimeline();
          const footR = character.getObjectByName("footR");
          const footL = character.getObjectByName("footL");
          if (footR) footR.position.y = 3.36;
          if (footL) footL.position.y = 3.36;
          dracoLoader.dispose();
        };

        try {
          const encryptedBlob = await decryptFile(
            "/models/character.enc",
            "Character3D#@"
          );
          const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));
          loader.load(
            blobUrl,
            processGLTF,
            undefined,
            (error) => {
              console.warn("Encrypted load failed, falling back to direct .glb:", error);
              loader.load("/models/character.glb", processGLTF, undefined, reject);
            }
          );
        } catch {
          loader.load("/models/character.glb", processGLTF, undefined, reject);
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
