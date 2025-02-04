import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Hoş Geldiniz!
      </h1>
      <p className="text-gray-600 mb-8">
        Warehouse Management System'e hoş geldiniz. Başlamak için aşağıdaki bağlantıları kullanabilirsiniz.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Genel durumu görüntüleyin</p>
        </Link>
        <Link
          to="/products"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ürünler</h2>
          <p className="text-gray-600">Ürünleri yönetin</p>
        </Link>
        <Link
          to="/stock-movements"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stok Hareketleri</h2>
          <p className="text-gray-600">Stok hareketlerini takip edin</p>
        </Link>
      </div>
    </div>
  );
};

export default Welcome; 