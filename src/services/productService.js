import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const productService = {
  // Tüm ürünleri getir
  getAllProducts: async () => {
    const response = await axios.get(`${API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Yeni ürün ekle
  createProduct: async (productData) => {
    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Ürün güncelle
  updateProduct: async (id, productData) => {
    const response = await axios.put(`${API_URL}/products/${id}`, productData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Ürün sil
  deleteProduct: async (id) => {
    const response = await axios.delete(`${API_URL}/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Toplu ürün sil
  bulkDeleteProducts: async (productIds) => {
    try {
      const response = await axios.post('/api/products/bulk-delete', { productIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Toplu kategori güncelle
  bulkUpdateCategory: async (ids, category) => {
    const response = await axios.post(`${API_URL}/products/bulk-update-category`, 
      { ids, category },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  }
};

export default productService; 