import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Favorite from "../models/Favorite.js";
import Movie from "../models/Movie.js";

export const getUserStatistics = async (req, res) => {
  try {
    const { type } = req.query;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let userStatistics = {};

    if (type === "daily") {
      const dailyNewUsers = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            new_users: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      userStatistics = {
        type: "daily",
        data: dailyNewUsers.map((item) => ({
          date: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
          new_users: item.new_users,
        })),
      };
    } else if (type === "monthly") {
      const monthlyNewUsers = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            new_users: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      userStatistics = {
        type: "monthly",
        data: monthlyNewUsers.map((item) => ({
          month: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          new_users: item.new_users,
        })),
      };
    } else if (type === "yearly") {
      const yearlyNewUsers = await User.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            new_users: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1 } },
      ]);

      userStatistics = {
        type: "yearly",
        data: yearlyNewUsers.map((item) => ({
          year: item._id.year,
          new_users: item.new_users,
        })),
      };
    } else {
      return res.status(400).json({
        message: "Invalid type. Choose 'daily', 'monthly', or 'yearly'.",
      });
    }

    res.status(200).json(userStatistics);
  } catch (error) {
    console.error("Error generating user statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRevenueStatistics = async (req, res) => {
  try {
    const { type } = req.query;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let revenueStatistics = {};

    if (type === "daily") {
      const dailyRevenue = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]);

      revenueStatistics = {
        revenue_stats: {
          daily: dailyRevenue.map((item) => ({
            date: `${item._id.year}-${item._id.month
              .toString()
              .padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
            revenue: item.totalAmount,
          })),
        },
      };
    } else if (type === "monthly") {
      const monthlyRevenue = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      revenueStatistics = {
        revenue_stats: {
          monthly: monthlyRevenue.map((item) => ({
            month: `${item._id.year}-${item._id.month
              .toString()
              .padStart(2, "0")}`,
            revenue: item.totalAmount,
          })),
        },
      };
    } else if (type === "yearly") {
      const yearlyRevenue = await Payment.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $sort: { "_id.year": 1 },
        },
      ]);

      revenueStatistics = {
        revenue_stats: {
          yearly: yearlyRevenue.map((item) => ({
            year: item._id.year,
            revenue: item.totalAmount,
          })),
        },
      };
    } else {
      return res.status(400).json({
        message: "Invalid type. Choose 'daily', 'monthly', or 'yearly'.",
      });
    }

    res.status(200).json(revenueStatistics);
  } catch (error) {
    console.error("Error generating revenue statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlyYearlyStatistics = async (req, res) => {
  try {
    const { type } = req.query; // type: "monthly" hoặc "yearly"
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let stats = {};

    if (type === "monthly") {
      // Tính tổng doanh thu và số người dùng trong tháng
      const monthlyStats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]);

      const totalUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth },
      });

      stats = {
        totalRevenue:
          monthlyStats.length > 0 ? monthlyStats[0].totalRevenue : 0,
        totalUsers: totalUsersThisMonth,
      };
    } else if (type === "yearly") {
      // Tính tổng doanh thu và số người dùng trong năm
      const yearlyStats = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]);

      const totalUsersThisYear = await User.countDocuments({
        createdAt: { $gte: startOfYear },
      });

      stats = {
        totalRevenue: yearlyStats.length > 0 ? yearlyStats[0].totalRevenue : 0,
        totalUsers: totalUsersThisYear,
      };
    } else {
      return res.status(400).json({
        message: "Invalid type. Choose 'monthly' or 'yearly'.",
      });
    }

    res.status(200).json({
      type,
      stats,
    });
  } catch (error) {
    console.error("Error generating monthly and yearly statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieLikeStatistics = async (req, res) => {
  try {
    const { type } = req.query;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let movieLikeStatistics = {};

    if (type === "daily") {
      const dailyLikes = await Favorite.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalLikes: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      movieLikeStatistics = {
        type: "daily",
        data: dailyLikes.map((item) => ({
          date: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
          likes: item.totalLikes,
        })),
      };
    } else if (type === "monthly") {
      const monthlyLikes = await Favorite.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalLikes: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      movieLikeStatistics = {
        type: "monthly",
        data: monthlyLikes.map((item) => ({
          month: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          likes: item.totalLikes,
        })),
      };
    } else if (type === "yearly") {
      const yearlyLikes = await Favorite.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            totalLikes: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1 } },
      ]);

      movieLikeStatistics = {
        type: "yearly",
        data: yearlyLikes.map((item) => ({
          year: item._id.year,
          likes: item.totalLikes,
        })),
      };
    } else {
      return res.status(400).json({
        message: "Invalid type. Choose 'daily', 'monthly', or 'yearly'.",
      });
    }

    res.status(200).json(movieLikeStatistics);
  } catch (error) {
    console.error("Error generating movie like statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMovieStatistics = async (req, res) => {
  try {
    const { type } = req.query; // Loại thống kê: 'daily', 'monthly', 'yearly'
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let movieStatistics = {};

    if (type === "daily") {
      const dailyMovies = await Movie.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalMovies: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      movieStatistics = {
        type: "daily",
        data: dailyMovies.map((item) => ({
          date: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
          movies: item.totalMovies,
        })),
      };
    } else if (type === "monthly") {
      const monthlyMovies = await Movie.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalMovies: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      movieStatistics = {
        type: "monthly",
        data: monthlyMovies.map((item) => ({
          month: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          movies: item.totalMovies,
        })),
      };
    } else if (type === "yearly") {
      const yearlyMovies = await Movie.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            totalMovies: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1 } },
      ]);

      movieStatistics = {
        type: "yearly",
        data: yearlyMovies.map((item) => ({
          year: item._id.year,
          movies: item.totalMovies,
        })),
      };
    } else {
      return res.status(400).json({
        message: "Invalid type. Choose 'daily', 'monthly', or 'yearly'.",
      });
    }

    res.status(200).json(movieStatistics);
  } catch (error) {
    console.error("Error generating movie statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMostViewedMovies = async (req, res) => {
  try {
    const { type } = req.query;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let mostViewedMovies = {};

    if (type === "daily") {
      const dailyMovies = await Movie.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth }, // Lọc phim theo tháng hiện tại
          },
        },
        {
          $group: {
            _id: "$_id", // Group theo ID phim
            totalViews: { $sum: "$viewCount" }, // Tổng lượt xem
          },
        },
        { $sort: { totalViews: -1 } }, // Sắp xếp theo lượt xem giảm dần
        { $limit: 10 }, // Lấy top 10 phim
        {
          $project: {
            _id: 1,
            totalViews: 1,
          },
        },
        {
          $lookup: {
            from: "movies", // Kết nối với bảng "movies"
            localField: "_id",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        { $unwind: "$movieDetails" }, // Trích xuất thông tin chi tiết phim
      ]);

      mostViewedMovies = {
        type: "daily",
        data: dailyMovies.map((item) => ({
          name: item.movieDetails.name,
          thumbnail: item.movieDetails.thumbnail,
          totalViews: item.totalViews,
          isFree: item.movieDetails.isFree,
        })),
      };
    } else if (type === "monthly") {
      const monthlyMovies = await Movie.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear }, // Lọc phim theo năm hiện tại
          },
        },
        {
          $group: {
            _id: "$_id", // Group theo ID phim
            totalViews: { $sum: "$viewCount" }, // Tổng lượt xem
          },
        },
        { $sort: { totalViews: -1 } }, // Sắp xếp theo lượt xem giảm dần
        { $limit: 10 }, // Lấy top 10 phim
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        { $unwind: "$movieDetails" },
      ]);

      mostViewedMovies = {
        type: "monthly",
        data: monthlyMovies.map((item) => ({
          name: item.movieDetails.name,
          thumbnail: item.movieDetails.thumbnail,
          totalViews: item.totalViews,
          isFree: item.movieDetails.isFree,
        })),
      };
    } else if (type === "yearly") {
      const yearlyMovies = await Movie.aggregate([
        {
          $group: {
            _id: "$_id", // Group theo ID phim
            totalViews: { $sum: "$viewCount" }, // Tổng lượt xem
          },
        },
        { $sort: { totalViews: -1 } }, // Sắp xếp theo lượt xem giảm dần
        { $limit: 10 }, // Lấy top 10 phim
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        { $unwind: "$movieDetails" },
      ]);

      mostViewedMovies = {
        type: "yearly",
        data: yearlyMovies.map((item) => ({
          name: item.movieDetails.name,
          thumbnail: item.movieDetails.thumbnail,
          totalViews: item.totalViews,
          isFree: item.movieDetails.isFree,
        })),
      };
    } else {
      return res.status(400).json({
        message: "Invalid type. Choose 'daily', 'monthly', or 'yearly'.",
      });
    }

    res.status(200).json(mostViewedMovies);
  } catch (error) {
    console.error("Error generating most viewed movies statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};