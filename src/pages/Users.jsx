import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Input, Select, Spin, ConfigProvider, theme as antTheme } from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import UserModal from '../components/UserModal';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import UserActivityModal from '../components/UserActivityModal';
import RolePermissionModal from '../components/RolePermissionModal';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
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
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t, language } = useLanguage();

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
            toast.error(t('userLoadError'));
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
            toast.error(t('roleLoadError'));
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
            title: t('username'),
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: t('email'),
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: t('role'),
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role?.name === 'admin' ? 'red' : 'blue'}>
                    {role?.name?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: t('status'),
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? t('statusActiveUpper') : t('statusInactiveUpper')}
                </Tag>
            )
        },
        {
            title: t('lastLogin'),
            dataIndex: 'lastLoginAt',
            key: 'lastLoginAt',
            render: (date) => {
                if (!date) return t('neverLoggedIn');
                return new Date(date).toLocaleString(language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            title: t('contactInfo'),
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
            title: t('actions'),
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
                        {t('resetPassword')}
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedUser(record);
                            setActivityModalVisible(true);
                        }}
                    >
                        {t('activities')}
                    </Button>
                    {record.role && (
                        <Button
                            onClick={() => {
                                setSelectedRole(record.role);
                                setPermissionModalVisible(true);
                            }}
                        >
                            {t('permissions')}
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
            title: t('userDeleteConfirmTitle'),
            content: t('userDeleteConfirmContent', { username: user.username }),
            okText: t('yes'),
            cancelText: t('no'),
            onOk: async () => {
                try {
                    const response = await axios.delete(`http://localhost:3000/api/users/${user.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    
                    if (response.data.success) {
                        toast.success(t('userDeleteSuccess'));
                        fetchUsers();
                    } else {
                        toast.error(response.data.message || t('userDeleteError'));
                    }
                } catch (error) {
                    console.error('Kullanıcı silinirken hata:', error);
                    toast.error(error.response?.data?.message || t('userDeleteError'));
                }
            }
        });
    };

    const handleResetPassword = (user) => {
        Modal.confirm({
            title: t('passwordResetConfirmTitle'),
            content: t('passwordResetConfirmContent', { username: user.username }),
            okText: t('yes'),
            cancelText: t('no'),
            onOk: async () => {
                try {
                    await axios.post(`http://localhost:3000/api/users/${user.id}/reset-password`, {}, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    toast.success(t('passwordResetSuccess'));
                } catch (error) {
                    console.error('Şifre sıfırlama hatası:', error);
                    toast.error(t('passwordResetError'));
                }
            }
        });
    };

    // Ant Design tema yapılandırması
    const antdThemeConfig = {
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    };

    return (
        <ConfigProvider theme={antdThemeConfig}>
            <div className={`p-6 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 className={`${isDark ? 'text-white' : 'text-black'}`}>{t('userManagement')}</h2>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => {
                                setEditingUser(null);
                                setModalVisible(true);
                            }}
                        >
                            {t('newUser')}
                        </Button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <Search
                            placeholder={t('searchByUsernameOrEmail')}
                            allowClear
                            onSearch={value => setSearchText(value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 120 }}
                            onChange={value => setStatusFilter(value)}
                        >
                            <Select.Option value="all">{t('all')}</Select.Option>
                            <Select.Option value="active">{t('statusActive')}</Select.Option>
                            <Select.Option value="inactive">{t('statusInactive')}</Select.Option>
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
                                toast.success(editingUser ? t('userUpdateSuccess') : t('userAddSuccess'));
                            } else {
                                await axios.post('http://localhost:3000/api/users', values, {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                });
                                toast.success(editingUser ? t('userUpdateSuccess') : t('userAddSuccess'));
                            }
                            setModalVisible(false);
                            fetchUsers();
                        } catch (error) {
                            console.error('Kullanıcı işlemi başarısız:', error);
                            toast.error(error.response?.data?.message || t('userOperationFailed'));
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
        </ConfigProvider>
    );
};

export default Users; 