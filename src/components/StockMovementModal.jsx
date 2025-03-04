import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button } from 'antd';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const StockMovementModal = ({ visible, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Ürünleri ve lokasyonları getir
    useEffect(() => {
        if (visible) {
            // Ürünleri getir
            axios.get('http://localhost:3000/api/products', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(response => {
                if (response.data.success) {
                    setProducts(response.data.data);
                }
            })
            .catch(error => {
                console.error('Ürünler yüklenirken hata:', error);
                toast.error('Ürünler yüklenemedi');
            });

            // Lokasyonları getir
            axios.get('http://localhost:3000/api/locations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(response => {
                if (response.data.success) {
                    setLocations(response.data.data);
                }
            })
            .catch(error => {
                console.error('Lokasyonlar yüklenirken hata:', error);
                toast.error('Lokasyonlar yüklenemedi');
            });
        }
    }, [visible]);

    // Ürün seçildiğinde detaylarını getir
    const handleProductChange = async (productId) => {
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await onSubmit({
                ...values,
                productId: selectedProduct?.id
            });
            form.resetFields();
        } catch (error) {
            console.error('Stok hareketi kaydedilirken hata:', error);
            toast.error('Stok hareketi kaydedilemedi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Yeni Stok Hareketi"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="type"
                    label="İşlem Tipi"
                    rules={[{ required: true, message: 'İşlem tipi seçiniz' }]}
                >
                    <Select>
                        <Select.Option value="IN">Giriş</Select.Option>
                        <Select.Option value="OUT">Çıkış</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="productId"
                    label="Ürün"
                    rules={[{ required: true, message: 'Ürün seçiniz' }]}
                >
                    <Select
                        showSearch
                        placeholder="Ürün seçin"
                        optionFilterProp="children"
                        onChange={handleProductChange}
                    >
                        {products.map(product => (
                            <Select.Option key={product.id} value={product.id}>
                                {product.name} - {product.sku}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="locationId"
                    label="Lokasyon"
                    rules={[{ required: true, message: 'Lokasyon seçiniz' }]}
                >
                    <Select
                        showSearch
                        placeholder="Lokasyon seçin"
                        optionFilterProp="children"
                    >
                        {locations.map(location => (
                            <Select.Option key={location.id} value={location.id}>
                                {`${location.code} - Raf ${location.rackNumber}, Seviye ${location.level}, Poz. ${location.position}`}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedProduct && (
                    <div className="mb-4 p-2 bg-gray-50 rounded">
                        <p>Mevcut Stok: {selectedProduct.quantity}</p>
                    </div>
                )}

                <Form.Item
                    name="quantity"
                    label="Miktar"
                    rules={[{ required: true, message: 'Miktar giriniz' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Açıklama"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item className="mb-0 flex justify-end">
                    <Button onClick={onCancel} className="mr-2">
                        İptal
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Kaydet
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StockMovementModal; 