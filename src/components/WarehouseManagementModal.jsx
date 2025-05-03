import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, List, Spin, Typography, Tag, Space, Descriptions, Divider } from 'antd';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import WarehouseProductModal from './WarehouseProductModal';
import {
    AppstoreOutlined,
    KeyOutlined,
    BarcodeOutlined,
    InfoCircleOutlined,
    BoxPlotOutlined,
    FieldNumberOutlined,
    GoldOutlined,
    CalendarOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const WarehouseManagementModal = ({ visible, onCancel }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [selectedRack, setSelectedRack] = useState(null);
    const [cells, setCells] = useState([]);
    const [loadingCells, setLoadingCells] = useState(false);
    const [error, setError] = useState(null);

    // Ürün Modalı için State'ler
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentCellData, setCurrentCellData] = useState(null);

    // Bilgi Modalı için State'ler
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [infoModalData, setInfoModalData] = useState(null);

    // Raf seçildiğinde hücreleri getir
    useEffect(() => {
        if (visible && selectedRack !== null) {
            fetchCells(selectedRack);
        }
        // Modal kapandığında veya raf seçimi kalktığında hücreleri temizle
        if (!visible || selectedRack === null) {
            setCells([]);
            setError(null);
        }
    }, [visible, selectedRack]);

    const fetchCells = async (rackNumber) => {
        setLoadingCells(true);
        setError(null);
        try {
            console.log(`Fetching cells for management modal, rack: ${rackNumber}`);
            // API endpoint'ini doğru olanla değiştir:
            // /racks/:rackNumber/cells -> /rack/:rackNumber
            const response = await axios.get(`http://localhost:3000/api/locations/rack/${rackNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Cells/Locations response for mgmt modal:', response.data);
            if (response.data.success) {
                setCells(response.data.data || []); 
            } else {
                throw new Error(response.data.message || 'Hücre verisi alınamadı');
            }
        } catch (err) {
            console.error('Hücreler yüklenirken hata (Yönetim Modalı):', err);
            setError('Hücreler yüklenirken bir hata oluştu.');
            toast.error('Hücreler yüklenirken bir hata oluştu: ' + (err?.response?.data?.message || err.message));
            setCells([]);
        } finally {
            setLoadingCells(false);
        }
    };

    // Buton Handlers
    const handleAddClick = (cell) => {
        console.log("Add clicked for cell:", cell);
        setCurrentCellData(cell); // Tıklanan hücre verisini state'e ata
        setIsProductModalOpen(true); // Ürün modalını aç
    };

    const handleRemoveClick = (cell) => {
        console.log("Remove clicked for cell:", cell);
        // Ürün modalı, dolu hücre verisiyle açıldığında çıkarma işlemini göstermeli
        setCurrentCellData(cell);
        setIsProductModalOpen(true);
    };

    // Yeni Ürün Bilgisi Gösterme Handler'ı
    const handleInfoClick = (cell) => {
        console.log("Info clicked for cell:", cell);
        setInfoModalData(cell); // Tüm hücre verisini state'e ata
        setIsInfoModalVisible(true); // Bilgi modalını görünür yap
    };

    // Ürün modalı başarıyla kapandıktan sonra hücre listesini yenile
    const handleProductModalSuccess = () => {
        setIsProductModalOpen(false); // Ürün modalını kapat
        if (selectedRack) {
            fetchCells(selectedRack); // Hücre listesini yenile
        }
    };

    const renderCellItem = (cell) => {
        const capacityText = `(${cell.usedCapacity ?? '-'}/${cell.totalCapacity ?? '-'})`;
        let statusText = 'Boş';
        let statusColor = 'green';

        if (cell.usedCapacity > 0) {
            if (cell.usedCapacity >= cell.totalCapacity) {
                statusText = 'Dolu';
                statusColor = 'red';
            } else {
                statusText = 'Yarı Dolu';
                statusColor = 'blue';
            }
        }

        const productInfo = cell.pallets && cell.pallets.length > 0 
            ? cell.pallets.map(p => 
                  `${p.product?.name || 'Bilinmeyen Ürün'} (${p.product?.palletType === 'half' ? 'Yarım' : 'Tam'} Palet)`
              ).join(', ')
            : '-';

        return (
            <List.Item
                key={cell.id}
                actions={[
                    // onClick olaylarını ekle
                    <Button 
                        size="small" 
                        disabled={cell.availableCapacity === 0} 
                        onClick={() => handleAddClick(cell)}
                    >
                        Ekle
                    </Button>,
                    <Button 
                        size="small" 
                        danger 
                        disabled={cell.usedCapacity === 0} 
                        onClick={() => handleRemoveClick(cell)}
                    >
                        Çıkar
                    </Button>,
                    <Button 
                        size="small" 
                        type="default" // Buton tipi
                        disabled={!(cell.pallets && cell.pallets.length > 0)} // Ürün yoksa pasif
                        onClick={() => handleInfoClick(cell)} // Yeni handler
                    >
                        Ürün Bilgisi
                    </Button>
                ]}
            >
                <List.Item.Meta
                    title={<Text strong>{cell.code}</Text>}
                    description={
                        <Space direction="vertical" size="small">
                            <Tag color={statusColor}>{statusText} {capacityText}</Tag>
                            <Text type="secondary">Ürünler: {productInfo}</Text>
                        </Space>
                    }
                />
            </List.Item>
        );
    };

    return (
        <Modal
            title="Depo Hücre Yönetimi"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Kapat
                </Button>,
            ]}
            width={1000}
            style={{ top: 20 }}
            bodyStyle={{ 
                backgroundColor: isDark ? '#1f2937' : '#fff',
                padding: '20px',
                minHeight: '60vh'
            }}
            className={isDark ? 'dark-modal' : ''}
            maskStyle={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.45)',
            }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                    style={{ width: 200, marginBottom: 16 }}
                    placeholder="Yönetilecek Rafı Seç"
                    onChange={(value) => setSelectedRack(value)}
                    value={selectedRack}
                    allowClear // Seçimi temizleme butonu
                    // className={isDark ? 'dark-select' : ''} // Gerekirse tema uyumu
                >
                    {[...Array(10)].map((_, i) => (
                        <Select.Option key={i+1} value={i+1}>Raf {i+1}</Select.Option>
                    ))}
                </Select>

                {error && <Text type="danger">{error}</Text>}

                <Spin spinning={loadingCells}>
                    {selectedRack !== null && cells.length > 0 && (
                        <List
                            itemLayout="horizontal"
                            dataSource={cells}
                            renderItem={renderCellItem}
                            bordered
                            className={isDark ? 'dark-list' : ''} // Tema uyumu
                        />
                    )}
                    {selectedRack !== null && !loadingCells && cells.length === 0 && !error && (
                        <Text>Bu rafta hücre bulunamadı.</Text>
                    )}
                    {selectedRack === null && !error && (
                        <Text type="secondary">Lütfen yönetmek için bir raf seçin.</Text>
                    )}
                </Spin>
            </Space>

            {/* Ürün Ekleme/Çıkarma Modalı */}
            {currentCellData && (
                 <WarehouseProductModal
                    visible={isProductModalOpen}
                    onCancel={() => setIsProductModalOpen(false)} // Sadece kapatır
                    onSuccess={handleProductModalSuccess} // Başarı durumunda listeyi yeniler
                    cellData={currentCellData} // Tıklanan hücrenin verisini gönderir
                />
            )}

            {/* Ürün Bilgisi Modalı */}
            {infoModalData && (
                <Modal
                    title={<Space><InfoCircleOutlined />{`${infoModalData.code} Hücresindeki Ürün Detayları`}</Space>}
                    open={isInfoModalVisible}
                    onCancel={() => setIsInfoModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setIsInfoModalVisible(false)}>
                            Kapat
                        </Button>,
                    ]}
                    width={600}
                    className={isDark ? 'dark-modal' : ''} // Tema sınıfı
                    bodyStyle={{ 
                        backgroundColor: isDark ? '#2d3748' : '#f9fafb', // Temaya göre arkaplan
                        padding: '24px' 
                    }} 
                    maskStyle={{
                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)',
                    }}
                >
                    {infoModalData.pallets && infoModalData.pallets.length > 0 ? (
                        infoModalData.pallets.map((p, index) => (
                            <React.Fragment key={p.id || index}>
                                {infoModalData.pallets.length > 1 && (
                                    <Typography.Title 
                                        level={5} 
                                        style={{ 
                                            marginTop: index > 0 ? '20px' : '0px', 
                                            marginBottom: '10px',
                                            color: isDark ? '#cbd5e0' : '#4a5568' // Başlık rengi
                                        }}
                                    >
                                        Palet #{index + 1}
                                    </Typography.Title>
                                )}
                                <Descriptions 
                                    bordered 
                                    column={1} 
                                    size="small"
                                    className={isDark ? 'dark-descriptions' : ''} // Description tema sınıfı
                                    style={{ 
                                        backgroundColor: isDark ? '#1a202c' : '#fff' // Description arkaplanı
                                    }}
                                >
                                     <Descriptions.Item label={<Space><AppstoreOutlined />Ürün Adı</Space>}>
                                         {p.product?.name || <Text type="secondary">Veri Yok</Text>}
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><KeyOutlined />Ürün ID</Space>}>
                                         {p.product?.id || <Text type="secondary">Veri Yok</Text>}
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><BarcodeOutlined />SKU</Space>}>
                                         {p.product?.sku || <Text type="secondary">Veri Yok</Text>}
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><InfoCircleOutlined />Açıklama</Space>}>
                                         {p.product?.description || <Text type="secondary">-</Text>}
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><BoxPlotOutlined />Palet Tipi</Space>}>
                                         <Tag color={p.product?.palletType === 'half' ? 'blue' : 'purple'}>
                                            {p.product?.palletType === 'half' ? 'Yarım' : 'Tam'} Palet
                                         </Tag>
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><FieldNumberOutlined />Adet</Space>}>
                                         {(p.quantity ?? p.product?.quantity) ?? <Text type="secondary">API'den Gelmedi</Text>} 
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><GoldOutlined />Ağırlık</Space>}>
                                         {p.product?.weight ? `${p.product.weight} kg` : <Text type="secondary">Veri Yok</Text>}
                                     </Descriptions.Item>
                                     <Descriptions.Item label={<Space><CalendarOutlined />Giriş Tarihi</Space>}>
                                         {(p.entryDate ?? p.createdAt) ? 
                                            new Date(p.entryDate ?? p.createdAt).toLocaleDateString('tr-TR') : 
                                            <Text type="secondary">Veri Yok</Text>}
                                     </Descriptions.Item>
                                </Descriptions>
                                {infoModalData.pallets.length > 1 && index < infoModalData.pallets.length - 1 && <Divider style={{ borderColor: isDark ? '#4a5568' : '#e2e8f0' }} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text type={isDark ? 'secondary' : undefined}>Bu hücrede ürün bulunmuyor.</Text>
                    )}
                </Modal>
            )}
            
        </Modal>
    );
};

export default WarehouseManagementModal; 