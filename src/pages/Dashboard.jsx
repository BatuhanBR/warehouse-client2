import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { 
    LineChart, Line, PieChart, Pie, ResponsiveContainer, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { ShopOutlined, DollarOutlined, WarningOutlined, 
         SwapOutlined, DatabaseOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [trendsData, setTrendsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, trendsRes] = await Promise.all([
                axios.get('http://localhost:3000/api/dashboard/summary', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('http://localhost:3000/api/dashboard/trends', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (summaryRes.data.success) {
                setSummaryData(summaryRes.data.data);
            }
            if (trendsRes.data.success) {
                setTrendsData(trendsRes.data.data);
            }
        } catch (error) {
            console.error('Dashboard veri hatası:', error);
            toast.error('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

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
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            
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
        </div>
    );
};

export default Dashboard; 