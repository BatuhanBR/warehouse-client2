import api from './api';
import axios from 'axios';

const shelfService = {
    // Tüm rafları ve içindeki ürünleri getir
    getShelves: async () => {
        try {
            const response = await api.get('/shelves');
            return response.data;
        } catch (error) {
            console.error('Get shelves error:', error);
            throw error;
        }
    },

    // Ürünü rafa yerleştir
    placeProduct: async (data) => {
        try {
            const response = await api.post('/shelves/place-product', data);
            return response.data;
        } catch (error) {
            console.error('Place product error:', error);
            throw error;
        }
    },

    // Ürünü raftan kaldır
    removeProduct: async (cellProductId) => {
        try {
            console.log('Sending remove product request for cellProductId:', cellProductId);
            
            // Direk API URL'sini kullan, olası hata kaynaklarını azalt
            const url = 'http://localhost:3000/api/shelves/remove-product/' + cellProductId;
            console.log('Full URL:', url);
            
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('Headers:', headers);
            
            const response = await axios.delete(url, { headers });
            console.log('Remove product response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in removeProduct:', error.response || error);
            throw error;
        }
    }
};

export default shelfService; 