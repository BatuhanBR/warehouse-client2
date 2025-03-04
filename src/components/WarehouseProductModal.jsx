import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Typography, Select, Form, Row, Col } from 'antd';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseProductModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState(null);

    useEffect(() => {
        if (visible) {
            fetchAvailableProducts();
            form.resetFields();
            setLocationStatus(null);
        }
    }, [visible]);

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
        const locationCode = `R${values.rackNumber.toString().padStart(2, '0')}-${values.level}-${values.position}`;
        try {
            // Şimdilik direkt boş olarak kabul edelim
            setLocationStatus({ isOccupied: false });
            setSelectedLocation(locationCode);

            // Ürünleri getir
            const response = await axios.get('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const availableProducts = response.data.data.filter(product => product.quantity > 0);
            setAvailableProducts(availableProducts);

        } catch (error) {
            console.error('Lokasyon durumu kontrol edilirken hata:', error);
            toast.error('Lokasyon durumu kontrol edilemedi');
        }
    };

    const handleAddProduct = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await axios.post('http://localhost:3000/api/locations/update', {
                code: selectedLocation,
                productId: values.productId,
                isOccupied: true
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
            toast.error('Ürün eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProduct = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/locations/update', {
                code: selectedLocation,
                productId: null,
                isOccupied: false
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
            toast.error('Ürün kaldırılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Ürün İşlemleri"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form 
                form={form}
                layout="vertical"
                onValuesChange={(_, allValues) => {
                    if (allValues.rackNumber && allValues.level && allValues.position) {
                        checkLocationStatus(allValues);
                    }
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
                                    <Option key={i} value={i}>
                                        {i}. Kat
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
                                <Text>Bu konumda ürün mevcut</Text>
                                <Text>Ürün: {locationStatus.productName}</Text>
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
                                <Text>Bu konum boş</Text>
                                <Form.Item
                                    name="productId"
                                    label="Eklenecek Ürün"
                                    rules={[{ required: true }]}
                                    style={{ marginTop: 16 }}
                                >
                                    <Select 
                                        placeholder="Ürün seçin"
                                        loading={loading}
                                        showSearch
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}
                                    >
                                        {availableProducts.map(product => (
                                            <Option key={product.id} value={product.id}>
                                                {product.name} ({product.quantity} adet mevcut) - SKU: {product.sku}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Button 
                                    type="primary"
                                    onClick={handleAddProduct}
                                    loading={loading}
                                    style={{ marginTop: 8 }}
                                >
                                    Ürün Ekle
                                </Button>
                            </>
                        )}
                    </Space>
                )}
            </Form>
        </Modal>
    );
};

export default WarehouseProductModal; 