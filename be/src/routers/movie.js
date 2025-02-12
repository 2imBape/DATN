import { Router } from "express";
import {
  createMovie,
  deleteMovie,
  getComingSoonMovies,
  getFreeMovies,
  getMovieByCategory,
  getNewMovies,
  getTopLikedMovies,
  permanentMovie,
  recoverMovie,
  registerMovieNotification,
  trashMovie,
  unregisterMovieNotification,
  updateMovie,
  checkPreOrder,
  getAllMovies,
  getMovieDetails,
  getMovieSubscriptions,
  getMovieByPerson,
  getTopFreeMovies,
  getAllMoviesExceptDeleted,
  increaseViews,
  getTopViewedMovies,
} from "../controllers/movie.js";
import upload from "../config/multerConfig.js";
import { authentication } from "../middleware/authentication.js";

const movieRouter = Router();
movieRouter.get("/trash", trashMovie);
// movieRouter.get("/", getMovies);
movieRouter.get("/topLike", getTopLikedMovies);
movieRouter.get("/freeMovie", getTopFreeMovies);
movieRouter.get("/newMovie", getNewMovies);
movieRouter.get("/free", getFreeMovies);
movieRouter.get("/comingSoon", getComingSoonMovies);
movieRouter.get("/register", authentication, registerMovieNotification);
movieRouter.post("/register", authentication, registerMovieNotification);
movieRouter.delete("/unRegister", authentication, unregisterMovieNotification);
movieRouter.get("/listRegister", authentication, getMovieSubscriptions);
movieRouter.get("/topTrending", getTopViewedMovies);
// movieRouter.get("/:id", getMovie);
movieRouter.get("/category/:categoryId", getMovieByCategory);
movieRouter.get("/person/:personId", getMovieByPerson);
// movieRouter.put("/:id", updateMovie);
movieRouter.get("/check-preorder/:movieId", authentication, checkPreOrder);
movieRouter.get("/allMovie", getAllMoviesExceptDeleted);
movieRouter.post(
  "/",
  upload.fields([
    { name: "thumbnail" },
    { name: "video" },
    { name: "trailer" },
  ]),
  createMovie
);

movieRouter.delete("/:id", deleteMovie);
movieRouter.put("/recover/:id", recoverMovie);
movieRouter.delete("/permanent/:id", permanentMovie);

movieRouter.put(
  "/:id",
  upload.fields([
    { name: "thumbnail" },
    { name: "video" },
    { name: "trailer" },
  ]),
  updateMovie
);

// Hiển thị tất cả phim
movieRouter.get("/", getAllMovies);
movieRouter.get("/:id", getMovieDetails);
movieRouter.post("/viewMovie/:id", increaseViews);

export default movieRouter;
