import Joi from "joi";

export const registerValidate = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string(),
  phone: Joi.string().min(10).max(15),
  role: Joi.string().valid("user", "admin"),
});

export const loginValidate = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
