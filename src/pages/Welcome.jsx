import React from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard, MdInventory, MdShowChart, MdPeople } from 'react-icons/md';

const features = [
  {
    icon: MdDashboard,
    title: 'Dashboard',
    description: 'Tüm depo verilerinizi tek bir ekranda görüntüleyin ve analiz edin.'
  },
  {
    icon: MdInventory,
    title: 'Ürün Yönetimi',
    description: 'Ürünlerinizi kategorilere ayırın, stok takibi yapın ve düzenleyin.'
  },
  {
    icon: MdShowChart,
    title: 'Stok Hareketleri',
    description: 'Giriş-çıkış hareketlerini takip edin, raporlar oluşturun.'
  },
  {
    icon: MdPeople,
    title: 'Kullanıcı Yönetimi',
    description: 'Çalışanlarınızı yönetin, yetkilendirme yapın.'
  }
];

const Welcome = () => {
  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Depo Yönetim Sistemine Hoş Geldiniz
        </h1>
        <p className="text-lg text-gray-600">
          Modern ve kullanıcı dostu arayüzümüzle deponuzu yönetmeye başlayın
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
        >
          Dashboard'a Git
          <MdDashboard className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default Welcome; 