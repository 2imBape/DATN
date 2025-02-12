import NotificationBell from "@/components/NotificationBell";
import instance from "@/configs/axios";
import getGreeting from "@/utils/utils";
import {
  BellOutlined,
  HeartFilled,
  LogoutOutlined,
  SettingOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Dropdown, Input, Menu, message, Modal, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FaRegUser, FaShoppingCart } from "react-icons/fa";
import { TbRosetteDiscount } from "react-icons/tb";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import "../../../../styles/Home.css";

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 10px;
  width: 100%;
`;

const ListItem = styled.div`
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease-in-out;
  font-family: "Arial", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;

  &:hover {
    background-color: #ffeb99;
    cursor: pointer;
  }
`;

interface Category {
  _id: string;
  name: string;
  slug: string;
}
interface Country {
  _id: string;
  name: string;
  slug: string;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<{ avatar: string; name: string } | null>(
    null
  );
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [country, setCountry] = useState<Country[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [wallet, setWallet] = useState<any | null>(null);
  const [discount, setDiscount] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const greeting = getGreeting();

  const users = user?.name;
  const wallets = wallet?.balance;

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const liRef = useRef<HTMLLIElement | null>(null); // ref cho li
  const dropdownRef = useRef<HTMLDivElement | null>(null); // ref cho dropdown
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // ref để lưu timeout

  // Mở dropdown khi di chuột vào "GIỚI THIỆU"
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Xóa timeout cũ nếu có
    }
    setDropdownOpen(true); // Mở dropdown khi di chuột vào li
  };

  // Đóng dropdown khi chuột rời khỏi cả li và dropdown sau một khoảng thời gian
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Xóa timeout cũ nếu có
    }

    timeoutRef.current = setTimeout(() => {
      // Kiểm tra nếu chuột ra ngoài cả li và dropdown thì ẩn dropdown
      if (
        liRef.current &&
        dropdownRef.current &&
        !liRef.current.contains(document.activeElement) &&
        !dropdownRef.current.contains(document.activeElement)
      ) {
        setDropdownOpen(false); // Đóng dropdown
      }
    }, 200); // Trì hoãn việc đóng dropdown để tránh bị ẩn ngay lập tức
  };

  // Đóng dropdown khi người dùng chọn một phần tử
  const handleItemClick = () => {
    setDropdownOpen(false); // Đóng dropdown khi chọn mục
  };

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const fetchUserWallet = async () => {
      try {
        const response = await instance.get("wallet");
        setWallet(response.data);
      } catch (error) {}
    };

    fetchUserWallet();
  }, []);

  useEffect(() => {
    const fetchUserDiscount = async () => {
      try {
        const response = await instance.get("discount/user");
        console.log(response.data);
        setDiscount(response.data);
      } catch (error) {}
    };
    console.log(discount);

    fetchUserDiscount();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await instance.get("/category");
      setCategories(response.data.movie);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };
  const fetchCountry = async () => {
    try {
      const response = await instance.get("/country");
      setCountry(response.data.country);
    } catch (error) {
      console.error("Failed to fetch country:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const packageStatus = localStorage.getItem("checkPackageUser");
    if (packageStatus) {
      setHasPurchased(JSON.parse(packageStatus));
    }
  }, []);

  // Hàm hiển thị Modal
  const showDiscountModal = () => {
    setIsModalVisible(true);
  };

  // Hàm đóng Modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await instance.post("/auth/logout", { token: token });
      localStorage.removeItem("authToken");
      localStorage.removeItem("username");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("checkPackageUser");
      localStorage.removeItem("user");
      setUser(null);
      message.success("Bạn đã đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.");
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      navigate(`/search?search=${searchTerm}`);
      setSearchTerm("");
    }
  };

  const menu = (
    <Menu
      theme="dark"
      mode="horizontal"
      style={{ background: "#1c1c1c", width: "100%" }}
    >
      {/* Lời chào */}
      <Menu.Item
        key="0"
        style={{
          width: "auto",
          padding: "0 40px",
          marginRight: "20px",
        }}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
          }}
        >
          {greeting},&nbsp;<span style={{ fontWeight: "bold" }}>{users}</span>
        </div>
      </Menu.Item>

      {/* Ví tiền */}
      <Menu.Item
        key="6"
        style={{
          width: "auto",
          padding: "0 40px",
          fontSize: "16px",
          marginRight: "20px",
        }}
      >
        <Link
          to="/setting/wallet"
          style={{ color: "white", display: "flex", alignItems: "center" }}
        >
          <WalletOutlined style={{ marginRight: "10px", fontSize: "16px" }} />
          Số dư :&nbsp; <span style={{ fontWeight: "bold" }}>
            {wallets} xu
          </span>{" "}
        </Link>
      </Menu.Item>

      {/* Phim đặt trước */}
      <Menu.Item
        key="1"
        style={{
          width: "auto",
          padding: "0 40px",
          fontSize: "16px",
          marginRight: "20px",
        }}
      >
        <Link
          to="/subscrip"
          style={{ color: "white", display: "flex", alignItems: "center" }}
        >
          <BellOutlined style={{ marginRight: "10px", fontSize: "16px" }} />
          Phim đặt trước
        </Link>
      </Menu.Item>

      {/* Yêu thích */}
      <Menu.Item
        key="2"
        style={{
          width: "auto",
          padding: "0 40px",
          fontSize: "16px",
          marginRight: "20px",
        }}
      >
        <Link
          to="/favorite"
          style={{ color: "white", display: "flex", alignItems: "center" }}
        >
          <HeartFilled style={{ marginRight: "10px", fontSize: "16px" }} /> Yêu
          thích
        </Link>
      </Menu.Item>

      {/* Mã giảm giá */}
      <Menu.Item
        key="3"
        style={{
          width: "auto",
          padding: "0 40px",
          fontSize: "16px",
          marginRight: "20px",
        }}
        onClick={showDiscountModal}
      >
        <a
          style={{
            color: "white",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <TbRosetteDiscount
            style={{ marginRight: "10px", fontSize: "16px" }}
          />
          Mã giảm giá
        </a>
      </Menu.Item>

      {/* Cài đặt */}
      <Menu.Item
        key="4"
        style={{
          width: "auto",
          padding: "0 40px",
          fontSize: "16px",
          marginRight: "20px",
        }}
      >
        <Link
          to="/setting"
          style={{ color: "white", display: "flex", alignItems: "center" }}
        >
          <SettingOutlined style={{ marginRight: "10px", fontSize: "16px" }} />
          Cài đặt
        </Link>
      </Menu.Item>

      <Menu.Item
        key="divider"
        disabled
        style={{ cursor: "default", padding: "0" }}
      >
        <div
          style={{
            borderLeft: "300px solid white",
            height: "1px",
            margin: "10px auto",
          }}
        ></div>
      </Menu.Item>

      {/* Đăng xuất */}
      <Menu.Item
        key="5"
        style={{
          width: "auto",
          padding: "0 40px",
          fontSize: "16px",
          marginRight: "20px",
          marginBottom: "15px",
        }}
      >
        <a
          onClick={handleLogout}
          style={{
            color: "rgba(255, 0, 0, 1)", // Màu đỏ rất nhạt
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <LogoutOutlined style={{ marginRight: "10px", fontSize: "16px" }} />
          Đăng xuất
        </a>
      </Menu.Item>
    </Menu>
  );

  const renderCategories = (
    <ListContainer>
      {categories.length > 0 ? (
        categories.map((category) => (
          <ListItem key={category._id}>
            <Link to={`/category/${category.slug}`}>{category.name}</Link>
          </ListItem>
        ))
      ) : (
        <div>No categories available</div>
      )}
    </ListContainer>
  );

  const renderCountrys = (
    <ListContainer>
      {country.length > 0 ? (
        country.map((country) => (
          <ListItem key={country._id}>
            <Link to={`/country/${country.slug}`}>{country.name}</Link>
          </ListItem>
        ))
      ) : (
        <div>No countries available</div>
      )}
    </ListContainer>
  );

  return (
    <HeaderContainer>
      <div className="nav-wrapper mb-10">
      <div className="fixed top-0 left-0 w-full bg-[#121212] z-[9999]">
        <div className="nav-wrapper border-b border-red-500">
          <div className="container mx-auto">
            <div className="nav justify-between align-middle">
              <a href="/" className="logo">
                <i className="bx bx-movie-play bx-tada main-color"></i>M
                <span className="main-color">O</span>V
                <span className="main-color">I</span>E
              </a>
              <ul className="nav-menu" id="nav-menu">
                <li>
                  <Link
                    to="/"
                    style={{
                      color: location.pathname === "/" ? "#c0392b" : "inherit",
                      borderRadius: "5px",
                      padding: "10px 5px",
                      fontWeight: "bold",
                      transition: "all 0.3s ease-in-out",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#c0392b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        location.pathname === "/" ? "#c0392b" : "inherit")
                    }
                  >
                    Trang chủ
                  </Link>
                </li>
                <li
                  style={{
                    color: location.pathname.startsWith("/category")
                      ? "#c0392b"
                      : "inherit",
                    borderRadius: "5px",
                    padding: "10px 5px",
                    fontWeight: location.pathname.startsWith("/category")
                      ? "bold"
                      : "normal",
                    transition: "all 0.3s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!location.pathname.startsWith("/category")) {
                      e.currentTarget.style.color = "#c0392b";
                    }
                    fetchCategories();
                  }}
                  onMouseLeave={(e) => {
                    if (!location.pathname.startsWith("/category")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "inherit";
                    }
                  }}
                >
                  <Dropdown
                    overlay={renderCategories}
                    trigger={["hover"]}
                    placement="bottomCenter"
                    overlayStyle={{
                      paddingTop: "20px",
                    }}
                  >
                    <a
                      href="#"
                      style={{
                        color: location.pathname.startsWith("/category")
                          ? "#c0392b"
                          : "inherit",
                      }}
                    >
                      Thể loại
                    </a>
                  </Dropdown>
                </li>
                <li
                  style={{
                    color: location.pathname.startsWith("/country")
                      ? "#c0392b"
                      : "inherit",
                    borderRadius: "5px",
                    padding: "10px 5px",
                    fontWeight: location.pathname.startsWith("/country")
                      ? "bold"
                      : "normal",
                    transition: "all 0.3s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!location.pathname.startsWith("/country")) {
                      e.currentTarget.style.color = "#c0392b";
                    }
                    fetchCountry();
                  }}
                  onMouseLeave={(e) => {
                    if (!location.pathname.startsWith("/country")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "inherit";
                    }
                  }}
                >
                  <Dropdown
                    overlay={renderCountrys}
                    trigger={["hover"]}
                    placement="bottomCenter"
                    overlayStyle={{
                      paddingTop: "20px",
                    }}
                  >
                    <a
                      href="#"
                      style={{
                        color: location.pathname.startsWith("/country")
                          ? "#c0392b"
                          : "inherit",
                      }}
                    >
                      Quốc gia
                    </a>
                  </Dropdown>
                </li>

                <li
                  ref={liRef} // ref cho li
                  style={{
                    position: "relative",
                    listStyle: "none",
                    display: "inline-block",
                  }}
                  onMouseEnter={handleMouseEnter} // Mở dropdown khi di chuột vào "GIỚI THIỆU"
                  onMouseLeave={handleMouseLeave} // Đóng dropdown sau khi di chuột ra ngoài
                >
                  {/* Link chính "GIỚI THIỆU" */}
                  <span className="font-semibold transition hover:text-red-500 flex items-center gap-1 cursor-pointer">
                    Giới thiệu
                  </span>

                  {/* Dropdown menu hiển thị khi hover */}
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef} // ref cho dropdown
                      className="z-20 w-64 divide-y divide-gray-100 rounded-lg bg-black bg-opacity-70 font-normal shadow-lg"
                      id="aboutUsDropdown"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "10px",
                        width: "max-content",
                        minWidth: "250px", // Đảm bảo độ rộng của dropdown đủ rộng
                        borderRadius: "5px",
                        padding: "20px",
                      }}
                      onMouseEnter={() => setDropdownOpen(true)} // Giữ dropdown mở khi chuột vào dropdown
                      onMouseLeave={handleMouseLeave} // Đóng dropdown khi chuột di ra ngoài dropdown
                    >
                      {/* Các mục trong dropdown */}
                      <div className="py-2">
                        <Link
                          to="/ve-chung-toi"
                          className="m-0 text-white text-[1.2em] shadow-[0_1px_2px_rgba(0,_0,_0,_0.7)]"
                          onClick={handleItemClick} // Đóng dropdown khi nhấn vào mục
                        >
                          Về chúng tôi
                        </Link>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/goi-dich-vu"
                          className="m-0 text-white text-[1.2em] shadow-[0_1px_2px_rgba(0,_0,_0,_0.7)]"
                          onClick={handleItemClick} // Đóng dropdown khi nhấn vào mục
                        >
                          Các gói dịch vụ
                        </Link>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/ho-tro"
                          className="m-0 text-white text-[1.2em] shadow-[0_1px_2px_rgba(0,_0,_0,_0.7)]"
                          onClick={handleItemClick} // Đóng dropdown khi nhấn vào mục
                        >
                          Hỗ trợ
                        </Link>
                      </div>
                      <div className="py-2">
                        <Link
                          to="tai-khoan"
                          className="m-0 text-white text-[1.2em] shadow-[0_1px_2px_rgba(0,_0,_0,_0.7)]"
                          onClick={handleItemClick} // Đóng dropdown khi nhấn vào mục
                        >
                          Đăng kí tài khoản
                        </Link>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/thanh-toan"
                          className="m-0 text-white text-[1.2em] shadow-[0_1px_2px_rgba(0,_0,_0,_0.7)]"
                          onClick={handleItemClick} // Đóng dropdown khi nhấn vào mục
                        >
                          Hình thức thanh toán
                        </Link>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/chinh-sach"
                          className="m-0 text-white text-[1.2em] shadow-[0_1px_2px_rgba(0,_0,_0,_0.7)]"
                          onClick={handleItemClick} // Đóng dropdown khi nhấn vào mục
                        >
                          Chính sách chung
                        </Link>
                      </div>
                    </div>
                  )}
                </li>

                <li>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onPressEnter={handleSearch}
                    placeholder="Tìm kiếm phim"
                    size="large"
                    suffix={<AiOutlineSearch />}
                    style={{ width: 220 }}
                  />
                </li>
                <li className="list-none w-auto">
                  {user ? (
                    <div className="flex items-center gap-1">
                      {!hasPurchased && (
                        <Link
                          to="/package"
                          style={{
                            backgroundColor: "#c0392b",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "5px",
                            gap: "4px",
                            marginRight: "10px",
                            padding: "4px 12px",
                            color: "white",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                            e.currentTarget.style.color = "#c0392b";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#c0392b";
                            e.currentTarget.style.color = "white";
                          }}
                        >
                          <FaShoppingCart className="text-lg" />
                          Mua gói
                        </Link>
                      )}
                      <Tooltip title="Thông báo">
                        <NotificationBell />
                      </Tooltip>
                      {/* <li>
                      <Link to="/setting/wallet">
                        <div className="w-full h-full">
                          {loading ? (
                            <div className="flex justify-center items-center min-h-screen">
                              <Spin size="large" tip="Đang tải ví..." />
                            </div>
                          ) : (
                            <div className="bg-[#c0392b] rounded-xl">
                              {wallet ? (
                                <div className="flex flex-col items-center space-y-6 p-1 px-3">
                                  <div className="text-base font-bold text-white">
                                    {wallet.balance !== undefined &&
                                    wallet.balance !== null
                                      ? wallet.balance.toLocaleString()
                                      : "0"}{" "}
                                    xu
                                  </div>
                                </div>
                              ) : (
                                <p className="text-center text-lg text-red-500">
                                  Không tìm thấy thông tin ví
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li> */}
                      <Dropdown
                        overlay={menu}
                        trigger={["hover"]}
                        overlayStyle={{
                          paddingTop: "15px",
                        }}
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full border-2 border-white cursor-pointer ml-4"
                          />
                        ) : (
                          <FaRegUser className="w-16 h-6 cursor-pointer" />
                        )}
                      </Dropdown>

                      <Modal
                        title="Mã giảm giá của tôi"
                        visible={isModalVisible}
                        onCancel={handleModalClose}
                        footer={null}
                        width={600}
                      >
                        {discount && discount.length > 0 ? (
                          <div>
                            {discount.map((item: any, index: number) => (
                              <div
                                key={index}
                                style={{
                                  marginBottom: "15px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "10px 20px",
                                  backgroundColor: "#f9f9f9",
                                  borderRadius: "8px",
                                  border: "1px solid #f0f0f0",
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "#333",
                                  }}
                                >
                                  Mã:{" "}
                                  <span style={{ color: "#007bff" }}>
                                    {item.code}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    color: "#333",
                                  }}
                                >
                                  Giảm giá:{" "}
                                  <span style={{ color: "#28a745" }}>
                                    {item.discountPercentage}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "20px",
                              textAlign: "center",
                              backgroundColor: "#f8d7da",
                              color: "#721c24",
                              borderRadius: "8px",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                              fontSize: "16px",
                              fontWeight: "bold",
                            }}
                          >
                            Không có mã giảm giá
                          </div>
                        )}
                      </Modal>
                    </div>
                  ) : (
                    <div>
                      <Link to="/login">
                        <button className="btn-primary">Đăng nhập</button>
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </HeaderContainer>
  );
};

export default Header;
