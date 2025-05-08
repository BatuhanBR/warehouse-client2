import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import WarehouseManagementModal from './WarehouseManagementModal';
import { Button, Select, ConfigProvider, theme as antTheme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

const WarehouseView3D = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useLanguage();
    
    const mountRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isMgmtModalOpen, setIsMgmtModalOpen] = useState(false);
    const [selectedRack, setSelectedRack] = useState(null);
    const [rackLocations, setRackLocations] = useState([]);

    // Scene ve camera referanslarını component scope'unda tut
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const frameIdRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
    const mouseRef = useRef(new THREE.Vector2());

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
            toast.error(t('rackLoadError'));
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
                
                // Hücreyi konumlandır (Y koordinatı ters çevrildi)
                cell.position.set(
                    -SHELF_DIMENSIONS.width/2 + (position-1) * (SHELF_DIMENSIONS.width/4) + SHELF_DIMENSIONS.width/8, // X (Sol-Sağ) - Değişmedi
                    // (level - 1) * SHELF_DIMENSIONS.height + SHELF_DIMENSIONS.height/2, // Eski Y (Aşağıdan Yukarıya)
                    (4 - level) * SHELF_DIMENSIONS.height + SHELF_DIMENSIONS.height/2, // Yeni Y (Yukarıdan Aşağıya)
                    0 // Z (Derinlik) - Değişmedi
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

    // Hücre oluşturma (Palet tipine göre görselleştirme ile)
    const createCell = (rackNumber, level, position, locationData) => {
        console.log(`[createCell] R${rackNumber}-${level}-${position} locationData:`, locationData);

        const cell = new THREE.Group();
        const cellWidth = SHELF_DIMENSIONS.width / 4 - SHELF_DIMENSIONS.spacing;
        const cellHeight = SHELF_DIMENSIONS.height - SHELF_DIMENSIONS.spacing;
        const cellDepth = SHELF_DIMENSIONS.depth - SHELF_DIMENSIONS.spacing;
        const cellGeometry = new THREE.BoxGeometry(cellWidth, cellHeight, cellDepth);

        // Hücre kapasite ve durumunu al (API'den gelen hesaplanmış değerler)
        const usedCapacity = locationData?.usedCapacity ?? 0;
        const totalCapacity = locationData?.totalCapacity ?? 2;
        let frameMaterial = MATERIALS.emptyCell; // Varsayılan boş
        
        if (usedCapacity === 1) { // Yarım dolu
            frameMaterial = MATERIALS.occupiedCell; // Şimdilik normal dolu rengi, istenirse farklılaştırılabilir
            // Örneğin: frameMaterial = new THREE.LineBasicMaterial({ color: 0xffa500, ... }); // Turuncu
        } else if (usedCapacity >= 2) { // Tam dolu
            frameMaterial = new THREE.LineBasicMaterial({ color: 0xdc3545, transparent: true, opacity: 0.8 }); // Kırmızı
        }

        // Hücre çerçevesi (yeni materyal ile)
        const edges = new THREE.EdgesGeometry(cellGeometry);
        const frame = new THREE.LineSegments(edges, frameMaterial);
        cell.add(frame);

        // Ürün kutularını ekle (varsa)
        if (locationData?.pallets && locationData.pallets.length > 0) {
            const innerCellWidth = cellWidth - SHELF_DIMENSIONS.spacing * 2; // İç genişlik

            locationData.pallets.forEach((palletInfo, index) => {
                if (palletInfo?.product) {
                    const productMesh = createProduct(palletInfo.product); // createProduct artık palletType'ı içeriden alıyor
                    
                    if (productMesh) {
                        const productPalletType = palletInfo.product.palletType?.trim().toLowerCase() || 'full';
                        
                        // Konumlandırma
                        if (productPalletType === 'half') {
                            // İlk yarım sola (-x), ikinci yarım sağa (+x)
                            productMesh.position.x = (index === 0) ? -innerCellWidth / 4 : innerCellWidth / 4;
                        } else {
                            // Tam palet ortada
                            productMesh.position.x = 0;
                        }
                        // Y ve Z merkezde kalabilir
                        cell.add(productMesh);
                    }
                }
            });
        }

        // userData'yı güncelle (tüm locationData ile)
        console.log(`[createCell] Storing userData for R${rackNumber}-${level}-${position}`); 
        cell.userData = {
            type: 'cell',
            rackNumber,
            level,
            position,
            locationData // Tüm locationData (hesaplanmış kapasite ve pallets dahil)
        };

        return cell;
    };

    // Ürün oluşturma (Palet tipine göre boyut ve Kategoriye göre renk ile)
    const createProduct = (productData) => {
        if (!productData) return null;

        const palletType = productData.palletType?.trim().toLowerCase() || 'full';
        const categoryName = productData.Category?.name || t('unknownCategory');
        console.log(`[createProduct] Creating product mesh for ID: ${productData.id}, PalletType: ${palletType}, Category: ${categoryName}`);

        try {
            const cellInnerWidth = SHELF_DIMENSIONS.width / 4 - SHELF_DIMENSIONS.spacing * 2;
            const cellInnerHeight = SHELF_DIMENSIONS.height - SHELF_DIMENSIONS.spacing * 2;
            const cellInnerDepth = SHELF_DIMENSIONS.depth - SHELF_DIMENSIONS.spacing * 2;

            const productWidth = palletType === 'half' ? cellInnerWidth / 2 : cellInnerWidth;
            const productHeight = cellInnerHeight;
            const productDepth = cellInnerDepth;

            const productGeometry = new THREE.BoxGeometry(productWidth, productHeight, productDepth);

            // Kategoriye göre renk belirle
            let productBaseColor = 0xffa500; // Varsayılan Turuncu
            switch (categoryName) {
                case 'Elektronik': productBaseColor = 0x87ceeb; break; // Açık Mavi
                case 'Gıda': productBaseColor = 0x90ee90; break; // Açık Yeşil
                case 'Kozmetik': productBaseColor = 0xffb6c1; break; // Açık Pembe
                case 'Kitap': productBaseColor = 0xffdab9; break; // Şeftali
                case 'Giyim': productBaseColor = 0xe6e6fa; break; // Lavanta
                case 'Spor': productBaseColor = 0xffa07a; break; // Açık Somon
                case 'Ev & Yaşam': productBaseColor = 0xf5f5dc; break; // Bej
                case 'Oyuncak': productBaseColor = 0xffff00; break; // Sarı
                case 'Ofis': productBaseColor = 0xd3d3d3; break; // Açık Gri
                case 'Bahçe': productBaseColor = 0x228b22; break; // Orman Yeşili
                default: productBaseColor = 0xa9a9a9; // Varsayılan Koyu Gri
            }

            // Ürün materyali (Kategori rengi ile)
            const productMaterial = new THREE.MeshLambertMaterial({
                color: productBaseColor,
                opacity: 0.85,
                transparent: true
            });

            const productMesh = new THREE.Mesh(productGeometry, productMaterial);
            
            productMesh.userData = {
                type: 'product',
                ...productData // Kategori bilgisi dahil
            };

            console.log(`[createProduct] Mesh created for ID: ${productData.id}, Color: #${productBaseColor.toString(16)}`);

            // Ürün etiketini oluştur
            const label = createLabel(productData.name);
            label.position.y = productHeight / 2 + 0.1; // Kutunun biraz üstüne
            productMesh.add(label);

            return productMesh;

        } catch (error) {
            console.error("[createProduct] Error creating product mesh:", error, "ProductData:", productData);
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
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const aspectRatio = width / height;
        cameraRef.current = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        cameraRef.current.position.set(5, 5, 10);

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        rendererRef.current.shadowMap.enabled = true;
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
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        sceneRef.current.add(directionalLight);

        // Grid
        const gridHelper = new THREE.GridHelper(20, 20);
        sceneRef.current.add(gridHelper);

        // Event listeners
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            
            if (controlsRef.current) {
                controlsRef.current.update();
            }
            
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        
        animate();

        // Fetch data and render racks
        handleRackSelect(1);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && rendererRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
            
            // Dispose resources
            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
            }
            
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, [isDark]);

    // Window resize olayı
    const handleResize = () => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
    };

    // Ant Design tema konfigürasyonu
    const themeConfig = {
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
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
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div style={{ 
                    position: 'absolute', 
                    zIndex: 10, 
                    top: '20px', 
                    left: '20px',
                    background: isDark ? '#2d3748' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    <Select
                        style={{ width: 150 }}
                        placeholder={t('selectRack')}
                        onChange={handleRackSelect}
                        value={selectedRack}
                        className={isDark ? 'dark-select' : ''}
                    >
                        {[...Array(10)].map((_, i) => (
                            <Select.Option key={i+1} value={i+1}>Raf {i+1}</Select.Option>
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
                    zIndex: 10, 
                    top: '20px', 
                    right: '20px',
                    background: isDark ? '#2d3748' : 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setIsMgmtModalOpen(true)}
                    >
                        {t('manageWarehouse')}
                    </Button>
                </div>
                <WarehouseManagementModal
                    visible={isMgmtModalOpen}
                    onCancel={() => setIsMgmtModalOpen(false)}
                    selectedRack={selectedRack}
                    onRackUpdate={handleRackSelect}
                    rackLocations={rackLocations}
                />
            </div>
        </ConfigProvider>
    );
};

export default WarehouseView3D;