import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "@/configs/axios";
import { Loader } from "lucide-react";
import { BellOutlined } from "@ant-design/icons";

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data } = await instance.get(`/movie/listRegister`);
        setSubscriptions(data.data);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader className="animate-spin" />
        <p className="mt-5 text-xl">Đang tải...</p>
      </div>
    );
  }

  if (!subscriptions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-full shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l6-6m0 0l6 6m-6-6v12"
            />
          </svg>
        </div>

        <p className="mt-6 text-lg font-semibold text-gray-300">
          Bạn chưa đăng ký đặt trước cho phim nào
        </p>
        <p className="text-gray-400 mt-2 text-sm">
          Hãy khám phá và chọn một bộ phim hợp gu của bạn.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
          style={{ borderRadius: "5px" }}
        >
          Xem các loại phim
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl text-center text-white my-6">
        <a href="#" className="flex items-center justify-center">
          <i className="bx bx-movie-play bx-tada main-color mr-2"></i>
          <span>Danh sách đăng ký</span>
        </a>
      </h2>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6"
        style={{ maxWidth: "1230px", margin: "0 auto" }}
      >
        {subscriptions.map((subscription) => (
          <Link
            to={`/detail/${subscription.movie._id}`}
            key={subscription._id}
            className="bg-black-800 rounded-lg p-4 transform transition-transform duration-300 hover:scale-105"
            style={{
              width: "255px",
              borderRadius: "10px",
              boxShadow: "4px 4px 15px rgba(255, 0, 0, 0.6)",
            }}
          >
            <img
              src={subscription.movie.thumbnail}
              alt={subscription.movie.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              style={{ borderRadius: "5px" }}
            />
            <h2 className="text-xl text-white mb-2">
              {subscription.movie.name}
            </h2>
            <div className="flex items-center">
              <BellOutlined className="text-red-500 mr-2" />
              <span className="text-gray-300">Đã đăng ký</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
