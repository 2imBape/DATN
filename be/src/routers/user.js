import { Router } from "express";

import { authentication } from "../middleware/authentication.js";
import upload from "../config/multerConfig.js";
import {
  confirmDeleteUser,
  confirmEmailRecovery,
  deleteUser,
  getAllUser,
  getAllUsers,
  getProfile,
  getUserById,
  requestEmailRecovery,
  sendOldEmailVerification,
  updateEmail,
  updateProfile,
  updateUser,
} from "../controllers/user.js";

const userRouter = new Router();

userRouter.get("/profile", authentication, getProfile);
userRouter.get("/", getAllUsers);
userRouter.get("/all", getAllUser);
userRouter.get("/:id", getUserById);
userRouter.post("/delete", authentication, deleteUser);
userRouter.post("/recovery", requestEmailRecovery);
userRouter.post("/confirm-recovery", confirmEmailRecovery);
userRouter.post("/confirm-delete", authentication, confirmDeleteUser);

userRouter.put(
  "/updateProfile",
  authentication,
  upload.single("avatar"),
  updateProfile
);
userRouter.post("/sendUpdateEmail", authentication, sendOldEmailVerification);

userRouter.put("/updateEmail", authentication, updateEmail);
userRouter.put("/:id", updateUser);

export default userRouter;
