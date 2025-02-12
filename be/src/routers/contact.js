import { Router } from "express";
import {
  getChatHistory,
  getMessagesByUserId,
  getUsersChattedWithAdmin,
  sendMessage,
  sendMessageFromAdmin,
} from "../controllers/contact.js";
import { authentication } from "../middleware/authentication.js";

const contactRouter = Router();

contactRouter.post("/", authentication, sendMessage);
contactRouter.post("/admin", sendMessageFromAdmin);
contactRouter.get("/", authentication, getChatHistory);
contactRouter.get("/admin", getUsersChattedWithAdmin);
contactRouter.get("/messages/:userId", getMessagesByUserId);

export default contactRouter;
