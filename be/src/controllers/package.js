import Package from "../models/Package.js";
import { packageValidation } from "../validations/package.js";

// Thêm package
export const createPackage = async (req, res, next) => {
  const { error } = packageValidation.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }

  try {
    const packageExists = await Package.findOne({
      name: req.body.name,
    });

    if (packageExists) {
      return res.status(400).json({ message: "Tên gói đã tồn tại." });
    }

    const newPackage = new Package(req.body);
    await newPackage.save();

    res
      .status(201)
      .json({ message: "Thêm gói phim thành công.", data: newPackage });
  } catch (error) {
    next(error);
  }
};

// Hiển thị danh sách gói phim
export const getPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({});

    const formattedPackages = packages.map((pkg) => ({
      _id: pkg._id,
      name: pkg.name,
      price: pkg.price,
      durationInMonths: pkg.durationInMonths,
      description: pkg.description,
      concurrentDevices: pkg.concurrentDevices,
      channels: pkg.channels,
      premiumSports: pkg.premiumSports,
      hboGo: pkg.hboGo,
      noAds: pkg.noAds,
      kplusChannels: pkg.kplusChannels,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    }));

    res
      .status(200)
      .json({ message: "Danh sách gói dịch vụ.", data: formattedPackages });
  } catch (error) {
    next(error);
  }
};

// Hiển thị gói phim theo ID
export const getPackageById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const foundPackage = await Package.findById(id);

    if (!foundPackage) {
      return res.status(404).json({ message: "Không tìm thấy gói phim." });
    }

    res
      .status(200)
      .json({ message: "Thông tin gói phim.", data: foundPackage });
  } catch (error) {
    next(error);
  }
};
export const updatePackage = async (req, res, next) => {
  const { id } = req.params;
  
  // Validate dữ liệu đầu vào
  const { error } = packageValidation.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }

  try {
    const updatedPackage = await Package.findByIdAndUpdate(id, req.body, {
      new: true, // Trả về gói phim đã cập nhật
      runValidators: true, // Áp dụng các validate trong schema
    });

    if (!updatedPackage) {
      return res.status(404).json({ message: "Không tìm thấy gói phim để cập nhật." });
    }

    res
      .status(200)
      .json({ message: "Cập nhật gói phim thành công.", data: updatedPackage });
  } catch (error) {
    next(error);
  }
};

// Xóa gói phim
export const deletePackage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Không tìm thấy gói phim để xóa." });
    }

    res.status(200).json({ message: "Xóa gói phim thành công.", data: deletedPackage });
  } catch (error) {
    next(error);
  }
};