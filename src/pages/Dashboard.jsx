import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Select } from 'antd';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { ShopOutlined, DollarOutlined, WarningOutlined, 
         SwapOutlined, DatabaseOutlined, UserOutlined, ShoppingOutlined, AreaChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const { Option } = Select;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CHART_COLORS = {
    bar: {
        'Elektronik': '#1890ff',
        'Giyim': '#00C49F',
        'Kozmetik': '#FFBB28',
        'Kitap': '#FF8042',
        'Ev Eşyası': '#8884d8'
    },
    line: '#00C49F'
};

const Dashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [productStats, setProductStats] = useState(null);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [monthlyMovements, setMonthlyMovements] = useState([]);
    const [totalStockStatus, setTotalStockStatus] = useState([]);
    const [warehouseOccupancy, setWarehouseOccupancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('weekly');

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, trendsRes, statsRes, distributionRes, monthlyMovementsRes, totalStockStatusRes, warehouseOccupancyRes] = await Promise.all([
                axios.get('http://localhost:3000/api/dashboard/summary', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/trends?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('http://localhost:3000/api/dashboard/product-stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('http://localhost:3000/api/dashboard/category-distribution', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/monthly-movements?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/total-stock-status?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('http://localhost:3000/api/dashboard/warehouse-occupancy', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]).catch(error => {
                console.error('API request error:', error);
                if (error.response) {
                    toast.error(`Sunucu hatası: ${error.response.data.message || 'Bilinmeyen hata'}`);
                } else if (error.request) {
                    toast.error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
                } else {
                    toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                }
                return [null, null, null, null, null, null, null];
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
        } catch (error) {
            console.error('Dashboard veri hatası:', error);
            toast.error('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
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

    return (
        <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Depo Yönetim Paneli</h1>
                <Select 
                    defaultValue="weekly" 
                    style={{ width: 120 }} 
                    onChange={value => setTimeRange(value)}
                >
                    <Option value="daily">Bu Hafta</Option>
                    <Option value="weekly">Bu Ay</Option>
                    <Option value="monthly">Bu Yıl</Option>
                </Select>
            </div>

            {/* İstatistik Kartları */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Toplam Ürün"
                            value={summaryData?.totalProducts}
                            prefix={<ShopOutlined />}
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
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Düşük Stoklu Ürünler"
                            value={summaryData?.lowStockProducts}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
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
                <Col xs={24}>
                    <Card 
                        title="Kategorilere Göre Ürün Dağılımı" 
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
                                                fill={COLORS[index % COLORS.length]} 
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value, name) => [`${value} ürün`, name]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Aylık Ürün Hareketleri */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={12}>
                    <Card 
                        title="Ürün Giriş/Çıkış Miktarları" 
                        loading={loading}
                        className="shadow-sm"
                        extra={
                            <Select 
                                value={timeRange} 
                                style={{ width: 120 }} 
                                onChange={value => setTimeRange(value)}
                            >
                                <Option value="daily">Son 7 Gün</Option>
                                <Option value="weekly">Bu Ay</Option>
                                <Option value="monthly">Bu Yıl</Option>
                            </Select>
                        }
                    >
                        <div style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyMovements}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="incoming" name="Giriş" fill="#4CAF50" />
                                    <Bar dataKey="outgoing" name="Çıkış" fill="#f44336" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
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
                                        stroke="#2196F3" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
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
                                        name="Toplam Stok"
                                        stroke="#4CAF50" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="productCount" 
                                        name="Ürün Sayısı"
                                        stroke="#FF9800" 
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
    );
};

export default Dashboard; 