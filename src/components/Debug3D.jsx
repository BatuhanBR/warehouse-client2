import React from 'react';
import { Canvas } from '@react-three/fiber';

function Box(props) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
}

export default function Debug3D() {
  return (
    <div style={{ width: '100%', height: '400px', background: '#f0f0f0' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
      </Canvas>
    </div>
  );
} 