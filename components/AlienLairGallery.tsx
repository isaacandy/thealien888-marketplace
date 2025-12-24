"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointerLockControls, Image, Text, Environment, Stars } from "@react-three/drei";
import * as THREE from "three";

// 1. THE FRAMED NFT COMPONENT
// This takes an image URL and positions it on the wall with a neon frame
function AlienFrame({ url, position, rotation }: { url: string; position: [number, number, number]; rotation: [number, number, number] }) {
  const [hovered, setHover] = useState(false);
  
  return (
    <group position={position} rotation={rotation}>
      {/* The Art */}
      <Image url={url} scale={[4, 4]} />
      <Image url={url} scale={[4, 4]} />
      
      {/* The Neon Frame (Glowing Border) */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshStandardMaterial
          args={[{
            color: hovered ? "#00ff00" : "#8a2be2",
            emissive: hovered ? "#00ff00" : "#8a2be2",
            emissiveIntensity: 2,
          }]}
        />
      </mesh>
      
      {/* Interactive Trigger */}
      <mesh 
        position={[0, 0, 0.1]} 
        visible={false}
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
        onClick={() => window.open(url, "_blank")} // Open full image on click
      >
        <planeGeometry args={[4, 4]} />
      </mesh>
    </group>
  );
}

// 2. THE ROOM (The Lair)
function LairRoom() {
  return (
    <group>
      {/* Floor - Dark sci-fi grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial args={[{ color: "#050505", roughness: 0.1, metalness: 0.8 }]} />
        <gridHelper args={[50, 50, "#00ff00", "#1a1a1a"]} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>

      {/* Ceiling - Reflective dark surface */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial args={[{ color: "#000", roughness: 0.2, metalness: 0.9 }]} />
      </mesh>
    </group>
  );
}

// 3. MAIN GALLERY SCENE
export default function AlienLairGallery({ nftImages }: { nftImages: string[] }) {
  return (
    <div className="h-screen w-full bg-black">
      {/* Instructions Overlay */}
      <div className="absolute top-5 left-5 z-10 text-green-400 font-mono bg-black/80 p-4 border border-green-500 rounded">
        <h2 className="text-xl font-bold">THE ALIEN.888 LAIR</h2>
        <p>Click to Enter. Move: W/A/S/D. Look: Mouse.</p>
        <p className="text-xs text-gray-400 mt-2">ESC to release cursor.</p>
      </div>

      <Canvas shadows camera={{ position: [0, 2, 10], fov: 60 }}>
        {/* Atmosphere */}
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 5, 30]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 5, 0]} intensity={1} color="#00ff00" distance={20} />
        
        {/* The Room Geometry */}
        <LairRoom />

        {/* Dynamically Place NFTs on the Walls */}
        {nftImages.map((url, i) => {
          // Simple logic to place frames in a circle or line. 
          // Here we place them in a semi-circle around the user.
          const angle = (i / nftImages.length) * Math.PI * 2; 
          const radius = 10;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          const rotY = Math.atan2(x, z); // Face the center

          return (
             <AlienFrame 
               key={i} 
               url={url} 
               position={[x, 2, z]} 
               rotation={[0, rotY + Math.PI, 0]} // Rotate to face inward
             />
          );
        })}

        {/* First Person Controls (WASD + Mouse Look) */}
        <PointerLockControls />
      </Canvas>
    </div>
  );
}