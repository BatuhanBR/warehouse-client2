import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Card, Table, Button, Modal, ConfigProvider, theme as antTheme } from 'antd';
import { toast } from 'react-hot-toast';
import shelfService from '../services/shelfService';
import { useTheme } from '../contexts/ThemeContext';
import { ReloadOutlined } from '@ant-design/icons';

const { defaultAlgorithm, darkAlgorithm } = antTheme;
const { Option } = Select;

const WarehouseASCIIView = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [loading, setLoading] = useState(false);
    const [selectedRack, setSelectedRack] = useState(null);
    const [rackLocations, setRackLocations] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductModalVisible, setIsProductModalVisible] = useState(false);

    // Tema konfigürasyonu
    const themeConfig = {
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
        },
        components: {
            Card: {
                colorBgContainer: isDark ? 'rgba(30, 32, 37, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',
            },
            Table: {
                colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
            },
            Select: {
                colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)', 
            }
        }
    };

    // Raf seçilince verileri yükle
    const handleRackSelect = async (rackNumber) => {
        try {
            setLoading(true);
            console.log('Seçilen raf:', rackNumber);
            
            const response = await axios.get(`http://localhost:3000/api/locations/rack/${rackNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Raf verileri:', response.data);
            
            if (response.data.success) {
                setRackLocations(response.data.data || []);
                setSelectedRack(rackNumber);
            } else {
                throw new Error('Geçersiz yanıt formatı');
            }
        } catch (error) {
            console.error('Raf bilgileri yüklenirken hata:', error);
            toast.error('Raf bilgileri yüklenemedi');
            setRackLocations([]);
            setSelectedRack(null);
        } finally {
            setLoading(false);
        }
    };

    // Component yüklendiğinde Raf 1 verilerini otomatik yükle
    useEffect(() => {
        if (selectedRack === null) {
            handleRackSelect(1);
        }
    }, []);

    // Ürün kaldırma işlemi
    const handleRemoveProduct = async (locationId) => {
        try {
            setLoading(true);
            console.log('Kaldırılacak ürün locationId:', locationId);
            
            if (!locationId) {
                toast.error('Ürün ID bulunamadı!');
                return;
            }

            const response = await shelfService.removeProduct(locationId);
            console.log('Ürün kaldırma yanıtı:', response);
            
            if (response.success) {
                toast.success('Ürün başarıyla kaldırıldı');
                // Mevcut rafı yeniden yükle
                await handleRackSelect(selectedRack);
                setIsProductModalVisible(false);
                setSelectedProduct(null);
            } else {
                toast.error(response.message || 'Ürün kaldırılırken bir hata oluştu');
            }
        } catch (error) {
            console.error('Ürün kaldırma hatası:', error);
            toast.error('Ürün kaldırılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Hücreye tıklama işlemi
    const handleCellClick = (location) => {
        if (location.isOccupied && location.Product) {
            setSelectedProduct({
                ...location.Product,
                locationId: location.id
            });
            setIsProductModalVisible(true);
        } else {
            toast.info('Bu hücre boş');
        }
    };

    // ASCII raf görünümünü oluştur
    const renderASCIIShelf = () => {
        if (!selectedRack || rackLocations.length === 0) {
            return <div className={`text-center mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Lütfen bir raf seçin</div>;
        }

        const levels = [...new Set(rackLocations.map(loc => loc.level))].sort((a, b) => a - b);
        const positions = [...new Set(rackLocations.map(loc => loc.position))].sort((a, b) => a - b);

        const cellInnerWidth = 5; // Hücre içeriği için genişlik (örn: ' █ 1 ') 
        const cellPadding = 1; // Hücre kenarları ile içerik arası boşluk
        const cellWidth = cellInnerWidth + (cellPadding * 2); // Tam hücre genişliği (örn: |  █ 1  |)
        const interCellSpace = 1; // Hücreler arası boşluk
        const width = positions.length * (cellWidth + interCellSpace) - interCellSpace + 2; // Toplam genişlik (baş ve sondaki | dahil)
        const asciiRows = [];

        // Raf başlığı
        const rackTitle = `RAF ${selectedRack}`;
        const titlePadding = Math.floor((width - rackTitle.length - 2) / 2);
        const titlePaddingRight = width - rackTitle.length - 2 - titlePadding;
        asciiRows.push(`\n┌${'─'.repeat(width - 2)}┐`);
        asciiRows.push(`│${' '.repeat(titlePadding)}${rackTitle}${' '.repeat(titlePaddingRight)}│`);
        asciiRows.push(`├${'─'.repeat(width - 2)}┤`);

        // Seviyeler (Yukarıdan aşağıya)
        levels.reverse().forEach((level, levelIndex) => {
            // Seviye başlığı
            const levelTitle = `Seviye ${level}`;
            const levelTitlePadding = Math.floor((width - levelTitle.length - 2) / 2);
            const levelTitlePaddingRight = width - levelTitle.length - 2 - levelTitlePadding;
            //asciiRows.push(`│${' '.repeat(levelTitlePadding)}${levelTitle}${' '.repeat(levelTitlePaddingRight)}│`);
            //asciiRows.push(`├${'─'.repeat(width - 2)}┤`); // Seviye başlığı altına çizgi isteğe bağlı

            // Hücre satırı
            let cellsRow = '│';
            positions.forEach((position, index) => {
                const location = rackLocations.find(
                    loc => loc.level === level && loc.position === position
                );

                let cellContentDisplay = '';
                if (location) {
                    if (location.isOccupied && location.Product) {
                        // Dolu hücre: Blok + Pozisyon No
                        cellContentDisplay = `█ ${position}`;
                    } else {
                        // Boş hücre: Boşluk + Pozisyon No
                        cellContentDisplay = `  ${position}`; // Boşluk bırakarak hizalama
                    }
                } else {
                    // Tanımsız hücre: ? + Pozisyon No
                    cellContentDisplay = `? ${position}`;
                }

                // Hücre içeriğini sabit genişliğe getir
                const contentPadding = Math.max(0, cellInnerWidth - cellContentDisplay.length);
                const contentLeftPad = Math.floor(contentPadding / 2);
                const contentRightPad = contentPadding - contentLeftPad;
                const finalCellContent = ' '.repeat(contentLeftPad) + cellContentDisplay + ' '.repeat(contentRightPad);

                // Hücreyi satıra ekle (kenar boşlukları ve ayırıcı ile)
                cellsRow += ' '.repeat(cellPadding) + finalCellContent + ' '.repeat(cellPadding);
                if (index < positions.length - 1) {
                    cellsRow += '│'; // Hücre ayırıcı
                } else {
                     cellsRow += '│'; // Satır sonu
                }
            });
            asciiRows.push(cellsRow);

            // Seviyeler arası çizgi (Son seviye hariç)
            if (levelIndex < levels.length - 1) {
                let separatorRow = '├';
                 positions.forEach((_, index) => {
                    separatorRow += '─'.repeat(cellWidth);
                    if (index < positions.length - 1) {
                         separatorRow += '┼'; // İç ayırıcı
                    } else {
                         separatorRow += '┤'; // Satır sonu ayırıcı
                    }
                 });
                asciiRows.push(separatorRow);
            }
        });

        // Raf alt çizgisi
        asciiRows.push(`└${'─'.repeat(width - 2)}┘\n`);

        // Açıklama
        asciiRows.push('Açıklama: █ = Dolu, [Boşluk] = Boş, ? = Tanımsız');

        return (
            <div className="ascii-shelf flex justify-center my-4">
                <pre style={{
                    fontFamily: 'monospace', // Sabit genişlikli font önemli
                    lineHeight: '1.4',      // Satır aralığını biraz artırdım
                    textAlign: 'center',    // Ortalamak için 'center' yapıldı
                    display: 'inline-block',
                    cursor: 'default'
                }} className={`p-4 rounded shadow-md overflow-auto ${isDark ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                    {asciiRows.join('\n')}
                </pre>
            </div>
        );
    };

    // Raf içeriğini tablo olarak göster
    const renderLocationsTable = () => {
        if (!selectedRack || rackLocations.length === 0) {
            return null;
        }

        // Varsayılan olarak seviye ve pozisyona göre sıralanmış veriyi hazırla
        const sortedLocations = [...rackLocations].sort((a, b) => {
            // Önce seviyeye göre artan şekilde sırala (1,2,3,4)
            if (a.level !== b.level) {
                return a.level - b.level;
            }
            // Seviyeler aynıysa, pozisyona göre artan şekilde sırala (1,2,3,4)
            return a.position - b.position;
        });

        const columns = [
            {
                title: 'Kod',
                dataIndex: 'code',
                key: 'code',
                render: (text) => <span className="font-semibold">{text}</span>,
                sorter: (a, b) => a.code.localeCompare(b.code),
            },
            {
                title: 'Seviye',
                dataIndex: 'level',
                key: 'level',
                align: 'center',
                render: (level) => (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                        {level}
                    </span>
                ),
                sorter: (a, b) => a.level - b.level,
                defaultSortOrder: 'ascend',
            },
            {
                title: 'Pozisyon',
                dataIndex: 'position',
                key: 'position',
                align: 'center',
                render: (position) => (
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
                        {position}
                    </span>
                ),
                sorter: (a, b) => a.position - b.position,
            },
            {
                title: 'Durum',
                key: 'status',
                align: 'center',
                render: (_, record) => (
                    <span className={`px-3 py-1 rounded-full font-medium ${
                        record.isOccupied 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                        {record.isOccupied ? 'Dolu' : 'Boş'}
                    </span>
                ),
                sorter: (a, b) => {
                    // Dolu hücreler önce
                    return (b.isOccupied ? 1 : 0) - (a.isOccupied ? 1 : 0);
                },
                filters: [
                    { text: 'Dolu', value: true },
                    { text: 'Boş', value: false },
                ],
                onFilter: (value, record) => record.isOccupied === value,
            },
            {
                title: 'Ürün',
                key: 'product',
                render: (_, record) => (
                    <span>
                        {record.isOccupied && record.Product ? (
                            <Button 
                                type="link" 
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                                onClick={() => handleCellClick(record)}
                                icon={<span className="mr-1">📦</span>}
                            >
                                {record.Product.name}
                            </Button>
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                    </span>
                ),
                sorter: (a, b) => {
                    // Ürün yoksa en sona
                    if (!a.Product && !b.Product) return 0;
                    if (!a.Product) return 1;
                    if (!b.Product) return -1;
                    return a.Product.name.localeCompare(b.Product.name);
                },
            },
            {
                title: 'Kapasite',
                key: 'capacity',
                align: 'center',
                render: (_, record) => {
                    // Ürünün kapladığı kapasiteyi hesapla
                    let usedCapacity = 0;
                    if (record.isOccupied && record.Product) {
                        const sizeCategory = record.Product.sizeCategory;
                        if (sizeCategory === 'Büyük') usedCapacity = 4;
                        else if (sizeCategory === 'Normal') usedCapacity = 2;
                        else usedCapacity = 1;
                    }
                    
                    const totalCapacity = 4;
                    const availableCapacity = totalCapacity - usedCapacity;
                    const usagePercentage = (usedCapacity / totalCapacity) * 100;
                    
                    // Kalan kapasite rengi
                    let capacityColor = 'bg-green-500';
                    if (usagePercentage >= 75) capacityColor = 'bg-red-500';
                    else if (usagePercentage >= 50) capacityColor = 'bg-orange-500';
                    else if (usagePercentage > 0) capacityColor = 'bg-blue-500';
                    
                    return (
                        <div className="flex items-center justify-center">
                            <span className="mr-2 text-gray-700 font-medium">
                                {availableCapacity}/{totalCapacity}
                            </span>
                            <div className="w-16 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${capacityColor}`} 
                                    style={{ width: `${usagePercentage}%` }} 
                                />
                            </div>
                        </div>
                    );
                },
                sorter: (a, b) => {
                    // Kullanılabilir kapasiteye göre sırala
                    const getAvailableCapacity = (record) => {
                        let usedCapacity = 0;
                        if (record.isOccupied && record.Product) {
                            const sizeCategory = record.Product.sizeCategory;
                            if (sizeCategory === 'Büyük') usedCapacity = 4;
                            else if (sizeCategory === 'Normal') usedCapacity = 2;
                            else usedCapacity = 1;
                        }
                        return 4 - usedCapacity;
                    };
                    
                    return getAvailableCapacity(a) - getAvailableCapacity(b);
                },
            },
        ];

        return (
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Detaylı Raf İçeriği</h2>
                <Table 
                    dataSource={sortedLocations.map(loc => ({ ...loc, key: loc.id }))} 
                    columns={columns} 
                    size="middle"
                    loading={loading}
                    pagination={false}
                    className="shadow-md rounded-md overflow-hidden"
                    onRow={(record) => ({
                        onClick: () => handleCellClick(record),
                        style: { cursor: 'pointer' }
                    })}
                    // Sabit sıralamada
                    sortDirections={['ascend', 'descend']}
                    showSorterTooltip={{ title: 'Sıralamak için tıklayın' }}
                />
            </div>
        );
    };
    
    // Ürün detay modalı
    const renderProductModal = () => {
        if (!selectedProduct) return null;
        
        // Size kategorisine göre renk belirle
        let sizeBadgeColor = 'bg-blue-100 text-blue-800';
        if (selectedProduct.sizeCategory === 'Büyük') {
            sizeBadgeColor = 'bg-red-100 text-red-800';
        } else if (selectedProduct.sizeCategory === 'Normal') {
            sizeBadgeColor = 'bg-orange-100 text-orange-800';
        }
        
        return (
            <Modal
                title={
                    <div className="flex items-center text-xl">
                        <span className="mr-2">📦</span>
                        <span>Ürün Detayları</span>
                    </div>
                }
                open={isProductModalVisible}
                onCancel={() => setIsProductModalVisible(false)}
                width={600}
                footer={[
                    <Button 
                        key="close" 
                        size="large"
                        onClick={() => setIsProductModalVisible(false)}
                    >
                        Kapat
                    </Button>,
                    <Button 
                        key="remove" 
                        type="primary" 
                        danger
                        size="large"
                        loading={loading}
                        onClick={() => handleRemoveProduct(selectedProduct.locationId)}
                        icon={<span className="mr-1">🗑️</span>}
                    >
                        Ürünü Kaldır
                    </Button>,
                ]}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Ürün Bilgileri</h3>
                        <div className="space-y-2">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Ürün Adı:</span>
                                <span className="font-medium">{selectedProduct.name}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">SKU:</span>
                                <span className="font-medium bg-gray-100 px-2 py-1 rounded">{selectedProduct.sku}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Boyut:</span>
                                <span className={`font-medium ${sizeBadgeColor} px-2 py-1 rounded`}>
                                    {selectedProduct.sizeCategory}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Ağırlık:</span>
                                <span className="font-medium">{selectedProduct.weight} kg</span>
                            </p>
                            {selectedProduct.price && (
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Fiyat:</span>
                                    <span className="font-medium text-green-600">{selectedProduct.price} TL</span>
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">Boyut ve Stok</h3>
                        <div className="space-y-2">
                            <p className="flex justify-between">
                                <span className="text-gray-600">Boyutlar:</span>
                                <span className="font-medium">
                                    {selectedProduct.width}×{selectedProduct.height}×{selectedProduct.length} cm
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Stok:</span>
                                <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {selectedProduct.quantity} adet
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Lokasyon ID:</span>
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                    {selectedProduct.locationId}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-600">Ürün ID:</span>
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                    {selectedProduct.id}
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-bold mb-3 text-blue-800 border-b border-blue-200 pb-2">
                            Raf Konumu
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600">
                                    <span className="font-medium">Raf:</span> {selectedRack}
                                </p>
                                <p className="text-blue-600">
                                    <span className="font-medium">Konum:</span> {rackLocations.find(loc => loc.id === selectedProduct.locationId)?.code || 'Bilinmiyor'}
                                </p>
                            </div>
                            <div className="text-5xl">📍</div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`warehouse-ascii-view ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Raf Seçimi:</label>
                        <Select
                            placeholder="Raf Seçin"
                            style={{ width: 200 }}
                            onChange={handleRackSelect}
                            loading={loading}
                            className={isDark ? 'dark-select' : ''}
                        >
                            {[...Array(10)].map((_, index) => (
                                <Select.Option key={index + 1} value={index + 1}>
                                    Raf {index + 1}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    {selectedRack && (
                        <div>
                            <Button 
                                type="primary"
                                onClick={() => window.print()}
                                className={`${isDark ? 'bg-blue-600 border-blue-700' : 'bg-blue-500 border-blue-600'}`}
                            >
                                Yazdır
                            </Button>
                        </div>
                    )}
                </div>

                {renderASCIIShelf()}

                {selectedRack && rackLocations.length > 0 && (
                    <Card 
                        title={`Raf ${selectedRack} İçeriği`} 
                        className={`mt-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                    >
                        {renderLocationsTable()}
                    </Card>
                )}

                {renderProductModal()}
            </div>
        </ConfigProvider>
    );
};

export default WarehouseASCIIView; 