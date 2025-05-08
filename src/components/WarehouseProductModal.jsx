import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, Select, Form, Row, Col, Card, Descriptions, Tag, Empty, Divider, Input, InputNumber, Spin } from 'antd';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseProductModal = ({ visible, onCancel, cellData, onSuccess }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentCellData, setCurrentCellData] = useState(null);

    useEffect(() => {
        if (visible) {
            // Eğer cellData varsa (yönetim modalından veya 3D tıklamadan)
            // Artık cellData doğrudan API'den gelen lokasyon/hücre verisi
            if (cellData && cellData.code) { // cellData'nın geçerli bir hücre verisi olup olmadığını kontrol et (örn: code alanı var mı?)
                const locData = cellData; // cellData zaten lokasyon verisi
                setSelectedLocation(`R${locData.rackNumber}-${locData.level}-${locData.position}`);
                
                const firstPallet = locData.pallets?.[0];
                const productData = firstPallet?.product || null;
                
                setLocationStatus({
                    isOccupied: locData.isOccupied || false, 
                    productData: productData, 
                    usedCapacity: locData.usedCapacity || 0,
                    totalCapacity: locData.totalCapacity || 2
                });
                // Ürün varsa detayları göster (formu gösterme)
                // Ürün yoksa (Ekle'ye basıldıysa) formu göster
                setShowForm(!productData); 
                
                // Eğer formu gösteriyorsak, başlangıç değerlerini ayarla
                if (!productData) {
                form.setFieldsValue({
                        rackNumber: locData.rackNumber,
                        level: locData.level,
                        position: locData.position
                });
                    fetchAvailableProducts(); // Eklenecek ürünleri getir
                }

            } else {
                // Eğer cellData yoksa (örn: eski + butonuyla direkt açıldıysa - artık kullanılmıyor olmalı)
                // Veya geçersiz veri geldiyse, formu göster
                fetchAvailableProducts();
                form.resetFields();
                setLocationStatus(null);
                setShowForm(true);
            }
        }
    }, [visible, cellData, form]); // form'u dependency array'e ekle

    const fetchAvailableProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const availableProducts = response.data.data.filter(product => product.quantity > 0);
            setAvailableProducts(availableProducts);
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
            toast.error('Ürünler yüklenemedi');
        }
    };

    // Lokasyon durumunu kontrol et
    const checkLocationStatus = async (values) => {
        if (!values.rackNumber || !values.level || !values.position) return;
        
        const locationCode = `R${values.rackNumber}-${values.level}-${values.position}`;
        try {
            let response;
            
            try {
                // Önce API'den lokasyonu almayı dene
                response = await axios.get(`http://localhost:3000/api/locations/racks/${values.rackNumber}/cells`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data.success) {
                    // Hücreyi filtrele
                    const cells = response.data.data || [];
                    const cell = cells.find(c => 
                        c.level === parseInt(values.level) && 
                        c.position === parseInt(values.position)
                    );
                    
                    if (cell) {
                        // Hücre bulundu, durumunu kontrol et
                        setLocationStatus({
                            isOccupied: cell?.isOccupied || false,
                            productData: cell?.Product || null,
                            usedCapacity: cell?.usedCapacity || 0,
                            totalCapacity: cell?.totalCapacity || 2
                        });
                        setSelectedLocation(locationCode);
                    } else {
                        // Hücre bulunamadı, boş olarak kabul et
                        console.log("Hücre bulunamadı, boş olarak kabul ediliyor:", locationCode);
                        setLocationStatus({
                            isOccupied: false,
                            productData: null,
                            usedCapacity: 0,
                            totalCapacity: 2
                        });
                        setSelectedLocation(locationCode);
                    }
                } else {
                    throw new Error("API yanıtı başarısız");
                }
            } catch (apiError) {
                console.warn("API'den lokasyon alınamadı, manuel konum oluşturuluyor:", apiError);
                // API çağrısı başarısız olduysa, manuel olarak konum oluştur
                setLocationStatus({
                    isOccupied: false,
                    productData: null,
                    usedCapacity: 0,
                    totalCapacity: 2
                });
                setSelectedLocation(locationCode);
            }

            // Ürünleri getir
            if (!availableProducts.length) {
                fetchAvailableProducts();
            }

        } catch (error) {
            console.error('Lokasyon durumu kontrol edilirken hata:', error);
            toast.error('Lokasyon durumu kontrol edilemedi');
        }
    };

    const handleAddProduct = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const productId = values.productId;
            const targetLocationId = cellData?.id;
            
            if (!productId || !targetLocationId) {
                throw new Error("Eklenecek ürün veya hedef lokasyon seçilemedi.");
            }

            console.log(`Adding product ${productId} to location ${targetLocationId}`);

            await axios.put(`http://localhost:3000/api/products/${productId}`, 
                { locationId: targetLocationId },
                {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
                }
            );

            await axios.post('http://localhost:3000/api/stock-movements', {
                type: 'IN',
                productId: productId,
                quantity: 1,
                description: 'Depo yönetim modalından eklendi',
                locationId: targetLocationId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success('Ürün başarıyla eklendi');
            if (onSuccess) onSuccess();
            onCancel();
        } catch (error) {
            console.error('Ürün ekleme hatası:', error);
            toast.error('Ürün eklenirken bir hata oluştu: ' + (error?.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProduct = async () => {
        setLoading(true);
        try {
            // Lokasyon ve Ürün ID'lerini doğrudan cellData'dan alalım
            const locationId = cellData?.id; // Hücrenin (lokasyonun) ID'si
            // İlk paletin ürün ID'sini al (varsayım: çıkarılacak ürün ilk palet)
            const productId = cellData?.pallets?.[0]?.product?.id; 

            if (!locationId || !productId) {
                // Hata mesajını biraz daha açıklayıcı yapalım
                console.error("Hata: locationId veya productId bulunamadı", { locationId, productId, cellData });
                throw new Error("Lokasyon veya ürün bilgisi bulunamadı. Veri yapısını kontrol edin.");
            }

            console.log("Removing product:", { productId, locationId });

            // Stok çıkış kaydı oluştur
            await axios.post('http://localhost:3000/api/stock-movements', {
                type: 'OUT',
                productId: productId,
                quantity: 1, // Şimdilik 1 adet varsayıyoruz
                description: 'Depo yönetim modalından çıkarıldı', // Açıklama güncellendi
                locationId: locationId // Stok hareketi için lokasyon ID'si
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Ürünü güncelle - Sadece locationId'yi null yap
            // !! ÖNEMLİ NOT: Bu işlem, ürünün HERHANGİ BİR lokasyonda olup olmadığını kontrol etmeden
            //              locationId'sini null yapıyor. Eğer ürün birden fazla lokasyonda
            //              olabiliyorsa (şu anki yapıda pek mümkün görünmüyor ama), bu mantık
            //              yanlış olabilir. API tarafında bu kontrolü yapmak daha doğru olur.
            //              Şimdilik, mevcut yapıya göre devam ediyoruz.
            await axios.put(`http://localhost:3000/api/products/${productId}`, 
                { locationId: null }, 
                {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            toast.success('Ürün başarıyla kaldırıldı');
            if (onSuccess) onSuccess();
            onCancel();
        } catch (error) {
            console.error('Ürün kaldırma hatası:', error);
            toast.error('Ürün kaldırılırken bir hata oluştu: ' + (error?.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    
    // Boyut kategorisini belirle
    const getSizeCategory = (product) => {
        if (!product) return null;
        
        const width = Number(product.width || 0);
        const height = Number(product.height || 0);
        const length = Number(product.length || 0);
        const volume = width * height * length;
        
        let category;
        let color;
        
        if (volume <= 5000) { // 5.000 cm³ = 5 litre
            category = 'Küçük';
            color = 'success';
        } else if (volume <= 50000) { // 50.000 cm³ = 50 litre
            category = 'Normal';
            color = 'processing';
        } else {
            category = 'Büyük';
            color = 'warning';
        }
        
        return { category, color, volume };
    };

    return (
        <Modal
            title={`${cellData ? 'Ürün Bilgileri' : 'Ürün İşlemleri'}`}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            style={{ top: 20 }}
            bodyStyle={{ 
                backgroundColor: isDark ? '#1f2937' : '#fff',
                padding: '20px' 
            }}
            className={isDark ? 'dark-modal' : ''}
            maskStyle={{
                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.45)',
            }}
        >
            <Spin spinning={loading}>
                {showForm ? (
                    <Form 
                        form={form}
                        layout="vertical"
                        onValuesChange={(_, allValues) => {
                            checkLocationStatus(allValues);
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="rackNumber"
                                    label="Raf No"
                                    rules={[{ required: true }]}
                                >
                                    <Select placeholder="Raf seçin">
                                        {[...Array(10)].map((_, i) => (
                                            <Option key={i + 1} value={i + 1}>
                                                Raf {i + 1}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="level"
                                    label="Kat"
                                    rules={[{ required: true }]}
                                >
                                    <Select placeholder="Kat seçin">
                                        {[...Array(4)].map((_, i) => (
                                            <Option key={i+1} value={i+1}>
                                                {i+1}. Kat
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="position"
                                    label="Pozisyon"
                                    rules={[{ required: true }]}
                                >
                                    <Select placeholder="Pozisyon seçin">
                                        {[...Array(4)].map((_, i) => (
                                            <Option key={i + 1} value={i + 1}>
                                                Pozisyon {i + 1}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {selectedLocation && (
                            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                                <Title level={5}>Seçili Konum: {selectedLocation}</Title>
                                
                                {locationStatus?.isOccupied ? (
                                    <>
                                        <Text type={isDark ? "warning" : "danger"}>Bu konumda ürün mevcut</Text>
                                        <Text>{locationStatus.productData?.name}</Text>
                                        <Button 
                                            danger
                                            type="primary"
                                            onClick={handleRemoveProduct}
                                            loading={loading}
                                            style={{ marginTop: 8 }}
                                        >
                                            Ürünü Çıkar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Text type={isDark ? "success" : "success"}>Bu konum boş</Text>
                                        <Form.Item
                                            name="productId"
                                            label="Eklenecek Ürün"
                                            rules={[{ required: true }]}
                                        >
                                            <Select placeholder="Ürün seçin" showSearch optionFilterProp="children">
                                                {availableProducts.map(product => (
                                                    <Option key={product.id} value={product.id}>
                                                        {product.name} (Stok: {product.quantity})
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Button 
                                            type="primary"
                                            onClick={handleAddProduct}
                                            loading={loading}
                                        >
                                            Ürünü Ekle
                                        </Button>
                                    </>
                                )}
                            </Space>
                        )}
                    </Form>
                ) : (
                    <>
                        <Card 
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Konum: {selectedLocation}</span>
                                    <Tag color={
                                        locationStatus?.usedCapacity === 0 ? 'green' : 
                                        locationStatus?.usedCapacity === locationStatus?.totalCapacity ? 'red' : 'blue'
                                    }>
                                        {
                                            locationStatus?.usedCapacity === 0 ? 'Boş' : 
                                            locationStatus?.usedCapacity === locationStatus?.totalCapacity ? `Dolu (${locationStatus?.usedCapacity}/${locationStatus?.totalCapacity})` :
                                            `Yarı Dolu (${locationStatus?.usedCapacity}/${locationStatus?.totalCapacity})`
                                        }
                                    </Tag>
                                </div>
                            }
                            bordered={false}
                            className={isDark ? 'bg-gray-800 text-white' : ''}
                        >
                            {locationStatus?.isOccupied && locationStatus?.productData ? (
                                <Descriptions 
                                    bordered 
                                    column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
                                    className={isDark ? 'descriptions-dark' : ''}
                                >
                                    <Descriptions.Item label="Ürün Adı">{locationStatus.productData.name}</Descriptions.Item>
                                    <Descriptions.Item label="SKU">{locationStatus.productData.sku || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Kategori">{locationStatus.productData?.Category?.name || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Miktar">{locationStatus.productData.quantity}</Descriptions.Item>
                                    
                                    <Descriptions.Item label="Ağırlık">
                                        {
                                            (() => {
                                                const kg = parseFloat(locationStatus.productData.weight) || 0;
                                                const category = locationStatus.productData.weightCategory || 'Hafif';
                                                let color = 'green';
                                                if (category === 'Ağır') color = 'red';
                                                else if (category === 'Normal') color = 'orange';
                                                return (
                                                    <Space>
                                                        <Tag color={color}>{category}</Tag>
                                                        <span>({kg.toFixed(1)} kg)</span>
                                                    </Space>
                                                );
                                            })()
                                        }
                                        </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Palet Tipi">
                                        {
                                            (() => {
                                                const palletType = locationStatus.productData.palletType;
                                                let displayText = '-';
                                                let color = 'default';
                                                if (palletType === 'full') {
                                                displayText = 'Tam Palet';
                                                color = 'blue';
                                                } else if (palletType === 'half') {
                                                displayText = 'Yarım Palet';
                                                color = 'geekblue';
                                                }
                                                return <Tag color={color}>{displayText}</Tag>;
                                            })()
                                        }
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Açıklama" span={3}>
                                        {locationStatus.productData.description || 'Açıklama yok'}
                                    </Descriptions.Item>
                                </Descriptions>
                            ) : (
                                <Empty description="Bu konumda ürün bulunmuyor" />
                            )}
                        </Card>
                        
                        <Divider />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setShowForm(true)}>
                                Ürün İşlemlerine Geç
                            </Button>
                            
                            {locationStatus?.isOccupied && (
                                <Button 
                                    danger
                                    type="primary"
                                    onClick={handleRemoveProduct}
                                    loading={loading}
                                >
                                    Ürünü Çıkar
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Spin>
        </Modal>
    );
};

export default WarehouseProductModal; 