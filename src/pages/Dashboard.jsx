import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Select, Popover, List, Typography, Empty, ConfigProvider, theme as antTheme } from 'antd';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { ShopOutlined, DollarOutlined, WarningOutlined, 
         SwapOutlined, DatabaseOutlined, UserOutlined, ShoppingOutlined, AreaChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { Option } = Select;
const { Text } = Typography;
const { defaultAlgorithm, darkAlgorithm } = antTheme;

// Dark/Light mode için renk ayarları
const getColors = (isDark) => ({
    primary: isDark ? ['#1890ff', '#096dd9'] : ['#1890ff', '#096dd9'],
    success: isDark ? ['#52c41a', '#389e0d'] : ['#52c41a', '#389e0d'],
    warning: isDark ? ['#faad14', '#d48806'] : ['#faad14', '#d48806'],
    error: isDark ? ['#ff4d4f', '#cf1322'] : ['#ff4d4f', '#cf1322'],
    
    // Grafikler için
    chartColors: {
        bar: {
            'Elektronik': isDark ? '#4096ff' : '#1890ff',
            'Giyim': isDark ? '#49aa19' : '#00C49F',
            'Kozmetik': isDark ? '#d8bd14' : '#FFBB28',
            'Kitap': isDark ? '#d87a16' : '#FF8042',
            'Ev Eşyası': isDark ? '#642ab5' : '#8884d8'
        },
        pieColors: isDark ? 
            ['#4096ff', '#95de64', '#ffd666', '#ff7a45', '#b37feb'] : 
            ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
        line: isDark ? '#4096ff' : '#00C49F'
    },
    
    // Kartlar için
    cardBg: isDark ? 'rgba(30, 32, 37, 0.8)' : 'white',
    cardShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
    cardText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
    cardBorder: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
});

const Dashboard = () => {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const isDark = theme === 'dark';
    const colors = getColors(isDark);
    
    const [summaryData, setSummaryData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [monthlyMovements, setMonthlyMovements] = useState([]);
    const [totalStockStatus, setTotalStockStatus] = useState([]);
    const [warehouseOccupancy, setWarehouseOccupancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('weekly');
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [recentMovements, setRecentMovements] = useState([]);
    const [topValuedProducts, setTopValuedProducts] = useState([]);
    const [overallCategoryDistribution, setOverallCategoryDistribution] = useState([]);

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    useEffect(() => {
        fetchOverallCategoryDistribution();
    }, []);

    const fetchLowStockProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/dashboard/low-stock-products', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                setLowStockProducts(response.data.data);
            }
        } catch (error) {
            console.error('Düşük stoklu ürünler alınırken hata:', error);
            toast.error('Düşük stoklu ürünler yüklenemedi');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, trendsRes, statsRes, distributionRes, monthlyMovementsRes, totalStockStatusRes, warehouseOccupancyRes, recentMovementsRes, topValuedProductsRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/dashboard/summary?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/trends?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/product-stats?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/category-distribution?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/monthly-movements?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/total-stock-status?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/warehouse-occupancy?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/recent-movements?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/top-valued-products?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetchLowStockProducts()
            ]).catch(error => {
                console.error('API request error:', error);
                if (error.response) {
                    toast.error(`Sunucu hatası: ${error.response.data.message || 'Bilinmeyen hata'}`);
                } else if (error.request) {
                    toast.error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
                } else {
                    toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                }
                return [null, null, null, null, null, null, null, null, null];
            });

            if (summaryRes?.data?.success) {
                setSummaryData(summaryRes.data.data);
            }
            if (trendsRes?.data?.success) {
                setTrendsData(trendsRes.data.data);
            }
            if (statsRes?.data?.success) {
                setProductStats(statsRes.data.data);
            }
            if (distributionRes?.data?.success) {
                setCategoryDistribution(distributionRes.data.data);
            }
            if (monthlyMovementsRes?.data?.success) {
                setMonthlyMovements(monthlyMovementsRes.data.data);
            }
            if (totalStockStatusRes?.data?.success) {
                setTotalStockStatus(totalStockStatusRes.data.data);
            }
            if (warehouseOccupancyRes?.data?.success) {
                setWarehouseOccupancy(warehouseOccupancyRes.data.data);
            }
            if (recentMovementsRes?.data?.success) {
                setRecentMovements(recentMovementsRes.data.data);
            }
            if (topValuedProductsRes?.data?.success) {
                setTopValuedProducts(topValuedProductsRes.data.data);
            }
        } catch (error) {
            console.error('Dashboard veri hatası:', error);
            toast.error('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchOverallCategoryDistribution = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/dashboard/category-distribution?timeRange=all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                setOverallCategoryDistribution(response.data.data);
            }
        } catch (error) {
            console.error('Genel kategori dağılımı alınırken hata:', error);
            toast.error('Genel kategori dağılımı yüklenemedi');
        }
    };

    // Örnek kategori stok verileri
    const categoryStockData = [
        { name: 'Elektronik', value: 150 },
        { name: 'Giyim', value: 300 },
        { name: 'Kozmetik', value: 200 },
        { name: 'Kitap', value: 450 },
        { name: 'Ev Eşyası', value: 250 },
    ];

    // Örnek sipariş trend verileri
    const orderTrendData = [
        { date: '1/24', orders: 65 },
        { date: '2/24', orders: 85 },
        { date: '3/24', orders: 75 },
        { date: '4/24', orders: 95 },
        { date: '5/24', orders: 110 },
        { date: '6/24', orders: 90 },
        { date: '7/24', orders: 120 },
    ];

    // Örnek alan kullanım verileri
    const spaceUsageData = [
        { category: 'Elektronik', used: 150, total: 200, percentage: 75 },
        { category: 'Giyim', used: 135, total: 300, percentage: 45 },
        { category: 'Kozmetik', used: 135, total: 150, percentage: 90 },
        { category: 'Kitap', used: 120, total: 400, percentage: 30 },
        { category: 'Ev Eşyası', used: 150, total: 250, percentage: 60 },
    ];

    // Son eklenen ürünler için tablo kolonları
    const recentProductColumns = [
        {
            title: 'Ürün Adı',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Miktar',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Fiyat',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price} TL`,
        }
    ];

    // Son hareketler için tablo kolonları
    const recentMovementsColumns = [
        {
            title: 'Hareket',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'IN' ? 'green' : 'red'}>
                    {type === 'IN' ? 'Giriş' : 'Çıkış'}
                </Tag>
            ),
        },
        {
            title: 'Ürün',
            dataIndex: ['Product', 'name'],
            key: 'product',
        },
        {
            title: 'Miktar',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('tr-TR'),
        }
    ];

    const lowStockContent = (
        <List
            size="small"
            dataSource={lowStockProducts}
            renderItem={item => (
                <List.Item>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                            <Text strong>{item.name}</Text>
                            <Tag color={item.quantity === 0 ? 'red' : 'orange'}>
                                {item.quantity} / {item.minStockLevel}
                            </Tag>
                        </Space>
                        <Space size="large">
                            <Text type="secondary">SKU: {item.sku}</Text>
                            <Text type="secondary">Konum: {item.Location?.code || 'Belirsiz'}</Text>
                            <Tag color="blue">{item.Category?.name}</Tag>
                        </Space>
                    </Space>
                </List.Item>
            )}
            style={{ maxHeight: '400px', overflow: 'auto', width: '400px' }}
        />
    );

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
            Typography: {
                colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
                colorTextSecondary: isDark ? '#a6a6a6' : 'rgba(0, 0, 0, 0.45)',
            }
        }
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`p-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                {/* Başlık ve Filtre Alanı */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className={`text-2xl font-bold mb-4 sm:mb-0 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Depo Yönetim Paneli
                    </h1>
                    <div className="flex items-center">
                        <span className={`mr-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Zaman Aralığı:</span>
                        <Select 
                            value={timeRange} 
                            onChange={value => setTimeRange(value)}
                            style={{ width: 140 }}
                            className="dark:bg-gray-800"
                        >
                            <Option value="daily">Günlük</Option>
                            <Option value="weekly">Haftalık</Option>
                            <Option value="monthly">Aylık</Option>
                            <Option value="yearly">Yıllık</Option>
                            <Option value="all">Tümü</Option>
                        </Select>
                    </div>
                </div>

                {/* İçerik */}
                <div>
                    {/* İstatistik Kartları */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={8}>
                            <Card loading={loading}>
                                <Statistic
                                    title="Toplam Palet Sayısı"
                                    value={warehouseOccupancy?.totalProducts || 0}
                                    prefix={<ShopOutlined />}
                                    suffix="Palet"
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Card loading={loading}>
                                <Statistic
                                    title="Toplam Stok Değeri"
                                    value={summaryData?.stockValue}
                                    prefix={<DollarOutlined />}
                                    suffix="TL"
                                    formatter={value => {
                                        if (value) {
                                            return new Intl.NumberFormat('tr-TR').format(Number(value).toFixed(2));
                                        }
                                        return '0';
                                    }}
                                />
                                <div className="mt-2 text-sm text-gray-500">
                                    Palet Başına: {summaryData?.stockValue && warehouseOccupancy?.totalProducts ? 
                                        new Intl.NumberFormat('tr-TR').format(
                                            (summaryData.stockValue / warehouseOccupancy.totalProducts).toFixed(2)
                                        ) : '0'} TL
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Card loading={loading}>
                                <Popover 
                                    content={lowStockContent}
                                    title="Düşük Stoklu Paletler Detayı"
                                    trigger="hover"
                                    placement="bottom"
                                >
                                    <div style={{ cursor: 'pointer' }}>
                                        <Statistic
                                            title="Düşük Stoklu Paletler"
                                            value={summaryData?.lowStockProducts}
                                            prefix={<WarningOutlined />}
                                            valueStyle={{ color: '#cf1322' }}
                                            suffix="Palet"
                                        />
                                    </div>
                                </Popover>
                            </Card>
                        </Col>
                    </Row>

                    {/* Depo Doluluk Oranı */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24}>
                            <Card title="Depo Doluluk Durumu" loading={loading}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <div className="text-center mb-4">
                                            <Progress
                                                type="circle"
                                                percent={warehouseOccupancy?.occupancyRate || 0}
                                                format={percent => `${percent}%`}
                                                strokeColor={{
                                                    '0%': '#87d068',
                                                    '50%': '#faad14',
                                                    '75%': '#ff7a45',
                                                    '90%': '#f5222d'
                                                }}
                                                size={200}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                            <Card type="inner" title="Alan Kullanımı">
                                                <Row gutter={[16, 16]}>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Toplam Alan"
                                                            value={warehouseOccupancy?.totalArea || 0}
                                                            suffix="m²"
                                                            precision={1}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Kullanılan Alan"
                                                            value={warehouseOccupancy?.occupiedArea || 0}
                                                            suffix="m²"
                                                            precision={1}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Boş Alan"
                                                            value={warehouseOccupancy?.availableArea || 0}
                                                            suffix="m²"
                                                            precision={1}
                                                            valueStyle={{ color: '#3f8600' }}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <Statistic
                                                            title="Ürün Sayısı"
                                                            value={warehouseOccupancy?.totalQuantity || 0}
                                                            prefix={<ShopOutlined />}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* Ürün İstatistikleri */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24}>
                            <Card title="Ürün İstatistikleri" loading={loading}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Card type="inner" title="Fiyat İstatistikleri">
                                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                                <div>
                                                    <div className="text-gray-600 mb-1">Minimum Fiyat</div>
                                                    <div className="text-xl font-semibold">
                                                        {productStats?.price?.min || 0} TL
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">Maksimum Fiyat</div>
                                                    <div className="text-xl font-semibold">
                                                        {productStats?.price?.max || 0} TL
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">Medyan Fiyat</div>
                                                    <div className="text-xl font-semibold">
                                                        {productStats?.price?.median || 0} TL
                                                    </div>
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Card type="inner" title="Stok İstatistikleri">
                                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                                <div>
                                                    <div className="text-gray-600 mb-1">Minimum Stok</div>
                                                    <div className="text-xl font-semibold">
                                                        {productStats?.quantity?.min || 0} adet
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">Maksimum Stok</div>
                                                    <div className="text-xl font-semibold">
                                                        {productStats?.quantity?.max || 0} adet
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600 mb-1">Medyan Stok</div>
                                                    <div className="text-xl font-semibold">
                                                        {productStats?.quantity?.median || 0} adet
                                                    </div>
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* Kategori Dağılımı */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24} md={12}>
                            <Card 
                                title="Zaman Aralığına Göre Kategori Dağılımı" 
                                loading={loading}
                                className="shadow-sm"
                            >
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryDistribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {categoryDistribution.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={colors.chartColors.pieColors[index % colors.chartColors.pieColors.length]} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value, name, props) => [
                                                    <> Ürün Sayısı: {value}<br/>Toplam Ürün Geliri: {props.payload.totalValue.toLocaleString('tr-TR')} TL</>,
                                                    name
                                                ]}
                                                separator=""
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card 
                                title="Genel Kategori Dağılımı" 
                                loading={loading}
                                className="shadow-sm"
                            >
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                                            <Pie
                                                data={overallCategoryDistribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                labelLine={{ strokeWidth: 1 }}
                                            >
                                                {overallCategoryDistribution.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={colors.chartColors.pieColors[index % colors.chartColors.pieColors.length]} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value, name, props) => [
                                                    <> Ürün Sayısı: {value}<br/>Toplam Ürün Geliri: {props.payload.totalValue.toLocaleString('tr-TR')} TL</>,
                                                    name
                                                ]}
                                                separator=""
                                            />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Net Stok Değişimi */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24}>
                            <Card 
                                title="Net Stok Değişimi" 
                                loading={loading}
                                className="shadow-sm"
                            >
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyMovements}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="total" 
                                                name="Net Değişim"
                                                stroke={colors.chartColors.line} 
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Son Stok Hareketleri */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24}>
                            <Card 
                                title="Son Stok Hareketleri" 
                                loading={loading}
                                className="shadow-sm"
                            >
                                <Table
                                    dataSource={recentMovements}
                                    columns={[
                                        {
                                            title: 'Hareket',
                                            dataIndex: 'type',
                                            key: 'type',
                                            render: (type) => (
                                                <Tag color={type === 'IN' ? 'green' : 'red'}>
                                                    {type === 'IN' ? 'Giriş' : 'Çıkış'}
                                                </Tag>
                                            ),
                                        },
                                        {
                                            title: 'Ürün',
                                            dataIndex: ['product', 'name'],
                                            key: 'product',
                                        },
                                        {
                                            title: 'SKU',
                                            dataIndex: ['product', 'sku'],
                                            key: 'sku',
                                        },
                                        {
                                            title: 'Kategori',
                                            dataIndex: ['product', 'category'],
                                            key: 'category',
                                        },
                                        {
                                            title: 'Miktar',
                                            dataIndex: 'quantity',
                                            key: 'quantity',
                                        },
                                        {
                                            title: 'Lokasyon',
                                            dataIndex: 'location',
                                            key: 'location',
                                        },
                                        {
                                            title: 'İşlemi Yapan',
                                            dataIndex: 'creator',
                                            key: 'creator',
                                        },
                                        {
                                            title: 'Tarih',
                                            dataIndex: 'createdAt',
                                            key: 'createdAt',
                                            render: (date) => new Date(date).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                        }
                                    ]}
                                    pagination={false}
                                    scroll={{ x: true }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* En Değerli 5 Ürün */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24}>
                            <Card 
                                title="En Değerli 5 Ürün" 
                                loading={loading}
                                className="shadow-sm"
                            >
                                <Table
                                    dataSource={topValuedProducts}
                                    columns={[
                                        {
                                            title: 'Ürün Adı',
                                            dataIndex: 'name',
                                            key: 'name',
                                        },
                                        {
                                            title: 'SKU',
                                            dataIndex: 'sku',
                                            key: 'sku',
                                        },
                                        {
                                            title: 'Kategori',
                                            dataIndex: 'categoryName',
                                            key: 'category',
                                        },
                                        {
                                            title: 'Lokasyon',
                                            dataIndex: 'locationCode',
                                            key: 'location',
                                        },
                                        {
                                            title: 'Miktar',
                                            dataIndex: 'quantity',
                                            key: 'quantity',
                                        },
                                        {
                                            title: 'Ürün Geliri',
                                            dataIndex: 'totalValue',
                                            key: 'totalValue',
                                            render: (value, record) => {
                                                return `${parseFloat(value).toLocaleString('tr-TR')} TL`;
                                            },
                                            defaultSortOrder: 'descend',
                                            sorter: (a, b) => a.totalValue - b.totalValue,
                                        }
                                    ]}
                                    pagination={false}
                                    scroll={{ x: true }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Toplam Stok Durumu */}
                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24}>
                            <Card 
                                title="Toplam Stok Durumu" 
                                loading={loading}
                                className="shadow-sm"
                            >
                                <div style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={totalStockStatus}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Line 
                                                yAxisId="left"
                                                type="monotone" 
                                                dataKey="totalStock" 
                                                name="Toplam Ürün Sayısı"
                                                stroke={colors.chartColors.line} 
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                            <Line 
                                                yAxisId="right"
                                                type="monotone" 
                                                dataKey="palletCount" 
                                                name="Palet Sayısı"
                                                stroke={colors.chartColors.line} 
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default Dashboard; 