import React from 'react';
import WarehouseASCIIView from '../components/WarehouseASCIIView';

const WarehouseASCII = () => {
    return (
        <div className="h-full">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">ASCII Depo Görünümü</h1>
                <p className="text-gray-600">Depo raflarının basit metin tabanlı görünümü</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
                <WarehouseASCIIView />
            </div>
        </div>
    );
};

export default WarehouseASCII; 