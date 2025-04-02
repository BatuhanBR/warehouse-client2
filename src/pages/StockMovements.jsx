import React, { useState, useEffect } from 'react';
import { Table, Button, Select, DatePicker, Space, Row, Col, Card, Statistic, Input } from 'antd';
import { MdAdd, MdFilterList } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import dayjs from 'dayjs';
import StockMovementModal from '../components/StockMovementModal';
import * as XLSX from 'xlsx';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, PrinterOutlined } from '@ant-design/icons';

const StockMovements = () => {
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-4">Stok Hareketleri</h1>
                
                {/* Filtreler */}
                <Row gutter={[16, 16]} className="mb-4">
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<MdAdd />}
                            onClick={() => setShowModal(true)}
                        >
                            Yeni Hareket
                        </Button>
                    </Col>
                    <Col>
                        <Select 
                            placeholder="İşlem Tipi"
                            style={{ width: 200 }}
                            value={filters.type}
                            onChange={(value) => handleFilterChange('type', value)}
                        >
                            <Select.Option value="all">Tümü</Select.Option>
                            <Select.Option value="IN">Giriş</Select.Option>
                            <Select.Option value="OUT">Çıkış</Select.Option>
                        </Select>
                    </Col>
                    <Col>
                        <Select
                            placeholder="Ürün Seçin"
                            style={{ width: 200 }}
                            value={filters.productId}
                            onChange={(value) => handleFilterChange('productId', value)}
                            showSearch
                            optionFilterProp="children"
                        >
                            <Select.Option value="all">Tüm Ürünler</Select.Option>
                            {products.map(product => (
                                <Select.Option key={product.id} value={product.id}>
                                    {product.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <DatePicker.RangePicker
                            style={{ width: 300 }}
                            value={filters.dateRange}
                            onChange={(dates) => handleFilterChange('dateRange', dates)}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                    <Col>
                        <Input.Search
                            placeholder="Ürün adı veya açıklama ile ara"
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            onSearch={value => setSearchText(value)}
                        />
                    </Col>
                    <Col>
                        <Button 
                            onClick={exportToExcel}
                            icon={<DownloadOutlined />}
                        >
                            Excel'e Aktar
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            onClick={handlePrint}
                            icon={<PrinterOutlined />}
                        >
                            Yazdır
                        </Button>
                    </Col>
                </Row>

                {/* İstatistikler */}
                <Row gutter={16} className="mb-4">
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Toplam Giriş"
                                value={stats.totalIn}
                                prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Toplam Çıkış"
                                value={stats.totalOut}
                                prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Net Değişim"
                                value={stats.totalIn - stats.totalOut}
                                prefix={stats.totalIn - stats.totalOut >= 0 ? 
                                    <ArrowUpOutlined style={{ color: '#52c41a' }} /> : 
                                    <ArrowDownOutlined style={{ color: '#f5222d' }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Tablo */}
                <Table 
                    columns={columns}
                    dataSource={movements}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        total: movements.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Toplam ${total} kayıt`
                    }}
                    onChange={(pagination, filters, sorter) => {
                        console.log('Table params:', { pagination, filters, sorter });
                    }}
                />

                <StockMovementModal
                    visible={showModal}
                    onCancel={() => setShowModal(false)}
                    onSubmit={handleAddMovement}
                />
            </div>
        </div>
    );
};

export default StockMovements; 