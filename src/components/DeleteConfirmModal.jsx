import React, { useState } from 'react';
import { MdWarning } from 'react-icons/md';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(description);
    setDescription('');
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <MdWarning className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Ürünü Sil
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">{itemName}</span> adlı ürünü silmek istediğinizden emin misiniz? 
                    Bu işlem geri alınamaz.
                  </p>
                  <div className="mt-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Silme Açıklaması (İsteğe Bağlı)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="Ürünü neden siliyorsunuz?"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Sil
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 