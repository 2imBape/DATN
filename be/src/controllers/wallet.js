import Payment from "../models/Payment.js";
import Wallet from "../models/Wallet.js";
import moment from "moment-timezone";

export const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const wallet = await Wallet.findOne({ userId: userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json(wallet);
  } catch (error) {
    console.error("Error getting wallet:", error);
    next(error);
  }
};

// export const getWalletHistory = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;
//     const walletHistory = await Payment.find({ user: userId })
//       .sort({ createdAt: -1 })
//       .limit(5);
//     if (!walletHistory) {
//       return res.status(404).json({ message: "Wallet history not found" });
//     }

//     res.json(walletHistory);
//   } catch (error) {
//     next(error);
//   }
// };

export const getWalletHistoryByUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, status, transactionId, page = 1 } = req.query;

    const query = { user: userId };

    const timezone = "Asia/Ho_Chi_Minh";

    if (startDate && endDate) {
      const start = moment
        .tz(startDate, "YYYY-MM-DD", timezone)
        .startOf("day")
        .toDate();
      const end = moment
        .tz(endDate, "YYYY-MM-DD", timezone)
        .endOf("day")
        .toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    if (status) {
      query.status = status;
    }

    if (transactionId) {
      query.transactionId = { $regex: transactionId, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }

    const limit = 5;
    const skip = (parseInt(page) - 1) * limit;

    const walletHistory = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalRecords = await Payment.countDocuments(query);

    res.status(200).json({
      totalRecords,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecords / limit),
      transactionsPerPage: limit,
      data: walletHistory,
    });
  } catch (error) {
    console.error("Error in getWalletHistory:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

export const getWalletHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, status, transactionId, page = 1 } = req.query;

    const query = {};
    const timezone = "Asia/Ho_Chi_Minh";
    const limit = 8;

    if (startDate && endDate) {
      const start = moment
        .tz(startDate, "YYYY-MM-DD", timezone)
        .startOf("day")
        .toDate();
      const end = moment
        .tz(endDate, "YYYY-MM-DD", timezone)
        .endOf("day")
        .toDate();
      query.createdAt = { $gte: start, $lte: end };
    }

    if (status) {
      query.status = status;
    }

    if (transactionId) {
      query.transactionId = { $regex: transactionId, $options: "i" };
    }

    const skip = (parseInt(page, 10) - 1) * limit;

    const [walletHistory, totalRecords] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name"),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      totalRecords,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalRecords / limit),
      transactionsPerPage: limit,
      data: walletHistory,
    });
  } catch (error) {
    next(error);
  }
};
