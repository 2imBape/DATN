import Country from "../models/Country.js";
import { countryValidate } from "../validations/country.js";

export const getCountry = async (req, res, next) => {
  try {
    const { search } = req.query;
    let country;
    if (search) {
      const regex = new RegExp(search, "i");
      country = await Country.find({ name: regex });
    } else {
      country = await Country.find();
    }

    return res
      .status(200)
      .json({ message: "Country fetched successfully", country });
  } catch (error) {
    next(error);
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const { error } = countryValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const country = await Country.create(req.body);
    return res
      .status(201)
      .json({ message: "Country created successfully", country });
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    return res
      .status(200)
      .json({ message: "Country deleted successfully", country });
  } catch (error) {
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { error } = countryValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    return res
      .status(200)
      .json({ message: "Country updated successfully", country });
  } catch (error) {
    next(error);
  }
};
