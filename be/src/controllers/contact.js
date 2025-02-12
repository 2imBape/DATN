import Contact from "../models/Contact.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const senderId = req.user.userId;

    const receiverId = "6725f7b91f218c7b7a137fdd";

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn không được để trống.",
      });
    }

    const newMessage = new Contact({ senderId, receiverId, message });
    await newMessage.save();

    return res.status(200).json({
      success: true,
      message: "Tin nhắn đã được gửi thành công",
      newMessage,
    });
  } catch (error) {
    console.error("Lỗi trong sendMessage:", error);
    next(error);
  }
};

export const sendMessageFromAdmin = async (req, res, next) => {
  try {
    const { message, userId } = req.body;
    const senderId = "6725f7b91f218c7b7a137fdd";
    const receiverId = userId;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn và ID người nhận không được để trống.",
      });
    }

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn không được để trống.",
      });
    }

    const newMessage = new Contact({ senderId, receiverId, message });
    await newMessage.save();

    return res.status(201).json({
      success: true,
      message: "Tin nhắn đã được gửi thành công",
      newMessage,
    });
  } catch (error) {
    console.error("Lỗi trong sendMessage:", error);
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const adminId = "6725f7b91f218c7b7a137fdd";

    const { page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNumber - 1) * limitNumber;

    const chatHistory = await Contact.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(startIndex)
      .limit(limitNumber)
      .populate("senderId", "name avatar")
      .populate("receiverId", "name avatar");

    const totalMessages = await Contact.countDocuments({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    });

    const formattedChatHistory = chatHistory.map((chat) => ({
      senderId: chat.senderId._id,
      senderName: chat.senderId.name,
      senderAvatar: chat.senderId.avatar,
      receiverId: chat.receiverId._id,
      receiverName: chat.receiverId.name,
      receiverAvatar: chat.receiverId.avatar,
      message: chat.message,
      createdAt: chat.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Lịch sử trò chuyện đã được lấy thành công",
      chatHistory: formattedChatHistory,
      currentPage: pageNumber,
      totalMessages,
      totalPages: Math.ceil(totalMessages / limitNumber),
    });
  } catch (error) {
    console.error("Lỗi trong getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình lấy lịch sử trò chuyện",
    });
  }
};

export const getUsersChattedWithAdmin = async (req, res, next) => {
  try {
    const adminId = "6725f7b91f218c7b7a137fdd";
    const searchTerm = req.query.name || "";
    const users = await Contact.aggregate([
      {
        $match: {
          $or: [{ senderId: adminId }, { receiverId: adminId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", adminId] },
              "$receiverId",
              "$senderId",
            ],
          },
          latestMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $match: {
          "userInfo.name": { $regex: searchTerm, $options: "i" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          id: "$_id",
          name: "$userInfo.name",
          avatar: "$userInfo.avatar",
          latestMessage: {
            message: "$latestMessage.message",
            createdAt: "$latestMessage.createdAt",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Danh sách người dùng đã nhắn tin với admin",
      users,
    });
  } catch (error) {
    console.error("Lỗi trong getUsersChattedWithAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình lấy danh sách người dùng",
    });
  }
};

export const getMessagesByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const adminId = "6725f7b91f218c7b7a137fdd";

    const { page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const startIndex = (pageNumber - 1) * limitNumber;

    const messages = await Contact.find({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(startIndex)
      .limit(limitNumber)
      .populate("senderId", "name avatar")
      .populate("receiverId", "name avatar");

    const totalMessages = await Contact.countDocuments({
      $or: [
        { senderId: userId, receiverId: adminId },
        { senderId: adminId, receiverId: userId },
      ],
    });

    const formattedMessages = messages.map((message) => ({
      senderId: message.senderId._id,
      senderName: message.senderId.name,
      senderAvatar: message.senderId.avatar,
      receiverId: message.receiverId._id,
      receiverName: message.receiverId.name,
      receiverAvatar: message.receiverId.avatar,
      message: message.message,
      createdAt: message.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Danh sách tin nhắn đã được lấy thành công",
      messages: formattedMessages,
      currentPage: pageNumber,
      totalMessages,
      totalPages: Math.ceil(totalMessages / limitNumber),
    });
  } catch (error) {
    console.error("Lỗi trong getMessagesByUserId:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình lấy tin nhắn",
    });
  }
};
