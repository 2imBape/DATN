import Discount from "../models/Discount.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmailNotification } from "../utils/sendVerificationEmail.js";
import moment from "moment-timezone";

export const getAllDiscounts = async (req, res, next) => {
  const { search, page = 1, limit = 8, sort = "asc" } = req.query;

  try {
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { code: regex }];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: sort === "asc" ? 1 : -1 },
    };

    const discounts = await Discount.paginate(query, options);

    res.status(200).json(discounts);
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết discount theo ID
export const getDiscountById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findById(id);

    if (!discount) {
      return res.status(404).json({ message: "Khuyến mãi không tồn tại." });
    }

    res.status(200).json(discount);
  } catch (error) {
    console.error("Error fetching discount:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy chi tiết khuyến mãi." });
  }
};

// Tạo mới discount
export const createDiscount = async (req, res, next) => {
  const { name, code, discountPercentage, applicableUsers } = req.body;
  let { expiry } = req.body;
  if (!expiry) {
    expiry = null;
  }
  req.body.expiry = expiry;
  if (discountPercentage < 0 || discountPercentage > 100) {
    return res.status(400).json({
      message: "Phần trăm giảm giá phải nằm trong khoảng từ 0 đến 100.",
    });
  }

  try {
    const discount = new Discount({
      code,
      name,
      expiry,
      discountPercentage,
      applicableUsers,
    });

    await discount.save();
    const users = await User.find({ _id: applicableUsers });

    if (users.length > 0) {
      for (const user of users) {
        const email = user.email;
        const subject = `Thông báo sự kiện: ${name}`;
        const message = `Chào bạn, chúng tôi xin thông báo về sự kiện "${name}". Mã sự kiện có hạn, vui lòng quay lại với Movie Store của chúng tôi để trải nghiệm ngay!\n\nTrân trọng!`;
        Notification.create({
          userId: user._id,
          title: subject,
          message: `Chào bạn, nhân sự kiện "${name}". Để tri ân bạn, chúng tôi tặng bạn mã giảm giá. Lưu ý, mã giảm giá có hạn. Hãy nhanh tay sử dụng!Trân trọng!`,
          type: "reminder",
        });
        sendEmailNotification(email, subject, message);
      }
    }
    res.status(201).json({ message: "Tạo khuyến mãi thành công.", discount });
  } catch (error) {
    next(error);
  }
};

// Xóa mềm discount
export const deleteDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({ message: "Khuyến mãi không tồn tại." });
    }

    res.status(200).json({ message: "  mềm khuyến mãi thành công." });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa khuyến mãi." });
  }
};

// Sửa discount
export const updateDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const discount = await Discount.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!discount) {
      return res.status(404).json({ message: "Khuyến mãi không tồn tại." });
    }

    res
      .status(200)
      .json({ message: "Cập nhật khuyến mãi thành công.", discount });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật khuyến mãi." });
  }
};

// Lấy danh sách discount theo userId
export const getDiscountByUserId = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const discounts = await Discount.find({
      applicableUsers: userId,
    });

    res.status(200).json(discounts);
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết theo ID và User
export const getDiscountByIdWithUsers = async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm discount theo ID và populate thông tin người dùng từ applicableUsers
    const discount = await Discount.findById(id)
      .populate({
        path: "applicableUsers",
        select: "name avatar email",
      })
      .exec();

    // Kiểm tra xem discount có tồn tại không
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount không tồn tại",
      });
    }

    // Trả về discount cùng với thông tin người dùng
    res.status(200).json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error("Error fetching discount with users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin discount và người dùng",
    });
  }
};

const checkAnUpdateDiscount = async () => {
  try {
    const discounts = await Discount.find();

    const currentDate = moment().startOf("second");

    for (const discount of discounts) {
      const expiry = discount.expiry;
      const users = discount.applicableUsers;

      if (expiry) {
        const expirationDate = moment(expiry).startOf("second");

        const secondsDifference = expirationDate.diff(currentDate, "seconds");

        if (secondsDifference <= 0) {
          await Discount.findByIdAndDelete(discount._id);
        }
        if (secondsDifference <= 24 * 60 * 60) {
          console.log(secondsDifference);

          const notificationPromises = users.map((user) =>
            Notification.create({
              userId: user,
              title: `Mã ${discount.code} còn 1 ngày nữa hết hạn`,
              message: `Chỉ còn 1 ngày nữa, mã giảm giá "${discount.code}" sẽ hết hạn. Hãy sử dụng ngay!`,
              type: "reminder",
            })
          );
          console.log(notificationPromises);
          await Promise.all(notificationPromises);
        }
      }
    }
  } catch (error) {
    console.error("Error checking for expired discounts:", error);
    console.log("Failed to check for expired discounts.");
  }
};

export default checkAnUpdateDiscount;
