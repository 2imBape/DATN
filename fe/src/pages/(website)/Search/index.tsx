import instance from "@/configs/axios";
import { Pagination } from "antd";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0); // Chỉ giữ lại totalResults

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const search = query.get("search");
    const page = parseInt(query.get("page") || "1");

    if (search) {
      setSearchTerm(search);
    }

    setCurrentPage(page);
    fetchMovies(search, page);
  }, [location]);

  const fetchMovies = async (search: string | null, page: number) => {
    setLoading(true);
    try {
      const response = await instance.get("/movie/allMovie", {
        params: {
          search: search || "",
          page,
          limit: 9,
        },
      });

      if (response.data) {
        setResults(response.data.data);
        setTotalResults(response.data.pagination.totalMovies); // Dùng totalMovies cho phân trang
      } else {
        console.error("API không trả về dữ liệu hợp lệ");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search?search=${searchTerm}&page=1`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    navigate(`/search?search=${searchTerm}&page=${page}`);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white w-full">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-secondary">
        Kết quả tìm kiếm
      </h1>
      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex flex-wrap gap-4 justify-center"
      >
        <div className="flex items-center w-full sm:w-3/4 bg-primary border border-gray-700 rounded-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full py-3 px-4 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary rounded-lg transition-all"
            placeholder="Tìm kiếm theo tên phim"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-secondary hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            <FaSearch size={20} />
          </button>
        </div>
      </form>

      {/* Loading or Results */}
      {loading ? (
        <p className="text-center text-lg">Đang tải...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-lg text-gray-400">
          Không tìm thấy kết quả
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {results.map((movie) => (
            <div
              key={movie._id}
              className="border border-gray-700 p-4 rounded-lg bg-primary hover:shadow-md transition-shadow"
            >
              <img
                src={movie.thumbnail || "/default-image.jpg"}
                alt={movie.name}
                className="w-64 h-80 object-cover shadow-lg rounded-lg"
                onClick={() => {
                  navigate(`/detail/${movie._id}`);
                }}
              />
              <h3 className="font-semibold text-xl my-2 text-white truncate">
                {movie.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {movie.description}
              </p>
              
              <p className="text-xs mt-2 text-gray-500">{movie.time} phút</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination
          current={currentPage}
          total={totalResults}
          pageSize={9}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper={false}
          className="pagination"
        />
      </div>
    </div>
  );
};

export default SearchPage;
