import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const productService = {
  // Tüm ürünleri getir
  getAllProducts: async () => {
    try {
        const response = await axios.get(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data; // Bu direkt olarak {success: true, data: [...]} formatında dönecek
    } catch (error) {
        console.error('Product service error:', error);
        throw error;
    }
  },

  // Yeni ürün ekle
  createProduct: async (productData) => {
    try {
        console.log('6. Service - API İsteği:', {
            url: `${API_URL}/products`,
            data: productData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const response = await axios.post(`${API_URL}/products`, productData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('7. Service - API Yanıtı:', response.data);
        return response.data;
    } catch (error) {
        console.error('8. Service - Hata:', {
            message: error.message,
            response: error.response?.data,
            request: error.config
        });
        throw error;
    }
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
  deleteProduct: async (id, description) => {
    const response = await axios.delete(`${API_URL}/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      data: { description }
    });
    return response.data;
  },

  // Toplu ürün sil
  bulkDeleteProducts: async (productIds, description) => {
    const response = await axios.post(`${API_URL}/products/bulk-delete`, 
      { productIds, description },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
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