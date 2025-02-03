import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100 to-white">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Modern Depo Yönetim Sistemi
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Deponuzu akıllı, verimli ve etkili bir şekilde yönetin. Gerçek zamanlı takip, 
              otomatik bildirimler ve detaylı raporlama özellikleriyle işinizi kolaylaştırın.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/login"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Hesap Oluştur <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              Daha Hızlı Çalışın
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Her şey kontrolünüz altında
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Modern arayüzü ve kullanıcı dostu tasarımıyla depo yönetimini kolaylaştırır,
              verimliliğinizi artırır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing; 