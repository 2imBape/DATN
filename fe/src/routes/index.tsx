import AdminLayout from "@/layouts/AdminLayout";
import WebsiteLayout from "@/layouts/WebsiteLayout";
import NotFound from "@/pages/(website)/404";
import ConfirmEmail from "@/pages/(website)/ConFirmEmail";
import HomePage from "@/pages/(website)/Home";
import ListMovieByCategory from "@/pages/(website)/ListMovieByCategory";
import LoginPage from "@/pages/(website)/Login";
import RegisterPage from "@/pages/(website)/Register";
import ResetPassword from "@/pages/(website)/ResetPassword";
import ResetPasswordByToken from "@/pages/(website)/ResetPasswordByToken";
import DashboardPage from "@/pages/Admin/Dashboard/index";
import MovieAddPage from "@/pages/Admin/Movies/CreateMovie";
import MovieEditPage from "@/pages/Admin/Movies/EditMovie";
import EditDetail from "@/pages/Admin/user/DetailMovie";
import PrivateRoute from "./PrivateRoute";
import Unauthorized from "@/pages/Admin/Unauthorized";
import MovieDetail from "@/pages/Admin/Movies/DetailMovie";
import UsersTable from "@/pages/Admin/user";
import UserEdit from "@/pages/Admin/user/EditUser";
import TrashMovie from "@/pages/Admin/Movies/Trash";
import Package from "@/pages/(website)/Package";
import Payment from "@/pages/(website)/Payment";
import MovieDetailHome from "@/pages/(website)/MovieDetailHome";
import Bill from "@/pages/(website)/PaymentStatus";
import ForgotPasswordPage from "@/pages/(website)/ForgotPassword";
import Video from "@/pages/(website)/Video";
import SettingLayout from "@/layouts/SettingLayout";
import UserProfile from "@/layouts/SettingLayout/user";
import ChangePassword from "@/layouts/SettingLayout/changepassword";
import ChangeEmail from "@/layouts/SettingLayout/change-email";
import UpgradePayment from "@/pages/(website)/Upgrade Payment";
import ListMovieByCountry from "@/pages/(website)/ListMovieByCountry";
import FavoriteMovies from "@/pages/(website)/favorite";
import Customer_supportLayout from "@/layouts/Customer_supportLayout";
import ListPayment from "@/pages/Admin/Payment";
import ChatWindow from "@/layouts/Customer_supportLayout/_components/ChatWindow";
import Home from "@/layouts/Customer_supportLayout/_components/Home";
import WalletPage from "@/pages/(website)/Wallet";
import WalletHistory from "@/pages/(website)/history";
import AllMovies from "@/pages/Admin/Movies/List-All";
import Subscriptions from "@/pages/(website)/Subcribe";
import PackageList from "@/pages/Admin/Package/PackageList";
import AddPackage from "@/pages/Admin/Package/AddPackage";
import EditPackage from "@/pages/Admin/Package/EditPackage";
import AddPerson from "@/pages/Admin/Person/AddPerson";
import Persons from "@/pages/Admin/Person";
import DiscountPage from "@/pages/Admin/Discount";
import UpdateDiscount from "@/pages/Admin/Discount/UpdateDiscount";
import CreateDiscount from "@/pages/Admin/Discount/CreateDiscount";
import PersonEditPage from "@/pages/Admin/Person/UpdatePerson";
import SearchPage from "@/pages/(website)/Search";
import ManagePackage from "@/pages/(website)/ManagePackage";






import AboutAccount from "@/components/AboutAccount";
import AboutDetail from "@/components/AboutDetail";
import AboutPayment from "@/components/AboutPayment";
import AboutPrivacy from "@/components/AboutPrivacy";
import AboutService from "@/components/AboutService";
import AboutSupport from "@/components/AboutSupport";

const routesConfig: Array<RoutesType> = [
  {
    path: "admin",

    element: (
      <PrivateRoute redirectTo="/login" allowedRoles={["admin"]}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      {
        name: "Thống kê",
        path: "",
        element: <DashboardPage />,
      },
      {
        name: "Quản lý phim",
        path: "movies",
        element: <AllMovies />,
      },
      // {
      //   name: "Quản lý phim",
      //   path: "movies",
      //   element: <Movies />,
      // },
      {
        name: "Danh sách Mã Giảm Giá",
        path: "discount",
        element: <DiscountPage />,
      },
      {
        name: "Thêm mới Max Giảm Giá",
        path: "discount/create",
        element: <CreateDiscount />,
      },

      {
        name: "Sửa Mã Giảm Giá",
        path: "discount/update/:id",
        element: <UpdateDiscount />,
      },

      {
        name: "Danh sách Diễn viên",
        path: "person",
        element: <Persons />,
      },
      {
        name: "Thêm mới Diễn viên",
        path: "person/add",
        element: <AddPerson />,
      },
      {
        name: "Sửa Diễn viên",
        path: "person/update/:id",
        element: <PersonEditPage />,
      },
      {
        name: "Thêm mới phim",
        path: "movies/create",
        element: <MovieAddPage />,
      },
      {
        name: "Sửa phim",
        path: "movies/update/:id",
        element: <MovieEditPage />,
      },
      {
        name: "Xem chi tiết phim",
        path: "movies/detail/:id",
        element: <MovieDetail />,
      },
      {
        name: "Thùng rác phim ",
        path: "movies/trash",
        element: <TrashMovie />,
      },

      {
        name: "Quản lý người dùng",
        path: "users",
        element: <UsersTable />,
      },
      {
        name: "Chi tiết người dùng",
        path: "users/detail/:id",
        element: <EditDetail />,
      },
      {
        name: "Sửa người dùng",
        path: "users/update/:id",
        element: <UserEdit />,
      },
      {
        name: "Quản lý thanh toán",
        path: "payments",
        element: <ListPayment />,
      },
      {
        name: "Quản lý gói phim",
        path: "packages",
        element: <PackageList />,
      },
      {
        name: "Thêm gói phim",
        path: "packages/add",
        element: <AddPackage />,
      },

      {
        name: "Sửa gói phim",
        path: "packages/update/:id",
        element: <EditPackage />,
      },
    ],
  },

  {
    path: "/support",
    element: (
      <PrivateRoute redirectTo="/login" allowedRoles={["support", "admin"]}>
        <Customer_supportLayout />
      </PrivateRoute>
    ),
    children: [
      {
        name: "Home",
        path: "",
        element: <Home />,
      },
      {
        name: "Liên hệ",
        path: "contact/:userId",
        element: <ChatWindow />,
      },
    ],
  },

  {
    path: "",
    element: <WebsiteLayout />,
    children: [
      {
        name: "Trang chủ",
        path: "",
        element: <HomePage />,
      },
      {
        name: "Trang tìm kiếm",
        path: "search",
        element: <SearchPage />,
      },
      {
        name: "Danh sách movie dựa vào category",
        path: "category/:categoryId",
        element: <ListMovieByCategory />,
      },
      {
        name: "Danh sách movie dựa vào country",
        path: "country/:countryId",
        element: <ListMovieByCountry />,
      },
      {
        name: "List Favorite",
        path: "favorite",
        element: <FavoriteMovies />,
      },
      {
        name: "Chi tiết giới thiệu",
        path: "ve-chung-toi",
        element: <AboutDetail />,
      },
      {
        name: "Gói dịch vụ",
        path: "goi-dich-vu",
        element: <AboutService />,
      },
      {
        name: "Hỗ trợ",
        path: "ho-tro",
        element: <AboutSupport />,
      },
      {
        name: "Tài khoản",
        path: "tai-khoan",
        element: <AboutAccount />,
      },
      {
        name: "Chính sách sử dụng",
        path: "chinh-sach",
        element: <AboutPrivacy />,
      },
      {
        name: "Dịch vụ thanh toán",
        path: "thanh-toan",
        element: <AboutPayment />,
      },
      {
        name: "List Subscriptions",
        path: "subscrip",
        element: <Subscriptions />,
      },
      {
        name: "Chi tiết phim",
        path: "detail/:id",
        element: <MovieDetailHome />,
      },
      {
        name: "Xem phim",
        path: "video/:id",
        element: (
          <PrivateRoute redirectTo="/login">
            <Video />
          </PrivateRoute>
        ),
      },
      // {
      //   name: "Ví tiền",
      //   path: "wallet",
      //   element: (
      //     <PrivateRoute redirectTo="/login">
      //       <WalletPage />
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   name: "Lịch sử giao dịch",
      //   path: "wallet/history",

      //   element: (
      //     <PrivateRoute redirectTo="/login">
      //       <WalletHistory />
      //     </PrivateRoute>
      //   ),
      // },

      {
        name: "Đổi mật khẩu từu Profile",
        path: "changePassword",
        element: <ResetPassword />,
      },
      {
        name: "Danh sách gói phim",
        path: "package",
        element: <Package />,
      },
      {
        name: "Thanh toán ",
        path: "payment/:id",
        element: (
          <PrivateRoute redirectTo="/login">
            <Payment />
          </PrivateRoute>
        ),
      },
      {
        name: "Nâng cấp Thanh toán ",
        path: "upgradePayment/:id",
        element: (
          <PrivateRoute redirectTo="/login">
            <UpgradePayment />
          </PrivateRoute>
        ),
      },
      {
        name: "Hóa đơn ",
        path: "bill",
        element: (
          <PrivateRoute redirectTo="/login">
            <Bill />
          </PrivateRoute>
        ),
      },

      {
        name: "Setting",
        path: "setting",
        element: (
          <PrivateRoute redirectTo="/login">
            <SettingLayout />
          </PrivateRoute>
        ),

        children: [
          {
            name: "Thông tin cá nhân",
            path: "",
            element: <UserProfile />,
          },
          {
            name: "Change Password",
            path: "changepassword",
            element: <ChangePassword />,
          },
          {
            name: "Change Email",
            path: "change-email",
            element: <ChangeEmail />,
          },
          {
            name: "Ví tiền",
            path: "wallet",
            element: (
              <PrivateRoute redirectTo="/login">
                <WalletPage />
              </PrivateRoute>
            ),
          },
          {
            name: "Quản lý gói",
            path: "manage-package",
            element: (
              <PrivateRoute redirectTo="/login">
                <ManagePackage />
              </PrivateRoute>
            ),
          },
          {
            name: "Lịch sử giao dịch",
            path: "history",

            element: (
              <PrivateRoute redirectTo="/login">
                <WalletHistory />
              </PrivateRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    name: "Đăng nhập",
    path: "login",
    element: (
      <LoginPage
        url="https://movie.bachtv.click/api/auth/login"
        title="Đăng nhập"
      ></LoginPage>
    ),
  },
  {
    name: "Xác thực email",
    path: "confirm-email/:token",
    element: <ConfirmEmail />,
  },
  {
    name: "Đăng ký",
    path: "register",
    element: <RegisterPage />,
  },
  {
    name: " Quên mật khẩu",
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    name: "Đổi mật khẩu bởi token quên mật khẩu",
    path: "resetPassword/:token",
    element: <ResetPasswordByToken />,
  },
  {
    name: "Unauthorized",
    path: "unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routesConfig;
