import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, Select, Form, Row, Col, Card, Descriptions, Tag, Empty, Divider } from 'antd';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseProductModal = ({ visible, onCancel, cellData }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (visible) {
            // Eğer cellData varsa (bir hücreye tıklandıysa) direkt o verileri göster
            if (cellData) {
                setSelectedLocation(`R${cellData.rackNumber}-${cellData.level}-${cellData.position}`);
                setLocationStatus({
                    isOccupied: cellData.locationData?.isOccupied || false,
                    productData: cellData.locationData?.Product || null
                });
                setShowForm(false);
                
                // Formu başlangıç değerleriyle doldur
                form.setFieldsValue({
                    rackNumber: cellData.rackNumber,
                    level: cellData.level,
                    position: cellData.position
                });
            } else {
                // Eğer direkt modal açıldıysa, form göster
                fetchAvailableProducts();
                form.resetFields();
                setLocationStatus(null);
                setShowForm(true);
            }
        }
    }, [visible, cellData]);

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
                            productData: cell?.Product || null
                        });
                        setSelectedLocation(locationCode);
                    } else {
                        // Hücre bulunamadı, boş olarak kabul et
                        console.log("Hücre bulunamadı, boş olarak kabul ediliyor:", locationCode);
                        setLocationStatus({
                            isOccupied: false,
                            productData: null
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
                    productData: null
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
            const product = availableProducts.find(p => p.id === productId);
            
            if (!product) {
                throw new Error("Ürün bulunamadı");
            }

            // Önce ürün verilerini al
            const productResponse = await axios.get(`http://localhost:3000/api/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!productResponse.data.success) {
                throw new Error("Ürün bilgileri alınamadı");
            }

            const productData = productResponse.data.data;

            // Ürünü güncelle - tüm mevcut bilgileri koruyarak locationId'yi güncelle
            await axios.put(`http://localhost:3000/api/products/${productId}`, {
                name: productData.name,
                sku: productData.sku,
                description: productData.description || '',
                quantity: productData.quantity,
                price: productData.price || 0,
                minStock: productData.minStockLevel || 0,
                categoryId: productData.categoryId,
                locationId: selectedLocation,  // Lokasyon bilgisini güncelliyoruz
                company: productData.company || '',
                weight: productData.weight || 0,
                sizeCategory: productData.sizeCategory || ''
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Stok giriş kaydı oluştur
            await axios.post('http://localhost:3000/api/stock-movements', {
                type: 'IN',
                productId: productId,
                quantity: 1,
                description: '3D depo görünümünden eklendi',
                locationId: selectedLocation
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success('Ürün başarıyla eklendi');
            onCancel();
            window.location.reload();
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
            // Lokasyon bilgisini al
            const locationId = locationStatus?.productData?.locationId || cellData?.locationData?.id;
            const productId = locationStatus?.productData?.id || cellData?.locationData?.Product?.id;

            if (!locationId || !productId) {
                throw new Error("Lokasyon veya ürün bilgisi bulunamadı");
            }

            console.log("Removing product:", { productId, locationId });

            // Önce ürün verilerini al
            const productResponse = await axios.get(`http://localhost:3000/api/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!productResponse.data.success) {
                throw new Error("Ürün bilgileri alınamadı");
            }

            const productData = productResponse.data.data;

            // Stok çıkış kaydı oluştur
            await axios.post('http://localhost:3000/api/stock-movements', {
                type: 'OUT',
                productId: productId,
                quantity: 1,
                description: '3D depo görünümünden çıkarıldı',
                locationId: locationId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Ürünü güncelle - tüm mevcut bilgileri koruyarak locationId'yi null yap
            await axios.put(`http://localhost:3000/api/products/${productId}`, {
                name: productData.name,
                sku: productData.sku,
                description: productData.description || '',
                quantity: productData.quantity,
                price: productData.price || 0,
                minStock: productData.minStockLevel || 0,
                categoryId: productData.categoryId,
                locationId: null,  // Sadece lokasyon bilgisini null yapıyoruz
                company: productData.company || '',
                weight: productData.weight || 0,
                sizeCategory: productData.sizeCategory || ''
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast.success('Ürün başarıyla kaldırıldı');
            onCancel();
            window.location.reload();
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
        >
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
                                <Tag color={locationStatus?.isOccupied ? 'blue' : 'green'}>
                                    {locationStatus?.isOccupied ? 'Dolu' : 'Boş'}
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
                                <Descriptions.Item label="Ağırlık">{locationStatus.productData.weight} kg</Descriptions.Item>
                                
                                {getSizeCategory(locationStatus.productData) && (
                                    <Descriptions.Item label="Boyut Kategorisi">
                                        <Tag color={getSizeCategory(locationStatus.productData).color}>
                                            {getSizeCategory(locationStatus.productData).category} 
                                            ({(getSizeCategory(locationStatus.productData).volume/1000).toFixed(3)} L)
                                        </Tag>
                                    </Descriptions.Item>
                                )}
                                
                                <Descriptions.Item label="Boyutlar">
                                    {locationStatus.productData.width} × {locationStatus.productData.height} × {locationStatus.productData.length} cm
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
        </Modal>
    );
};

export default WarehouseProductModal; 