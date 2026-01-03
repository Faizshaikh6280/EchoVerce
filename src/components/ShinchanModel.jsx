import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import * as THREE from "three";
import { useEffect, useRef } from "react";

useLoader.preload(FBXLoader, "/models/shinchan/idle.fbx");
useLoader.preload(FBXLoader, "/models/shinchan/default.fbx");
useLoader.preload(FBXLoader, "/models/shinchan/listen.fbx");
useLoader.preload(FBXLoader, "/models/shinchan/Talking.fbx");
useLoader.preload(FBXLoader, "/models/shinchan/dance.fbx");

/* ================= SHINCHAN ================= */

function Shinchan({ animation }) {
  const group = useRef();
  const mixer = useRef();
  const actions = useRef({});

  // Load IDLE always
  const idleFbx = useLoader(
    FBXLoader,
    "/models/shinchan/idle.fbx"
  );

  // Load current animation (wave, dance, talk…)
  const animFbx = useLoader(
    FBXLoader,
    animation !== "idle"
      ? `/models/shinchan/${animation}.fbx`
      : null
  );

  // Setup model once
  useEffect(() => {
    idleFbx.scale.set(4, 4, 4);
    idleFbx.position.set(0, -1.8, 0);

    idleFbx.traverse((obj) => {
      if (obj.isMesh) {
        obj.frustumCulled = false;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    group.current.add(idleFbx);

    mixer.current = new THREE.AnimationMixer(idleFbx);

    // Idle action (loop)
    actions.current.idle = mixer.current.clipAction(
      idleFbx.animations[0]
    );
    actions.current.idle.play();

    return () => mixer.current.stopAllAction();
  }, [idleFbx]);

  // Handle animation switching
  // Handle animation switching
 useEffect(() => {
  if (!mixer.current || !idleFbx) return;

  const mixerInstance = mixer.current;

  // 🔥 STOP EVERYTHING FIRST (CRITICAL)
  mixerInstance.stopAllAction();
  mixerInstance.removeEventListener("finished", () => {});

  const idleAction = mixerInstance.clipAction(idleFbx.animations[0]);
  idleAction.setLoop(THREE.LoopRepeat);
  idleAction.reset().fadeIn(0.3).play();

  // 👉 IDLE ONLY
  if (animation === "idle" || !animFbx) return;

  const action = mixerInstance.clipAction(animFbx.animations[0]);

  // 🕺 DANCE → LOOP UNTIL SONG STOPS
  if (animation === "dance") {
    idleAction.fadeOut(0.3);

    action.reset();
    action.setLoop(THREE.LoopRepeat);
    action.clampWhenFinished = false;
    action.fadeIn(0.3).play();

    return;
  }

  // 🎤 LISTEN / TALK → LOOP
  if (animation === "listen" || animation === "Talking") {
    idleAction.fadeOut(0.3);

    action.reset();
    action.setLoop(THREE.LoopRepeat);
    action.clampWhenFinished = false;
    action.fadeIn(0.3).play();

    return;
  }

  // 👋 WAVE / DEFAULT → PLAY ONCE → BACK TO IDLE
  idleAction.fadeOut(0.3);

  action.reset();
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.fadeIn(0.3).play();

  const onFinished = () => {
    mixerInstance.removeEventListener("finished", onFinished);

    action.fadeOut(0.4);
    idleAction.reset().fadeIn(0.4).play();
  };

  mixerInstance.addEventListener("finished", onFinished);

  return () => {
    mixerInstance.removeEventListener("finished", onFinished);
  };
}, [animation, animFbx, idleFbx]);




  useFrame((_, delta) => mixer.current?.update(delta));

  return <group ref={group} />;
}

/* ================= CANVAS ================= */

export default function ShinchanModel({ animation }) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 90, position: [0, 2, 10] }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Shinchan animation={animation} />
    </Canvas>
  );
}
