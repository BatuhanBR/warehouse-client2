import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import WarehouseProductModal from './WarehouseProductModal';
import { Button, Select, ConfigProvider, theme as antTheme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

const WarehouseView3D = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const mountRef = useRef(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCell, setSelectedCell] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRack, setSelectedRack] = useState(null);
    const [rackLocations, setRackLocations] = useState([]);

    // Scene ve camera referanslarını component scope'unda tut
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);

    // Raf boyutları
    const SHELF_DIMENSIONS = {
        width: 4,        // 4 bölmelik genişlik
        height: 0.8,     // Her katın yüksekliği
        depth: 1,        // Raf derinliği
        thickness: 0.05, // Metal çerçeve kalınlığı
        spacing: 0.02    // Bölmeler arası boşluk
    };

    // Materyal önbelleği
    const MATERIALS = {
        metal: new THREE.MeshPhongMaterial({
            color: isDark ? 0x666666 : 0xb0b0b0,
            shininess: 60,
            specular: 0x444444
        }),
        emptyCell: new THREE.LineBasicMaterial({
            color: isDark ? 0x4a5568 : 0x90caf9,
            transparent: true,
            opacity: isDark ? 0.7 : 0.5
        }),
        occupiedCell: new THREE.LineBasicMaterial({
            color: isDark ? 0x3182ce : 0x2196f3,
            transparent: true,
            opacity: isDark ? 0.9 : 0.8
        })
    };

    // Geometri önbelleği
    const GEOMETRIES = {
        platform: new THREE.BoxGeometry(
            SHELF_DIMENSIONS.width,
            SHELF_DIMENSIONS.thickness,
            SHELF_DIMENSIONS.depth
        ),
        pillar: new THREE.BoxGeometry(
            SHELF_DIMENSIONS.thickness,
            SHELF_DIMENSIONS.height * 4,
            SHELF_DIMENSIONS.thickness
        )
    };

    // Raf seçme işlemi
    const handleRackSelect = async (rackNumber) => {
        try {
            console.log('Raf seçildi:', rackNumber);
            
            const response = await axios.get(`http://localhost:3000/api/locations/rack/${rackNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Raf verisi:', response.data);
            
            if (response.data.success) {
                // Mevcut rafı temizle
                if (sceneRef.current) {
                    const existingShelf = sceneRef.current.getObjectByName('currentShelf');
                    if (existingShelf) {
                        sceneRef.current.remove(existingShelf);
                    }
                }

                setRackLocations(response.data.data || []);
                setSelectedRack(rackNumber);

                // Yeni rafı oluştur
                const shelf = createShelf(rackNumber, response.data.data || []);
                if (shelf && sceneRef.current) {
                    shelf.name = 'currentShelf';
                    sceneRef.current.add(shelf);
                }
            }
        } catch (error) {
            console.error('Raf bilgileri yüklenirken hata:', error);
            toast.error('Raf bilgileri yüklenemedi');
        }
    };

    // Raf oluşturma
    const createShelf = (rackNumber, locations) => {
        console.log('Raf oluşturuluyor:', rackNumber, locations);
        
        const shelfGroup = new THREE.Group();

        // Her kat için
        for (let level = 1; level <= 4; level++) {
            // Kat platformu
            const platform = new THREE.Mesh(GEOMETRIES.platform, MATERIALS.metal);
            platform.position.y = (level - 1) * SHELF_DIMENSIONS.height;
            shelfGroup.add(platform);

            // Her pozisyon için
            for (let position = 1; position <= 4; position++) {
                const locationData = locations.find(loc => 
                    loc.rackNumber === rackNumber && 
                    loc.level === level && 
                    loc.position === position
                );

                console.log(`Hücre verisi (R${rackNumber}-${level}-${position}):`, locationData);

                const cell = createCell(rackNumber, level, position, locationData);
                
                // Hücreyi konumlandır
                cell.position.set(
                    -SHELF_DIMENSIONS.width/2 + (position-1) * (SHELF_DIMENSIONS.width/4) + SHELF_DIMENSIONS.width/8,
                    (level - 1) * SHELF_DIMENSIONS.height + SHELF_DIMENSIONS.height/2,
                    0
                );

                shelfGroup.add(cell);
            }
        }

        // Dikey destekler
        const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        corners.forEach(([x, z]) => {
            const pillar = new THREE.Mesh(GEOMETRIES.pillar, MATERIALS.metal);
            pillar.position.set(
                x * (SHELF_DIMENSIONS.width/2),
                SHELF_DIMENSIONS.height * 2,
                z * (SHELF_DIMENSIONS.depth/2)
            );
            shelfGroup.add(pillar);
        });

        return shelfGroup;
    };

    // Hücre oluşturma
    const createCell = (rackNumber, level, position, locationData) => {
        const cell = new THREE.Group();
        
        // Hücre geometrisi
        const cellGeometry = new THREE.BoxGeometry(
            SHELF_DIMENSIONS.width/4 - SHELF_DIMENSIONS.spacing,
            SHELF_DIMENSIONS.height - SHELF_DIMENSIONS.spacing,
            SHELF_DIMENSIONS.depth - SHELF_DIMENSIONS.spacing
        );

        // Hücre çerçevesi
        const edges = new THREE.EdgesGeometry(cellGeometry);
        const frame = new THREE.LineSegments(
            edges,
            locationData?.isOccupied ? MATERIALS.occupiedCell : MATERIALS.emptyCell
        );
        cell.add(frame);

        // Eğer ürün varsa, ürün kutusunu ekle
        if (locationData?.isOccupied && locationData?.Product) {
            const product = createProduct(locationData.Product);
            if (product) {
                cell.add(product);
            }
        }

        // Hücre verilerini sakla
        cell.userData = {
            type: 'cell',
            rackNumber,
            level,
            position,
            locationData
        };

        return cell;
    };

    // Ürün oluşturma
    const createProduct = (productData) => {
        if (!productData) return null;

        try {
            // Ürün boyutlarını al (cm'den m'ye çevir)
            const width = (parseFloat(productData.width) || 30) / 100;
            const height = (parseFloat(productData.height) || 30) / 100;
            const depth = (parseFloat(productData.length) || 30) / 100;

            // Ürün rengini belirle
            let color;
            switch(productData.categoryId) {
                case 1: color = 0x2196f3; break; // Elektronik - Mavi
                case 2: color = 0x4caf50; break; // Beyaz Eşya - Yeşil
                case 3: color = 0x795548; break; // Mobilya - Kahverengi
                case 4: color = 0x9c27b0; break; // Tekstil - Mor
                default: color = 0xff5722;       // Varsayılan - Turuncu
            }

            // Ürün materyali
            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 30,
                transparent: true,
                opacity: 0.9
            });

            // Ürün geometrisi
            const geometry = new THREE.BoxGeometry(
                Math.min(width, SHELF_DIMENSIONS.width/4 - SHELF_DIMENSIONS.spacing * 2),
                Math.min(height, SHELF_DIMENSIONS.height - SHELF_DIMENSIONS.spacing * 2),
                Math.min(depth, SHELF_DIMENSIONS.depth - SHELF_DIMENSIONS.spacing * 2)
            );

            const product = new THREE.Mesh(geometry, material);
            
            // Ürün etiketini ekle
            const label = createLabel(productData.name);
            label.position.y = height/2 + 0.1;
            product.add(label);

            // Ürün verilerini sakla
            product.userData = {
                type: 'product',
                productData
            };

            return product;
        } catch (error) {
            console.error('Ürün oluşturma hatası:', error);
            return null;
        }
    };

    // Etiket oluşturma
    const createLabel = (text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#000000';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width/2, canvas.height/2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5, 0.125, 1);

        return sprite;
    };

    // Scene kurulumu
    useEffect(() => {
        if (!mountRef.current) return;

        // Scene
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(isDark ? 0x1a202c : 0xf0f0f0);

        // Camera
        cameraRef.current = new THREE.PerspectiveCamera(
            45,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        cameraRef.current.position.set(5, 5, 5);

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(rendererRef.current.domElement);

        // Controls
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.minDistance = 3;
        controlsRef.current.maxDistance = 20;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        sceneRef.current.add(directionalLight);

        // Grid
        const gridHelper = new THREE.GridHelper(20, 20);
        sceneRef.current.add(gridHelper);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controlsRef.current.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        // Cleanup
        return () => {
            if (mountRef.current && rendererRef.current.domElement) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current.dispose();
        };
    }, []);

    // Tıklama olayları
    useEffect(() => {
        if (!sceneRef.current || !cameraRef.current) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event) => {
            const canvas = rendererRef.current.domElement;
            const rect = canvas.getBoundingClientRect();
            
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

            if (intersects.length > 0) {
                let object = intersects[0].object;
                while (object && !object.userData?.type) {
                    object = object.parent;
                }

                if (object?.userData?.type === 'cell') {
                    setSelectedCell(object.userData);
                    setIsModalOpen(true);
                }
            }
        };

        const container = mountRef.current;
        container.addEventListener('click', handleClick);
        return () => container.removeEventListener('click', handleClick);
    }, []);

    // Window resize olayı
    useEffect(() => {
        const handleResize = () => {
            if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

            cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ant Design tema konfigürasyonu
    const themeConfig = {
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
        },
        components: {
            Select: {
                colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
            },
            Button: {
                colorBgContainer: isDark ? 'rgba(30, 32, 37, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
            }
        }
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div style={{ position: 'relative' }}>
                <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px',
                    background: isDark ? '#2d3748' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    <Select
                        style={{ width: 120 }}
                        placeholder="Raf Seç"
                        onChange={handleRackSelect}
                        value={selectedRack}
                        className={isDark ? 'dark-select' : ''}
                    >
                        {[...Array(10)].map((_, i) => (
                            <Select.Option key={i + 1} value={i + 1}>
                                Raf {i + 1}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <div 
                    ref={mountRef} 
                    style={{ 
                        width: '100%', 
                        height: '700px',
                        backgroundColor: isDark ? '#1a202c' : '#f0f0f0'
                    }}
                />
                <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px',
                    background: isDark ? '#2d3748' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <Button 
                        type="primary"
                        onClick={() => setIsModalOpen(true)}
                        size="large"
                        icon={<PlusOutlined />}
                    >
                        Ürün İşlemleri
                    </Button>
                </div>
                <WarehouseProductModal
                    visible={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedCell(null);
                    }}
                    cellData={selectedCell}
                />
            </div>
        </ConfigProvider>
    );
};

export default WarehouseView3D;