import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Space, Button, Select, DatePicker, Tooltip } from 'antd';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import axios from 'axios';

const ProductModal = ({ visible, onCancel, onSubmit, initialData, mode }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [racks, setRacks] = useState([]); // Raflar
    const [cells, setCells] = useState([]); // Hücreler
    const [selectedRack, setSelectedRack] = useState(null);

    // Kategori bazlı günlük depolama ücretleri
    const categoryStorageRates = {
        'Elektronik': 100,    // Hassas ürünler
        'Gıda': 150,         // Soğuk zincir gerektirir
        'Kozmetik': 120,     // Sıcaklık kontrolü gerektirir
        'Kitap': 50,         // Normal depolama
        'Giyim': 70,         // Normal depolama
        'Spor': 80,          // Normal depolama
        'Ev & Yaşam': 90,    // Büyük ürünler
        'Oyuncak': 60,       // Normal depolama
        'Ofis': 70,          // Normal depolama
        'Bahçe': 100         // Büyük ürünler
    };

    // Kategorileri ve rafları yükle
    useEffect(() => {
        if (visible) {
            fetchCategories();
            fetchRacks();
        }
    }, [visible]);

    // Kategorileri getir
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

    // Rafları getir
    const fetchRacks = async () => {
        try {
            console.log('Fetching racks from locations API...');
            const response = await axios.get('http://localhost:3000/api/locations/racks', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Racks response:', response.data);
            if (response.data.success) {
                setRacks(response.data.data || []);
            } else {
                toast.error('Raf verisi bulunamadı');
            }
        } catch (error) {
            console.error('Raflar yüklenirken hata:', error);
            toast.error('Raflar yüklenemedi');
        }
    };

    // Seçilen rafın hücrelerini getir
    const fetchCells = async (rackId) => {
        try {
            // Önce seçilen rafı bul
            const selectedRack = racks.find(rack => rack.id === rackId);
            if (!selectedRack) {
                console.error('Seçilen raf bulunamadı:', rackId);
                toast.error('Seçilen raf bulunamadı');
                return;
            }

            console.log(`Fetching cells for rack position: ${selectedRack.position}`);
            const response = await axios.get(`http://localhost:3000/api/locations/racks/${selectedRack.position}/cells`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Cells response:', response.data);
            if (response.data.success) {
                setCells(response.data.data || []);
            } else {
                toast.error('Hücre verisi bulunamadı');
            }
        } catch (error) {
            console.error('Hücreler yüklenirken hata:', error);
            toast.error('Hücreler yüklenemedi');
        }
    };

    // Raf seçildiğinde
    const handleRackChange = (rackId) => {
        setSelectedRack(rackId);
        form.setFieldsValue({ cellId: undefined }); // Hücre seçimini sıfırla
        fetchCells(rackId);
    };

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && initialData) {
                // Tarihleri dayjs formatına çevir
                const formData = {
                    ...initialData,
                    storageStartDate: initialData.storageStartDate ? dayjs(initialData.storageStartDate) : null
                };
                form.setFieldsValue(formData);
            } else {
                form.resetFields();
                // Varsayılan değerleri ayarla
                form.setFieldsValue({
                    storageStartDate: dayjs(),
                    expectedStorageDuration: 30,
                    minStockLevel: 5,
                    maxStockLevel: 100
                });

                // Seçili kategori varsa SKU için örnek format göster
                const categoryId = form.getFieldValue('categoryId');
                if (categoryId) {
                    form.setFields([{
                        name: 'sku',
                        value: '',
                        errors: [],
                        validating: false,
                        touched: false,
                        placeholder: `${categoryId}-XXXXX`
                    }]);
                }
            }
        }
    }, [visible, initialData, form, mode]);

    // Kategori değiştiğinde SKU placeholder'ını ve günlük ücreti güncelle
    const handleCategoryChange = async (value) => {
        try {
            // SKU placeholder güncelleme
            form.setFields([{
                name: 'sku',
                value: form.getFieldValue('sku'),
                errors: [],
                validating: false,
                touched: false,
                placeholder: `${value}-XXXXX`
            }]);

            // Seçilen kategorinin günlük depolama ücretini al
            const selectedCategory = categories.find(cat => cat.id === value);
            if (selectedCategory) {
                // Kategori adına göre depolama ücretini belirle
                const dailyRate = categoryStorageRates[selectedCategory.name] || 50; // Varsayılan 50
                
                // Günlük depolama ücretini otomatik ayarla
                form.setFieldsValue({
                    dailyStorageRate: dailyRate
                });

                // Fiyatı güncelle
                calculateTotalPrice(dailyRate, form.getFieldValue('expectedStorageDuration'));
            }
        } catch (error) {
            console.error('Depolama ücreti ayarlanırken hata:', error);
            toast.error('Depolama ücreti belirlenirken bir hata oluştu');
        }
    };

    // Depolama süresine göre indirim oranını hesapla
    const getDiscountRate = (duration) => {
        if (duration >= 180) return 0.15; // 6+ ay: %15 indirim
        if (duration >= 90) return 0.10;  // 3+ ay: %10 indirim
        if (duration >= 30) return 0.05;  // 1+ ay: %5 indirim
        return 0;
    };

    // Toplam fiyatı hesapla
    const calculateTotalPrice = (dailyRate, duration) => {
        if (!dailyRate || !duration) return;

        const basePrice = dailyRate * duration;
        const discountRate = getDiscountRate(duration);
        const discountAmount = basePrice * discountRate;
        const finalPrice = basePrice - discountAmount;

        form.setFieldsValue({
            price: finalPrice
        });
    };

    // Depolama süresi değiştiğinde fiyatı güncelle
    const handleStorageDurationChange = (value) => {
        const dailyRate = form.getFieldValue('dailyStorageRate');
        calculateTotalPrice(dailyRate, value);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            
            // Sayısal değerleri kontrol et ve dönüştür
            const formattedValues = {
                ...values,
                quantity: parseInt(values.quantity) || 0,
                minStockLevel: parseInt(values.minStockLevel) || 0,
                maxStockLevel: parseInt(values.maxStockLevel) || 0,
                weight: parseFloat(values.weight) || 0,
                width: parseFloat(values.width) || 0,
                height: parseFloat(values.height) || 0,
                length: parseFloat(values.length) || 0,
                categoryId: parseInt(values.categoryId),
                locationId: parseInt(values.cellId), // cellId, location tablosundaki bir id
                storageStartDate: values.storageStartDate ? values.storageStartDate.format('YYYY-MM-DD') : null,
                expectedStorageDuration: parseInt(values.expectedStorageDuration) || 30,
                createdBy: parseInt(localStorage.getItem('userId')) || 1,
                dailyStorageRate: parseFloat(values.dailyStorageRate) || 0,
                price: parseFloat(values.price) || 0
            };

            // Hacim hesapla (cm³)
            const volume = formattedValues.width * formattedValues.height * formattedValues.length;
            
            // Boyut kategorisini belirle
            if (volume <= 5000) { // 5.000 cm³ = 5 litre
                formattedValues.sizeCategory = 'Küçük';
            } else if (volume <= 50000) { // 50.000 cm³ = 50 litre
                formattedValues.sizeCategory = 'Normal';
            } else {
                formattedValues.sizeCategory = 'Büyük';
            }

            console.log('Gönderilen değerler:', formattedValues); // Debug için

            await onSubmit(formattedValues);
            form.resetFields();
        } catch (error) {
            console.error('Form gönderim hatası:', error);
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
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit}
                initialValues={{
                    storageStartDate: dayjs(),
                    expectedStorageDuration: 30,
                    minStockLevel: 5,
                    maxStockLevel: 100
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="name" 
                            label="Ürün Adı" 
                            rules={[{ required: true, message: 'Lütfen ürün adı girin' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="sku" 
                            label="SKU" 
                            rules={[
                                { required: true, message: 'Lütfen SKU girin' },
                                {
                                    pattern: /^\d{2}-[A-Z]{5}$/,
                                    message: 'SKU formatı "XX-YYYYY" şeklinde olmalıdır (Örnek: 12-ABCDE) (2 sayı - 5 büyük harf)'
                                }
                            ]}
                        >
                            <Input 
                                placeholder="12-ABCDE" 
                                style={{ textTransform: 'uppercase' }}
                                onChange={(e) => {
                                    let value = e.target.value.toUpperCase();
                                    // Sadece sayı, harf ve tire karakterlerine izin ver
                                    value = value.replace(/[^0-9A-Z-]/g, '');
                                    
                                    // Format kontrolü
                                    if (value.length >= 2 && !value.includes('-')) {
                                        value = value.slice(0, 2) + '-' + value.slice(2);
                                    }
                                    
                                    // Maksimum uzunluk kontrolü (2 sayı + 1 tire + 5 harf = 8 karakter)
                                    value = value.slice(0, 8);
                                    
                                    form.setFieldValue('sku', value);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="categoryId" 
                            label="Kategori" 
                            rules={[{ required: true, message: 'Lütfen kategori seçin' }]}
                        >
                            <Select placeholder="Kategori seçin" onChange={handleCategoryChange}>
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="quantity" 
                            label="Stok Miktarı" 
                            rules={[{ required: true, message: 'Lütfen stok miktarı girin' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="rackId" 
                            label="Raf" 
                            rules={[{ required: true, message: 'Lütfen raf seçin' }]}
                        >
                            <Select 
                                placeholder="Raf seçin"
                                onChange={handleRackChange}
                                loading={racks.length === 0}
                            >
                                {racks.map(rack => (
                                    <Select.Option key={rack.id} value={rack.id}>
                                        Raf {rack.position}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="cellId" 
                            label="Hücre" 
                            rules={[{ required: true, message: 'Lütfen hücre seçin' }]}
                        >
                            <Select 
                                placeholder={selectedRack ? "Hücre seçin" : "Önce raf seçin"}
                                disabled={!selectedRack || cells.length === 0}
                                loading={selectedRack && cells.length === 0}
                            >
                                {cells.map(cell => (
                                    <Select.Option 
                                        key={cell.id} 
                                        value={cell.id}
                                        disabled={cell.isOccupied}
                                    >
                                        <Tooltip title={cell.isOccupied ? 'Bu hücre dolu' : `Konum: ${cell.code}`}>
                                            {cell.code}
                                            {cell.isOccupied ? ' (Dolu)' : ' (Boş)'}
                                        </Tooltip>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item 
                            name="minStockLevel" 
                            label="Minimum Stok" 
                            rules={[{ required: true, message: 'Lütfen minimum stok seviyesi girin' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item 
                            name="maxStockLevel" 
                            label="Maksimum Stok" 
                            rules={[{ required: true, message: 'Lütfen maksimum stok seviyesi girin' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item 
                            name="weight" 
                            label="Ağırlık (kg)" 
                            rules={[{ required: true, message: 'Lütfen ürün ağırlığını girin' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                min={0} 
                                precision={2}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={16}>
                        <Row gutter={8}>
                            <Col span={8}>
                                <Form.Item 
                                    name="width" 
                                    label="En (cm)" 
                                    rules={[{ required: true, message: 'Lütfen ürün enini girin' }]}
                                >
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        min={0} 
                                        precision={2}
                                        placeholder="Örn: 50.5"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item 
                                    name="height" 
                                    label="Boy (cm)" 
                                    rules={[{ required: true, message: 'Lütfen ürün boyunu girin' }]}
                                >
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        min={0} 
                                        precision={2}
                                        placeholder="Örn: 120.5"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item 
                                    name="length" 
                                    label="Derinlik (cm)" 
                                    rules={[{ required: true, message: 'Lütfen ürün derinliğini girin' }]}
                                >
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        min={0} 
                                        precision={2}
                                        placeholder="Örn: 60.5"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item 
                            name="dailyStorageRate" 
                            label="Günlük Depolama Ücreti (TL)"
                            tooltip="Kategori seçimine göre otomatik belirlenir"
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                min={0} 
                                precision={2}
                                disabled
                                formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/₺\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item 
                            name="price" 
                            label="Toplam Depolama Ücreti (TL)" 
                            tooltip="Bu ücret otomatik olarak hesaplanır"
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                min={0} 
                                precision={2}
                                disabled
                                formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/₺\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="storageStartDate" 
                            label="Depolama Başlangıç Tarihi"
                            rules={[{ required: true, message: 'Lütfen depolama başlangıç tarihini seçin' }]}
                        >
                            <DatePicker 
                                style={{ width: '100%' }} 
                                format="YYYY-MM-DD"
                                placeholder="Depolama başlangıç tarihi seçin"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="expectedStorageDuration" 
                            label="Beklenen Depolama Süresi (Gün)"
                            rules={[{ required: true, message: 'Lütfen beklenen depolama süresini girin' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                min={1}
                                placeholder="Örn: 30"
                                onChange={handleStorageDurationChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item 
                    name="company" 
                    label="Şirket"
                    rules={[{ required: true, message: 'Lütfen şirket adı girin' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item 
                    name="description" 
                    label="Açıklama"
                >
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