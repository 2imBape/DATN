import { Router } from "express";
import {
  createDiscount,
  deleteDiscount,
  getAllDiscounts,
  getDiscountById,
  getDiscountByUserId,
  updateDiscount,
  getDiscountByIdWithUsers,
} from "../controllers/discount.js";
import { authentication } from "../middleware/authentication.js";

const discountRouter = new Router();

discountRouter.post("/", createDiscount);
discountRouter.get("/user", authentication, getDiscountByUserId);
discountRouter.get("/", getAllDiscounts);
discountRouter.get("/:id", getDiscountById);
discountRouter.delete("/:id", deleteDiscount);
discountRouter.put("/:id", updateDiscount);
discountRouter.get("/:id/user", getDiscountByIdWithUsers);

export default discountRouter;
