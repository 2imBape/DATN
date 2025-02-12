import "boxicons/css/boxicons.min.css";
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="text-white">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-wrap justify-between">
          {/* Logo and information */}
          <div className="w-full md:w-1/2 lg:w-1/3 mb-6">
            <a href="#" className="flex items-center text-3xl font-bold mb-4">
              <i className="bx bx-movie-play bx-tada text-red-500 mr-2"></i>
              <span className="text-red-500">M</span>OV
              <span className="text-red-500">I</span>E <span> </span>
              <span className="text-red-500">S</span>T
              <span className="text-red-500">O</span>R
              <span className="text-red-500">E</span>
            </a>
            <p className="text-gray-400">
              Nơi chia sẻ niềm đam mê điện ảnh và các bộ phim hấp dẫn.
            </p>
            <div className="flex space-x-2 mt-2">
              <a
                href="#"
                className="bg-white text-gray-900 rounded-full p-2 hover:bg-gray-200"
              >
                <i className="bx bxl-facebook"></i>
              </a>
              <a
                href="#"
                className="bg-white text-gray-900 rounded-full p-2 hover:bg-gray-200"
              >
                <i className="bx bxl-twitter"></i>
              </a>
              <a
                href="#"
                className="bg-white text-gray-900 rounded-full p-2 hover:bg-gray-200"
              >
                <i className="bx bxl-instagram"></i>
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="w-full md:w-1/2 lg:w-2/3 flex flex-wrap">
            <div className="w-1/2 md:w-1/4 mb-6">
              <p className="font-semibold mb-3">Giới thiệu</p>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link className="hover:text-white" to="/about#section1">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/goi-dich-vu#section2">
                    Các gói dịch vụ
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/ho-tro#section3">
                    Hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/tai-khoan#section4">
                    Đăng kí tài khoản
                  </Link>
                </li>
              </ul>
            </div>
            <div className="w-1/2 md:w-1/4 mb-6">
              <p className="font-semibold mb-3">Gói dịch vụ</p>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link className="hover:text-white" to="/thanh-toan#section5">
                    Hình thức thanh toán
                  </Link>
                </li>
              </ul>
            </div>
            <div className="w-1/2 md:w-1/4 mb-6">
              <p className="font-semibold mb-3">Hỗ trợ</p>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link className="hover:text-white" to="/chinh-sach#section6">
                    Chính sách chung
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 py-4 text-center text-gray-400">
        <p>© 2024 Website Bán Phim Gói Movie Store</p>
      </div>
    </footer>
  );
};

export default Footer;
