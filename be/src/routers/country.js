import { Router } from "express";
import {
  createCountry,
  deleteCountry,
  getCountry,
  updateCountry,
} from "../controllers/country.js";

const routerCountry = Router();

routerCountry.get("/", getCountry);
routerCountry.post("/", createCountry);
routerCountry.delete("/:id", deleteCountry);
routerCountry.patch("/:id", updateCountry);

export default routerCountry;
