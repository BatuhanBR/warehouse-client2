import React, { useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdSupport } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext'; // Tema context'ini import et
import { useLanguage } from '../contexts/LanguageContext'; // Dil context'ini import et

// Leaflet varsayılan ikon sorunu için çözüm
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Contact = () => {
  // Deponun konumu (örnek koordinatlar - kendi koordinatlarınızla değiştirin)
  const position = [38.45485378921997, 27.202245681708373]; // İzmir koordinatları
  const { theme } = useTheme(); // Temayı al
  const isDark = theme === 'dark';
  const { t } = useLanguage(); // t fonksiyonunu al

  // Form state'leri
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:3000/api/contact/send', formData);
      
      if (response.data.success) {
        toast.success(t('messageSentSuccess'));
        setFormData({ name: '', email: '', message: '' }); // Formu temizle
      } else {
        toast.error(response.data.message || t('messageSentError'));
      }
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      toast.error(t('messageSentErrorGeneral'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto py-8 px-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
      <h1 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('contact')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* İletişim Bilgileri Kartı - Tema class'ları eklendi */}
        <div className="space-y-8">
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('contactUsTitle')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <MdEmail className={`w-6 h-6 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('email')}</p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>batuhanbarakali@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MdPhone className={`w-6 h-6 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('phone')}</p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>+90 (532) 653 63 27 </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MdLocationOn className={`w-6 h-6 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('address')}</p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Kazımdirik Mahallesi, Selçuk Yaşar Kampüsü, Üniversite Caddesi Ağaçlı Yol No: 37-39, 35100 Bornova/İzmir</p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu Kartı - Tema class'ları eklendi */}
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sendMessageTitle')}</h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('yourName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder={t('yourNamePlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              
              <div>
                <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('yourMessage')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder={t('yourMessagePlaceholder')}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? t('sending') : t('send')}
              </button>
            </form>
          </div>
        </div>

        {/* Harita ve Destek Kartları - Tema class'ları eklendi */}
        <div className="space-y-8">
          <div className={`rounded-xl p-6 shadow-lg h-[600px] ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('locationMapTitle')}</h2>
            <div className={`h-[500px] rounded-lg overflow-hidden ${isDark ? 'leaflet-container-dark' : ''}`}>
              <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                  <Popup>
                    {t('mapPopupTextLine1')} <br />
                    {t('mapPopupTextLine2')}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Destek Kartı */}
          <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <div className="flex items-center justify-center space-x-4">
              <MdSupport className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('supportTitle')}</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('supportDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 