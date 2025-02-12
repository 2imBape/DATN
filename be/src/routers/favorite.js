import { Router } from "express";
import { getUserFavorites, toggleFavorite } from "../controllers/favorite.js";
import { authentication } from "../middleware/authentication.js";

const favoriteRouter = Router();

favoriteRouter.post("/", authentication, toggleFavorite);
favoriteRouter.delete("/", authentication, toggleFavorite);
favoriteRouter.get("/", authentication, getUserFavorites);

export default favoriteRouter;
