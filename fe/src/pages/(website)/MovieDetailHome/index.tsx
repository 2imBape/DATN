import CommentSection from "@/components/CommentSection";
import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";
import { User } from "@/interfaces/User";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { message, Modal } from "antd";
import { Loader } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  FaHeart,
  FaPlay,
  FaRegHeart,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const MovieDetailHome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPreOrdered, setIsPreOrdered] = useState<boolean>(false); // Trạng thái đặt trước
  const navigate = useNavigate();

  useEffect(() => {
    const favoriteStatus = localStorage.getItem(`favorite_${id}`);
    if (favoriteStatus === "true") {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }

    const preOrderStatus = localStorage.getItem(`preOrder_${id}`);
    setIsPreOrdered(preOrderStatus === "true");

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchMovie = async () => {
      try {
        const response = await instance.get(`movie/${id}`);
        setMovie(response.data.data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to fetch movie data");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (!user) {
        Modal.confirm({
          title: "Bạn chưa đăng nhập",
          content: "Bạn có muốn đăng nhập không?",
          okText: "Có",
          cancelText: "Không",
          onOk() {
            navigate("/login");
          },
          onCancel() {
            navigate(0);
          },
        });
        return;
      }
      if (isFavorite) {
        await instance.delete(`/favorite`, { data: { movieId: movie?._id } });
      } else {
        await instance.post(`/favorite`, { movieId: movie?._id });
      }
      setIsFavorite(!isFavorite);
      localStorage.setItem(`favorite_${id}`, (!isFavorite).toString());
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleNavigateToVideo = async (movieId: string | undefined) => {
    const { data } = await instance.get(`/movie/${movieId}`);
    const checkFree = data.data.isFree;
    if (checkFree === true) {
      navigate(`/video/${movieId}`);
      await instance.post(`/movie/viewMovie/${movieId}`);
    } else {
      const checkPackageUser = localStorage.getItem("checkPackageUser");
      if (checkPackageUser === "true") {
        navigate(`/video/${movieId}`);
        const viewMovie = await instance.post(`/movie/viewMovie/${movieId}`);
        console.log(viewMovie);
      } else {
        Modal.confirm({
          title: "Bạn chưa mua gói",
          content: "Bạn có muốn mua gói không?",
          okText: "Có",
          cancelText: "Không",
          onOk() {
            navigate("/package");
          },
          onCancel() {
            navigate(-1);
          },
        });
      }
    }
  };

  const handlePreOrder = async () => {
    try {
      if (movie?.status === "Sắp ra mắt") {
        if (!isPreOrdered) {
          await instance.post("/movie/register", { movieId: movie._id });
          setIsPreOrdered(true);
          localStorage.setItem(`preOrder_${id}`, "true");
          message.success("Đăng ký đặt trước thành công!");
        } else {
          await instance.delete("/movie/unRegister", {
            data: { movieId: movie._id },
          });
          setIsPreOrdered(false);
          localStorage.setItem(`preOrder_${id}`, "false");
          message.success("Hủy đặt trước thành công!");
        }
      } else if (movie?.status === "Đã xuất bản") {
        navigate(`/video/${movie._id}`);
      }
    } catch (err) {
      console.error("Error handling pre-order:", err);
      message.error("Lỗi khi xử lý yêu cầu.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center  text-white">
        <Loader className="loader animate-spin" />
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-xl tsext-center">{error}</p>;
  }

  if (!movie) {
    return <p className="text-red-500 text-xl text-center">Movie not found</p>;
  }

  return (
    <div className="relative">
      <div className="relative flex justify-center items-center">
        <video
          ref={videoRef}
          src={movie.trailer}
          className="max-w-[70%] object-cover opacity-60"
          autoPlay
          loop
          muted={isMuted}
        />
        <div className="absolute bottom-0 text-white p-10 rounded-lg w-[70%]">
          <h1 className="text-5xl font-bold">{movie.name}</h1>
          <p className="text-lg mb-4">{movie.description}</p>

          <div className="flex items-center gap-6 mb-6">
            <p>
              <strong>Sản xuất:</strong> {movie.year}
            </p>
            <p>
              <strong>Chất lượng:</strong> {movie.quality}
            </p>
            <p>
              <strong>Thời gian:</strong> {movie.time} phút
            </p>
          </div>

          <button
            onClick={toggleMute}
            className="absolute right-10 p-2 bg-gray-800 rounded-full text-white opacity-70 hover:opacity-100"
          >
            {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
          </button>

          {/* Nút Đặt Trước hoặc Xem Phim */}
          {movie.status === "Sắp ra mắt" ? (
            <button
              onClick={handlePreOrder}
              className="bg-red-600 text-white py-2 px-6 rounded-full inline-flex items-center gap-2 transition-transform hover:bg-red-700"
            >
              {isPreOrdered ? (
                <>
                  <CloseOutlined /> Hủy Đặt Trước
                </>
              ) : (
                <>
                  <CheckOutlined /> Đăng Ký
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleNavigateToVideo(movie._id)}
              className="bg-green-600 text-white py-2 px-6 rounded-full inline-flex items-center gap-2 transition-transform hover:bg-green-700"
            >
              <FaPlay /> Xem Phim
            </button>
          )}

          <button onClick={handleToggleFavorite} className="ml-4 text-xl">
            {isFavorite ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-white" />
            )}
          </button>
          {movie.isPendingDelete && (
            <p className="mt-4 text-yellow-400 font-bold">
              ! Phim này sắp bị xóa khỏi hệ thống
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 text-white max-w-[70%] mx-auto rounded-lg shadow-lg bg-opacity-80">
        {user ? (
          <div className="mt-10 p-4">
            <CommentSection movieId={`${movie._id}`} />
          </div>
        ) : (
          <div className="text-center relative group">
            <p className="text-gray-40 0">
              Bạn cần đăng nhập để xem phim và bình luận.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="absolute left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white py-2 px-4 mt-4 rounded transition-opacity duration-300"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailHome;
