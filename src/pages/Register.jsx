import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion, useMotionValue, useTransform } from 'framer-motion';
// Ant Design ve ikonları import et
import { Input, Button, Form, Alert } from 'antd';
import { MailOutlined, LockOutlined, LeftOutlined, ContainerOutlined, LineChartOutlined, ApiOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';

// Framer Motion Varyantları (Login.jsx'ten kopyalandı)
const sentenceVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.3, staggerChildren: 0.15 } }
};
const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
};
const featuresContainerVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 1.0, staggerChildren: 0.2 } }
};
const featureItemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Ant Design Form hook
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Slogan ve özellikleri tanımla (Login.jsx'ten)
  const slogan = "Deponuzu Geleceğe Taşıyın";
  const sloganWords = slogan.split(" ");
  const features = [
      { icon: <LineChartOutlined />, text: "Gerçek Zamanlı Takip" },
      { icon: <ApiOutlined />, text: "Akıllı Analizler" },
      { icon: <SyncOutlined />, text: "Kolay Entegrasyon" },
  ];

  // Parallax Efekti için (Login.jsx'ten)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const moveX1 = useTransform(x, [-100, 100], [-15, 15]);
  const moveY1 = useTransform(y, [-100, 100], [-10, 10]);
  const moveX2 = useTransform(x, [-100, 100], [10, -10]);
  const moveY2 = useTransform(y, [-100, 100], [15, -15]);
  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    console.log('Register form values:', values);
    try {
      const response = await authService.register({
        username: values.username,
        email: values.email,
        password: values.password,
        roleId: 2 // Varsayılan kullanıcı rolü
      });
      
      if (response.data.success) {
        toast.success('Hesabınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
          // API'den success:false ama hata kodu 2xx dönerse (beklenmez ama olabilir)
          throw new Error(response.data.message || 'Bir sorun oluştu.');
      }
    } catch (err) {
      console.error('Register error:', err);
      const message = err.response?.data?.message || 'Kayıt olurken bir sunucu hatası oluştu.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <Toaster position="top-right" />
      
      {/* Sol Sütun: Görsel/Branding Alanı (Sırası değiştirildi) */}
      <motion.div 
        className="hidden lg:block relative bg-gradient-to-br from-indigo-600 to-purple-600 overflow-hidden lg:order-2"
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1000px' }}
      >
        <motion.div className="absolute -top-20 -left-20 w-80 h-80 border-4 rounded-full border-opacity-20 border-white opacity-50" style={{ translateX: moveX1, translateY: moveY1, transition: 'transform 0.1s ease-out' }}></motion.div>
        <motion.div className="absolute -bottom-20 -right-10 w-72 h-72 border-4 rounded-full border-opacity-20 border-white opacity-50" style={{ translateX: moveX2, translateY: moveY2, transition: 'transform 0.1s ease-out' }}></motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 z-10">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
                <ContainerOutlined style={{ fontSize: '80px', color: 'rgba(255, 255, 255, 0.7)' }} />
            </motion.div>
            <motion.h1 className="text-4xl font-bold text-white opacity-90 text-center leading-tight" variants={sentenceVariant} initial="hidden" animate="visible">
                {sloganWords.map((word, index) => (
                    <motion.span key={word + "-" + index} variants={wordVariant} style={{ display: 'inline-block', marginRight: '0.5rem' }}>{word}</motion.span>
                ))}
            </motion.h1>
            <motion.div className="mt-12 space-y-4" variants={featuresContainerVariant} initial="hidden" animate="visible">
                {features.map((feature, index) => (
                    <motion.div key={index} className="flex items-center justify-center text-white opacity-80" variants={featureItemVariant}>
                        {React.cloneElement(feature.icon, { className: "mr-3 text-xl" })}
                        <span className="text-lg">{feature.text}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </motion.div>

      {/* Sağ Sütun: Form Alanı (Sırası değiştirildi) */}
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative lg:order-1">
         {/* Ana Sayfa Linki (Login.jsx'teki gibi) */}
         <div className="absolute top-6 left-6">
            <Link to="/" className="flex items-center text-gray-600 hover:text-indigo-700 transition-colors duration-200 text-sm"><LeftOutlined className="mr-1" />Ana Sayfa</Link>
         </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-6"
        >
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Yeni Hesap Oluşturun
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                  Giriş yapın
                </Link>
              </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10">
              {error && (
                  <Alert message={error} type="error" showIcon closable className="mb-6" onClose={() => setError(null)} />
              )}
              
              {/* Ant Design Form */}
              <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  autoComplete="off"
              >
                  <Form.Item
                      label="Kullanıcı Adı"
                      name="username"
                      rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin!' }]}
                  >
                      <Input 
                          prefix={<UserOutlined className="site-form-item-icon" />} 
                          placeholder="kullaniciadiniz" 
                          size="large"
                      />
                  </Form.Item>

                  <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                          { required: true, message: 'Lütfen email adresinizi girin!' },
                          { type: 'email', message: 'Geçerli bir email adresi girin!' }
                      ]}
                  >
                      <Input 
                          prefix={<MailOutlined className="site-form-item-icon" />} 
                          placeholder="ornek@email.com" 
                          size="large"
                      />
                  </Form.Item>

                  <Form.Item
                      label="Şifre"
                      name="password"
                      rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
                      hasFeedback // Şifre tekrarı eklenirse işe yarar
                  >
                      <Input.Password 
                          prefix={<LockOutlined className="site-form-item-icon" />} 
                          placeholder="••••••••" 
                          size="large"
                      />
                  </Form.Item>

                  {/* Şifre Tekrarı (Opsiyonel ama önerilir) */}
                   <Form.Item
                       name="confirm"
                       label="Şifre Tekrarı"
                       dependencies={['password']}
                       hasFeedback
                       rules={[
                           { required: true, message: 'Lütfen şifrenizi tekrar girin!' },
                           ({ getFieldValue }) => ({
                               validator(_, value) {
                               if (!value || getFieldValue('password') === value) {
                                   return Promise.resolve();
                               }
                               return Promise.reject(new Error('Girdiğiniz şifreler eşleşmiyor!'));
                               },
                           }),
                       ]}
                   >
                       <Input.Password 
                          prefix={<LockOutlined className="site-form-item-icon" />} 
                          placeholder="••••••••" 
                          size="large"
                       />
                   </Form.Item>

                  <Form.Item className="mt-8">
                      <Button 
                          type="primary" 
                          htmlType="submit" 
                          className="w-full !h-11 !text-base !bg-gradient-to-r !from-indigo-600 !to-purple-600 !hover:from-indigo-700 !hover:to-purple-700"
                          loading={loading}
                          size="large"
                      >
                          Hesap Oluştur
                      </Button>
                  </Form.Item>
              </Form>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register; 