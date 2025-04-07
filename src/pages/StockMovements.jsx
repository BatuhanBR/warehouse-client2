import React, { useState, useEffect } from 'react';
import { Table, Button, Select, DatePicker, Space, Row, Col, Card, Statistic, Input, ConfigProvider, theme as antTheme } from 'antd';
import { MdAdd, MdFilterList } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import dayjs from 'dayjs';
import StockMovementModal from '../components/StockMovementModal';
import * as XLSX from 'xlsx';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, PrinterOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

const StockMovements = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDark = theme === 'dark';
    
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]); // Ürün listesi için
    const [locations, setLocations] = useState([]); // Lokasyon listesi için
    const [filters, setFilters] = useState({
        type: 'all',        // Giriş/Çıkış
        productId: 'all',   // Ürün bazlı filtreleme
        dateRange: [],      // Tarih aralığı
        locationId: 'all'   // Lokasyon bazlı
    });
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        totalIn: 0,
        totalOut: 0
    });
    const [searchText, setSearchText] = useState('');

    // Tablo kolonları
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
            render: (type) => type === 'IN' ? 'Giriş' : 'Çıkış'
        },
        {
            title: 'Ürün',
            dataIndex: ['Product', 'name'],
            key: 'product',
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) => {
                const productName = record.Product?.name?.toLowerCase() || '';
                const description = record.description?.toLowerCase() || '';
                const searchValue = value.toLowerCase();
                return productName.includes(searchValue) || description.includes(searchValue);
            }
        },
        {
            title: 'Miktar',
            dataIndex: 'quantity',
            key: 'quantity',
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
            key: 'description'
        }
    ];

    // Stok hareketlerini getir
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

            console.log('Fetching with params:', params.toString()); // Debug için

            const response = await axios.get(`http://localhost:3000/api/stock-movements?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                console.log('Received movements:', response.data.data); // Debug için
                setMovements(response.data.data);
                calculateStats();
            }
        } catch (error) {
            console.error('Stok hareketleri yüklenirken hata:', error);
            toast.error('Stok hareketleri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    // Ürünleri getir
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
        }
    };

    // Lokasyonları getir
    const fetchLocations = async () => {
        try {
            console.log('Lokasyon isteği yapılıyor...'); // Debug log
            console.log('Token:', localStorage.getItem('token')); // Token kontrolü

            const response = await axios.get('http://localhost:3000/api/locations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Lokasyon yanıtı:', response.data); // Debug log

            if (response.data.success) {
                setLocations(response.data.data);
            }
        } catch (error) {
            console.error('Lokasyonlar yüklenirken hata:', error.response || error);
            toast.error('Lokasyonlar yüklenemedi');
        }
    };

    // Sayfa yüklendiğinde verileri getir
    useEffect(() => {
        fetchProducts();
        fetchLocations();
    }, []);

    // Filtreler değiştiğinde verileri yeniden getir
    useEffect(() => {
        fetchMovements();
    }, [filters]);

    // Filtre değişikliklerini handle et
    const handleFilterChange = (key, value) => {
        console.log('Filter change:', key, value); // Debug için
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleAddMovement = async (values) => {
        try {
            const response = await axios.post('http://localhost:3000/api/stock-movements', values, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                toast.success('Stok hareketi başarıyla kaydedildi');
                setShowModal(false);
                fetchMovements(); // Listeyi yenile
            }
        } catch (error) {
            console.error('Stok hareketi eklenirken hata:', error);
            toast.error(error.response?.data?.message || 'Stok hareketi eklenemedi');
        }
    };

    // Excel'e aktarma fonksiyonu
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

    // İstatistikleri hesapla
    const calculateStats = () => {
        const totalIn = movements.filter(m => m.type === 'IN')
            .reduce((sum, m) => sum + m.quantity, 0);
        const totalOut = movements.filter(m => m.type === 'OUT')
            .reduce((sum, m) => sum + m.quantity, 0);
        
        setStats({ totalIn, totalOut });
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

    // Verileri getirdikten sonra istatistikleri hesapla
    useEffect(() => {
        if (movements.length > 0) {
            calculateStats();
        }
    }, [movements]);

    // Ant Design tema konfigürasyonu
    const themeConfig = {
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
        },
        components: {
            Card: {
                colorBgContainer: isDark ? 'rgba(30, 32, 37, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',
                boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
            },
            Table: {
                colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
            },
            DatePicker: {
                colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)', 
            },
            Select: {
                colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
            }
        }
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`container p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className={`text-2xl font-bold mb-4 sm:mb-0 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Stok Hareketleri
                    </h1>
                    <div className="flex items-center space-x-2">
                        <Button 
                            type="primary" 
                            icon={<MdAdd />} 
                            onClick={() => setShowModal(true)}
                            className={`${isDark ? 'bg-blue-600 border-blue-700' : 'bg-blue-500 border-blue-600'}`}
                        >
                            Yeni Hareket
                        </Button>
                        <Button 
                            icon={<PrinterOutlined />} 
                            onClick={handlePrint}
                            className={`${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                        >
                            Yazdır
                        </Button>
                        <Button 
                            icon={<DownloadOutlined />} 
                            onClick={exportToExcel}
                            className={`${isDark ? 'bg-green-700 text-white border-green-800' : 'bg-green-500 text-white border-green-600'}`}
                        >
                            Excel'e Aktar
                        </Button>
                    </div>
                </div>

                {/* İstatistik Kartları */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} md={8}>
                        <Card className={`text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <Statistic
                                title={<span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Giriş</span>}
                                value={stats.totalIn}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<ArrowUpOutlined />}
                                suffix="birim"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className={`text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <Statistic
                                title={<span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Çıkış</span>}
                                value={stats.totalOut}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<ArrowDownOutlined />}
                                suffix="birim"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className={`text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <Statistic
                                title={<span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Net Değişim</span>}
                                value={stats.totalIn - stats.totalOut}
                                valueStyle={{ color: stats.totalIn - stats.totalOut >= 0 ? '#3f8600' : '#cf1322' }}
                                prefix={stats.totalIn - stats.totalOut >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                suffix="birim"
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Filtreler */}
                <Card className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Row gutter={[16, 16]} className="mb-4">
                        <Col xs={24} sm={12} md={6} lg={5}>
                            <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                İşlem Tipi
                            </label>
                            <Select
                                style={{ width: '100%' }}
                                value={filters.type}
                                onChange={(value) => handleFilterChange('type', value)}
                                className={isDark ? 'ant-select-dark' : ''}
                            >
                                <Select.Option value="all">Tümü</Select.Option>
                                <Select.Option value="IN">Giriş</Select.Option>
                                <Select.Option value="OUT">Çıkış</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={5}>
                            <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Ürün
                            </label>
                            <Select
                                style={{ width: '100%' }}
                                value={filters.productId}
                                onChange={(value) => handleFilterChange('productId', value)}
                                className={isDark ? 'ant-select-dark' : ''}
                            >
                                <Select.Option value="all">Tüm Ürünler</Select.Option>
                                {products.map(product => (
                                    <Select.Option key={product.id} value={product.id}>
                                        {product.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={5}>
                            <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Lokasyon
                            </label>
                            <Select
                                style={{ width: '100%' }}
                                value={filters.locationId}
                                onChange={(value) => handleFilterChange('locationId', value)}
                                className={isDark ? 'ant-select-dark' : ''}
                            >
                                <Select.Option value="all">Tüm Lokasyonlar</Select.Option>
                                {locations.map(location => (
                                    <Select.Option key={location.id} value={location.id}>
                                        {location.code} (R:{location.rackNumber}, S:{location.level})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={9}>
                            <label className={`block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Tarih Aralığı
                            </label>
                            <DatePicker.RangePicker
                                style={{ width: '100%' }}
                                value={filters.dateRange}
                                onChange={(dates) => handleFilterChange('dateRange', dates)}
                                className={isDark ? 'ant-picker-dark' : ''}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24}>
                            <Input 
                                placeholder="Ürün adı veya açıklama ara..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: '100%' }}
                                prefix={<MdFilterList />}
                                className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Tablo */}
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Table 
                        columns={columns} 
                        dataSource={movements} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ 
                            position: ['bottomCenter'],
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: (total) => `Toplam ${total} kayıt`
                        }}
                        className={isDark ? 'ant-table-dark' : ''}
                    />
                </Card>

                {/* Stok Hareketi Ekleme Modalı */}
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
        </ConfigProvider>
    );
};

export default StockMovements; 