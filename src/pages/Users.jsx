import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Input, Select, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import UserModal from '../components/UserModal';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import UserActivityModal from '../components/UserActivityModal';
import RolePermissionModal from '../components/RolePermissionModal';
const { Search } = Input;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [activityModalVisible, setActivityModalVisible] = useState(false);
    const [permissionModalVisible, setPermissionModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Kullanıcıları getir
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/users`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                params: {
                    search: searchText,
                    status: statusFilter
                }
            });

            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
            toast.error('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    // Rolleri getir
    const fetchRoles = async () => {
        try {
            console.log('Roller getiriliyor...'); // Debug için
            const response = await axios.get('http://localhost:3000/api/roles', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Roller response:', response.data); // Debug için
            
            if (response.data.success) {
                setRoles(response.data.data);
            }
        } catch (error) {
            console.error('Roller yüklenirken hata:', error);
            toast.error('Roller yüklenemedi');
        }
    };

    // Search ve filter değiştiğinde kullanıcıları yeniden getir
    useEffect(() => {
        fetchUsers();
    }, [searchText, statusFilter]);

    useEffect(() => {
        fetchRoles();
    }, []);

    const columns = [
        {
            title: 'Kullanıcı Adı',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'E-posta',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role?.name === 'admin' ? 'red' : 'blue'}>
                    {role?.name?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Durum',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'AKTİF' : 'PASİF'}
                </Tag>
            )
        },
        {
            title: 'Son Giriş',
            dataIndex: 'lastLoginAt',
            key: 'lastLoginAt',
            render: (date) => {
                if (!date) return 'Henüz Giriş Yapmadı';
                return new Date(date).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            title: 'İletişim Bilgileri',
            key: 'contact',
            render: (_, record) => (
                <div>
                    {record.email && <div><MailOutlined /> {record.email}</div>}
                    {record.phone && <div><PhoneOutlined /> {record.phone}</div>}
                    {record.address && <div><HomeOutlined /> {record.address}</div>}
                </div>
            )
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                    />
                    <Button 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={() => handleDelete(record)}
                    />
                    <Button
                        onClick={() => handleResetPassword(record)}
                        type="default"
                    >
                        Şifre Sıfırla
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedUser(record);
                            setActivityModalVisible(true);
                        }}
                    >
                        Aktiviteler
                    </Button>
                    {record.role && (
                        <Button
                            onClick={() => {
                                setSelectedRole(record.role);
                                setPermissionModalVisible(true);
                            }}
                        >
                            Yetkiler
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    const handleEdit = (user) => {
        setEditingUser(user);
        setModalVisible(true);
    };

    const handleDelete = (user) => {
        Modal.confirm({
            title: 'Kullanıcı Silme',
            content: `${user.username} kullanıcısını silmek istediğinize emin misiniz?`,
            okText: 'Evet',
            cancelText: 'Hayır',
            onOk: async () => {
                try {
                    const response = await axios.delete(`http://localhost:3000/api/users/${user.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    
                    if (response.data.success) {
                        toast.success('Kullanıcı başarıyla silindi');
                        fetchUsers(); // Listeyi yenile
                    } else {
                        toast.error(response.data.message || 'Kullanıcı silinemedi');
                    }
                } catch (error) {
                    console.error('Kullanıcı silinirken hata:', error);
                    toast.error(error.response?.data?.message || 'Kullanıcı silinemedi');
                }
            }
        });
    };

    const handleResetPassword = (user) => {
        Modal.confirm({
            title: 'Şifre Sıfırlama',
            content: `${user.username} kullanıcısının şifresini sıfırlamak istediğinize emin misiniz? Yeni şifre: 123456`,
            okText: 'Evet',
            cancelText: 'Hayır',
            onOk: async () => {
                try {
                    await axios.post(`http://localhost:3000/api/users/${user.id}/reset-password`, {}, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    toast.success('Şifre başarıyla sıfırlandı');
                } catch (error) {
                    console.error('Şifre sıfırlama hatası:', error);
                    toast.error('Şifre sıfırlanamadı');
                }
            }
        });
    };

    return (
        <div className="p-6">
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2>Kullanıcı Yönetimi</h2>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => {
                            setEditingUser(null);
                            setModalVisible(true);
                        }}
                    >
                        Yeni Kullanıcı
                    </Button>
                </div>
                
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <Search
                        placeholder="Kullanıcı adı veya email ara..."
                        allowClear
                        onSearch={value => setSearchText(value)}
                        style={{ width: 300 }}
                    />
                    <Select
                        defaultValue="all"
                        style={{ width: 120 }}
                        onChange={value => setStatusFilter(value)}
                    >
                        <Select.Option value="all">Tümü</Select.Option>
                        <Select.Option value="active">Aktif</Select.Option>
                        <Select.Option value="inactive">Pasif</Select.Option>
                    </Select>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
            />

            <UserModal 
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingUser(null);
                }}
                onSubmit={async (values) => {
                    try {
                        if (editingUser) {
                            await axios.put(`http://localhost:3000/api/users/${editingUser.id}`, values, {
                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                            toast.success('Kullanıcı güncellendi');
                        } else {
                            await axios.post('http://localhost:3000/api/users', values, {
                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                            toast.success('Kullanıcı eklendi');
                        }
                        setModalVisible(false);
                        fetchUsers();
                    } catch (error) {
                        console.error('Kullanıcı işlemi başarısız:', error);
                        toast.error(error.response?.data?.message || 'İşlem başarısız');
                    }
                }}
                initialData={editingUser}
                roles={roles}
            />

            <UserActivityModal
                visible={activityModalVisible}
                onCancel={() => {
                    setActivityModalVisible(false);
                    setSelectedUser(null);
                }}
                userId={selectedUser?.id}
                username={selectedUser?.username}
            />

            <RolePermissionModal
                visible={permissionModalVisible}
                onCancel={() => {
                    setPermissionModalVisible(false);
                    setSelectedRole(null);
                }}
                role={selectedRole}
            />
        </div>
    );
};

export default Users; 