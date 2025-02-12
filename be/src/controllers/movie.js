import cloudinary from "../config/cloudinaryConfig.js";
import Movie from "../models/Movie.js";
import Notification from "../models/Notification.js";

import { movieValidation, updateMovieValidate } from "../validations/movie.js";
import MovieSubscription from "../models/MovieSubscription.js";
import User from "../models/User.js";
import Person from "../models/Person.js";
import Favorite from "../models/Favorite.js";

export const createMovie = async (req, res, next) => {
  const { error } = movieValidation.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details.map((e) => e.message) });
  }

  try {
    const { name } = req.body;

    const existingMovie = await Movie.findOne({ name: name });
    if (existingMovie) {
      return res.status(400).json({ message: "Tên phim đã tồn tại" });
    }

    let thumbnail;
    let video;
    let trailer;
    let actors = [];
    let directors = [];

    // Xử lý upload ảnh thumbnail
    if (req.files.thumbnail) {
      const result = await cloudinary.uploader.upload(
        req.files.thumbnail[0].path,
        {
          folder: "movie/thumbnails",
        }
      );
      thumbnail = result.secure_url;
    }

    // Xử lý upload video
    if (req.files.video) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        folder: "movie/videos",
        resource_type: "video",
      });
      video = result.secure_url;
    }

    // Xử lý upload trailer
    if (req.files.trailer) {
      const result = await cloudinary.uploader.upload(
        req.files.trailer[0].path,
        {
          folder: "movie/trailers",
          resource_type: "video",
        }
      );
      trailer = result.secure_url;
    }

    // Xử lý actors và directors từ request
    if (req.body.actors && req.body.actors.length > 0) {
      actors = await Person.find({ _id: { $in: req.body.actors } });
    }

    if (req.body.directors && req.body.directors.length > 0) {
      directors = await Person.find({ _id: { $in: req.body.directors } });
    }

    const newMovieData = {
      ...req.body,
      thumbnail: thumbnail,
      video: video,
      trailer: trailer,
      actors: actors.map((actor) => actor._id),
      directors: directors.map((director) => director._id),
    };

    const newMovie = await Movie.create(newMovieData);

    return res.status(201).json({
      message: "Movie created successfully",
      data: newMovie,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMovie = async (req, res, next) => {
  const { error } = updateMovieValidate.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res
      .status(400)
      .json({ message: error.details.map((e) => e.message) });
  }

  try {
    const { name } = req.body;

    const existingMovie = await Movie.findOne({ name: name });
    if (existingMovie) {
      return res.status(400).json({ message: "Tên phim đã tồn tại" });
    }

    let thumbnail;
    let video;
    let trailer;
    let actors = [];
    let directors = [];

    if (req.files.thumbnail) {
      const result = await cloudinary.uploader.upload(
        req.files.thumbnail[0].path,
        {
          folder: "movie/thumbnails",
        }
      );
      thumbnail = result.secure_url;
    }

    // Xử lý upload video
    if (req.files.video) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        folder: "movie/videos",
        resource_type: "video",
      });
      video = result.secure_url;
    }

    // Xử lý upload trailer
    if (req.files.trailer) {
      const result = await cloudinary.uploader.upload(
        req.files.trailer[0].path,
        {
          folder: "movie/trailers",
          resource_type: "video",
        }
      );
      trailer = result.secure_url;
    }
    if (req.body.actors && req.body.actors.length > 0) {
      actors = await Person.find({ _id: { $in: req.body.actors } });
    }

    if (req.body.directors && req.body.directors.length > 0) {
      directors = await Person.find({ _id: { $in: req.body.directors } });
    }

    const updatedMovieData = {
      ...req.body,
      thumbnail: thumbnail || req.body.thumbnail, // Giữ lại thumbnail cũ nếu không có file mới
      video: video || req.body.video, // Giữ lại video cũ nếu không có file mới
      trailer: trailer || req.body.trailer, // Giữ lại trailer cũ nếu không có file mới
      actors: actors.map((actor) => actor._id),
      directors: directors.map((director) => director._id),
    };

    // const updatedMovieData = {
    //   ...req.body,
    //   thumbnail,
    //   images,
    // };

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      updatedMovieData,
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.status(200).json({
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovies = async (req, res, next) => {
  const { search, page = 1, limit = 8, sort = "asc" } = req.query;

  try {
    let query = { isDeleted: false };
    if (search) {
      const regex = new RegExp(search, "i");
      query.name = regex;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: ["category", "country"],
      sort: { price: sort === "asc" ? 1 : -1 },
    };

    const movies = await Movie.paginate(query, options);

    return res.status(200).json({
      message: "Get movies successfully",
      data: movies,
      pagination: {
        totalMovies: movies.totalDocs,
        totalPages: movies.totalPages,
        currentPage: movies.page,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieByCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const data = await Movie.find({ category: categoryId, isDeleted: false }) // Thêm điều kiện isDeleted: false
      .populate("person")
      .populate("category")
      .populate("country");

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this category" });
    }

    return res.status(200).json({ message: "Get movies successfully", data });
  } catch (error) {
    next(error);
  }
};

export const getMovieByCountry = async (req, res, next) => {
  const { countryId } = req.params;

  try {
    const data = await Movie.find({ country: countryId, isDeleted: false }) // Thêm điều kiện isDeleted: false
      .populate("category")
      .populate("country")
      .populate("person");

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this country" });
    }

    return res.status(200).json({ message: "Get movies successfully", data });
  } catch (error) {
    next(error);
  }
};

export const getMovie = async (req, res, next) => {
  try {
    const data = await Movie.findById(req.params.id)
      .where("isDeleted")
      .equals(false);
    return res.status(200).json({ message: "Get movie successfully", data });
  } catch (error) {
    next(error);
  }
};

export const getTopLikedMovies = async (req, res, next) => {
  try {
    const data = await Movie.find({ status: "Đã xuất bản", isDeleted: false })
      .sort({ favoriteCount: -1 })
      .limit(10);

    return res
      .status(200)
      .json({ message: "Get top liked movies successfully", data });
  } catch (error) {
    next(error);
  }
};

export const getNewMovies = async (req, res, next) => {
  try {
    const data = await Movie.find({ status: "Đã xuất bản", isDeleted: false }) // Thêm điều kiện isDeleted: false
      .sort({ createdAt: -1 })
      .limit(10);

    return res
      .status(200)
      .json({ message: "Get newest movies successfully", data });
  } catch (error) {
    next(error);
  }
};

export const getComingSoonMovies = async (req, res, next) => {
  try {
    const data = await Movie.find({
      status: "Sắp ra mắt",
      isDeleted: false,
    }).limit(10);

    return res
      .status(200)
      .json({ message: "Get coming soon movies successfully", data });
  } catch (error) {
    next(error);
  }
};

export const trashMovie = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 8, sort = "asc" } = req.query;
    let query = { isDeleted: true };
    if (search) {
      const regex = new RegExp(search, "i");
      query.name = regex;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: ["category", "country"],
      sort: { price: sort === "asc" ? 1 : -1 },
    };
    const movies = await Movie.paginate(query, options);

    return res.status(200).json({
      message: "Get movies successfully",
      movies,
      pagination: {
        totalMovies: movies.totalDocs,
        totalPages: movies.totalPages,
        currentPage: movies.page,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMovie = async (req, res, next) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findByIdAndUpdate(
      id,
      {
        isPendingDelete: true,
        deletedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy bộ phim." });
    }

    const users = await User.find();
    const notificationPromises = users.map((user) => {
      return Notification.create({
        userId: user._id,
        title: "Phim sẽ bị xóa sau 3 ngày",
        message: `Bộ phim "${movie.name}" sẽ bị xóa khỏi hệ thống sau 3 ngày.`,
        type: "reminder",
      });
    });

    await Promise.all(notificationPromises);

    res.status(200).json({
      message:
        "Phim đã được đánh dấu để xóa sau 3 ngày và thông báo đã được gửi tới tất cả người dùng.",
    });

    setTimeout(async () => {
      const deletedMovie = await Movie.findByIdAndUpdate(
        id,
        { isDeleted: true, isPendingDelete: false },
        { new: true }
      );

      if (!deletedMovie) {
        console.error(`Không tìm thấy bộ phim với ID: ${id}`);
        return;
      }
      await MovieSubscription.deleteMany({ movie: movie._id });
      await Favorite.deleteMany({ movie: movie._id });

      const notificationPromisesAfterDelete = users.map((user) => {
        return Notification.create({
          userId: user._id,
          title: "Phim đã bị xóa",
          message: `Bộ phim "${deletedMovie.name}" đã bị xóa khỏi hệ thống và không thể tiếp tục xem.`,
          type: "reminder",
        });
      });

      await Promise.all(notificationPromisesAfterDelete);
    }, 3 * 24 * 60 * 60 * 1000);
  } catch (error) {
    next(error);
  }
};

export const recoverMovie = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Tìm và khôi phục phim
    const movie = await Movie.findByIdAndUpdate(
      id,
      { isDeleted: false, isPendingDelete: false, deletedAt: null },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy bộ phim." });
    }

    // Trả về phản hồi thành công
    res.status(200).json({
      message:
        "Bộ phim đã được khôi phục và thông báo đã được gửi tới tất cả người dùng.",
    });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra khi khôi phục bộ phim." });
    next(error);
  }
};

export const permanentMovie = async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy bộ phim." });
    }
    res.status(200).json({ message: "Bộ phim đã bị xóa vĩnh viễn." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi xóa vĩnh viễn bộ phim." });
  }
};

export const getFreeMovies = async (req, res, next) => {
  try {
    const data = await Movie.find({
      status: "Đã xuất bản",
      isFree: true,
    }).limit(10);

    return res
      .status(200)
      .json({ message: "Get free movies successfully", data });
  } catch (error) {
    next(error);
  }
};

// Hàm đăng ký thông báo phim sắp ra mắt
export const registerMovieNotification = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.userId;

    const movie = await Movie.findById({ _id: movieId });

    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại." });
    }

    if (movie.status !== "Sắp ra mắt") {
      return res
        .status(400)
        .json({ message: "Bạn chỉ có thể đăng ký cho phim sắp ra mắt." });
    }

    // Tạo mới đăng ký
    const newSubscription = new MovieSubscription({
      user: userId,
      movie: movieId,
    });

    await newSubscription.save();

    return res
      .status(200)
      .json({ message: "Đăng ký nhận thông báo thành công!" });
  } catch (error) {
    next(error);
  }
};

// xóa đăng ký thông báo phim sắp ra mắt
export const unregisterMovieNotification = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.userId;

    const subscription = await MovieSubscription.findOneAndDelete({
      user: userId,
      movie: movieId,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ message: "Bạn không đăng ký nhận thông báo cho phim này." });
    }

    return res
      .status(200)
      .json({ message: "Đã hủy đăng ký nhận thông báo phim sắp ra mắt." });
  } catch (error) {
    next(error);
  }
};

// List đăng ký thông báo phim sắp ra mắt
export const getMovieSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Tìm subscription và populate thông tin phim
    const subscriptions = await MovieSubscription.find({
      user: userId,
    }).populate("movie", "name thumbnail");

    return res.status(200).json({
      message: "Get movie subscriptions successfully",
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const checkPreOrder = async (req, res) => {
  try {
    const { movieId } = req.params;

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPreOrdered = user.preOrders.includes(movieId);

    return res.status(200).json({ isPreOrdered });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      search = "",
      category,
      country,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    // Thêm tìm kiếm nếu có
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Thêm filter theo category nếu có
    if (category) {
      filter.category = category;
    }

    // Thêm filter theo country nếu có
    if (country) {
      filter.country = country;
    }

    // Lấy danh sách phim với phân trang và populate
    const movies = await Movie.paginate(filter, {
      populate: [
        { path: "category", select: "name slug" },
        { path: "country", select: "name slug" },
        { path: "actors", select: "name role" },
        { path: "directors", select: "name role" },
      ],
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
    });

    res.status(200).json({
      success: true,
      data: movies.docs,
      pagination: {
        total: movies.totalDocs,
        limit: movies.limit,
        page: movies.page,
        totalPages: movies.totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách phim.",
    });
  }
};

export const getMovieDetails = async (req, res, next) => {
  const { categoryId, countryId, id } = req.params;

  try {
    let query = { isDeleted: false }; // Điều kiện chung cho tất cả các truy vấn

    // Nếu có categoryId, thêm điều kiện tìm phim theo category
    if (categoryId) {
      query.category = categoryId;
    }

    // Nếu có countryId, thêm điều kiện tìm phim theo country
    if (countryId) {
      query.country = countryId;
    }

    // Nếu có id, tìm theo id phim cụ thể
    if (id) {
      const movie = await Movie.findById(id)
        .where("isDeleted")
        .equals(false)
        .populate("category")
        .populate("country");

      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      return res
        .status(200)
        .json({ message: "Get movie successfully", data: movie });
    }

    // Nếu không có id, tìm phim theo category hoặc country
    const movies = await Movie.find(query)
      .populate("category")
      .populate("country");

    if (!movies || movies.length === 0) {
      return res.status(404).json({ message: "No movies found" });
    }

    return res
      .status(200)
      .json({ message: "Get movies successfully", data: movies });
  } catch (error) {
    next(error);
  }
};

export const getMovieByPerson = async (req, res, next) => {
  const personId = req.params.personId;

  try {
    const movies = await Movie.find({
      actor: personId,
      isDeleted: false,
    })
      .populate("category")
      .populate("country")
      .populate("person");

    if (!movies || movies.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có phim nào từ person này." });
    }

    return res.status(200).json({ movies });
  } catch (error) {
    console.error("Lỗi khi lấy phim từ person:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server. Không thể lấy dữ liệu." });
  }
};
//top 10 phim free
export const getTopFreeMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({
      isDeleted: false,
      isFree: true,
    })
      .sort({ viewCount: -1 })
      .limit(10)
      .populate("category")
      .populate("country");

    return res.status(200).json({ movies });
  } catch (error) {
    next(error);
  }
};

//top 10 phim hot dựa vào lượt xem
export const getTopViewedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({
      isDeleted: false,
      status: "Đã xuất bản",
    })
      .sort({ viewCount: -1 })
      .limit(10)
      .populate("category")
      .populate("country");

    return res.status(200).json({ movies });
  } catch (error) {
    next(error);
  }
};

//in tất cả phim trừ phim đã xóa lọc tìm theo tên diễn viên
export const getAllMoviesExceptDeleted = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 9, sort = "asc" } = req.query;

    let query = { isDeleted: false };

    if (search) {
      const regex = new RegExp(search, "i");
      query.name = regex;
    }

    // Cấu hình phân trang
    const options = {
      page: Math.max(1, parseInt(page, 10)),
      limit: Math.max(1, parseInt(limit, 10)),
      populate: ["category", "country"],
      sort: { price: sort === "asc" ? 1 : -1 },
    };

    const result = await Movie.paginate(query, options);

    return res.status(200).json({
      message: "Get movies successfully",
      data: result.docs,
      pagination: {
        totalMovies: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
      },
    });
  } catch (error) {
    next(error);
  }
};

//tăng lượt xem
export const increaseViews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);

    movie.viewCount += 1;

    await movie.save();

    return res.status(200).json({ message: "Views updated", movie });
  } catch (error) {
    next(error);
  }
};
