import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";
import { HeartCrackIcon, Loader } from "lucide-react";
import { FaHeart } from "react-icons/fa";

const FavoriteMovies: React.FC = () => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await instance.get(`/favorite`);
        setFavoriteMovies(response.data.favoriteMovies);
      } catch (err) {
        console.error("Error fetching favorite movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader className="loader" />
        <p className="mt-5 text-xl">Loading...</p>
      </div>
    );
  }

  if (favoriteMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-6 rounded-full shadow-lg">
          <HeartCrackIcon size={64} />
        </div>

        <p className="mt-6 text-lg font-semibold text-gray-300">
          Danh sách yêu thích của bạn trống
        </p>
        <p className="text-gray-400 mt-2 text-sm">
          Hãy thêm một vài bộ phim để làm phong phú danh sách của bạn.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
          style={{ borderRadius: "5px" }}
        >
          Khám phá phim
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-2xl text-center text-white mb-6"
        style={{ marginTop: "30px", marginBottom: "-10px" }}
      >
        <a href="#" className="flex items-center justify-center">
          <i className="bx bx-movie-play bx-tada main-color mr-2"></i>
          <span>Phim Yêu Thích</span>
        </a>
      </h2>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6"
        style={{ width: "1230px", margin: "0 auto", paddingRight: "20px" }}
      >
        {favoriteMovies.map((favorite) => (
          <Link
            to={`/detail/${favorite.movieId}`}
            key={favorite.movieId}
            className="bg-black-800 rounded-lg p-4 transform transition-transform duration-300 hover:scale-105"
            style={{
              width: "255px",
              borderRadius: "10px",
              boxShadow: "4px 4px 15px rgba(255, 0, 0, 0.6)",
            }}
          >
            <img
              src={favorite.thumbnail}
              alt={favorite.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              style={{ borderRadius: "5px" }}
            />
            <h2 className="text-xl text-white mb-2">{favorite.name}</h2>
            <div className="flex items-center">
              <FaHeart className="text-red-500 mr-2" />
              <span className="text-gray-300">Yêu thích</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FavoriteMovies;
