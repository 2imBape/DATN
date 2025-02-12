import React from "react";

interface VideoPlayerProps {
  videoId: string; // ID của video
  videoTitle: string; // Tiêu đề video
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, videoTitle }) => {
  return (
    <div className="video-player">
      <h1>{videoTitle}</h1>
      <video controls>
        <source src={`path/to/video/${videoId}.mp4`} type="video/mp4" />{" "}
        {/* Đường dẫn video cần được thay đổi nếu cần */}
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
  );
};

export default VideoPlayer;
