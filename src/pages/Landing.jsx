import React from 'react';
import { Link } from 'react-router-dom';
import { FaWarehouse, FaChartLine, FaBoxes, FaClock } from 'react-icons/fa';

function Landing() {
  const features = [
    {
      icon: <FaWarehouse className="h-8 w-8" />,
      title: 'Akıllı Depolama',
      description: 'Otomatik yerleştirme ve optimum alan kullanımı ile depolama verimliliğini artırın.'
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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="relative isolate">
        {/* Dekoratif arka plan desenleri */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-24">
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600 animate-fade-in">
                Daha Hızlı Çalışın
              </h2>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl animate-fade-in-up">
                Modern Depo Yönetim Sistemi
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 animate-fade-in">
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
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors duration-300"
                >
                  Hesap Oluştur <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Özellikler Grid */}
          <div className="mx-auto mt-8 max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alt kısım dekoratif desen */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-300 to-primary-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
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