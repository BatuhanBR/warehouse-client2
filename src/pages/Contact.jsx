import React from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdSupport } from 'react-icons/md';

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">İletişim</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* İletişim Bilgileri */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Bize Ulaşın</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <MdEmail className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-700">info@depoyonetim.com</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MdPhone className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="text-gray-700">+90 (555) 123 45 67</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MdLocationOn className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Adres</p>
                <p className="text-gray-700">Teknoloji Mahallesi, Yazılım Caddesi No:123</p>
              </div>
            </div>
          </div>
        </div>

        {/* İletişim Formu */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Mesaj Gönderin</h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adınız
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesajınız
              </label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-500 transition-colors"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>

      {/* Destek Kartı */}
      <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center space-x-4">
          <MdSupport className="w-8 h-8 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold">7/24 Destek</h3>
            <p className="text-gray-600">Teknik destek ekibimiz size yardımcı olmak için hazır</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 