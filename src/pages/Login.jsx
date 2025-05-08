import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { motion, useMotionValue, useTransform } from 'framer-motion';
// Ant Design componentlerini import edelim (ileride kullanmak için)
import { Input, Button, Checkbox, Form, Alert } from 'antd';
import { MailOutlined, LockOutlined, LeftOutlined, ContainerOutlined, LineChartOutlined, ApiOutlined, SyncOutlined } from '@ant-design/icons';

// Framer Motion Varyantları
const sentenceVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.3,
      staggerChildren: 0.15 // Kelimeler arası gecikme
    }
  }
};

const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

// Özellikler için yeni varyantlar
const featuresContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1.0, // Slogan animasyonundan sonra başlasın
      staggerChildren: 0.2
    }
  }
};

const featureItemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 }
  }
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata mesajı

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Giriş sonrası token alınamadı.');
        }

        toast.success('Başarıyla giriş yaptınız!');
        navigate('/welcome', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const message = err.response?.data?.message || 'Giriş yapılırken bir hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const slogan = "Deponuzu Geleceğe Taşıyın";
  const sloganWords = slogan.split(" ");

  const features = [
      { icon: <LineChartOutlined />, text: "Gerçek Zamanlı Takip" },
      { icon: <ApiOutlined />, text: "Akıllı Analizler" },
      { icon: <SyncOutlined />, text: "Kolay Entegrasyon" },
  ];

  // Parallax Efekti için Motion Değerleri
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Fare pozisyonunu -20px ile +20px arası harekete dönüştür
  // (Dairelerin hareket miktarını buradan ayarlayabiliriz)
  const moveX1 = useTransform(x, [-100, 100], [-15, 15]);
  const moveY1 = useTransform(y, [-100, 100], [-10, 10]);
  const moveX2 = useTransform(x, [-100, 100], [10, -10]);
  const moveY2 = useTransform(y, [-100, 100], [15, -15]);

  const handleMouseMove = (event) => {
    // Div'in orta noktasını referans al
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseLeave = () => {
    // Fare ayrıldığında pozisyonu sıfırla
    x.set(0);
    y.set(0);
  };

  return (
    // Ana yapıyı 2 sütunlu grid olarak değiştir
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <Toaster position="top-right" />
      
      {/* Sol Sütun: Görsel/Branding Alanı (motion.div ve mouse eventleri eklendi) */}
      <motion.div 
        className="hidden lg:block relative bg-gradient-to-br from-indigo-600 to-purple-600 overflow-hidden"
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1000px' }} // 3D efekti için perspektif
      >
        {/* Arka Plan Şekilleri (motion.div ve style eklendi) */} 
        <motion.div 
            className="absolute -top-20 -left-20 w-80 h-80 border-4 rounded-full border-opacity-20 border-white opacity-50"
            style={{ translateX: moveX1, translateY: moveY1, transition: 'transform 0.1s ease-out' }} // Yumuşak geçiş
        ></motion.div>
        <motion.div 
            className="absolute -bottom-20 -right-10 w-72 h-72 border-4 rounded-full border-opacity-20 border-white opacity-50"
            style={{ translateX: moveX2, translateY: moveY2, transition: 'transform 0.1s ease-out' }} // Yumuşak geçiş
        ></motion.div>
        
        {/* İçerik (Logo ve Yazılar - z-10 ile şekillerin üzerinde kalmalı) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10 z-10">
            {/* Logo */} 
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
            >
                <ContainerOutlined style={{ fontSize: '80px', color: 'rgba(255, 255, 255, 0.7)' }} />
            </motion.div>
            
            {/* Animasyonlu Slogan */}
            <motion.h1 
                className="text-4xl font-bold text-white opacity-90 text-center leading-tight"
                variants={sentenceVariant}
                initial="hidden"
                animate="visible"
            >
                {sloganWords.map((word, index) => (
                    <motion.span
                        key={word + "-" + index}
                        variants={wordVariant}
                        style={{ display: 'inline-block', marginRight: '0.5rem' }} // Kelimeler arası boşluk
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.h1>

            {/* Animasyonlu Özellikler Bölümü */}
            <motion.div 
                className="mt-12 space-y-4"
                variants={featuresContainerVariant}
                initial="hidden"
                animate="visible"
            >
                {features.map((feature, index) => (
                    <motion.div 
                        key={index} 
                        className="flex items-center justify-center text-white opacity-80"
                        variants={featureItemVariant}
                    >
                        {React.cloneElement(feature.icon, { className: "mr-3 text-xl" })}
                        <span className="text-lg">{feature.text}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </motion.div>

      {/* Sağ Sütun: Form Alanı */}
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative">
         {/* Ana Sayfa Linki */}
         <div className="absolute top-6 left-6">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-indigo-700 transition-colors duration-200 text-sm"
            >
              <LeftOutlined className="mr-1" />
              Ana Sayfa
            </Link>
         </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-6"
        >
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Hesabınıza Giriş Yapın
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Veya{' '}
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                  yeni bir hesap oluşturun
                </Link>
              </p>
            </div>

            {/* Eski motion.div ve arka plan kaldırıldı, daha temiz kart */}
            <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10">
              {/* Hata Mesajı Alanı */}
              {error && (
                  <Alert message={error} type="error" showIcon closable className="mb-4" onClose={() => setError(null)} />
              )}
              
              {/* Ant Design Form (Opsiyonel, şimdilik eski form kalabilir) */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Beni hatırla
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                      Şifremi unuttum
                    </Link>
                  </div>
                </div>

                <div>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full !h-11 !text-base !bg-gradient-to-r !from-indigo-600 !to-purple-600 !hover:from-indigo-700 !hover:to-purple-700"
                    loading={loading}
                    size="large"
                  >
                    Giriş Yap
                  </Button>
                </div>
              </form>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login; 