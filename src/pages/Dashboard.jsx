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
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('weekly');

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, trendsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:3000/api/dashboard/summary', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/trends?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('http://localhost:3000/api/dashboard/product-stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (summaryRes.data.success) {
                setSummaryData(summaryRes.data.data);
            }
            if (trendsRes.data.success) {
                setTrendsData(trendsRes.data.data);
            }
            if (statsRes.data.success) {
                setProductStats(statsRes.data.data);
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

                <Col xs={24} sm={12} lg={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Haftalık Stok Hareketi"
                            value={summaryData?.weeklyMovements}
                            prefix={<SwapOutlined />}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Depolama Alanı Kullanımı"
                            value={summaryData?.storageUsage}
                            prefix={<DatabaseOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                    <Card loading={loading}>
                        <Statistic
                            title="Aktif Kullanıcılar"
                            value={summaryData?.activeUsers}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Son Eklenenler ve Hareketler */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={12}>
                    <Card title="Son Eklenen Ürünler" loading={loading}>
                        <Table 
                            columns={recentProductColumns}
                            dataSource={trendsData?.recentProducts}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Son Stok Hareketleri" loading={loading}>
                        <Table 
                            columns={recentMovementsColumns}
                            dataSource={trendsData?.recentMovements}
                            pagination={false}
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Grafikler */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={14}>
                    <Card title="Stok Hareketleri (Son 30 Gün)" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendsData?.movements || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(date) => new Date(date).toLocaleDateString('tr-TR')}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="in" 
                                    name="Giriş"
                                    stroke="#52c41a" 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="out" 
                                    name="Çıkış"
                                    stroke="#f5222d" 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Kategori Dağılımı" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={trendsData?.categories || []}
                                    dataKey="totalQuantity"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                >
                                    {(trendsData?.categories || []).map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Kritik Stok ve Popüler Ürünler */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={12}>
                    <Card title="Kritik Stok Uyarıları" loading={loading}>
                        <Table 
                            dataSource={trendsData?.criticalStock}
                            columns={[
                                {
                                    title: 'Ürün',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Kategori',
                                    dataIndex: ['Category', 'name'],
                                    key: 'category',
                                },
                                {
                                    title: 'Mevcut Stok',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    render: (quantity, record) => (
                                        <Tag color={quantity <= record.minStockLevel ? 'red' : 'green'}>
                                            {quantity}
                                        </Tag>
                                    ),
                                }
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="En Çok Hareket Gören Ürünler" loading={loading}>
                        <Table 
                            dataSource={trendsData?.popularProducts}
                            columns={[
                                {
                                    title: 'Ürün',
                                    dataIndex: ['Product', 'name'],
                                    key: 'name',
                                },
                                {
                                    title: 'Kategori',
                                    dataIndex: ['Product', 'Category', 'name'],
                                    key: 'category',
                                },
                                {
                                    title: 'Hareket Sayısı',
                                    dataIndex: 'movementCount',
                                    key: 'movementCount',
                                }
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Kategorilere Göre Stok Durumu */}
            <Col xs={24} lg={12}>
                <Card 
                    title="Kategorilere Göre Stok Durumu" 
                    loading={loading}
                    className="shadow-sm"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryStockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar 
                                dataKey="value" 
                                name="Stok Miktarı"
                            >
                                {categoryStockData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS.bar[entry.name]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            {/* Sipariş Trendleri */}
            <Col xs={24} lg={12}>
                <Card 
                    title="Sipariş Trendleri" 
                    loading={loading}
                    className="shadow-sm"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart 
                            data={orderTrendData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="orders" 
                                name="Sipariş Sayısı"
                                stroke={CHART_COLORS.line}
                                strokeWidth={2}
                                dot={{ fill: CHART_COLORS.line, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            {/* Kategorilere Göre Alan Kullanımı */}
            <Col xs={24}>
                <Card 
                    title="Kategorilere Göre Alan Kullanımı" 
                    loading={loading}
                    className="shadow-sm"
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {spaceUsageData.map((item) => (
                            <div key={item.category} style={{ marginBottom: '1rem' }}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-700">{item.category}</span>
                                    <span className="text-gray-600">
                                        {item.used} / {item.total} birim ({item.percentage}%)
                                    </span>
                                </div>
                                <Progress 
                                    percent={item.percentage} 
                                    showInfo={false}
                                    strokeColor={CHART_COLORS.bar[item.category]}
                                    trailColor="#f0f0f0"
                                />
                            </div>
                        ))}
                    </Space>
                </Card>
            </Col>

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
        </div>
    );
};

export default Dashboard; 