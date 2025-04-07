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
import { Table, Tag, ConfigProvider, theme as antTheme } from 'antd';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { defaultAlgorithm, darkAlgorithm } = antTheme;

const Products = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  
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
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
      render: text => text || '-'
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: text => text || '-'
    },
    {
      title: 'Stok',
      dataIndex: 'quantity',
      key: 'quantity',
      render: quantity => (quantity || quantity === 0) ? quantity.toString() : '-'
    },
    {
      title: 'Kategori',
      key: 'category',
      render: (_, record) => record?.Category?.name || '-'
    },
    {
      title: 'Fiyat',
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
      title: 'Günlük Depolama',
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
      title: 'Ağırlık',
      dataIndex: 'weight',
      key: 'weight',
      render: weight => `${weight} kg`
    },
    {
      title: 'Boyutlar (cm)',
      key: 'dimensions',
      render: (_, record) => {
        const width = Number(record.width || 0).toFixed(1);
        const height = Number(record.height || 0).toFixed(1);
        const length = Number(record.length || 0).toFixed(1);
        
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <div>En: {width}</div>
            <div>Boy: {height}</div>
            <div>Derinlik: {length}</div>
          </div>
        );
      }
    },
    {
      title: 'Boyut Kategorisi',
      dataIndex: 'sizeCategory',
      key: 'sizeCategory',
      render: (_, record) => {
        // Hacim hesaplama (cm³)
        const width = Number(record.width || 0);
        const height = Number(record.height || 0);
        const length = Number(record.length || 0);
        const volume = width * height * length;
        
        // Boyut kategorisi belirleme
        let category;
        let color;
        
        if (volume <= 5000) { // 5.000 cm³ = 5 litre
          category = 'Küçük';
          color = 'success';
        } else if (volume <= 50000) { // 50.000 cm³ = 50 litre
          category = 'Normal';
          color = 'processing';
        } else {
          category = 'Büyük';
          color = 'warning';
        }

        return (
          <Tag color={color}>
            {category} ({(volume/1000).toFixed(3)} L)
          </Tag>
        );
      },
      sorter: (a, b) => {
        const getVolume = (record) => {
          const width = Number(record.width || 0);
          const height = Number(record.height || 0);
          const length = Number(record.length || 0);
          return width * height * length;
        };
        return getVolume(a) - getVolume(b);
      }
    },
    {
      title: 'Lokasyon',
      key: 'location',
      render: (_, record) => {
        if (!record?.Location) return 'Atanmamış';
        return `Raf ${record.Location.rackNumber}, Kat ${record.Location.level}, Pozisyon ${record.Location.position}`;
      }
    },
    {
      title: 'Depolama Başlangıç',
      dataIndex: 'storageStartDate',
      key: 'storageStartDate',
      render: date => date ? new Date(date).toLocaleDateString('tr-TR') : '-'
    },
    {
      title: 'Planlanan Bitiş',
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
      title: 'Şirket',
      key: 'company',
      render: (_, record) => record?.company || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleEditProduct(record)}
            className="text-primary-600 hover:text-primary-900"
          >
            <MdEdit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleDeleteProduct(record)}
            className="text-red-600 hover:text-red-900"
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      )
    }
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
            company: product?.company || ''
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

  const handleModalSubmit = async (values) => {
    try {
      if (modalMode === 'edit' && selectedProduct) {
        // Düzenleme işlemi
        const response = await axios.put(
          `http://localhost:3000/api/products/${selectedProduct.id}`,
          values,
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
        }
      } else {
        // Yeni ürün ekleme işlemi
        const response = await axios.post(
          'http://localhost:3000/api/products',
          values,
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
      toast.error(error.response?.data?.message || (modalMode === 'edit' ? 'Ürün güncellenirken bir hata oluştu' : 'Ürün eklenirken bir hata oluştu'));
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

  // Silme işlemi
  const confirmDelete = async () => {
    try {
      if (typeof deleteModal.productId === 'number') {
        // Tekli silme
        await productService.deleteProduct(deleteModal.productId);
        toast.success('Ürün başarıyla silindi!');
      } else if (Array.isArray(deleteModal.productId)) {
        // Toplu silme
        await productService.bulkDeleteProducts(deleteModal.productId);
        toast.success(`${deleteModal.productId.length} ürün başarıyla silindi!`);
      }
      fetchProducts(); // Listeyi yenile
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
      setSelectedProducts([]);
    } catch (error) {
      toast.error('Silme işlemi sırasında bir hata oluştu!');
      console.error('Error deleting products:', error);
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
                placeholder="Ürün ara..."
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
              <option value="all">Tüm Kategoriler</option>
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
              <option value="all">Tüm Stok Durumları</option>
              <option value="inStock">Stokta Var</option>
              <option value="lowStock">Düşük Stok</option>
              <option value="outOfStock">Tükendi</option>
            </select>
            
            {/* Raf Filtresi */}
            <select
              value={filters.rackNumber}
              onChange={(e) => setFilters({...filters, rackNumber: e.target.value})}
              className={`border rounded-md py-2 px-3 outline-none focus:border-blue-400 transition-colors ${
                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">Tüm Raflar</option>
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

          {/* Sayfalama */}
          <div className={`px-4 py-3 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sm:px-6`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="text-sm mr-4">
                  Sayfa başına göster
                </span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className={`border rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm ml-4">
                  Toplam <span className="font-medium">{filteredProducts.length}</span> üründen{' '}
                  <span className="font-medium">
                    {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredProducts.length)}
                  </span>{' '}
                  arası gösteriliyor
                </span>
              </div>

              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* İlk Sayfa */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    İlk
                  </button>

                  {/* Sayfa Numaraları */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === pagination.currentPage;

                    // Sadece mevcut sayfanın etrafındaki 2 sayfayı göster
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      Math.abs(pageNumber - pagination.currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                            ${isCurrentPage 
                              ? isDark
                                ? 'z-10 bg-blue-900 border-blue-800 text-blue-300'
                                : 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : isDark
                                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    // Sayfa atlaması için üç nokta
                    if (Math.abs(pageNumber - pagination.currentPage) === 2) {
                      return (
                        <span
                          key={pageNumber}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            isDark 
                              ? 'bg-gray-700 border-gray-600 text-gray-400'
                              : 'border-gray-300 bg-white text-gray-700'
                          }`}
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  {/* Son Sayfa */}
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    Son
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Silme Onay Modalı */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
          onConfirm={confirmDelete}
          itemName={deleteModal.productName}
        />

        {/* Ürün Modalı */}
        <ProductModal
          visible={showModal}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          initialData={selectedProduct}
          mode={modalMode}
        />
      </div>
    </ConfigProvider>
  );
};

export default Products; 