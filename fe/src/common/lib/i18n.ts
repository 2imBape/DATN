import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      header: "Welcome to our website",
      language: "Language",
      theme: "Theme",
      toggleTheme: "Toggle Theme",
      footer: "footer",
      logout: "Logout",
      profile: "Profile",
      dark: "Dark",
      light: "Light",
      search_placeholder: "Search Here",
    },
  },
  vi: {
    translation: {
      header: "Chào mừng bạn đến với website của chúng tôi",
      language: "Ngôn ngữ",
      theme: "Chủ đề",
      toggleTheme: "Chuyển chủ đề",
      footer: "trang cuối",
      logout: "Đăng xuất",
      profile: "Hồ sơ",
      dark: "Tối",
      light: "Sáng",
      search_placeholder: "Tìm kiếm ở đây",
    },
  },
};

// Lấy ngôn ngữ từ localStorage nếu có, nếu không thì mặc định là tiếng Anh
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage, // Khởi tạo với ngôn ngữ đã lưu trong localStorage hoặc mặc định
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
