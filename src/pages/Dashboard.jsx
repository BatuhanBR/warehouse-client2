import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Select, Popover, List, Typography, Empty, ConfigProvider, theme as antTheme, Spin } from 'antd';
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

// Dark/Light mode yerine sabit renk ayarları
const colors = {
    primary: ['#1890ff', '#096dd9'],
    success: ['#52c41a', '#389e0d'],
    warning: ['#faad14', '#d48806'],
    error: ['#ff4d4f', '#cf1322'],
    
    // Grafikler için
    chartColors: {
        bar: {
            'Elektronik': '#1890ff',
            'Giyim': '#00C49F',
            'Kozmetik': '#FFBB28',
            'Kitap': '#FF8042',
            'Ev Eşyası': '#8884d8'
        },
        pieColors: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
        line: '#00C49F'
    },
    
    // Kartlar için
    cardBg: 'white',
    cardShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    cardText: 'rgba(0, 0, 0, 0.85)',
    cardBorder: '1px solid #f0f0f0'
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
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [recentMovements, setRecentMovements] = useState([]);
    const [topValuedProducts, setTopValuedProducts] = useState([]);
    const [overallCategoryDistribution, setOverallCategoryDistribution] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [expenseCategoryDistribution, setExpenseCategoryDistribution] = useState([]);
    const [expenseTimeDistribution, setExpenseTimeDistribution] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [yearlyExpense, setYearlyExpense] = useState(0);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [weeklyExpense, setWeeklyExpense] = useState(0);
    const [allTimeExpense, setAllTimeExpense] = useState(0);
    const [productPriceData, setProductPriceData] = useState([]);
    const [categoryPriceAnalysis, setCategoryPriceAnalysis] = useState([]);
    const [priceDistribution, setPriceDistribution] = useState([]);
    const [productRevenue, setProductRevenue] = useState(0);
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [revenueTimeDistribution, setRevenueTimeDistribution] = useState([]);
    const [profitTimeDistribution, setProfitTimeDistribution] = useState([]);
    const [totalProfit, setTotalProfit] = useState(0);
    const { theme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    useEffect(() => {
        fetchOverallCategoryDistribution();
    }, []);

    useEffect(() => {
        if (revenueTimeDistribution.length > 0 || expenseTimeDistribution.length > 0) {
            const newProfitTimeDistribution = [];
            const combinedData = {};

            revenueTimeDistribution.forEach(item => {
                if (!combinedData[item.date]) {
                    combinedData[item.date] = { revenue: 0, expense: 0 };
                }
                combinedData[item.date].revenue += item.amount;
            });

            expenseTimeDistribution.forEach(item => {
                if (!combinedData[item.date]) {
                    combinedData[item.date] = { revenue: 0, expense: 0 };
                }
                combinedData[item.date].expense += item.amount;
            });

            for (const date in combinedData) {
                newProfitTimeDistribution.push({
                    date: date,
                    profit: combinedData[date].revenue - combinedData[date].expense,
                    revenue: combinedData[date].revenue,
                    expense: combinedData[date].expense,
                });
            }

            // Tarihe göre sıralama (isteğe bağlı ama genellikle grafikler için iyi)
            newProfitTimeDistribution.sort((a, b) => new Date(a.date) - new Date(b.date));
            setProfitTimeDistribution(newProfitTimeDistribution);
        }
    }, [revenueTimeDistribution, expenseTimeDistribution]);

    useEffect(() => {
        setTotalProfit(productRevenue - totalExpense);
    }, [productRevenue, totalExpense]);

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
            const [summaryRes, trendsRes, statsRes, distributionRes, monthlyMovementsRes, totalStockStatusRes, warehouseOccupancyRes, recentMovementsRes, topValuedProductsRes, expenseSummaryRes, productPriceAnalysisRes] = await Promise.all([
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
                axios.get(`http://localhost:3000/api/dashboard/expense-summary?timeRange=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`http://localhost:3000/api/dashboard/product-price-analysis`, {
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
                return [null, null, null, null, null, null, null, null, null, null, null];
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
            if (expenseSummaryRes?.data?.success) {
                const expenseData = expenseSummaryRes.data.data;
                setExpenses(expenseData.expenses || []);
                setExpenseCategoryDistribution(expenseData.categoryDistribution || []);
                setExpenseTimeDistribution(expenseData.timeDistribution || []);
                setTotalExpense(expenseData.totalExpense || 0);
                setYearlyExpense(expenseData.yearlyExpense || 0);
                setMonthlyExpense(expenseData.monthlyExpense || 0);
                setWeeklyExpense(expenseData.weeklyExpense || 0);
                setAllTimeExpense(expenseData.allTimeExpense || 0);
            }
            if (productPriceAnalysisRes?.data?.success) {
                const data = productPriceAnalysisRes.data.data;
                setProductPriceData(data.products || []);
                setCategoryPriceAnalysis(data.categoryAnalysis || []);
                setPriceDistribution(data.priceDistribution || []);
                
                // Ürün gelirlerini hesapla (price * quantity)
                let totalProductRevenue = 0;
                const productList = data.products || [];
                productList.forEach(product => {
                    totalProductRevenue += (product.price || 0) * (product.quantity || 1);
                });
                setProductRevenue(totalProductRevenue);
                
                // Kategori bazında gelir dağılımı
                const categoryRevenueMap = {};
                const categoryAnalysis = data.categoryAnalysis || [];
                categoryAnalysis.forEach(category => {
                    categoryRevenueMap[category.category] = category.totalValue || 0;
                });
                
                const formattedCategoryRevenue = Object.entries(categoryRevenueMap).map(([name, value]) => ({
                    name,
                    value: parseFloat(value.toFixed(2))
                }));
                setRevenueByCategory(formattedCategoryRevenue);
                
                // Zaman bazlı gelir dağılımı - monthly movements kullanarak
                if (monthlyMovementsRes?.data?.success) {
                    const movementData = monthlyMovementsRes.data.data;
                    const timeRevenue = movementData.map(item => ({
                        date: item.date,
                        amount: item.incoming * 100 // Örnek hesaplama: her giriş için 100 TL varsayalım
                    }));
                    setRevenueTimeDistribution(timeRevenue);
                }
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

    // Ant Design tema yapılandırması
    const antdThemeConfig = {
        algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm,
    };

    return (
        <ConfigProvider theme={antdThemeConfig}>
            <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{t('warehouseDashboardTitle')}</h1>
                    <Select 
                        defaultValue="weekly" 
                        style={{ width: 120 }} 
                        onChange={value => setTimeRange(value)}
                        options={[
                            { value: 'daily', label: t('timeRangeThisWeek') },
                            { value: 'weekly', label: t('timeRangeThisMonth') }, 
                            { value: 'monthly', label: t('timeRangeThisYear') },
                        ]}
                    >
                    </Select>
                </div>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={8}>
                        <Card loading={loading}>
                            <Statistic
                                title={t('totalPalletCount')}
                                value={warehouseOccupancy?.totalProducts || 0}
                                prefix={<ShopOutlined />}
                                suffix={t('palletSuffix')}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card loading={loading}>
                            <Statistic
                                title={t('totalStockValue')}
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
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card loading={loading}>
                            <Popover 
                                content={lowStockContent}
                                title={t('lowStockPallets')}
                                trigger="hover"
                                placement="bottom"
                            >
                                <div style={{ cursor: 'pointer' }}>
                                    <Statistic
                                        title={t('lowStockPallets')}
                                        value={summaryData?.lowStockProducts}
                                        prefix={<WarningOutlined />}
                                        valueStyle={{ color: '#cf1322' }}
                                        suffix={t('palletSuffix')}
                                    />
                                </div>
                            </Popover>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card title={t('warehouseOccupancyStatus')} loading={loading}>
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
                                        <Card type="inner" title={t('areaUsage')}>
                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Statistic
                                                        title={t('totalArea')}
                                                        value={warehouseOccupancy?.totalArea || 0}
                                                        suffix="m²"
                                                        precision={1}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Statistic
                                                        title={t('usedArea')}
                                                        value={warehouseOccupancy?.occupiedArea || 0}
                                                        suffix="m²"
                                                        precision={1}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Statistic
                                                        title={t('emptyArea')}
                                                        value={warehouseOccupancy?.availableArea || 0}
                                                        suffix="m²"
                                                        precision={1}
                                                        valueStyle={{ color: '#3f8600' }}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Statistic
                                                        title={t('productCount')}
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

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24} md={12}>
                        <Card 
                            title={t('categoryDistributionByTimeRange')}
                            loading={loading}
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
                            title={t('overallCategoryDistribution')}
                            loading={loading}
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

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('netStockChange')}
                            loading={loading}
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
                                            name={t('netChange')}
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

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('recentStockMovements')}
                            loading={loading}
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

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('topEarners')}
                            loading={loading}
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

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('stockStatus')}
                            loading={loading}
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
                                            stroke={colors.chartColors.bar['Elektronik']} 
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                        <Line 
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="palletCount" 
                                            name="Palet Sayısı"
                                            stroke={colors.chartColors.bar['Giyim']} 
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('expenseAnalysis')}
                            loading={loading}
                        >
                            <Row gutter={[16, 16]} className="mb-4">
                                <Col xs={24} md={8}>
                                    <Card type="inner" title={t('totalYearlyExpense')}>
                                        <p className="text-2xl font-bold text-center">
                                            {yearlyExpense?.toLocaleString('tr-TR')} TL
                                        </p>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card type="inner" title={t('monthlyExpense')}>
                                        <p className="text-2xl font-bold text-center">
                                            {monthlyExpense?.toLocaleString('tr-TR')} TL
                                        </p>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card type="inner" title={t('weeklyExpense')}>
                                        <p className="text-2xl font-bold text-center">
                                            {weeklyExpense?.toLocaleString('tr-TR')} TL
                                        </p>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('expenseList')}>
                                        <Table
                                            dataSource={expenses}
                                            columns={[
                                                {
                                                    title: 'Başlangıç Tarihi',
                                                    dataIndex: 'startDate',
                                                    key: 'startDate',
                                                    render: (date) => new Date(date).toLocaleDateString('tr-TR'),
                                                },
                                                {
                                                    title: 'Bitiş Tarihi',
                                                    dataIndex: 'endDate',
                                                    key: 'endDate',
                                                    render: (date) => new Date(date).toLocaleDateString('tr-TR'),
                                                },
                                                {
                                                    title: 'Kategori',
                                                    dataIndex: 'type',
                                                    key: 'type',
                                                    render: (type) => (
                                                        <Tag color={
                                                            type === 'office' ? 'blue' : 
                                                            type === 'utility' ? 'orange' : 
                                                            type === 'salary' ? 'green' : 
                                                            'default'
                                                        }>
                                                            {type === 'office' ? 'Ofis Giderleri' : 
                                                             type === 'utility' ? 'Faturalar' : 
                                                             type === 'salary' ? 'Maaşlar' : type}
                                                        </Tag>
                                                    ),
                                                },
                                                {
                                                    title: 'Tutar',
                                                    dataIndex: 'amount',
                                                    key: 'amount',
                                                    render: (amount) => `${amount.toLocaleString('tr-TR')} TL`,
                                                    defaultSortOrder: 'descend',
                                                    sorter: (a, b) => a.amount - b.amount,
                                                },
                                                {
                                                    title: 'Açıklama',
                                                    dataIndex: 'description',
                                                    key: 'description',
                                                    ellipsis: true
                                                }
                                            ]}
                                            pagination={{ pageSize: 5 }}
                                            scroll={{ x: 'max-content' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('expenseCategoryDistribution')}>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={expenseCategoryDistribution}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill={colors.chartColors.bar['Giyim']}
                                                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    >
                                                        {expenseCategoryDistribution.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={colors.chartColors.pieColors[index % colors.chartColors.pieColors.length]} 
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]} className="mt-4">
                                <Col xs={24}>
                                    <Card type="inner" title={t('expenseTimeDistribution')}>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={expenseTimeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="amount" 
                                                        name={t('expenseAmount')} 
                                                        stroke={colors.chartColors.bar['Giyim']} 
                                                        strokeWidth={2}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center text-gray-500 mt-4">
                                            <p>{t('expenseTimeDistributionDescription')}</p>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('productPriceAnalysis')}
                            loading={loading}
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('highestPricedProducts')}>
                                        <div style={{ height: 400 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={productPriceData} layout="vertical" margin={{ top: 20, right: 30, left: 150, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]}
                                                        labelFormatter={(label) => `Ürün: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="price" name={t('unitPrice')} fill={colors.chartColors.bar['Elektronik']} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('categoryAveragePrice')}>
                                        <div style={{ height: 400 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={categoryPriceAnalysis} layout="vertical" margin={{ top: 20, right: 30, left: 150, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" />
                                                    <YAxis type="category" dataKey="category" width={140} tick={{ fontSize: 12 }} />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]}
                                                        labelFormatter={(label) => `Kategori: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="averagePrice" name={t('averagePrice')} fill={colors.chartColors.bar['Giyim']} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]} className="mt-4">
                                <Col xs={24}>
                                    <Card type="inner" title={t('priceDistribution')}>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={priceDistribution}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill={colors.chartColors.bar['Giyim']}
                                                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    >
                                                        {priceDistribution.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={colors.chartColors.pieColors[index % colors.chartColors.pieColors.length]} 
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={(value, name) => [`${value} ürün`, `${name}`]}
                                                        separator=": "
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('productRevenueAnalysis')}
                            loading={loading}
                        >
                            <Row gutter={[16, 16]} className="mb-4">
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('totalProductRevenue')}>
                                        <p className="text-2xl font-bold text-center">
                                            {productRevenue?.toLocaleString('tr-TR')} TL
                                        </p>
                                        <div className="text-center text-gray-500 mt-2">
                                            <p>{t('totalStockValueDescription')}</p>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('averageProductPrice')}>
                                        <p className="text-2xl font-bold text-center">
                                            {(productPriceData.length > 0 ? 
                                                productPriceData.reduce((sum, product) => sum + product.price, 0) / productPriceData.length : 0
                                            ).toLocaleString('tr-TR')} TL
                                        </p>
                                        <div className="text-center text-gray-500 mt-2">
                                            <p>{t('averageProductPriceDescription')}</p>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('highestRevenueProducts')}>
                                        <Table
                                            dataSource={productPriceData.map(product => ({
                                                ...product,
                                                totalValue: (product.price || 0) * (product.quantity || 1)
                                            })).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5)}
                                            columns={[
                                                {
                                                    title: 'Ürün Adı',
                                                    dataIndex: 'name',
                                                    key: 'name',
                                                    ellipsis: true
                                                },
                                                {
                                                    title: 'Kategori',
                                                    dataIndex: 'category',
                                                    key: 'category',
                                                    render: (category) => (
                                                        <Tag color={colors.chartColors.bar[category] || 'default'}>{category || 'Kategorisiz'}</Tag>
                                                    ),
                                                },
                                                {
                                                    title: 'Birim Fiyat',
                                                    dataIndex: 'price',
                                                    key: 'price',
                                                    render: (price) => `${(price || 0).toLocaleString('tr-TR')} TL`,
                                                },
                                                {
                                                    title: 'Miktar',
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                },
                                                {
                                                    title: 'Toplam Değer',
                                                    dataIndex: 'totalValue',
                                                    key: 'totalValue',
                                                    render: (value) => `${(value || 0).toLocaleString('tr-TR')} TL`,
                                                    defaultSortOrder: 'descend',
                                                    sorter: (a, b) => a.totalValue - b.totalValue,
                                                }
                                            ]}
                                            pagination={false}
                                            scroll={{ x: 'max-content' }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('revenueByCategory')}>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={revenueByCategory}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill={colors.chartColors.bar['Giyim']}
                                                        label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    >
                                                        {revenueByCategory.map((entry, index) => (
                                                            <Cell 
                                                                key={`cell-${index}`} 
                                                                fill={colors.chartColors.pieColors[index % colors.chartColors.pieColors.length]} 
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]} className="mt-4">
                                <Col xs={24}>
                                    <Card 
                                        type="inner" 
                                        title={t('revenueTimeDistribution')}
                                    >
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={revenueTimeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="amount" 
                                                        name={t('estimatedRevenue')} 
                                                        stroke={colors.chartColors.bar['Giyim']} 
                                                        strokeWidth={2}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="text-center text-gray-500 mt-4">
                                            <p>{t('revenueTimeDistributionDescription')}</p>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24}>
                        <Card 
                            title={t('profitAnalysis', 'Kâr Analizi')} 
                            loading={loading}
                        >
                            <Row gutter={[16, 16]} className="mb-4">
                                <Col xs={24} md={12}>
                                    <Card type="inner" title={t('totalProfit', 'Toplam Kâr')}>
                                        <Statistic 
                                            value={totalProfit} 
                                            precision={2} 
                                            valueStyle={{ color: totalProfit >= 0 ? colors.success[0] : colors.error[0] }} 
                                            prefix={t('currencySymbol', 'TL')}
                                        />
                                        <div className="text-center text-gray-500 mt-2">
                                            <p>{t('totalProfitDescription', 'Genel gelir ve gider farkı.')}</p>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24}>
                                    <Card type="inner" title={t('profitOverTime', 'Zaman İçinde Kâr Değişimi')}>
                                        <div style={{ height: 300 }}>
                                            {profitTimeDistribution.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={profitTimeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="date" />
                                                        <YAxis 
                                                            tickFormatter={(value) => `${value.toLocaleString('tr-TR')} ${t('currencySymbol', 'TL')}`}
                                                        />
                                                        <Tooltip 
                                                            formatter={(value, name, props) => [
                                                                `${value.toLocaleString('tr-TR')} ${t('currencySymbol', 'TL')}`,
                                                                name === 'profit' ? t('profit', 'Kâr') :
                                                                name === 'revenue' ? t('revenue', 'Gelir') :
                                                                name === 'expense' ? t('expense', 'Gider') : name
                                                            ]}
                                                        />
                                                        <Legend formatter={(value) => 
                                                            value === 'profit' ? t('profit', 'Kâr') :
                                                            value === 'revenue' ? t('revenue', 'Gelir') :
                                                            value === 'expense' ? t('expense', 'Gider') : value
                                                        } />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="profit" 
                                                            name={t('profit', 'Kâr')}
                                                            stroke={colors.primary[0]}
                                                            strokeWidth={2}
                                                            activeDot={{ r: 8 }}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="revenue" 
                                                            name={t('revenue', 'Gelir')}
                                                            stroke={colors.success[0]}
                                                            strokeDasharray="5 5"
                                                            strokeWidth={1}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="expense" 
                                                            name={t('expense', 'Gider')}
                                                            stroke={colors.error[0]}
                                                            strokeDasharray="5 5"
                                                            strokeWidth={1}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <Empty description={t('noProfitData', 'Gösterilecek kâr verisi bulunamadı.')} />
                                            )}
                                        </div>
                                        <div className="text-center text-gray-500 mt-4">
                                            <p>{t('profitOverTimeDescription', 'Belirli periyotlardaki gelir ve gider farklarının zaman içindeki değişimi.')}</p>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

            </div>
        </ConfigProvider>
    );
};

export default Dashboard; 