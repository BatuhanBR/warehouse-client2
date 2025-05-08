import React, { useState, useEffect } from 'react';
import { MdAdd, MdFileDownload, MdPrint, MdEdit, MdDelete } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedAccess from '../components/UnauthorizedAccess';
import { Spin } from 'antd';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    { value: '', label: t('expenseTypeAll') },
    { value: 'office', label: t('office') },
    { value: 'utility', label: t('utility') },
    { value: 'salary', label: t('salary') }
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
      toast.error(t('expenseLoadError'));
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
      toast.error(t('excelExportError'));
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
      toast.error(t('pdfExportError'));
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
        toast.success(t('expenseUpdateSuccess'));
      } else {
        await axios.post('http://localhost:3000/api/expenses', formData, { headers });
        toast.success(t('expenseAddSuccess'));
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      logError(error, 'handleSubmit');
      toast.error(t('expenseOperationFailed'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('expenseDeleteConfirm'))) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/expenses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success(t('expenseDeleteSuccess'));
        fetchExpenses();
      } catch (error) {
        logError(error, 'handleDelete');
        toast.error(t('expenseDeleteError'));
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
    return <UnauthorizedAccess message={t('expenseUnauthorized')}/>;
  }

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t('expenses')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrentExpense(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MdAdd className="mr-2" />
            {t('newExpense')}
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MdFileDownload className="mr-2" />
            {t('exportToExcel')}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MdPrint className="mr-2" />
            {t('print')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('allTimeTotalExpense')}</h3>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summaryData.allTimeExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('totalYearlyExpense')}</h3>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summaryData.yearlyExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('monthlyExpense')}</h3>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summaryData.monthlyExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('weeklyExpense')}</h3>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summaryData.weeklyExpense?.toLocaleString('tr-TR') || 0} ₺</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex gap-4 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
            >
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                placeholder={t('startDate')}
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                placeholder={t('endDate')}
              />
            </div>
            <input
              type="text"
              placeholder={t('searchByDescOrCategory')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-4 py-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('description')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('expenseCategory')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('expenseCategory')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {expenses.map(expense => (
                <tr key={expense.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{new Date(expense.expenseStartTime).toLocaleDateString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{expense.expenseDescription}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isDark ? 'bg-opacity-50' : ''} 
                      ${expense.expenseType === 'office' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                      expense.expenseType === 'utility' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
                      expense.expenseType === 'salary' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {t(expenseTypes.find(t => t.value === expense.expenseType)?.label || expense.expenseType)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{Number(expense.expenseAmount).toLocaleString('tr-TR')} ₺</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => { setCurrentExpense(expense); setIsModalOpen(true); }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <MdEdit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(expense.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      <MdDelete size={20}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <div className={`text-center py-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('noExpensesFound')}</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentExpense ? t('editExpense') : t('newExpense')}>
          <ExpenseForm
            expense={currentExpense}
            onSubmit={handleSubmit}
            expenseTypes={expenseTypes}
            isDark={isDark}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

const ExpenseForm = ({ expense, onSubmit, expenseTypes, isDark, onCancel }) => {
  const { t } = useLanguage();
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
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('date')}</label>
        <input
          type="date"
          name="date"
          value={formData.expenseStartTime}
          onChange={(e) => setFormData({ ...formData, expenseStartTime: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('description')}</label>
        <input
          type="text"
          name="description"
          value={formData.expenseDescription}
          onChange={(e) => setFormData({ ...formData, expenseDescription: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('expenseCategory')}</label>
        <select
          name="expenseType"
          value={formData.expenseType}
          onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">{t('selectCategory')}</option>
          {expenseTypes.filter(t => t.value).map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('amount')}</label>
        <input
          type="number"
          name="amount"
          step="0.01"
          value={formData.expenseAmount}
          onChange={(e) => setFormData({ ...formData, expenseAmount: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={onCancel} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
          {t('cancel')}
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          {expense ? t('updateExpense') : t('addExpense')}
        </button>
      </div>
    </form>
  );
};

export default Expenses; 