import React from 'react';
import { Card, Tag, Typography, Space, Button } from 'antd';
import { EditOutlined, LineChartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { Meta } = Card;
const { Title, Text } = Typography;

const ProductCard = ({ product, onEdit, onDelete, onViewHistory }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useLanguage();

    // Stok durumuna göre renk belirleme
    const getStockColor = (quantity) => {
        if (quantity <= 0) return '#ff4d4f'; // Stokta yok - kırmızı
        if (quantity < 10) return '#faad14'; // Stok az - sarı
        return '#52c41a'; // Stok yeterli - yeşil
    };

    // Fiyat formatı
    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(price);
    };

    return (
        <Card
            hoverable
            style={{ 
                width: '100%', 
                marginBottom: 16,
                backgroundColor: isDark ? '#1f2937' : '#fff',
                borderColor: isDark ? '#374151' : '#f0f0f0'
            }}
            cover={<img 
                alt={product.name} 
                src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Ürün+Görseli'} 
                style={{ height: 200, objectFit: 'cover' }} 
            />}
            actions={[
                <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(product)}
                    style={{ color: isDark ? '#9ca3af' : undefined }}
                >
                    {t('edit')}
                </Button>,
                <Button 
                    type="text" 
                    icon={<LineChartOutlined />} 
                    onClick={() => onViewHistory(product._id)}
                    style={{ color: isDark ? '#9ca3af' : undefined }}
                >
                    {t('history')}
                </Button>,
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => onDelete(product._id)}
                    style={{ color: isDark ? '#ef4444' : undefined }}
                >
                    {t('delete')}
                </Button>
            ]}
        >
            <Meta 
                title={<Title level={4} style={{ color: isDark ? '#f3f4f6' : undefined, margin: 0 }}>{product.name}</Title>} 
                description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text style={{ color: isDark ? '#d1d5db' : undefined }}>{product.description}</Text>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                            <Text strong style={{ color: isDark ? '#e5e7eb' : undefined }}>
                                {formatPrice(product.price)}
                            </Text>
                            <Tag color={getStockColor(product.stockQuantity)}>
                                {t('stock')}: {product.stockQuantity}
                            </Tag>
                        </div>
                        
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ color: isDark ? '#9ca3af' : undefined }}>
                                {t('category')}: {product.category}
                            </Text>
                        </div>
                    </Space>
                }
            />
        </Card>
    );
};

export default ProductCard; 