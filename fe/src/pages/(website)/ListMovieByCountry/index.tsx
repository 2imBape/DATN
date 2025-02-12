import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "@/configs/axios";
import axios from "axios";
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

const ListMovieByCountry = () => {
  const { countryId } = useParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const moviesPerPage = 10;
  const navigate = useNavigate();

  if (!countryId) {
    console.error("Slug không được truyền vào");
    return null;
  }

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await instance.get(`/movie?countryId=${countryId}`);
        const allMovies = response.data.data;
        setMovies(allMovies);
        setTotalPages(Math.ceil(allMovies.length / moviesPerPage));
      } catch (error) {
        console.error("API call failed:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error("API response:", error.response.data);
          setMovies([]);
        }
      }
    };
    fetchMovies();
  }, [countryId]);

  const filteredMovies = movies.filter((movie) =>
    movie.country.some((cn) => cn.slug === countryId)
  );

  const handleMovieClick = (movieId: string) => {
    navigate(`/detail/${movieId}?countryId=${countryId}`);
  };

  const slugToTitle = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  return (
    <div className="container">
      <div className="current-path">
        <p>Movie / {slugToTitle(countryId)}</p>
      </div>

      <div className="movie-grid">
        {Array.isArray(currentMovies) && currentMovies.length > 0 ? (
          currentMovies.map((movie) => (
            <div
              key={movie._id}
              className="cinema-item"
              onClick={() => handleMovieClick(movie._id)}
            >
              <div className="card-image img-responsive">
                <img
                  src={movie.thumbnail}
                  alt={movie.name}
                  className="movie-image"
                />
                <img src={CartIcon} alt="Play" className="play-icon" />
              </div>
              <div className="card-content bg-gradient">
                <h3 className="title">{movie.name}</h3>
                <p className="text-inline-item">{movie.time} phút</p>
              </div>
            </div>
          ))
        ) : (
          <p>Không có phim nào trong quốc gia này.</p>
        )}
      </div>

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

export default ListMovieByCountry;
