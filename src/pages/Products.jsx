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
  MdDeleteSweep
} from 'react-icons/md';
import ProductModal from '../components/ProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import productService from '../services/productService';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Table, Tag } from 'antd';

const Products = () => {
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
    <div className="space-y-6">
      {/* Üst Başlık ve Butonlar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Ürünler {selectedProducts.length > 0 && 
            <span className="text-sm font-normal text-gray-500">
              ({selectedProducts.length} ürün seçili)
            </span>
          }
        </h1>
        <div className="flex space-x-2">
          {selectedProducts.length > 0 && (
            <>
              <button
                onClick={() => setSelectedProducts([])}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MdLayersClear className="w-5 h-5 mr-1" />
                Seçimi Temizle
              </button>
              <CategoryDropdown />
              <button
                onClick={() => {
                    if (selectedProducts.length === 0) {
                        toast.error('Lütfen silinecek ürünleri seçin');
                        return;
                    }
                    handleBulkDelete(selectedProducts);
                }}
                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <MdDeleteSweep className="w-5 h-5 mr-1" />
                Toplu Sil ({selectedProducts.length})
              </button>
            </>
          )}
          <button
            onClick={handleAddProduct}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <MdAdd className="w-5 h-5 mr-2" />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Filtreler ve Arama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün adı, SKU veya açıklama ile ara..."
            className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <select
          className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">Tüm Kategoriler</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={filters.stockStatus}
          onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
        >
          <option value="all">Tüm Stok Durumları</option>
          <option value="normal">Normal Stok</option>
          <option value="low">Düşük Stok</option>
          <option value="out">Stok Yok</option>
        </select>

        {/* Yeni raf filtresi */}
        <select
          className="p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={filters.rackNumber}
          onChange={(e) => setFilters({ ...filters, rackNumber: e.target.value })}
        >
          <option value="all">Tüm Raflar</option>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Raf {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Filtreleme Özeti */}
      {(filters.search || filters.category !== 'all' || filters.stockStatus !== 'all') && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Filtrelenen sonuçlar: {filteredProducts.length} ürün
            </span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                Arama: {filters.search}
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Kategori: {filters.category}
              </span>
            )}
            {filters.stockStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Stok: {filters.stockStatus === 'low' ? 'Düşük' : filters.stockStatus === 'out' ? 'Yok' : 'Normal'}
              </span>
            )}
          </div>
          <button
            onClick={() => setFilters({
              search: '',
              category: 'all',
              stockStatus: 'all'
            })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Ürün Tablosu */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
          <div className="text-center py-12">
            <MdSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sonuç Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun ürün bulunamadı.
            </p>
          </div>
        )}

        {/* Sayfalama */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Mobil Sayfalama */}
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Önceki
              </button>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Sonraki
              </button>
            </div>

            {/* Desktop Sayfalama */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Sayfa başına göster
                </span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700 ml-4">
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
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
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
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
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
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
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    Son
                  </button>
                </nav>
              </div>
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
  );
};

export default Products; 