import React from 'react';
import { Link } from 'react-router-dom';
import { FaWarehouse, FaChartLine, FaBoxes, FaClock } from 'react-icons/fa';

function Landing() {
  const features = [
    {
      icon: <FaWarehouse className="h-8 w-8" />,
      title: 'Akıllı Depolama',
      description: 'Optimum alan kullanımı ile depolama verimliliğini artırın.'
    },
    {
      icon: <FaChartLine className="h-8 w-8" />,
      title: 'Gerçek Zamanlı Analitik',
      description: 'Anlık stok takibi ve detaylı raporlama ile veriye dayalı kararlar alın.'
    },
    {
      icon: <FaBoxes className="h-8 w-8" />,
      title: 'Stok Yönetimi',
      description: 'Gelişmiş stok yönetimi ile fire oranlarını azaltın, verimliliği artırın.'
    },
    {
      icon: <FaClock className="h-8 w-8" />,
      title: 'Zaman Tasarrufu',
      description: 'Otomatik süreç yönetimi ile operasyonel verimliliği maksimize edin.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative isolate pt-14 pb-24 sm:pb-32 lg:pb-40 flex items-center"
        style={{
            backgroundImage: 'url(/images/landing-page.jpg)',
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

        <div className="mx-auto max-w-2xl text-center z-10 relative px-4">
            <h2 className="text-base font-semibold leading-7 text-gray-200 animate-fade-in">
                Daha Hızlı Çalışın
              </h2>
            <h1 
              className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl animate-fade-in-up"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
            >
                Modern Depo Yönetim Sistemi
              </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200 animate-fade-in">
                Deponuzu akıllı, verimli ve etkili bir şekilde yönetin. Gerçek zamanlı takip, 
                otomatik bildirimler ve detaylı raporlama özellikleriyle işinizi kolaylaştırın.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/login"
                  className="rounded-md bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-300 hover:scale-105"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-lg hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300 hover:scale-105"
                >
                  Hesap Oluştur
                </Link>
              </div>
            </div>
          </div>

      {/* Özellikler Bölümü (Yeniden Yapılandırıldı) */}
      <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-x-16 gap-y-10">
                  {/* Sol Taraf: Başlık, Açıklama ve **Özellik Kartları** */}
                  <div className="lg:flex-1">
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-left">
                          Neden Bizim Sistemimiz?
                      </h2>
                      <p className="mt-6 text-lg leading-8 text-gray-600 text-left">
                          Depo operasyonlarınızı optimize etmek, verimliliği artırmak ve maliyetleri düşürmek için 
                          gelişmiş özelliklerimizi keşfedin. Gerçek zamanlı verilerle daha akıllı kararlar alın.
                      </p>

                      {/* Özellik Kartlarını Buraya Taşı */}
                      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div 
                  key={index}
                              className="text-center group bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                                  <div className="mb-4 flex items-center justify-center">
                                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 ring-8 ring-primary-50 group-hover:ring-primary-100 transition-all duration-300">
                                          {React.cloneElement(feature.icon, { className: "h-7 w-7 text-primary-600" })}
                                      </div>
                  </div>
                                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    {feature.title}
                  </h3>
                                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

                  {/* Sağ Taraf: Görsel (Aynı) */}
                  <div className="lg:flex-1 flex justify-center lg:justify-end">
                       <img 
                           src="images/landing-page2.jpg" 
                           alt="Sistemin Özellikleri"
                           className="w-full max-w-md rounded-xl shadow-lg ring-1 ring-gray-400/10"
                       />
                  </div>
        </div>
        </div>
      </div>

      {/* Stil tanımlamaları */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Landing; 