import React, { useState, useEffect } from 'react';
import { MdAdd, MdFileDownload, MdPrint, MdEdit, MdDelete } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedAccess from '../components/UnauthorizedAccess';
import { Spin } from 'antd';

// Debug utils
const logError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
    console.error('Headers:', error.response.headers);
  } else if (error.request) {
    console.error('Request:', error.request);
  } else {
    console.error('Message:', error.message);
  }
};

const Expenses = () => {
  const { user, loading: authLoading } = useAuth();
  const userRole = user?.role;

  const [expenses, setExpenses] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalExpense: 0,
    yearlyExpense: 0,
    monthlyExpense: 0,
    weeklyExpense: 0,
    allTimeExpense: 0
  });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const expenseTypes = [
    { value: '', label: 'Tümü' },
    { value: 'office', label: 'Ofis Giderleri' },
    { value: 'utility', label: 'Faturalar' },
    { value: 'salary', label: 'Maaşlar' }
  ];

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedType) params.append('expenseType', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      console.log('Fetching expenses with params:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        expenseType: selectedType,
        search: searchQuery,
        fullQueryString: params.toString()
      });
      
      const token = localStorage.getItem('token');
      console.log('Token available:', token ? 'Yes' : 'No');
      
      const response = await axios.get(`http://localhost:3000/api/expenses?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response:', response.data);
      
      setExpenses(response.data.expenses || []);
      setSummaryData({
        totalExpense: response.data.summary?.totalExpense || 0,
        yearlyExpense: response.data.summary?.yearlyExpense || 0,
        monthlyExpense: response.data.summary?.monthlyExpense || 0,
        weeklyExpense: response.data.summary?.weeklyExpense || 0,
        allTimeExpense: response.data.summary?.allTimeExpense || 0
      });
    } catch (error) {
      logError(error, 'fetchExpenses');
      toast.error('Giderler yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [dateRange, selectedType, searchQuery]);

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/expenses/export/excel', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'giderler.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      logError(error, 'handleExportExcel');
      toast.error('Excel dosyası oluşturulurken bir hata oluştu');
    }
  };

  const handlePrint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/expenses/export/pdf', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url);
    } catch (error) {
      logError(error, 'handlePrint');
      toast.error('PDF dosyası oluşturulurken bir hata oluştu');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      if (currentExpense) {
        await axios.put(`http://localhost:3000/api/expenses/${currentExpense.id}`, formData, { headers });
        toast.success('Gider başarıyla güncellendi');
      } else {
        await axios.post('http://localhost:3000/api/expenses', formData, { headers });
        toast.success('Gider başarıyla eklendi');
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      logError(error, 'handleSubmit');
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu gideri silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/expenses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Gider başarıyla silindi');
        fetchExpenses();
      } catch (error) {
        logError(error, 'handleDelete');
        toast.error('Gider silinirken bir hata oluştu');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return <UnauthorizedAccess message="Giderler sayfasını görüntüleme yetkiniz bulunmamaktadır."/>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Giderler</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrentExpense(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MdAdd className="mr-2" />
            Yeni Gider
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MdFileDownload className="mr-2" />
            Excel'e Aktar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MdPrint className="mr-2" />
            Yazdır
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">Tüm Zamanlar Toplam Masraf</h3>
          <p className="text-2xl font-bold text-gray-800">{summaryData.allTimeExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">Toplam Yıllık Masraf</h3>
          <p className="text-2xl font-bold text-gray-800">{summaryData.yearlyExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">Aylık Masraf (1/12)</h3>
          <p className="text-2xl font-bold text-gray-800">{summaryData.monthlyExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">Haftalık Masraf (1/4 ay)</h3>
          <p className="text-2xl font-bold text-gray-800">{summaryData.weeklyExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-4 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
              <input
                type="date"
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Açıklama veya kategori ile ara..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Hem açıklama hem de kategori içinde arar</p>
            </div>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlangıç Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitiş Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(expense.expenseStartTime).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(expense.expenseEndTime).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expenseTypes.find(c => c.value === expense.expenseType)?.label || expense.expenseType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Number(expense.expenseAmount).toLocaleString('tr-TR')} ₺
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.expenseDescription}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  <button
                    onClick={() => {
                      setCurrentExpense(expense);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <MdEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title={currentExpense ? 'Gider Düzenle' : 'Yeni Gider'}
          onClose={() => setIsModalOpen(false)}
        >
          <ExpenseForm
            expense={currentExpense}
            onSubmit={handleSubmit}
            expenseTypes={expenseTypes.filter(c => c.value !== '')}
          />
        </Modal>
      )}
    </div>
  );
};

const ExpenseForm = ({ expense, onSubmit, expenseTypes }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    expenseAmount: expense?.expenseAmount || '',
    expenseType: expense?.expenseType || expenseTypes[0].value,
    expenseDescription: expense?.expenseDescription || '',
    expenseStartTime: expense?.expenseStartTime ? new Date(expense.expenseStartTime).toISOString().split('T')[0] : today,
    expenseEndTime: expense?.expenseEndTime ? new Date(expense.expenseEndTime).toISOString().split('T')[0] : today
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
        <input
          type="date"
          value={formData.expenseStartTime}
          onChange={(e) => setFormData({ ...formData, expenseStartTime: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
        <input
          type="date"
          value={formData.expenseEndTime}
          onChange={(e) => setFormData({ ...formData, expenseEndTime: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Kategori</label>
        <select
          value={formData.expenseType}
          onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          {expenseTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tutar</label>
        <input
          type="number"
          step="0.01"
          value={formData.expenseAmount}
          onChange={(e) => setFormData({ ...formData, expenseAmount: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Açıklama</label>
        <textarea
          value={formData.expenseDescription}
          onChange={(e) => setFormData({ ...formData, expenseDescription: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows="3"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {expense ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </form>
  );
};

export default Expenses; 