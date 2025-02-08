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

    // Kategorileri ve lokasyonları yükle
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, locationsRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/categories/list'),
                    axios.get('http://localhost:3000/api/locations')
                ]);
                
                if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
                if (locationsRes.data.success) setLocations(locationsRes.data.data);
            } catch (error) {
                console.error('Veri yüklenirken hata:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (visible && initialData && mode === 'edit') {
            form.setFieldsValue({
                ...initialData,
                storageStartDate: initialData.storageStartDate ? dayjs(initialData.storageStartDate) : null
            });
        } else {
            form.resetFields();
        }
    }, [visible, initialData, form, mode]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formattedValues = {
                ...values,
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

    return (
        <Modal
            title={mode === 'edit' ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                            <Select>
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="width" label="Genişlik (cm)" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="height" label="Yükseklik (cm)" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="length" label="Uzunluk (cm)" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dailyStorageRate" label="Günlük Depolama Ücreti" rules={[{ required: true }]}>
                            <InputNumber style={{ width: '100%' }} min={0} />
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
                            <Select>
                                {locations.map(loc => (
                                    <Select.Option key={loc.id} value={loc.id}>
                                        {`${loc.code} - Raf ${loc.rackNumber}`}
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

                <Form.Item name="description" label="Açıklama">
                    <Input.TextArea rows={4} />
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