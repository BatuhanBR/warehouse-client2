import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Space, Button, Select, DatePicker } from 'antd';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import axios from 'axios';

const ProductModal = ({ visible, onCancel, onSubmit, initialData, mode }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [calculatedPrice, setCalculatedPrice] = useState(0);

    // Fiyat hesaplama fonksiyonu
    const calculatePrice = (categoryId, duration) => {
        const categoryDailyRates = {
            1: 150, // Elektronik
            2: 80,  // Giyim
            3: 100, // Ev & Yaşam
            4: 90,  // Spor
            5: 50,  // Kitap
            6: 120, // Kozmetik
            7: 70,  // Oyuncak
            8: 60,  // Ofis
            9: 200, // Gıda
            10: 110 // Bahçe
        };

        const dailyRate = categoryDailyRates[categoryId] || 100;
        const days = duration || 30;
        
        // İndirim hesaplama
        let discountRate = 1.0;
        if (days > 180) discountRate = 0.7;      // 6+ ay: %30 indirim
        else if (days > 90) discountRate = 0.8;  // 3+ ay: %20 indirim
        else if (days > 30) discountRate = 0.9;  // 1+ ay: %10 indirim

        return Math.max(dailyRate * days * discountRate, 100);
    };

    // Kategorileri ve lokasyonları yükle
    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/categories/list', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
            toast.error('Kategoriler yüklenemedi');
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/locations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Sadece boş lokasyonları filtrele
            const availableLocations = response.data.data.filter(loc => !loc.isOccupied);
            setLocations(availableLocations);
        } catch (error) {
            console.error('Lokasyonlar yüklenirken hata:', error);
            toast.error('Lokasyonlar yüklenemedi');
        }
    };

    useEffect(() => {
        if (visible) {
            fetchCategories();
            fetchLocations();
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && initialData) {
                form.setFieldsValue({
                    ...initialData,
                    storageStartDate: initialData.storageStartDate ? dayjs(initialData.storageStartDate) : null
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialData, form, mode]);

    // Form gönderilmeden önce
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            
            // Fiyatı hesapla ve forma ekle
            const price = calculatePrice(
                values.categoryId, 
                values.expectedStorageDuration
            );
            
            const formattedValues = {
                ...values,
                price: price, // Hesaplanan fiyatı ekle
                storageStartDate: values.storageStartDate ? values.storageStartDate.format('YYYY-MM-DD') : null
            };

            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('Bir hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    // Form alanları değiştiğinde fiyatı güncelle
    const updatePrice = () => {
        const categoryId = form.getFieldValue('categoryId');
        const duration = form.getFieldValue('expectedStorageDuration');
        if (categoryId && duration) {
            const price = calculatePrice(categoryId, duration);
            setCalculatedPrice(price);
        }
    };

    // Boyutlar değiştiğinde depolama ücretini hesapla
    const calculateDailyStorageRate = (width = 0, height = 0, length = 0) => {
        // Metreküp cinsinden hacim hesapla (cm³ -> m³)
        const volumeInCubicMeters = (width * height * length) / 1000000;
        // Her metreküp için 50₺ baz fiyat
        const baseRate = 50;
        // Hacim bazlı fiyatlandırma
        const rate = Math.max(baseRate * volumeInCubicMeters, 50); // Minimum 50₺
        return Number(rate.toFixed(2));
    };

    // Boyutlar değiştiğinde otomatik hesaplama yap
    const handleDimensionChange = () => {
        const width = form.getFieldValue('width') || 0;
        const height = form.getFieldValue('height') || 0;
        const length = form.getFieldValue('length') || 0;
        
        const rate = calculateDailyStorageRate(width, height, length);
        form.setFieldsValue({ dailyStorageRate: rate });
    };

    // Boyut alanları için ortak props
    const dimensionProps = {
        style: { width: '100%' },
        min: 0,
        onChange: handleDimensionChange
    };

    return (
        <Modal
            title={mode === 'edit' ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit}
                onValuesChange={updatePrice}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="Ürün Adı" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="quantity" label="Stok" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="minStockLevel" label="Minimum Stok" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="categoryId" label="Kategori" rules={[{ required: true }]}>
                            <Select placeholder="Kategori seçin">
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="width" label="Genişlik (cm)" rules={[{ required: true }]}>
                            <InputNumber {...dimensionProps} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="height" label="Yükseklik (cm)" rules={[{ required: true }]}>
                            <InputNumber {...dimensionProps} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="length" label="Uzunluk (cm)" rules={[{ required: true }]}>
                            <InputNumber {...dimensionProps} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="dailyStorageRate" 
                            label="Günlük Depolama Ücreti" 
                            rules={[{ required: true }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                disabled
                                formatter={value => `${value} ₺/gün`}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="storageStartDate" label="Depolama Başlangıç Tarihi">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="locationId" label="Lokasyon" rules={[{ required: true }]}>
                            <Select placeholder="Lokasyon seçin">
                                {locations.map(loc => (
                                    <Select.Option key={loc.id} value={loc.id}>
                                        {`${loc.code} - Raf ${loc.rackNumber}, Seviye ${loc.level}, Pozisyon ${loc.position}`}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="expectedStorageDuration" label="Beklenen Depolama Süresi (Gün)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Hesaplanan Toplam Fiyat">
                            <Input 
                                style={{ width: '100%' }} 
                                value={`${calculatedPrice.toFixed(2)} ₺`}
                                disabled
                                readOnly
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Süre bazlı indirim bilgisi */}
                {calculatedPrice > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">
                            {form.getFieldValue('expectedStorageDuration') > 180 && "6+ ay depolama: %30 indirim uygulandı"}
                            {form.getFieldValue('expectedStorageDuration') > 90 && form.getFieldValue('expectedStorageDuration') <= 180 && "3+ ay depolama: %20 indirim uygulandı"}
                            {form.getFieldValue('expectedStorageDuration') > 30 && form.getFieldValue('expectedStorageDuration') <= 90 && "1+ ay depolama: %10 indirim uygulandı"}
                        </p>
                    </div>
                )}

                <Form.Item name="description" label="Açıklama">
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item name="company" label="Şirket">
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button onClick={onCancel}>İptal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {mode === 'edit' ? 'Güncelle' : 'Ekle'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductModal; 