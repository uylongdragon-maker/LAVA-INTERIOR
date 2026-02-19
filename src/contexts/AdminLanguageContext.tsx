
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface AdminLanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
    'dashboard': { en: 'Dashboard', vi: 'Tổng quan' },
    'products': { en: 'Products', vi: 'Sản phẩm' },
    'orders': { en: 'Orders', vi: 'Đơn hàng' },
    'content': { en: 'Content', vi: 'Nội dung' },
    'settings': { en: 'Settings', vi: 'Cài đặt' },
    'logout': { en: 'Logout', vi: 'Đăng xuất' },
    'welcome': { en: 'Welcome', vi: 'Xin chào' },
    'total_revenue': { en: 'Total Revenue', vi: 'Tổng doanh thu' },
    'total_orders': { en: 'Total Orders', vi: 'Tổng đơn hàng' },
    'low_stock': { en: 'Low Stock Items', vi: 'Sản phẩm sắp hết' },
    'recent_activity': { en: 'Recent Activity', vi: 'Hoạt động gần đây' },
    'search_placeholder': { en: 'Search...', vi: 'Tìm kiếm...' },
    'add_product': { en: 'Add Product', vi: 'Thêm sản phẩm' },
    'save': { en: 'Save', vi: 'Lưu' },
    'cancel': { en: 'Cancel', vi: 'Hủy' },
    'edit': { en: 'Edit', vi: 'Sửa' },
    'delete': { en: 'Delete', vi: 'Xóa' },
    'status': { en: 'Status', vi: 'Trạng thái' },
    'price': { en: 'Price', vi: 'Giá' },
    'stock': { en: 'Stock', vi: 'Kho' },
};

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export const AdminLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('vi'); // Default to Vietnamese

    const t = (key: string): string => {
        return translations[key]?.[language] || key;
    };

    return (
        <AdminLanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </AdminLanguageContext.Provider>
    );
};

export const useAdminLang = () => {
    const context = useContext(AdminLanguageContext);
    if (!context) {
        throw new Error('useAdminLang must be used within an AdminLanguageProvider');
    }
    return context;
};
