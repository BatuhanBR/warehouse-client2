import React from 'react';
import WarehouseView3D from '../components/WarehouseView3D';

const Warehouse3D = () => {
    return (
        <div className="h-full">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">3D Depo Görünümü</h1>
                <p className="text-gray-600">Depo raflarının 3 boyutlu görünümü</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-200px)]">
                <WarehouseView3D />
            </div>
        </div>
    );
};

export default Warehouse3D; 