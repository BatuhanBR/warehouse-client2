import React, { useState } from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdSupport } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        toast.success('Mesajınız başarıyla gönderildi!');
        setFormData({ name: '', email: '', message: '' }); // Formu temizle
      } else {
        toast.error(response.data.message || 'Mesaj gönderilemedi.');
      }
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      toast.error('Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">İletişim</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* İletişim Bilgileri */}
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Bize Ulaşın</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <MdEmail className="w-6 h-6 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">batuhanbarakali@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MdPhone className="w-6 h-6 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="text-gray-700">+90 (532) 653 63 27 </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MdLocationOn className="w-6 h-6 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="text-gray-700">Kazımdirik Mahallesi, Selçuk Yaşar Kampüsü, Üniversite Caddesi Ağaçlı Yol No: 37-39, 35100 Bornova/İzmir</p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Mesaj Gönderin</h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Adınız
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Adınız Soyadınız"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ornek@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Mesajınızı buraya yazın..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-500 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          </div>
        </div>

        {/* Harita */}
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg h-[600px]">
            <h2 className="text-xl font-semibold mb-6">Konum</h2>
            <div className="h-[500px] rounded-lg overflow-hidden">
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
                    Depo Yönetim Sistemi <br />
                    Kazımdirik Mahallesi, Selçuk Yaşar Kampüsü, Üniversite Caddesi Ağaçlı Yol No: 37-39, 35100 Bornova/İzmir
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Destek Kartı */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-center space-x-4">
              <MdSupport className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold">7/24 Destek</h3>
                <p className="text-gray-600">Teknik destek ekibimiz size yardımcı olmak için hazır</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 