import React, { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, Card, Row, Col, Button, Divider } from 'antd';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { KeyOutlined, UserOutlined, ShopOutlined, InboxOutlined, EnvironmentOutlined } from '@ant-design/icons';

const RolePermissionModal = ({ visible, onCancel, role }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const permissionGroups = {
        users: {
            title: 'Kullanıcı Yönetimi',
            icon: <UserOutlined />,
            permissions: [
                { key: 'users.view', label: 'Görüntüleme' },
                { key: 'users.create', label: 'Oluşturma' },
                { key: 'users.edit', label: 'Düzenleme' },
                { key: 'users.delete', label: 'Silme' }
            ]
        },
        products: {
            title: 'Ürün Yönetimi',
            icon: <ShopOutlined />,
            permissions: [
                { key: 'products.view', label: 'Görüntüleme' },
                { key: 'products.create', label: 'Oluşturma' },
                { key: 'products.edit', label: 'Düzenleme' },
                { key: 'products.delete', label: 'Silme' }
            ]
        },
        stock: {
            title: 'Stok Yönetimi',
            icon: <InboxOutlined />,
            permissions: [
                { key: 'stock.view', label: 'Görüntüleme' },
                { key: 'stock.create', label: 'Giriş/Çıkış' },
                { key: 'stock.edit', label: 'Düzenleme' }
            ]
        },
        locations: {
            title: 'Lokasyon Yönetimi',
            icon: <EnvironmentOutlined />,
            permissions: [
                { key: 'locations.view', label: 'Görüntüleme' },
                { key: 'locations.create', label: 'Oluşturma' },
                { key: 'locations.edit', label: 'Düzenleme' },
                { key: 'locations.delete', label: 'Silme' }
            ]
        }
    };

    useEffect(() => {
        if (visible && role) {
            fetchRolePermissions();
        }
    }, [visible, role]);

    const fetchRolePermissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/roles/${role.id}/permissions`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                setSelectedPermissions(response.data.data.map(p => p.name));
            }
        } catch (error) {
            console.error('Yetkiler yüklenirken hata:', error);
            toast.error('Yetkiler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await axios.put(`http://localhost:3000/api/roles/${role.id}/permissions`, {
                permissions: selectedPermissions
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            toast.success('Yetkiler güncellendi');
            onCancel();
        } catch (error) {
            console.error('Yetkiler güncellenirken hata:', error);
            toast.error('Yetkiler güncellenemedi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyOutlined />
                    <span>{role?.name || ''} - Yetki Yönetimi</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    İptal
                </Button>,
                <Button 
                    key="save" 
                    type="primary" 
                    loading={loading}
                    onClick={handleSave}
                >
                    Kaydet
                </Button>
            ]}
        >
            <Row gutter={[16, 16]}>
                {Object.entries(permissionGroups).map(([key, group]) => (
                    <Col span={12} key={key}>
                        <Card 
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {group.icon}
                                    <span>{group.title}</span>
                                </div>
                            }
                            size="small"
                            className="permission-card"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {group.permissions.map(permission => (
                                    <Checkbox
                                        key={permission.key}
                                        checked={selectedPermissions.includes(permission.key)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelectedPermissions([...selectedPermissions, permission.key]);
                                            } else {
                                                setSelectedPermissions(selectedPermissions.filter(p => p !== permission.key));
                                            }
                                        }}
                                    >
                                        {permission.label}
                                    </Checkbox>
                                ))}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Modal>
    );
};

export default RolePermissionModal; 