import { Router } from "express";
import {
  createComment,
  dislikeComment,
  getComments,
  getLevel1Comments,
  getRepComments,
  getRepComments2,
  likeComment,
} from "../controllers/comment.js";
import { authentication } from "../middleware/authentication.js";
import upload from "../config/multerConfig.js";

const commentRouter = new Router();

commentRouter.post(
  "/",
  upload.fields([{ name: "media" }]),
  authentication,
  createComment
);
commentRouter.post("/like", authentication, likeComment);
commentRouter.post("/dislike", authentication, dislikeComment);
commentRouter.get("/:movieId", getLevel1Comments);
commentRouter.get("/getRepComments/:cmtId", getRepComments);
commentRouter.get("/getRepCommentsTwo/:cmtId", getRepComments2);
commentRouter.get("/", getComments);

export default commentRouter;
