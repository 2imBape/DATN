import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Movie from "../models/Movie.js";

export const toggleFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    const favorite = await Favorite.findOne({ user: userId, movie: movieId });

    if (favorite) {
      await Favorite.deleteOne({ _id: favorite._id });
      await Movie.findByIdAndUpdate(movieId, { $inc: { favoriteCount: -1 } });
      return res
        .status(200)
        .json({ message: "Xóa like và xóa khỏi yêu thích" });
    }

    const newFavorite = new Favorite({ user: userId, movie: movieId });
    await newFavorite.save();
    await Movie.findByIdAndUpdate(movieId, { $inc: { favoriteCount: 1 } });

    return res
      .status(201)
      .json({ message: "Đã like và thêm vào danh sách thích" });
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    next(error);
  }
};
//xóa khỏi danh sách
export const deleteFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.userId;

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      movie: movieId,
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await Movie.findByIdAndUpdate(movieId, { $inc: { favoriteCount: -1 } });

    return res.status(200).json({ message: "Xóa khỏi danh sách thích" });
  } catch (error) {
    console.error("Error in deleteFavorite:", error);
    next(error);
  }
};
// Hiển thị danh sách các phim đã like của user
export const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const favorites = await Favorite.find({ user: userId }).populate("movie");

    if (favorites.length === 0) {
      return res.status(404).json({ message: "No favorite movies found" });
    }

    const favoriteMovies = favorites.map((favorite) => ({
      movieId: favorite.movie._id,
      name: favorite.movie.name,
      thumbnail: favorite.movie.thumbnail, // Thêm trường thumbnail
    }));

    return res.status(200).json({ favoriteMovies });
  } catch (error) {
    console.error("Error in getUserFavorites:", error);
    next(error);
  }
};
