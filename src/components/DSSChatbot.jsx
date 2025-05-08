import React, { useState, useEffect, useRef } from 'react';
import { List, Button, Space, Spin, Typography, Avatar, Tag } from 'antd';
import { RobotOutlined, UserOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

const { Text } = Typography;

const DSSChatbot = ({ onClose }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null); // Otomatik aşağı kaydırma için

    // Başlangıç mesajını güncelle
    useEffect(() => {
        setMessages([
            {
                sender: 'bot',
                text: 'Merhaba! Depo yönetimiyle ilgili öneriler almak için aşağıdaki komutları kullanabilirsin: Tüm Öneriler, Düşük Stoklar, Depo Doluluğu, Yavaş Ürünler.',
                type: 'info'
            }
        ]);
    }, []);

    // Yeni mesaj eklendiğinde en alta kaydır
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleCommand = async (commandType, commandText) => {
        setMessages(prev => [...prev, { sender: 'user', text: commandText, type: 'command' }]);
        setLoading(true);

        try {
            // Ana endpoint aynı kalıyor
            let endpoint = '/api/dss/recommendations'; 
            let params = {};
            // Eğer komut 'all' değilse, type parametresi ekle
            if (commandType !== 'all') {
                params.type = commandType; 
            }
            
            console.log(`Sending request to: ${endpoint} with params:`, params);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000${endpoint}`, {
                 headers: { 'Authorization': `Bearer ${token}` },
                 params: params // Axios ile query parametrelerini gönder
            });
            
            console.log('DSS API Response:', response.data);

            if (response.data.success && response.data.data.length > 0) {
                const botResponses = formatRecommendations(response.data.data);
                 setMessages(prev => [...prev, ...botResponses]);
            } else if (response.data.success && response.data.data.length === 0) {
                 setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: `İstediğiniz türde (${commandText}) bir öneri bulunamadı.`,
                    type: 'info'
                }]);
            } else {
                throw new Error(response.data.message || 'Öneriler alınamadı.');
            }

        } catch (error) {
            console.error('DSS API isteği hatası:', error);
            toast.error('Öneriler alınırken bir hata oluştu: ' + (error.response?.data?.message || error.message));
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: 'Üzgünüm, önerileri alırken bir sorunla karşılaştım.',
                type: 'error'
            }]);
        } finally {
            setLoading(false);
        }
    };

    // Backend'den gelen öneri verisini okunabilir mesajlara dönüştürür
    const formatRecommendations = (recommendations) => {
        return recommendations.map(rec => {
            let text = `Öneri (${rec.type}): ${rec.suggestion}`;
            // Öneri tiplerine göre formatlamayı zenginleştir
            switch (rec.type) {
                case 'low_stock':
                    text = `📉 Düşük Stok: ${rec.product_name} (Mevcut: ${rec.current_stock ?? 'N/A'} / Min: ${rec.min_stock ?? 'N/A'}). ${rec.suggestion}`;
                    break;
                case 'high_utilization':
                    text = `📈 Yüksek Doluluk: Depo genel doluluk oranı %${rec.utilization_percent}. ${rec.suggestion}`;
                    break;
                case 'slow_moving':
                    const daysText = rec.days_since_movement === "Hiç" ? "hiç" : `${rec.days_since_movement} gün`;
                    text = `⏳ Yavaş Hareket: ${rec.product_name} ürünü ${daysText} hareket görmedi. ${rec.suggestion}`;
                    break;
                case 'slow_moving_placeholder': // Placeholder'ı da formatlayalım
                    text = `⏳ Yavaş Hareket (Örnek): ${rec.suggestion}`;
                    break;
                // Gelecekte eklenecek diğer öneri tipleri için case'ler...
                default:
                    text = `ℹ️ Bilgi: ${rec.suggestion}`; // Bilinmeyen tip için genel format
            }
            
            return { sender: 'bot', text, type: 'suggestion' }; // type: suggestion olarak kalsın, renklendirme vs. için kullanılabilir
        });
    };

    // Butonları aktifleştir
    const commandButtons = [
        { key: 'all', text: 'Tüm Öneriler', onClick: () => handleCommand('all', 'Tüm önerileri göster') },
        { key: 'low_stock', text: 'Düşük Stoklar', onClick: () => handleCommand('low_stock', 'Düşük stoklu ürünleri göster') },
        { key: 'utilization', text: 'Depo Doluluğu', onClick: () => handleCommand('utilization', 'Depo doluluk oranını göster') },
        { key: 'slow_moving', text: 'Yavaş Ürünler', onClick: () => handleCommand('slow_moving', 'Yavaş hareket eden ürünleri göster') },
    ];

    const renderMessage = (item, index) => (
        <List.Item 
            key={index} 
            style={{
                textAlign: item.sender === 'user' ? 'right' : 'left',
                borderBottom: 'none', // Çizgileri kaldır
                padding: '5px 12px' // Biraz padding ekleyelim
            }}
        >
            <List.Item.Meta
                avatar={item.sender === 'bot' ? 
                    <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} /> : 
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: isDark ? '#4a5568' : '#bfdbfe' }} />
                }
                title={item.sender === 'bot' ? <Text strong>Depo Asistanı</Text> : <Text strong>Siz</Text>}
                description={
                    <div style={{ 
                        display: 'inline-block', 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        backgroundColor: item.sender === 'bot' ? 
                                        (item.type === 'error' ? (isDark ? '#5f2727' : '#fff1f0') : (isDark ? '#1e40af' : '#e6f7ff')) : 
                                        (isDark ? '#374151' : '#e5e7eb'),
                        color: item.type === 'error' && item.sender === 'bot' ? (isDark ? '#fecaca' : '#cf1322') : (isDark ? '#e0e7ff' : '#000'),
                        maxWidth: '80%',
                        textAlign: 'left' // İçeriği sola hizala
                    }}>
                        {item.text}
                    </div>
                }
                style={{ 
                    display: 'flex', 
                    flexDirection: item.sender === 'user' ? 'row-reverse' : 'row' 
                }}
            />
        </List.Item>
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
                 <List
                    dataSource={messages}
                    renderItem={renderMessage}
                    locale={{ emptyText: ' ' }} // Boşken yazı gösterme
                />
                {/* Otomatik kaydırma için boş div */}
                <div ref={messagesEndRef} />
            </div>
            
            <div style={{ padding: '12px', borderTop: `1px solid ${isDark ? '#374151' : '#f0f0f0'}` }}>
                <Space wrap>
                    {commandButtons.map(btn => (
                        <Button 
                            key={btn.key} 
                            onClick={btn.onClick}
                            disabled={loading}
                        >
                            {btn.text}
                        </Button>
                    ))}
                    {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
                </Space>
            </div>
        </div>
    );
};

export default DSSChatbot; 