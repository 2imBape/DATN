import instance from "@/configs/axios";
import { Movie } from "@/interfaces/Movie";
import ScrollToTopButton from "@/pages/(website)/Home/ScrollToTopButton";
import { EyeOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "../../../styles/HomePage.css";

const Home: React.FC = () => {
  let navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [topTrendingMovies, setTopTrendingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchTopTrendingMovies = async () => {
      try {
        const response = await instance.get("/movie/topTrending");
        setTopTrendingMovies(response.data.movies);
      } catch (error) {
        console.error("Error fetching top trending movies:", error);
      }
    };

    fetchTopTrendingMovies();
  }, []);
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await instance.get("movie/topLike");
        setMovies(response.data.data);
      } catch (err) {
        console.error(err);
        setMovies([]);
      }
    };
    fetchMovies();
  }, []);

  const [movies2, setMovies2] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchMovies2 = async () => {
      try {
        const response = await instance.get("movie/newMovie");
        setMovies2(response.data.data);
      } catch (err) {
        console.error(err);
        setMovies2([]);
      }
    };
    fetchMovies2();
  }, []);

  const [movies3, setMovies3] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchMovies3 = async () => {
      try {
        const response = await instance.get("movie/comingSoon");
        setMovies3(response.data.data);
      } catch (err) {
        console.error(err);
        setMovies3([]);
      }
    };
    fetchMovies3();
  }, []);

  const [movies4, setMovies4] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchMovies4 = async () => {
      try {
        const response = await instance.get("movie/free");
        setMovies4(response.data.data);
      } catch (err) {
        console.error(err);
        setMovies4([]);
      }
    };
    fetchMovies4();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1900,
    autoplay: true,
    autoplaySpeed: 1700,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className=" text-white min-h-screen">
      {/* Banner slide */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Slider
            {...{
              dots: true,
              infinite: true,
              speed: 3000,
              slidesToShow: 1,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 1700,
              arrows: false,
            }}
          >
            {movies.map((movie, index) => (
              <button
                className="relative min-w-full h-[680px] cursor-pointer overflow-hidden rounded-lg transition-transform duration-500"
                key={index}
                onClick={() => {
                  navigate(`/detail/${movie._id}`);
                }}
              >
                <img
                  src={movie.thumbnail}
                  alt={movie.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute bottom-0 p-6 text-left">
                  <h2 className="text-3xl font-bold">{movie.name}</h2>
                  <div className="flex gap-4 text-sm mt-2">
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-like"></i> {movie.favoriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-time"></i> {movie.time}
                    </span>

                    <div className="text-sm  flex items-center justify-center gap-1">
                      <EyeOutlined className="" />
                      <span>{movie.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                  {/* Hiển thị "Miễn phí" nếu phim là miễn phí */}
                  {movie.isFree && (
                    <div className="absolute top-0 left-5 bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-bold">
                      Miễn phí
                    </div>
                  )}
                  <a href="#" className="btn btn-hover px-4 py-2 mt-5">
                    <span>
                      <Link to="/login">Xem Ngay</Link>
                    </span>
                  </a>
                </div>
              </button>
            ))}
          </Slider>
        </div>
      </section>

      {/* Phim ưa thích */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="section-header">
            <a href="#" className="logo">
              <i className="bx bx-movie-play bx-tada main-color"></i>
              <span className="font-semibold">Phim Ưa Thích</span>
            </a>
          </h2>
          <Slider {...sliderSettings}>
            {movies.map((movie, index) => (
              <button
                className="w-60 cursor-pointer transform transition-transform hover:scale-105 p-10"
                key={index}
                onClick={() => {
                  navigate(`/detail/${movie._id}`);
                }}
              >
                <div className="relative">
                  <img
                    src={movie.thumbnail}
                    alt={movie.name}
                    className="w-64 h-80 object-cover shadow-lg rounded-lg"
                    style={{ borderRadius: "10px" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-lg">
                    <i className="bx bx-play text-white text-4xl"></i>
                  </div>
                </div>
                <div className="mt-4 text-center  ">
                  <h3 className="text-lg font-semibold">{movie.name}</h3>

                  {/* Hiển thị "Miễn phí" nếu phim là miễn phí */}
                  {movie.isFree && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-bold">
                      Miễn phí
                    </div>
                  )}

                  <div className="flex justify-center gap-2 text-sm mt-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-like"></i> {movie.favoriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-time"></i> {movie.time}
                    </span>

                    <div className="text-sm flex items-center justify-center gap-1">
                      <EyeOutlined className="" />
                      <span>{movie.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </Slider>
        </div>
      </section>

      {/* Phim miễn phí */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="section-header">
            <a href="#" className="logo">
              <i className="bx bx-movie-play bx-tada main-color"></i>
              <span className="font-semibold">Phim miễn phí</span>
            </a>
          </h2>
          <Slider {...sliderSettings}>
            {movies4.map((movie4, index) => (
              <button
                className="w-60 cursor-pointer transform transition-transform hover:scale-105 p-10"
                key={index}
                onClick={() => {
                  navigate(`/detail/${movie4._id}`);
                }}
              >
                <div className="relative">
                  <img
                    src={movie4.thumbnail}
                    alt={movie4.name}
                    className="w-64 h-80 object-cover shadow-lg rounded-lg"
                    style={{ borderRadius: "10px" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-lg">
                    <i className="bx bx-play text-white text-4xl"></i>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold">{movie4.name}</h3>

                  {/* Hiển thị "Miễn phí" nếu phim là miễn phí */}
                  {movie4.isFree && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-bold">
                      Miễn phí
                    </div>
                  )}

                  <div className="flex justify-center gap-2 text-sm mt-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-like"></i> {movie4.favoriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-time"></i> {movie4.time}
                    </span>
                    <div className="text-sm flex items-center justify-center gap-1">
                      <EyeOutlined className="" />
                      <span>{movie4.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </Slider>
        </div>
      </section>

      {/* Phim xu hướng */}
      <section className="py-12 rounded-lg text-white">
        <div className="container mx-auto px-4">
          <h2 className="section-header">
            <a href="#" className="logo">
              <i className="bx bx-movie-play bx-tada main-color"></i>
              <span className="font-semibold">Phim xu hướng</span>
            </a>
          </h2>

          <Slider {...sliderSettings}>
            {topTrendingMovies.map((movie, index) => (
              <div
                className="relative group  ml-12"
                key={movie._id}
                style={{
                  marginRight:
                    index === topTrendingMovies.length - 1 ? "0" : "1.5rem",
                }}
              >
                <div className="absolute bottom-[-60%] left-[-115%] z-10 flex items-center justify-center text-white font-extrabold text-[12rem]">
                  <span className="bg-gradient-to-b from-yellow-500 to-red-500 bg-clip-text text-transparent transform translate-y-[-50%] shadow-xl ">
                    {index + 1}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/detail/${movie._id}`)}
                  className="block overflow-hidden rounded-lg transform transition-transform duration-500 group-hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative">
                    <img
                      src={movie.thumbnail}
                      alt={movie.name}
                      className="w-64 h-80 object-cover shadow-lg rounded-lg"
                      style={{ borderRadius: "10px" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-lg">
                      <i className="bx bx-play text-white text-4xl"></i>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Phim Mới Ra Mắt */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="section-header">
            <a href="#" className="logo">
              <i className="bx bx-movie-play bx-tada main-color"></i>
              <span className="font-semibold">Phim Mới Ra Mắt</span>
            </a>
          </h2>
          <Slider {...sliderSettings}>
            {movies2.map((movie2, index) => (
              <button
                className="w-60 cursor-pointer transform transition-transform hover:scale-105 p-10"
                key={index}
                onClick={() => {
                  navigate(`/detail/${movie2._id}`);
                }}
              >
                <div className="relative">
                  <img
                    src={movie2.thumbnail}
                    alt={movie2.name}
                    className="w-64 h-80 object-cover shadow-lg rounded-lg"
                    style={{ borderRadius: "10px" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-lg">
                    <i className="bx bx-play text-white text-4xl"></i>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold">{movie2.name}</h3>

                  {/* Hiển thị "Miễn phí" nếu phim là miễn phí */}
                  {movie2.isFree && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-bold">
                      Miễn phí
                    </div>
                  )}

                  <div className="flex justify-center gap-2 text-sm mt-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-like"></i> {movie2.favoriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-time"></i> {movie2.time}
                    </span>
                    <div className="text-sm flex items-center justify-center gap-1">
                      <EyeOutlined className="" />
                      <span>{movie2.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </Slider>
        </div>
      </section>

      {/* Phim sắp Ra Mắt */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="section-header">
            <a href="#" className="logo">
              <i className="bx bx-movie-play bx-tada main-color"></i>
              <span className="font-semibold">Phim Sắp Ra Mắt</span>
            </a>
          </h2>
          <Slider {...sliderSettings}>
            {movies3.map((movie2, index) => (
              <button
                className="w-60 cursor-pointer transform transition-transform hover:scale-105 p-10"
                key={index}
                onClick={() => {
                  navigate(`/detail/${movie2._id}`);
                }}
              >
                <div className="relative">
                  <img
                    src={movie2.thumbnail}
                    alt={movie2.name}
                    className="w-64 h-80 object-cover shadow-lg rounded-lg"
                    style={{ borderRadius: "10px" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-lg">
                    <i className="bx bx-play text-white text-4xl"></i>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold">{movie2.name}</h3>

                  {/* Hiển thị "Miễn phí" nếu phim là miễn phí */}
                  {movie2.isFree && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-bold">
                      Miễn phí
                    </div>
                  )}

                  <div className="flex justify-center gap-2 text-sm mt-2 text-gray-400">
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-like"></i> {movie2.favoriteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="bx bxs-time"></i> {movie2.time}
                    </span>
                    <div className="text-sm flex items-center justify-center gap-1">
                      <EyeOutlined className="" />
                      <span>{movie2.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </Slider>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
};

export default Home;
