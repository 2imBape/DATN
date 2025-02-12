import { Router } from "express";
import {
  getWallet,
  getWalletHistory,
  getWalletHistoryByUser,
} from "../controllers/wallet.js";
import { authentication } from "../middleware/authentication.js";

const walletRouter = Router();

walletRouter.get("/", authentication, getWallet);
walletRouter.get("/history", authentication, getWalletHistoryByUser);
walletRouter.get("/historyAdmin", getWalletHistory);

export default walletRouter;
