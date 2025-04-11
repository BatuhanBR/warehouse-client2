import React, { useState, useEffect } from 'react';
import { Table, Typography, Space, Button, DatePicker, Select, Row, Col, Card, Statistic, Spin, Input } from 'antd';
import { DownloadOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined, PrinterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import StockMovementModal from '../components/StockMovementModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StockMovements = () => {
    // Context hooks
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useLanguage();

    // State
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [stats, setStats] = useState({
        totalIn: 0,
        totalOut: 0
    });
    
    // Filters
    const [filters, setFilters] = useState({
        type: 'all',
        productId: 'all',
        dateRange: [],
        locationId: 'all'
    });
    
    // Hareket verilerini getir
    const fetchMovements = async () => {
        try {
            setLoading(true);
            
            // Query parametrelerini oluştur
            const params = new URLSearchParams();
            if (filters.type && filters.type !== 'all') {
                params.append('type', filters.type);
            }
            if (filters.productId && filters.productId !== 'all') {
                params.append('productId', filters.productId);
            }
            if (filters.locationId && filters.locationId !== 'all') {
                params.append('locationId', filters.locationId);
            }
            if (filters.dateRange?.length === 2) {
                params.append('startDate', filters.dateRange[0].format('YYYY-MM-DD'));
                params.append('endDate', filters.dateRange[1].format('YYYY-MM-DD'));
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/stock-movements?${params.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.success) {
                    setMovements(response.data.data || []);
                }
            } catch (error) {
                console.error('API çağrısı başarısız:', error);
                
                // API bağlantısı başarısız olduğunda mock veri oluştur
                generateMockData();
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Stok hareketleri yüklenirken hata:', error);
            toast.error('Stok hareketleri yüklenemedi');
            
            // Yedek olarak mock veri oluştur
            generateMockData();
            
            setLoading(false);
        }
    };
    
    // Mock veri oluşturma
    const generateMockData = () => {
        // Örnek ürünler
        const mockProducts = [
            { id: '101', name: 'Laptop' },
            { id: '102', name: 'Telefon' },
            { id: '103', name: 'Kulaklık' },
            { id: '104', name: 'Klavye' },
            { id: '105', name: 'Mouse' }
        ];
        
        // Örnek lokasyonlar
        const mockLocations = [
            { id: 'loc1', code: 'A1', rackNumber: 1, level: 1, position: 1 },
            { id: 'loc2', code: 'A2', rackNumber: 1, level: 2, position: 1 },
            { id: 'loc3', code: 'B1', rackNumber: 2, level: 1, position: 1 },
            { id: 'loc4', code: 'B2', rackNumber: 2, level: 2, position: 1 }
        ];
        
        // Stok hareketleri mock verisi
        const mockMovements = [];
        const types = ['IN', 'OUT'];
        const now = new Date();
        
        for (let i = 0; i < 20; i++) {
            const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
            const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const randomDaysAgo = Math.floor(Math.random() * 30);
            const movementDate = new Date(now);
            movementDate.setDate(movementDate.getDate() - randomDaysAgo);
            
            mockMovements.push({
                id: `mov_${i}`,
                type: randomType,
                quantity: Math.floor(Math.random() * 100) + 1,
                createdAt: movementDate.toISOString(),
                description: `${randomType === 'IN' ? 'Giriş' : 'Çıkış'} işlemi ${randomDaysAgo} gün önce`,
                Product: randomProduct,
                Location: randomLocation
            });
        }
        
        setProducts(mockProducts);
        setLocations(mockLocations);
        setMovements(mockMovements);
    };
    
    // İlk yükleme
    useEffect(() => {
        fetchProducts();
        fetchLocations();
        fetchMovements();
    }, []);
    
    // Filtreler değiştiğinde yeniden yükle
    useEffect(() => {
        fetchMovements();
    }, [filters]);
    
    // Ürünleri getir
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setProducts(response.data.data || []);
            }
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
            // Fallback olarak mock veri kullan
            setProducts([
                { id: '101', name: 'Laptop' },
                { id: '102', name: 'Telefon' },
                { id: '103', name: 'Kulaklık' },
                { id: '104', name: 'Klavye' },
                { id: '105', name: 'Mouse' }
            ]);
        }
    };
    
    // Lokasyonları getir
    const fetchLocations = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/locations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setLocations(response.data.data || []);
            }
        } catch (error) {
            console.error('Lokasyonlar yüklenirken hata:', error);
            // Fallback olarak mock veri kullan
            setLocations([
                { id: 'loc1', code: 'A1', rackNumber: 1, level: 1, position: 1 },
                { id: 'loc2', code: 'A2', rackNumber: 1, level: 2, position: 1 },
                { id: 'loc3', code: 'B1', rackNumber: 2, level: 1, position: 1 },
                { id: 'loc4', code: 'B2', rackNumber: 2, level: 2, position: 1 }
            ]);
        }
    };
    
    // Filtre değişikliklerini izle
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    // Stok hareketi ekle
    const handleAddMovement = async (values) => {
        try {
            setLoading(true);
            
            const response = await axios.post('http://localhost:3000/api/stock-movements', values, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                toast.success('Stok hareketi başarıyla kaydedildi');
                setShowModal(false);
                fetchMovements();
            } else {
                toast.error(response.data.message || 'Stok hareketi eklenemedi');
            }
        } catch (error) {
            console.error('Stok hareketi eklenirken hata:', error);
            toast.error(error.response?.data?.message || 'Stok hareketi eklenemedi');
        } finally {
            setLoading(false);
        }
    };
    
    // İstatistikleri hesapla
    const calculateStats = () => {
        const totalIn = movements.filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.quantity, 0);
        const totalOut = movements.filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.quantity, 0);
        
        setStats({ totalIn, totalOut });
    };
    
    // Verileri getirdikten sonra istatistikleri hesapla
    useEffect(() => {
        if (movements.length > 0) {
            calculateStats();
        }
    }, [movements]);
    
    // Excel'e aktarma
    const exportToExcel = () => {
        const data = movements.map(item => ({
            'Tarih': new Date(item.createdAt).toLocaleString('tr-TR'),
            'İşlem Tipi': item.type === 'IN' ? 'Giriş' : 'Çıkış',
            'Ürün': item.Product?.name,
            'Miktar': item.quantity,
            'Lokasyon': item.Location?.code,
            'Açıklama': item.description
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stok Hareketleri");
        XLSX.writeFile(wb, "stok-hareketleri.xlsx");
    };
    
    // Yazdırma fonksiyonu
    const handlePrint = () => {
        const printContent = movements.map(item => `
            Tarih: ${new Date(item.createdAt).toLocaleString('tr-TR')}
            İşlem: ${item.type === 'IN' ? 'Giriş' : 'Çıkış'}
            Ürün: ${item.Product?.name}
            Miktar: ${item.quantity}
            Lokasyon: ${item.Location?.code}
            Açıklama: ${item.description}
            ------------------------
        `).join('\n');

        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`<pre>${printContent}</pre>`);
        win.print();
        win.close();
    };
    
    // Filtreleme sonrası veri
    const filteredMovements = movements.filter(movement => {
        if (searchText) {
            const productName = movement.Product?.name?.toLowerCase() || '';
            const description = movement.description?.toLowerCase() || '';
            const searchValue = searchText.toLowerCase();
            
            return productName.includes(searchValue) || description.includes(searchValue);
        }
        return true;
    });
    
    // Tablo sütunları
    const columns = [
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString('tr-TR'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: 'descend'
        },
        {
            title: 'İşlem Tipi',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const isIncoming = type === 'IN';
                return (
                    <span style={{ 
                        color: isIncoming ? '#52c41a' : '#f5222d',
                        fontWeight: 'bold'
                    }}>
                        {isIncoming ? 'Giriş' : 'Çıkış'}
                    </span>
                );
            }
        },
        {
            title: 'Ürün',
            dataIndex: ['Product', 'name'],
            key: 'product',
            render: (text) => <Text strong style={{ color: isDark ? '#e5e7eb' : undefined }}>{text}</Text>
        },
        {
            title: 'Miktar',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => {
                const style = { 
                    color: record.type === 'IN' ? '#52c41a' : '#f5222d',
                    fontWeight: 'bold'
                };
                return <span style={style}>{record.type === 'IN' ? '+' : '-'}{quantity}</span>;
            },
            sorter: (a, b) => a.quantity - b.quantity
        },
        {
            title: 'Lokasyon',
            dataIndex: ['Location', 'code'],
            key: 'location',
            render: (text, record) => record.Location ? 
                `${record.Location.code} - Raf ${record.Location.rackNumber}, Seviye ${record.Location.level}` : '-'
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <Text type="secondary" style={{ color: isDark ? '#9ca3af' : undefined }}>{text}</Text>
        }
    ];
    
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Title level={2} style={{ margin: 0, color: isDark ? '#f3f4f6' : undefined }}>
                                Stok Hareketleri
                            </Title>
                            <Text type="secondary" style={{ color: isDark ? '#9ca3af' : undefined }}>
                                Stok giriş-çıkış hareketlerini takip edin
                            </Text>
                        </Space>
                    </Col>
                    <Col xs={24} lg={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Space>
                            <Button 
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setShowModal(true)}
                            >
                                Yeni Hareket
                            </Button>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={fetchMovements}
                            >
                                Yenile
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>
            
            {/* İstatistik kartları */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card style={{ 
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        borderColor: isDark ? '#374151' : undefined
                    }}>
                        <Statistic 
                            title={<Text style={{ color: isDark ? '#9ca3af' : undefined }}>Toplam Giriş</Text>}
                            value={stats.totalIn} 
                            valueStyle={{ color: isDark ? '#10b981' : '#52c41a' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ 
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        borderColor: isDark ? '#374151' : undefined
                    }}>
                        <Statistic 
                            title={<Text style={{ color: isDark ? '#9ca3af' : undefined }}>Toplam Çıkış</Text>}
                            value={stats.totalOut} 
                            valueStyle={{ color: isDark ? '#ef4444' : '#f5222d' }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ 
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        borderColor: isDark ? '#374151' : undefined
                    }}>
                        <Statistic 
                            title={<Text style={{ color: isDark ? '#9ca3af' : undefined }}>Net Değişim</Text>}
                            value={stats.totalIn - stats.totalOut} 
                            valueStyle={{ 
                                color: stats.totalIn - stats.totalOut >= 0 
                                    ? (isDark ? '#10b981' : '#52c41a') 
                                    : (isDark ? '#ef4444' : '#f5222d') 
                            }}
                            prefix={stats.totalIn - stats.totalOut >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
            
            {/* Filtreler */}
            <Card 
                style={{ 
                    marginBottom: 24,
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    borderColor: isDark ? '#374151' : undefined
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Text style={{ display: 'block', marginBottom: 8, color: isDark ? '#d1d5db' : undefined }}>
                            İşlem Tipi:
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            value={filters.type}
                            onChange={(value) => handleFilterChange('type', value)}
                            dropdownStyle={{ backgroundColor: isDark ? '#1f2937' : undefined }}
                        >
                            <Option value="all">Tümü</Option>
                            <Option value="IN">Giriş</Option>
                            <Option value="OUT">Çıkış</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Text style={{ display: 'block', marginBottom: 8, color: isDark ? '#d1d5db' : undefined }}>
                            Ürün:
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            value={filters.productId}
                            onChange={(value) => handleFilterChange('productId', value)}
                            showSearch
                            optionFilterProp="children"
                            dropdownStyle={{ backgroundColor: isDark ? '#1f2937' : undefined }}
                        >
                            <Option value="all">Tüm Ürünler</Option>
                            {products.map(product => (
                                <Option key={product.id} value={product.id}>{product.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Text style={{ display: 'block', marginBottom: 8, color: isDark ? '#d1d5db' : undefined }}>
                            Lokasyon:
                        </Text>
                        <Select
                            style={{ width: '100%' }}
                            value={filters.locationId}
                            onChange={(value) => handleFilterChange('locationId', value)}
                            showSearch
                            optionFilterProp="children"
                            dropdownStyle={{ backgroundColor: isDark ? '#1f2937' : undefined }}
                        >
                            <Option value="all">Tüm Lokasyonlar</Option>
                            {locations.map(location => (
                                <Option key={location.id} value={location.id}>
                                    {location.code} (R:{location.rackNumber}, S:{location.level})
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Text style={{ display: 'block', marginBottom: 8, color: isDark ? '#d1d5db' : undefined }}>
                            Tarih Aralığı:
                        </Text>
                        <RangePicker 
                            style={{ width: '100%' }}
                            value={filters.dateRange}
                            onChange={(dates) => handleFilterChange('dateRange', dates)}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                    <Col xs={24}>
                        <Input 
                            placeholder="Ürün adı veya açıklama ile ara"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ 
                                backgroundColor: isDark ? '#1f2937' : undefined,
                                borderColor: isDark ? '#374151' : undefined,
                                color: isDark ? '#f3f4f6' : undefined
                            }}
                        />
                    </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                    <Col>
                        <Space>
                            <Button 
                                onClick={exportToExcel}
                                icon={<DownloadOutlined />}
                            >
                                Excel'e Aktar
                            </Button>
                            <Button 
                                onClick={handlePrint}
                                icon={<PrinterOutlined />}
                            >
                                Yazdır
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
            
            {/* Veri tablosu */}
            <Card
                style={{ 
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    borderColor: isDark ? '#374151' : undefined
                }}
            >
                <Spin spinning={loading}>
                    <Table 
                        columns={columns} 
                        dataSource={filteredMovements}
                        rowClassName={isDark ? 'dark-table-row' : ''}
                        pagination={{ 
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total) => `Toplam: ${total} kayıt`
                        }} 
                        rowKey="id"
                    />
                </Spin>
            </Card>
            
            {/* Stok Hareketi Ekle Modal */}
            {showModal && (
                <StockMovementModal
                    visible={showModal}
                    onCancel={() => setShowModal(false)}
                    onSubmit={handleAddMovement}
                    products={products}
                    locations={locations}
                    isDark={isDark}
                />
            )}
        </div>
    );
};

export default StockMovements; 