import React from 'react';
import { MdSecurity, MdSpeed, MdAutorenew, MdAnalytics } from 'react-icons/md';

const features = [
  {
    icon: MdSecurity,
    title: 'Güvenli',
    description: 'En son güvenlik protokolleri ile verileriniz güvende.'
  },
  {
    icon: MdSpeed,
    title: 'Hızlı',
    description: 'Optimize edilmiş altyapı ile yüksek performans.'
  },
  {
    icon: MdAutorenew,
    title: 'Güncel',
    description: 'Sürekli güncellenen özellikler ve iyileştirmeler.'
  },
  {
    icon: MdAnalytics,
    title: 'Analitik',
    description: 'Detaylı raporlar ve analiz araçları.'
  }
];

const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Depo Yönetim Sistemi Hakkında
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Modern ve kullanıcı dostu arayüzü ile depo yönetimini kolaylaştıran, 
          işletmenizin verimliliğini artıran profesyonel bir çözüm.
        </p>
      </div>

      {/* Özellikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Misyon & Vizyon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
          <p className="text-gray-600">
            İşletmelerin depo yönetimini modernleştirmek ve dijitalleştirmek için
            yenilikçi çözümler sunmak.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Vizyonumuz</h2>
          <p className="text-gray-600">
            Depo yönetiminde global standartları belirleyen, 
            lider yazılım çözümü olmak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 