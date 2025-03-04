import React, { useState, useEffect } from 'react';
import { Modal, Table, DatePicker, Tabs } from 'antd';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const UserActivityModal = ({ visible, onCancel, userId, username }) => {
    const [activities, setActivities] = useState({ system: [], stock: [] });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState(null);

    const systemColumns = [
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm')
        },
        {
            title: 'İşlem',
            dataIndex: 'action',
            key: 'action',
            render: (action) => 
                action === 'GET' ? 'Görüntüleme' : 
                action === 'POST' ? 'Ekleme' : 
                action === 'PUT' ? 'Güncelleme' : 
                action === 'DELETE' ? 'Silme' : action
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-'
        }
    ];

    const stockColumns = [
        {
            title: 'Tarih',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm')
        },
        {
            title: 'İşlem Tipi',
            dataIndex: 'movementType',
            key: 'movementType',
            render: (type) => type === 'IN' ? 'Stok Girişi' : 'Stok Çıkışı'
        },
        {
            title: 'Ürün',
            dataIndex: 'productName',
            key: 'productName'
        },
        {
            title: 'Miktar',
            dataIndex: 'quantity',
            key: 'quantity'
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-'
        }
    ];

    const fetchActivities = async () => {
        try {
            setLoading(true);
            let url = `http://localhost:3000/api/users/${userId}/activities`;
            
            if (dateRange) {
                const [start, end] = dateRange;
                url += `?startDate=${start.format('YYYY-MM-DD')}&endDate=${end.format('YYYY-MM-DD')}`;
            }

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                // Backend artık direkt olarak ayrılmış veriyi gönderiyor
                setActivities({
                    system: response.data.data.system || [],
                    stock: response.data.data.stock || []
                });
            }
        } catch (error) {
            console.error('Aktiviteler yüklenirken hata:', error);
            toast.error('Aktiviteler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && userId) {
            fetchActivities();
        }
    }, [visible, userId, dateRange]);

    const items = [
        {
            key: '1',
            label: 'Sistem Aktiviteleri',
            children: (
                <Table
                    columns={systemColumns}
                    dataSource={activities.system}
                    rowKey={(record) => `system_${record.createdAt}`}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false
                    }}
                />
            )
        },
        {
            key: '2',
            label: 'Stok Hareketleri',
            children: (
                <Table
                    columns={stockColumns}
                    dataSource={activities.stock}
                    rowKey={(record) => `stock_${record.createdAt}`}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false
                    }}
                />
            )
        }
    ];

    return (
        <Modal
            title={`${username} - Kullanıcı Aktiviteleri`}
            open={visible}
            onCancel={onCancel}
            width={1000}
            footer={null}
        >
            <div style={{ marginBottom: 16 }}>
                <RangePicker
                    onChange={(dates) => setDateRange(dates)}
                    style={{ width: '100%' }}
                />
            </div>

            <Tabs items={items} />
        </Modal>
    );
};

export default UserActivityModal; 