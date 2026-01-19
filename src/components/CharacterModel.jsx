// src/components/CharacterModel.jsx
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useRef } from "react";

// const characters = ["api-abdul-kalam", "ed-sheeran", "oggy", "shinchan"];
// const actions = ["idle", "dance", "listen", "Talking"];

// export function usePreloadedModels() {
//   const models = useRef({}); // store all loaded models

//   useEffect(() => {
//     characters.forEach((char) => {
//       models.current[char] = {};
//       actions.forEach((action) => {
//         const loader = new FBXLoader();
//         loader.load(`/models/${char}/${action}.fbx`, (fbx) => {
//           fbx.visible = false; // hide initially
//           models.current[char][action] = fbx;
//         });
//       });
//     });
//   }, []);

//   return models;
// }

function Character({ animation, modelPath }) {
  const group = useRef();
  const mixer = useRef();

  // ✅ Always load idle
  const idleFbx = useLoader(FBXLoader, `${modelPath}/idle.fbx`);
  console.log("LOADING MODEL:", `${modelPath}/idle.fbx`);
  // ✅ Always load animation (never conditional hook)
  const animFbx = useLoader(FBXLoader, `${modelPath}/${animation}.fbx`);

  // Setup model
  useEffect(() => {
    if (modelPath.toLowerCase().includes("oggy")) {
      idleFbx.scale.set(0.02, 0.02, 0.02);
      idleFbx.position.set(0, -2.5, 0);
      // idleFbx.rotation.y = 0;
    } else {
      // default transform for all other characters
      idleFbx.scale.set(4, 4, 4);
      idleFbx.position.set(0, -1.4, 0);
    }

    idleFbx.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    group.current.clear(); // 🔥 VERY IMPORTANT
    group.current.add(idleFbx);

    mixer.current = new THREE.AnimationMixer(idleFbx);

    const idleAction = mixer.current.clipAction(idleFbx.animations[0]);
    idleAction.setLoop(THREE.LoopRepeat);
    idleAction.play();

    return () => mixer.current?.stopAllAction();
  }, [idleFbx]);

  // Animation switching
  useEffect(() => {
    if (!mixer.current) return;

    const mixerInstance = mixer.current;
    mixerInstance.stopAllAction();

    const idleAction = mixerInstance.clipAction(idleFbx.animations[0]);
    idleAction.reset().fadeIn(0.3).play();

    if (animation === "idle") return;

    const action = mixerInstance.clipAction(animFbx.animations[0]);

    idleAction.fadeOut(0.3);
    action.reset();
    action.setLoop(THREE.LoopRepeat);
    action.fadeIn(0.3).play();
  }, [animation, animFbx, idleFbx]);

  useFrame((_, delta) => mixer.current?.update(delta));

  return <group ref={group} />;
}

export default function CharacterModel({ animation, modelPath }) {
  return (
    <Canvas
      key={modelPath} // 🔥 prevents WebGL crash
      orthographic
      camera={{ zoom: 90, position: [0, 2, 10] }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Character animation={animation} modelPath={modelPath} />
    </Canvas>
  );
}
