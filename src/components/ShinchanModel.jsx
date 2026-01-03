import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useRef } from "react";

/* ================= SHINCHAN ================= */

function Shinchan({ animation }) {
  const VALID_ANIMATIONS = ["default", "dance", "Talking", "listen"];

  const safeAnimation = VALID_ANIMATIONS.includes(animation)
    ? animation
    : "default";

  const fbx = useLoader(
    FBXLoader,
    `/models/shinchan/${safeAnimation}.fbx`
  );

  const mixer = useRef(null);

  useEffect(() => {
    if (!fbx) return;

    mixer.current?.stopAllAction();

    fbx.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.frustumCulled = false;
      }
    });

    fbx.scale.set(3, 3, 3);

    if (fbx.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(fbx);
      const action = mixer.current.clipAction(fbx.animations[0]);
      action.reset().play();
    }

    return () => mixer.current?.stopAllAction();
  }, [fbx]);

  useFrame((_, delta) => mixer.current?.update(delta));

  return (
    <group position={[0, -1.8, 0]}>
      <primitive object={fbx} />
    </group>
  );
}

/* ================= CANVAS ================= */

export default function ShinchanModel({ animation }) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 90, position: [0, 2, 10] }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <Shinchan animation={animation} />
    </Canvas>
  );
}
