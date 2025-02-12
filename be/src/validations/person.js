import Joi from "joi";

export const personValidate = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required().min(1).max(100),
    role: Joi.string().valid("actors", "directors").required(),
    thumbnail: Joi.string().optional(),
    description: Joi.string().optional().required(),
});