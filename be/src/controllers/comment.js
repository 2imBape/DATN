import cloudinary from "../config/cloudinaryConfig.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { commentValidation } from "../validations/comment.js";

export const createComment = async (req, res, next) => {
  const { error } = commentValidation.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }

  try {
    const { movieId, repCmtId, content } = req.body;
    const userId = req.user.userId;
    let media = null;

    if (req.files && req.files.media) {
      const result = await cloudinary.uploader.upload(req.files.media[0].path, {
        folder: "comment/medias",
        resource_type: "auto",
      });
      media = result.secure_url;
    }

    let level = 1;

    if (repCmtId) {
      const parentComment = await Comment.findById(repCmtId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ message: "Bình luận cha không tồn tại." });
      }

      level = parentComment.level + 1;

      if (level > 3) {
        level = 1;
      }
    }

    const newComment = new Comment({
      userId,
      movieId,
      content,
      media,
      repCmtId: repCmtId || null,
      level,
    });

    const createdComment = await newComment.save();

    const commentWithUser = await Comment.findById(createdComment._id).populate(
      "userId",
      "name avatar"
    );

    res.status(201).json({
      message: "Bình luận được tạo thành công.",
      data: commentWithUser,
    });
  } catch (err) {
    console.error("Lỗi khi tạo bình luận:", err);
    next(err);
  }
};

export const getLevel1Comments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({ movieId, repCmtId: null })
      .populate("userId", "name avatar")
      .populate("likedBy", "name avatar")
      .populate("dislikedBy", "name avatar _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .exec();

    // Thêm số lượng phản hồi cho mỗi bình luận
    const commentsWithReplyCount = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          repCmtId: comment._id,
        });
        return {
          ...comment.toObject(),
          replyCount,
        };
      })
    );

    const totalComments = await Comment.countDocuments({
      movieId,
      repCmtId: null,
    });

    const totalPages = Math.ceil(totalComments / limitNumber);

    res.status(200).json({
      comments: commentsWithReplyCount,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// in ra bình luận 2 dựa vào id  bình luận 1
export const getRepComments = async (req, res, next) => {
  try {
    const { cmtId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({ repCmtId: cmtId })
      .populate("userId", "name avatar")
      .populate("likedBy", "name avatar _id")
      .populate("dislikedBy", "name avatar _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .exec();

    // Thêm số lượng phản hồi cho mỗi bình luận phản hồi
    const commentsWithReplyCount = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          repCmtId: comment._id,
        });
        return {
          ...comment.toObject(),
          replyCount,
        };
      })
    );

    res.status(200).json(commentsWithReplyCount);
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// in ra bình luận 3 dựa và bình luận
export const getRepComments2 = async (req, res, next) => {
  try {
    const { cmtId } = req.params;

    const { page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({ repCmtId: cmtId })
      .populate("userId", "name avatar")
      .populate("likedBy", "name avatar _id")
      .populate("dislikedBy", "name avatar _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .exec();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:");
  }
};

export const getComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const comments = await Comment.find({ movieId })
      .populate("likedBy", "name avatar")
      .exec();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const getMovieComments = async (req, res, next) => {
//   try {
//     const { movieId } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = 5;
//     const level2Limit = 2;
//     const level3Limit = 2;
//     const skip = (page - 1) * limit;

//     const loadMore = req.query.loadMore === "true";

//     const level1Comments = await Comment.find({ movieId, repCmtId: null })
//       .populate("userId", "name avatar")
//       .populate("likedBy", "name avatar _id")
//       .populate("dislikedBy", "name avatar _id")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalLevel1Count = await Comment.countDocuments({
//       movieId,
//       repCmtId: null,
//     });

//     const level1CommentIds = level1Comments.map((comment) => comment._id);

//     const level2Comments = await Comment.find({
//       movieId,
//       repCmtId: { $in: level1CommentIds },
//     })
//       .populate("userId", "name avatar")
//       .populate("likedBy", "name avatar _id")
//       .populate("dislikedBy", "name avatar _id")
//       .sort({ createdAt: -1 })
//       .limit(loadMore ? totalLevel1Count : level2Limit);

//     const level2CommentIds = level2Comments.map((comment) => comment._id);

//     const level3Comments = await Comment.find({
//       movieId,
//       repCmtId: { $in: level2CommentIds },
//     })
//       .populate("userId", "name avatar")
//       .populate("likedBy", "name avatar _id")
//       .populate("dislikedBy", "name avatar _id")
//       .sort({ createdAt: -1 })
//       .limit(level3Limit);

//     const level1CommentMap = {};
//     level1Comments.forEach((comment) => {
//       level1CommentMap[comment._id] = {
//         _id: comment._id,
//         userId: comment.userId,
//         content: comment.content,
//         createdAt: comment.createdAt,
//         media: comment.media || null,
//         replies: [],
//         likedBy: comment.likedBy || [],
//         dislikedBy: comment.dislikedBy || [],
//         replyCount: 0,
//         canLoadMoreLevel2: false,
//       };
//     });

//     const level2CommentMap = {};
//     level2Comments.forEach((comment) => {
//       level2CommentMap[comment._id] = {
//         _id: comment._id,
//         userId: comment.userId,
//         content: comment.content,
//         createdAt: comment.createdAt,
//         media: comment.media || null,
//         replies: [],
//         likedBy: comment.likedBy || [],
//         dislikedBy: comment.dislikedBy || [],
//         replyCount: 0,
//         canLoadMoreLevel3: false,
//       };

//       if (comment.repCmtId && level1CommentMap[comment.repCmtId]) {
//         level1CommentMap[comment.repCmtId].replies.push(
//           level2CommentMap[comment._id]
//         );
//         level1CommentMap[comment.repCmtId].replyCount += 1;
//       }
//     });

//     // Thêm bình luận cấp 3 vào bình luận cấp 2
//     level3Comments.forEach((comment) => {
//       if (comment.repCmtId && level2CommentMap[comment.repCmtId]) {
//         const reply = {
//           _id: comment._id,
//           userId: comment.userId,
//           content: comment.content,
//           createdAt: comment.createdAt,
//           media: comment.media || null,
//           likedBy: comment.likedBy || [],
//           dislikedBy: comment.dislikedBy || [],
//         };

//         level2CommentMap[comment.repCmtId].replies.push(reply);
//         level2CommentMap[comment.repCmtId].replyCount += 1;

//         // Đánh dấu nếu có thể tải thêm bình luận cấp 3
//         if (level2CommentMap[comment.repCmtId].replyCount > level3Limit) {
//           level2CommentMap[comment.repCmtId].canLoadMoreLevel3 = true;
//         }
//       }
//     });

//     // Kiểm tra xem có bình luận cấp 2 nào chưa được tải hết không
//     level1Comments.forEach((comment) => {
//       if (comment.replyCount > level2Limit) {
//         level1CommentMap[comment._id].canLoadMoreLevel2 = true;
//       }
//     });

//     const finalResponse = Object.values(level1CommentMap);

//     // Trả về kết quả
//     res.json({
//       comments: finalResponse,
//       totalLevel1Count,
//       totalPages: Math.ceil(totalLevel1Count / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const likeComment = async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user.userId;

  try {
    const comment = await Comment.findById(commentId).populate(
      "userId",
      "name avatar"
    );
    const user = await User.findById(userId).select("name avatar");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Kiểm tra nếu người dùng đã dislike
    if (comment.dislikedBy.includes(userId)) {
      comment.dislikes -= 1;
      comment.dislikedBy = comment.dislikedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Kiểm tra nếu người dùng chưa like
    if (!comment.likedBy.includes(userId)) {
      comment.likes += 1;
      comment.likedBy.push(user);
      await comment.save();

      return res.status(200).json(comment);
    } else {
      return res.status(400).json({ message: "Bạn đã like bình luận này rồi" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const dislikeComment = async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user.userId;

  try {
    const comment = await Comment.findById(commentId).populate(
      "userId",
      "name avatar"
    );

    const user = await User.findById(userId).select("name avatar");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.likedBy.includes(userId)) {
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    if (
      !comment.dislikedBy.some(
        (dislikeUser) => dislikeUser._id.toString() === userId.toString()
      )
    ) {
      comment.dislikes += 1;
      comment.dislikedBy.push(user);

      await comment.save();

      return res.status(200).json(comment);
    } else {
      return res
        .status(400)
        .json({ message: "Bạn đã không thích bình luận này rồi" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
