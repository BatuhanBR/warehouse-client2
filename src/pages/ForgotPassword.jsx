import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await authService.forgotPassword({ email });
      
      if (response.data.success) {
        setIsSent(true);
        toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white py-16 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="flex items-center text-primary-600 hover:text-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Ana Sayfa
        </Link>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Şifremi Unuttum
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {!isSent ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Şifre Sıfırlama Bağlantısı Gönder
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Email adresinize şifre sıfırlama bağlantısı gönderdik. Lütfen email kutunuzu kontrol edin.
                </div>
                <Link
                  to="/login"
                  className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Giriş sayfasına dön
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 