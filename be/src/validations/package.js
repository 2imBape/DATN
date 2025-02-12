import Joi from "joi";

export const packageValidation = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  durationInMonths: Joi.number().required(),
  description: Joi.string().required(),
  concurrentDevices: Joi.number().required(),
  channels: Joi.boolean().required(),
  premiumSports: Joi.boolean().required(),
  hboGo: Joi.boolean().required(),
  noAds: Joi.boolean().required(),
  kplusChannels: Joi.boolean().required(),
  premiumSports: Joi.boolean().required(),
});
