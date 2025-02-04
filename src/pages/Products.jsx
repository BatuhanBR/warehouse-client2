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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    stockStatus: 'all'
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Sayfalama state'leri
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,  // Sayfa başına gösterilecek ürün sayısı
    totalPages: 1
  });

  // Ürünleri getir
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      
      const formattedProducts = response.data.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.Category?.name || 'Kategorisiz',
        stock: product.quantity,
        minStock: product.minStockLevel,
        price: product.price,
        description: product.description || '',
        locationId: product.locationId
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ürünler yüklenirken bir hata oluştu!');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null); // Yeni ürün
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Ürün kaydetme
  const handleSaveProduct = async (productData) => {
    try {
      console.log('3. API Çağrısı Öncesi Veri:', productData);
      const response = await productService.createProduct(productData);
      console.log('4. API Yanıtı:', response);

      if (response.success) {
        toast.success('Ürün başarıyla eklendi!');
        fetchProducts();
        setShowModal(false);
      }
    } catch (error) {
      // Hata detayını daha açık görelim
      console.error('5. Hata Detayı:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'İşlem sırasında bir hata oluştu!');
      }
    }
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

  // Filtrelenmiş ürünleri hesapla
  const filteredProducts = products.filter(product => {
    // Arama filtresi
    const searchFilter = filters.search.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(searchFilter) ||
      product.sku.toLowerCase().includes(searchFilter) ||
      product.description.toLowerCase().includes(searchFilter);

    // Kategori filtresi
    const matchesCategory = 
      filters.category === 'all' || 
      product.category.toLowerCase() === filters.category.toLowerCase();

    // Stok durumu filtresi
    let matchesStock = true;
    switch (filters.stockStatus) {
      case 'low':
        matchesStock = product.stock <= product.minStock;
        break;
      case 'out':
        matchesStock = product.stock === 0;
        break;
      case 'normal':
        matchesStock = product.stock > product.minStock;
        break;
      default:
        matchesStock = true;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

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
  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    
    setDeleteModal({
      isOpen: true,
      productId: selectedProducts, // Array olarak gönder
      productName: `${selectedProducts.length} ürün`
    });
  };

  // Loading durumu için
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
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
                onClick={handleBulkDelete}
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      product.stock <= product.minStock 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {product.stock}
                      {product.stock <= product.minStock && (
                        <MdWarning className="inline ml-1 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.price.toLocaleString('tr-TR', { 
                        style: 'currency', 
                        currency: 'TRY' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.description.length > 50 
                        ? `${product.description.substring(0, 50)}...`
                        : product.description
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default Products; 