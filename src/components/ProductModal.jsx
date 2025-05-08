import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, Space, Button, Select, DatePicker, Tooltip, Divider } from 'antd';
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
        setLoading(true); // Hücreleri yüklerken loading state'ini aktif et
        setCells([]); // Önceki hücreleri temizle
        try {
            const selectedRackInfo = racks.find(rack => rack.id === rackId);
            if (!selectedRackInfo) {
                console.error('Seçilen raf bulunamadı:', rackId);
                toast.error('Seçilen raf bilgisi alınamadı');
                return;
            }

            console.log(`[fetchCells] Fetching cells for rack position: ${selectedRackInfo.position}`);
            const response = await axios.get(`http://localhost:3000/api/locations/racks/${selectedRackInfo.position}/cells`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('[fetchCells] Raw API Response:', response.data); // Tüm yanıtı logla

            if (response.data.success) {
                const fetchedCells = response.data.data || [];
                setCells(fetchedCells);
                
                // İLGİLİ HÜCREYİ BUL VE LOGLA (Raf 1, Kat 1, Poz 3)
                if (selectedRackInfo.position === 1) { // Sadece Raf 1 için
                    const targetCell = fetchedCells.find(cell => cell.level === 1 && cell.position === 3);
                    if (targetCell) {
                        console.log('[fetchCells] DETAILED LOG FOR R1-L1-P3:', JSON.stringify(targetCell, null, 2));
                    } else {
                         console.log('[fetchCells] R1-L1-P3 cell not found in response.');
                    }
                }
                
            } else {
                toast.error('Hücre verisi alınamadı: ' + response.data.message);
                setCells([]);
            }
        } catch (error) {
            console.error('Hücreler yüklenirken hata:', error);
            toast.error('Hücreler yüklenirken bir hata oluştu.');
            setCells([]);
        } finally {
             setLoading(false); // Yükleme tamamlandı
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
            console.log("[Modal Effect] Opened. Mode:", mode, "InitialData:", initialData); // Loglama
            if (mode === 'edit' && initialData) {
                try {
                    // Düzenleme modunda formu doldur
                const formData = {
                        // Doğrudan initialData'dan alınabilecek alanlar
                        name: initialData.name || '',
                        sku: initialData.sku || '',
                        description: initialData.description || '',
                        company: initialData.company || '',
                        quantity: initialData.quantity ?? 0,
                        minStockLevel: initialData.minStockLevel ?? 5,
                        maxStockLevel: initialData.maxStockLevel ?? 100,
                        weight: initialData.weight ?? 0,
                        palletType: initialData.palletType || 'full', // Varsayılan değer
                        expectedStorageDuration: initialData.expectedStorageDuration || 30,
                        // Başlangıçta API'den gelen fiyat ve ücreti kullan
                        price: initialData.price ?? undefined,
                        dailyStorageRate: initialData.dailyStorageRate ?? undefined,
                        
                        // Özel işlem gerektiren alanlar
                        categoryId: initialData.Category?.id || initialData.categoryId, 
                        storageStartDate: initialData.storageStartDate ? dayjs(initialData.storageStartDate) : null,
                        
                        // rackId ve cellId aşağıda ayrıca set edilecek
                    };

                    console.log("[Modal Effect] Prepared formData:", formData); // Loglama
                    form.setFieldsValue(formData); // Formun çoğunu doldur

                    // Lokasyon bilgilerini ayarla (eğer varsa)
                    const locationId = initialData.locationId;
                    const locationData = initialData.Location; // Nested Location objesi
                    const rackId = locationData?.rackId; // Location objesinden rackId

                    console.log("[Modal Effect] Location Info:", { locationId, rackId, locationData }); // Loglama

                    if (locationId && rackId) {
                        // Rafı seçili hale getir
                        form.setFieldsValue({ rackId: rackId });
                        setSelectedRack(rackId); // State'i güncelle
                        console.log(`[Modal Effect] Set rackId: ${rackId}. Fetching cells...`); // Loglama

                        // Hücreleri yükle ve sonra hücreyi seç
                        fetchCells(rackId).then(() => {
                            console.log(`[Modal Effect] Cells fetched for rack ${rackId}. Setting cellId: ${locationId}`); // Loglama
                            setTimeout(() => {
                                form.setFieldsValue({ cellId: locationId });
                                console.log(`[Modal Effect] Set cellId: ${locationId}`); // Loglama
                            }, 150); // Gecikme
                        }).catch(err => {
                            console.error("[Modal Effect] Error fetching cells during edit:", err);
                        });
            } else {
                        // Lokasyon yoksa temizle
                        console.log("[Modal Effect] No location found, clearing location fields."); // Loglama
                        form.setFieldsValue({ rackId: undefined, cellId: undefined });
                        setSelectedRack(null);
                        setCells([]);
                    }

                } catch (e) {
                    console.error("[Modal Effect] Error processing initialData:", e); // Loglama
                    toast.error("Ürün bilgileri yüklenirken bir hata oluştu.");
                    form.resetFields();
                }

            } else { // Ekleme modu
                console.log("[Modal Effect] Add mode, resetting form."); // Loglama
                form.resetFields();
                form.setFieldsValue({ // Varsayılanlar
                    storageStartDate: dayjs(),
                    expectedStorageDuration: 30,
                    minStockLevel: 5,
                    maxStockLevel: 100,
                    palletType: 'full' 
                });
                setSelectedRack(null);
                setCells([]);
            }
        }
    }, [visible, initialData, form, mode]); // Bağımlılıklar

    // Kategori değiştiğinde SKU placeholder'ını güncelle
    const handleCategoryChange = async (value) => {
        try {
            // SKU placeholder güncelleme
            const selectedCategory = categories.find(cat => cat.id === value);
            const categoryCode = selectedCategory ? selectedCategory.code || value : value; // Kategori kodu varsa kullan, yoksa ID
            
            form.setFields([{
                name: 'sku',
                value: form.getFieldValue('sku'), // Mevcut değeri koru
                errors: [],
                validating: false,
                touched: false,
                placeholder: `${categoryCode}-XXXXX` // Placeholder'ı categoryCode ile güncelle
            }]);

            // Seçilen kategorinin günlük depolama ücretini al
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
            
            const weight = parseFloat(values.weight) || 0;
            let weightCategory = 'Hafif';
            if (weight > 750) weightCategory = 'Ağır';
            else if (weight >= 250) weightCategory = 'Normal';

            const formattedValues = {
                name: values.name,
                sku: values.sku,
                description: values.description,
                company: values.company,
                quantity: parseInt(values.quantity) || 0,
                minStockLevel: parseInt(values.minStockLevel) || 0,
                maxStockLevel: parseInt(values.maxStockLevel) || 0,
                weight: weight,
                categoryId: parseInt(values.categoryId),
                storageStartDate: values.storageStartDate ? values.storageStartDate.format('YYYY-MM-DD') : null,
                expectedStorageDuration: parseInt(values.expectedStorageDuration) || 30,
                createdBy: parseInt(localStorage.getItem('userId')) || 1,
                dailyStorageRate: parseFloat(values.dailyStorageRate) || 0,
                price: parseFloat(values.price) || 0,
                palletType: values.palletType,
                weightCategory: weightCategory
            };

            // Lokasyon ID'sini koşullu ekle
            if (values.cellId) {
                formattedValues.locationId = parseInt(values.cellId);
            } else if (mode === 'edit' && initialData?.locationId) {
                formattedValues.locationId = initialData.locationId;
            } else {
                 formattedValues.locationId = null;
            }
            
            // API isteği
            if (mode === 'edit' && initialData?.id) {
                await onSubmit(initialData.id, formattedValues);
            } else {
                await onSubmit(formattedValues);
            }

            form.resetFields();
            onCancel();

        } catch (errorInfo) {
            console.log('Form doğrulama hatası:', errorInfo);
            toast.error('Lütfen tüm gerekli alanları doğru şekilde doldurun.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={mode === 'edit' ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            open={visible} // 'open' prop'unu kullan
            onCancel={onCancel}
            footer={null} // Footer'ı kaldırıyoruz, kendi butonlarımızı kullanacağız
            width={800} // Genişlik ayarı
            destroyOnClose // Kapatıldığında formu sıfırla
            maskClosable={false} // Dışarı tıklayarak kapatmayı engelle
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit} // onFinish ile formu gönder
            >
                <Row gutter={16}>
                    {/* Sol Sütun */}
                    <Col span={12}>
                        <Form.Item 
                            name="name" 
                            label="Ürün Adı" 
                            rules={[{ required: true, message: 'Lütfen ürün adını girin' }]}
                        >
                            <Input placeholder="Örn: Akıllı Telefon X1" />
                        </Form.Item>
                        
                        <Form.Item
                            name="categoryId"
                            label="Kategori"
                            rules={[{ required: true, message: 'Lütfen bir kategori seçin' }]}
                        >
                            <Select placeholder="Kategori Seçin" onChange={handleCategoryChange}>
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item 
                            name="sku" 
                            label="SKU (Stok Kodu)"
                            rules={[
                                { required: true, message: 'Lütfen SKU girin' },
                                {
                                    // XX-YYYYY formatı: 2 rakam, tire, 5 büyük harf
                                    pattern: /^\d{2}-[A-Z]{5}$/,
                                    message: 'SKU formatı "XX-YYYYY" şeklinde olmalıdır (Örn: 12-ABCDE)'
                                }
                            ]}
                            help="Kategori seçtikten sonra format önerisi gösterilir."
                        >
                            <Input 
                                 placeholder="Örn: 12-ABCDE" 
                                style={{ textTransform: 'uppercase' }}
                                onChange={(e) => {
                                    let value = e.target.value.toUpperCase();
                                     // Sadece sayı, büyük harf ve tire karakterlerine izin ver
                                    value = value.replace(/[^0-9A-Z-]/g, '');
                                    
                                     // Otomatik tire ekleme (eğer 2. karakterden sonra tire yoksa)
                                     if (value.length > 2 && value.charAt(2) !== '-') {
                                        value = value.slice(0, 2) + '-' + value.slice(2);
                                    }
                                    
                                    // Maksimum uzunluk kontrolü (2 sayı + 1 tire + 5 harf = 8 karakter)
                                    value = value.slice(0, 8);
                                    
                                     // Form alanını güncelle
                                    form.setFieldValue('sku', value);
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="company"
                            label="Şirket İsmi"
                            rules={[{ required: true, message: 'Lütfen şirket adını girin' }]}
                        >
                            <Input placeholder="Tedarikçi veya Müşteri Şirket Adı" />
                        </Form.Item>

                        <Form.Item 
                            name="description"
                            label="Açıklama"
                            // Açıklama zorunlu değil
                        >
                            <Input.TextArea rows={3} placeholder="Ürün hakkında kısa bilgi" />
                        </Form.Item>
                    </Col>

                    {/* Sağ Sütun */}
                    <Col span={12}>
                        <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            name="quantity" 
                            label="Stok Miktarı" 
                                    rules={[{ required: true, type: 'number', min: 0, message: 'Geçerli bir miktar girin' }]}
                        >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                                </Form.Item>
                            </Col>
                             <Col span={12}>
                                <Form.Item
                                    name="palletType"
                                    label="Palet Tipi"
                                    rules={[{ required: true, message: 'Palet tipini seçin' }]}
                                >
                                    <Select placeholder="Palet Tipi Seçin">
                                        <Select.Option value="full">Tam Palet</Select.Option>
                                        <Select.Option value="half">Yarım Palet</Select.Option>
                                    </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                                <Form.Item
                                    name="minStockLevel"
                                    label="Min. Stok Seviyesi"
                                    rules={[{ required: true, type: 'number', min: 0, message: 'Geçerli bir seviye girin' }]}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Örn: 5" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="maxStockLevel"
                                    label="Max. Stok Seviyesi"
                                    rules={[{ required: true, type: 'number', min: 0, message: 'Geçerli bir seviye girin' }]}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Örn: 100" />
                                </Form.Item>
                            </Col>
                        </Row>
                       
                        <Form.Item
                            name="weight"
                            label="Ağırlık (kg)"
                            rules={[{ required: true, type: 'number', min: 0, message: 'Geçerli bir ağırlık girin' }]}
                        >
                             <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Örn: 1.5" />
                        </Form.Item>

                        {/* Lokasyon Seçimi - Zorunlu DEĞİL */}
                        <Form.Item 
                            name="rackId" 
                            label="Raf" 
                            // rules={[{ required: mode === 'edit', message: 'Düzenleme modunda raf seçimi zorunludur' }]} // Raf artık zorunlu değil
                        >
                            <Select placeholder="Raf Seçin (Opsiyonel)" onChange={handleRackChange} allowClear>
                                {racks.map(rack => (
                                    <Select.Option key={rack.id} value={rack.id}>Raf {rack.position}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Hücre Seçimi - Palet tipine göre filtrelenir */}
                        <Form.Item 
                            label="Hücre"
                            name="cellId" 
                            dependencies={['palletType']} // Palet tipine bağımlı
                        >
                            <Select 
                                placeholder={selectedRack ? "Hücre Seçin (Opsiyonel)" : "Önce Raf Seçin"} 
                                disabled={!selectedRack || cells.length === 0}
                                allowClear
                                loading={selectedRack && cells.length === 0} // Raf seçili ama hücreler yükleniyorsa
                            >
                                {cells.map(cell => {
                                    const selectedPalletType = form.getFieldValue('palletType'); 
                                    const requiredCapacity = selectedPalletType === 'half' ? 1 : 2; 
                                    // totalCapacity undefined ise 2 varsayalım
                                    const totalCapacity = cell.totalCapacity ?? 2; 
                                    const usedCapacity = cell.usedCapacity ?? 0; // usedCapacity undefined ise 0 varsayalım
                                    const availableCapacity = totalCapacity - usedCapacity;
                                    const canFit = availableCapacity >= requiredCapacity;
                                    
                                    let capacityText = `(${usedCapacity}/${totalCapacity})`;
                                    if (availableCapacity === totalCapacity) capacityText += ' (Boş)';
                                    else if (availableCapacity > 0) capacityText += ' (Yarı Dolu)';
                                    else capacityText += ' (Dolu)';

                                    // === DETAILED LOG FOR DEBUGGING ===
                                    if (cell.code === 'R02-1-2') { // Sadece ilgili hücre için logla
                                        console.log(`[Cell Select Debug R02-1-2]:`, {
                                            cellId: cell.id,
                                            cellCode: cell.code,
                                            cellUsedCapacity: usedCapacity,
                                            cellTotalCapacity: totalCapacity,
                                            selectedPalletType: selectedPalletType,
                                            requiredCapacity: requiredCapacity,
                                            availableCapacity: availableCapacity,
                                            canFit: canFit,
                                            isDisabled: !canFit
                                        });
                                    }
                                    // ===================================

                                    return (
                                    <Select.Option 
                                        key={cell.id} 
                                        value={cell.id}
                                            disabled={!canFit} // canFit false ise disable et
                                        >
                                            {/* Hücre Kodunu göster (varsa) veya Level/Position */}
                                            {cell.code ? cell.code : `Kat ${cell.level} - Poz ${cell.position}`} 
                                            {capacityText}
                                            {!canFit && ` (Yetersiz Kapasite)`} 
                                    </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider>Depolama Bilgileri</Divider>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item 
                             name="storageStartDate"
                             label="Depolama Başlangıç Tarihi"
                             rules={[{ required: true, message: 'Başlangıç tarihi seçin' }]}
                        >
                             <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item 
                            name="expectedStorageDuration"
                            label="Planlanan Depolama Süresi (Gün)"
                            rules={[{ required: true, type: 'number', min: 1, message: 'Geçerli bir süre girin (min 1 gün)' }]}
                            initialValue={30}
                        >
                            <InputNumber 
                                min={1} 
                                style={{ width: '100%' }} 
                                placeholder="Örn: 90" 
                                onChange={handleStorageDurationChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                         <Tooltip title="Kategori ve süreye göre otomatik hesaplanır">
                        <Form.Item 
                                 name="dailyStorageRate"
                                 label="Günlük Depolama Ücreti (₺)"
                                 rules={[{ required: true, type: 'number', min: 0, message: 'Geçerli bir ücret girin' }]}
                        >
                                 <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Örn: 1.50" disabled />
                        </Form.Item>
                         </Tooltip>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Tooltip title="Toplam ücret = (Günlük Ücret * Süre) - İndirimler">
                        <Form.Item 
                                name="price"
                                label="Tahmini Toplam Depolama Ücreti (₺)"
                                rules={[{ required: true, type: 'number', min: 0, message: 'Geçerli bir fiyat girin' }]}
                        >
                            <InputNumber 
                                    min={0} 
                                    step={0.01} 
                                style={{ width: '100%' }} 
                                    placeholder="Kategori ve süreye göre hesaplanır" 
                                    disabled 
                                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/₺\s?|(\,*)/g, '')} 
                            />
                        </Form.Item>
                        </Tooltip>
                    </Col>
                </Row>


                {/* Form Butonları */}
                <Row justify="end" style={{ marginTop: 24 }}>
                    <Space>
                        <Button onClick={onCancel} disabled={loading}>
                            İptal
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {mode === 'edit' ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
                        </Button>
                    </Space>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProductModal; 