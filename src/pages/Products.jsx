import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdFilterList, 
  MdSearch,
  MdWarning,
  MdSelectAll,
  MdLayersClear,
  MdSwapVert,
  MdDeleteSweep,
  MdFileDownload
} from 'react-icons/md';
import ProductModal from '../components/ProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import productService from '../services/productService';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Table, Tag, ConfigProvider, theme as antTheme, Space } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

const Products = () => {
  // Context hooks
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' veya 'edit'
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: 'all',
    rackNumber: 'all'  // Yeni raf filtresi
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);

  // Sayfalama state'leri
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,  // Sayfa başına gösterilecek ürün sayısı
    totalPages: 1
  });

  // Tablo kolonları
  const columns = [
    {
      title: t('productName'),
      dataIndex: 'name',
      key: 'name',
      render: text => text || '-'
    },
    {
      title: t('sku'),
      dataIndex: 'sku',
      key: 'sku',
      render: text => text || '-'
    },
    {
      title: t('stock'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: quantity => (quantity || quantity === 0) ? quantity.toString() : '-'
    },
    {
      title: t('category'),
      key: 'category',
      render: (_, record) => record?.Category?.name || '-'
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => {
        // Kategori bazlı günlük ücret
        const categoryStorageRates = {
          'Elektronik': 100,
          'Gıda': 150,
          'Kozmetik': 120,
          'Kitap': 50,
          'Giyim': 70,
          'Spor': 80,
          'Ev & Yaşam': 90,
          'Oyuncak': 60,
          'Ofis': 70,
          'Bahçe': 100
        };

        const dailyRate = categoryStorageRates[record?.Category?.name] || 50;
        const duration = record.expectedStorageDuration || 0;
        
        let basePrice = dailyRate * duration;
        let discount = 1.0;
        
        if (duration >= 180) discount = 0.85;      // 6+ ay: %15 indirim
        else if (duration >= 90) discount = 0.90;  // 3+ ay: %10 indirim
        else if (duration >= 30) discount = 0.95;  // 1+ ay: %5 indirim
        
        const finalPrice = basePrice * discount;
        return `₺${finalPrice.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      sorter: (a, b) => {
        const getPrice = (record) => {
          const rates = {
            'Elektronik': 100,
            'Gıda': 150,
            'Kozmetik': 120,
            'Kitap': 50,
            'Giyim': 70,
            'Spor': 80,
            'Ev & Yaşam': 90,
            'Oyuncak': 60,
            'Ofis': 70,
            'Bahçe': 100
          };
          const dailyRate = rates[record?.Category?.name] || 50;
          const duration = record.expectedStorageDuration || 0;
          let basePrice = dailyRate * duration;
          let discount = 1.0;
          if (duration >= 180) discount = 0.85;
          else if (duration >= 90) discount = 0.90;
          else if (duration >= 30) discount = 0.95;
          return basePrice * discount;
        };
        return getPrice(a) - getPrice(b);
      }
    },
    {
      title: t('dailyStorageRate'),
      dataIndex: 'dailyStorageRate',
      key: 'dailyStorageRate',
      render: (rate, record) => {
        const categoryStorageRates = {
          'Elektronik': 100,
          'Gıda': 150,
          'Kozmetik': 120,
          'Kitap': 50,
          'Giyim': 70,
          'Spor': 80,
          'Ev & Yaşam': 90,
          'Oyuncak': 60,
          'Ofis': 70,
          'Bahçe': 100
        };
        
        const dailyRate = categoryStorageRates[record?.Category?.name] || 50;
        return `₺${dailyRate.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      },
      sorter: (a, b) => {
        const getRateByCategory = (category) => {
          const rates = {
            'Elektronik': 100,
            'Gıda': 150,
            'Kozmetik': 120,
            'Kitap': 50,
            'Giyim': 70,
            'Spor': 80,
            'Ev & Yaşam': 90,
            'Oyuncak': 60,
            'Ofis': 70,
            'Bahçe': 100
          };
          return rates[category] || 50;
        };
        return getRateByCategory(a?.Category?.name) - getRateByCategory(b?.Category?.name);
      }
    },
    {
      title: t('weight'),
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => {
        const kg = parseFloat(weight) || 0;
        let category = t('weightLight');
        let color = 'green'; // Hafif için yeşil
        if (kg > 750) {
            category = t('weightHeavy');
            color = 'red'; // Ağır için kırmızı
        } else if (kg >= 250) {
            category = t('weightNormal');
            color = 'orange'; // Normal için turuncu
        }
        // return `${category} (${kg.toFixed(1)} kg)`; // Eski metin gösterimi
        return (
          <Space>
            <Tag color={color}>{category}</Tag>
            <span>({kg.toFixed(1)} kg)</span>
          </Space>
        );
      },
      sorter: (a, b) => (parseFloat(a.weight) || 0) - (parseFloat(b.weight) || 0)
    },
    {
      title: t('palletType'),
      key: 'palletType',
      render: (_, record) => {
        const palletType = record.palletType;
        let displayText = '-';
        let color = 'default';
        if (palletType === 'full') {
          displayText = t('palletFull');
          color = 'blue';
        } else if (palletType === 'half') {
          displayText = t('palletHalf');
          color = 'orange';
        }

        return <Tag color={color}>{displayText}</Tag>;
      },
      filters: [
        { text: t('palletFull'), value: 'full' },
        { text: t('palletHalf'), value: 'half' },
      ],
      onFilter: (value, record) => record.palletType === value,
    },
    {
      title: t('location'),
      key: 'location',
      render: (_, record) => {
        if (!record?.Location) return t('unassigned');
        return `${t('rackPrefix')} ${record.Location.rackNumber}, ${t('levelPrefix')} ${record.Location.level}, ${t('positionPrefix')} ${record.Location.position}`;
      }
    },
    {
      title: t('storageStartDate'),
      dataIndex: 'storageStartDate',
      key: 'storageStartDate',
      render: date => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
    },
    {
      title: t('plannedEndDate'),
      key: 'expectedEndDate',
      render: (_, record) => {
        if (!record?.storageStartDate) return '-';
        const startDate = new Date(record.storageStartDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (record?.expectedStorageDuration || 0));
        return endDate.toLocaleDateString('tr-TR');
      }
    },
    {
      title: t('status'),
      key: 'status',
      render: (_, record) => {
        if (record.storageEndDate) {
          return <Tag color="blue">{t('statusCompleted')}</Tag>;
        } else if (record.storageStartDate) {
          return <Tag color="green">{t('statusActive')}</Tag>;
        }
        return <Tag color="default">{t('statusUnknown')}</Tag>;
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <button 
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleEditProduct(record)}
          >
            <MdEdit size={20} />
          </button>
          <button 
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteProduct(record)}
          >
            <MdDelete size={20} />
          </button>
          {record.locationId && (
            <button 
              className="text-orange-500 hover:text-orange-700"
              onClick={() => handleRemoveFromLocation(record)}
              title={t('removeFromLocation')}
            >
              <MdLayersClear size={20} />
            </button>
          )}
        </Space>
      ),
    },
  ];

  // Ürünleri getir
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts();
      
      if (response?.success && Array.isArray(response.data)) {
        // Gelen veriyi kontrol et ve güvenli bir şekilde dönüştür
        const safeProducts = response.data.map(product => {
          // Debug için
          console.log('Ham ürün verisi:', product);
          
          return {
            ...product,
            name: product?.name || '',
            sku: product?.sku || '',
            quantity: product?.quantity ?? 0,
            category: product?.Category?.name || '',
            Location: product?.Location || null,
            storageStartDate: product?.storageStartDate,
            expectedStorageDuration: product?.expectedStorageDuration || 0,
            width: parseFloat(product?.width) || 0,
            height: parseFloat(product?.height) || 0,
            length: parseFloat(product?.length) || 0,
            weight: parseFloat(product?.weight) || 0,
            price: parseFloat(product?.price) || 0,
            dailyStorageRate: parseFloat(product?.dailyStorageRate) || 0,
            company: product?.company || '',
            palletType: product?.palletType || 'full'
          };
        });
        
        // Debug için
        console.log('İşlenmiş ürün verisi:', safeProducts);
        
        setProducts(safeProducts);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Ürünler yüklenirken bir hata oluştu');
      toast.error('Ürünler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditProduct = (record) => {
    setSelectedProduct(record);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleModalSubmit = async (arg1, arg2) => {
    try {
      if (modalMode === 'edit' && selectedProduct) {
        // Düzenleme modunda arg1=productId, arg2=updatedValues olmalı
        const productId = arg1; // İlk argüman ID
        const updatedValues = arg2; // İkinci argüman güncel veriler

        if (!productId || !updatedValues) {
            console.error("Edit mode submit error: productId or updatedValues missing", { productId, updatedValues });
            toast.error("Güncelleme verileri eksik.");
            return;
        }

        console.log(`Updating product ${productId} with values:`, updatedValues); // Loglama

        const response = await axios.put(
          `http://localhost:3000/api/products/${productId}`, // URL için productId'yi kullan
          updatedValues, // Body için updatedValues'u kullan
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          toast.success('Ürün başarıyla güncellendi');
          fetchProducts();
          setShowModal(false);
      } else {
             // API'den gelen hata mesajını göster
             throw new Error(response.data.message || 'Ürün güncellenirken bir sunucu hatası oluştu');
        }
      } else { // Ekleme modu
        // Ekleme modunda arg1=newValues olmalı, arg2 tanımsız
        const newValues = arg1;
        
        if (!newValues) {
            console.error("Add mode submit error: newValues missing", { newValues });
            toast.error("Eklenecek ürün verileri eksik.");
            return;
        }

        console.log(`Adding new product with values:`, newValues); // Loglama

        const response = await axios.post(
          'http://localhost:3000/api/products',
          newValues, // Body için newValues'u kullan
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          toast.success('Ürün başarıyla eklendi');
          fetchProducts();
          setShowModal(false);
        } else {
          throw new Error(response.data.message || 'Ürün eklenirken bir hata oluştu');
        }
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      // Axios hatasıysa ve response varsa, API mesajını kullan
      const apiErrorMessage = error.response?.data?.message;
      // Genel hata mesajı
      const defaultMessage = modalMode === 'edit' ? 'Ürün güncellenirken bir hata oluştu' : 'Ürün eklenirken bir hata oluştu';
      // Toast mesajı
      toast.error(apiErrorMessage || error.message || defaultMessage);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.name
    });
  };

  // Ürün silme onayı
  const confirmDelete = async (description) => {
    if (deleteModal.productId) {
      try {
        setLoading(true);
        // product ID'si bir dizi ise (toplu silme), bulkDeleteProducts'u çağır
        if (Array.isArray(deleteModal.productId)) {
          await productService.bulkDeleteProducts(deleteModal.productId, description);
          toast.success('Seçili ürünler başarıyla silindi');
        } else {
          // Tek ürün silme
          await productService.deleteProduct(deleteModal.productId, description);
          toast.success('Ürün başarıyla silindi');
        }
        // Silme işleminden sonra verileri yenile ve seçimi temizle
        await fetchProducts(pagination.currentPage, pagination.itemsPerPage, filters);
        setSelectedProducts([]);
      } catch (error) {
        console.error('Silme hatası:', error);
        toast.error('Ürün silinirken bir hata oluştu');
      } finally {
        setLoading(false);
        setDeleteModal({ isOpen: false, productId: null, productName: '' });
      }
    }
  };

  // Tüm ürünleri seç/kaldır
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  // Tekil ürün seçimi
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toplu kategori güncelleme
  const handleBulkCategoryUpdate = async (newCategory) => {
    try {
      await productService.bulkUpdateCategory(selectedProducts, newCategory);
      toast.success(`${selectedProducts.length} ürünün kategorisi güncellendi!`);
      fetchProducts(); // Listeyi yenile
      setSelectedProducts([]);
    } catch (error) {
      toast.error('Kategori güncellenirken bir hata oluştu!');
      console.error('Error updating categories:', error);
    }
  };

  // Kategori dropdown'ını geliştirip daha fazla kategori ekleyelim
  const categories = [
    { id: 'electronics', name: 'Elektronik' },
    { id: 'clothing', name: 'Giyim' },
    { id: 'accessories', name: 'Aksesuarlar' },
    { id: 'sports', name: 'Spor' },
    { id: 'home', name: 'Ev & Yaşam' }
  ];

  // Kategori değiştirme butonunu ve dropdown'ı güncelleyelim
  const CategoryDropdown = () => (
    <div className="relative group">
      <button
        className="flex items-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
      >
        <MdSwapVert className="w-5 h-5 mr-1" />
        Kategori Değiştir
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleBulkCategoryUpdate(category.name)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Filtreleme fonksiyonunu güncelleyelim
  const filterProducts = (products) => {
    return products.filter(product => {
      // Arama filtresi
      const searchMatch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase());

      // Kategori filtresi
      const categoryMatch = filters.category === 'all' || product.categoryId === parseInt(filters.category);

      // Stok durumu filtresi
      const stockMatch = filters.stockStatus === 'all' ||
        (filters.stockStatus === 'low' && product.quantity <= product.minStockLevel) ||
        (filters.stockStatus === 'out' && product.quantity === 0) ||
        (filters.stockStatus === 'in' && product.quantity > 0);

      // Raf filtresi
      const rackMatch = filters.rackNumber === 'all' || 
        (product.Location?.rackNumber === parseInt(filters.rackNumber));

      return searchMatch && categoryMatch && stockMatch && rackMatch;
    });
  };

  // Filtrelenmiş ürünleri hesapla
  const filteredProducts = filterProducts(products);

  // Filtre seçeneklerini products'dan dinamik olarak oluştur
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  // Sayfalanmış ürünleri hesapla
  const paginatedProducts = filteredProducts.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Toplam sayfa sayısını hesapla
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(filteredProducts.length / prev.itemsPerPage)
    }));
  }, [filteredProducts]);

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Sayfa başına ürün sayısını değiştirme
  const handleItemsPerPageChange = (value) => {
    setPagination({
      currentPage: 1,
      itemsPerPage: value,
      totalPages: Math.ceil(filteredProducts.length / value)
    });
  };

  // Toplu silme işlemi
  const handleBulkDelete = async (selectedIds) => {
    try {
        // Token'ı localStorage'dan al
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
            'http://localhost:3000/api/products/bulk-delete', 
            { ids: selectedIds },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            toast.success(response.data.message);
            setSelectedProducts([]); // Seçili ürünleri temizle
            fetchProducts(); // Tabloyu yenile
        }
    } catch (error) {
        console.error('Bulk delete error:', error);
        toast.error('Ürünler silinirken bir hata oluştu');
    }
  };

  // Excel indirme fonksiyonu
  const handleExportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      // Excel dosyasını indirmek için bir fetch isteği yap
      const response = await fetch('http://localhost:3000/api/products/export-excel', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Excel dosyası indirilemedi');
      }

      // Dosya blob olarak indir
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'urunler.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Excel dosyası başarıyla indirildi');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Excel dosyası indirilirken bir hata oluştu');
    }
  };

  // Yeni fonksiyon: Ürünü lokasyondan çıkarma
  const handleRemoveFromLocation = async (product) => {
    if (!product || !product.id || !product.locationId) {
      toast.error("Ürün veya lokasyon bilgisi eksik.");
      return;
    }

    const toastId = toast.loading('Ürün lokasyondan çıkarılıyor...');
    try {
      // 1. Stok çıkış hareketi oluştur
      await axios.post('http://localhost:3000/api/stock-movements', {
        type: 'OUT',
        productId: product.id,
        quantity: 1, // Varsayılan olarak 1 adet çıkarılıyor, ürünün tüm miktarını çıkarmak gerekebilir mi? Şimdilik 1.
        description: `Ürünler sayfasından çıkarıldı (Lokasyon ID: ${product.locationId})`,
        locationId: product.locationId 
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 2. Ürünün lokasyonunu null yap
      await productService.updateProduct(product.id, { locationId: null });

      toast.success('Ürün başarıyla lokasyondan çıkarıldı.', { id: toastId });
      fetchProducts(); // Tabloyu yenile

    } catch (error) {
      console.error("Lokasyondan çıkarma hatası:", error);
      toast.error(`Hata: ${error?.response?.data?.message || error.message || 'Bilinmeyen bir hata oluştu.'}`, { id: toastId });
    }
  };

  // Ant Design tema konfigürasyonu
  const themeConfig = {
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
    },
    components: {
      Card: {
        colorBgContainer: isDark ? 'rgba(30, 32, 37, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',
        boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      Table: {
        colorBgContainer: isDark ? 'rgba(24, 26, 31, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
      },
      Typography: {
        colorText: isDark ? '#e6e6e6' : 'rgba(0, 0, 0, 0.85)',
        colorTextSecondary: isDark ? '#a6a6a6' : 'rgba(0, 0, 0, 0.45)',
      }
    }
  };

  // Loading durumu için
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <div className={`container p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <h1 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Ürün Yönetimi</h1>
        
        {/* Üst Bölüm - Butonlar ve Filtreler */}
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          {/* Butonlar */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
            <button 
              onClick={handleAddProduct}
              className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow transition-colors ${isDark ? 'hover:bg-blue-700' : 'hover:bg-blue-600'}`}
            >
              <MdAdd className="mr-1" size={20} /> Yeni Ürün
            </button>
            
            {selectedProducts.length > 0 && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedProducts([])}
                  className={`flex items-center bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md shadow transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-600'}`}
                >
                  <MdLayersClear className="mr-1" size={20} /> Seçimi Temizle
                </button>
                
                <button 
                  onClick={() => handleBulkDelete(selectedProducts)}
                  className={`flex items-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md shadow transition-colors ${isDark ? 'hover:bg-red-700' : 'hover:bg-red-600'}`}
                >
                  <MdDeleteSweep className="mr-1" size={20} /> Toplu Sil
                </button>
                
                <CategoryDropdown />
              </div>
            )}
            
            <button 
              onClick={handleExportToExcel}
              className={`flex items-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md shadow transition-colors ${isDark ? 'hover:bg-green-700' : 'hover:bg-green-600'}`}
            >
              <MdFileDownload className="mr-1" size={20} /> Excel'e Aktar
            </button>
          </div>
          
          {/* Filtreler */}
          <div className="flex flex-wrap gap-2">
            {/* Arama kutusu */}
            <div className={`relative w-64 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <input
                type="text"
                placeholder={t('searchByNameOrSKU')}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className={`border rounded-md py-2 px-3 pl-10 w-full outline-none focus:border-blue-400 transition-colors ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                }`}
              />
              <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            {/* Kategori Filtresi */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className={`border rounded-md py-2 px-3 outline-none focus:border-blue-400 transition-colors ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{t('allCategories')}</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Gıda">Gıda</option>
              <option value="Kozmetik">Kozmetik</option>
              <option value="Kitap">Kitap</option>
              <option value="Giyim">Giyim</option>
              <option value="Spor">Spor</option>
              <option value="Ev & Yaşam">Ev & Yaşam</option>
              <option value="Oyuncak">Oyuncak</option>
              <option value="Ofis">Ofis</option>
              <option value="Bahçe">Bahçe</option>
            </select>
            
            {/* Stok Filtresi */}
            <select
              value={filters.stockStatus}
              onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
              className={`border rounded-md py-2 px-3 outline-none focus:border-blue-400 transition-colors ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{t('allStockStatuses')}</option>
              <option value="inStock">{t('inStock')}</option>
              <option value="lowStock">{t('lowStock')}</option>
              <option value="outOfStock">{t('outOfStock')}</option>
            </select>
            
            {/* Raf Filtresi */}
            <select
              value={filters.rackNumber}
              onChange={(e) => setFilters({...filters, rackNumber: e.target.value})}
              className={`border rounded-md py-2 px-3 outline-none focus:border-blue-400 transition-colors ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">{t('allRacks')}</option>
              {Array.from(new Set(products.filter(p => p.Location).map(p => p.Location.code))).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className={`rounded-lg shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <Table 
              columns={columns} 
              dataSource={paginatedProducts}
              rowKey="id"
              pagination={{
                current: pagination.currentPage,
                pageSize: pagination.itemsPerPage,
                total: filteredProducts.length,
                onChange: handlePageChange
              }}
            />
          </div>
          
          {filteredProducts.length === 0 && (
            <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <MdSearch className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Sonuç Bulunamadı</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Arama kriterlerinize uygun ürün bulunamadı.
              </p>
            </div>
          )}
        </div>

        {/* Silme Onay Modalı */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
          onConfirm={confirmDelete}
          itemName={deleteModal.productName}
        />

        {/* Ürün Ekleme/Düzenleme Modalı */}
        {showModal && (
        <ProductModal
          visible={showModal}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          initialData={selectedProduct}
          mode={modalMode}
        />
        )}
      </div>
    </ConfigProvider>
  );
};

export default Products; 