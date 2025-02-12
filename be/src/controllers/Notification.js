import Notification from "../models/Notification.js";

//in ra thông báo
export const getNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ userId: userId }).sort({
      createdAt: -1,
    });
    if (notifications.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông báo nào." });
    }
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

//đánh dấu thông báo đã đọc
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.body;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo nào." });
    }
    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// Đánh dấu tất cả thông báo của người dùng là đã đọc
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId; 

    // Cập nhật tất cả thông báo chưa đọc của người dùng
    const result = await Notification.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } } 
    );

    if (result.nModified > 0) {
      return res.status(200).json({
        message: "Đã đánh dấu tất cả thông báo là đã đọc.",
      });
    } else {
      return res.status(200).json({
        message: "Không có thông báo nào cần đánh dấu là đã đọc.",
      });
    }
  } catch (error) {
    next(error); 
  }
};
