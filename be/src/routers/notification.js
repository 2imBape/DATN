import { Router } from "express";
import { getNotification, markAsRead, markAllAsRead } from "../controllers/Notification.js";
import { authentication } from "../middleware/authentication.js";


const notificationRouter = Router();

notificationRouter.get("/",authentication, getNotification);
notificationRouter.patch("/read",authentication, markAsRead);
notificationRouter.patch("/allread",authentication, markAllAsRead);


export default notificationRouter;
