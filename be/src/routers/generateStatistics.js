import { Router } from "express";
import {
  getMonthlyYearlyStatistics,
  getMostViewedMovies,
  getMovieLikeStatistics,
  getMovieStatistics,
  getRevenueStatistics,
  getUserStatistics,
} from "../controllers/generateStatistics.js";

const generateStatistics = Router();

generateStatistics.get("/user-statistics", getUserStatistics);
generateStatistics.get("/revenue-statistics", getRevenueStatistics);
generateStatistics.get("/monthly-yearly-statistics",getMonthlyYearlyStatistics);
generateStatistics.get("/monthly-yearly-likeMovie", getMovieLikeStatistics);
generateStatistics.get("/monthly-yearly-topMovie", getMostViewedMovies);
generateStatistics.get("/monthly-yearly-NewMovie", getMovieStatistics);

export default generateStatistics;