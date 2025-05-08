import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Avatar, Descriptions, Upload, Button, message, Spin, ConfigProvider, theme as antTheme } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

// API URL'sini ortam değişkenlerinden alalım (varsayılan değer ile)
// .env dosyasında REACT_APP_API_BASE_URL=http://localhost:3000 gibi tanımlanmalı
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'; // Port 5000'den 3000'e değiştirildi

const Profile = () => {
  const { user, token, updateAuthUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!user) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  // Tam profil fotoğrafı URL'sini oluştur
  const profilePictureFullUrl = user.profilePictureUrl
    ? `${API_BASE_URL}${user.profilePictureUrl}`
    : null;

  // Upload bileşeni için ayarlar
  const uploadProps = {
    name: 'profilePicture',
    action: `${API_BASE_URL}/api/users/me/profile-picture`,
    method: 'put',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Sadece resim dosyası yükleyebilirsiniz!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Resim 5MB'dan küçük olmalıdır!");
      }
      const isValid = isImage && isLt5M;
      if (isValid) {
          setUploading(true);
      }
      return isValid || Upload.LIST_IGNORE;
    },
    onChange: (info) => {
        const { status, response, name } = info.file;

        if (status === 'uploading') {
            // setUploading(true) is handled in beforeUpload for valid files
        } else if (status === 'done') {
            setUploading(false);
            message.success(`${name} başarıyla yüklendi.`);
            
            const updatedUser = response?.user;
            
            if (updatedUser && typeof updateAuthUser === 'function') {
                updateAuthUser(updatedUser);
            } else {
                console.error("Kullanıcı bilgisi güncellenemedi. Yanıt:", response);
                message.warning("Profil fotoğrafı yüklendi ancak uygulama içi kullanıcı bilgisi güncellenemedi. Değişikliklerin görünmesi için sayfayı yenilemeniz gerekebilir.");
            }
        } else if (status === 'error') {
            setUploading(false);
            console.error('Upload error response:', response);
            const errorMessage = response?.message || `${name} yüklenirken bir hata oluştu.`;
            message.error(errorMessage);
        }
    },
  };

  // Ant Design tema yapılandırması
  const antdThemeConfig = {
      algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <div className={`p-6 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>Profilim</h1>
        <Card bordered={false} className={`shadow-lg rounded-lg overflow-hidden ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className={`flex flex-col sm:flex-row items-center p-6 border-b ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'}`}>
            <Avatar 
              size={80}
              src={profilePictureFullUrl}
              icon={!profilePictureFullUrl ? <UserOutlined /> : null}
              className="mr-0 sm:mr-6 mb-4 sm:mb-0 border-2 border-white shadow-md flex-shrink-0"
             />
            <div className="text-center sm:text-left">
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{user.username}</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
            </div>
          </div>

          <div className="p-6">
              <Descriptions 
                  title={<span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Kullanıcı Bilgileri</span>}
                  bordered 
                  column={1} 
                  size="small" 
                  className={`mb-8 ${isDark ? 'antd-descriptions-dark' : ''}`}
              >
                <Descriptions.Item label="Kullanıcı Adı">{user.username}</Descriptions.Item>
                <Descriptions.Item label="E-posta">{user.email}</Descriptions.Item>
                <Descriptions.Item label="Rol"><span className="font-semibold capitalize">{user.role}</span></Descriptions.Item>
              </Descriptions>
    
              <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Profil Fotoğrafını Güncelle</h3>
                  <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />} loading={uploading} type="primary" ghost>
                          {uploading ? 'Yükleniyor...' : 'Yeni Fotoğraf Seç'}
                      </Button>
                  </Upload>
                  <p className={`text-sm mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>PNG, JPG, GIF, WEBP formatında, en fazla 5MB.</p>
              </div>
          </div>

        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Profile; 