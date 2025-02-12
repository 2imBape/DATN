import { Route, Router } from "express";
import {
  createPackage,
  deletePackage,
  getPackageById,
  getPackages,
  updatePackage,
} from "../controllers/package.js";

const packageRouter = new Router();

packageRouter.post("/", createPackage);
packageRouter.get("/", getPackages);
packageRouter.get("/:id", getPackageById);
packageRouter.put("/:id", updatePackage);
packageRouter.delete("/:id", deletePackage);

export default packageRouter;
