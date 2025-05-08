import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API URL'sini ve token bilgisini merkezi olarak yönetelim
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'; // Port 5000'den 3000'e değiştirildi

const getTokenPayload = (token) => {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token decode hatası:', error);
        return null;
    }
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token')); // Token'ı state'e al
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            const payload = getTokenPayload(token);
            if (payload) {
                // Token geçerliyse kullanıcı bilgisini ayarla
                setUser({
                    id: payload.id,
                    username: payload.username, // Kullanıcı adı da eklenmeli
                    email: payload.email,
                    role: payload.role,
                    profilePictureUrl: payload.profilePictureUrl // Profil fotoğrafı URL'si de token'da olmalı
                });
            } else {
                // Geçersiz token, temizle
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        } else {
            setUser(null); // Token yoksa kullanıcı null
        }
        setLoading(false);
    }, [token]); // Token değiştiğinde useEffect çalışsın

    const login = async (email, password) => {
        setLoading(true);
        try {
            // Login endpoint'i API_BASE_URL kullanmalı
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const newToken = response.data.token;
                localStorage.setItem('token', newToken);
                setToken(newToken); // State'deki token'ı güncelle
                // setUser useEffect tarafından otomatik olarak güncellenecek
                setLoading(false);
                return true;
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
            throw error; // Hata fırlatmaya devam et, login formu işlesin
        }
        setLoading(false);
        return false; // Başarısız giriş
    };

    const logout = useCallback(() => { // useCallback ile saralım, gereksiz renderları önleyebilir
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    // Yeni fonksiyon: Kullanıcı state'ini dışarıdan güncellemek için
    const updateAuthUser = useCallback((updatedUserData) => {
        setUser(currentUser => {
            // Mevcut kullanıcı bilgileriyle yeni gelenleri birleştir
            // Bu, sadece değişen alanları güncellemeyi sağlar
            if (!currentUser) return updatedUserData; // Eğer mevcut kullanıcı yoksa direkt yeni datayı ata
            return { ...currentUser, ...updatedUserData };
        });
        // İsteğe bağlı: Güncellenmiş kullanıcı bilgisini içeren token'ı da güncelleyebiliriz
        // ancak bu genellikle backend'in yeni bir token vermesini gerektirir.
        // Şimdilik sadece state'i güncelliyoruz.
    }, []);

    const value = {
        user,
        token, // Token'ı da context'e ekle, Profile.jsx kullanıyor
        login,
        logout,
        loading,
        updateAuthUser // Yeni fonksiyonu context değerine ekle
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Loading true iken içeriği göstermeme artık PrivateRoute'da ele alınabilir */}
            {/* veya burada bir yükleme göstergesi gösterilebilir */}
             {loading ? <div>Auth Yükleniyor...</div> : children} 
        </AuthContext.Provider>
    );
}; 