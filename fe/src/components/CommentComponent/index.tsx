import React, { useState, useRef, useEffect } from "react";
import { List, Avatar, Button, Tooltip, message, Input } from "antd";
import {
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
} from "@ant-design/icons";
import { Comment } from "@/interfaces/Comment";
import { formatTime } from "@/utils/utils";
import LikeDislikeModal from "../LikeDislikeModal/LikeDislikeModal";

const { TextArea } = Input;
const MAX_REPLY_LENGTH = 250;

const getIndentationLevel = (level: number | undefined) => {
  return (level || 1) * 20;
};

const CommentComponent: React.FC<{
  comment: Comment;
  handleReplySubmit: (id: string, replyContent: string) => void;
  handleLike: (id: string) => Promise<Comment>;
  handleDislike: (id: string) => Promise<Comment>;
  userId: string;
}> = ({ comment, handleReplySubmit, handleLike, handleDislike, userId }) => {
  const [currentComment, setCurrentComment] = useState<Comment>(comment);
  const [replyContent, setReplyContent] = useState<string>("");
  const [showReplyBox, setShowReplyBox] = useState<boolean>(false);
  const [showUserLikes, setShowUserLikes] = useState<boolean>(false);
  const [showUserDislikes, setShowUserDislikes] = useState<boolean>(false);
  const replyInputRef = useRef<any>(null);

  useEffect(() => {
    setCurrentComment(comment);
  }, [comment]);

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_REPLY_LENGTH) {
      setReplyContent(e.target.value);
    } else {
      message.warning("Bạn đã đạt giới hạn ký tự cho bình luận.");
    }
  };

  const submitReply = () => {
    if (replyContent) {
      handleReplySubmit(currentComment._id!, replyContent);
      setReplyContent("");
      setShowReplyBox(false);
    } else {
      message.warning("Vui lòng nhập nội dung bình luận!");
    }
  };

  const toggleReplyBox = () => {
    setShowReplyBox(!showReplyBox);
    if (!showReplyBox) {
      setTimeout(() => replyInputRef.current?.focus(), 0);
    }
  };

  const handleShowUserLikes = () => {
    setShowUserLikes(true);
  };

  const handleCloseUserLikes = () => {
    setShowUserLikes(false);
  };

  const handleShowUserDislikes = () => {
    setShowUserDislikes(true);
  };

  const handleCloseUserDislikes = () => {
    setShowUserDislikes(false);
  };

  return (
    <div
      style={{
        marginLeft: getIndentationLevel(currentComment.level),
        backgroundColor: "#1a1a1a",
        padding: "10px",
        borderRadius: "8px",
        color: "#e0e0e0",
      }}
    >
      <List.Item
        key={currentComment._id}
        actions={[
          <Tooltip title="Thích" key="like-tooltip">
            <span
              onClick={() => {
                handleLike(comment._id!);
              }}
              style={{ cursor: "pointer" }}
            >
              {currentComment.likedBy?.some((user) => user._id === userId) ? (
                <LikeFilled style={{ color: "#4caf50", fontSize: "20px" }} />
              ) : (
                <LikeOutlined style={{ color: "#e0e0e0", fontSize: "20px" }} />
              )}
            </span>
          </Tooltip>,
          <Tooltip
            title={
              currentComment.likedBy.length > 0
                ? `${currentComment.likedBy[0]?.name} và ${currentComment.likedBy.length} người thích`
                : "Chưa có ai thích"
            }
            key="like-count-tooltip"
          >
            <span
              style={{ marginLeft: 0, color: "#e0e0e0" }}
              onClick={handleShowUserLikes}
            >
              {currentComment.likedBy.length || 0}
            </span>
          </Tooltip>,

          <Tooltip title="Không thích" key="dislike-tooltip">
            <span
              onClick={() => {
                handleDislike(comment._id!);
              }}
              style={{ cursor: "pointer" }}
            >
              {currentComment.dislikedBy?.some(
                (user) => user._id === userId
              ) ? (
                <DislikeFilled style={{ color: "#f44336", fontSize: "20px" }} />
              ) : (
                <DislikeOutlined
                  style={{ color: "#e0e0e0", fontSize: "20px" }}
                />
              )}
            </span>
          </Tooltip>,
          <Tooltip
            title={
              currentComment.dislikedBy.length > 0
                ? `${currentComment.dislikedBy[0]?.name} và ${currentComment.dislikedBy.length} người không thích`
                : "Chưa có ai không thích"
            }
            key="dislike-count-tooltip"
          >
            <span
              style={{ marginLeft: 0, color: "#e0e0e0" }}
              onClick={handleShowUserDislikes}
            >
              {currentComment.dislikedBy.length || 0}
            </span>
          </Tooltip>,

          <Button onClick={toggleReplyBox} style={{ color: "#e0e0e0" }}>
            Phản hồi
          </Button>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Avatar src={currentComment.userId.avatar || undefined}>
              {!currentComment.userId.avatar && currentComment.userId.name
                ? currentComment.userId.name.charAt(0)
                : ""}
            </Avatar>
          }
          title={
            <span style={{ color: "#e0e0e0" }}>
              {currentComment.userId.name || "Người ẩn danh"}
            </span>
          }
          description={
            <>
              <span style={{ color: "#e0e0e0" }}>{currentComment.content}</span>{" "}
              <br />
              <span style={{ fontSize: "12px", color: "#888888" }}>
                {formatTime(currentComment.createdAt)}
              </span>
            </>
          }
        />
      </List.Item>

      {showReplyBox && (
        <div style={{ marginLeft: 20, color: "#e0e0e0" }}>
          <TextArea
            rows={4}
            ref={replyInputRef}
            value={replyContent}
            onChange={handleReplyChange}
            placeholder="Nhập bình luận của bạn..."
            style={{
              backgroundColor: "#2c2c2c",
              color: "#ffffff",
              borderColor: "#555",
            }}
          />
          <style>
            {`
            .ant-input::placeholder {
              color: #ffffff;
              opacity: 1; 
            }
          `}
          </style>
          <span style={{ color: "#888888", padding: "10px" }}>
            {MAX_REPLY_LENGTH - replyContent.length} ký tự còn lại
          </span>
          <Button
            onClick={submitReply}
            type="primary"
            style={{
              marginTop: 10,
              backgroundColor: "#007acc",
              borderColor: "#007acc",
            }}
          >
            Gửi
          </Button>
        </div>
      )}

      {currentComment.replies && currentComment.replies.length > 0 && (
        <List
          dataSource={currentComment.replies}
          renderItem={(reply) => (
            <CommentComponent
              key={reply._id}
              comment={reply}
              handleReplySubmit={handleReplySubmit}
              handleLike={handleLike}
              handleDislike={handleDislike}
              userId={userId}
            />
          )}
          style={{ marginLeft: 20 }}
        />
      )}

      {/* Hiển thị modal danh sách người thích */}
      <LikeDislikeModal
        visible={showUserLikes}
        onClose={handleCloseUserLikes}
        title="Người thích bình luận này"
        users={currentComment.likedBy}
      />

      {/* Hiển thị modal danh sách người không thích */}
      <LikeDislikeModal
        visible={showUserDislikes}
        onClose={handleCloseUserDislikes}
        title="Người không thích bình luận này"
        users={currentComment.dislikedBy}
      />
    </div>
  );
};

export default CommentComponent;
