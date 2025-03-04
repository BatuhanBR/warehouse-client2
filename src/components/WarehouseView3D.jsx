import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import WarehouseProductModal from './WarehouseProductModal';
import { Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';

const WarehouseView3D = () => {
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

    // Grid ayarlarını güncelle
    const GRID_SIZE = 30;        // Grid boyutu
    const GRID_DIVISIONS = 30;   // Grid bölünmeleri

    // Raf boyutlarını güncelle
    const SHELF_DIMENSIONS = {
        width: 4,        // 4 bölmelik genişlik
        height: 0.8,     // Her katın yüksekliği
        depth: 1,        // Raf derinliği
        thickness: 0.05, // Metal çerçeve kalınlığı
        spacing: 0.02    // Bölmeler arası boşluk
    };

    // Raf konumlarını tanımla (mavi çizgilerin olduğu yerler)
    const SHELF_POSITIONS = [
        // Üst sıra rafları (3 adet)
        { x: -8, z: -8 },
        { x: 0, z: -8 },
        { x: 8, z: -8 },
        
        // Orta sıra rafları (4 adet)
        { x: -12, z: 0 },
        { x: -4, z: 0 },
        { x: 4, z: 0 },
        { x: 12, z: 0 },
        
        // Alt sıra rafları (3 adet)
        { x: -8, z: 8 },
        { x: 0, z: 8 },
        { x: 8, z: 8 }
    ];

    // Raf aralıklarını güncelle - mavi noktalara göre
    const GRID_SPACING = {
        x: 3,  // Her raf arası 3 birim
        y: 1,  // Katlar arası mesafe
        z: 3   // Sıralar arası mesafe
    };

    // Materyal ve geometrileri önbellekleme
    const CACHED_MATERIALS = {
        metal: new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.7,
            roughness: 0.3
        }),
        label: new THREE.SpriteMaterial(),
        product: new THREE.MeshStandardMaterial({
            color: 0x2196f3,
            transparent: true,
            opacity: 0.8
        }),
        emptyCell: new THREE.LineBasicMaterial({
            color: 0x90caf9,
            transparent: true,
            opacity: 0.3
        }),
        occupiedCell: new THREE.LineBasicMaterial({
            color: 0x2196f3,
            transparent: true,
            opacity: 0.3
        })
    };

    const CACHED_GEOMETRIES = {
        platform: new THREE.BoxGeometry(
            SHELF_DIMENSIONS.width + SHELF_DIMENSIONS.thickness,
            SHELF_DIMENSIONS.thickness,
            SHELF_DIMENSIONS.depth
        ),
        divider: new THREE.BoxGeometry(
            SHELF_DIMENSIONS.thickness,
            SHELF_DIMENSIONS.height,
            SHELF_DIMENSIONS.depth
        ),
        pillar: new THREE.BoxGeometry(
            SHELF_DIMENSIONS.thickness,
            SHELF_DIMENSIONS.height * 4,
            SHELF_DIMENSIONS.thickness
        )
    };

    // API çağrısını güncelliyoruz
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/locations', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                // Gelen veriyi detaylı logla
                console.log('Ham API yanıtı:', response);
                console.log('Lokasyon verileri:', response.data);
                
                // Veri yapısını kontrol et ve düzenle
                const locationData = Array.isArray(response.data) ? response.data : response.data.data;
                console.log('İşlenmiş lokasyon verileri:', locationData);
                
                setLocations(locationData);
                setLoading(false);
            } catch (error) {
                console.error('Lokasyonlar yüklenirken hata:', error);
                setLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // Raf seçme fonksiyonu
    const handleRackSelect = async (rackNumber) => {
        try {
            console.log('Selecting rack:', rackNumber); // Debug log
            
            const response = await axios.get(`http://localhost:3000/api/locations/rack/${rackNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Rack data:', response.data); // Debug log
            
            if (response.data.success) {
                setRackLocations(response.data.data || []);
                setSelectedRack(rackNumber);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Raf bilgileri yüklenirken hata:', error);
            toast.error('Raf bilgileri yüklenemedi');
            // Hata durumunda state'leri sıfırla
            setRackLocations([]);
            setSelectedRack(null);
        }
    };

    // Pozisyonlama mantığını güncelle
    const calculatePosition = (rackNumber, level, position) => {
        // Mavi noktalara göre pozisyonları hesapla
        const positions = [
            // İlk sıra (en üstteki 10 nokta)
            {x: -12, z: -12}, {x: -9, z: -12}, {x: -6, z: -12}, {x: -3, z: -12},
            {x: 0, z: -12}, {x: 3, z: -12}, {x: 6, z: -12}, {x: 9, z: -12},
            {x: 12, z: -12}, {x: 15, z: -12},
            
            // İkinci sıra
            {x: -12, z: -6}, {x: -9, z: -6}, {x: -6, z: -6}, {x: -3, z: -6},
            {x: 0, z: -6}, {x: 3, z: -6}, {x: 6, z: -6}, {x: 9, z: -6},
            {x: 12, z: -6}, {x: 15, z: -6},
            
            // Üçüncü sıra
            {x: -12, z: 0}, {x: -9, z: 0}, {x: -6, z: 0}, {x: -3, z: 0},
            {x: 0, z: 0}, {x: 3, z: 0}, {x: 6, z: 0}, {x: 9, z: 0},
            {x: 12, z: 0}, {x: 15, z: 0},
            
            // Dördüncü sıra (en alttaki 10 nokta)
            {x: -12, z: 6}, {x: -9, z: 6}, {x: -6, z: 6}, {x: -3, z: 6},
            {x: 0, z: 6}, {x: 3, z: 6}, {x: 6, z: 6}, {x: 9, z: 6},
            {x: 12, z: 6}, {x: 15, z: 6}
        ];

        // rackNumber'a göre pozisyon seç (0-39 arası)
        const pos = positions[rackNumber - 1] || positions[0];

        return {
            x: pos.x,
            y: (level - 1) * GRID_SPACING.y,  // Katlar için y pozisyonu
            z: pos.z
        };
    };

    // Raf oluşturma fonksiyonunu güncelle
    const createShelf = (location) => {
        if (!location) return null;

        try {
            const { rackNumber } = location;
            const shelfGroup = new THREE.Group();

            // Raf ünitesini oluştur ve rackNumber'ı geçir
            const shelfUnit = createShelfUnit(rackNumber, locations);
            
            // Rafı doğru konuma yerleştir
            const shelfPosition = SHELF_POSITIONS[rackNumber - 1];
            if (shelfPosition) {
                shelfGroup.position.set(shelfPosition.x, 0, shelfPosition.z);
            }

            shelfGroup.add(shelfUnit);

            // Ana raf etiketi (opsiyonel)
            const mainLabel = createLabel(`Raf ${rackNumber}`);
            mainLabel.position.set(0, SHELF_DIMENSIONS.height * 4 + 0.3, 0);
            mainLabel.scale.set(2, 0.5, 1);
            shelfGroup.add(mainLabel);

            return shelfGroup;
        } catch (error) {
            console.error('Raf oluşturma hatası:', error, location);
            return null;
        }
    };

    // Raf ünitesini oluşturma fonksiyonu
    const createShelfUnit = (rackNumber, locations) => {
        const unit = new THREE.Group();

        // Her kat için (0-3 arası, 4 kat)
        for (let level = 0; level < 4; level++) {
            // Kat platformu - cached geometri kullan
            const platform = new THREE.Mesh(CACHED_GEOMETRIES.platform, CACHED_MATERIALS.metal);
            platform.position.y = level * SHELF_DIMENSIONS.height;
            unit.add(platform);

            // Her kattaki bölme için etiketler ve bölmeler
            for (let position = 1; position <= 4; position++) {
                // Bu hücreye ait location verisini bul
                const locationData = locations.find(loc => 
                    loc.rackNumber === rackNumber && 
                    loc.level === level && 
                    loc.position === position
                );

                // Hücreyi oluştur
                const cell = createCell(
                    rackNumber,
                    level,
                    position,
                    locationData?.isOccupied || false,
                    locationData?.productData
                );

                // Hücreyi konumlandır
                cell.position.set(
                    -SHELF_DIMENSIONS.width/2 + (position-1) * (SHELF_DIMENSIONS.width/4) + SHELF_DIMENSIONS.width/8,
                    level * SHELF_DIMENSIONS.height + SHELF_DIMENSIONS.height/2,
                    0
                );

                unit.add(cell);
            }

            // Arka panel
            const backPanel = new THREE.Mesh(CACHED_GEOMETRIES.divider, CACHED_MATERIALS.metal);
            backPanel.scale.set(
                SHELF_DIMENSIONS.width/SHELF_DIMENSIONS.thickness,
                1,
                1
            );
            backPanel.position.set(
                0,
                level * SHELF_DIMENSIONS.height + SHELF_DIMENSIONS.height/2,
                -SHELF_DIMENSIONS.depth/2
            );
            unit.add(backPanel);
        }

        // Dikey destekler (köşeler) - cached geometri kullan
        const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        corners.forEach(([x, z]) => {
            const pillar = new THREE.Mesh(CACHED_GEOMETRIES.pillar, CACHED_MATERIALS.metal);
            pillar.position.set(
                x * (SHELF_DIMENSIONS.width/2),
                (SHELF_DIMENSIONS.height * 4)/2,
                z * (SHELF_DIMENSIONS.depth/2)
            );
            unit.add(pillar);
        });

        return unit;
    };

    // Etiket oluşturma fonksiyonunu optimize et
    const createLabel = (() => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        return (text, size = 32) => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#000000';
            context.font = `${size}px Arial`;
            context.textAlign = 'center';
            context.fillText(text, canvas.width/2, canvas.height/2 + 12);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            
            return sprite;
        };
    })();

    // Hücre oluşturma fonksiyonu
    const createCell = (rackNumber, level, position, isOccupied = false, productData = null) => {
        const cell = new THREE.Group();

        // Hücre çerçevesi
        const cellGeometry = new THREE.BoxGeometry(
            SHELF_DIMENSIONS.width/4 - SHELF_DIMENSIONS.spacing,
            SHELF_DIMENSIONS.height - SHELF_DIMENSIONS.spacing,
            SHELF_DIMENSIONS.depth - SHELF_DIMENSIONS.spacing
        );

        const edges = new THREE.EdgesGeometry(cellGeometry);
        const frame = new THREE.LineSegments(
            edges,
            isOccupied ? CACHED_MATERIALS.occupiedCell : CACHED_MATERIALS.emptyCell
        );
        cell.add(frame);

        // Eğer ürün varsa, ürün kutusunu ekle
        if (isOccupied && productData) {
            const productBox = createProductBox(productData);
            cell.add(productBox);
        }

        // Hücre bilgilerini sakla
        cell.userData = {
            cellCode: `R${rackNumber.toString().padStart(2, '0')}-${level}-${position}`,
            isOccupied,
            productId: productData?.id || null
        };

        return cell;
    };

    // Ürün kutusu oluşturma fonksiyonu
    const createProductBox = (productData) => {
        const { dimensions } = productData;
        const { width, height, depth } = JSON.parse(dimensions);

        const boxGeometry = new THREE.BoxGeometry(
            Math.min(width/100, SHELF_DIMENSIONS.width/4 - SHELF_DIMENSIONS.spacing),
            Math.min(height/100, SHELF_DIMENSIONS.height - SHELF_DIMENSIONS.spacing),
            Math.min(depth/100, SHELF_DIMENSIONS.depth - SHELF_DIMENSIONS.spacing)
        );

        const box = new THREE.Mesh(boxGeometry, CACHED_MATERIALS.product);
        box.userData.productData = productData;
        
        return box;
    };

    useEffect(() => {
        if (loading || !selectedRack) return;

        const container = mountRef.current;
        if (!container) return;

        // Scene setup
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        cameraRef.current = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        cameraRef.current.position.set(30, 20, 30);
        cameraRef.current.lookAt(0, 0, 0);

        // Renderer
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(rendererRef.current.domElement);

        // Controls
        const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 20;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2;
        controls.target.set(0, 0, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        sceneRef.current.add(directionalLight);

        // Rafları oluştur
        if (Array.isArray(rackLocations) && rackLocations.length > 0) {
            const shelf = createShelf({
                rackNumber: selectedRack,
                locations: rackLocations
            });
            if (shelf) {
                sceneRef.current.add(shelf);
            }
        }

        // Grid helper
        const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, 0x888888, 0x888888);
        sceneRef.current.add(gridHelper);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        // Cleanup
        return () => {
            if (container && rendererRef.current.domElement) {
                container.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current.dispose();
        };
    }, [loading, selectedRack, rackLocations]);

    // Tıklama olaylarını güncelle
    useEffect(() => {
        if (!cameraRef.current || !sceneRef.current) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event) => {
            // Sadece canvas'a tıklandığında işlem yap
            if (event.target.tagName.toLowerCase() !== 'canvas') return;

            const rect = event.target.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

            if (intersects.length > 0) {
                let object = intersects[0].object;
                
                // Hücreyi bul (parent zincirinde yukarı doğru ara)
                while (object && !object.userData?.cellCode) {
                    object = object.parent;
                }

                if (object?.userData?.cellCode) {
                    handleCellClick(object.userData);
                }
            }
        };

        const container = mountRef.current;
        container.addEventListener('click', handleClick);

        return () => container.removeEventListener('click', handleClick);
    }, []);

    // Hücre tıklama işleyicisi
    const handleCellClick = (cellData) => {
        setSelectedCell(cellData);
        setIsModalOpen(true);
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '20px',
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000
            }}>
                <Select
                    style={{ width: 120 }}
                    placeholder="Raf Seç"
                    onChange={handleRackSelect}
                    value={selectedRack}
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
                    backgroundColor: '#f0f0f0'
                }}
            />
            <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px',
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Button 
                    type="primary"
                    onClick={() => setIsModalOpen(true)}
                    size="large"
                    icon={<PlusOutlined />}
                    style={{ 
                        width: '150px',
                        height: '40px'
                    }}
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
    );
};

export default WarehouseView3D;