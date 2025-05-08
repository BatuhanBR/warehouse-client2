import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';

function Box() {
  return (
    <mesh>
      <boxGeometry />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}

export default function SimpleTest3D() {
  return (
    <div style={{ width: '100%', height: '300px', border: '2px solid red' }}>
      <Canvas
        camera={{ position: [0, 0, 5] }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#f0f0f0'))
        }}
      >
        <Box />
      </Canvas>
    </div>
  );
} 