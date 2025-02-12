import Joi from "joi";

export const movieValidation = Joi.object({
  name: Joi.string().required(),
  origin_name: Joi.string().required(),
  isFree: Joi.boolean(),
  thumbnail: Joi.string().optional(),
  price: Joi.number(),
  description: Joi.string().required(),
  time: Joi.string().required(),
  quality: Joi.string().required(),
  video: Joi.string().optional(),
  trailer: Joi.string().optional(),
  duration: Joi.number().optional(),
  releaseDate: Joi.date(),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  category: Joi.array().items(Joi.string()).required(),
  country: Joi.array().items(Joi.string()).required(),
  // person: Joi.array().items(Joi.string()),
  actors: Joi.array().items(Joi.string()).required(),
  directors: Joi.array().items(Joi.string()).required(),
  status: Joi.string()
    .valid("Đã xuất bản", "Sắp ra mắt", "Đã xóa")
    .default("Đã xuất bản"),
});

export const updateMovieValidate = Joi.object({
  modified: Joi.object({
    time: Joi.date().iso(),
  }),
  name: Joi.string().required(),
  origin_name: Joi.string().required(),
  isFree: Joi.boolean(),
  thumbnail: Joi.string().optional(),
  description: Joi.string(),
  time: Joi.string().required(),
  quality: Joi.string().required(),
  video: Joi.string().optional(),
  trailer: Joi.string().optional(),
  releaseDate: Joi.date(),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  category: Joi.array().items(Joi.string()).required(),
  country: Joi.array().items(Joi.string()).required(),
  actors: Joi.array().items(Joi.string()).required(),
  directors: Joi.array().items(Joi.string()).required(),
  status: Joi.string()
    .valid("Đã xuất bản", "Sắp ra mắt", "Đã xóa")
    .default("Đã xuất bản"),
});
