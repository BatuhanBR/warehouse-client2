import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TestCube = () => {
    console.log("TestCube component initialized");

    const divRef = useRef(null);
    
    useEffect(() => {
        console.log("TestCube useEffect started");
        
        // Get div dimensions
        const container = divRef.current;
        if (!container) {
            console.error("Container not found");
            return;
        }
        
        // WebGL desteğini kontrol et
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                throw new Error('WebGL not supported');
            }
            console.log("WebGL is supported");
        } catch (e) {
            console.error("WebGL Error:", e);
            return;
        }
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        console.log("Container dimensions:", width, height);

        try {
            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x333333); // Koyu gri arkaplan
            console.log("Scene created");

            // Camera setup
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.z = 5;
            console.log("Camera created");

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);
            console.log("Renderer created and attached");

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            const pointLight = new THREE.PointLight(0xffffff, 1);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);
            console.log("Lights added");

            // Add a simple cube
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x00ff00,
                shininess: 100 
            });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            console.log("Cube added to scene");

            // Animation
            function animate() {
                requestAnimationFrame(animate);
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                renderer.render(scene, camera);
            }
            animate();
            console.log("Animation started");

            // Cleanup
            return () => {
                console.log("Cleanup started");
                if (container && renderer.domElement) {
                    container.removeChild(renderer.domElement);
                }
                renderer.dispose();
                geometry.dispose();
                material.dispose();
            };
        } catch (error) {
            console.error("Three.js setup error:", error);
        }
    }, []);

    return (
        <div 
            ref={divRef} 
            style={{ 
                width: '100%', 
                height: '500px', 
                backgroundColor: '#f0f0f0',
                border: '2px solid red' // Görünür olması için border ekledik
            }}
        />
    );
};

export default TestCube; 