import Joi from "joi";

const forbiddenWords = [
  "buồi",
  "cặc",
  "địt",
  "lồn",
  "đéo",
  "cứt",
  "đĩ",
  "fuck",
  "shit",
  "damn",
  "bitch",
  "asshole",
  "crap",
];

export const commentValidation = Joi.object({
  movieId: Joi.string().required(),
  repCmtId: Joi.string().optional().allow(null),
  media: Joi.string().optional().allow(null),
  content: Joi.string()
    .min(1)
    .max(500)
    .required()
    .custom((value, helpers) => {
      const containsForbiddenWords = (content) => {
        return forbiddenWords.some((word) =>
          content.toLowerCase().includes(word.toLowerCase())
        );
      };

      if (containsForbiddenWords(value)) {
        return helpers.error("any.invalid", {
          message: "Bình luận chứa ngôn ngữ không phù hợp.",
        });
      }
      return value;
    }),
});
