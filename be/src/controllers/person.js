import Person from "../models/Person.js";
import { personValidate } from "../validations/person.js";
import cloudinary from "../config/cloudinaryConfig.js";

export const createPerson = async (req, res, next) => {
  try {
    const { error } = personValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let thumbnailUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "thumbnail",
      });
      thumbnailUrl = result.secure_url;
    } else {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const personData = {
      ...req.body,
      thumbnail: thumbnailUrl,
    };

    const person = await Person.create(personData);

    return res
      .status(201)
      .json({ message: "Person created successfully", person });
  } catch (error) {
    next(error);
  }
};

//sửa
export const updatePerson = async (req, res, next) => {
  try {
    const { error } = personValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let updatedData = { ...req.body };

    // Nếu có file mới, upload lên Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "thumbnail",
      });
      updatedData.thumbnail = result.secure_url;
    }

    // Tìm và cập nhật bản ghi
    const person = await Person.findByIdAndUpdate(req.params.id, updatedData, {
      new: true, // Trả về dữ liệu mới sau khi cập nhật
      runValidators: true, // Kiểm tra schema của Mongoose trước khi cập nhật
    });

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    return res
      .status(200)
      .json({ message: "Person updated successfully", person });
  } catch (error) {
    next(error);
  }
};

export const getPerson = async (req, res, next) => {
  try {
    const persons = await Person.find();
    if (!persons) {
      return res.status(404).json({ message: "No persons found" });
    }
    return res.status(200).json({ persons });
  } catch (error) {
    next(error);
  }
};

export const getPersonById = async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }
    return res.status(200).json({ person });
  } catch (error) {
    next(error);
  }
};

export const deletePerson = async (req, res, next) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }
    return res
      .status(200)
      .json({ message: "Person deleted successfully", person });
  } catch (error) {
    next(error);
  }
};
