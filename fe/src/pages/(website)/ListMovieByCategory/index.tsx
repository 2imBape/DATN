import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "@/configs/axios";
import CartIcon from "@/assets/icons/3.svg";
import "./style.css";

interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  thumbnail: string;
  description: string;
  time: string;
  quality: string;
  year: number;
  video: string;
  trailer: string;
  category: Array<any>;
  country: Array<any>;
  favoriteCount: number;
  viewCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  deletedAt: Date | null;
  isDeleted: boolean;
}

const ListMovieByCategory = () => {
  const { categoryId } = useParams(); // Lấy categoryId từ params
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Trạng thái cho trang hiện tại
  const [moviesPerPage] = useState(10); // Số lượng phim mỗi trang
  const navigate = useNavigate(); // Khởi tạo useNavigate

  if (!categoryId) {
    console.error("Slug không được truyền vào");
    return null;
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await instance.get(`/movie?categoryId=${categoryId}`);
        if (response.data && Array.isArray(response.data.data)) {
          setMovies(response.data.data); // Dữ liệu nằm trực tiếp trong `data`
        } else {
          console.warn("Data format is incorrect:", response.data);
          setMovies([]);
        }
      } catch (error) {
        console.error("API call failed:", error);
        setMovies([]);
      }
    };

    fetchMovies();
  }, [categoryId]);

  // Lọc phim theo slug
  const filteredMovies = Array.isArray(movies)
    ? movies.filter((movie) => {
        return movie.category.some((cat) => {
          const catSlug = cat.slug ? cat.slug.trim().toLowerCase() : "";
          const categoryIdTrimmed = categoryId.trim().toLowerCase();
          return catSlug === categoryIdTrimmed;
        });
      })
    : [];

  // Tính toán các chỉ số cho trang hiện tại
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  // Hàm chuyển hướng đến trang chi tiết phim
  const handleMovieClick = (movieId: string) => {
    navigate(`/detail/${movieId}?categoryId=${categoryId}`); // Chuyển hướng đến trang chi tiết phim kèm theo categoryId
  };

  // Hàm chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  // Hàm chuyển đổi slug thành định dạng hiển thị
  const slugToTitle = (slug: string) => {
    return slug
      .split("-") // Tách chuỗi bằng dấu -
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu
      .join(" "); // Nối lại thành chuỗi
  };

  return (
    <div className="container">
      {/* Hiển thị đường dẫn đang truy cập */}
      <div className="current-path">
        <p>Movie/ {slugToTitle(categoryId)}</p>
      </div>

      <div className="movie-grid">
        {Array.isArray(currentMovies) && currentMovies.length > 0 ? (
          currentMovies.map((movie) => (
            <div
              key={movie._id}
              className="cinema-item"
              onClick={() => handleMovieClick(movie._id)} // Thêm sự kiện click
            >
              <div className="card-image img-responsive">
                <img
                  src={movie.thumbnail}
                  alt={movie.name}
                  className="movie-image"
                />
                <img
                  src={CartIcon} // Sử dụng CartIcon hoặc icon khác bạn muốn
                  alt="Play"
                  className="play-icon"
                />
              </div>
              <div className="card-content bg-gradient">
                <h3 className="title">{movie.name}</h3>
                <p className="text-inline-item">{movie.time} phút</p>
              </div>
            </div>
          ))
        ) : (
          <p>Không có phim nào trong thể loại này.</p>
        )}
      </div>
      {/* Phân trang */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListMovieByCategory;
