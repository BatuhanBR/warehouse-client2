import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-500">Toplam Ürün</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-500">Düşük Stok</h2>
          <p className="text-2xl font-bold text-red-500">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-500">Toplam Hareket</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 