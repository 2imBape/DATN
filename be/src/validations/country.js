import Joi from "joi";

export const countryValidate = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
});
