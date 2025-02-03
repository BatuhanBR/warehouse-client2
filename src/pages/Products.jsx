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

  // Genişletilmiş örnek veri
  const dummyProducts = [
    { id: 1, name: 'iPhone 14 Pro', sku: 'PHN001', category: 'Elektronik', stock: 50, minStock: 10, price: 42999, description: '256GB Uzay Siyahı' },
    { id: 2, name: 'Samsung Galaxy S23', sku: 'PHN002', category: 'Elektronik', stock: 35, minStock: 8, price: 34999, description: '256GB Yeşil' },
    { id: 3, name: 'Nike Air Max', sku: 'SHO001', category: 'Giyim', stock: 5, minStock: 20, price: 4599, description: '42 Numara Siyah' },
    { id: 4, name: 'MacBook Pro M2', sku: 'LPT001', category: 'Elektronik', stock: 15, minStock: 5, price: 52999, description: '512GB Gümüş' },
    { id: 5, name: 'Adidas Superstar', sku: 'SHO002', category: 'Giyim', stock: 25, minStock: 15, price: 3299, description: '41 Numara Beyaz' },
    { id: 6, name: 'iPad Air', sku: 'TBL001', category: 'Elektronik', stock: 42, minStock: 12, price: 18999, description: '64GB Uzay Grisi' },
    { id: 7, name: 'Levi\'s 501', sku: 'JNS001', category: 'Giyim', stock: 3, minStock: 10, price: 1299, description: '32-32 Mavi' },
    { id: 8, name: 'Sony WH-1000XM4', sku: 'HDN001', category: 'Elektronik', stock: 28, minStock: 8, price: 7899, description: 'Siyah Kablosuz Kulaklık' }
  ];

  useEffect(() => {
    // API entegrasyonunda burayı kullanacağız
    setProducts(dummyProducts);
    setLoading(false);
  }, []);

  const handleAddProduct = () => {
    setSelectedProduct(null); // Yeni ürün
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = (productData) => {
    if (selectedProduct) {
      // Ürün güncelleme
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, ...productData } : p
      ));
    } else {
      // Yeni ürün ekleme
      const newProduct = {
        ...productData,
        id: Math.max(...products.map(p => p.id)) + 1
      };
      setProducts([...products, newProduct]);
    }
  };

  const handleDeleteProduct = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: product.name
    });
  };

  const confirmDelete = () => {
    // Tekli silme
    if (typeof deleteModal.productId === 'number') {
      setProducts(products.filter(p => p.id !== deleteModal.productId));
    } 
    // Çoklu silme
    else if (Array.isArray(deleteModal.productId)) {
      setProducts(products.filter(p => !deleteModal.productId.includes(p.id)));
    }
    
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
    setSelectedProducts([]); // Seçimleri temizle
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

  // Toplu silme
  const handleBulkDelete = () => {
    setDeleteModal({
      isOpen: true,
      productId: selectedProducts,
      productName: `${selectedProducts.length} ürün`
    });
  };

  // Toplu kategori güncelleme
  const handleBulkCategoryUpdate = (newCategory) => {
    setProducts(products.map(product => 
      selectedProducts.includes(product.id)
        ? { ...product, category: newCategory }
        : product
    ));
    setSelectedProducts([]);
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

      {/* Ürün Tablosu - products yerine filteredProducts kullan */}
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
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
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
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Önceki
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Toplam <span className="font-medium">97</span> üründen{' '}
                  <span className="font-medium">1-10</span> arası gösteriliyor
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* Sayfa numaraları */}
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