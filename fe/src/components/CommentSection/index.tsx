import React, { useEffect, useState } from "react";
import { message, Button, Avatar, Input, Tooltip } from "antd";
import { UserOutlined, LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import { Comment } from "@/interfaces/Comment";
import instance from "@/configs/axios";
import { formatTime } from "@/utils/utils";
import LikeDislikeModal from "../LikeDislikeModal/LikeDislikeModal";
import { User } from "@/interfaces/User";
import { checkAuthentication } from "@/utils/checkAuthentication";
import { useNavigate } from "react-router-dom";

const CommentSection: React.FC<{ movieId: string }> = ({ movieId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const commentsPerPage = 5;
  const [newCommentContent, setNewCommentContent] = useState<string>("");
  const [likeUsers, setLikeUsers] = useState<User[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showLoadMore, setShowLoadMore] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showLoadMoreLevel3, setShowLoadMoreLevel3] = useState<{
    [key: string]: boolean;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments(currentPage);
  }, [movieId, currentPage]);

  const fetchComments = async (page: number) => {
    try {
      console.log(comments);
      setLoading(true);
      const response = await instance.get(`/comment/${movieId}`, {
        params: {
          page,
          limit: commentsPerPage,
        },
      });

      if (page === 1) {
        setComments(response.data.comments);
        setVisibleComments(response.data.comments);
      } else {
        setComments((prevComments) => [
          ...prevComments,
          ...response.data.comments,
        ]);
        setVisibleComments((prevVisibleComments) => [
          ...prevVisibleComments,
          ...response.data.comments,
        ]);
      }

      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      message.error("Không thể tải bình luận. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      message.info("Đã hiển thị tất cả bình luận.");
    }
  };

  const fetchUpdatedComments = async () => {
    try {
      const updatedResponse = await instance.get(`/comment/${movieId}`, {
        params: {
          page: 1,
          limit: commentsPerPage,
        },
      });

      const formattedComments = updatedResponse.data.comments.map(
        (comment: any) => ({
          ...comment,
          replies: comment.replies || [],
        })
      );

      setComments(formattedComments);

      setVisibleComments(formattedComments.slice(0, commentsPerPage));
      setTotalPages(updatedResponse.data.totalPages); // Cập nhật tổng số trang
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
      message.error("Không thể tải bình luận. Vui lòng thử lại sau.");
    }
  };

  const handleAddComment = async () => {
    if (!newCommentContent) {
      message.error("Nội dung bình luận không được để trống!");
      return;
    }

    try {
      await instance.post(`/comment`, {
        movieId,
        content: newCommentContent,
      });

      await fetchUpdatedComments();
      setNewCommentContent("");
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      message.error("Không thể thêm bình luận. Vui lòng thử lại sau.");
    }
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value);
  };

  const handleReplySubmit = async (commentId: string | undefined) => {
    if (!replyContent.trim()) {
      message.error("Nội dung phản hồi không được để trống!");
      return;
    }

    try {
      await instance.post(`/comment`, {
        movieId,
        repCmtId: commentId,
        content: replyContent,
      });

      await fetchUpdatedComments();
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
      message.error("Không thể gửi phản hồi. Vui lòng thử lại sau.");
    }
  };

  const loadMoreLevel2Comments = async (
    parentCommentId: string | undefined
  ) => {
    if (!parentCommentId) {
      console.error("parentCommentId is undefined");
      return;
    }

    try {
      const response = await instance.get(
        `/comment/getRepComments/${parentCommentId}`
      );
      const replies = response.data;

      setVisibleComments((prevVisibleComments) =>
        prevVisibleComments.map((comment) =>
          comment._id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), ...replies] }
            : comment
        )
      );

      setShowLoadMore((prev) => ({
        ...prev,
        [parentCommentId]: false,
      }));
    } catch (error) {
      console.error("Lỗi khi tải bình luận cấp 2:", error);
      message.error("Không thể tải bình luận trả lời. Vui lòng thử lại sau.");
    }
  };

  const loadMoreLevel3Comments = async (
    parentCommentId: string | undefined,
    repCommentId: string | undefined
  ) => {
    if (!repCommentId) {
      console.error("repCommentId is undefined");
      return;
    }

    try {
      const response = await instance.get(
        `/comment/getRepCommentsTwo/${repCommentId}`
      );
      const replies = response.data;

      setVisibleComments((prevVisibleComments) =>
        prevVisibleComments.map((comment) =>
          comment._id === parentCommentId
            ? {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply._id === repCommentId
                    ? {
                        ...reply,
                        replies: [...(reply.replies || []), ...replies],
                      }
                    : reply
                ),
              }
            : comment
        )
      );

      setShowLoadMoreLevel3((prev) => ({
        ...prev,
        [repCommentId]: false,
      }));
    } catch (error) {
      console.error("Lỗi khi tải bình luận cấp 3:", error);
      message.error("Không thể tải bình luận trả lời. Vui lòng thử lại sau.");
    }
  };
  const handleLikeComment = async (commentId: string | undefined) => {
    try {
      await instance.post(`/comment/like`, { commentId });

      setCurrentPage(1);
      await fetchUpdatedComments();
    } catch (error) {
      message.error("Bạn đã like bình luận này rồi!");
    }
  };

  const handleDislikeComment = async (commentId: string | undefined) => {
    try {
      await instance.post(`/comment/dislike`, { commentId });

      setCurrentPage(1);
      await fetchUpdatedComments();
    } catch (error) {
      message.error("Bạn đã dislike bình luận này rồi!");
    }
  };
  const showLikeDetails = (likes: User[], type: string) => {
    setLikeUsers(likes);
    setModalTitle(
      type === "like" ? "Người thích bình luận" : "Người không thích bình luận"
    );
    setVisibleModal(true);
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
  };

  const handleButtonClickAdd = () => {
    const isAuthenticated = checkAuthentication("/login", navigate);
    if (!isAuthenticated) {
      return;
    }
    handleAddComment();
  };

  const handleButtonClickReply = (commentId: string | undefined) => {
    const isAuthenticated = checkAuthentication("/login", navigate);
    if (!isAuthenticated) {
      return;
    }
    handleReplySubmit(commentId);
  };

  const handleButtonClickLike = (commentId: string | undefined) => {
    const isAuthenticated = checkAuthentication("/login", navigate);
    if (!isAuthenticated) {
      return;
    }
    handleLikeComment(commentId);
  };

  const handleButtonClickDislike = (commentId: string | undefined) => {
    const isAuthenticated = checkAuthentication("/login", navigate);
    if (!isAuthenticated) {
      return;
    }
    handleDislikeComment(commentId);
  };

  return (
    <div>
      {loading && <p>Đang tải bình luận...</p>}
      <Input.TextArea
        value={newCommentContent}
        onChange={(e) => setNewCommentContent(e.target.value)}
        rows={1}
        placeholder="Nhập bình luận của bạn..."
        style={{ marginBottom: "10px" }}
      />
      <Button
        type="primary"
        onClick={handleButtonClickAdd}
        style={{ marginBottom: "20px" }}
      >
        Thêm bình luận
      </Button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {visibleComments.map((comment) => (
          <li key={comment._id} style={{ marginBottom: "20px" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li key={comment._id} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <Avatar
                    src={comment.userId?.avatar}
                    icon={
                      !comment.userId?.avatar ? <UserOutlined /> : undefined
                    }
                    style={{ marginRight: "10px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{comment.userId?.name}</strong>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <p style={{ margin: "5px 0" }}>{comment.content}</p>

                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Tooltip
                          title={
                            comment.likedBy.length > 0
                              ? comment.likedBy.length === 1
                                ? `${comment.likedBy[0]?.name}`
                                : `${comment.likedBy[0]?.name} và ${comment.likedBy.length - 1} người thích` // Nếu nhiều người thích
                              : "Chưa có ai thích"
                          }
                          key="like-count-tooltip"
                        >
                          <span
                            onClick={() =>
                              showLikeDetails(comment.likedBy, "like")
                            }
                            style={{
                              marginLeft: 0,
                              color: "#e0e0e0",
                              cursor: "pointer",
                            }}
                          >
                            {comment.likedBy.length || 0}
                          </span>
                        </Tooltip>
                        <LikeOutlined
                          title="Thích"
                          style={{
                            marginLeft: "8px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleButtonClickLike(comment._id)}
                        />

                        <Tooltip
                          title={
                            comment.dislikedBy.length > 0
                              ? comment.dislikedBy.length === 1
                                ? `${comment.dislikedBy[0]?.name}`
                                : `${comment.dislikedBy[0]?.name} và ${comment.dislikedBy.length - 1} người không thích` // Nếu nhiều người không thích
                              : "Chưa có ai không thích"
                          }
                          key="dislike-count-tooltip"
                        >
                          <span
                            onClick={() =>
                              showLikeDetails(comment.dislikedBy, "dislike")
                            }
                            style={{
                              marginLeft: "8px",
                              color: "#e0e0e0",
                              cursor: "pointer",
                            }}
                          >
                            {comment.dislikedBy.length || 0}{" "}
                          </span>
                        </Tooltip>
                        <DislikeOutlined
                          title="Không thích"
                          style={{
                            marginLeft: "8px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleButtonClickDislike(comment._id)}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",

                        alignItems: "center",
                      }}
                    >
                      <p style={{ margin: "0", paddingRight: "20px" }}>
                        {formatTime(comment.createdAt)}
                      </p>
                      <Button
                        type="link"
                        onClick={() => setReplyingTo(comment._id ?? null)}
                      >
                        Phản hồi
                      </Button>
                    </div>
                    {replyingTo === comment._id && (
                      <div style={{ marginTop: "10px" }}>
                        <Input.TextArea
                          value={replyContent}
                          onChange={handleReplyChange}
                          rows={1}
                          placeholder="Nhập phản hồi của bạn..."
                        />
                        <Button
                          type="primary"
                          onClick={() => handleButtonClickReply(comment._id)}
                          style={{ marginTop: "10px" }}
                        >
                          Gửi phản hồi
                        </Button>
                      </div>
                    )}
                    {comment.replyCount !== undefined &&
                    comment.replyCount > 0 &&
                    showLoadMore[comment._id as string] !== false ? (
                      <Button
                        type="link"
                        onClick={() => loadMoreLevel2Comments(comment._id)}
                      >
                        Xem thêm {comment.replyCount} bình luận
                      </Button>
                    ) : null}
                  </div>
                </div>
                {comment.replies && comment.replies.length > 0 && (
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: "40px",
                      marginTop: "10px",
                    }}
                  >
                    {comment.replies.map((reply) => (
                      <li key={reply._id} style={{ marginBottom: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                          }}
                        >
                          <Avatar
                            src={reply.userId.avatar}
                            icon={
                              !reply.userId.avatar ? (
                                <UserOutlined />
                              ) : undefined
                            }
                            style={{ marginRight: "5px" }}
                          />
                          <div style={{ flex: 1 }}>
                            <strong>{reply.userId.name}</strong>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <p style={{ margin: "5px 0" }}>{reply.content}</p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Tooltip
                                  title={
                                    reply.likedBy.length > 0
                                      ? reply.likedBy.length === 1
                                        ? `${reply.likedBy[0]?.name}`
                                        : `${reply.likedBy[0]?.name} và ${reply.likedBy.length - 1} người thích` // Nếu nhiều người thích
                                      : "Chưa có ai thích"
                                  }
                                  key="like-count-tooltip"
                                >
                                  <span
                                    onClick={() =>
                                      showLikeDetails(reply.likedBy, "like")
                                    }
                                    style={{
                                      marginLeft: 0,
                                      color: "#e0e0e0",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {reply.likedBy.length || 0}
                                  </span>
                                </Tooltip>
                                <LikeOutlined
                                  title="Thích"
                                  style={{
                                    marginLeft: "8px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleButtonClickLike(reply._id)
                                  }
                                />

                                <Tooltip
                                  title={
                                    reply.dislikedBy.length > 0
                                      ? reply.dislikedBy.length === 1
                                        ? `${reply.dislikedBy[0]?.name}`
                                        : `${reply.dislikedBy[0]?.name} và ${reply.dislikedBy.length - 1} người không thích` // Nếu nhiều người không thích
                                      : "Chưa có ai không thích"
                                  }
                                  key="dislike-count-tooltip"
                                >
                                  <span
                                    onClick={() =>
                                      showLikeDetails(
                                        reply.dislikedBy,
                                        "dislike"
                                      )
                                    }
                                    style={{
                                      marginLeft: "8px",
                                      color: "#e0e0e0",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {reply.dislikedBy.length || 0}{" "}
                                  </span>
                                </Tooltip>
                                <DislikeOutlined
                                  title="Không thích"
                                  style={{
                                    marginLeft: "8px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleButtonClickDislike(reply._id)
                                  }
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",

                                alignItems: "center",
                              }}
                            >
                              <p style={{ margin: "0", paddingRight: "20px" }}>
                                {formatTime(comment.createdAt)}
                              </p>
                              <Button
                                type="link"
                                onClick={() => setReplyingTo(reply._id ?? null)}
                              >
                                Phản hồi
                              </Button>
                            </div>
                            {replyingTo === reply._id && (
                              <div style={{ marginTop: "10px" }}>
                                <Input.TextArea
                                  value={replyContent}
                                  onChange={handleReplyChange}
                                  rows={1}
                                  placeholder="Nhập phản hồi của bạn..."
                                />
                                <Button
                                  type="primary"
                                  onClick={() =>
                                    handleButtonClickReply(reply._id)
                                  }
                                  style={{ marginTop: "10px" }}
                                >
                                  Gửi phản hồi
                                </Button>
                              </div>
                            )}
                            {reply.replyCount !== undefined &&
                            reply.replyCount > 0 &&
                            showLoadMoreLevel3[reply._id as string] !==
                              false ? (
                              <Button
                                type="link"
                                onClick={() =>
                                  loadMoreLevel3Comments(comment._id, reply._id)
                                }
                              >
                                Xem thêm bình luận
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        {reply.replies && reply.replies.length > 0 && (
                          <ul
                            style={{
                              listStyle: "none",
                              paddingLeft: "40px",
                              marginTop: "10px",
                            }}
                          >
                            {reply.replies.map((subReply) => (
                              <li
                                key={subReply._id}
                                style={{ marginBottom: "10px" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Avatar
                                    src={reply.userId.avatar}
                                    icon={
                                      !reply.userId.avatar ? (
                                        <UserOutlined />
                                      ) : undefined
                                    }
                                    style={{ marginRight: "5px" }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <strong>{reply.userId.name}</strong>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <p style={{ margin: "5px 0" }}>
                                        {reply.content}
                                      </p>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Tooltip
                                          title={
                                            subReply.likedBy.length > 0
                                              ? subReply.likedBy.length === 1
                                                ? `${subReply.likedBy[0]?.name}`
                                                : `${subReply.likedBy[0]?.name} và ${subReply.likedBy.length - 1} người thích` // Nếu nhiều người thích
                                              : "Chưa có ai thích"
                                          }
                                          key="like-count-tooltip"
                                        >
                                          <span
                                            onClick={() =>
                                              showLikeDetails(
                                                subReply.likedBy,
                                                "like"
                                              )
                                            }
                                            style={{
                                              marginLeft: 0,
                                              color: "#e0e0e0",
                                              cursor: "pointer",
                                            }}
                                          >
                                            {subReply.likedBy.length || 0}
                                          </span>
                                        </Tooltip>
                                        <LikeOutlined
                                          title="Thích"
                                          style={{
                                            marginLeft: "8px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            handleButtonClickLike(subReply._id)
                                          }
                                        />

                                        <Tooltip
                                          title={
                                            subReply.dislikedBy.length > 0
                                              ? subReply.dislikedBy.length === 1
                                                ? `${subReply.dislikedBy[0]?.name}`
                                                : `${subReply.dislikedBy[0]?.name} và ${subReply.dislikedBy.length - 1} người không thích` // Nếu nhiều người không thích
                                              : "Chưa có ai không thích"
                                          }
                                          key="dislike-count-tooltip"
                                        >
                                          <span
                                            onClick={() =>
                                              showLikeDetails(
                                                subReply.dislikedBy,
                                                "dislike"
                                              )
                                            }
                                            style={{
                                              marginLeft: "8px",
                                              color: "#e0e0e0",
                                              cursor: "pointer",
                                            }}
                                          >
                                            {subReply.dislikedBy.length || 0}{" "}
                                          </span>
                                        </Tooltip>
                                        <DislikeOutlined
                                          title="Không thích"
                                          style={{
                                            marginLeft: "8px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            handleButtonClickDislike(
                                              subReply._id
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",

                                        alignItems: "center",
                                      }}
                                    >
                                      <p
                                        style={{
                                          margin: "0",
                                          paddingRight: "20px",
                                        }}
                                      >
                                        {formatTime(comment.createdAt)}
                                      </p>
                                      <Button
                                        type="link"
                                        onClick={() =>
                                          setReplyingTo(subReply._id ?? null)
                                        }
                                      >
                                        Phản hồi
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",

                                    alignItems: "center",
                                  }}
                                ></div>
                                {replyingTo === subReply._id && (
                                  <div style={{ marginTop: "10px" }}>
                                    <Input.TextArea
                                      value={replyContent}
                                      onChange={handleReplyChange}
                                      rows={1}
                                      placeholder="Nhập phản hồi của bạn..."
                                    />
                                    <Button
                                      type="primary"
                                      onClick={() =>
                                        handleButtonClickReply(subReply._id)
                                      }
                                      style={{ marginTop: "10px" }}
                                    >
                                      Gửi phản hồi
                                    </Button>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </li>
        ))}
      </ul>
      {currentPage < totalPages && (
        <Button onClick={loadMoreComments} disabled={loading}>
          {loading ? "Đang tải..." : "Hiện thêm bình luận"}
        </Button>
      )}
      <LikeDislikeModal
        visible={visibleModal}
        onClose={handleCloseModal}
        users={likeUsers}
        title={modalTitle}
      />
    </div>
  );
};

export default CommentSection;
